"use client";

import React, { useState } from "react";
import { FileText, ArrowRight, CheckCircle, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export function SeoArtifactList({ initialPosts }: { initialPosts: any[] }) {
  const [filter, setFilter] = useState<"ALL" | "DRAFT" | "PUBLISHED">("ALL");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const filteredPosts = initialPosts.filter(post => {
      if (filter === "ALL") return true;
      return post.status === filter;
  });

  const handlePublish = async (id: string, currentStatus: string) => {
      if (currentStatus === "PUBLISHED") return;
      setIsUpdating(id);
      
      try {
         // Calling an API that handles status update
         // We will build `app/api/admin/content/publish/route.ts` if it doesn't exist
         const res = await fetch("/api/admin/content/publish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action: "PUBLISH" })
         });
         
         if (res.ok) {
            alert("Article published successfully!");
            router.refresh();
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
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-[#94a3b8] italic">No artifacts match this filter.</div>
          ) : (
            filteredPosts.map((post: any) => (
              <div key={post.id} className="group bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center hover:border-white/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#94a3b8]">
                     <FileText size={20} />
                  </div>
                  <div>
                     <div className="font-bold text-sm text-white group-hover:text-[#ff5500] transition-colors line-clamp-1">{post.title}</div>
                     <div className="text-xs text-[#94a3b8]">{new Date(post.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                      post.status === 'PUBLISHED' ? 'bg-[#00c853]/10 text-[#00c853]' : 'bg-white/10 text-white'
                   }`}>{post.status}</span>
                   
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
            ))
          )}
       </div>
    </div>
  );
}
