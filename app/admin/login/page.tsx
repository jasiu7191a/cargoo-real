export const dynamic = 'force-dynamic';
"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Package, Lock, Mail, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials. Please try again.");
      setIsLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Mesh Background */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="mesh-blob w-[50vw] h-[50vw] bg-[#ff5500] top-[-20%] right-[-10%] opacity-20" />
        <div className="mesh-blob w-[40vw] h-[40vw] bg-[#2962ff] bottom-[-20%] left-[-10%] opacity-20" />
      </div>

      <div className="w-full max-w-[450px]">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 bg-[#ff5500] rounded-2xl items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,85,0,0.3)]">
            <Package size={32} className="text-black" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Cargoo HQ</h1>
          <p className="text-[#94a3b8] mt-2">Authorized Personnel Only</p>
        </div>

        <div className="glass-panel p-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold uppercase text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#94a3b8] tracking-widest pl-1">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                <Input 
                  type="email" 
                  placeholder="admin@cargoo.com" 
                  className="pl-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#94a3b8] tracking-widest pl-1">Secret Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button className="w-full h-14" type="submit" disabled={isLoading} glow>
              {isLoading ? "Authenticating..." : "Access Dashboard"} <ArrowRight size={20} className="ml-2" />
            </Button>
          </form>
          
          <div className="mt-8 text-center">
             <button className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] hover:text-white transition-colors">
               Forgot Password?
             </button>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-[#94a3b8] font-medium">
          Secure connection established via SSL/AES-256
        </p>
      </div>
    </main>
  );
}

