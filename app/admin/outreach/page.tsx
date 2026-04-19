"use client";
export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Send, Users, Mail, CheckCircle, Search, Clock } from "lucide-react";

export default function AdminOutreachPage() {
  const [isDrafting, setIsDrafting] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Outreach HQ</h1>
          <p className="text-[#94a3b8]">Targeted, permission-based outreach for resellers and niche partners.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="gap-2" onClick={() => alert("Fetching historical campaign data...")}>
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
                        alert("Campaign target saved! Connecting to Resend Mailhouse...");
                        await new Promise(r => setTimeout(r, 1000));
                        setIsDrafting(false);
                        setShowCampaignForm(false);
                    }} disabled={isDrafting}>
                        {isDrafting ? "Processing..." : "Identify Targets & Draft Emails"}
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
                 <h4 className="text-2xl font-black uppercase mb-4">Smart Outreach AI</h4>
                 <p className="text-[#94a3b8] text-sm">Our system automatically identifies high-value resellers from your inbound leads and drafts personalized outreach templates for your approval.</p>
              </div>
              <Button size="lg" glow onClick={() => alert('AI Optimization Scanner triggered.')}>Optimize Leads</Button>
           </div>
        </div>
      </div>
    </div>
  );
}

function TargetCard({ name, type, score }: { name: string; type: string; score: string }) {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
       <div className="flex justify-between items-start mb-2">
          <div className="font-bold text-sm">{name}</div>
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
         alert(`Email dispatched successfully to ${to}`);
       } else {
         throw new Error("Failed to send");
       }
     } catch (err) {
       alert(`Failed to dispatch email to ${to}: Server misconfiguration or missing API Keys.`);
       setStatus("IDLE");
     }
  };

  return (
    <div className={`bg-white/5 border border-white/10 p-6 rounded-2xl group transition-all ${status === "SENT" ? "opacity-50 grayscale pointer-events-none" : "hover:bg-white/[0.08]"}`}>
       <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#ff5500]/10 text-[#ff5500] rounded-xl flex items-center justify-center">
                <Mail size={20} />
             </div>
             <div>
                <div className="text-xs font-bold text-white mb-0.5">{to}</div>
                <div className="text-sm font-black text-[#ff5500] uppercase tracking-tighter">{subject}</div>
             </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => alert(`Opening Draft Editor for ${to}...`)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold uppercase transition-all">Edit Draft</button>
             <button 
                onClick={handleSend}
                disabled={status !== "IDLE"}
                className={`px-4 py-2 text-black rounded-full text-xs font-black uppercase transition-all ${status === "IDLE" ? "bg-[#ff5500] hover:scale-105" : "bg-zinc-600"}`}
             >
                {status === "IDLE" ? "Send Now" : status === "SENDING" ? "Sending..." : "Sent"}
             </button>
          </div>
       </div>
       <p className="text-xs text-[#94a3b8] italic">"{preview}"</p>
    </div>
  );
}
