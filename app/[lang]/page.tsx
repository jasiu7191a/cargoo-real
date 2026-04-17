import { Navbar } from "@/components/Navbar";
export const dynamic = 'force-dynamic';
import { Hero, BentoGrid, SourcingResources } from "@/components/LandingPage";
import { PricingCalculator } from "@/components/PricingCalculator";
import { Footer } from "@/components/Footer";
import { CheckCircle, Truck, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      
      {/* Social Proof Bar */}
      <div className="bg-[#050505] py-10 border-y border-white/5">
        <div className="container overflow-hidden">
          <div className="flex flex-wrap justify-between gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             <span className="text-xl font-bold">NIKE</span>
             <span className="text-xl font-bold">ADIDAS</span>
             <span className="text-xl font-bold">APPLE</span>
             <span className="text-xl font-bold">SONY</span>
             <span className="text-xl font-bold">ROLEX</span>
             <span className="text-xl font-bold">PRADA</span>
          </div>
        </div>
      </div>

      <BentoGrid />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        <div className="container">
          <div className="text-center mb-20">
            <span className="text-[#ff5500] font-black uppercase tracking-widest text-sm mb-4 block">The Process</span>
            <h2 className="text-5xl font-black uppercase tracking-tighter">Four Steps to Your Door</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard 
              number="1" 
              title="Request Items" 
              description="Send us a link or description of any product you want to source from China."
              icon={<Zap className="text-white" size={32} />}
            />
            <StepCard 
              number="2" 
              title="Get Estimate" 
              description="Our experts evaluate suppliers and provide a total landed cost quote."
              icon={<ShieldCheck className="text-white" size={32} />}
            />
            <StepCard 
              number="3" 
              title="Quality Check" 
              description="We order to our China hub, verify quality via video, and secure your goods."
              icon={<Truck className="text-white" size={32} />}
            />
            <StepCard 
              number="4" 
              title="Direct Delivery" 
              description="We handle all customs and delivery logistics straight to your doorstep."
              icon={<CheckCircle className="text-white" size={32} />}
            />
          </div>
        </div>
      </section>

      <PricingCalculator />
      <SourcingResources />

      {/* Trust Signal Section */}
      <section className="py-24 bg-[#050505]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl font-black uppercase tracking-tighter leading-tight">
                Why trust <span className="text-[#ff5500]">Cargoo</span>?
              </h2>
              <p className="text-xl text-[#94a3b8]">
                We aren't just a shipping company. We are your eyes and ears on the ground in China. 
                We prevent scams, negotiate prices, and ensure you get exactly what you paid for.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-4 items-center font-bold text-white">
                  <div className="w-6 h-6 bg-[#00c853]/20 text-[#00c853] rounded-full flex items-center justify-center">✓</div>
                  No experience needed for beginners
                </li>
                <li className="flex gap-4 items-center font-bold text-white">
                  <div className="w-6 h-6 bg-[#00c853]/20 text-[#00c853] rounded-full flex items-center justify-center">✓</div>
                  Transparent pricing with zero hidden fees
                </li>
                <li className="flex gap-4 items-center font-bold text-white">
                  <div className="w-6 h-6 bg-[#00c853]/20 text-[#00c853] rounded-full flex items-center justify-center">✓</div>
                  Audited manufacturers only
                </li>
              </ul>
            </div>
            <div className="glass-panel p-2 aspect-square relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-[#ff5500]/20 to-transparent" />
               <div className="h-full w-full bg-[#111] rounded-[1.4rem] flex items-center justify-center">
                  <span className="text-sm font-bold opacity-30 uppercase tracking-[0.5em]">Logistics Visualization</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function StepCard({ number, title, description, icon }: { number: string; title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="glass-panel p-10 relative group hover:bg-white/[0.07] transition-all">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:border-[#ff5500]/50 transition-colors">
        {icon}
      </div>
      <span className="absolute top-10 right-10 text-4xl font-black text-white/5 group-hover:text-[#ff5500]/20 transition-colors">0{number}</span>
      <h3 className="text-xl font-bold mb-4 uppercase">{title}</h3>
      <p className="text-sm text-[#94a3b8] leading-relaxed">{description}</p>
    </div>
  );
}
