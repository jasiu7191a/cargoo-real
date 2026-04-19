"use client";

import { useEffect, useState } from "react";
import { Search, Eye, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

interface Lead {
  id: string;
  name: string;
  email: string;
  product: string;
  status: string;
  quantity: number;
  notes: string | null;
  createdAt: string;
}

import { useRouter } from "next/navigation";

export function AdminLeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch("/api/admin/leads");
        if (response.ok) {
          const data = await response.json();
          setLeads(data);
        }
      } catch (error) {
        console.error("Failed to fetch leads:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/outreach/send", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ leadId: id, newStatus })
      });
      if (res.ok) {
         router.refresh();
         // Also update local state for immediate feedback
         setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      } else {
         const err = await res.json();
         alert("Failed to update status: " + (err.error || "Unknown error"));
      }
    } catch (e) {
      alert("Network error during status update.");
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#ff5500]/20 border-t-[#ff5500] rounded-full animate-spin" />
        <div className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] animate-pulse">Establishing Secure Uplink...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {/* Quick-View Modal Overlay */}
      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-[#0a0a0a] border border-white/10 p-10 rounded-[40px] max-w-2xl w-full shadow-[0_20px_60px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5500]/5 blur-[100px] -z-10" />
              
              <button 
                onClick={() => setSelectedLead(null)}
                className="absolute top-8 right-8 text-[#94a3b8] hover:text-white transition-colors"
                title="Close"
              >
                X
              </button>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-[#ff5500]/10 rounded-2xl flex items-center justify-center text-[#ff5500]">
                    <Eye size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Quick Record View</h3>
                    <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Entry ID: {selectedLead.id}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#ff5500] tracking-widest">Customer</label>
                    <p className="text-lg font-bold">{selectedLead.name}</p>
                    <p className="text-sm text-[#94a3b8]">{selectedLead.email}</p>
                 </div>
                 <div className="space-y-1 text-right">
                    <label className="text-[10px] font-black uppercase text-[#ff5500] tracking-widest">Log Date</label>
                    <p className="text-lg font-bold">{new Date(selectedLead.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-[#94a3b8]">{new Date(selectedLead.createdAt).toLocaleTimeString()}</p>
                 </div>
                 <div className="col-span-1 space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#ff5500] tracking-widest">Target Item</label>
                    <p className="text-xl font-black uppercase italic text-white/90">{selectedLead.product}</p>
                 </div>
                 <div className="col-span-1 space-y-1 text-right">
                    <label className="text-[10px] font-black uppercase text-[#ff5500] tracking-widest">Quantity</label>
                    <p className="text-2xl font-black text-white">{selectedLead.quantity || 1} units</p>
                 </div>
                 
                 {selectedLead.notes && (
                   <div className="col-span-2 space-y-1 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                      <label className="text-[10px] font-black uppercase text-[#ff5500] tracking-widest">Agent Notes / Inbound Message</label>
                      <p className="text-sm text-white/70 leading-relaxed italic">"{selectedLead.notes}"</p>
                   </div>
                 )}
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setSelectedLead(null)} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold uppercase text-xs hover:bg-white/10 transition-all">Close Entry</button>
                 <Link href={`/admin/outreach?leadId=${selectedLead.id}`} className="flex-[2] py-4 bg-[#ff5500] text-black rounded-2xl font-black uppercase text-xs hover:scale-[1.02] transition-all text-center">Contact Hub</Link>
              </div>
           </div>
        </div>
      )}

      {/* Search Bar Injection */}
      <div className="px-8 py-4 border-b border-white/10 bg-white/[0.01] flex items-center gap-4">
        <div className="flex-1 flex items-center gap-3 glass-panel px-4 py-2 border-white/5">
          <Search size={16} className="text-[#94a3b8]" />
          <input 
            type="text" 
            placeholder="Filter inbound supply chain..." 
            className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder:text-white/20 uppercase font-bold tracking-tight"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/10">
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Lead Contact</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Target Item</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Status</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="font-bold text-white group-hover:text-green-400 transition-colors uppercase italic">{lead.name}</div>
                    <div className="text-xs text-white/40 font-medium tabular-nums lowercase">{lead.email}</div>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-white/90 tracking-tight uppercase">
                    {lead.product}
                  </td>
                  <td className="px-8 py-5">
                    <select 
                       className="bg-black/50 border border-white/10 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#ff5500] focus:border-[#ff5500] outline-none hover:bg-white/5 transition-all cursor-pointer"
                       value={lead.status || "NEW"}
                       onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    >
                       <option value="NEW">New Inquiry</option>
                       <option value="PROCESSING">Processing</option>
                       <option value="QUOTED">Quoted</option>
                       <option value="SHIPPED">Shipped</option>
                       <option value="CLOSED">Closed</option>
                    </select>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => setSelectedLead(lead)} 
                         className="p-2 bg-white/5 rounded-lg text-[#94a3b8] hover:text-[#ff5500] transition-all"
                         title="Quick View"
                       >
                          <Eye size={16} />
                       </button>
                       <Link 
                         href={`/admin/outreach?leadId=${lead.id}`} 
                         className="p-2 bg-white/5 rounded-lg text-[#94a3b8] hover:text-[#2962ff] transition-all"
                         title="Outreach"
                       >
                          <Mail size={16} />
                       </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-white/30 italic text-sm uppercase font-bold tracking-widest">
                  No matching inbound leads detected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
