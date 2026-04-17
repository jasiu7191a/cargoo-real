"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sparkles, FileText, Globe, Search, ArrowRight, Loader2, CheckCircle } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  publishedAt?: string;
  targetKeyword?: string;
}

export default function AdminContentPage() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDraft, setCurrentDraft] = useState<any>(null);

  // Load existing articles on mount
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/content");
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setCurrentDraft(null);
    
    try {
      const res = await fetch("/api/admin/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: topic }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentDraft({ ...data, targetKeyword: topic });
      } else {
        alert("Generation failed. Check your OpenAI balance/key.");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDraft = async () => {
    if (!currentDraft) return;
    
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentDraft),
      });

      if (res.ok) {
        setCurrentDraft(null);
        setTopic("");
        fetchArticles();
        alert("Draft saved successfully!");
      }
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  const publishArticle = async (id: string) => {
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "PUBLISHED" }),
      });

      if (res.ok) {
        fetchArticles();
      }
    } catch (error) {
      console.error("Publish Error:", error);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">SEO Engine</h1>
          <p className="text-[#94a3b8]">Command your influence. Generate high-authority sourcing content in seconds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Generator */}
        <div className="lg:col-span-4 space-y-6">
           <div className="glass-panel p-8 border-[#ff5500]/20 bg-gradient-to-br from-[#ff5500]/5 to-transparent">
              <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-[#ff5500]" /> AI Sourcing Brain
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-[#94a3b8] mb-2 block tracking-widest">Expansion Topic</label>
                  <Input 
                    placeholder="e.g. Best Airpod Suppliers 2026" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="pt-4">
                   <Button 
                    className="w-full" 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !topic}
                    isLoading={isGenerating}
                   >
                     {isGenerating ? "Consulting AI..." : "Generate Authority Guide"}
                   </Button>
                </div>
              </div>
           </div>

           {/* Draft Review Area */}
           {currentDraft && (
             <div className="glass-panel p-8 border-[#00c853]/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h4 className="text-sm font-black uppercase mb-4 text-[#00c853] flex items-center gap-2">
                  <CheckCircle size={16} /> Draft Ready for Review
                </h4>
                <div className="space-y-2 mb-6">
                   <div className="text-lg font-bold leading-tight">{currentDraft.title}</div>
                   <div className="text-[10px] text-[#94a3b8] uppercase font-black">{currentDraft.slug}</div>
                </div>
                <Button variant="outline" className="w-full bg-[#00c853]/10 border-[#00c853]/30 text-[#00c853] hover:bg-[#00c853] hover:text-black" onClick={saveDraft}>
                   Save to Artifacts
                </Button>
             </div>
           )}
        </div>

        {/* Right Column: Artifacts List */}
        <div className="lg:col-span-8 glass-panel p-8">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold uppercase italic underline decoration-[#ff5500] underline-offset-8">Published Influence</h3>
              <div className="flex gap-2">
                 <button className="text-xs font-bold bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-[#94a3b8]">All Artifacts</button>
              </div>
           </div>

           <div className="space-y-4">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-[#94a3b8]">
                   <Loader2 className="animate-spin mb-4" size={32} />
                   <span className="text-xs font-black uppercase tracking-widest">Retrieving influence data...</span>
                </div>
              ) : articles.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                   <p className="text-[#94a3b8] font-bold">No articles yet. Use the AI Sourcing Brain to start your expansion.</p>
                </div>
              ) : (
                articles.map(article => (
                  <ArticleListItem 
                    key={article.id} 
                    article={article} 
                    onPublish={() => publishArticle(article.id)}
                  />
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function ArticleListItem({ article, onPublish }: { article: BlogPost; onPublish: () => void }) {
  return (
    <div className="group bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center hover:border-white/30 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[#94a3b8] group-hover:bg-[#ff5500]/20 group-hover:text-[#ff5500] transition-all">
           <FileText size={24} />
        </div>
        <div>
           <div className="font-bold text-sm text-white group-hover:text-[#ff5500] transition-colors">{article.title}</div>
           <div className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest mt-1">
             {new Date(article.createdAt).toLocaleDateString()} • {article.targetKeyword || "General"}
           </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
         <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
            article.status === 'PUBLISHED' ? 'bg-[#00c853]/10 text-[#00c853]' : 'bg-orange-500/10 text-orange-500'
         }`}>{article.status}</span>
         
         {article.status !== 'PUBLISHED' ? (
           <button 
            onClick={onPublish}
            className="text-xs font-black uppercase text-[#ff5500] hover:underline"
           >
              Publish Now
           </button>
         ) : (
           <button className="text-[#94a3b8] hover:text-white transition-colors">
              <ArrowRight size={18} />
           </button>
         )}
      </div>
    </div>
  );
}
