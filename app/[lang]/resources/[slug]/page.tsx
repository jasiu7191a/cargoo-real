import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface ResourcePageProps {
  params: {
    lang: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: ResourcePageProps) {
  let post: any = null;
  try {
    post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  } catch (e) {
    return { title: "Article Not Found" };
  }
  if (!post) return { title: "Article Not Found" };
  return {
    title: `${post.title} | Cargoo Import`,
    description: post.metaDescription,
    alternates: {
      canonical: `https://www.cargooimport.eu/${params.lang}/resources/${params.slug}`,
    },
  };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  let post: any = null;
  try {
    post = await prisma.blogPost.findUnique({
      where: { slug: params.slug, status: "PUBLISHED" },
    });
  } catch (e) {
    console.error("DB error:", e);
  }

  if (!post) notFound();

  return (
    <>
      <Navbar lang={params.lang} />

      <main style={{ paddingTop: "120px", paddingBottom: "80px" }}>
        <div className="container" style={{ maxWidth: "900px" }}>
          <Link
            href={`/${params.lang}/resources`}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--clr-text-muted)", textDecoration: "none", marginBottom: "3rem", fontWeight: 700, fontSize: "0.9rem" }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Guides
          </Link>

          <div style={{ marginBottom: "3rem" }}>
            <span
              style={{
                background: "rgba(255,85,0,0.1)",
                color: "var(--clr-orange)",
                padding: "0.3rem 0.75rem",
                borderRadius: "9999px",
                fontSize: "0.65rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "inline-block",
                marginBottom: "1.5rem",
              }}
            >
              {post.targetKeyword || "Sourcing Guide"}
            </span>
            <h1
              style={{
                fontSize: "clamp(2rem, 6vw, 3.5rem)",
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#fff",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              {post.title}
            </h1>
            <div style={{ display: "flex", gap: "2rem", color: "var(--clr-text-muted)", fontSize: "0.85rem", fontWeight: 700 }}>
              <span>
                <i className="fa-regular fa-calendar" style={{ marginRight: "6px", color: "var(--clr-orange)" }}></i>
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
              </span>
              <span>
                <i className="fa-regular fa-clock" style={{ marginRight: "6px", color: "var(--clr-orange)" }}></i>
                6 min read
              </span>
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1.25rem",
              padding: "2.5rem",
              marginBottom: "4rem",
              color: "var(--clr-text)",
              lineHeight: 1.8,
              fontSize: "1.05rem",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.02em", marginBottom: "1rem", marginTop: "2rem" }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.02em", marginBottom: "0.75rem", marginTop: "2rem" }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem", marginTop: "1.5rem" }}>{children}</h3>,
                p: ({ children }) => <p style={{ color: "var(--clr-text-muted)", marginBottom: "1.25rem" }}>{children}</p>,
                strong: ({ children }) => <strong style={{ color: "#fff", fontWeight: 800 }}>{children}</strong>,
                a: ({ href, children }) => <a href={href} style={{ color: "var(--clr-orange)", textDecoration: "underline" }}>{children}</a>,
                ul: ({ children }) => <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.25rem", color: "var(--clr-text-muted)" }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ paddingLeft: "1.5rem", marginBottom: "1.25rem", color: "var(--clr-text-muted)" }}>{children}</ol>,
                li: ({ children }) => <li style={{ marginBottom: "0.5rem" }}>{children}</li>,
                blockquote: ({ children }) => <blockquote style={{ borderLeft: "3px solid var(--clr-orange)", paddingLeft: "1.25rem", color: "var(--clr-text-muted)", fontStyle: "italic", margin: "1.5rem 0" }}>{children}</blockquote>,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <div
            className="glass-panel"
            style={{ padding: "2.5rem", textAlign: "center" }}
          >
            <h3 style={{ fontSize: "1.4rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "1rem", color: "#fff" }}>
              Ready to start importing?
            </h3>
            <p style={{ color: "var(--clr-text-muted)", marginBottom: "1.5rem" }}>
              Send us a product link on WhatsApp — we&apos;ll quote it within 24 hours.
            </p>
            <a
              href="https://wa.me/48500685000?text=Hi%20Cargoo%2C%20I%27d%20like%20a%20quote%20for..."
              target="_blank"
              rel="noopener"
              className="btn btn-primary btn-glow"
            >
              <i className="fa-brands fa-whatsapp"></i> Get a Free Quote
            </a>
          </div>
        </div>
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

      <Footer lang={params.lang} />
    </>
  );
}
