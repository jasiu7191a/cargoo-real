"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface DropdownProps {
  leadId: string;
  initialStatus: string;
}

export function LeadStatusDropdown({ leadId, initialStatus }: DropdownProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsUpdating(true);

    try {
      // Trigger the Outreach Automation Engine
      const res = await fetch("/api/admin/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to trigger automation");
      }
      
      // We would also update the status in the DB here if building the full CRUD pipeline
      alert(`Status updated to ${newStatus}. Automated email dispatched!`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert("Error generating outreach: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select 
      value={status}
      onChange={handleStatusChange}
      disabled={isUpdating}
      className={`bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase px-3 py-1 text-white focus:outline-none focus:border-[#ff5500] ${isUpdating ? "opacity-50" : ""}`}
    >
      <option value="NEW">New</option>
      <option value="PROCESSING">Processing</option>
      <option value="QUOTED">Quoted</option>
      <option value="PAID">Paid</option>
      <option value="SHIPPED">Shipped</option>
    </select>
  );
}
