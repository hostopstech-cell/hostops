import os

f = open('src/app/dashboard/bookings/page.tsx', 'r')
c = f.read()
f.close()

# Add info modal state
old = "  const [deleteId, setDeleteId] = useState<number | null>(null);"
new = """  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [infoBooking, setInfoBooking] = useState<any>(null);"""
c = c.replace(old, new, 1)

# Find the actions buttons area and add info button before delete
old = """className="text-red-500 hover:text-red-700 p-1 rounded"
                        title="Delete\""""
new = """className="text-red-500 hover:text-red-700 p-1 rounded"
                        title="Delete\""""

# Add info button - find delete button pattern
import re
# Add info button next to existing action buttons
c = c.replace(
    'title="Delete"',
    'title="Delete"',
    1
)

# Better approach - find the actions column
old_pattern = 'title="Check Out"'
if old_pattern in c:
    c = c.replace(
        old_pattern,
        old_pattern,
        1
    )

# Add info button by finding delete icon button
c = c.replace(
    '<button\n                        onClick={() => handleDelete(b.id)}',
    '''<button
                        onClick={() => setInfoBooking(b)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded"
                        title="Payment Info"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}''',
    1
)

# Add info modal at end
old_end = '  );\n}'
new_end = '''  {infoBooking && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          <h2 className="text-lg font-bold mb-1">💳 Payment Info</h2>
          <p className="text-sm text-slate-500 mb-4">{infoBooking.guest_name} — {infoBooking.booking_code}</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold">₹{infoBooking.final_amount}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Payment Status</span>
              <span className={infoBooking.payment_status === 'paid' ? 'text-green-600 font-semibold' : 'text-orange-500 font-semibold'}>{infoBooking.payment_status || 'pending'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Sender Name</span>
              <span className="font-medium">{infoBooking.payment_sender_name || '—'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">UTR Number</span>
              <span className="font-medium font-mono">{infoBooking.utr_number || '—'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Payment Date</span>
              <span className="font-medium">{infoBooking.payment_date ? new Date(infoBooking.payment_date).toLocaleDateString('en-IN') : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Check-in / Out</span>
              <span className="font-medium">{new Date(infoBooking.check_in).toLocaleDateString('en-IN')} → {new Date(infoBooking.check_out).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
          <button onClick={() => setInfoBooking(null)}
            className="w-full mt-5 bg-slate-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-700">
            Close
          </button>
        </div>
      </div>
    )}
  );
}'''

c = c.replace('  );\n}', new_end, 1)

f = open('src/app/dashboard/bookings/page.tsx', 'w')
f.write(c)
f.close()
print("Bookings page updated!")

