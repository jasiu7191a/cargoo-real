import { AdminLeadsTable } from "../view-components/admin-leads-table";

export const dynamic = "force-dynamic";

export default function AdminLeadsPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Lead Management</h1>
          <p className="text-[#94a3b8]">Manage and track all sourcing requests from your customers.</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
         <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
           <h2 className="text-xl font-bold italic tracking-tight uppercase">Full Sourcing Pipeline</h2>
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-[#ff5500] rounded-full animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Database Live</span>
           </div>
         </div>
         <AdminLeadsTable />
      </div>
    </div>
  );
}
