import React from "react";
import prisma from "@/lib/prisma";
import { Search, Filter, MoreHorizontal, Eye, Mail, MessageSquare } from "lucide-react";

async function getLeads() {
  return await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });
}

export default async function AdminLeadsPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Lead Management</h1>
          <p className="text-[#94a3b8]">Manage and track all sourcing requests from your customers.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 glass-panel px-4 py-2 flex items-center gap-3">
          <Search size={18} className="text-[#94a3b8]" />
          <input 
            className="bg-transparent border-none text-white text-sm focus:outline-none w-full" 
            placeholder="Search leads by product name, email, or ID..."
          />
        </div>
        <button className="glass-panel px-6 flex items-center gap-2 font-bold text-sm uppercase">
          <Filter size={16} /> Filters
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-[#94a3b8] text-xs font-bold uppercase tracking-widest bg-white/[0.02]">
              <th className="p-6">Product & Quantity</th>
              <th className="p-6">Customer</th>
              <th className="p-6">Status</th>
              <th className="p-6">Created</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-[#94a3b8]">No leads found. Start sourcing!</td>
              </tr>
            ) : leads.map(lead => (
              <tr key={lead.id} className="group hover:bg-white/[0.03] transition-colors">
                <td className="p-6">
                  <div className="font-bold text-sm text-white mb-1">{lead.productName}</div>
                  <div className="text-xs text-[#94a3b8]">Qty: {lead.quantity} • Target: {lead.targetPrice ? `€${lead.targetPrice}` : "None"}</div>
                </td>
                <td className="p-6">
                  <div className="text-sm font-medium">{lead.user?.email}</div>
                </td>
                <td className="p-6">
                   <select 
                     defaultValue={lead.status}
                     className="bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase px-3 py-1 text-white focus:outline-none focus:border-[#ff5500]"
                   >
                     <option value="NEW">New</option>
                     <option value="PROCESSING">Processing</option>
                     <option value="QUOTED">Quoted</option>
                     <option value="PAID">Paid</option>
                     <option value="SHIPPED">Shipped</option>
                   </select>
                </td>
                <td className="p-6 text-xs text-[#94a3b8]">
                  {new Date(lead.createdAt).toLocaleString()}
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-[#94a3b8] hover:text-[#ff5500] transition-all">
                      <Mail size={16} />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-[#94a3b8] hover:text-[#2962ff] transition-all">
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
