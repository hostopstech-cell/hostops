import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const { messages } = await req.json();
    const sql = neon(process.env.DATABASE_URL!);
    const properties = await sql`
      SELECT p.*, json_agg(DISTINCT jsonb_build_object('name', r.name, 'type', r.type, 'price', r.price_per_night)) as rooms
      FROM properties p
      LEFT JOIN rooms r ON r.property_id = p.id AND r.status = 'available'
      WHERE p.id = ${params.propertyId} AND p.status = 'active'
      GROUP BY p.id
    `;
    if (!properties.length) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    if (!properties[0].bot_enabled) return NextResponse.json({ error: 'Bot not enabled' }, { status: 403 });

    const p = properties[0];
    const rooms = (p.rooms || []).filter((r: any) => r.name);
    const roomList = rooms.map((r: any) => `- ${r.name}: Rs${r.price}/night`).join('\n') || 'Ask staff for details';
    const upiLine = p.upi_id ? `UPI: ${p.upi_id} (${p.payment_name || 'Owner'})` : 'Contact property for payment';

    const systemPrompt = `You are a booking assistant for "${p.name}", a ${p.type} in ${p.city}.

Rooms available:
${roomList}

Check-in: ${p.check_in_time || '14:00'}, Check-out: ${p.check_out_time || '11:00'}
Contact: ${p.contact || 'N/A'}
${upiLine}

FOLLOW THIS EXACT FLOW - do not skip steps:

STEP 1: Greet in English. Ask: "Are you looking for a dorm bed or private room?"
STEP 2: Based on answer, show matching rooms with prices. Ask for: check-in date, check-out date, number of guests.
STEP 3: Ask for: full name, phone number.
STEP 4: Ask for ID proof type (Aadhar/PAN/Passport/Voter ID/Driving License) and ID number.
STEP 5: Show booking summary. Ask "Shall I confirm this booking?"
STEP 6: After "yes", share payment: "Please pay Rs.[amount] to ${p.payment_name || 'owner'} at UPI: ${p.upi_id || 'N/A'}. After payment share: UTR number (12 digits), sender name (account holder name), and payment date."
STEP 7: After getting UTR+sender+date — validate UTR must be exactly 12 digits. If not 12 digits, say "UTR number should be exactly 12 digits. Please check and resend." and ask again.
STEP 8: Once valid UTR received — output EXACTLY this (on its own line):
BOOKING_READY: name=[name], phone=[phone], checkin=[YYYY-MM-DD], checkout=[YYYY-MM-DD], guests=[n], room=[room], amount=[price_per_night], idtype=[type], idnumber=[number], utr=[utr], sender=[sender], paydate=[YYYY-MM-DD]
Then IMMEDIATELY after BOOKING_READY line, send this confirmation message:
"✅ Booking Confirmed! Your booking is confirmed. You can contact the owner when you arrive at the property. Owner contact: ${p.contact || 'N/A'}. See you soon!"

RULES:
- Always respond in English
- Be short and friendly
- Ask ONE thing at a time
- Today's date is ${new Date().toISOString().split('T')[0]}
- For "today/tomorrow", convert to actual dates
- ID VALIDATION (reject if invalid, ask again):
  * Aadhar: exactly 12 digits only. Error: "Aadhar must be exactly 12 digits."
  * PAN: format ABCDE1234F (5 letters + 4 digits + 1 letter). Error: "PAN must be like ABCDE1234F."
  * Passport: 1 capital letter + 7 digits e.g. A1234567. Error: "Passport format must be like A1234567."
  * Voter ID: 3 capital letters + 7 digits e.g. ABC1234567. Error: "Voter ID must be like ABC1234567."
  * Driving License: 2 letters + 2 digits + 4 digits + 7 digits e.g. MH0120231234567. Error: "Invalid driving license format."
- If guests > 1, collect ID proof for EACH guest separately before showing summary
- After sending BOOKING_READY line, ALWAYS send confirmation: "✅ Booking Confirmed! Your booking is all set. Please contact the owner on arrival. Owner contact: ${p.contact || 'N/A'}. See you soon! 🏨"`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
    return NextResponse.json({ reply, property: { name: p.name, city: p.city, type: p.type } });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
