export const dynamic = 'force-dynamic';

import React from "react";
import prisma from "@/lib/prisma";
import { Sparkles, FileText, ArrowRight } from "lucide-react";
import { ContentGenerator } from "../view-components/content-generator";

export default async function AdminContentPage() {
  const recentPosts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

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

        <div className="lg:col-span-2 glass-panel p-8">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold uppercase">Recent Artifacts</h3>
              <div className="flex gap-2">
                 <button className="text-xs font-bold bg-white/5 px-4 py-2 rounded-lg border border-white/10">All Posts</button>
                 <button className="text-xs font-bold bg-white/5 px-4 py-2 rounded-lg border border-white/10">Drafts</button>
              </div>
           </div>

           <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <div className="p-8 text-center text-[#94a3b8] italic">No AI artifacts built yet. Generate one to the left!</div>
              ) : (
                recentPosts.map((post: any) => (
                  <ArticleListItem 
                    key={post.id}
                    title={post.title} 
                    status={post.status} 
                    date={new Date(post.createdAt).toLocaleDateString()} 
                  />
                ))
              )}
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
           <div className="font-bold text-sm text-white group-hover:text-[#ff5500] transition-colors line-clamp-1">{title}</div>
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
