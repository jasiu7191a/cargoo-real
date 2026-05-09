"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export function StatsCards() {
  const [totalLeads, setTotalLeads] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setTotalLeads(data.count || 0);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 hover:bg-white/[0.04] transition-all group shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">
              Total Inbound
            </p>
            <h3 className="text-3xl font-black italic tabular-nums text-white group-hover:scale-105 transition-transform origin-left">
              {totalLeads}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-blue-400">
            <Users size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
