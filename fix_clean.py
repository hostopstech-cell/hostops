f = open('src/app/dashboard/bookings/page.tsx', 'r')
c = f.read()
f.close()

# Add state
c = c.replace(
    'const [deleteId, setDeleteId] = useState<number | null>(null);',
    'const [deleteId, setDeleteId] = useState<number | null>(null);\n  const [infoBooking, setInfoBooking] = useState<any>(null);',
    1
)

# Insert modal before the last </div>\n);\n}
modal = """
    {infoBooking && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          <h2 className="text-lg font-bold mb-1">Payment Info</h2>
          <p className="text-sm text-slate-500 mb-4">{infoBooking.guest_name} - {infoBooking.booking_code}</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold">Rs.{infoBooking.final_amount}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Status</span>
              <span className={infoBooking.payment_status === "paid" ? "text-green-600 font-semibold" : "text-orange-500 font-semibold"}>{infoBooking.payment_status || "pending"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Sender</span>
              <span className="font-medium">{infoBooking.payment_sender_name || "-"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">UTR</span>
              <span className="font-mono">{infoBooking.utr_number || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span>{infoBooking.payment_date ? new Date(infoBooking.payment_date).toLocaleDateString("en-IN") : "-"}</span>
            </div>
          </div>
          <button onClick={() => setInfoBooking(null)} className="w-full mt-4 bg-slate-800 text-white py-2 rounded-lg text-sm">Close</button>
        </div>
      </div>
    )}"""

# Insert before last </div>\n);\n}
c = c[:c.rfind('\n  </div>\n);')] + modal + c[c.rfind('\n  </div>\n);'):]

f = open('src/app/dashboard/bookings/page.tsx', 'w')
f.write(c)
f.close()
print("Done! Lines:", len(c.split('\n')))
