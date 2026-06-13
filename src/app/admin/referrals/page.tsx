"use client";
import { useState, useEffect, useCallback } from "react";

interface Agent {
  id: number; name: string; email: string; phone: string; referral_code: string;
  upi_id?: string; bank_account?: string; bank_ifsc?: string; bank_name?: string; bank_holder_name?: string;
  total_leads: number; converted_leads: number; total_commission: number; paid_commission: number;
  total_earnings: number; total_paid: number; is_active: boolean;
}
interface Lead {
  id: number; agent_id: number; prospect_email: string; prospect_name?: string;
  status: string; payment_status: string; plan_name?: string; plan_amount: number;
  billing_type?: string; commission_percent: number; commission_amount: number;
  created_at: string; onboarded_at?: string; paid_at?: string; payment_note?: string;
  agent_name: string; referral_code: string; owner_name?: string; owner_number?: number;
}
type AuthStep = "login" | "otp" | "done";
type Tab = "overview" | "leads" | "agents";
type ModalMode = "commission" | "paid" | null;

export default function AdminReferrals() {
  const [authStep, setAuthStep] = useState<AuthStep>("login");
  const [authPassword, setAuthPassword] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [filterAgent, setFilterAgent] = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPay, setFilterPay] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [commPercent, setCommPercent] = useState("");
  const [commAmount, setCommAmount] = useState("");
  const [txnRef, setTxnRef] = useState("");
  const [payNote, setPayNote] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const ADMIN_EMAIL = "hostops.tech@gmail.com";

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const res = await fetch("/api/admin/referrals");
      if (res.status === 401) { setAuthStep("login"); setDataLoading(false); return; }
      const data = await res.json();
      setAgents(data.agents || []);
      setLeads(data.leads || []);
    } catch {}
    setDataLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/admin/referrals").then(r => {
      if (r.ok) { setAuthStep("done"); loadData(); }
      else setAuthStep("login");
      setCheckingAuth(false);
    }).catch(() => { setAuthStep("login"); setCheckingAuth(false); });
  }, [loadData]);

  async function handleSendOtp() {
    setAuthLoading(true); setAuthError("");
    const res = await fetch("/api/admin/auth/send-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: authPassword }),
    });
    const data = await res.json();
    if (res.ok) setAuthStep("otp");
    else setAuthError(data.error || "Failed");
    setAuthLoading(false);
  }

  async function handleVerifyOtp() {
    setAuthLoading(true); setAuthError("");
    const res = await fetch("/api/admin/auth/verify-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, otp: authOtp }),
    });
    const data = await res.json();
    if (res.ok) { setAuthStep("done"); await loadData(); }
    else setAuthError(data.error || "Invalid OTP");
    setAuthLoading(false);
  }

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    setAuthStep("login"); setAuthPassword(""); setAuthOtp(""); setAgents([]); setLeads([]);
  }

  async function handleSetCommission() {
    if (!selectedLead) return;
    setModalLoading(true); setModalMsg("");
    const res = await fetch("/api/admin/referrals/update-commission", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: selectedLead.id, commission_percent: parseFloat(commPercent) || 0, commission_amount: parseFloat(commAmount) || 0 }),
    });
    const data = await res.json();
    if (res.ok) { setModalMsg("✅ Commission updated!"); await loadData(); setTimeout(() => { setModalMode(null); setSelectedLead(null); setModalMsg(""); }, 1200); }
    else setModalMsg("❌ " + data.error);
    setModalLoading(false);
  }

  async function handleMarkPaid() {
    if (!selectedLead) return;
    setModalLoading(true); setModalMsg("");
    const res = await fetch("/api/admin/referrals/mark-paid", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: selectedLead.id, transaction_ref: txnRef, note: payNote, commission_amount: selectedLead.commission_amount }),
    });
    const data = await res.json();
    if (res.ok) { setModalMsg("✅ Marked as paid!"); await loadData(); setTimeout(() => { setModalMode(null); setSelectedLead(null); setModalMsg(""); setTxnRef(""); setPayNote(""); }, 1200); }
    else setModalMsg("❌ " + data.error);
    setModalLoading(false);
  }

  async function handleToggleAgent(agentId: number, currentActive: boolean) {
    await fetch("/api/admin/referrals/toggle-agent", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: agentId, is_active: !currentActive }),
    });
    await loadData();
  }

  const filteredLeads = leads.filter(l => {
    if (filterAgent !== "all" && l.agent_id !== filterAgent) return false;
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (filterPay !== "all" && l.payment_status !== filterPay) return false;
    return true;
  });

  const totalCommission = leads.reduce((a, l) => a + (parseFloat(String(l.commission_amount)) || 0), 0);
  const totalPaid = leads.filter(l => l.payment_status === "paid").reduce((a, l) => a + (parseFloat(String(l.commission_amount)) || 0), 0);
  const totalPending = totalCommission - totalPaid;
  const totalConverted = leads.filter(l => l.status === "onboarded").length;

  const sc = (s: string) => {
    if (s === "onboarded") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (s === "pending") return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    return "text-slate-400 bg-slate-400/10 border-slate-400/20";
  };

  if (checkingAuth) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (authStep !== "done") return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center font-black text-white text-xl">H</div>
            <div className="text-left">
              <div className="font-black text-white text-xl">HostOps</div>
              <div className="text-xs text-slate-500">Admin Panel</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-3">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">Restricted Access</span>
          </div>
          <p className="text-slate-400 text-sm mt-2">{authStep === "login" ? "Enter credentials to continue" : "Enter OTP sent to your email"}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {authStep === "login" ? (
            <div className="space-y-5">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 block">Admin Email</label>
                <div className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 text-sm flex items-center gap-2">
                  <span className="text-orange-400">🔒</span>{ADMIN_EMAIL}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 block">Password</label>
                <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                  placeholder="Enter admin password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 transition-colors" autoFocus />
              </div>
              {authError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 text-center">{authError}</div>}
              <button onClick={handleSendOtp} disabled={authLoading || !authPassword}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all">
                {authLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending OTP...</span> : "Send OTP →"}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="text-emerald-400 font-semibold text-sm mb-1">📧 OTP Sent!</div>
                <div className="text-slate-400 text-xs">Check {ADMIN_EMAIL}</div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 block">6-Digit OTP</label>
                <input type="text" value={authOtp}
                  onChange={e => setAuthOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={e => e.key === "Enter" && authOtp.length === 6 && handleVerifyOtp()}
                  placeholder="000000" maxLength={6}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-2xl font-mono text-center tracking-[0.5em] focus:outline-none focus:border-orange-500 transition-colors" autoFocus />
                <div className="text-xs text-slate-500 text-center mt-2">Valid for 10 minutes</div>
              </div>
              {authError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 text-center">{authError}</div>}
              <div className="flex gap-3">
                <button onClick={() => { setAuthStep("login"); setAuthError(""); setAuthOtp(""); }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors">← Back</button>
                <button onClick={handleVerifyOtp} disabled={authLoading || authOtp.length !== 6}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all">
                  {authLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Verifying...</span> : "Verify & Enter"}
                </button>
              </div>
              <button onClick={() => { setAuthStep("login"); setAuthOtp(""); setAuthError(""); }}
                className="w-full text-orange-400 hover:text-orange-300 text-xs text-center transition-colors">Resend OTP</button>
            </div>
          )}
        </div>
        <div className="text-center mt-5 text-xs text-slate-600">Restricted to HostOps administrators only</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center font-black text-white text-sm">H</div>
              <div>
                <div className="font-bold text-white text-sm leading-tight">HostOps Admin</div>
                <div className="text-xs text-slate-500 leading-tight">Partner Management</div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-medium">Authenticated</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadData} disabled={dataLoading} className="text-slate-400 hover:text-white text-sm transition-colors disabled:opacity-50">
              <span className={dataLoading ? "inline-block animate-spin" : ""}>↻</span>
            </button>
            <button onClick={handleLogout} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all">Sign Out</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Partners", value: agents.length, color: "text-blue-400", icon: "👥" },
            { label: "Total Leads", value: leads.length, color: "text-slate-300", icon: "📋" },
            { label: "Converted", value: totalConverted, color: "text-emerald-400", icon: "✅" },
            { label: "Total Commission", value: `₹${totalCommission.toLocaleString("en-IN")}`, color: "text-orange-400", icon: "💰" },
            { label: "Pending Payout", value: `₹${totalPending.toLocaleString("en-IN")}`, color: "text-amber-400", icon: "⏳" },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
              <div className="text-xl mb-2">{s.icon}</div>
              <div className={`text-xl font-bold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-slate-400 text-xs font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 w-fit">
          {(["overview", "leads", "agents"] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-orange-500 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              {tab === "overview" ? "🏠 Overview" : tab === "leads" ? "📋 All Leads" : "👥 Partners"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <h2 className="text-base font-semibold">Needs Commission Setup</h2>
                <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full font-medium">{leads.filter(l => l.status === "onboarded" && l.commission_amount === 0).length}</span>
              </div>
              <div className="space-y-3">
                {leads.filter(l => l.status === "onboarded" && l.commission_amount === 0).length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">✅ All commissions are set</div>
                ) : leads.filter(l => l.status === "onboarded" && l.commission_amount === 0).map(lead => (
                  <div key={lead.id} className="bg-slate-900 border border-orange-500/20 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm">{lead.owner_name || lead.prospect_name || "—"}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{lead.prospect_email}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Agent: <span className="text-orange-400">{lead.agent_name}</span> • Plan: <span className="text-white capitalize">{lead.plan_name}</span> • <span className="text-emerald-400">₹{parseFloat(String(lead.plan_amount)).toLocaleString("en-IN")}</span></div>
                        <div className="text-xs text-slate-600 mt-0.5 capitalize">{lead.billing_type} • {new Date(lead.onboarded_at || lead.created_at).toLocaleDateString("en-IN")}</div>
                      </div>
                      <button onClick={() => { setSelectedLead(lead); setModalMode("commission"); setCommPercent("40"); setCommAmount(String(Math.round(parseFloat(String(lead.plan_amount)) * 0.4))); setModalMsg(""); }}
                        className="px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-xs font-semibold transition-colors flex-shrink-0">Set Commission</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <h2 className="text-base font-semibold">Pending Payouts</h2>
                <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-medium">{leads.filter(l => l.commission_amount > 0 && l.payment_status !== "paid").length}</span>
              </div>
              <div className="space-y-3">
                {leads.filter(l => l.commission_amount > 0 && l.payment_status !== "paid").length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">✅ No pending payouts</div>
                ) : leads.filter(l => l.commission_amount > 0 && l.payment_status !== "paid").map(lead => {
                  const ag = agents.find(a => a.id === lead.agent_id);
                  return (
                    <div key={lead.id} className="bg-slate-900 border border-amber-500/20 rounded-xl p-5">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm">{lead.owner_name || lead.prospect_name || "—"}</div>
                          <div className="text-xs text-slate-400 mt-0.5">Agent: <span className="text-slate-200">{lead.agent_name}</span></div>
                          <div className="text-lg font-bold text-orange-400 mt-1">₹{parseFloat(String(lead.commission_amount)).toLocaleString("en-IN")}</div>
                          <div className="mt-1.5 space-y-0.5">
                            {ag?.upi_id && <div className="text-xs text-slate-500">UPI: <span className="text-slate-300">{ag.upi_id}</span></div>}
                            {ag?.bank_account && <div className="text-xs text-slate-500">Bank: <span className="text-slate-300">{ag.bank_name} • {ag.bank_account}</span></div>}
                            {ag?.bank_ifsc && <div className="text-xs text-slate-500">IFSC: <span className="text-slate-300">{ag.bank_ifsc}</span></div>}
                            {ag?.bank_holder_name && <div className="text-xs text-slate-500">Holder: <span className="text-slate-300">{ag.bank_holder_name}</span></div>}
                          </div>
                        </div>
                        <button onClick={() => { setSelectedLead(lead); setModalMode("paid"); setTxnRef(""); setPayNote(""); setModalMsg(""); }}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold transition-colors flex-shrink-0">Mark Paid ✓</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "leads" && (
          <div>
            <div className="flex gap-3 mb-6 flex-wrap items-center">
              <select value={filterAgent === "all" ? "all" : String(filterAgent)} onChange={e => setFilterAgent(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500">
                <option value="all">All Partners</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.referral_code})</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="onboarded">Onboarded</option>
                <option value="lost">Lost</option>
              </select>
              <select value={filterPay} onChange={e => setFilterPay(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500">
                <option value="all">All Payments</option>
                <option value="pending">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
              <div className="text-slate-400 text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5">{filteredLeads.length} leads</div>
            </div>
            <div className="space-y-3">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-16 text-slate-500">No leads found</div>
              ) : filteredLeads.map(lead => (
                <div key={lead.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm">{lead.owner_name || lead.prospect_name || "—"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-medium border ${sc(lead.status)}`}>{lead.status}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-medium border ${lead.payment_status === "paid" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-amber-400 bg-amber-400/10 border-amber-400/20"}`}>
                          {lead.payment_status === "paid" ? "✓ Paid" : "Unpaid"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{lead.prospect_email}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Agent: <span className="text-slate-300">{lead.agent_name}</span> ({lead.referral_code}) • Added: {new Date(lead.created_at).toLocaleDateString("en-IN")}</div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {lead.status === "onboarded" && lead.commission_amount === 0 && (
                        <button onClick={() => { setSelectedLead(lead); setModalMode("commission"); setCommPercent("40"); setCommAmount(String(Math.round(parseFloat(String(lead.plan_amount)) * 0.4))); setModalMsg(""); }}
                          className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 rounded-lg text-xs font-medium transition-colors">Set Commission</button>
                      )}
                      {lead.commission_amount > 0 && lead.payment_status !== "paid" && (
                        <button onClick={() => { setSelectedLead(lead); setModalMode("paid"); setTxnRef(""); setPayNote(""); setModalMsg(""); }}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-colors">Mark Paid</button>
                      )}
                    </div>
                  </div>
                  {lead.status === "onboarded" && (
                    <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div><span className="text-slate-500">Plan</span><div className="text-white capitalize font-medium mt-0.5">{lead.plan_name || "—"}</div></div>
                      <div><span className="text-slate-500">Billing</span><div className="text-white capitalize font-medium mt-0.5">{lead.billing_type || "—"}</div></div>
                      <div><span className="text-slate-500">Amount</span><div className="text-white font-medium mt-0.5">₹{parseFloat(String(lead.plan_amount)).toLocaleString("en-IN")}</div></div>
                      <div><span className="text-slate-500">Comm %</span><div className="text-white font-medium mt-0.5">{lead.commission_percent || 0}%</div></div>
                      <div><span className="text-slate-500">Comm ₹</span><div className="text-orange-400 font-bold mt-0.5">₹{parseFloat(String(lead.commission_amount)).toLocaleString("en-IN")}</div></div>
                    </div>
                  )}
                  {lead.payment_status === "paid" && lead.paid_at && (
                    <div className="mt-2 text-xs text-emerald-400">✓ Paid on {new Date(lead.paid_at).toLocaleDateString("en-IN")}{lead.payment_note && ` • ${lead.payment_note}`}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "agents" && (
          <div className="space-y-4">
            {agents.length === 0 ? (
              <div className="text-center py-16 text-slate-500">No partners registered yet</div>
            ) : agents.map(agent => (
              <div key={agent.id} className={`bg-slate-900 border rounded-2xl p-6 transition-all ${agent.is_active ? "border-slate-800" : "border-red-500/20 opacity-60"}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center font-bold text-orange-400">{agent.name[0]}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{agent.name}</div>
                        {!agent.is_active && <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Inactive</span>}
                      </div>
                      <div className="text-sm text-slate-400">{agent.email}</div>
                      <div className="text-xs text-slate-500">{agent.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-center">
                      <div className="text-xs text-slate-400">Code</div>
                      <div className="font-mono font-bold text-orange-400 text-sm">{agent.referral_code}</div>
                    </div>
                    <button onClick={() => handleToggleAgent(agent.id, agent.is_active)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${agent.is_active ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400" : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400"}`}>
                      {agent.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "Total Leads", value: agent.total_leads, color: "text-white" },
                    { label: "Converted", value: agent.converted_leads, color: "text-emerald-400" },
                    { label: "Commission", value: `₹${parseFloat(String(agent.total_commission || agent.total_earnings || 0)).toLocaleString("en-IN")}`, color: "text-orange-400" },
                    { label: "Pending", value: `₹${(parseFloat(String(agent.total_commission || agent.total_earnings || 0)) - parseFloat(String(agent.paid_commission || agent.total_paid || 0))).toLocaleString("en-IN")}`, color: "text-amber-400" },
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-xl p-3.5 text-center">
                      <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-800 pt-4">
                  <div className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Payment Details</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div><span className="text-slate-500 block mb-0.5">UPI ID</span><span className="text-white">{agent.upi_id || <span className="text-slate-600">Not set</span>}</span></div>
                    <div><span className="text-slate-500 block mb-0.5">Account Holder</span><span className="text-white">{agent.bank_holder_name || <span className="text-slate-600">Not set</span>}</span></div>
                    <div><span className="text-slate-500 block mb-0.5">Bank</span><span className="text-white">{agent.bank_name || <span className="text-slate-600">Not set</span>}</span></div>
                    <div><span className="text-slate-500 block mb-0.5">Account No.</span><span className="text-white">{agent.bank_account || <span className="text-slate-600">Not set</span>}</span></div>
                    <div><span className="text-slate-500 block mb-0.5">IFSC</span><span className="text-white">{agent.bank_ifsc || <span className="text-slate-600">Not set</span>}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalMode === "commission" && selectedLead && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-7 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-1">Set Commission</h3>
            <div className="bg-slate-800 rounded-xl p-4 mb-5 text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-400">Owner</span><span className="text-white font-medium">{selectedLead.owner_name || selectedLead.prospect_name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Agent</span><span className="text-white">{selectedLead.agent_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Plan Amount</span><span className="text-emerald-400 font-bold">₹{parseFloat(String(selectedLead.plan_amount)).toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Billing</span><span className="text-white capitalize">{selectedLead.billing_type || "—"}</span></div>
            </div>
            {modalMsg && <div className="text-sm mb-4 text-center p-3 rounded-xl bg-slate-800">{modalMsg}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Commission %</label>
                <input type="number" value={commPercent}
                  onChange={e => { setCommPercent(e.target.value); if (selectedLead.plan_amount && e.target.value) setCommAmount(String(Math.round(parseFloat(String(selectedLead.plan_amount)) * parseFloat(e.target.value) / 100))); }}
                  placeholder="40" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Commission Amount (₹) *</label>
                <input type="number" value={commAmount} onChange={e => setCommAmount(e.target.value)} placeholder="400"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => { setModalMode(null); setSelectedLead(null); setModalMsg(""); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handleSetCommission} disabled={modalLoading || !commAmount} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl text-sm font-semibold transition-all">
                  {modalLoading ? "Saving..." : "Save Commission"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalMode === "paid" && selectedLead && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-7 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Mark Commission as Paid</h3>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 mb-5 text-center">
              <div className="text-xs text-slate-400 mb-1">Amount to Pay</div>
              <div className="text-3xl font-black text-orange-400">₹{parseFloat(String(selectedLead.commission_amount)).toLocaleString("en-IN")}</div>
              <div className="text-xs text-slate-400 mt-1">Agent: {selectedLead.agent_name}</div>
            </div>
            {(() => {
              const ag = agents.find(a => a.id === selectedLead.agent_id);
              if (!ag) return null;
              return (
                <div className="bg-slate-800 rounded-xl p-4 mb-5 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-300 mb-2">Pay to:</div>
                  {ag.upi_id && <div className="flex justify-between"><span className="text-slate-500">UPI</span><span className="text-white font-medium">{ag.upi_id}</span></div>}
                  {ag.bank_name && <div className="flex justify-between"><span className="text-slate-500">Bank</span><span className="text-white">{ag.bank_name}</span></div>}
                  {ag.bank_account && <div className="flex justify-between"><span className="text-slate-500">Account</span><span className="text-white">{ag.bank_account}</span></div>}
                  {ag.bank_ifsc && <div className="flex justify-between"><span className="text-slate-500">IFSC</span><span className="text-white">{ag.bank_ifsc}</span></div>}
                  {ag.bank_holder_name && <div className="flex justify-between"><span className="text-slate-500">Holder</span><span className="text-white">{ag.bank_holder_name}</span></div>}
                </div>
              );
            })()}
            {modalMsg && <div className="text-sm mb-4 text-center p-3 rounded-xl bg-slate-800">{modalMsg}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Transaction Reference</label>
                <input value={txnRef} onChange={e => setTxnRef(e.target.value)} placeholder="UPI Ref / UTR Number"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Note (optional)</label>
                <input value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="Any note..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => { setModalMode(null); setSelectedLead(null); setModalMsg(""); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handleMarkPaid} disabled={modalLoading} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl text-sm font-semibold transition-all">
                  {modalLoading ? "Processing..." : "✓ Confirm Paid"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
