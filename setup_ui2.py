import os

# Read properties page
f = open('src/app/dashboard/properties/page.tsx', 'r')
c = f.read()
f.close()

# Add payment modal state
old = '  const [deleteId, setDeleteId] = useState<number | null>(null);'
new = '''  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentProp, setPaymentProp] = useState<Property | null>(null);
  const [upiId, setUpiId] = useState("");
  const [paymentName, setPaymentName] = useState("");
  const [paymentSaving, setPaymentSaving] = useState(false);'''
c = c.replace(old, new)

# Add payment function before return
old = '  return ('
new = '''  async function savePaymentDetails() {
    if (!paymentProp) return;
    setPaymentSaving(true);
    await fetch(`/api/properties/${(paymentProp as any).id}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upi_id: upiId, payment_name: paymentName }),
    });
    setPaymentSaving(false);
    setPaymentModal(false);
    setSuccess("Payment details saved!");
    fetchProperties();
  }

  return ('''
c = c.replace(old, new, 1)

# Add Payment Details button near Add Property button
old = '<button\n            onClick={openAdd}'
new = '''<button
            onClick={() => {
              if (properties.length === 0) { alert("Pehle ek property add karo"); return; }
              const p = properties[0];
              setPaymentProp(p);
              setUpiId((p as any).upi_id || "");
              setPaymentName((p as any).payment_name || "");
              setPaymentModal(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 mr-2"
          >
            💳 Payment Details
          </button>
          <button
            onClick={openAdd}'''
c = c.replace(old, new, 1)

# Add payment modal before closing div
old = '    </div>\n  );\n}'
new = '''    {/* Payment Modal */}
    {paymentModal && paymentProp && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
          <h2 className="text-lg font-bold mb-1">💳 Payment Details</h2>
          <p className="text-sm text-slate-500 mb-4">{(paymentProp as any).name} — Bot guests ko ye details dega</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Owner / Account Name</label>
              <input value={paymentName} onChange={e => setPaymentName(e.target.value)}
                placeholder="e.g. Rajesh Kumar" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">UPI ID</label>
              <input value={upiId} onChange={e => setUpiId(e.target.value)}
                placeholder="e.g. rajesh@upi or 9876543210@paytm" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={savePaymentDetails} disabled={paymentSaving}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              {paymentSaving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setPaymentModal(false)}
              className="flex-1 border py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}'''
c = c.replace('    </div>\n  );\n}', new, 1)

f = open('src/app/dashboard/properties/page.tsx', 'w')
f.write(c)
f.close()
print("Properties page updated!")
