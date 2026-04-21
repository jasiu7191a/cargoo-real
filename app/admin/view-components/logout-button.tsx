"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  return (
    <button 
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/5 transition-all rounded-xl"
    >
      <LogOut size={18} /> Logout
    </button>
  );
}
