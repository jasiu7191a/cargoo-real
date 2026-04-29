import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function ResourcesPage({ params }: { params: { lang: string } }) {
  const lang = params.lang || "en";
  let posts: any[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    });
  } catch (e) {
    console.error("Failed to load blog posts:", e);
  }

  return (
    <>
      <Navbar lang={lang} />

      <main style={{ minHeight: "100vh" }}>
        <section style={{ padding: "120px 0 80px" }}>
          <div className="container">
            <div style={{ marginBottom: "5rem", textAlign: "center" }}>
              <span className="subtitle" style={{ color: "var(--clr-orange)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "4px", fontSize: "0.8rem", display: "block", marginBottom: "1.5rem" }}>
                Knowledge Base
              </span>
              <h1 style={{ fontSize: "clamp(3rem, 8vw, 5rem)", fontWeight: 900, lineHeight: 1, marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "-2px", color: "#fff" }}>
                Sourcing <span className="gradient-text">Guides</span>
              </h1>
              <div style={{ height: "4px", width: "60px", background: "var(--clr-orange)", margin: "0 auto 2rem", borderRadius: "2px" }}></div>
              <p style={{ color: "var(--clr-text-muted)", fontSize: "clamp(1rem, 2vw, 1.3rem)", maxWidth: "700px", margin: "0 auto", lineHeight: 1.6 }}>
                Expert guides, logistics deep-dives, and market analysis to help you master importing from China.
              </p>
            </div>

            {posts.length === 0 ? (
              <div
                style={{
                  padding: "5rem 2rem",
                  textAlign: "center",
                  border: "2px dashed rgba(255,255,255,0.07)",
                  borderRadius: "1.5rem",
                }}
              >
                <i className="fa-solid fa-pen-nib" style={{ fontSize: "2.5rem", color: "var(--clr-text-muted)", marginBottom: "1.5rem", display: "block" }}></i>
                <p style={{ color: "var(--clr-text-muted)", fontWeight: 700 }}>
                  Our sourcing experts are currently drafting new guides. Check back soon.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/${lang}/resources/${post.slug}`}
                    style={{
                      textDecoration: "none",
                      display: "block",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "1.25rem",
                      padding: "1.75rem",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <span
                      style={{
                        background: "rgba(255,85,0,0.1)",
                        color: "var(--clr-orange)",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "9999px",
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {post.targetKeyword || "Sourcing"}
                    </span>
                    <h2
                      style={{
                        color: "#fff",
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                        margin: "0.85rem 0 0.5rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {post.title}
                    </h2>
                    <p style={{ color: "var(--clr-text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                      {post.metaDescription}
                    </p>
                    <div style={{ color: "var(--clr-orange)", fontWeight: 700, fontSize: "0.8rem", marginTop: "1.25rem" }}>
                      Read guide →
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <a
        href="https://wa.me/48500685000?text=Hi%20Cargoo%2C%20I%27d%20like%20a%20quote%20for..."
        target="_blank"
        rel="noopener"
        className="floating-whatsapp"
        aria-label="Contact on WhatsApp"
      >
        <i className="fa-brands fa-whatsapp"></i>
      </a>

      <Footer lang={lang} />
    </>
  );
}
