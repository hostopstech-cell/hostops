f = open('src/app/dashboard/bookings/page.tsx', 'r')
c = f.read()
f.close()

# 1. Add state
c = c.replace(
    'const [deleteId, setDeleteId] = useState<number | null>(null);',
    'const [deleteId, setDeleteId] = useState<number | null>(null);\n  const [infoBooking, setInfoBooking] = useState<any>(null);'
)

# 2. The return ends with:  </div>\n  );\n}
# We need to wrap everything in a fragment and add modal inside
# Replace:  return (  with:  return (<>
c = c.replace('  return (\n    <div', '  return (\n    <>\n    <div', 1)

# Replace the final   </div>\n  );\n}  with   </div> + modal + </>\n  );\n}
modal = '''
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
              <span className="text-slate-500">Payment Status</span>
              <span className={infoBooking.payment_status === "paid" ? "text-green-600 font-semibold" : "text-orange-500 font-semibold"}>{infoBooking.payment_status || "pending"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Sender Name</span>
              <span className="font-medium">{infoBooking.payment_sender_name || "-"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">UTR Number</span>
              <span className="font-medium font-mono">{infoBooking.utr_number || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Date</span>
              <span className="font-medium">{infoBooking.payment_date ? new Date(infoBooking.payment_date).toLocaleDateString("en-IN") : "-"}</span>
            </div>
          </div>
          <button onClick={() => setInfoBooking(null)} className="w-full mt-5 bg-slate-800 text-white py-2 rounded-lg text-sm font-medium">Close</button>
        </div>
      </div>
    )}
    </>'''

c = c.replace('    </div>\n  );\n}', '    </div>\n' + modal + '\n  );\n}')

f = open('src/app/dashboard/bookings/page.tsx', 'w')
f.write(c)
f.close()
print("Done!")
