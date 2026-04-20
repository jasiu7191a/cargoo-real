"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials. Access denied.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("A system error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-[#ff5500]/30 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff5500]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-[#ff5500]/10 border border-[#ff5500]/20 rounded-3xl mb-6 shadow-[0_0_30px_rgba(255,85,0,0.15)]">
            <ShieldCheck size={40} className="text-[#ff5500]" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Gatekeeper</h1>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#94a3b8] opacity-60">Authorize Admin Session</p>
        </div>

        <div className="glass-panel p-8 border-white/10 shadow-2xl relative overflow-hidden">
          {/* Progress bar for loading state */}
          {isLoading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#ff5500]/20 overflow-hidden">
              <div className="h-full bg-[#ff5500] animate-progress-indeterminate w-1/3" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">System Identifier</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#4a4a4a] group-focus-within:text-[#ff5500] transition-colors">
                  <Mail size={16} />
                </div>
                <Input 
                  type="email" 
                  placeholder="admin@cargooimport.eu"
                  className="pl-12 bg-black/40 border-white/5 focus:border-[#ff5500]/50 h-14 rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Access Cipher</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#4a4a4a] group-focus-within:text-[#ff5500] transition-colors">
                  <Lock size={16} />
                </div>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  className="pl-12 bg-black/40 border-white/5 focus:border-[#ff5500]/50 h-14 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 rounded-xl text-sm font-black uppercase tracking-widest gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Validating...
                </>
              ) : (
                <>
                  Initialize Access <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#4a4a4a]">Cargoo Global Admin • Secure Protocol v4.2</p>
        </div>
      </div>
    </div>
  );
}
