"use client";

import React, { useState } from "react";
import { FileText, ArrowRight, CheckCircle, Globe, X, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

export function SeoArtifactList({ initialPosts = [] }: { initialPosts?: any[] }) {
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [filter, setFilter] = useState<"ALL" | "DRAFT" | "PUBLISHED">("ALL");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (initialPosts.length > 0) return;
    
    async function fetchPosts() {
      try {
        const res = await fetch("/api/admin/content");
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (e) {
        console.error("Failed to fetch posts:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [initialPosts]);

  const filteredPosts = posts.filter(post => {
      if (filter === "ALL") return true;
      return post.status === filter;
  });

  const handlePublish = async (id: string, currentStatus: string) => {
      if (currentStatus === "PUBLISHED") return;
      setIsUpdating(id);
      
      try {
         const res = await fetch("/api/admin/content/publish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action: "PUBLISH" })
         });
         
         if (res.ok) {
            alert("Article published successfully!");
            // Update local state to show published
            setPosts(prev => prev.map(p => p.id === id ? { ...p, status: "PUBLISHED" } : p));
         } else {
            alert("Publishing failed.");
         }
      } catch (e) {
         console.error(e);
      } finally {
         setIsUpdating(null);
      }
  };

  return (
    <div className="lg:col-span-2 glass-panel p-8">
       <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold uppercase">Recent Artifacts</h3>
          <div className="flex gap-2">
             <button 
                onClick={() => setFilter("ALL")}
                className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all ${filter === "ALL" ? "bg-[#ff5500] text-black border-transparent" : "bg-white/5 border-white/10"}`}
             >
                All Posts
             </button>
             <button 
                onClick={() => setFilter("DRAFT")}
                className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all ${filter === "DRAFT" ? "bg-[#ff5500] text-black border-transparent" : "bg-white/5 border-white/10"}`}
             >
                Drafts
             </button>
             <button 
                onClick={() => setFilter("PUBLISHED")}
                className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all ${filter === "PUBLISHED" ? "bg-[#ff5500] text-black border-transparent" : "bg-white/5 border-white/10"}`}
             >
                Published
             </button>
          </div>
       </div>

       <div className="space-y-4">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-[#ff5500]/20 border-t-[#ff5500] rounded-full animate-spin" />
              <div className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] animate-pulse">Syncing Content Matrix...</div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-[#94a3b8] italic">No artifacts match this filter.</div>
          ) : (
            filteredPosts.map((post: any) => (
              <div key={post.id} className="group bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center hover:border-white/30 transition-all">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#94a3b8]">
                     <FileText size={20} />
                  </div>
                  <div 
                    className="cursor-pointer flex-1"
                    onClick={() => setSelectedPost(post)}
                  >
                     <div className="font-bold text-sm text-white group-hover:text-[#ff5500] transition-colors line-clamp-1">{post.title}</div>
                     <div className="text-xs text-[#94a3b8]">{new Date(post.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                      post.status === 'PUBLISHED' ? 'bg-[#00c853]/10 text-[#00c853]' : 'bg-white/10 text-white'
                   }`}>{post.status}</span>
                   
                   <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedPost(post)}
                        className="p-2 text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      >
                        <ExternalLink size={16} />
                      </button>

                      {post.status !== "PUBLISHED" && (
                          <button 
                            onClick={() => handlePublish(post.id, post.status)}
                            disabled={isUpdating === post.id}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase bg-white/10 hover:bg-[#ff5500] hover:text-black transition-all px-3 py-1 rounded-lg"
                          >
                            <Globe size={12} /> {isUpdating === post.id ? "Publishing..." : "Publish"}
                          </button>
                      )}
                   </div>
                </div>
              </div>
            ))
          )}
       </div>

       {/* Article Preview Modal */}
       {selectedPost && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
           <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0d0d0d]">
                <div>
                  <h4 className="text-xs font-black uppercase text-[#ff5500] tracking-widest mb-1">Article Preview</h4>
                  <div className="text-lg font-bold line-clamp-1">{selectedPost.title}</div>
                </div>
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-[10px] font-black uppercase text-[#94a3b8] mb-2 tracking-widest">URL Slug</div>
                    <div className="text-xs font-mono text-[#ff5500]">/{selectedPost.slug}</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-[10px] font-black uppercase text-[#94a3b8] mb-2 tracking-widest">SEO Keyword</div>
                    <div className="text-xs font-bold text-white uppercase">{selectedPost.targetKeyword}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase text-[#94a3b8] mb-2 tracking-widest">Meta Description</div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-white/70 italic">
                    {selectedPost.metaDescription}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase text-[#94a3b8] mb-4 tracking-widest">Article Body</div>
                  <div className="prose prose-invert max-w-none prose-orange text-white/80 whitespace-pre-wrap font-serif text-lg leading-relaxed">
                    {selectedPost.content}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end bg-[#0d0d0d]">
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 font-bold uppercase text-xs rounded-xl transition-all"
                >
                  Close Preview
                </button>
              </div>
           </div>
         </div>
       )}
    </div>
  );
}
