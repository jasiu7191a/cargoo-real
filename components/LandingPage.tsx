"use client";

import React, { useState } from "react";
import { Button } from "./ui/Button";
import { ChevronRight, Calculator, ShieldCheck, Truck, Handshake } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-44 pb-20 min-h-[90vh] flex flex-col justify-center overflow-hidden">
      {/* Mesh Background */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="mesh-blob w-[50vw] h-[50vw] bg-[#2962ff] top-[-20%] left-[-10%]" />
        <div className="mesh-blob w-[40vw] h-[40vw] bg-[#ff5500] bottom-[-20%] right-[-10%] animate-[spin_20s_linear_infinite_reverse]" />
      </div>

      <div className="container relative text-center max-w-[900px] mx-auto">
        <div className="inline-block bg-white/5 backdrop-blur-3xl border border-white/15 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-white mb-8">
          The New Way To Import
        </div>
        
        <h1 className="text-[clamp(3.5rem,8vw,6rem)] font-black uppercase tracking-tighter leading-[0.9] text-white mb-6">
          Source Direct.<br />
          <span className="gradient-text">Zero <span className="line-through text-white/30 decoration-white/30">Middleman</span>.</span>
        </h1>
        
        <p className="text-[clamp(1.1rem,2vw,1.5rem)] text-[#94a3b8] font-medium mb-10 max-w-[700px] mx-auto">
          Cargoo helps you easily order brand items, small electronics, and fashion directly from the source with zero hassle.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Button size="lg" glow>
            Start Sourcing <ChevronRight size={20} />
          </Button>
          <Button size="lg" variant="outline">
            View Marketplace
          </Button>
        </div>

        {/* Hero Search Mock */}
        <div className="max-w-[600px] mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl flex items-center shadow-2xl">
          <div className="flex-1 px-4 text-left text-sm text-[#94a3b8] font-medium">
            Search products, brands, categories...
          </div>
          <Button className="h-10 px-6 text-xs">Search</Button>
        </div>
      </div>
    </section>
  );
}

export function BentoGrid() {
  return (
    <section className="py-20 bg-[#111111]">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          <div className="md:col-span-2 md:row-span-2 glass-panel p-10 flex flex-col justify-between">
             <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl mb-8 border border-white/20">
               ⚡
             </div>
             <div>
               <h2 className="text-4xl font-black mb-4 uppercase">What is Cargoo?</h2>
               <p className="text-xl text-[#94a3b8] font-medium">
                 Think of us as your personal overseas plug. Spot a sick product on TikTok or Alibaba? Send us the link. 
                 We negotiate the best price, verify quality, and ship it directly to your door.
               </p>
             </div>
          </div>
          
          <div className="glass-panel bg-gradient-to-br from-[#ff5500] to-[#ff1100] border-[#ff5500]/50 p-8 flex flex-col justify-center">
            <span className="text-7xl font-black text-white tracking-tighter">2-4</span>
            <h3 className="text-2xl font-bold text-white/90">Weeks Delivery</h3>
            <p className="text-white/80">Average time from order to porch.</p>
          </div>

          <div className="glass-panel p-8 flex flex-col items-center justify-center text-center">
            <ShieldCheck size={64} className="text-[#2962ff] mb-4" />
            <h3 className="text-xl font-black uppercase">100% Scam-Proof</h3>
            <p className="text-sm">Verified suppliers only.</p>
          </div>

          <div className="glass-panel p-8 flex flex-col items-center justify-center text-center">
            <Handshake size={64} className="text-[#ff5500] mb-4" />
            <h3 className="text-xl font-black uppercase">Personal Support</h3>
            <p className="text-sm">24/7 WhatsApp updates.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
