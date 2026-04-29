"use client";

import React, { useState } from "react";
import { Button } from "./ui/Button";
import { ChevronRight, Calculator, ShieldCheck, Truck, Handshake, Loader2, Zap } from "lucide-react";

export function Hero() {
  const [productName, setProductName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !email) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          email,
          quantity: 1,
          notes: "Quick inquiry from Hero section search bar"
        })
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Source Direct. <br />
          <span className="gradient-text">Zero <span className="line-through text-white/30 decoration-white/30">Middleman</span>.</span>
        </h1>
        
        <p className="text-[clamp(1.1rem,2vw,1.5rem)] text-[#94a3b8] font-medium mb-10 max-w-[700px] mx-auto">
          Cargoo helps you easily order brand items, small electronics, and fashion directly from the source with zero hassle.
        </p>

        {submitted ? (
          <div className="max-w-[500px] mx-auto glass-panel p-8 animate-in fade-in zoom-in-95 duration-500">
             <div className="text-[#00c853] font-bold uppercase tracking-widest text-sm mb-2">Success!</div>
             <h3 className="text-xl font-bold mb-4">Inquiry for "{productName}" Sent</h3>
             <p className="text-sm text-[#94a3b8]">Our agents will email you at {email} with pricing options today.</p>
             <button className="mt-6 text-xs text-[#ff5500] font-black uppercase hover:underline" onClick={() => setSubmitted(false)}>Submit another link</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-[700px] mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-2xl">
            <input 
              required
              className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-[#94a3b8] focus:outline-none"
              placeholder="Paste product link or name..."
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
            <input 
              required
              type="email"
              className="flex-1 bg-white/5 border-x border-white/10 sm:border-y-0 sm:border-x px-4 py-3 text-sm text-white placeholder:text-[#94a3b8] focus:outline-none"
              placeholder="Your Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Button type="submit" className="h-full px-8 uppercase font-black tracking-tighter" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Get Price"}
            </Button>
          </form>
        )}
        
        <div className="mt-8 text-xs text-[#94a3b8] uppercase tracking-[0.3em] font-medium">
          Trusted by 400+ active importers in Europe
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

export function SourcingResources() {
  return (
    <section className="py-24 bg-[#050505] border-t border-white/5">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-[600px]">
            <span className="text-[#ff5500] font-black uppercase tracking-widest text-sm mb-4 block">Knowledge Hub</span>
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-6">Expert Sourcing <span className="gradient-text">Guides</span>.</h2>
            <p className="text-lg text-[#94a3b8]">Master the art of importing from China with our technical guides on VAT, supplier verification, and logistics.</p>
          </div>
          <Button variant="outline" className="group">
            View All Resources <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ResourcePreview 
            tag="Logistics"
            title="How to optimize shipping costs for small electronics"
            desc="Learn how to choose between Air Express and Sea Freight based on your volume."
            image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
          />
          <ResourcePreview 
            tag="Security"
            title="5 Signs your Alibaba supplier is a middleman"
            desc="Identifying factories vs trading companies can save you up to 30% in fees."
            image="https://images.unsplash.com/photo-1553413766-41f9d287af3c?q=80&w=2089&auto=format&fit=crop"
          />
          <ResourcePreview 
            tag="Taxes"
            title="Understanding VAT & Import Duties in the EU"
            desc="A complete breakdown of IOSS, customs clearance, and local tax requirements."
            image="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop"
          />
        </div>
      </div>
    </section>
  );
}

function ResourcePreview({ tag, title, desc, image }: { tag: string; title: string, desc: string, image: string }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative h-64 rounded-3xl overflow-hidden mb-6 border border-white/10 group-hover:border-[#ff5500]/50 transition-all">
        <div className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" style={{ backgroundImage: `url(${image})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-80"></div>
        <div className="absolute bottom-6 left-6">
           <span className="bg-[#ff5500] text-[#050505] text-[10px] font-black uppercase px-3 py-1 rounded-full mb-3 inline-block tracking-tighter tracking-widest">
             {tag}
           </span>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-[#ff5500] transition-colors uppercase leading-tight">{title}</h3>
      <p className="text-[#94a3b8] text-sm leading-relaxed line-clamp-2 font-medium">{desc}</p>
    </div>
  );
}

export function ClientTestimonials() {
  return (
    <section className="py-24 bg-[#111111]">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-[#ff5500] font-black uppercase tracking-widest text-sm mb-4 block">Success Stories</span>
          <h2 className="text-5xl font-black uppercase tracking-tighter">Trusted by 400+ <span className="gradient-text">Importers</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard 
            name="Marek S."
            role="Electronics Distributor"
            country="Poland"
            text="Cargoo turned my sourcing nightmare into a dream. They verified 3 suppliers in Shenzen and found me the best price. Saved about 20% on my last container."
          />
          <TestimonialCard 
            name="Julian K."
            role="Amazon FBA Seller"
            country="Germany"
            text="The real-time updates on WhatsApp are a game changer. I always know where my goods are. No more guessing games with random agents."
          />
          <TestimonialCard 
            name="Sophie L."
            role="Boutique Owner"
            country="France"
            text="Very impressed with the quality control. The video inspection service prevented us from receiving a bad batch of textiles. Highly recommend."
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ name, role, country, text }: { name: string; role: string, country: string, text: string }) {
  return (
    <div className="glass-panel p-8 relative hover:border-[#ff5500]/30 transition-all group">
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Zap key={i} size={16} className="text-[#ff5500] fill-[#ff5500]" />
        ))}
      </div>
      <p className="text-[#94a3b8] font-medium leading-relaxed mb-8 italic">"{text}"</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-black text-[#ff5500] border border-white/10">
          {name[0]}
        </div>
        <div>
          <div className="font-bold text-white group-hover:text-[#ff5500] transition-colors">{name}</div>
          <div className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest">{role} • {country}</div>
        </div>
      </div>
    </div>
  );
}
