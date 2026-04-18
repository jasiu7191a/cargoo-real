import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Share2, MoveRight } from "lucide-react";

interface ResourcePageProps {
  params: {
    lang: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: ResourcePageProps) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!post) return { title: "Article Not Found" };

  return {
    title: `${post.title} | Cargoo Import`,
    description: post.metaDescription,
    alternates: {
      canonical: `https://cargooimport.eu/${params.lang}/resources/${params.slug}`,
    },
  };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const post = await prisma.blogPost.findUnique({
    where: { 
      slug: params.slug,
      status: "PUBLISHED" 
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Back Button */}
        <Link 
          href={`/${params.lang}`} 
          className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-[#ff5500] transition-colors mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Header Section */}
        <div className="space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5500]/10 border border-[#ff5500]/20 text-[#ff5500] text-xs font-black uppercase tracking-widest">
            Sourcing Guide
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#94a3b8] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Calendar size={16} /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} /> 6 min read
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <Share2 size={16} /> Share
            </div>
          </div>
        </div>

        {/* Featured Image Placeholder (Rich Aesthetic) */}
        <div className="w-full h-[400px] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl border border-white/5 mb-16 flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 brightness-50 grayscale hover:grayscale-0 hover:opacity-50 transition-all duration-1000"></div>
           <div className="relative z-10 text-center space-y-4">
              <div className="text-[#ff5500] font-black text-7xl opacity-20">CARGOO</div>
           </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <article className="prose prose-invert prose-orange max-w-none prose-headings:uppercase prose-headings:font-black prose-headings:tracking-tighter prose-p:text-[#94a3b8] prose-p:leading-relaxed prose-strong:text-white prose-a:text-[#ff5500] hover:prose-a:underline">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </article>
          </div>

          {/* Sidebar CTA */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="glass-panel p-8 bg-gradient-to-b from-[#ff5500]/20 to-transparent border-[#ff5500]/30 shadow-[0_20px_50px_rgba(255,85,0,0.1)]">
                <h3 className="text-xl font-black uppercase mb-4 leading-tight">Ready to start importing?</h3>
                <p className="text-sm text-[#94a3b8] mb-8 font-medium">Use our real-time calculator to get an instant landed cost estimate for your shipment.</p>
                <Link href={`/${params.lang}#calculator`}>
                  <Button className="w-full py-6 text-base" glow>
                    Calculate Now <MoveRight size={20} />
                  </Button>
                </Link>
                <div className="mt-6 pt-6 border-t border-white/10 text-center text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">
                   100% Free • Secure • Instant
                </div>
              </div>

              <div className="glass-panel p-8">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#94a3b8] mb-6 underline decoration-[#ff5500] underline-offset-8">Related Strategy</h4>
                <ul className="space-y-6">
                  <li className="group cursor-pointer">
                    <div className="text-[10px] text-[#ff5500] font-black uppercase mb-1 tracking-tighter tracking-widest">Pricing</div>
                    <p className="text-sm font-bold group-hover:text-[#ff5500] transition-colors">How to calculate VAT and Import Duties in 2026</p>
                  </li>
                  <li className="group cursor-pointer">
                    <div className="text-[10px] text-[#ff5500] font-black uppercase mb-1 tracking-widest">Quality</div>
                    <p className="text-sm font-bold group-hover:text-[#ff5500] transition-colors">The Inspection Checklist: 5 things to check</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
