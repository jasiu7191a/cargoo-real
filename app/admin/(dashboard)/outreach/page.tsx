"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Send, Users, Mail, Clock, Sparkles, X, Edit3,
  CheckCircle, AlertCircle, Zap
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Lead {
  id: string;
  name: string;
  email: string;
  product: string;
  status: string;
  quantity: number;
  targetPrice?: number | null;
  notes: string | null;
  createdAt: string;
}

interface HistoryItem {
  id: string;
  type: string;
  details: string;
  adminName: string;
  createdAt: string;
}

interface Draft {
  leadId: string;
  leadName: string;
  to: string;
  subject: string;
  body: string;
  product: string;
}

export default function AdminOutreachPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
          <Send size={48} className="text-[#ff5500] animate-bounce" />
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">
            Initializing Outreach HQ
          </h2>
        </div>
      }
    >
      <OutreachContent />
    </Suspense>
  );
}

function OutreachContent() {
  const searchParams = useSearchParams();
  const leadIdParam = searchParams.get("leadId");

  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showOptimize, setShowOptimize] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [generatingDrafts, setGeneratingDrafts] = useState(false);

  const [campaignSegment, setCampaignSegment] = useState("NEW");
  const [preSelectedLead, setPreSelectedLead] = useState<Lead | null>(null);

  const getDisplayName = (name: string) => {
    const cleaned = name.trim();
    if (!cleaned || cleaned === "Anonymous / Web Inquiry") return "there";
    return cleaned.split(/\s+/)[0];
  };

  const buildSpecificDraftBody = (lead: Lead) => {
    const name = getDisplayName(lead.name);
    const quantity = Number.isFinite(lead.quantity) && lead.quantity > 0 ? lead.quantity : 1;
    const targetPrice =
      typeof lead.targetPrice === "number" && Number.isFinite(lead.targetPrice)
        ? `\n\nI also saw your target price is around EUR ${lead.targetPrice.toFixed(2)} per unit, so I will check suppliers against that landed-cost target instead of sending you random catalog pricing.`
        : "";
    const trimmedNotes = lead.notes?.trim() ?? "";
    const notes = trimmedNotes
      ? `\n\nI noted your extra details: "${trimmedNotes.slice(0, 220)}${trimmedNotes.length > 220 ? "..." : ""}". I will use that when filtering factories.`
      : "";

    return `Hello ${name},

I reviewed your Cargoo request for ${quantity}x ${lead.product}. I can check verified China factories for this exact item, compare realistic MOQ/pricing, and estimate the total landed cost before you commit.${targetPrice}${notes}

The useful next step is for me to shortlist 2-3 supplier options with pricing, lead time, and quality-control notes for ${lead.product}.

Would you like me to prepare that quote for you today?

Best regards,
The Cargoo Sourcing Team
cargooimport.eu`;
  };

  useEffect(() => {
    async function fetchLeads() {
      setLoadingLeads(true);
      try {
        const res = await fetch("/api/admin/leads");
        if (res.ok) setLeads(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLeads(false);
      }
    }
    fetchLeads();
  }, []);

  useEffect(() => {
    if (leadIdParam && leads.length > 0) {
      const found = leads.find((l) => l.id === leadIdParam);
      if (found) {
        setPreSelectedLead(found);
        setShowCampaignForm(true);
      }
    }
  }, [leadIdParam, leads]);

  useEffect(() => {
    if (!showHistory) return;
    setLoadingHistory(true);
    fetch("/api/admin/history")
      .then((r) => r.json())
      .then((d) => setHistory(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoadingHistory(false));
  }, [showHistory]);

  const handleGenerateDrafts = async () => {
    setGeneratingDrafts(true);
    try {
      const targets = preSelectedLead
        ? [preSelectedLead]
        : leads
            .filter((l) => campaignSegment === "ALL" ? true : l.status === campaignSegment)
            .slice(0, 5);

      if (targets.length === 0) {
        alert("No leads match this segment.");
        return;
      }

      const generated: Draft[] = targets.map((lead) => ({
        leadId: lead.id,
        leadName: lead.name,
        to: lead.email,
        product: lead.product,
        subject: `Cargoo: Sourcing quote for ${lead.quantity}x ${lead.product}`,
        body: buildSpecificDraftBody(lead),
      }));

      setDrafts((prev) => [...generated, ...prev]);
      setShowCampaignForm(false);
      setPreSelectedLead(null);
      alert(`${generated.length} draft(s) created and added to the queue below.`);
    } finally {
      setGeneratingDrafts(false);
    }
  };

  const optimizedLeads = leads
    .filter((l) => l.status === "NEW")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-10 relative">

      {/* History Modal */}
      {showHistory && (
        <Modal onClose={() => setShowHistory(false)}>
          <h3 className="text-3xl font-black uppercase mb-8 flex items-center gap-3 italic">
            <Clock size={28} className="text-[#ff5500]" /> Outreach Log
          </h3>
          <div className="space-y-6 overflow-y-auto max-h-[50vh] pr-2">
            {loadingHistory ? (
              <p className="text-center text-white/30 uppercase text-xs animate-pulse py-12">
                Loading history...
              </p>
            ) : history.length === 0 ? (
              <p className="text-center text-white/30 italic text-sm py-12">
                No actions recorded yet.
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="border-l-2 border-[#ff5500]/50 pl-6 space-y-1 hover:border-[#ff5500] transition-colors"
                >
                  <p className="text-[10px] font-black uppercase text-[#ff5500]">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm font-bold text-white/90">{item.details}</p>
                  <p className="text-[9px] font-black uppercase text-[#94a3b8]">
                    By: {item.adminName}
                  </p>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setShowHistory(false)}
            className="w-full mt-8 py-4 bg-white/5 rounded-2xl font-black uppercase text-xs hover:bg-white/10 transition-all"
          >
            Close
          </button>
        </Modal>
      )}

      {/* Edit Draft Modal */}
      {editingDraft && (
        <Modal onClose={() => setEditingDraft(null)} wide>
          <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
            <Edit3 size={22} className="text-[#ff5500]" /> Edit Draft
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-[#94a3b8] mb-1 block">To</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ff5500] outline-none"
                value={editingDraft.to}
                onChange={(e) => setEditingDraft({ ...editingDraft, to: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-[#94a3b8] mb-1 block">Subject</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ff5500] outline-none"
                value={editingDraft.subject}
                onChange={(e) => setEditingDraft({ ...editingDraft, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-[#94a3b8] mb-1 block">Message Body</label>
              <textarea
                rows={10}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ff5500] outline-none resize-none font-mono"
                value={editingDraft.body}
                onChange={(e) => setEditingDraft({ ...editingDraft, body: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setEditingDraft(null)}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase text-xs transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setDrafts((prev) =>
                  prev.map((d) => (d.leadId === editingDraft.leadId ? editingDraft : d))
                );
                setEditingDraft(null);
              }}
              className="flex-[2] py-3 bg-[#ff5500] text-black hover:bg-[#ff7700] rounded-xl font-black uppercase text-xs transition-all"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* Optimize Leads Modal */}
      {showOptimize && (
        <Modal onClose={() => setShowOptimize(false)} wide>
          <h3 className="text-2xl font-black uppercase mb-2 flex items-center gap-3">
            <Zap size={22} className="text-[#ff5500]" /> Lead Optimization
          </h3>
          <p className="text-xs text-[#94a3b8] mb-8 uppercase font-bold tracking-widest">
            New leads with highest conversion potential
          </p>
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {optimizedLeads.length === 0 ? (
              <p className="text-center text-white/30 italic py-8">No new leads to optimize.</p>
            ) : (
              optimizedLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-[#ff5500]/30 transition-all"
                >
                  <div>
                    <p className="font-bold text-sm text-white">{lead.name}</p>
                    <p className="text-xs text-[#94a3b8]">
                      {lead.product} • {lead.quantity} units
                    </p>
                    <p className="text-[10px] text-white/30">{lead.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setPreSelectedLead(lead);
                      setShowOptimize(false);
                      setShowCampaignForm(true);
                    }}
                    className="px-4 py-2 bg-[#ff5500] text-black text-xs font-black uppercase rounded-xl hover:bg-[#ff7700] transition-all shrink-0 ml-4"
                  >
                    Target
                  </button>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setShowOptimize(false)}
            className="w-full mt-8 py-3 bg-white/5 rounded-xl font-bold uppercase text-xs hover:bg-white/10 transition-all"
          >
            Close
          </button>
        </Modal>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Outreach HQ</h1>
          <p className="text-[#94a3b8]">
            Targeted, permission-based outreach for resellers and niche partners.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setShowHistory(true)}>
            <Clock size={18} /> History
          </Button>
          <Button
            className="gap-2"
            onClick={() => {
              setPreSelectedLead(null);
              setShowCampaignForm(!showCampaignForm);
            }}
          >
            <Send size={18} /> {showCampaignForm ? "Cancel" : "New Campaign"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Left: High-Value Targets */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
              <Users size={20} className="text-[#ff5500]" /> High-Value Targets
            </h3>
            {loadingLeads ? (
              <p className="text-xs text-white/30 animate-pulse uppercase font-bold">Loading...</p>
            ) : leads.filter((l) => l.status === "NEW").length === 0 ? (
              <p className="text-xs text-white/30 italic">No new leads yet.</p>
            ) : (
              <div className="space-y-3">
                {leads
                  .filter((l) => l.status === "NEW")
                  .slice(0, 5)
                  .map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group"
                      onClick={() => {
                        setPreSelectedLead(lead);
                        setShowCampaignForm(true);
                      }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-bold text-sm group-hover:text-[#ff5500] transition-colors truncate">
                          {lead.name}
                        </div>
                        <span className="text-[10px] font-bold text-[#00c853] shrink-0 ml-2">NEW</span>
                      </div>
                      <div className="text-[10px] uppercase font-black text-[#94a3b8] truncate">
                        {lead.product}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Main Panel */}
        <div className="lg:col-span-3 space-y-8">

          {/* Campaign Form */}
          {showCampaignForm && (
            <div className="glass-panel p-8 border-[#ff5500]/30 shadow-[0_10px_40px_rgba(255,85,0,0.1)] animate-in fade-in slide-in-from-top-4">
              <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                <Send size={20} className="text-[#ff5500]" /> Build Campaign
              </h3>
              <div className="space-y-5">
                {preSelectedLead && (
                  <div className="p-4 bg-[#ff5500]/5 border border-[#ff5500]/20 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#ff5500] mb-1">
                        Direct Target Locked
                      </p>
                      <p className="text-sm font-bold">{preSelectedLead.name}</p>
                      <p className="text-xs text-[#94a3b8]">
                        {preSelectedLead.product} • {preSelectedLead.email}
                      </p>
                    </div>
                    <button
                      onClick={() => setPreSelectedLead(null)}
                      className="p-2 hover:bg-white/10 rounded-full transition-all text-[#94a3b8]"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {!preSelectedLead && (
                  <div>
                    <label className="text-xs font-black uppercase text-[#94a3b8] mb-2 block">
                      Target Segment
                    </label>
                    <select
                      value={campaignSegment}
                      onChange={(e) => setCampaignSegment(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ff5500] outline-none"
                    >
                      <option value="NEW">New Leads (Status = NEW)</option>
                      <option value="PROCESSING">Processing Leads</option>
                      <option value="ALL">All Leads</option>
                    </select>
                    <p className="text-xs text-[#94a3b8] mt-2">
                      {leads.filter((l) =>
                        campaignSegment === "ALL" ? true : l.status === campaignSegment
                      ).length}{" "}
                      leads match this segment
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  glow
                  onClick={handleGenerateDrafts}
                  disabled={generatingDrafts}
                >
                  {generatingDrafts ? "Generating Drafts..." : "Generate Email Drafts"}
                </Button>
              </div>
            </div>
          )}

          {/* Drafts Queue */}
          <div className="glass-panel p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold uppercase">Pending Approval Queue</h3>
              <span className="text-[10px] font-black uppercase bg-[#ff5500]/10 text-[#ff5500] px-3 py-1 rounded-full">
                {drafts.length} Draft{drafts.length !== 1 ? "s" : ""}
              </span>
            </div>

            {drafts.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Mail size={32} className="text-white/10 mx-auto" />
                <p className="text-white/30 italic text-sm">
                  No drafts yet. Create a campaign above to generate emails.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {drafts.map((draft) => (
                  <OutreachDraftItem
                    key={draft.leadId}
                    draft={draft}
                    onEdit={() => setEditingDraft(draft)}
                    onSent={() =>
                      setDrafts((prev) => prev.filter((d) => d.leadId !== draft.leadId))
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Optimize Leads CTA */}
          <div className="glass-panel p-10 bg-gradient-to-br from-[#2962ff]/5 to-transparent flex items-center justify-between">
            <div className="max-w-[500px]">
              <h4 className="text-2xl font-black uppercase mb-4 italic">Optimize Leads</h4>
              <p className="text-[#94a3b8] text-sm font-medium">
                Surfaces your highest-potential new leads sorted by recency. Pick a target and
                generate a personalized outreach draft in one click.
              </p>
            </div>
            <Button size="lg" glow onClick={() => setShowOptimize(true)}>
              <Sparkles size={18} /> Optimize Leads
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutreachDraftItem({
  draft,
  onEdit,
  onSent,
}: {
  draft: Draft;
  onEdit: () => void;
  onSent: () => void;
}) {
  const [status, setStatus] = useState<"IDLE" | "SENDING" | "SENT" | "ERROR">("IDLE");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async () => {
    setStatus("SENDING");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: draft.to,
          subject: draft.subject,
          leadName: draft.leadName,
          productName: draft.product,
          personalizedSnippet: draft.body,
        }),
      });

      if (res.ok) {
        setStatus("SENT");
        setTimeout(onSent, 1500);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Send failed");
        setStatus("ERROR");
      }
    } catch (e: any) {
      setErrorMsg(e.message);
      setStatus("ERROR");
    }
  };

  return (
    <div
      className={`bg-white/5 border rounded-2xl p-6 transition-all ${
        status === "SENT"
          ? "opacity-40 border-green-500/20"
          : status === "ERROR"
          ? "border-red-500/30"
          : "border-white/10 hover:bg-white/[0.08]"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-[#ff5500]/10 text-[#ff5500] rounded-xl flex items-center justify-center shrink-0">
            {status === "SENT" ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : status === "ERROR" ? (
              <AlertCircle size={20} className="text-red-500" />
            ) : (
              <Mail size={20} />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">{draft.to}</div>
            <div className="text-sm font-black text-[#ff5500] uppercase tracking-tighter italic truncate">
              {draft.subject}
            </div>
          </div>
        </div>

        <div className="flex gap-2 shrink-0 ml-4">
          <button
            onClick={onEdit}
            disabled={status !== "IDLE"}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold uppercase transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            <Edit3 size={12} /> Edit Draft
          </button>
          <button
            onClick={handleSend}
            disabled={status !== "IDLE"}
            className={`px-4 py-2 text-xs font-black uppercase rounded-full transition-all flex items-center gap-1.5 ${
              status === "IDLE"
                ? "bg-[#ff5500] text-black hover:scale-105 active:scale-95"
                : status === "SENT"
                ? "bg-green-500 text-black"
                : status === "ERROR"
                ? "bg-red-500 text-white"
                : "bg-zinc-600 text-white"
            }`}
          >
            <Send size={12} />
            {status === "IDLE"
              ? "Send Now"
              : status === "SENDING"
              ? "Sending..."
              : status === "SENT"
              ? "Dispatched"
              : "Failed"}
          </button>
        </div>
      </div>

      <p className="text-xs text-[#94a3b8] italic line-clamp-2">
        "{draft.body.slice(0, 120)}..."
      </p>

      {status === "ERROR" && (
        <p className="text-xs text-red-400 mt-3 font-bold">{errorMsg}</p>
      )}
    </div>
  );
}

function Modal({
  children,
  onClose,
  wide = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className={`bg-[#0a0a0a] border border-white/10 p-10 rounded-[40px] w-full shadow-2xl relative overflow-hidden ${
          wide ? "max-w-2xl" : "max-w-xl"
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff5500] to-transparent" />
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-[#94a3b8] hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
}
