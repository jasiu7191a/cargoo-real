"use client";

import { useEffect, useState } from "react";
import { Zap, Users, TrendingUp, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export function StatsCards() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeSessions: 12,
    conversionRate: "4.2%",
    avgResponse: "2m"
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(s => ({ ...s, totalLeads: data.count || 0 }));
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Inbound", value: stats.totalLeads, icon: Users, color: "text-blue-400" },
    { label: "Live Nodes", value: stats.activeSessions, icon: Zap, color: "text-green-400" },
    { label: "Efficiency", value: stats.conversionRate, icon: TrendingUp, color: "text-purple-400" },
    { label: "Sync Speed", value: stats.avgResponse, icon: Clock, color: "text-orange-400" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 hover:bg-white/[0.04] transition-all group shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">
                {card.label}
              </p>
              <h3 className="text-3xl font-black italic tabular-nums text-white group-hover:scale-105 transition-transform origin-left">
                {card.value}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl bg-white/[0.03] border border-white/5 ${card.color}`}>
              <card.icon size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
