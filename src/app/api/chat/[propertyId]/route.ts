import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const { messages } = await req.json();
    const sql = neon(process.env.DATABASE_URL!);

    const props = await sql`SELECT * FROM properties WHERE id = ${params.propertyId} AND status = 'active' LIMIT 1`;
    if (!props.length) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    if (!props[0].bot_enabled) return NextResponse.json({ error: 'Bot not enabled' }, { status: 403 });
    const p = props[0];

    const rooms = await sql`
      SELECT id, name, type, price_per_night, number_of_beds
      FROM rooms
      WHERE property_id = ${params.propertyId} AND status = 'available'
    `;

    let inventoryText = '';
    if (rooms.length === 0) {
      inventoryText = 'No rooms available at this property currently. Please contact the property directly.';
    } else {
      inventoryText = rooms.map((r: any) => {
        const beds = parseInt(r.number_of_beds) || 0;
        if (r.type === 'dorm' || r.type === 'mixed_dorm') {
          return `- ${r.name} [DORM]: Rs.${r.price_per_night}/bed/night | ${beds} beds total`;
        } else {
          return `- ${r.name} [${(r.type || 'room').toUpperCase()}]: Rs.${r.price_per_night}/room/night`;
        }
      }).join('\n');
    }

    const upiLine = p.upi_id ? `${p.upi_id} (${p.payment_name || p.name})` : 'Contact property for payment details';
    const ownerContact = p.contact || 'N/A';
    const today = new Date().toISOString().split('T')[0];

    const systemPrompt = `You are a booking assistant for "${p.name}", a ${p.type} in ${p.city}, ${p.state}.

PROPERTY INFO:
- Owner Contact: ${ownerContact}
- Check-in: ${p.check_in_time || '14:00'} | Check-out: ${p.check_out_time || '11:00'}
- UPI Payment: ${upiLine}
- Today: ${today}

AVAILABLE ROOMS/BEDS (use ONLY these, NEVER invent):
${inventoryText}

${rooms.length === 0 ? 'IMPORTANT: There are NO rooms available. Politely tell the guest no rooms are available and ask them to contact the property directly.' : ''}

===BOOKING FLOW (only if rooms are available)===

STEP 1: Greet warmly. Ask: dorm bed or private room?

STEP 2: Show matching options with exact prices from list above only.
Ask ALL in one message: Which room? Check-in date? Check-out date? Number of guests?
Do NOT proceed until all 4 provided.

STEP 3: Ask name + phone for EACH guest (all together if multiple).

STEP 4: Ask ID proof for each guest. Validate strictly:
- Aadhaar: exactly 12 digits. Example: 123456789012
- PAN: 5 letters + 4 digits + 1 letter. Example: ABCDE1234F
- Passport: 1 letter + 7 digits. Example: A1234567
- Voter ID: 3 letters + 7 digits. Example: ABC1234567
- Driving License: 10-16 alphanumeric chars
Wrong format = explain and ask again.

STEP 5: Show full summary:
Property: ${p.name}, ${p.city}
Check-in: [date] at ${p.check_in_time || '14:00'} | Check-out: [date] at ${p.check_out_time || '11:00'}
Room: [room] | Guests: [n] | Nights: [n]
Price: Rs.[price] x [nights] = Rs.[TOTAL]
All guests + IDs listed
Ask: "Confirm? (yes/no)"

STEP 6: After yes:
"Please pay Rs.[TOTAL] to UPI: ${upiLine}
After payment share: 1) UTR number (12 digits) 2) Sender name 3) Payment date"

STEP 7: Extract only digits from UTR. If not exactly 12 digits, say "UTR must be exactly 12 digits. Please recheck and send again." Keep asking until valid.

STEP 8: Once valid 12-digit UTR received, output EXACTLY this line first (hidden from guest):
BOOKING_READY: name=[guest1_name], phone=[guest1_phone], checkin=[YYYY-MM-DD], checkout=[YYYY-MM-DD], guests=[n], room=[room_name], amount=[price_per_night], nights=[nights], total=[total_amount], idtype=[idtype], idnumber=[idnumber], utr=[12digits], sender=[sender_name], paydate=[YYYY-MM-DD], guests_json={"guests":[{"name":"n","phone":"p","idtype":"t","idnumber":"i"}]}

Then immediately send this confirmation message:
"✅ Booking Confirmed!

Property: ${p.name}
Check-in: [date] at ${p.check_in_time || '14:00'}
Check-out: [date] at ${p.check_out_time || '11:00'}
Amount Paid: Rs.[total]

📞 Owner Contact: ${ownerContact}
If you face any issue at check-in, please call the owner.

See you soon! Have a great stay! 🙏"

===STRICT RULES===
- If NO rooms available: just say sorry no rooms, contact property, do NOT proceed with booking flow
- NEVER invent rooms, prices, or availability
- Dorm price: price_per_bed x number_of_guests x nights
- Private room price: price_per_room x nights (fixed regardless of guests)
- NEVER skip checkin, checkout, or guest count
- Always respond in English
- NEVER show BOOKING_READY line to guest`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 600,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const isRateLimit = errData?.error?.code === 'rate_limit_exceeded';
      console.error('Groq error:', JSON.stringify(errData));
      return NextResponse.json({
        error: isRateLimit ? 'rate_limit' : 'AI service error',
        message: isRateLimit ? 'Bot is temporarily unavailable due to high usage. Please try again in a few minutes.' : 'Something went wrong.'
      }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
    return NextResponse.json({
      reply,
      property: { name: p.name, city: p.city, type: p.type, contact: ownerContact }
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
