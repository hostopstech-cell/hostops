f = open('src/app/dashboard/bookings/page.tsx', 'r')
lines = f.readlines()
f.close()

# 1. Add state after last useState in declarations
last_state = 0
for i, line in enumerate(lines):
    if 'useState' in line and i < 250:
        last_state = i
lines.insert(last_state + 1, '  const [infoBooking, setInfoBooking] = useState<any>(null);\n')

# 2. Add info button before onDelete line
for i, line in enumerate(lines):
    if 'onDelete={() => handleDelete(booking.id)}' in line:
        lines.insert(i, '                <button onClick={() => setInfoBooking(booking)} className="p-1 text-blue-500 hover:text-blue-700 rounded mr-1" title="Info">ℹ️</button>\n')
        break

# 3. Add modal before last </div>\n  );\n}
last_div = None
for i in range(len(lines)-1, -1, -1):
    if lines[i].strip() == '</div>':
        last_div = i
        break

modal = [
    '    {infoBooking && (\n',
    '      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">\n',
    '        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">\n',
    '          <h2 className="text-lg font-bold mb-1">Payment Info</h2>\n',
    '          <p className="text-sm text-slate-500 mb-3">{infoBooking.guest_name} — {infoBooking.booking_code}</p>\n',
    '          <div className="space-y-2 text-sm">\n',
    '            <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Amount</span><span className="font-semibold">Rs.{infoBooking.final_amount}</span></div>\n',
    '            <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Status</span><span className={infoBooking.payment_status === "paid" ? "text-green-600 font-semibold" : "text-orange-500"}>{infoBooking.payment_status || "pending"}</span></div>\n',
    '            <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Sender</span><span>{infoBooking.payment_sender_name || "-"}</span></div>\n',
    '            <div className="flex justify-between py-1 border-b"><span className="text-slate-500">UTR</span><span className="font-mono text-xs">{infoBooking.utr_number || "-"}</span></div>\n',
    '            <div className="flex justify-between py-1"><span className="text-slate-500">Pay Date</span><span>{infoBooking.payment_date ? new Date(infoBooking.payment_date).toLocaleDateString("en-IN") : "-"}</span></div>\n',
    '          </div>\n',
    '          <button onClick={() => setInfoBooking(null)} className="w-full mt-4 bg-slate-800 text-white py-2 rounded-lg text-sm">Close</button>\n',
    '        </div>\n',
    '      </div>\n',
    '    )}\n',
]
lines[last_div:last_div] = modal

f = open('src/app/dashboard/bookings/page.tsx', 'w')
f.writelines(lines)
f.close()
print("Done! Lines:", len(lines))
