export const dynamic = 'force-dynamic';

import React from "react";
import { Settings, Shield, Bell, User } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Settings</h1>
          <p className="text-[#94a3b8]">Application preferences, security, and integration management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <SettingsCard icon={<User size={24} />} title="Profile & Access" description="Manage your admin account credentials and role assignments." />
         <SettingsCard icon={<Shield size={24} />} title="Security (2FA)" description="Enforce two-factor authentication for dashboard access." />
         <SettingsCard icon={<Bell size={24} />} title="Notifications" description="Configure when and how you receive alerts for new inbound leads." />
      </div>

      <div className="glass-panel p-8 mt-8 border border-[#ff5500]/20">
         <h3 className="text-xl font-bold uppercase mb-4 text-[#ff5500]">System Warning</h3>
         <p className="text-sm text-[#94a3b8] max-w-2xl">
            Modifying core integration settings (Resend API, Neon DB, OpenAI) requires deployment-level changes in the Cloudflare Worker Environment Variables. These cannot be modified via the UI for security reasons.
         </p>
      </div>
    </div>
  );
}

function SettingsCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
     <div className="glass-panel p-6 hover:bg-white/[0.02] transition-colors flex flex-col justify-between h-40 group cursor-pointer border border-transparent hover:border-white/10">
        <div className="text-[#ff5500] group-hover:scale-110 transition-transform origin-left">{icon}</div>
        <div>
           <div className="font-bold text-lg mb-1">{title}</div>
           <div className="text-xs text-[#94a3b8]">{description}</div>
        </div>
     </div>
  );
}
