f = open('src/app/dashboard/bookings/page.tsx', 'r')
lines = f.readlines()
f.close()

# File has 745 lines, last lines are:
# 742:           </div>
# 743:         </div>
# 744:       )}
# 745:     </div>
# 746:   );
# 747: }
# We insert modal at line 745 (before "    </div>")

modal_lines = [
    '\n',
    '    {infoBooking && (\n',
    '      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">\n',
    '        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">\n',
    '          <h2 className="text-lg font-bold mb-1">Payment Info</h2>\n',
    '          <p className="text-sm text-slate-500 mb-4">{infoBooking.guest_name} - {infoBooking.booking_code}</p>\n',
    '          <div className="space-y-3 text-sm">\n',
    '            <div className="flex justify-between border-b pb-2">\n',
    '              <span className="text-slate-500">Amount</span>\n',
    '              <span className="font-semibold">Rs.{infoBooking.final_amount}</span>\n',
    '            </div>\n',
    '            <div className="flex justify-between border-b pb-2">\n',
    '              <span className="text-slate-500">Status</span>\n',
    '              <span className={infoBooking.payment_status === "paid" ? "text-green-600 font-semibold" : "text-orange-500 font-semibold"}>{infoBooking.payment_status || "pending"}</span>\n',
    '            </div>\n',
    '            <div className="flex justify-between border-b pb-2">\n',
    '              <span className="text-slate-500">Sender</span>\n',
    '              <span>{infoBooking.payment_sender_name || "-"}</span>\n',
    '            </div>\n',
    '            <div className="flex justify-between border-b pb-2">\n',
    '              <span className="text-slate-500">UTR</span>\n',
    '              <span className="font-mono">{infoBooking.utr_number || "-"}</span>\n',
    '            </div>\n',
    '            <div className="flex justify-between">\n',
    '              <span className="text-slate-500">Date</span>\n',
    '              <span>{infoBooking.payment_date ? new Date(infoBooking.payment_date).toLocaleDateString("en-IN") : "-"}</span>\n',
    '            </div>\n',
    '          </div>\n',
    '          <button onClick={() => setInfoBooking(null)} className="w-full mt-4 bg-slate-800 text-white py-2 rounded-lg text-sm">Close</button>\n',
    '        </div>\n',
    '      </div>\n',
    '    )}\n',
]

# Add state - find the deleteId line
for i, line in enumerate(lines):
    if 'const [deleteId, setDeleteId] = useState<number | null>(null);' in line:
        lines.insert(i+1, '  const [infoBooking, setInfoBooking] = useState<any>(null);\n')
        break

# Insert modal before last </div> which is line 745 (index 744) - now shifted by 1
for i in range(len(lines)-1, -1, -1):
    if lines[i].strip() == '</div>':
        lines[i:i] = modal_lines
        break

f = open('src/app/dashboard/bookings/page.tsx', 'w')
f.writelines(lines)
f.close()
print("Done! Total lines:", len(lines))
