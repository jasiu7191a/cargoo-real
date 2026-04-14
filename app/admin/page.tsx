import React from "react";
import prisma from "@/lib/prisma";
import { Users, TrendingUp, Package, ShieldCheck } from "lucide-react";

async function getStats() {
  const totalLeads = await prisma.lead.count();
  const recentLeads = await prisma.lead.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });
  
  return { totalLeads, recentLeads };
}

export default async function AdminDashboard() {
  const { totalLeads, recentLeads } = await getStats();

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Dashboard</h1>
          <p className="text-[#94a3b8]">Real-time overview of your sourcing empire.</p>
        </div>
        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
           <div className="w-3 h-3 bg-[#00c853] rounded-full animate-pulse" />
           <span className="text-sm font-bold uppercase tracking-widest">System Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Requests" value={totalLeads.toString()} icon={<Users size={24} />} trend="+12.5%" />
        <StatCard title="Active Sourcing" value="42" icon={<TrendingUp size={24} />} trend="+5.2%" color="#ff5500" />
        <StatCard title="Confirmed Orders" value="18" icon={<Package size={24} />} trend="+8.1%" />
        <StatCard title="Conversion Rate" value="24%" icon={<ShieldCheck size={24} />} trend="+2.4%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold uppercase">Recent Inbound Leads</h3>
             <button className="text-xs font-black uppercase text-[#ff5500] hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-[#94a3b8] text-xs font-bold uppercase tracking-widest">
                  <th className="pb-4">Product</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentLeads.map(lead => (
                  <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 font-bold text-sm">{lead.productName}</td>
                    <td className="py-4 text-sm text-[#94a3b8]">{lead.user?.email}</td>
                    <td className="py-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                         lead.status === 'NEW' ? 'bg-[#ff5500]/10 text-[#ff5500]' : 'bg-white/10 text-white'
                       }`}>
                         {lead.status}
                       </span>
                    </td>
                    <td className="py-4 text-xs text-[#94a3b8]">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel p-8 flex flex-col">
          <h3 className="text-xl font-bold uppercase mb-8">Smart Suggestions</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 grayscale">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
               ✨
             </div>
             <p className="text-sm font-medium">AI-generated product trends and margin opportunities will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color = "#2962ff" }: { title: string; value: string; icon: React.ReactNode; trend: string; color?: string }) {
  return (
    <div className="glass-panel p-8 group overflow-hidden relative">
      <div 
        className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 z-[-1]" 
        style={{ backgroundColor: color }}
      />
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-white/30 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-black text-[#00c853]">{trend}</span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] mb-1">{title}</p>
        <h4 className="text-3xl font-black">{value}</h4>
      </div>
    </div>
  );
}
