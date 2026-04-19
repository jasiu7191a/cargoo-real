import React, { Suspense } from "react";
import prisma from "@/lib/prisma";
import { Sparkles, FileText, ArrowRight } from "lucide-react";
import { ContentGenerator } from "../view-components/content-generator";
import { SeoArtifactList } from "../view-components/seo-artifact-list";

export const dynamic = 'force-dynamic';

export default function AdminContentPage() {
  return (
    <Suspense fallback={
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
        <Sparkles size={48} className="text-[#ff5500] animate-pulse" />
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Loading SEO Engine</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mt-2">Connecting to Content Matrix...</p>
        </div>
      </div>
    }>
      <AdminContentInner />
    </Suspense>
  );
}

async function AdminContentInner() {
  let serializedPosts: any[] = [];
  
  try {
     const recentPosts = await prisma.blogPost.findMany({
       orderBy: { createdAt: "desc" },
       take: 10,
     });
     
     // IMPORTANT: Explicit serialization to strings for Client Components
     serializedPosts = recentPosts.map(post => ({
       ...post,
       createdAt: post.createdAt.toISOString(),
       updatedAt: post.updatedAt.toISOString(),
       publishedAt: post.publishedAt?.toISOString() || null
     }));
  } catch (error) {
     console.error("Failed to fetch blog posts:", error);
     // We return empty array so UI doesn't 500
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
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
              <ContentGenerator />
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

        <SeoArtifactList initialPosts={serializedPosts} />
      </div>
    </div>
  );
}
