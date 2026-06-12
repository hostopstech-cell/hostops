"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Agent {
  id: number; name: string; email: string; phone: string; referral_code: string;
  upi_id?: string; bank_account?: string; bank_ifsc?: string; bank_name?: string; bank_holder_name?: string;
  total_leads: number; converted_leads: number; total_commission: number; paid_commission: number; is_active: boolean;
}
interface Lead {
  id: number; agent_id: number; prospect_email: string; prospect_name?: string;
  status: string; payment_status: string; plan_name?: string; plan_amount: number;
  billing_type?: string; commission_percent: number; commission_amount: number;
  created_at: string; onboarded_at?: string; paid_at?: string; payment_note?: string;
  agent_name: string; referral_code: string; owner_name?: string; owner_number?: number;
}

export default function AdminReferrals() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "agents">("overview");
  const [filterAgent, setFilterAgent] = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalMode, setModalMode] = useState<"commission" | "paid" | null>(null);
  // Commission modal
  const [commPercent, setCommPercent] = useState("");
  const [commAmount, setCommAmount] = useState("");
  // Paid modal
  const [txnRef, setTxnRef] = useState("");
  const [payNote, setPayNote] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  async function loadData() {
    const res = await fetch("/api/admin/referrals");
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setAgents(data.agents || []);
    setLeads(data.leads || []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleSetCommission() {
    if (!selectedLead) return;
    setModalLoading(true); setModalMsg("");
    const res = await fetch("/api/admin/referrals/update-commission", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: selectedLead.id, commission_percent: parseFloat(commPercent) || 0, commission_amount: parseFloat(commAmount) || 0 })
    });
    const data = await res.json();
    if (res.ok) { setModalMsg("✅ Commission updated!"); await loadData(); setTimeout(() => { setModalMode(null); setSelectedLead(null); setModalMsg(""); }, 1000); }
    else setModalMsg("❌ " + data.error);
    setModalLoading(false);
  }

  async function handleMarkPaid() {
    if (!selectedLead) return;
    setModalLoading(true); setModalMsg("");
    const res = await fetch("/api/admin/referrals/mark-paid", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: selectedLead.id, transaction_ref: txnRef, note: payNote, commission_amount: selectedLead.commission_amount })
    });
    const data = await res.json();
    if (res.ok) { setModalMsg("✅ Marked as paid!"); await loadData(); setTimeout(() => { setModalMode(null); setSelectedLead(null); setModalMsg(""); setTxnRef(""); setPayNote(""); }, 1000); }
    else setModalMsg("❌ " + data.error);
    setModalLoading(false);
  }

  const filteredLeads = leads.filter(l => {
    if (filterAgent !== "all" && l.agent_id !== filterAgent) return false;
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    return true;
  });

  const totalCommission = leads.reduce((a, l) => a + (parseFloat(String(l.commission_amount)) || 0), 0);
  const totalPaid = leads.filter(l => l.payment_status === "paid").reduce((a, l) => a + (parseFloat(String(l.commission_amount)) || 0), 0);
  const totalPending = totalCommission - totalPaid;
  const totalConverted = leads.filter(l => l.status === "onboarded").length;

  const statusColor = (s: string) => {
    if (s === "onboarded") return "text-green-400 bg-green-400/10 border border-green-400/20";
    if (s === "pending") return "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20";
    return "text-slate-400 bg-slate-400/10 border border-slate-400/20";
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => router.push("/dashboard")} className="text-slate-400 hover:text-white text-sm transition-colors">← Dashboard</button>
              <span className="text-slate-700">|</span>
              <span className="text-orange-500 font-semibold text-sm">Admin</span>
            </div>
            <h1 className="text-2xl font-bold">Referral Program</h1>
          </div>
          <button onClick={loadData} className="text-slate-400 hover:text-white text-sm transition-colors">↻ Refresh</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Partners", value: agents.length, color: "text-blue-400" },
            { label: "Total Leads", value: leads.length, color: "text-slate-300" },
            { label: "Converted", value: totalConverted, color: "text-green-400" },
            { label: "Total Commission", value: `₹${totalCommission.toLocaleString("en-IN")}`, color: "text-orange-400" },
            { label: "Pending Payout", value: `₹${totalPending.toLocaleString("en-IN")}`, color: "text-yellow-400" },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className={`text-xl font-bold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 w-fit">
          {(["overview", "leads", "agents"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold mb-4">Recent Activity — Onboarded Leads Needing Commission</h2>
            {leads.filter(l => l.status === "onboarded" && l.commission_amount === 0).length === 0 && (
              <div className="text-center py-10 text-slate-500">No leads pending commission setup</div>
            )}
            {leads.filter(l => l.status === "onboarded" && l.commission_amount === 0).map(lead => (
              <div key={lead.id} className="bg-slate-900 border border-orange-500/20 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-semibold">{lead.owner_name || lead.prospect_name || "—"}</div>
                  <div className="text-sm text-slate-400">{lead.prospect_email} • Agent: {lead.agent_name} ({lead.referral_code})</div>
                  <div className="text-sm text-slate-500">Plan: <span className="text-white capitalize">{lead.plan_name}</span> • ₹{parseFloat(String(lead.plan_amount)).toLocaleString("en-IN")}</div>
                </div>
                <button onClick={() => { setSelectedLead(lead); setModalMode("commission"); setCommPercent(""); setCommAmount(""); setModalMsg(""); }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium transition-colors">
                  Set Commission
                </button>
              </div>
            ))}

            <h2 className="text-lg font-semibold mt-8 mb-4">Pending Payouts</h2>
            {leads.filter(l => l.commission_amount > 0 && l.payment_status !== "paid").length === 0 && (
              <div className="text-center py-10 text-slate-500">No pending payouts</div>
            )}
            {leads.filter(l => l.commission_amount > 0 && l.payment_status !== "paid").map(lead => (
              <div key={lead.id} className="bg-slate-900 border border-yellow-500/20 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-semibold">{lead.owner_name || lead.prospect_name}</div>
                  <div className="text-sm text-slate-400">Agent: {lead.agent_name}</div>
                  <div className="text-sm">Commission: <span className="text-orange-400 font-semibold">₹{parseFloat(String(lead.commission_amount)).toLocaleString("en-IN")}</span></div>
                  {/* Payment details */}
                  {agents.find(a => a.id === lead.agent_id)?.upi_id && (
                    <div className="text-xs text-slate-500 mt-1">UPI: {agents.find(a => a.id === lead.agent_id)?.upi_id}</div>
                  )}
                  {agents.find(a => a.id === lead.agent_id)?.bank_account && (
                    <div className="text-xs text-slate-500">Bank: {agents.find(a => a.id === lead.agent_id)?.bank_name} • {agents.find(a => a.id === lead.agent_id)?.bank_account}</div>
                  )}
                </div>
                <button onClick={() => { setSelectedLead(lead); setModalMode("paid"); setTxnRef(""); setPayNote(""); setModalMsg(""); }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors">
                  Mark as Paid ✓
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <div>
            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
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
              <div className="text-slate-400 text-sm self-center">{filteredLeads.length} leads</div>
            </div>

            <div className="space-y-3">
              {filteredLeads.map(lead => (
                <div key={lead.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{lead.owner_name || lead.prospect_name || "—"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${statusColor(lead.status)}`}>{lead.status}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${lead.payment_status === "paid" ? "text-green-400 bg-green-400/10 border border-green-400/20" : "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20"}`}>
                          {lead.payment_status === "paid" ? "✓ Paid" : "Unpaid"}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 mt-1">{lead.prospect_email}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Agent: <span className="text-slate-300">{lead.agent_name}</span> ({lead.referral_code}) •
                        Added: {new Date(lead.created_at).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {lead.status === "onboarded" && lead.commission_amount === 0 && (
                        <button onClick={() => { setSelectedLead(lead); setModalMode("commission"); setCommPercent(""); setCommAmount(String(lead.plan_amount * 0.1)); setModalMsg(""); }}
                          className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 rounded-lg text-xs font-medium transition-colors">
                          Set Commission
                        </button>
                      )}
                      {lead.commission_amount > 0 && lead.payment_status !== "paid" && (
                        <button onClick={() => { setSelectedLead(lead); setModalMode("paid"); setTxnRef(""); setPayNote(""); setModalMsg(""); }}
                          className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg text-xs font-medium transition-colors">
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                  {lead.status === "onboarded" && (
                    <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div><span className="text-slate-500 text-xs">Plan</span><div className="capitalize">{lead.plan_name || "—"}</div></div>
                      <div><span className="text-slate-500 text-xs">Amount</span><div>₹{parseFloat(String(lead.plan_amount)).toLocaleString("en-IN")}</div></div>
                      <div><span className="text-slate-500 text-xs">Commission %</span><div>{lead.commission_percent || "—"}%</div></div>
                      <div><span className="text-slate-500 text-xs">Commission ₹</span><div className="text-orange-400 font-semibold">₹{parseFloat(String(lead.commission_amount)).toLocaleString("en-IN") || "—"}</div></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === "agents" && (
          <div className="space-y-4">
            {agents.map(agent => (
              <div key={agent.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center font-bold text-orange-400 text-sm">{agent.name[0]}</div>
                      <div>
                        <div className="font-semibold">{agent.name}</div>
                        <div className="text-sm text-slate-400">{agent.email} • {agent.phone}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-center">
                    <div className="text-xs text-slate-400">Referral Code</div>
                    <div className="font-mono font-bold text-orange-400">{agent.referral_code}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center"><div className="text-lg font-bold">{agent.total_leads}</div><div className="text-xs text-slate-400">Leads</div></div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center"><div className="text-lg font-bold text-green-400">{agent.converted_leads}</div><div className="text-xs text-slate-400">Converted</div></div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center"><div className="text-lg font-bold text-orange-400">₹{parseFloat(String(agent.total_commission)).toLocaleString("en-IN")}</div><div className="text-xs text-slate-400">Commission</div></div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center"><div className="text-lg font-bold text-yellow-400">₹{(parseFloat(String(agent.total_commission)) - parseFloat(String(agent.paid_commission))).toLocaleString("en-IN")}</div><div className="text-xs text-slate-400">Pending</div></div>
                </div>
                {/* Payment Details */}
                <div className="border-t border-slate-800 pt-4">
                  <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Payment Details</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div><span className="text-slate-500 text-xs">UPI</span><div>{agent.upi_id || <span className="text-slate-600">Not set</span>}</div></div>
                    <div><span className="text-slate-500 text-xs">Account Holder</span><div>{agent.bank_holder_name || <span className="text-slate-600">Not set</span>}</div></div>
                    <div><span className="text-slate-500 text-xs">Bank</span><div>{agent.bank_name || <span className="text-slate-600">Not set</span>}</div></div>
                    <div><span className="text-slate-500 text-xs">Account No.</span><div>{agent.bank_account || <span className="text-slate-600">Not set</span>}</div></div>
                    <div><span className="text-slate-500 text-xs">IFSC</span><div>{agent.bank_ifsc || <span className="text-slate-600">Not set</span>}</div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commission Modal */}
      {modalMode === "commission" && selectedLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-1">Set Commission</h3>
            <p className="text-slate-400 text-sm mb-2">For: <span className="text-white">{selectedLead.owner_name || selectedLead.prospect_name}</span></p>
            <p className="text-slate-400 text-sm mb-6">Agent: <span className="text-white">{selectedLead.agent_name}</span> • Plan: <span className="text-orange-400 capitalize">₹{parseFloat(String(selectedLead.plan_amount)).toLocaleString("en-IN")}</span></p>
            {modalMsg && <div className="text-sm mb-4 text-center">{modalMsg}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Commission % (optional)</label>
                <input type="number" value={commPercent} onChange={e => { setCommPercent(e.target.value); if (selectedLead.plan_amount && e.target.value) setCommAmount(String((selectedLead.plan_amount * parseFloat(e.target.value)) / 100)); }}
                  placeholder="e.g. 10" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Commission Amount (₹) *</label>
                <input type="number" value={commAmount} onChange={e => setCommAmount(e.target.value)}
                  placeholder="e.g. 500" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setModalMode(null); setSelectedLead(null); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors">Cancel</button>
                <button onClick={handleSetCommission} disabled={modalLoading || !commAmount} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-xl font-medium transition-colors">
                  {modalLoading ? "Saving..." : "Save Commission"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {modalMode === "paid" && selectedLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-1">Mark Commission as Paid</h3>
            <p className="text-slate-400 text-sm mb-2">Agent: <span className="text-white">{selectedLead.agent_name}</span></p>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
              <div className="text-sm text-slate-400">Amount to Pay</div>
              <div className="text-2xl font-bold text-orange-400">₹{parseFloat(String(selectedLead.commission_amount)).toLocaleString("en-IN")}</div>
            </div>
            {/* Agent payment info */}
            {agents.find(a => a.id === selectedLead.agent_id) && (
              <div className="bg-slate-800 rounded-xl p-4 mb-6 text-sm space-y-1">
                {agents.find(a => a.id === selectedLead.agent_id)?.upi_id && <div>UPI: <span className="text-white font-medium">{agents.find(a => a.id === selectedLead.agent_id)?.upi_id}</span></div>}
                {agents.find(a => a.id === selectedLead.agent_id)?.bank_account && <div>Bank: <span className="text-white">{agents.find(a => a.id === selectedLead.agent_id)?.bank_name}</span> • Acc: <span className="text-white">{agents.find(a => a.id === selectedLead.agent_id)?.bank_account}</span></div>}
                {agents.find(a => a.id === selectedLead.agent_id)?.bank_ifsc && <div>IFSC: <span className="text-white">{agents.find(a => a.id === selectedLead.agent_id)?.bank_ifsc}</span></div>}
              </div>
            )}
            {modalMsg && <div className="text-sm mb-4 text-center">{modalMsg}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Transaction Reference</label>
                <input value={txnRef} onChange={e => setTxnRef(e.target.value)} placeholder="UPI Ref / UTR Number" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Note (optional)</label>
                <input value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="Any note..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setModalMode(null); setSelectedLead(null); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors">Cancel</button>
                <button onClick={handleMarkPaid} disabled={modalLoading} className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl font-medium transition-colors">
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
