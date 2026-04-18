"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function ContentGenerator() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      const res = await fetch("/api/admin/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: topic }), // API expects 'keyword' instead of 'topic'
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate");
      }
      
      setTopic("");
      router.refresh(); // Refresh the Server Component to show the new post
      
    } catch (err: any) {
       console.error("Failed:", err);
       alert("Generation failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-black uppercase text-[#94a3b8] mb-2 block">Target Topic / Keyword</label>
        <Input 
          placeholder="e.g. Is it worth importing Nike from China?" 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isGenerating}
        />
      </div>
      <div className="pt-4">
          <p className="text-xs text-[#94a3b8] mb-4">Our AI will generate a title, meta description, and long-form markdown content optimized for conversion.</p>
          <Button className="w-full" onClick={handleGenerate} disabled={isGenerating || !topic}>
            {isGenerating ? "Analyzing..." : "Generate Draft"} <ArrowRight size={18} />
          </Button>
      </div>
    </div>
  );
}
