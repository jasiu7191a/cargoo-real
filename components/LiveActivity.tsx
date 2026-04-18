"use client";

import React, { useState, useEffect } from "react";
import { Zap, ShoppingBag, Search } from "lucide-react";

const activities = [
  { city: "Warsaw", action: "calculated pricing for", product: "25x AirPods Max" },
  { city: "Berlin", action: "requested a quote for", product: "Electric Scooter Batch" },
  { city: "Paris", action: "sourced", product: "Designer Sneakers" },
  { city: "Kraków", action: "requested a quote for", product: "Industrial CNC Parts" },
  { city: "Hamburg", action: "calculated pricing for", product: "Luxury Watch Collection" },
  { city: "Lyon", action: "sourced", product: "Eco-friendly Packaging" },
  { city: "Wrocław", action: "calculated pricing for", product: "Gaming PC Components" },
  { city: "Poznań", action: "requested a quote for", product: "Cosmetics Display Units" },
];

export function LiveActivity() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initial delay before first toast
    const initialDelay = setTimeout(() => {
      setVisible(true);
    }, 3000);

    const interval = setInterval(() => {
      setVisible(false);
      
      // Wait for fade out before changing and fading in again
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % activities.length);
        setVisible(true);
      }, 1000);
      
    }, 12000); // Show every 12 seconds

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  if (!mounted) return null;

  const current = activities[index];

  return (
    <div 
      className={`fixed bottom-8 left-8 z-[100] transition-all duration-1000 ease-in-out transform ${
        visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"
      }`}
    >
      <div className="bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/10 p-5 pr-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-5 min-w-[320px]">
        {/* Icon Pulse */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#ff5500]/40 rounded-full animate-ping" />
          <div className="relative w-12 h-12 bg-[#ff5500] rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,85,0,0.4)]">
             <ShoppingBag size={20} className="font-bold" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Live Activity</span>
            <div className="w-1 h-1 bg-[#00c853] rounded-full animate-pulse" />
          </div>
          <div className="text-sm font-medium text-white leading-tight">
             Someone from <span className="text-[#ff5500] font-black">{current.city}</span> {current.action} <span className="font-black italic">{current.product}</span>
          </div>
          <div className="text-[10px] text-[#94a3b8] font-bold uppercase">
             Just Now
          </div>
        </div>
      </div>
    </div>
  );
}
