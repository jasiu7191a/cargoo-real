"use client";

export const dynamic = 'force-dynamic';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-8 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">
          {title}
        </h1>
      </div>
      <p className="text-[#94a3b8] font-medium tracking-tight text-sm pl-4.5">
        {subtitle}
      </p>
    </div>
  );
}
