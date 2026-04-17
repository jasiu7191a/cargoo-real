import Link from "next/link";
import "../globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-main',
  display: 'swap',
});
import { LayoutDashboard, Users, FileText, Send, Settings, LogOut, Package } from "lucide-react";
import { Providers } from "@/components/Providers";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={jakarta.className}>
        <Providers>
          <div className="flex min-h-screen text-white">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-[#0b0b0b] flex flex-col pt-8">
              <div className="px-6 mb-10 flex items-center gap-2">
                 <div className="w-8 h-8 bg-[#ff5500] rounded-lg flex items-center justify-center">
                   <Package size={16} className="text-black" />
                 </div>
                 <span className="text-xl font-black uppercase tracking-tight">Cargoo <span className="text-[#ff5500]">HQ</span></span>
              </div>

              <nav className="flex-1 px-4 space-y-2">
                <AdminNavLink href="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                <AdminNavLink href="/admin/leads" icon={<Users size={18} />} label="Lead Management" />
                <AdminNavLink href="/admin/content" icon={<FileText size={18} />} label="SEO Engine" />
                <AdminNavLink href="/admin/outreach" icon={<Send size={18} />} label="Outreach HQ" />
              </nav>

              <div className="p-4 border-t border-white/10 mt-auto">
                <AdminNavLink href="/admin/settings" icon={<Settings size={18} />} label="Settings" />
                <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-[#94a3b8] hover:text-white transition-all rounded-xl hover:bg-white/5">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
              <header className="h-20 border-b border-white/10 bg-[#050505]/50 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-10">
                 <div className="text-sm font-medium text-[#94a3b8]">Admin Control Panel</div>
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
        </Providers>
      </body>
    </html>
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
