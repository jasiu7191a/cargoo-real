"use client";

import { useEffect, useState } from "react";

export const dynamic = 'force-dynamic';

interface Lead {
  id: string;
  name: string;
  email: string;
  product: string;
  status: string;
  createdAt: string;
}

export function AdminLeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="p-8 text-center text-white/50 animate-pulse font-black uppercase tracking-widest text-xs">Accessing Database...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/[0.02] border-b border-white/10">
            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Lead Contact</th>
            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Target Item</th>
            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Status</th>
            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Logged At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {leads.length > 0 ? (
            leads.map((lead) => (
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
                     className="bg-black/50 border border-white/10 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest text-green-400 focus:border-[#ff5500] outline-none hover:bg-white/5 transition-all cursor-pointer"
                     defaultValue={lead.status || "NEW"}
                     onChange={async (e) => {
                        const newStatus = e.target.value;
                        const res = await fetch("/api/admin/outreach/send", {
                           method: "POST",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify({ leadId: lead.email, newStatus })
                        });
                        if (res.ok) {
                           alert(`Status updated to ${newStatus}`);
                        } else {
                           alert("Failed to update status. Check API keys.");
                        }
                     }}
                  >
                     <option value="NEW">New Inquiry</option>
                     <option value="CONTACTED">Contacted</option>
                     <option value="QUALIFIED">Qualified</option>
                     <option value="CLOSED">Closed</option>
                  </select>
                </td>
                <td className="px-8 py-5 text-xs text-white/40 tabular-nums">
                  {new Date(lead.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-8 py-12 text-center text-white/30 italic text-sm">
                No active inbound leads detected.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
