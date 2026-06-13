import { readFileSync, writeFileSync } from "fs";

// ── 1. Admin referrals page update ──
let adminPage = readFileSync("src/app/admin/referrals/page.tsx", "utf-8");

const oldAuthType = `type AuthStep = "login" | "otp" | "done";
type Tab = "overview" | "leads" | "agents";
type ModalMode = "commission" | "paid" | null;`;

const newAuthType = `interface CommissionEvent {
  id: number; lead_id: number; agent_id: number; event_type: string;
  plan_name?: string; plan_amount: number; billing_type?: string;
  commission_percent: number; commission_amount: number;
  payment_status: string; transaction_ref?: string; note?: string;
  paid_at?: string; created_at: string;
  agent_name: string; referral_code: string;
  prospect_email: string; prospect_name?: string; owner_name?: string;
}
type AuthStep = "login" | "otp" | "done";
type Tab = "overview" | "leads" | "agents";
type ModalMode = "commission" | "paid" | "event_paid" | null;`;

adminPage = adminPage.replace(oldAuthType, newAuthType);

const oldModalMsg = `  const [modalMsg, setModalMsg] = useState("");
  const ADMIN_EMAIL = "hostops.tech@gmail.com";`;
const newModalMsg = `  const [modalMsg, setModalMsg] = useState("");
  const [commissionEvents, setCommissionEvents] = useState<CommissionEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CommissionEvent | null>(null);
  const ADMIN_EMAIL = "hostops.tech@gmail.com";`;
adminPage = adminPage.replace(oldModalMsg, newModalMsg);

const oldSetLeads = `      setAgents(data.agents || []);
      setLeads(data.leads || []);`;
const newSetLeads = `      setAgents(data.agents || []);
      setLeads(data.leads || []);
      setCommissionEvents(data.commissionEvents || []);`;
adminPage = adminPage.replace(oldSetLeads, newSetLeads);

const oldToggle = `  async function handleToggleAgent(agentId: number, currentActive: boolean) {`;
const newToggle = `  async function handleMarkEventPaid() {
    if (!selectedEvent) return;
    setModalLoading(true); setModalMsg("");
    const res = await fetch("/api/admin/referrals/mark-paid", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: selectedEvent.id, transaction_ref: txnRef, note: payNote, commission_amount: selectedEvent.commission_amount }),
    });
    const data = await res.json();
    if (res.ok) { setModalMsg("✅ Marked as paid!"); await loadData(); setTimeout(() => { setModalMode(null); setSelectedEvent(null); setModalMsg(""); setTxnRef(""); setPayNote(""); }, 1200); }
    else setModalMsg("❌ " + data.error);
    setModalLoading(false);
  }

  async function handleToggleAgent(agentId: number, currentActive: boolean) {`;
adminPage = adminPage.replace(oldToggle, newToggle);

const oldTotals = `  const totalCommission = leads.reduce((a, l) => a + (parseFloat(String(l.commission_amount)) || 0), 0);
  const totalPaid = leads.filter(l => l.payment_status === "paid").reduce((a, l) => a + (parseFloat(String(l.commission_amount)) || 0), 0);`;
const newTotals = `  const totalCommission = commissionEvents.reduce((a, e) => a + (parseFloat(String(e.commission_amount)) || 0), 0);
  const totalPaid = commissionEvents.filter(e => e.payment_status === "paid").reduce((a, e) => a + (parseFloat(String(e.commission_amount)) || 0), 0);`;
adminPage = adminPage.replace(oldTotals, newTotals);

// Add renewal section + fix closing div structure
const oldPendingClose = `            </div>
          </div>
        )}

        {activeTab === "leads" &&`;

