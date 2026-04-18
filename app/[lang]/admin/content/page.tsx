"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sparkles, FileText, Globe, Search, ArrowRight } from "lucide-react";

export default function AdminContentPage() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // In actual implementation, we'd call the api/admin/content/generate route
    setTimeout(() => {
      setIsGenerating(false);
      alert("SEO Draft generated! Reviewing in real-time...");
    }, 2000);
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">SEO Engine</h1>
          <p className="text-[#94a3b8]">Generate AI-powered content to drive high-intent organic traffic.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="glass-panel p-8">
              <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-[#ff5500]" /> New Article
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-[#94a3b8] mb-2 block">Target Topic / Keyword</label>
                  <Input 
                    placeholder="e.g. Is it worth importing Nike from China?" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div className="pt-4">
                   <p className="text-xs text-[#94a3b8] mb-4">Our AI will generate a title, meta description, and long-form markdown content optimized for conversion.</p>
                   <Button className="w-full" onClick={handleGenerate} disabled={isGenerating || !topic}>
                     {isGenerating ? "Analyzing..." : "Generate Draft"} <ArrowRight size={18} />
                   </Button>
                </div>
              </div>
           </div>

           <div className="glass-panel p-8 bg-[#ff5500]/5 border-[#ff5500]/20">
              <h4 className="text-sm font-black uppercase mb-4 text-[#ff5500]">Trending Keywords</h4>
              <ul className="space-y-3">
                 <li className="text-xs font-bold text-white/70 flex justify-between">
                    <span>Cheap Sneakers China</span>
                    <span className="text-[#00c853]">High Intent</span>
                 </li>
                 <li className="text-xs font-bold text-white/70 flex justify-between">
                    <span>Aliexpress vs Sourcing Agent</span>
                    <span className="text-[#00c853]">V. High Intent</span>
                 </li>
                 <li className="text-xs font-bold text-white/70 flex justify-between">
                    <span>How to import electronics</span>
                    <span className="text-[#2962ff]">Medium Intent</span>
                 </li>
              </ul>
           </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-8">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold uppercase">Recent Artifacts</h3>
              <div className="flex gap-2">
                 <button className="text-xs font-bold bg-white/5 px-4 py-2 rounded-lg border border-white/10">All Posts</button>
                 <button className="text-xs font-bold bg-white/5 px-4 py-2 rounded-lg border border-white/10">Drafts</button>
              </div>
           </div>

           <div className="space-y-4">
              <ArticleListItem title="The 2026 Guide to Importing High-End Fashion" status="PUBLISHED" date="2 hours ago" />
              <ArticleListItem title="Why AliExpress prices are rising and how to bypass them" status="DRAFT" date="Yesterday" />
              <ArticleListItem title="Verified Sourcing: 5 Signs of a Scam Supplier" status="PUBLISHED" date="Apr 12, 2026" />
           </div>
        </div>
      </div>
    </div>
  );
}

function ArticleListItem({ title, status, date }: { title: string; status: string; date: string }) {
  return (
    <div className="group bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center hover:border-white/30 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#94a3b8]">
           <FileText size={20} />
        </div>
        <div>
           <div className="font-bold text-sm text-white group-hover:text-[#ff5500] transition-colors">{title}</div>
           <div className="text-xs text-[#94a3b8]">{date}</div>
        </div>
      </div>
      <div className="flex items-center gap-6">
         <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
            status === 'PUBLISHED' ? 'bg-[#00c853]/10 text-[#00c853]' : 'bg-white/10 text-white'
         }`}>{status}</span>
         <button className="text-[#94a3b8] hover:text-white transition-colors">
            <ArrowRight size={18} />
         </button>
      </div>
    </div>
  );
}
