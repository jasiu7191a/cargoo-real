import React from "react";

export default function AdminBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-base-root selection:bg-[#ff5500]/30 selection:text-white">
      {children}
    </div>
  );
}
