"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Agent {
  id: number; name: string; email: string; phone: string;
  referralCode: string; upiId?: string; bankAccount?: string;
  bankIfsc?: string; bankName?: string; bankHolderName?: string;
  totalEarnings: number; totalPaid: number; pendingAmount: number;
}
interface Lead {
  id: number; prospect_email: string; prospect_name?: string;
  status: string; payment_status: string; plan_name?: string;
  plan_amount: number; commission_amount: number; commission_percent: number;
  created_at: string; onboarded_at?: string; paid_at?: string;
  owner_name?: string; payment_note?: string; transaction_ref?: string; payout_note?: string;
}
interface CommissionEvent {
  id: number; lead_id: number; event_type: string; plan_name?: string;
  plan_amount: number; billing_type?: string; commission_percent: number;
  commission_amount: number; payment_status: string; transaction_ref?: string;
  note?: string; paid_at?: string; created_at: string; razorpay_payment_id?: string;
  prospect_email: string; prospect_name?: string; owner_name?: string;
}
interface Stats {
  totalLeads: number; converted: number; pending: number;
  totalCommission: number; totalPaid: number; pendingPayout: number;
}

export default function PartnerDashboard() {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [commissionEvents, setCommissionEvents] = useState<CommissionEvent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "earnings" | "payment">("overview");
  const [showAddLead, setShowAddLead] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadName, setLeadName] = useState("");
  const [addLeadLoading, setAddLeadLoading] = useState(false);
  const [addLeadMsg, setAddLeadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);
  const [payForm, setPayForm] = useState({ upi_id: "", bank_holder_name: "", bank_account: "", bank_ifsc: "", bank_name: "" });
  const [payLoading, setPayLoading] = useState(false);
  const [payMsg, setPayMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function loadDashboard() {
    const dashRes = await fetch("/api/partner/dashboard");
    const dashData = await dashRes.json();
    if (dashData.leads) setLeads(dashData.leads);
    if (dashData.stats) setStats(dashData.stats);
    if (dashData.commissionEvents) setCommissionEvents(dashData.commissionEvents);
  }

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/partner/me");
      const meData = await meRes.json();
      if (!meData.agent) { router.push("/partner"); return; }
      setAgent(meData.agent);
      setPayForm({
        upi_id: meData.agent.upiId || "",
        bank_holder_name: meData.agent.bankHolderName || "",
        bank_account: meData.agent.bankAccount || "",
        bank_ifsc: meData.agent.bankIfsc || "",
        bank_name: meData.agent.bankName || "",
      });
      await loadDashboard();
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleAddLead() {
    if (!leadEmail.trim()) return;
    setAddLeadLoading(true); setAddLeadMsg(null);
    try {
      const res = await fetch("/api/partner/add-lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospect_email: leadEmail, prospect_name: leadName }),
      });
      const data = await res.json();
      if (!res.ok) { setAddLeadMsg({ type: "error", text: data.error }); return; }
      setAddLeadMsg({ type: "success", text: "Lead added! They will show here once they register & pay." });
      setLeadEmail(""); setLeadName("");
      await loadDashboard();
    } catch { setAddLeadMsg({ type: "error", text: "Something went wrong" }); }
    finally { setAddLeadLoading(false); }
  }

  async function handleSavePayment() {
    setPayLoading(true); setPayMsg("");
    try {
      const res = await fetch("/api/partner/update-payment", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payForm),
      });
      if (res.ok) { setPayMsg("saved"); setEditingPayment(false); }
      else setPayMsg("error");
    } catch { setPayMsg("error"); }
    finally { setPayLoading(false); }
  }

  async function handleLogout() {
    await fetch("/api/partner/logout", { method: "POST" });
    router.push("/partner");
  }

  function copyCode() {
    if (agent?.referralCode) {
      navigator.clipboard.writeText(agent.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const statusBadge = (s: string) => {
    if (s === "onboarded") return "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20";
    if (s === "pending") return "text-amber-400 bg-amber-400/10 border border-amber-400/20";
    return "text-slate-400 bg-slate-400/10 border border-slate-400/20";
  };

  const payBadge = (s: string) =>
    s === "paid"
      ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
      : "text-orange-400 bg-orange-400/10 border border-orange-400/20";

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "leads", label: "My Leads" },
    { key: "earnings", label: "Earnings" },
    { key: "payment", label: "Payouts" },
  ] as const;

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-slate-900 border-r border-slate-800 fixed inset-y-0 left-0 z-20">
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-base">H</div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">HostOps</div>
              <div className="text-xs text-slate-500 leading-tight">Partner Portal</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeTab === item.key ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-4">
          <button onClick={() => { setShowAddLead(true); setAddLeadMsg(null); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all">
            + Add New Lead
          </button>
        </div>
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                {agent?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200 leading-tight">{agent?.name}</div>
                <div className="text-xs text-slate-500 leading-tight">Partner</div>
              </div>
            </div>
            <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Out</button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-56 bg-slate-900 border-r border-slate-800 flex flex-col">
            <div className="px-5 py-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-base">H</div>
                <div>
                  <div className="font-bold text-white text-sm">HostOps</div>
                  <div className="text-xs text-slate-500">Partner Portal</div>
                </div>
              </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {tabs.map(item => (
                <button key={item.key} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeTab === item.key ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}>
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="px-3 pb-4">
              <button onClick={() => { setShowAddLead(true); setSidebarOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all">
                + Add New Lead
              </button>
            </div>
            <div className="px-4 py-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-200">{agent?.name}</div>
                <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-slate-300">Out</button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 md:ml-56 min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-slate-800 bg-slate-950 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 text-xl">☰</button>
          <span className="font-bold text-sm">HostOps Partner</span>
          <button onClick={handleLogout} className="text-slate-400 text-xs">Out</button>
        </div>

        <div className="px-4 md:px-6 py-6 md:py-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white">
              {activeTab === "overview" && "Partner Dashboard"}
              {activeTab === "leads" && "My Leads"}
              {activeTab === "earnings" && "Earnings & Commission History"}
              {activeTab === "payment" && "Payouts & Payment Details"}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {activeTab === "overview" && "Your referral performance at a glance"}
              {activeTab === "leads" && "Track all referred prospects"}
              {activeTab === "earnings" && "All commission events — first payments & renewals"}
              {activeTab === "payment" && "Manage where your commissions are sent"}
            </p>
          </div>

          {/* Referral code card */}
          <div className="relative overflow-hidden bg-slate-900 border border-orange-500/20 rounded-2xl p-5 mb-6">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border-2 border-orange-500/10" />
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full border border-orange-500/10" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-orange-400 font-semibold uppercase tracking-widest mb-1">Your Referral Code</p>
                <p className="text-3xl font-black tracking-widest text-white mb-1">{agent?.referralCode}</p>
                <p className="text-xs text-slate-400">Share this when prospects ask who referred them</p>
              </div>
              <button onClick={copyCode}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex-shrink-0 ${copied ? "bg-emerald-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
                {copied ? "✓ Copied!" : "Copy Code"}
              </button>
            </div>
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Total Leads", value: stats?.totalLeads ?? 0, color: "text-sky-400" },
                  { label: "Converted", value: stats?.converted ?? 0, color: "text-emerald-400" },
                  { label: "Total Commission", value: `₹${(stats?.totalCommission ?? 0).toLocaleString("en-IN")}`, color: "text-orange-400" },
                  { label: "Pending Payout", value: `₹${(stats?.pendingPayout ?? 0).toLocaleString("en-IN")}`, color: "text-amber-400" },
                ].map((s, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors">
                    <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
                    <div className="text-slate-400 text-xs font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              {leads.length === 0 ? (
                <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-12 flex flex-col items-center text-center">
                  <div className="text-3xl mb-4">🎯</div>
                  <div className="text-base font-semibold text-white mb-2">No leads yet</div>
                  <div className="text-sm text-slate-400 mb-5 max-w-xs">Start referring property owners and earn commissions on every conversion.</div>
                  <button onClick={() => { setShowAddLead(true); setAddLeadMsg(null); }}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all">
                    + Add Your First Lead
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-300">Recent Leads</h2>
                    {leads.length > 5 && (
                      <button onClick={() => setActiveTab("leads")} className="text-orange-400 hover:text-orange-300 text-xs">View all {leads.length} →</button>
                    )}
                  </div>
                  <div className="space-y-2 mb-6">
                    {leads.slice(0, 5).map(lead => (
                      <div key={lead.id} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                            {(lead.prospect_name || lead.prospect_email)[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white text-sm truncate">{lead.prospect_name || lead.prospect_email}</div>
                            <div className="text-xs text-slate-500 truncate">{lead.prospect_email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize ${statusBadge(lead.status)}`}>{lead.status}</span>
                          {lead.commission_amount > 0 && (
                            <span className="text-sm font-bold text-orange-400">₹{lead.commission_amount.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent commission events preview */}
                  {commissionEvents.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-slate-300">Recent Commissions</h2>
                        <button onClick={() => setActiveTab("earnings")} className="text-orange-400 hover:text-orange-300 text-xs">View all →</button>
                      </div>
                      <div className="space-y-2">
                        {commissionEvents.slice(0, 3).map(ev => (
                          <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-semibold text-white capitalize">{ev.prospect_name || ev.prospect_email}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${ev.event_type === "first" ? "bg-orange-500/20 text-orange-400" : "bg-purple-500/20 text-purple-400"}`}>
                                  {ev.event_type === "first" ? "First Payment" : "Renewal"}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                {ev.plan_name ? `${ev.plan_name} • ₹${ev.plan_amount.toLocaleString("en-IN")}` : ""} • {ev.commission_percent}% commission • {new Date(ev.created_at).toLocaleDateString("en-IN")}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-base font-bold text-orange-400">₹{ev.commission_amount.toLocaleString("en-IN")}</div>
                              <div className={`text-xs font-medium ${ev.payment_status === "paid" ? "text-emerald-400" : "text-amber-400"}`}>
                                {ev.payment_status === "paid" ? "✓ Paid" : "Pending"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── LEADS TAB ── */}
          {activeTab === "leads" && (
            <div>
              {leads.length === 0 ? (
                <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-12 flex flex-col items-center text-center">
                  <div className="text-3xl mb-4">🎯</div>
                  <div className="text-base font-semibold text-white mb-2">No leads yet</div>
                  <div className="text-sm text-slate-400">Use Add New Lead from the sidebar to get started.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {leads.map(lead => (
                    <div key={lead.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-sm font-bold text-slate-300 flex-shrink-0">
                            {(lead.prospect_name || lead.prospect_email)[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">{lead.prospect_name || "—"}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{lead.prospect_email}</div>
                            <div className="text-xs text-slate-600 mt-0.5">Added {new Date(lead.created_at).toLocaleDateString("en-IN")}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize ${statusBadge(lead.status)}`}>{lead.status}</span>
                        </div>
                      </div>
                      {lead.status === "onboarded" && (
                        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div><div className="text-xs text-slate-500 mb-0.5">Plan</div><div className="text-sm font-semibold text-white capitalize">{lead.plan_name || "—"}</div></div>
                          <div><div className="text-xs text-slate-500 mb-0.5">Plan Amount</div><div className="text-sm font-semibold text-white">₹{lead.plan_amount?.toLocaleString("en-IN") || "—"}</div></div>
                          <div><div className="text-xs text-slate-500 mb-0.5">First Commission</div><div className="text-sm font-bold text-orange-400">₹{lead.commission_amount?.toLocaleString("en-IN") || "—"}</div></div>
                          <div><div className="text-xs text-slate-500 mb-0.5">Onboarded</div><div className="text-sm font-semibold text-white">{lead.onboarded_at ? new Date(lead.onboarded_at).toLocaleDateString("en-IN") : "—"}</div></div>
                        </div>
                      )}
                      {/* Show all commission events for this lead */}
                      {commissionEvents.filter(ev => ev.lead_id === lead.id).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-800">
                          <div className="text-xs text-slate-500 mb-2 font-semibold">Commission History</div>
                          <div className="space-y-2">
                            {commissionEvents.filter(ev => ev.lead_id === lead.id).map(ev => (
                              <div key={ev.id} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-3 py-2.5">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${ev.event_type === "first" ? "bg-orange-500/20 text-orange-400" : "bg-purple-500/20 text-purple-400"}`}>
                                      {ev.event_type === "first" ? "First Payment (40%)" : "Renewal (20%)"}
                                    </span>
                                    <span className={`text-xs font-medium ${ev.payment_status === "paid" ? "text-emerald-400" : "text-amber-400"}`}>
                                      {ev.payment_status === "paid" ? "✓ Paid" : "Pending"}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    Plan: <span className="text-slate-300 capitalize">{ev.plan_name}</span> • ₹{ev.plan_amount.toLocaleString("en-IN")} • {new Date(ev.created_at).toLocaleDateString("en-IN")}
                                  </div>
                                  {ev.payment_status === "paid" && ev.paid_at && (
                                    <div className="text-xs text-emerald-400 mt-1">
                                      ✓ Paid on {new Date(ev.paid_at).toLocaleDateString("en-IN")}
                                      {ev.transaction_ref ? ` • UTR: ${ev.transaction_ref}` : ""}
                                      {ev.note ? ` • ${ev.note}` : ""}
                                    </div>
                                  )}
                                </div>
                                <div className="text-base font-bold text-orange-400 flex-shrink-0 ml-3">₹{ev.commission_amount.toLocaleString("en-IN")}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── EARNINGS TAB ── */}
          {activeTab === "earnings" && (
            <div>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Total Earned", value: `₹${(stats?.totalCommission ?? 0).toLocaleString("en-IN")}`, color: "text-orange-400", bg: "bg-orange-400/10" },
                  { label: "Received", value: `₹${(stats?.totalPaid ?? 0).toLocaleString("en-IN")}`, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                  { label: "Pending", value: `₹${(stats?.pendingPayout ?? 0).toLocaleString("en-IN")}`, color: "text-amber-400", bg: "bg-amber-400/10" },
                ].map((item, i) => (
                  <div key={i} className={`${item.bg} border border-slate-800 rounded-2xl p-4 text-center`}>
                    <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>

              {commissionEvents.length === 0 ? (
                <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-12 text-center">
                  <div className="text-3xl mb-3">💰</div>
                  <div className="text-base font-semibold text-white mb-1">No commissions yet</div>
                  <div className="text-sm text-slate-400">Commissions appear here when your leads make payments.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {commissionEvents.map(ev => (
                    <div key={ev.id} className={`bg-slate-900 border rounded-2xl p-5 ${ev.payment_status === "paid" ? "border-slate-800" : ev.event_type === "renewal" ? "border-purple-500/20" : "border-orange-500/20"}`}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="font-semibold text-white text-sm">{ev.owner_name || ev.prospect_name || ev.prospect_email}</span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-lg font-semibold ${ev.event_type === "first" ? "bg-orange-500/20 text-orange-400 border border-orange-500/20" : "bg-purple-500/20 text-purple-400 border border-purple-500/20"}`}>
                              {ev.event_type === "first" ? "First Payment — 40%" : "Renewal — 20%"}
                            </span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-lg font-medium border ${ev.payment_status === "paid" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-amber-400 bg-amber-400/10 border-amber-400/20"}`}>
                              {ev.payment_status === "paid" ? "✓ Commission Paid" : "Payout Pending"}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mb-1">
                            Plan: <span className="text-white capitalize">{ev.plan_name || "—"}</span>
                            {" • "}Owner paid: <span className="text-white">₹{ev.plan_amount.toLocaleString("en-IN")}</span>
                            {" • "}Commission: <span className="text-orange-400 font-semibold">{ev.commission_percent}% = ₹{ev.commission_amount.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Payment received: {new Date(ev.created_at).toLocaleDateString("en-IN")}
                          </div>
                          {ev.payment_status === "paid" && ev.paid_at && (
                            <div className="mt-2 text-xs text-emerald-400">
                              ✓ Commission transferred on {new Date(ev.paid_at).toLocaleDateString("en-IN")}
                              {ev.transaction_ref ? ` • UTR: ${ev.transaction_ref}` : ""}
                              {ev.note ? ` • Note: ${ev.note}` : ""}
                            </div>
                          )}
                          {ev.payment_status !== "paid" && (
                            <div className="mt-2 text-xs text-amber-400/80">
                              ⏳ Commission will be transferred within 24 hours of approval
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-black text-orange-400">₹{ev.commission_amount.toLocaleString("en-IN")}</div>
                          <div className="text-xs text-slate-500 mt-0.5">your share</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PAYMENT TAB ── */}
          {activeTab === "payment" && (
            <div className="max-w-xl space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="font-semibold text-white mb-4">Earnings Summary</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Earned", value: `₹${(stats?.totalCommission ?? 0).toLocaleString("en-IN")}`, color: "text-orange-400", bg: "bg-orange-400/10" },
                    { label: "Received", value: `₹${(stats?.totalPaid ?? 0).toLocaleString("en-IN")}`, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                    { label: "Pending", value: `₹${(stats?.pendingPayout ?? 0).toLocaleString("en-IN")}`, color: "text-amber-400", bg: "bg-amber-400/10" },
                  ].map((item, i) => (
                    <div key={i} className={`${item.bg} rounded-xl p-4 text-center`}>
                      <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                      <div className="text-xs text-slate-400 mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
                {(stats?.pendingPayout ?? 0) > 0 && (
                  <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 text-center">
                    ⚡ Payments processed within 24 hours of commission approval
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-semibold text-white">Payment Details</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Where we send your commission</p>
                  </div>
                  {!editingPayment && (
                    <button onClick={() => setEditingPayment(true)} className="text-orange-400 hover:text-orange-300 text-sm transition-colors">Edit</button>
                  )}
                </div>
                {payMsg === "saved" && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-400 text-center mb-4">✅ Payment details saved!</div>
                )}
                {payMsg === "error" && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 text-center mb-4">❌ Failed to save. Try again.</div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">UPI ID</label>
                    {editingPayment ? (
                      <input value={payForm.upi_id} onChange={e => setPayForm({...payForm, upi_id: e.target.value})}
                        placeholder="yourname@upi" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                    ) : (
                      <div className="bg-slate-800 rounded-xl px-4 py-3 text-sm text-white border border-slate-700/50">{agent?.upiId || <span className="text-slate-500">Not set</span>}</div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Account Holder", key: "bank_holder_name" as const, placeholder: "Full name", display: agent?.bankHolderName },
                      { label: "Bank Name", key: "bank_name" as const, placeholder: "SBI / HDFC", display: agent?.bankName },
                      { label: "Account Number", key: "bank_account" as const, placeholder: "1234567890", display: agent?.bankAccount ? `****${agent.bankAccount.slice(-4)}` : null },
                      { label: "IFSC Code", key: "bank_ifsc" as const, placeholder: "SBIN0001234", display: agent?.bankIfsc },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="text-xs text-slate-400 font-medium mb-1.5 block">{field.label}</label>
                        {editingPayment ? (
                          <input value={payForm[field.key]} onChange={e => setPayForm({...payForm, [field.key]: e.target.value})}
                            placeholder={field.placeholder} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                        ) : (
                          <div className="bg-slate-800 rounded-xl px-4 py-3 text-sm text-white border border-slate-700/50">{field.display || <span className="text-slate-500">Not set</span>}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  {editingPayment && (
                    <div className="flex gap-3 pt-1">
                      <button onClick={() => { setEditingPayment(false); setPayMsg(""); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors">Cancel</button>
                      <button onClick={handleSavePayment} disabled={payLoading} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all">
                        {payLoading ? "Saving..." : "Save Details"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-7 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Add New Lead</h3>
                <p className="text-slate-400 text-sm mt-0.5">Register a prospect under your account</p>
              </div>
              <button onClick={() => { setShowAddLead(false); setAddLeadMsg(null); setLeadEmail(""); setLeadName(""); }} className="text-slate-500 hover:text-slate-300 text-xl">✕</button>
            </div>
            {addLeadMsg && (
              <div className={`rounded-xl p-3.5 mb-4 text-sm ${addLeadMsg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                {addLeadMsg.text}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Prospect Name</label>
                <input value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="Hotel owner name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email Address *</label>
                <input type="email" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} placeholder="owner@hotel.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div className="bg-slate-800 rounded-xl p-3 text-xs text-slate-400 border border-slate-700/50">
                💡 Lead appears once they register with this email and complete payment.
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => { setShowAddLead(false); setAddLeadMsg(null); setLeadEmail(""); setLeadName(""); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handleAddLead} disabled={addLeadLoading || !leadEmail.trim()} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all">
                  {addLeadLoading ? "Adding..." : "Add Lead"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
