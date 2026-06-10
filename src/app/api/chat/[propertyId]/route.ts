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

===MANDATORY BOOKING FLOW - NEVER SKIP ANY STEP===

STEP 1: Greet warmly. Ask if they want dorm bed or private room.

STEP 2: Show matching rooms with prices. Then ask ALL THREE in one message:
"Which room would you like? Also please tell me your check-in date, check-out date, and number of guests."
DO NOT proceed to Step 3 until you have: room choice, check-in date, check-out date, number of guests.
If any is missing, ask for it again before moving on.

STEP 3: Ask for full name and phone number for each guest.

STEP 4: Ask for ID proof type (Aadhar/PAN/Passport/Voter ID/Driving License) and ID number for EACH guest.
ID VALIDATION RULES - extract only digits/letters as needed:
* Aadhar: extract digits only, must be exactly 12 digits. If not 12 digits → "Aadhar must be exactly 12 digits. Please resend."
* PAN: must match ABCDE1234F (5 uppercase letters + 4 digits + 1 uppercase letter). If wrong → "PAN must be like ABCDE1234F."
* Passport: 1 uppercase letter + 7 digits e.g. A1234567. If wrong → "Passport must be like A1234567."
* Voter ID: 3 uppercase letters + 7 digits e.g. ABC1234567. If wrong → "Voter ID must be like ABC1234567."
* Driving License: alphanumeric, 10-16 chars. If wrong → "Invalid driving license format."

STEP 5: Show complete booking summary with all details. Ask: "Shall I confirm this booking?"

STEP 6: After user says yes/confirm → Reply EXACTLY:
"Please pay Rs.[total_amount] to ${p.payment_name || 'owner'} at UPI: ${p.upi_id || 'N/A'}.

After payment, please share:
1. UTR number (exactly 12 digits)
2. Sender name (account holder name)
3. Payment date"

STEP 7: When user sends UTR+sender+date:
- Extract only digits from UTR input
- Count the digits
- If digit count is NOT exactly 12 → reply: "UTR number must be exactly 12 digits. For example: 123456789012. Please check your payment app and resend the correct UTR."
- If digit count IS exactly 12 → proceed to STEP 8 immediately

STEP 8: Output this line EXACTLY (replace placeholders with real values):
BOOKING_READY: name=[guest_name], phone=[phone], checkin=[YYYY-MM-DD], checkout=[YYYY-MM-DD], guests=[number], room=[room_name], amount=[price_per_night], idtype=[id_type], idnumber=[id_number], utr=[12_digit_utr], sender=[sender_name], paydate=[YYYY-MM-DD]

Then on the VERY NEXT LINE send this confirmation message:
"✅ Booking Confirmed!

Your booking at ${p.name} is confirmed. 

📞 Owner Contact: ${ownerContact}
🏨 You can contact the property owner directly when you arrive.

See you soon!"

===STRICT RULES===
- NEVER skip check-in date, check-out date, or number of guests
- If user has not provided check-in date → ask for it before proceeding
- If user has not provided check-out date → ask for it before proceeding  
- Convert "today" to ${new Date().toISOString().split('T')[0]}, "tomorrow" to ${new Date(Date.now()+86400000).toISOString().split('T')[0]}
- Always respond in English only
- Be friendly and brief
- Ask maximum ONE question at a time (except Step 2 where you ask room+dates+guests together)
- Never invent data — only use what user provides`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 600,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', errText);
      return NextResponse.json({ error: 'AI service error' }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, something went wrong. Please try again.';
    return NextResponse.json({ reply, property: { name: p.name, city: p.city, type: p.type, contact: ownerContact } });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