const renewalSection = `            </div>
          </div>

          <div className="mt-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <h2 className="text-base font-semibold">Renewal Commissions</h2>
              <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full font-medium">{commissionEvents.filter(e => e.event_type === "renewal" && e.payment_status !== "paid").length} pending</span>
            </div>
            <div className="space-y-3">
              {commissionEvents.filter(e => e.event_type === "renewal").length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm">No renewal commissions yet</div>
              ) : commissionEvents.filter(e => e.event_type === "renewal").map(event => {
                const ag = agents.find(a => a.id === event.agent_id);
                const borderClass = event.payment_status === "paid" ? "border-slate-800" : "border-purple-500/20";
                return (
                  <div key={event.id} className={"bg-slate-900 border rounded-xl p-5 " + borderClass}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm">{event.owner_name || event.prospect_name || "—"}</span>
                          <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-lg">20% Renewal</span>
                          <span className={"text-xs px-2 py-0.5 rounded-lg font-medium border " + (event.payment_status === "paid" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-amber-400 bg-amber-400/10 border-amber-400/20")}>
                            {event.payment_status === "paid" ? "✓ Paid" : "Unpaid"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">Agent: <span className="text-slate-200">{event.agent_name}</span> • Plan: <span className="text-white capitalize">{event.plan_name}</span> • ₹{parseFloat(String(event.plan_amount)).toLocaleString("en-IN")}</div>
                        <div className="text-lg font-bold text-purple-400 mt-1">₹{parseFloat(String(event.commission_amount)).toLocaleString("en-IN")} commission</div>
                        <div className="text-xs text-slate-500 mt-0.5">{new Date(event.created_at).toLocaleDateString("en-IN")}</div>
                        {event.payment_status === "paid" && event.paid_at && (
                          <div className="mt-1 text-xs text-emerald-400">✓ Paid on {new Date(event.paid_at).toLocaleDateString("en-IN")}{event.transaction_ref ? " • UTR: " + event.transaction_ref : ""}{event.note ? " • " + event.note : ""}</div>
                        )}
                        {ag && event.payment_status !== "paid" && (
                          <div className="mt-1.5 space-y-0.5">
                            {ag.upi_id && <div className="text-xs text-slate-500">UPI: <span className="text-slate-300">{ag.upi_id}</span></div>}
                            {ag.bank_account && <div className="text-xs text-slate-500">Bank: <span className="text-slate-300">{ag.bank_name} • {ag.bank_account}</span></div>}
                          </div>
                        )}
                      </div>
                      {event.payment_status !== "paid" && (
                        <button onClick={() => { setSelectedEvent(event); setModalMode("event_paid"); setTxnRef(""); setPayNote(""); setModalMsg(""); }}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold transition-colors flex-shrink-0">Mark Paid ✓</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "leads" &&`;

adminPage = adminPage.replace(oldPendingClose, renewalSection);

// Add event_paid modal before last closing
const oldFinalClose = `    </div>
  );
}`;
const newFinalClose = `      {modalMode === "event_paid" && selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-7 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Mark Renewal Commission as Paid</h3>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 mb-5 text-center">
              <div className="text-xs text-slate-400 mb-1">Renewal Commission (20%)</div>
              <div className="text-3xl font-black text-purple-400">₹{parseFloat(String(selectedEvent.commission_amount)).toLocaleString("en-IN")}</div>
              <div className="text-xs text-slate-400 mt-1">Agent: {selectedEvent.agent_name}</div>
            </div>
            {(() => {
              const ag = agents.find(a => a.id === selectedEvent.agent_id);
              if (!ag) return null;
              return (
                <div className="bg-slate-800 rounded-xl p-4 mb-5 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-300 mb-2">Pay to:</div>
                  {ag.upi_id && <div className="flex justify-between"><span className="text-slate-500">UPI</span><span className="text-white font-medium">{ag.upi_id}</span></div>}
                  {ag.bank_name && <div className="flex justify-between"><span className="text-slate-500">Bank</span><span className="text-white">{ag.bank_name}</span></div>}
                  {ag.bank_account && <div className="flex justify-between"><span className="text-slate-500">Account</span><span className="text-white">{ag.bank_account}</span></div>}
                  {ag.bank_ifsc && <div className="flex justify-between"><span className="text-slate-500">IFSC</span><span className="text-white">{ag.bank_ifsc}</span></div>}
                </div>
              );
            })()}
            {modalMsg && <div className="text-sm mb-4 text-center p-3 rounded-xl bg-slate-800">{modalMsg}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Transaction Reference (UTR)</label>
                <input value={txnRef} onChange={e => setTxnRef(e.target.value)} placeholder="UPI Ref / UTR Number"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Note (optional)</label>
                <input value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="Any note..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors" />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => { setModalMode(null); setSelectedEvent(null); setModalMsg(""); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handleMarkEventPaid} disabled={modalLoading} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl text-sm font-semibold transition-all">
                  {modalLoading ? "Processing..." : "✓ Confirm Paid"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;
adminPage = adminPage.replace(oldFinalClose, newFinalClose);

writeFileSync("src/app/admin/referrals/page.tsx", adminPage);
console.log("✅ Admin referrals page updated");

// ── 2. Partner dashboard API ──
const partnerApiContent = `import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET ?? "";
export const dynamic = "force-dynamic";

