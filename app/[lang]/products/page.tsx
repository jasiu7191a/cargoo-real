import React from "react";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Search, Filter, ArrowRight, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";

async function getProducts() {
  // In a real app, these would be the seeded products or recently sourced ones
  return await prisma.lead.findMany({
    where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
    take: 12,
  });
}

export default async function ProductsPage({ params }: { params: { lang: string } }) {
  const products = await getProducts();

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-40 pb-20 bg-[#050505]">
        <div className="container">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-[700px]">
              <div className="flex items-center gap-2 text-[#ff5500] font-black uppercase tracking-widest text-xs mb-4">
                 <TrendingUp size={16} /> Market Insights
              </div>
              <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                Trending Sourcing <br /><span className="text-[#94a3b8]">Catalog 2026</span>
              </h1>
              <p className="text-[#94a3b8] text-xl">
                Explore items recently sourced for our community of resellers and collectors. Direct factory pricing with verified quality.
              </p>
            </div>
          </div>

          <div className="flex gap-4 mb-12">
             <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4 focus-within:border-[#2962ff] transition-all">
                <Search className="text-[#94a3b8]" size={20} />
                <input className="bg-transparent border-none text-white w-full focus:outline-none" placeholder="Search by brand, product or category..." />
             </div>
             <button className="bg-white/5 border border-white/10 px-8 rounded-2xl font-bold uppercase text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
                <Filter size={18} /> Filters
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.length === 0 ? (
              // Mock items if DB is empty
              <>
                <ProductCard name="Air Jordan 1 Retro Low OG" brand="Jordan" price="€120" target="€190" />
                <ProductCard name="Dyson Airwrap Styler" brand="Dyson" price="€310" target="€549" />
                <ProductCard name="Sony PlayStation 5 Slim" brand="Sony" price="€380" target="€499" />
                <ProductCard name="Prada Re-Edition 2005" brand="Prada" price="€650" target="€1200" />
              </>
            ) : products.map(p => (
              <ProductCard 
                key={p.id} 
                name={p.productName} 
                brand="Verified Supplier" 
                price="€???" 
                target="Estimate" 
              />
            ))}
          </div>
          
          <div className="mt-20 glass-panel p-16 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff5500]/10 blur-[100px] z-[-1]" />
             <h2 className="text-4xl font-black uppercase mb-6">Didn't find what you wanted?</h2>
             <p className="text-[#94a3b8] mb-10 max-w-[600px] mx-auto">Our sourcing team can find almost any product manufactured in China. Send us a link and we'll handle the rest.</p>
             <Button size="lg" glow>Submit Custom Request</Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ProductCard({ name, brand, price, target }: { name: string; brand: string; price: string; target: string }) {
  return (
    <div className="glass-panel p-2 flex flex-col group transition-all duration-500">
      <div className="aspect-square bg-[#111] rounded-[1.4rem] mb-6 flex items-center justify-center relative overflow-hidden">
         <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-[#00c853] z-10">
           ~40% Saved
         </div>
         <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
            <Star className="text-white/20" size={32} />
         </div>
      </div>
      <div className="px-4 pb-6">
        <div className="text-[10px] font-black uppercase text-[#ff5500] mb-2">{brand}</div>
        <h3 className="font-bold text-lg mb-4 line-clamp-1 leading-tight group-hover:text-[#ff5500] transition-colors">{name}</h3>
        <div className="flex justify-between items-end border-t border-white/5 pt-4">
           <div>
              <div className="text-[10px] uppercase font-black text-[#94a3b8]">Cargoo Price</div>
              <div className="text-xl font-black text-white">{price}</div>
           </div>
           <div className="text-right">
              <div className="text-[10px] uppercase font-black text-[#94a3b8]">Retail</div>
              <div className="text-sm font-bold text-[#94a3b8] line-through">{target}</div>
           </div>
        </div>
      </div>
    </div>
  );
}
