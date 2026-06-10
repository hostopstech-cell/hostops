import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const { messages } = await req.json();
    const propertyId = params.propertyId;
    const sql = neon(process.env.DATABASE_URL!);

    const properties = await sql`
      SELECT p.*, json_agg(DISTINCT jsonb_build_object('name', r.name, 'type', r.type, 'price', r.price_per_night, 'capacity', r.number_of_beds)) as rooms
      FROM properties p
      LEFT JOIN rooms r ON r.property_id = p.id AND r.status = 'available'
      WHERE p.id = ${propertyId} AND p.status = 'active'
      GROUP BY p.id
    `;

    if (!properties.length) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    if (!properties[0].bot_enabled) return NextResponse.json({ error: 'Bot not enabled' }, { status: 403 });

    const property = properties[0];
    const rooms = property.rooms?.filter((r: any) => r.name) || [];
    const hasUpi = !!(property.upi_id);

    const systemPrompt = `You are a friendly booking assistant for "${property.name}", a ${property.type} in ${property.city}, ${property.state}.

Property Details:
- Address: ${property.address}
- Check-in: ${property.check_in_time}, Check-out: ${property.check_out_time}
- Contact: ${property.contact || 'Not available'}
- Description: ${property.description || 'A great place to stay'}
- Amenities: ${property.amenities?.join(', ') || 'Ask staff'}

Available Rooms:
${rooms.map((r: any) => `- ${r.name} (${r.type}): Rs${r.price}/night, capacity: ${r.number_of_beds}`).join('\n') || 'Contact property for details'}

STRICT BOOKING FLOW - Follow this order exactly:

STEP 1 - Greet and collect booking info:
  Collect: full name, phone number, check-in date, check-out date, number of guests, room preference
  Ask for ID proof type (Aadhar/PAN/Passport) and ID number

STEP 2 - Once you have all booking details + ID proof, show summary and ask for confirmation.

STEP 3 - After confirmation, share payment details:
${hasUpi ? `  Say: "Please pay Rs.[amount] to ${property.payment_name || 'Owner'} at UPI ID: ${property.upi_id}
  After payment, please share your payment reference (UTR number), sender name, and payment date to confirm your booking."` : '  Say: Please contact the property for payment details.'}

STEP 4 - Collect payment confirmation:
  Ask for: UTR/reference number, sender name, payment date

STEP 5 - Once you have UTR, sender name, and payment date, output EXACTLY this line (nothing else on that line):
BOOKING_READY: name=[full name], phone=[phone], checkin=[YYYY-MM-DD], checkout=[YYYY-MM-DD], guests=[number of guests], room=[room name], amount=[price_per_night only, NOT multiplied by guests], idtype=[aadhar/pan/passport], idnumber=[id number], utr=[utr], sender=[sender name], paydate=[YYYY-MM-DD]

Rules:
- Reply in same language as guest (Hindi or English)
- Be concise and friendly
- Do NOT share UPI details before collecting booking + ID proof
- Payment status will be "pending" until owner verifies`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, could not process your request.';
    return NextResponse.json({ reply, property: { name: property.name, city: property.city, type: property.type } });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
