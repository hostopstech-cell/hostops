import re

path = "src/app/partner/dashboard/page.tsx"
with open(path, "r") as f:
    content = f.read()

# 1. Update Lead interface to include new fields
old_interface = """interface Lead {
  id: number; prospect_email: string; prospect_name?: string;
  status: string; payment_status: string; plan_name?: string;
  plan_amount: number; commission_amount: number; commission_percent: number;
  created_at: string; onboarded_at?: string; paid_at?: string;
  owner_name?: string; owner_number?: number;
}"""

new_interface = """interface Lead {
  id: number; prospect_email: string; prospect_name?: string;
  status: string; payment_status: string; plan_name?: string;
  plan_amount: number; commission_amount: number; commission_percent: number;
  created_at: string; onboarded_at?: string; paid_at?: string;
  owner_name?: string; owner_number?: number;
  payment_note?: string; transaction_ref?: string; payout_note?: string;
}"""

if old_interface not in content:
    raise SystemExit("ERROR: interface block not found, aborting.")
content = content.replace(old_interface, new_interface, 1)

# 2. Show UTR + Note below "Commission paid on..." line
old_block = """                      {lead.payment_status === "paid" && lead.paid_at && (
                        <div className="mt-3 text-xs text-emerald-400">✓ Commission paid on {new Date(lead.paid_at).toLocaleDateString("en-IN")}</div>
                      )}"""

new_block = """                      {lead.payment_status === "paid" && lead.paid_at && (
                        <div className="mt-3 space-y-1">
                          <div className="text-xs text-emerald-400">✓ Commission paid on {new Date(lead.paid_at).toLocaleDateString("en-IN")}</div>
                          {(lead.transaction_ref) && (
                            <div className="text-xs text-slate-400">Transaction ID (UTR): <span className="text-slate-200 font-mono">{lead.transaction_ref}</span></div>
                          )}
                          {(lead.payment_note || lead.payout_note) && (
                            <div className="text-xs text-slate-400">Note: <span className="text-slate-200">{lead.payment_note || lead.payout_note}</span></div>
                          )}
                        </div>
                      )}"""

if old_block not in content:
    raise SystemExit("ERROR: payment status block not found, aborting.")
content = content.replace(old_block, new_block, 1)

with open(path, "w") as f:
    f.write(content)

print("✅ Successfully updated partner dashboard page.")
