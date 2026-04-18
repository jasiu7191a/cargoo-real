import { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { LayoutDashboard, Users, FileText, Send, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import React from "react";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin HQ | Cargoo Import",
  description: "Secure sourcing & logistics management dashboard.",
};

export default function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = params.lang || 'en';

  return (
    <div className={`${jakarta.className} flex h-screen bg-[#050505] text-white`}>
      <aside className="w-72 border-r border-white/10 bg-[#0a0a0a] flex flex-col pt-10 px-6">
        <div className="flex items-center gap-3 px-4 mb-12">
          <div className="w-10 h-10 bg-[#ff5500] rounded-2xl flex items-center justify-center text-black font-black italic shadow-[0_0_15px_rgba(255,85,0,0.3)]">
            C
          </div>
          <div>
            <div className="font-black text-xl tracking-tighter">CARGOO</div>
            <div className="text-[10px] uppercase font-black tracking-widest text-[#ff5500]">Admin HQ</div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <AdminNavLink href={`/${lang}/admin`} icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <AdminNavLink href={`/${lang}/admin/content`} icon={<FileText size={18} />} label="SEO Engine" />
          <AdminNavLink href={`/${lang}/admin/outreach`} icon={<Send size={18} />} label="Outreach HQ" />
          <AdminNavLink href={`/${lang}/admin/leads`} icon={<Users size={18} />} label="Inbound Leads" />
        </nav>

        <div className="pb-10 space-y-2 border-t border-white/10 pt-6">
          <AdminNavLink href={`/${lang}/admin/settings`} icon={<Settings size={18} />} label="Settings" />
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/5 transition-all rounded-xl">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-white/10 bg-[#050505]/50 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="text-sm font-medium text-[#94a3b8]">Admin Control Panel ({lang.toUpperCase()})</div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-white/10 rounded-full border border-white/10" />
            <span className="text-sm font-bold">Manager</span>
          </div>
        </header>
        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}

function AdminNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#94a3b8] hover:text-[#ff5500] transition-all rounded-xl hover:bg-[#ff5500]/5"
    >
      {icon} {label}
    </Link>
  );
}
