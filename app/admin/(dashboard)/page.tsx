import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardHeader } from "../view-components/dashboard-header";
import { StatsCards } from "../view-components/stats-cards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Cargoo Admin",
  description: "Overview of inbound activity.",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DashboardHeader title="Dashboard" subtitle="Overview of inbound activity." />

      <StatsCards />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/quote-requests"
          className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] hover:border-[#ff5500]/30 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff5500] mb-2">
              Daily work
            </div>
            <div className="text-2xl font-black italic tracking-tight">Quote Requests</div>
            <p className="text-sm text-[#94a3b8] mt-2">Review customer requests, build quotes, send shipments.</p>
          </div>
          <ArrowRight size={24} className="text-[#94a3b8] group-hover:text-[#ff5500] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/leads"
          className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] hover:border-white/30 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8] mb-2">
              Pipeline
            </div>
            <div className="text-2xl font-black italic tracking-tight">Inbound Leads</div>
            <p className="text-sm text-[#94a3b8] mt-2">Full sourcing pipeline and lead status.</p>
          </div>
          <ArrowRight size={24} className="text-[#94a3b8] group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
