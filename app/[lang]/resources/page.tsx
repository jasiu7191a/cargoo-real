import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { MoveRight, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface ResourcesPageProps {
  params: {
    lang: string;
  };
}

export default async function ResourcesPage({ params }: ResourcesPageProps) {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      
      <div className="pt-44 pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-20">
            <span className="text-[#ff5500] font-black uppercase tracking-widest text-sm mb-4 block">Information Center</span>
            <h1 className="text-[clamp(3rem,8vw,5rem)] font-black uppercase tracking-tighter leading-none mb-8">
              Sourcing <span className="gradient-text">Intelligence</span>.
            </h1>
            <p className="text-xl text-[#94a3b8] font-medium leading-relaxed">
              Expert guides, logistics deep-dives, and market analysis to help European businesses master the art of importing from China.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
               <p className="text-[#94a3b8] font-bold">Our sourcing experts are currently drafting new intelligence. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {posts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/${params.lang}/resources/${post.slug}`}
                  className="group flex flex-col"
                >
                  <div className="relative h-72 rounded-[2.5rem] overflow-hidden mb-8 border border-white/10 group-hover:border-[#ff5500]/50 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-white/5 font-black text-6xl italic group-hover:scale-110 transition-transform duration-700">CARGOO</span>
                    </div>
                    <div className="absolute inset-x-8 bottom-8 flex justify-between items-end">
                       <span className="inline-block bg-[#ff5500] text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                         {post.targetKeyword || "Sourcing"}
                       </span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-[#ff5500] transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-[#94a3b8] text-sm leading-relaxed line-clamp-2 font-medium mb-6">
                    {post.metaDescription}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-[#ff5500] text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                    Read Intelligence <MoveRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
