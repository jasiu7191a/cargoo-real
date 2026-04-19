"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Send, Users, Mail, CheckCircle, Search, Clock, Sparkles, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function AdminOutreachPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center animate-pulse font-black uppercase tracking-widest text-[#94a3b8]">Initializing Outreach Engine...</div>}>
      <OutreachContent />
    </Suspense>
  );
}

function OutreachContent() {
  const [isDrafting, setIsDrafting] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAIOverlay, setShowAIOverlay] = useState(false);
  const [preSelectedLead, setPreSelectedLead] = useState<any>(null);
  
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");

  useEffect(() => {
    if (leadId) {
      // Simulate fetching specifically targeted lead
      setPreSelectedLead({
        id: leadId,
        email: "targeted-lead@user.com",
        product: "Drone Accessories (Bulk)"
      });
      setShowCampaignForm(true);
    }
  }, [leadId]);

  return (
    <div className="space-y-10 relative">
      {/* History Modal Overlay */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-300">
           <div className="bg-[#0a0a0a] border border-white/10 p-12 rounded-[40px] max-w-xl w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff5500] to-transparent" />
              <button 
                onClick={() => setShowHistory(false)}
                className="absolute top-8 right-8 text-[#94a3b8] hover:text-white transition-colors"
                title="Close"
              >
                <X size={24} />
              </button>
              <h3 className="text-3xl font-black uppercase mb-8 flex items-center gap-3 italic">
                <Clock size={28} className="text-[#ff5500]" /> Outreach Log
              </h3>
              <div className="space-y-6">
                 <div className="border-l-2 border-white/10 pl-6 space-y-1">
                    <p className="text-[10px] font-black uppercase text-[#ff5500]">Today, 14:02</p>
                    <p className="text-sm font-bold">Campaign "Fashion Launch" initialized.</p>
                 </div>
                 <div className="border-l-2 border-white/10 pl-6 space-y-1">
                    <p className="text-[10px] font-black uppercase text-white/40">Yesterday, 09:15</p>
                    <p className="text-sm font-bold opacity-60">Status change: lead_8829 {"->"} QUALIFIED</p>
                 </div>
                 <div className="border-l-2 border-white/10 pl-6 space-y-1">
                    <p className="text-[10px] font-black uppercase text-white/40">18 Apr, 23:59</p>
                    <p className="text-sm font-bold opacity-60">Automated follow-up sent to stylevibe.fr</p>
                 </div>
              </div>
              <button onClick={() => setShowHistory(false)} className="w-full mt-10 py-4 bg-white/5 rounded-2xl font-black uppercase text-xs hover:bg-white/10 transition-all">Dismiss</button>
           </div>
        </div>
      )}

      {/* AI Scanning Overlay */}
      {showAIOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#ff5500]/10 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="text-center space-y-8">
              <div className="relative">
                 <Sparkles size={80} className="text-[#ff5500] mx-auto animate-pulse" />
                 <div className="absolute inset-0 bg-[#ff5500] blur-3xl opacity-20 animate-pulse" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-4xl font-black uppercase italic tracking-tighter">AI Scanning Matrix...</h2>
                 <p className="text-[#94a3b8] font-bold uppercase tracking-widest text-[10px]">Identifying high-conversion import nodes across all locales</p>
              </div>
              <div className="w-64 h-1 bg-white/10 mx-auto rounded-full overflow-hidden">
                 <div className="h-full bg-[#ff5500] animate-[shimmer_2s_infinite]" style={{ width: '40%' }} />
              </div>
              <button 
                onClick={() => setShowAIOverlay(false)}
                className="text-xs font-black uppercase text-white/40 hover:text-white transition-colors"
              >
                Cancel Neural Link
              </button>
           </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Outreach HQ</h1>
          <p className="text-[#94a3b8]">Targeted, permission-based outreach for resellers and niche partners.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="gap-2" onClick={() => setShowHistory(true)}>
              <Clock size={18} /> History
           </Button>
           <Button className="gap-2" onClick={() => setShowCampaignForm(!showCampaignForm)}>
              <Send size={18} /> {showCampaignForm ? "Cancel Creation" : "New Campaign"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="glass-panel p-8">
              <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
                <Users size={20} className="text-[#ff5500]" /> High-Value Targets
              </h3>
              <div className="space-y-4">
                 <TargetCard name="TechResell Hub" type="Electronics" score="98" />
                 <TargetCard name="StyleVibe EU" type="Fashion" score="92" />
                 <TargetCard name="ModShops PL" type="Bespoke" score="85" />
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
           {showCampaignForm && (
              <div className="glass-panel p-8 border-[#ff5500]/30 shadow-[0_10px_40px_rgba(255,85,0,0.1)] transition-all animate-in fade-in slide-in-from-top-4">
                 <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                   <Send size={20} className="text-[#ff5500]" /> Build Automated Campaign
                 </h3>
                 <div className="space-y-6">
                    {preSelectedLead && (
                       <div className="p-4 bg-[#ff5500]/5 border border-[#ff5500]/20 rounded-2xl">
                          <p className="text-[10px] font-black uppercase text-[#ff5500] mb-1">Direct Target Locked</p>
                          <p className="text-sm font-bold">{preSelectedLead.product}</p>
                          <p className="text-xs text-[#94a3b8]">{preSelectedLead.email}</p>
                       </div>
                    )}
                    <div>
                       <label className="text-xs font-black uppercase text-[#94a3b8] mb-2 block">Campaign Goal & Segment</label>
                       <select className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ff5500] outline-none">
                          <option>Re-engage Cold Leads (Any Status = NEW)</option>
                          <option>Target Niche: Fashion Resellers (Keyword Match)</option>
                          <option>Target Niche: Electronics Importers</option>
                       </select>
                    </div>
                    <Button className="w-full" glow onClick={async () => {
                        setIsDrafting(true);
                        // In a real scenario, this would call /api/admin/campaigns/create
                        await new Promise(r => setTimeout(r, 1500));
                        alert("Automation sequence initialized. Drafts will appear in the queue shortly.");
                        setIsDrafting(false);
                        setShowCampaignForm(false);
                        setPreSelectedLead(null);
                    }} disabled={isDrafting}>
                        {isDrafting ? "Syncing with AI Hub..." : "Identify Targets & Draft Emails"}
                    </Button>
                 </div>
              </div>
           )}

           <div className="glass-panel p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold uppercase">Pending Approval Queue</h3>
                <span className="text-[10px] font-black uppercase bg-[#ff5500]/10 text-[#ff5500] px-3 py-1 rounded-full">3 Drafts Ready</span>
              </div>
              
              <div className="space-y-4">
                 <OutreachDraftItem 
                   to="contact@techresell.com" 
                   subject="Direct-from-China sourcing for TechResell (Cargoo)"
                   preview="I noticed you were looking for specifically high-end drone parts..."
                 />
                 <OutreachDraftItem 
                   to="partners@stylevibe.fr" 
                   subject="Améliorez vos marges d'importation avec Cargoo"
                   preview="Suite à votre demande concernant les collections 2026..."
                 />
              </div>
           </div>

           <div className="glass-panel p-10 bg-gradient-to-br from-[#2962ff]/5 to-transparent flex items-center justify-between">
              <div className="max-w-[500px]">
                 <h4 className="text-2xl font-black uppercase mb-4 italic">Smart Outreach AI</h4>
                 <p className="text-[#94a3b8] text-sm font-medium">Our system automatically identifies high-value resellers from your inbound leads and drafts personalized outreach templates for your approval.</p>
              </div>
              <Button size="lg" glow onClick={() => setShowAIOverlay(true)}>Optimize Leads</Button>
           </div>
        </div>
      </div>
    </div>
  );
}

