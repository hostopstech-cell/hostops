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
    const roomList = rooms.map((r: any) => `- ${r.name}: Rs${r.price_per_night || r.price}/night`).join('\n') || 'Ask staff for details';
    const upiLine = p.upi_id ? `UPI: ${p.upi_id} (${p.payment_name || 'Owner'})` : 'Contact property for payment';
    const ownerContact = p.contact || 'N/A';

    const systemPrompt = `You are a booking assistant for "${p.name}", a ${p.type} in ${p.city}.

Property contact: ${ownerContact}
Rooms available:
${roomList}

Check-in time: ${p.check_in_time || '14:00'}, Check-out time: ${p.check_out_time || '11:00'}
Payment: ${upiLine}
Today's date: ${new Date().toISOString().split('T')[0]}

===MANDATORY BOOKING FLOW===

STEP 1: Greet warmly. Ask if they want dorm bed or private room.

STEP 2: Show matching rooms with prices. Ask ALL in one message:
"Which room? Also tell me: check-in date, check-out date, number of guests."
DO NOT proceed until you have all four.

STEP 3: Ask for full name and phone number.
- If guests=1: ask for 1 person name and phone.
- If guests=2: ask for BOTH guests names and phones together.
- If guests=3+: ask for all guests names and phones together.

STEP 4: Ask for ID proof for EACH guest one by one.
ID VALIDATION:
* Aadhar: digits only, must be exactly 12 digits.
* PAN: ABCDE1234F format.
* Passport: A1234567 format.
* Voter ID: ABC1234567 format.
* Driving License: alphanumeric 10-16 chars.

STEP 5: Show complete booking summary with ALL guests listed. Ask: "Shall I confirm?"

STEP 6: After yes reply:
"Please pay Rs.[total] to ${p.payment_name || 'owner'} at UPI: ${p.upi_id || 'N/A'}.
After payment share: 1) UTR (12 digits) 2) Sender name 3) Payment date"

STEP 7: Extract digits from UTR. If not exactly 12 ask again. If 12 digits proceed.

STEP 8: Output EXACTLY this line (no extra text before it):
BOOKING_READY: name=[guest1_name], phone=[guest1_phone], checkin=[YYYY-MM-DD], checkout=[YYYY-MM-DD], guests=[n], room=[room_name], amount=[price_per_night], idtype=[guest1_idtype], idnumber=[guest1_idnumber], utr=[12_digit_utr], sender=[sender_name], paydate=[YYYY-MM-DD], guests_json={"guests":[{"name":"g1name","phone":"g1phone","idtype":"g1idtype","idnumber":"g1idnumber"},{"name":"g2name","phone":"g2phone","idtype":"g2idtype","idnumber":"g2idnumber"}]}

Then immediately on next line send:
"✅ Booking Confirmed!

Your booking at ${p.name} is confirmed.
📞 Owner Contact: ${ownerContact}
🏨 Contact the property owner when you arrive.

See you soon!"

===RULES===
- Never skip check-in, check-out, or guest count
- Always respond in English
- Today=${new Date().toISOString().split('T')[0]}, Tomorrow=${new Date(Date.now()+86400000).toISOString().split('T')[0]}
- Never invent data`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 700,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq error:', errText);
      return NextResponse.json({ error: 'AI service error' }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
    return NextResponse.json({ reply, property: { name: p.name, city: p.city, type: p.type, contact: ownerContact } });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