function maskEmail(email) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const masked = user[0] + "*".repeat(Math.max(user.length - 2, 1)) + (user.length > 1 ? user[user.length - 1] : "");
  return masked + "@" + domain;
}

export async function GET() {
  try {
    const token = cookies().get("hostops_agent_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let payload;
    try { payload = jwt.verify(token, JWT_SECRET); }
    catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
    const agentId = payload.agentId;

    const leads = await sql\`
      SELECT rl.id, rl.prospect_email, rl.prospect_name, rl.status, rl.payment_status,
        rl.plan_name, rl.plan_amount, rl.billing_type, rl.commission_percent, rl.commission_amount,
        rl.created_at, rl.onboarded_at, rl.paid_at, rl.payment_note,
        rp.transaction_ref, rp.note as payout_note,
        o.name as owner_name, o.owner_number, o.subscription_plan
      FROM referral_leads rl
      LEFT JOIN owners o ON o.id = rl.owner_id
      LEFT JOIN referral_payouts rp ON rp.lead_id = rl.id
      WHERE rl.agent_id = \${agentId}
      ORDER BY rl.created_at DESC
    \`;

    const commissionEvents = await sql\`
      SELECT ce.id, ce.lead_id, ce.event_type, ce.plan_name, ce.plan_amount,
        ce.billing_type, ce.commission_percent, ce.commission_amount,
        ce.payment_status, ce.transaction_ref, ce.note, ce.paid_at, ce.created_at
      FROM referral_commission_events ce
      WHERE ce.agent_id = \${agentId}
      ORDER BY ce.created_at DESC
    \`;

    const stats = await sql\`
      SELECT
        COUNT(DISTINCT rl.id) as total_leads,
        COUNT(DISTINCT CASE WHEN rl.status = 'onboarded' THEN rl.id END) as converted,
        COUNT(DISTINCT CASE WHEN rl.status = 'pending' THEN rl.id END) as pending,
        COALESCE(SUM(ce.commission_amount), 0) as total_commission,
        COALESCE(SUM(CASE WHEN ce.payment_status = 'paid' THEN ce.commission_amount ELSE 0 END), 0) as total_paid
      FROM referral_leads rl
      LEFT JOIN referral_commission_events ce ON ce.lead_id = rl.id
      WHERE rl.agent_id = \${agentId}
    \`;

    const s = stats[0];
    return NextResponse.json({
      leads: leads.map(l => ({
        ...l,
        prospect_email: maskEmail(l.prospect_email),
        commission_amount: parseFloat(l.commission_amount || 0),
        plan_amount: parseFloat(l.plan_amount || 0),
      })),
      commissionEvents: commissionEvents.map(e => ({
        ...e,
        commission_amount: parseFloat(e.commission_amount || 0),
        plan_amount: parseFloat(e.plan_amount || 0),
      })),
      stats: {
        totalLeads: parseInt(s.total_leads),
        converted: parseInt(s.converted),
        pending: parseInt(s.pending),
        totalCommission: parseFloat(s.total_commission),
        totalPaid: parseFloat(s.total_paid),
        pendingPayout: parseFloat(s.total_commission) - parseFloat(s.total_paid),
      }
    });
  } catch (error) {
    console.error("Partner dashboard error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
`;
writeFileSync("src/app/api/partner/dashboard/route.ts", partnerApiContent);
console.log("✅ Partner dashboard API updated");

// ── 3. Partner dashboard page — add commissionEvents state + eye button ──
let partnerPage = readFileSync("src/app/partner/dashboard/page.tsx", "utf-8");

const oldStats = `interface Stats {`;
const newStats = `interface CommissionEvent {
  id: number; lead_id: number; event_type: string; plan_name?: string;
  plan_amount: number; billing_type?: string; commission_percent: number;
  commission_amount: number; payment_status: string; transaction_ref?: string;
  note?: string; paid_at?: string; created_at: string;
}
interface Stats {`;
partnerPage = partnerPage.replace(oldStats, newStats);

const oldSidebarOpen = `  const [sidebarOpen, setSidebarOpen] = useState(false);`;
const newSidebarOpen = `  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commissionEvents, setCommissionEvents] = useState<CommissionEvent[]>([]);
  const [expandedLeadId, setExpandedLeadId] = useState<number | null>(null);`;
partnerPage = partnerPage.replace(oldSidebarOpen, newSidebarOpen);

const oldDashLoad = `      if (dashData.leads) setLeads(dashData.leads);
      if (dashData.stats) setStats(dashData.stats);
      setLoading(false);`;
const newDashLoad = `      if (dashData.leads) setLeads(dashData.leads);
      if (dashData.stats) setStats(dashData.stats);
      if (dashData.commissionEvents) setCommissionEvents(dashData.commissionEvents);
      setLoading(false);`;
partnerPage = partnerPage.replace(oldDashLoad, newDashLoad);

const oldAddLeadRefresh = `      const dashRes = await fetch("/api/partner/dashboard");
      const dashData = await dashRes.json();
      if (dashData.leads) setLeads(dashData.leads);
      if (dashData.stats) setStats(dashData.stats);`;
const newAddLeadRefresh = `      const dashRes = await fetch("/api/partner/dashboard");
      const dashData = await dashRes.json();
      if (dashData.leads) setLeads(dashData.leads);
      if (dashData.stats) setStats(dashData.stats);
      if (dashData.commissionEvents) setCommissionEvents(dashData.commissionEvents);`;
partnerPage = partnerPage.replace(oldAddLeadRefresh, newAddLeadRefresh);

// Replace the old "Commission paid on..." block with eye button version
const oldPaidBlock = `                      {lead.payment_status === "paid" && lead.paid_at && (
                        <div className="mt-3 text-xs text-emerald-400">✓ Commission paid on {new Date(lead.paid_at).toLocaleDateString("en-IN")}</div>
                      )}`;

const newEyeBlock = `                      <div className="mt-3">
                        <button
                          onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-400 transition-colors"
                        >
                          <span>{expandedLeadId === lead.id ? "▲ Hide" : "▼ View"} payment history</span>
                        </button>
                        {expandedLeadId === lead.id && (
                          <div className="mt-2 space-y-2">
                            {commissionEvents.filter(e => e.lead_id === lead.id).length === 0 ? (
                              <div className="text-xs text-slate-500 pl-2">No commission events yet</div>
                            ) : commissionEvents.filter(e => e.lead_id === lead.id).map(event => (
                              <div key={event.id} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div>
                                    <div className={"text-xs font-semibold " + (event.event_type === "first" ? "text-orange-400" : "text-purple-400")}>
                                      {event.event_type === "first" ? "First Payment (40%)" : "Renewal (20%)"}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5 capitalize">{event.plan_name} • Rs.{event.plan_amount.toLocaleString("en-IN")} • {event.billing_type}</div>
                                    <div className="text-xs text-slate-500">{new Date(event.created_at).toLocaleDateString("en-IN")}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-white">Rs.{event.commission_amount.toLocaleString("en-IN")}</div>
                                    <div className={"text-xs px-2 py-0.5 rounded-lg " + (event.payment_status === "paid" ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10")}>
                                      {event.payment_status === "paid" ? "Received" : "Pending"}
                                    </div>
                                  </div>
                                </div>
                                {event.payment_status === "paid" && event.paid_at && (
                                  <div className="mt-2 text-xs text-emerald-400">
                                    Paid on {new Date(event.paid_at).toLocaleDateString("en-IN")}
                                    {event.transaction_ref ? " | UTR: " + event.transaction_ref : ""}
                                    {event.note ? " | " + event.note : ""}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>`;

partnerPage = partnerPage.replace(oldPaidBlock, newEyeBlock);

writeFileSync("src/app/partner/dashboard/page.tsx", partnerPage);
console.log("✅ Partner dashboard page updated");
console.log("\n🎉 All files updated!");
