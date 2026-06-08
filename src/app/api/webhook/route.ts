import { NextRequest, NextResponse } from 'next/server';

const VERIFY_TOKEN = 'hostops123';
const WHATSAPP_TOKEN = 'EAAbsTBzXd8cBRuADnijIFY6gG6a78Yz8ZCZCY0ySlTx0GdvxvpGjAZAwcuJZA2UjjMJubLsbalBE00Nvo1hCW2jqkjZARLIgbIrJMWMuGDWL3TlqkZABvBVLSf68ZA7Sko6geH2TtSbN2bD9b56SVrqIYoNkPcDBxxBdNYFKZAEt3mrzZCpsXPOKtXMS3ZCs87wqePrxshIuDWlLrF9WysiGAYqYUyIw8KYPojZBnZAIwpainAvcZAAHgTUsDgaIRSIWPoH9Mg3Lu0IFWZA7ZCBvpenwjLPcgZDZD';
const PHONE_NUMBER_ID = '1070466566159876';
const OWNER_NUMBER = '919079194594'; // tumhara number

async function sendWhatsAppMessage(to: string, message: string) {
  await fetch(`https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: message },
    }),
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];

  if (!message) return NextResponse.json({ status: 'ok' });

  const from = message.from;
  const text = message.text?.body?.trim().toLowerCase();

  // Owner bot
  if (from === OWNER_NUMBER) {
    if (text === 'hi' || text === 'menu') {
      await sendWhatsAppMessage(from,
        `🏨 *HostOps Owner Menu*\n\n1️⃣ Occupancy today\n2️⃣ Today's revenue\n3️⃣ Check-ins / Check-outs\n4️⃣ Add walk-in booking\n\nReply with number (1-4)`
      );
    } else if (text === '1') {
      await sendWhatsAppMessage(from, '🏠 *Occupancy Today*\n\nTotal Rooms: 10\nOccupied: 7\nVacant: 3\nOccupancy: 70%');
    } else if (text === '2') {
      await sendWhatsAppMessage(from, '💰 *Today\'s Revenue*\n\n₹12,500 collected\n3 bookings today');
    } else if (text === '3') {
      await sendWhatsAppMessage(from, '📋 *Check-ins/Check-outs*\n\nCheck-ins: 3\nCheck-outs: 2');
    } else {
      await sendWhatsAppMessage(from, 'Reply *menu* to see options');
    }
  } else {
    // Guest bot
    if (text === 'hi' || text === 'hello') {
      await sendWhatsAppMessage(from,
        `🏨 *Welcome to HostOps!*\n\n1️⃣ Check availability\n2️⃣ Book a room\n3️⃣ My booking\n4️⃣ Contact property\n\nReply with number (1-4)`
      );
    } else if (text === '1') {
      await sendWhatsAppMessage(from, '✅ *Available Rooms*\n\nDeluxe Room - ₹1500/night\nStandard Room - ₹999/night\nDorm Bed - ₹499/night\n\nReply *2* to book');
    } else if (text === '2') {
      await sendWhatsAppMessage(from, '📝 *Book a Room*\n\nPlease visit our website to complete booking:\nhttps://hostops-six.vercel.app');
    } else if (text === '3') {
      await sendWhatsAppMessage(from, '🔍 *My Booking*\n\nPlease share your booking ID to check status.');
    } else if (text === '4') {
      await sendWhatsAppMessage(from, '📞 *Contact Property*\n\nPhone: +91 90791 94594\nEmail: hostops.tech@gmail.com');
    } else {
      await sendWhatsAppMessage(from,
        `🏨 *Welcome to HostOps!*\n\n1️⃣ Check availability\n2️⃣ Book a room\n3️⃣ My booking\n4️⃣ Contact property\n\nReply with number (1-4)`
      );
    }
  }

  return NextResponse.json({ status: 'ok' });
}
