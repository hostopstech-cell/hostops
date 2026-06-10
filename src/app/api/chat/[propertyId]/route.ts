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
STEP 6: After "yes", share payment: "Please pay Rs.[amount] to ${p.payment_name || 'owner'} at UPI: ${p.upi_id || 'N/A'}. After payment share UTR number, sender name, and payment date."
STEP 7: After getting UTR, sender name, payment date — output EXACTLY this (on its own line):
BOOKING_READY: name=[name], phone=[phone], checkin=[YYYY-MM-DD], checkout=[YYYY-MM-DD], guests=[n], room=[room], amount=[price_per_night], idtype=[type], idnumber=[number], utr=[utr], sender=[sender], paydate=[YYYY-MM-DD]

RULES:
- Always respond in English
- Be short and friendly
- Ask ONE thing at a time
- Today's date is ${new Date().toISOString().split('T')[0]}
- For "today/tomorrow", convert to actual dates`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 300,
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
