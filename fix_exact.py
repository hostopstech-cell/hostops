f = open('src/app/dashboard/bookings/page.tsx', 'r')
lines = f.readlines()
f.close()

# Add state on line after deleteId
for i, line in enumerate(lines):
    if 'const [deleteId, setDeleteId] = useState<number | null>(null);' in line:
        lines.insert(i+1, '  const [infoBooking, setInfoBooking] = useState<any>(null);\n')
        break

# File originally 745 lines, now 746 after state insert
# Original last 6 lines were (0-indexed 739-744):
# "          </div>\n"
# "        </div>\n"  
# "      )}\n"
# "    </div>\n"   <-- insert BEFORE this (now index ~742)
# "  );\n"
# "}\n"

# Find the LAST occurrence of "    </div>\n"
insert_pos = None
for i in range(len(lines)-1, -1, -1):
    if lines[i] == '    </div>\n':
        insert_pos = i
        break

print("Inserting at line:", insert_pos+1)

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

lines[insert_pos:insert_pos] = modal

f = open('src/app/dashboard/bookings/page.tsx', 'w')
f.writelines(lines)
f.close()
print("Done! Total lines:", len(lines))
