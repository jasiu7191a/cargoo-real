"use client";

import React, { useState } from "react";
import { Button } from "./ui/Button";

export function PricingCalculator() {
  const [productCost, setProductCost] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [shippingMethod, setShippingMethod] = useState("air_express");
  const [results, setResults] = useState<{
    product: number;
    shipping: number;
    service: number;
    total: number;
  } | null>(null);

  const calculate = () => {
    const cost = Number(productCost) || 0;
    const w = Number(weight) || 0;
    
    let shippingRate = 0;
    if (shippingMethod === "air_standard") {
      shippingRate = Math.max(w * 15, 15);
    } else {
      shippingRate = Math.max(w * 18, 18);
    }

    const serviceFee = (cost * 0.1) + 50;
    const total = cost + shippingRate + serviceFee;

    setResults({
      product: cost,
      shipping: shippingRate,
      service: serviceFee,
      total: total
    });
  };

  return (
    <section className="py-20 bg-[#111111]" id="pricing">
      <div className="container max-w-[800px]">
        <div className="glass-panel p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2962ff]/10 blur-[100px] z-[-1]" />
          
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4 uppercase">Estimate Your Costs</h2>
            <p className="text-[#94a3b8]">Get a rough idea of your total landed cost from China.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[#94a3b8]">Total Product Cost (€)</label>
              <input 
                type="number" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#2962ff] transition-all"
                placeholder="e.g. 500"
                value={productCost}
                onChange={(e) => setProductCost(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[#94a3b8]">Estimated Weight (kg)</label>
              <input 
                type="number" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#2962ff] transition-all"
                placeholder="e.g. 5"
                value={weight}
                onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase text-[#94a3b8]">Shipping Method</label>
              <select 
                className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#2962ff] transition-all"
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
              >
                <option value="air_standard">Standard Air (€15/kg)</option>
                <option value="air_express">Express Air (€18/kg)</option>
              </select>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={calculate}>Calculate Estimate</Button>

          {results && (
            <div className="mt-12 pt-12 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-[#94a3b8]">Product Cost</span>
                  <span className="text-white font-bold">€{results.product.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-[#94a3b8]">Est. Shipping</span>
                  <span className="text-white font-bold">€{results.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-[#94a3b8]">Service & Customs</span>
                  <span className="text-white font-bold">€{results.service.toFixed(2)}</span>
                </div>
                <div className="h-px bg-white/10 my-6" />
                <div className="flex justify-between text-3xl font-black">
                  <span>Total Landed Cost</span>
                  <span className="text-[#ff5500]">€{results.total.toFixed(2)}</span>
                </div>
              </div>
              <p className="mt-8 text-xs text-[#94a3b8] italic text-center">
                *This is a rough estimate. Actual costs vary based on volumetric weight and tariffs.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
