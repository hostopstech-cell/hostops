import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(
  req: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { messages } = await req.json();
    const propertyId = params.propertyId;
    const sql = neon(process.env.DATABASE_URL!);

    const properties = await sql`
      SELECT p.*,
        json_agg(DISTINCT jsonb_build_object('name', r.name, 'type', r.type, 'price', r.price_per_night, 'capacity', r.number_of_beds)) as rooms
      FROM properties p
      LEFT JOIN rooms r ON r.property_id = p.id AND r.status = 'available'
      WHERE p.id = ${propertyId} AND p.status = 'active'
      GROUP BY p.id
    `;

    if (!properties.length) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    if (!properties[0].bot_enabled) {
      return NextResponse.json({ error: 'Bot not enabled for this property' }, { status: 403 });
    }

    const property = properties[0];
    const upiInfo = property.upi_id ? `Payment: UPI ID: ${property.upi_id} (${property.payment_name || 'Owner'})` : 'Payment: Contact property for payment details';
    const rooms = property.rooms?.filter((r: any) => r.name) || [];

    const systemPrompt = `You are a friendly booking assistant for "${property.name}", a ${property.type} in ${property.city}, ${property.state}.

Property Details:
- Address: ${property.address}
- Check-in: ${property.check_in_time}, Check-out: ${property.check_out_time}
- Contact: ${property.contact || 'Not available'}
- Description: ${property.description || 'A great place to stay'}
- Amenities: ${property.amenities?.join(', ') || 'Ask staff'}
- Policies: ${property.policies || 'Standard policies apply'}
- ${upiInfo}

Available Rooms:
${rooms.map((r: any) => `- ${r.name} (${r.type}): Rs${r.price}/night, capacity: ${r.number_of_beds}`).join('\n') || 'Contact property for details'}

Your job:
1. Answer questions about the property warmly
2. Collect for booking: full name, phone, check-in date, check-out date, number of guests, room preference
3. When you have all details say: BOOKING_READY: name=[name], phone=[phone], checkin=[YYYY-MM-DD], checkout=[YYYY-MM-DD], guests=[n], room=[room], amount=[total], utr=[utr_number], sender=[sender_name], paydate=[YYYY-MM-DD]
4. Reply in same language as guest (Hindi or English)
6. Be concise
7. Collect for payment confirmation: UTR number, payment sender name, payment date`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, could not process your request.';

    return NextResponse.json({
      reply,
      property: { name: property.name, city: property.city, type: property.type, contact: property.contact },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
