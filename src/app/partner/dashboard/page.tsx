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
  owner_name?: string; owner_number?: number;
}
interface Stats {
  totalLeads: number; converted: number; pending: number;
  totalCommission: number; totalPaid: number; pendingPayout: number;
}

export default function PartnerDashboard() {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "payment">("overview");
  const [showAddLead, setShowAddLead] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadName, setLeadName] = useState("");
  const [addLeadLoading, setAddLeadLoading] = useState(false);
  const [addLeadMsg, setAddLeadMsg] = useState<{type: "success"|"error", text: string} | null>(null);
  const [copied, setCopied] = useState(false);
  // Payment details edit
  const [editingPayment, setEditingPayment] = useState(false);
  const [payForm, setPayForm] = useState({ upi_id: "", bank_holder_name: "", bank_account: "", bank_ifsc: "", bank_name: "" });
  const [payLoading, setPayLoading] = useState(false);
  const [payMsg, setPayMsg] = useState("");

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
      const dashRes = await fetch("/api/partner/dashboard");
      const dashData = await dashRes.json();
      if (dashData.leads) setLeads(dashData.leads);
      if (dashData.stats) setStats(dashData.stats);
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
        body: JSON.stringify({ prospect_email: leadEmail, prospect_name: leadName })
      });
      const data = await res.json();
      if (!res.ok) { setAddLeadMsg({ type: "error", text: data.error }); return; }
      setAddLeadMsg({ type: "success", text: "Lead added! They will show here once they register & pay." });
      setLeadEmail(""); setLeadName("");
      // Refresh
      const dashRes = await fetch("/api/partner/dashboard");
      const dashData = await dashRes.json();
      if (dashData.leads) setLeads(dashData.leads);
      if (dashData.stats) setStats(dashData.stats);
    } catch { setAddLeadMsg({ type: "error", text: "Something went wrong" }); }
    finally { setAddLeadLoading(false); }
  }

  async function handleSavePayment() {
    setPayLoading(true); setPayMsg("");
    try {
      const res = await fetch("/api/partner/update-payment", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payForm)
      });
      if (res.ok) { setPayMsg("✅ Payment details saved!"); setEditingPayment(false); }
      else setPayMsg("❌ Failed to save");
    } catch { setPayMsg("❌ Something went wrong"); }
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

  const statusColor = (s: string) => {
    if (s === "onboarded") return "text-green-400 bg-green-400/10";
    if (s === "pending") return "text-yellow-400 bg-yellow-400/10";
    if (s === "lost") return "text-red-400 bg-red-400/10";
    return "text-slate-400 bg-slate-400/10";
  };

  const payStatusColor = (s: string) => s === "paid" ? "text-green-400 bg-green-400/10" : "text-orange-400 bg-orange-400/10";

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-sm">
              {agent?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-sm">{agent?.name}</div>
              <div className="text-xs text-slate-400">Partner Dashboard</div>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white text-sm transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Referral Code Banner */}
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-orange-400 font-medium mb-1">Your Referral Code</p>
            <p className="text-3xl font-black tracking-widest text-white">{agent?.referralCode}</p>
            <p className="text-sm text-slate-400 mt-1">Share with prospects when they ask which partner referred them</p>
          </div>
          <button onClick={copyCode}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold transition-all whitespace-nowrap">
            {copied ? "✓ Copied!" : "Copy Code"}
          </button>
        </div>

        {/* Add Lead Button */}
        <div className="mb-6 flex justify-end">
          <button onClick={() => { setShowAddLead(true); setAddLeadMsg(null); }}
            className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/20">
            <span className="text-xl font-light">+</span> Add New Lead
          </button>
        </div>

        {/* Add Lead Modal */}
        {showAddLead && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md">
              <h3 className="text-xl font-bold mb-1">Add New Lead</h3>
              <p className="text-slate-400 text-sm mb-6">Enter the prospect's details to register them under your account.</p>
              {addLeadMsg && (
                <div className={`rounded-xl p-4 mb-4 text-sm ${addLeadMsg.type === "success" ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                  {addLeadMsg.text}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Prospect Name</label>
                  <input value={leadName} onChange={e => setLeadName(e.target.value)}
                    placeholder="Hotel owner name" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Email Address *</label>
                  <input type="email" value={leadEmail} onChange={e => setLeadEmail(e.target.value)}
                    placeholder="owner@hotel.com" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setShowAddLead(false); setAddLeadMsg(null); setLeadEmail(""); setLeadName(""); }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors">Cancel</button>
                  <button onClick={handleAddLead} disabled={addLeadLoading || !leadEmail.trim()}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl font-medium transition-colors">
                    {addLeadLoading ? "Adding..." : "Add Lead"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-8 w-fit">
          {(["overview", "leads", "payment"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>
              {tab === "payment" ? "Payment Details" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Leads", value: stats?.totalLeads || 0, color: "text-blue-400" },
                { label: "Converted", value: stats?.converted || 0, color: "text-green-400" },
                { label: "Total Commission", value: `₹${(stats?.totalCommission || 0).toLocaleString("en-IN")}`, color: "text-orange-400" },
                { label: "Pending Payout", value: `₹${(stats?.pendingPayout || 0).toLocaleString("en-IN")}`, color: "text-yellow-400" },
              ].map((s, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
                  <div className="text-slate-400 text-sm">{s.label}</div>
                </div>
              ))}
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <div className="text-5xl mb-4">🎯</div>
                <div className="text-lg font-medium mb-2">No leads yet</div>
                <div className="text-sm">Click "Add New Lead" to start referring property owners</div>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.slice(0, 5).map(lead => (
                  <div key={lead.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{lead.prospect_name || lead.prospect_email}</div>
                      <div className="text-sm text-slate-400">{lead.prospect_email}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize ${statusColor(lead.status)}`}>{lead.status}</span>
                      {lead.commission_amount > 0 && (
                        <span className="text-sm font-semibold text-orange-400">₹{lead.commission_amount.toLocaleString("en-IN")}</span>
                      )}
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${payStatusColor(lead.payment_status)}`}>{lead.payment_status}</span>
                    </div>
                  </div>
                ))}
                {leads.length > 5 && (
                  <button onClick={() => setActiveTab("leads")} className="w-full text-center text-orange-400 hover:text-orange-300 text-sm py-3 transition-colors">
                    View all {leads.length} leads →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <div>
            {leads.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <div className="text-5xl mb-4">🎯</div>
                <div className="text-lg font-medium">No leads yet</div>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map(lead => (
                  <div key={lead.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="font-semibold text-white">{lead.prospect_name || "—"}</div>
                        <div className="text-sm text-slate-400 mt-0.5">{lead.prospect_email}</div>
                        <div className="text-xs text-slate-500 mt-1">Added {new Date(lead.created_at).toLocaleDateString("en-IN")}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize ${statusColor(lead.status)}`}>{lead.status}</span>
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${payStatusColor(lead.payment_status)}`}>
                          {lead.payment_status === "paid" ? "✓ Paid" : "Payout Pending"}
                        </span>
                      </div>
                    </div>
                    {lead.status === "onboarded" && (
                      <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div><div className="text-xs text-slate-500">Plan</div><div className="text-sm font-medium capitalize">{lead.plan_name || "—"}</div></div>
                        <div><div className="text-xs text-slate-500">Plan Amount</div><div className="text-sm font-medium">₹{lead.plan_amount?.toLocaleString("en-IN") || "—"}</div></div>
                        <div><div className="text-xs text-slate-500">Commission</div><div className="text-sm font-medium text-orange-400">₹{lead.commission_amount?.toLocaleString("en-IN") || "—"}</div></div>
                        <div><div className="text-xs text-slate-500">Onboarded</div><div className="text-sm font-medium">{lead.onboarded_at ? new Date(lead.onboarded_at).toLocaleDateString("en-IN") : "—"}</div></div>
                      </div>
                    )}
                    {lead.payment_status === "paid" && lead.paid_at && (
                      <div className="mt-2 text-xs text-green-400">✓ Commission paid on {new Date(lead.paid_at).toLocaleDateString("en-IN")}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === "payment" && (
          <div className="max-w-lg">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-lg">Earnings Summary</h3>
                  <p className="text-slate-400 text-sm">Your commission overview</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center"><div className="text-xl font-bold text-orange-400">₹{(agent?.totalEarnings || 0).toLocaleString("en-IN")}</div><div className="text-xs text-slate-400 mt-1">Total Earned</div></div>
                <div className="text-center"><div className="text-xl font-bold text-green-400">₹{(agent?.totalPaid || 0).toLocaleString("en-IN")}</div><div className="text-xs text-slate-400 mt-1">Received</div></div>
                <div className="text-center"><div className="text-xl font-bold text-yellow-400">₹{(agent?.pendingAmount || 0).toLocaleString("en-IN")}</div><div className="text-xs text-slate-400 mt-1">Pending</div></div>
              </div>
              {(agent?.pendingAmount || 0) > 0 && (
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-sm text-yellow-400 text-center">
                  ⚡ Payment will be processed within 24 hours of commission approval
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-lg">Payment Details</h3>
                  <p className="text-slate-400 text-sm">Where we send your commission</p>
                </div>
                {!editingPayment && (
                  <button onClick={() => setEditingPayment(true)} className="text-orange-400 hover:text-orange-300 text-sm transition-colors">Edit</button>
                )}
              </div>

              {payMsg && <div className="text-sm mb-4 text-center">{payMsg}</div>}

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">UPI ID</label>
                  {editingPayment ? (
                    <input value={payForm.upi_id} onChange={e => setPayForm({...payForm, upi_id: e.target.value})}
                      placeholder="yourname@upi" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                  ) : (
                    <div className="text-white">{agent?.upiId || <span className="text-slate-500">Not set</span>}</div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Account Holder</label>
                    {editingPayment ? (
                      <input value={payForm.bank_holder_name} onChange={e => setPayForm({...payForm, bank_holder_name: e.target.value})}
                        placeholder="Full name" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                    ) : (
                      <div className="text-white">{agent?.bankHolderName || <span className="text-slate-500">Not set</span>}</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Bank Name</label>
                    {editingPayment ? (
                      <input value={payForm.bank_name} onChange={e => setPayForm({...payForm, bank_name: e.target.value})}
                        placeholder="SBI / HDFC" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                    ) : (
                      <div className="text-white">{agent?.bankName || <span className="text-slate-500">Not set</span>}</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Account Number</label>
                    {editingPayment ? (
                      <input value={payForm.bank_account} onChange={e => setPayForm({...payForm, bank_account: e.target.value})}
                        placeholder="1234567890" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                    ) : (
                      <div className="text-white">{agent?.bankAccount ? `****${agent.bankAccount.slice(-4)}` : <span className="text-slate-500">Not set</span>}</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">IFSC Code</label>
                    {editingPayment ? (
                      <input value={payForm.bank_ifsc} onChange={e => setPayForm({...payForm, bank_ifsc: e.target.value})}
                        placeholder="SBIN0001234" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors" />
                    ) : (
                      <div className="text-white">{agent?.bankIfsc || <span className="text-slate-500">Not set</span>}</div>
                    )}
                  </div>
                </div>
                {editingPayment && (
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setEditingPayment(false); setPayMsg(""); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors">Cancel</button>
                    <button onClick={handleSavePayment} disabled={payLoading} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl font-medium transition-colors">
                      {payLoading ? "Saving..." : "Save Details"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
