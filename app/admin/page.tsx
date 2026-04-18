import { Metadata } from "next";
import { AdminLeadsTable } from "./components/AdminLeadsTable";
import { DashboardHeader } from "./components/DashboardHeader";
import { StatsCards } from "./components/StatsCards";

// THE DYNAMIC SHIELD: Resolves 522 errors by forcing runtime-only rendering
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Dashboard | Cargoo Admin",
  description: "Real-time inbound lead management.",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DashboardHeader 
        title="Command Center" 
        subtitle="Real-time monitoring of your inbound supply chain." 
      />
      
      <StatsCards />

      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-xl font-bold italic tracking-tight uppercase">Inbound Pipeline</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Live Feed</span>
          </div>
        </div>
        <div className="p-0">
          <AdminLeadsTable />
        </div>
      </div>
    </div>
  );
}
