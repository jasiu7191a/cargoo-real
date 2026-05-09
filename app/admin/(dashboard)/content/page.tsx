import React from "react";
import { Sparkles } from "lucide-react";
import { ContentGenerator } from "../../view-components/content-generator";
import { SeoArtifactList } from "../../view-components/seo-artifact-list";

export const dynamic = 'force-dynamic';

export default function AdminContentPage() {
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
        </div>

        <SeoArtifactList />
      </div>
    </div>
  );
}
