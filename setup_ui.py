import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Created: {path}")

# Update chat API to include UPI details and collect UTR
f = open('src/app/api/chat/[propertyId]/route.ts', 'r')
c = f.read()
f.close()

old = "    const property = properties[0];"
new = """    const property = properties[0];
    const upiInfo = property.upi_id ? `Payment: UPI ID: ${property.upi_id} (${property.payment_name || 'Owner'})` : 'Payment: Contact property for payment details';"""

c = c.replace(old, new)

old = "- Policies: ${property.policies || 'Standard policies apply'}"
new = """- Policies: ${property.policies || 'Standard policies apply'}
- ${upiInfo}"""
c = c.replace(old, new)

old = "3. Once you have all booking details, say exactly: BOOKING_READY:"
new = """3. Once you have all booking details confirmed, share the UPI ID for payment and ask guest to pay and share UTR number
4. Once guest shares UTR number, say exactly: BOOKING_READY:"""
c = c.replace(old, new)

old = "4. Always respond"
new = "5. Always respond"
c = c.replace(old, new)

old = "5. Be concise"
new = """6. Be concise
7. Collect for payment confirmation: UTR number, payment sender name, payment date"""
c = c.replace(old, new)

old = "guests=[n], room=[room], amount=[total]"
new = "guests=[n], room=[room], amount=[total], utr=[utr_number], sender=[sender_name], paydate=[YYYY-MM-DD]"
c = c.replace(old, new)

f = open('src/app/api/chat/[propertyId]/route.ts', 'w')
f.write(c)
f.close()
print("Chat API updated!")

# Update booking API to save UTR
f = open('src/app/api/chat/booking/route.ts', 'r')
c = f.read()
f.close()

old = "const { propertyId, name, phone, checkin, checkout, guests, room, amount } = await req.json();"
new = "const { propertyId, name, phone, checkin, checkout, guests, room, amount, utr, sender, paydate } = await req.json();"
c = c.replace(old, new)

old = "VALUES (\${code}, \${propertyId}, \${roomId}, \${name}, \${phone}, \${checkin}, \${checkout}, \${guests}, \${amount}, \${amount}, 'direct', 'pending', 'pending')"
new = "VALUES (\${code}, \${propertyId}, \${roomId}, \${name}, \${phone}, \${checkin}, \${checkout}, \${guests}, \${amount}, \${amount}, 'direct', 'confirmed', 'paid')"
c = c.replace(old, new)

# Add UTR update after insert
old = "    return NextResponse.json({ success: true, booking_code: code });"
new = """    if (utr) {
      const bookings2 = await sql`SELECT id FROM bookings WHERE booking_code=\${code}`;
      if (bookings2[0]) {
        await sql`UPDATE bookings SET utr_number=\${utr}, payment_sender_name=\${sender}, payment_date=\${paydate || new Date().toISOString().split('T')[0]} WHERE id=\${bookings2[0].id}`;
      }
    }
    return NextResponse.json({ success: true, booking_code: code });"""
c = c.replace(old, new)

f = open('src/app/api/chat/booking/route.ts', 'w')
f.write(c)
f.close()
print("Booking API updated!")

print("All done!")

