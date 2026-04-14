import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Phone, Mail, Package } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#020202] text-[#94a3b8] pt-24 pb-12 border-t border-white/5">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-[#ff5500] rounded-lg flex items-center justify-center">
                <Package className="text-[#050505]" size={16} />
              </div>
              <span className="text-xl font-black text-white">Cargoo</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Import from China Made Simple. We help you easily order brand items, electronics, and fashion with verified quality and guaranteed delivery.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-8">Company</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="#services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Insights & Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-8">Contact Us</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-[#ff5500]" />
                <a href="mailto:cargooimport@gmail.com" className="hover:text-white transition-colors">cargooimport@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[#ff5500]" />
                <a href="tel:+48500685000" className="hover:text-white transition-colors">+48 500 685 000</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-8">Legal</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs">
            © {new Date().getFullYear()} Cargoo. All rights reserved.
          </p>
          <div className="flex gap-4 opacity-50">
             {/* Payment Icons Placeholder */}
             <div className="w-10 h-6 bg-white/20 rounded-md" />
             <div className="w-10 h-6 bg-white/20 rounded-md" />
             <div className="w-10 h-6 bg-white/20 rounded-md" />
          </div>
        </div>
      </div>
    </footer>
  );
}
