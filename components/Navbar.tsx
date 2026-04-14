"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { CubeIcon } from "./ui/Icons"; // Helper icon component
import { Package, Menu, X, Rocket } from "lucide-react";
import { RequestDrawer } from "./RequestDrawer";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [requestDrawerOpen, setRequestDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-[1000] border-b transition-all duration-300 ${
        scrolled 
          ? "h-[75px] bg-[#050505]/85 backdrop-blur-3xl border-[rgba(255,255,255,0.1)]" 
          : "h-[90px] bg-transparent border-[rgba(255,255,255,0.05)]"
      }`}>
        <div className="container h-full flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#ff5500] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,85,0,0.3)] group-hover:rotate-12 transition-transform">
              <Package className="text-[#050505]" size={20} />
            </div>
            <span className="text-2xl font-black text-white">Cargoo</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5 bg-white/5 p-1.5 rounded-full border border-white/10">
            <Link href="/products" className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase text-[#ff5500] hover:text-white transition-colors">
              <Rocket size={14} className="animate-pulse" /> Trending Products
            </Link>
            <Link href="#how-it-works" className="px-5 py-2 text-xs font-bold uppercase text-[#94a3b8] hover:text-white transition-colors">How it works</Link>
            <Link href="#services" className="px-5 py-2 text-xs font-bold uppercase text-[#94a3b8] hover:text-white transition-colors">Services</Link>
            <Link href="/blog" className="px-5 py-2 text-xs font-bold uppercase text-[#94a3b8] hover:text-white transition-colors">Blog</Link>
          </nav>

          <div className="flex items-center gap-4">
             <Button 
              variant="outline" 
              className="hidden md:flex gap-2"
              onClick={() => setRequestDrawerOpen(true)}
            >
              <Package size={18} /> Request Sourcing
            </Button>
            <button 
              className="lg:hidden p-2 text-white bg-white/5 rounded-xl border border-[rgba(255,85,0,0.2)]"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-[2000] lg:hidden transition-all duration-500 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />
        <div className={`absolute top-0 right-0 w-full max-w-[320px] h-full bg-[#0b0b0b] p-8 border-l border-white/10 transition-transform duration-500 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex justify-between items-center mb-12">
            <span className="text-2xl font-black">Cargoo</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-full"><X /></button>
          </div>
          <div className="flex flex-col gap-6">
            <Link href="/products" className="text-3xl font-black uppercase tracking-tighter hover:text-[#ff5500]" onClick={() => setMobileMenuOpen(false)}>Products</Link>
            <Link href="#how-it-works" className="text-3xl font-black uppercase tracking-tighter hover:text-[#ff5500]" onClick={() => setMobileMenuOpen(false)}>Process</Link>
            <Link href="#services" className="text-3xl font-black uppercase tracking-tighter hover:text-[#ff5500]" onClick={() => setMobileMenuOpen(false)}>Services</Link>
            <Link href="/blog" className="text-3xl font-black uppercase tracking-tighter hover:text-[#ff5500]" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
            <Button className="mt-8" onClick={() => { setMobileMenuOpen(false); setRequestDrawerOpen(true); }}>Contact Us</Button>
          </div>
        </div>
      </div>

      <RequestDrawer isOpen={requestDrawerOpen} onClose={() => setRequestDrawerOpen(false)} />
    </>
  );
}
