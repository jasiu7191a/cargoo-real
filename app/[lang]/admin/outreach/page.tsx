"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Send, Users, Mail, CheckCircle, Search, Clock, Zap, ShoppingBag, Laptop, Smartphone } from "lucide-react";

interface Lead {
  id: string;
  productName: string;
  quantity: number;
  status: string;
  niche: string; // FASHION, TECH, ACCESSORIES, GENERAL
  createdAt: string;
  user: {
    email: string;
  };
}

export default function AdminOutreachPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (activeTab === "ALL") {
      setFilteredLeads(leads);
    } else {
      setFilteredLeads(leads.filter(l => l.niche === activeTab));
    }
  }, [activeTab, leads]);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/admin/outreach");
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeads(data);
        setFilteredLeads(data);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const getSmartScript = (lead: Lead) => {
    switch (lead.niche) {
      case "FASHION":
        return `Yo! Spotted your request for ${lead.productName}. \n\nAs your plug in China, I've got direct access to the Tier-1 factories. We're talking hype quality without the middleman tax. \n\nI'm checking a few batches today to make sure the quality/authenticity is 1:1 before I send you a quote. What's your target price for this?\n\nBest,\nThe Cargoo Team`;
      case "TECH":
        return `Regarding your inquiry for ${lead.productName}. \n\nI'm currently verifying the batch certifications (CE/RoHS) and checking defect rates with the factory. We source these direct-from-line to keep your costs at the absolute minimum.\n\nExpect a full landed-cost estimate in your inbox within 24 hours.\n\nBest,\nThe Cargoo Team`;
      case "ACCESSORIES":
        return `Checking the specs on those ${lead.productName} for you. \n\nWe have a massive network for accessories and we can even handle custom branding/packaging at the source if you're looking to scale your brand.\n\nI'll have the best factory-direct options ready for you by tomorrow.\n\nBest,\nThe Cargoo Team`;
      default:
        return `Hello! I'm looking into your sourcing request for ${lead.productName}.\n\nI've already contacted a few of our verified suppliers in China, and I'll have a total landed cost estimate for you shortly.\n\nBest regards,\nThe Cargoo Team`;
    }
  };

  const startDraft = (lead: Lead) => {
    setActiveLead(lead);
    setMessage(getSmartScript(lead));
  };

  const sendResponse = async () => {
    if (!activeLead || !message) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: activeLead.id,
          message: message,
          subject: leadNicheSubject(activeLead)
        })
      });

      if (res.ok) {
        setLeads(leads.filter(l => l.id !== activeLead.id));
        setActiveLead(null);
        setMessage("");
        alert("Outreach email sent successfully!");
      }
    } catch (e) {
      alert("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const leadNicheSubject = (lead: Lead) => {
    if (lead.niche === "FASHION") return `Straight from Factory: Your ${lead.productName} (Cargoo)`;
    if (lead.niche === "TECH") return `Tech Verified: Sourcing ${lead.productName} for you`;
    return `Helping you source ${lead.productName} (Cargoo)`;
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Outreach HQ</h1>
          <p className="text-[#94a3b8]">Priority access for Fashion, Tech and Accessories.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
           {["ALL", "FASHION", "TECH", "ACCESSORIES"].map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeTab === tab ? "bg-[#ff5500] text-black shadow-lg" : "text-[#94a3b8] hover:text-white"
               }`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="glass-panel p-8">
              <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
                <Users size={20} className="text-[#ff5500]" /> {activeTab !== "ALL" ? activeTab : "Pending"} Leads
              </h3>
              
              {loading ? (
                <div className="space-y-4 animate-pulse">
                   {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
                </div>
              ) : filteredLeads.length === 0 ? (
                <p className="text-xs text-[#94a3b8] font-bold uppercase">No pending {activeTab.toLowerCase()} leads.</p>
              ) : (
                <div className="space-y-4">
                  {filteredLeads.map((lead) => (
                    <button 
                      key={lead.id} 
                      onClick={() => startDraft(lead)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        activeLead?.id === lead.id 
                          ? "bg-[#ff5500]/10 border-[#ff5500]" 
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <div className="font-bold text-sm truncate max-w-[120px]">{lead.productName}</div>
                         <NicheBadge niche={lead.niche} />
                      </div>
                      <div className="text-[10px] uppercase font-black text-[#94a3b8] truncate">{lead.user?.email || "No Email"}</div>
                    </button>
                  ))}
                </div>
              )}
           </div>
        </div>

        <div className="lg:col-span-3">
           {activeLead ? (
              <div className="glass-panel p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#ff5500] rounded-2xl flex items-center justify-center text-black">
                         <Zap size={24} />
                      </div>
                      <div>
                         <h3 className="text-xl font-bold uppercase leading-tight">Drafting {activeLead.niche || "General"} Outreach</h3>
                         <p className="text-xs text-[#94a3b8] font-bold uppercase">Target: {activeLead.user?.email || "No Email"}</p>
                      </div>
                   </div>
                   <Button variant="outline" size="sm" onClick={() => setActiveLead(null)}>Cancel</Button>
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between items-end mb-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Personality Script (Overseas Plug)</label>
                      <span className="text-[10px] font-bold text-[#ff5500] bg-[#ff5500]/10 px-2 py-1 rounded-md">Smart-Autofill Active</span>
                   </div>
                   <textarea 
                     value={message}
                     onChange={(e) => setMessage(e.target.value)}
                     className="w-full h-72 bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm leading-relaxed focus:outline-none focus:border-[#ff5500] transition-all font-medium"
                   />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                   <Button 
                     size="lg" 
                     className="bg-[#ff5500] hover:bg-[#ff7700] gap-3 px-10"
                     onClick={sendResponse}
                     isLoading={sending}
                     glow
                   >
                     <Send size={18} /> Send Niche Response
                   </Button>
                </div>
              </div>
           ) : (
              <div className="glass-panel p-20 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-white/5 opacity-50">
                 <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-[#94a3b8] border border-white/10">
                    {activeTab === "FASHION" ? <ShoppingBag size={48} /> : activeTab === "TECH" ? <Laptop size={48} /> : <Mail size={48} />}
                 </div>
                 <div>
                    <h3 className="text-2xl font-black uppercase mb-2">Select a Lead to Pilot</h3>
                    <p className="text-[#94a3b8] max-w-[400px] font-medium leading-relaxed">
                      You're currently viewing {activeTab.toLowerCase()} inquiries. Pick a request to fire your specialized factory-direct script.
                    </p>
                 </div>
              </div>
           )}

           <div className="mt-8 glass-panel p-10 bg-gradient-to-br from-[#2962ff]/5 to-transparent border-[#2962ff]/20 flex items-center justify-between">
              <div className="max-w-[550px]">
                 <h4 className="text-2xl font-black uppercase mb-4 flex items-center gap-3">
                   <Zap className="text-[#ff5500]" /> Niche Authority
                 </h4>
                 <p className="text-[#94a3b8] text-sm leading-relaxed font-medium">
                   We prioritize **Fashion first** to capture the hype market. These scripts are crafted to emphasize Tier-1 factory access, defect testing, and premium shipping routes.
                 </p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#ff5500] mb-1">Success Prop.</span>
                 <span className="text-3xl font-black">4x</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function NicheBadge({ niche }: { niche: string }) {
  if (niche === "FASHION") return <span className="bg-[#ff5500]/10 text-[#ff5500] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Hype</span>;
  if (niche === "TECH") return <span className="bg-[#2962ff]/10 text-[#2962ff] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Tech</span>;
  if (niche === "ACCESSORIES") return <span className="bg-[#00c853]/10 text-[#00c853] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Accs</span>;
  return null;
}
