"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function ContentGenerator() {
  const [topic, setTopic] = useState("");
  const [lang, setLang] = useState("en");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);

      const res = await fetch("/api/admin/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: topic, lang }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || "Failed to generate");
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
      <div>
        <label className="text-xs font-black uppercase text-[#94a3b8] mb-2 block">Language</label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          disabled={isGenerating}
          style={{ background: "#1a1a1a", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", width: "100%", fontSize: "0.875rem" }}
        >
          <option value="en">🇬🇧 English</option>
          <option value="pl">🇵🇱 Polish</option>
          <option value="de">🇩🇪 German</option>
          <option value="fr">🇫🇷 French</option>
        </select>
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
