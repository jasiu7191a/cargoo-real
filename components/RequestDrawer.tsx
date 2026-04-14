"use client";

import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { submitProductRequest } from "@/lib/actions";
import { X, Send, Package, Globe, CheckCircle2 } from "lucide-react";

export function RequestDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    productUrl: "",
    quantity: 1,
    email: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await submitProductRequest(formData);
    
    setIsSubmitting(false);
    if (result.success) {
      setStep(3); // Success step
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] transition-opacity" 
        onClick={onClose} 
      />
      <div className="fixed top-0 right-0 w-full max-w-[450px] h-full bg-[#0b0b0b] z-[2100] border-l border-[rgba(255,255,255,0.1)] shadow-2xl transition-transform flex flex-col p-8">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-xl font-bold">New Sourcing Request</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <span className="text-[#ff5500] text-xs font-bold uppercase tracking-widest mb-2 block">Step 1 of 2</span>
              <h2 className="text-2xl font-black mb-4">What are we importing?</h2>
              <p className="text-[#94a3b8] text-sm">Paste a link from AliExpress, Alibaba, or just describe the item.</p>
            </div>
            
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <div>
                <label className="block text-xs font-bold uppercase text-[#94a3b8] mb-2">Product Name or Link</label>
                <Input 
                  required
                  placeholder="e.g. Nike Dunk Low or product URL" 
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#94a3b8] mb-2">Quantity</label>
                <Input 
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                />
              </div>
              <Button type="submit" className="w-full mt-4" glow>
                Next Step <Send size={18} />
              </Button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <span className="text-[#ff5500] text-xs font-bold uppercase tracking-widest mb-2 block">Step 2 of 2</span>
              <h2 className="text-2xl font-black mb-4">Where should we send the quote?</h2>
              <p className="text-[#94a3b8] text-sm">Our sourcing team will analyze the supplier and send you a landed cost estimate.</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold uppercase text-[#94a3b8] mb-2">Your Email Address</label>
                <Input 
                  type="email"
                  required
                  placeholder="hello@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#94a3b8] mb-2">Additional Notes (Optional)</label>
                <textarea 
                  className="w-full h-32 rounded-[1rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2962ff] transition-all"
                  placeholder="Any specific quality requirements or target price..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <Button variant="outline" type="button" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button type="submit" className="flex-[2]" disabled={isSubmitting} glow>
                  {isSubmitting ? "Sourcing..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-[rgba(0,200,83,0.1)] text-[#00c853] rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-black mb-4">REQUEST SENT!</h2>
            <p className="text-[#94a3b8] mb-8">Our agents in China are now analyzing your request. You&apos;ll receive an estimate via email within 24 hours.</p>
            <Button variant="outline" onClick={onClose} className="w-full">Close Portal</Button>
          </div>
        )}
      </div>
    </>
  );
}