function TargetCard({ name, type, score }: { name: string; type: string; score: string }) {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
       <div className="flex justify-between items-start mb-2">
          <div className="font-bold text-sm group-hover:text-[#ff5500] transition-colors">{name}</div>
          <span className="text-[10px] font-bold text-[#00c853]">{score}% Match</span>
       </div>
       <div className="text-[10px] uppercase font-black text-[#94a3b8]">{type}</div>
    </div>
  );
}

function OutreachDraftItem({ to, subject, preview }: { to: string; subject: string; preview: string }) {
  const [status, setStatus] = useState<"IDLE" | "SENDING" | "SENT">("IDLE");

  const handleSend = async () => {
     setStatus("SENDING");
     try {
       const res = await fetch("/api/admin/outreach/send", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ leadId: to, newStatus: "CONTACTED" }),
       });
       if (res.ok) {
         setStatus("SENT");
       } else {
         throw new Error("Failed to send");
       }
     } catch (err) {
       alert(`Failed to dispatch email to ${to}: Check RESEND_API_KEY.`);
       setStatus("IDLE");
     }
  };

  return (
    <div className={`bg-white/5 border border-white/10 p-6 rounded-2xl group transition-all ${status === "SENT" ? "opacity-30 grayscale pointer-events-none" : "hover:bg-white/[0.08]"}`}>
       <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#ff5500]/10 text-[#ff5500] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail size={20} />
             </div>
             <div>
                <div className="text-xs font-bold text-white mb-0.5">{to}</div>
                <div className="text-sm font-black text-[#ff5500] uppercase tracking-tighter italic">{subject}</div>
             </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => alert(`Opening Draft Editor for ${to}...`)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold uppercase transition-all">Edit Draft</button>
             <button 
                onClick={handleSend}
                disabled={status !== "IDLE"}
                className={`px-4 py-2 text-black rounded-full text-xs font-black uppercase transition-all shadow-lg ${status === "IDLE" ? "bg-[#ff5500] hover:scale-105 active:scale-95" : "bg-zinc-600"}`}
             >
                {status === "IDLE" ? "Send Now" : status === "SENDING" ? "Sending..." : "Dispatched"}
             </button>
          </div>
       </div>
       <p className="text-xs text-[#94a3b8] italic">"{preview}"</p>
    </div>
  );
}
