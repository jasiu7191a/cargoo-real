import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";

export const dynamic = "force-dynamic";

// Generate SEO metadata from the blog post
export async function generateMetadata({ params }: { params: { slug: string; lang: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post) return {};
  return {
    title: post.title + " | Cargoo Import",
    description: post.metaDescription || "",
    openGraph: {
      title: post.title,
      description: post.metaDescription || "",
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
    alternates: {
      canonical: `https://cargooimport.eu/${params.lang}/blog/${params.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string; lang: string } }) {
  const dict = getDictionary(params.lang);
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main style={{ background: "#050505", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.metaDescription,
            datePublished: post.publishedAt?.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: { "@type": "Organization", name: "Cargoo Import" },
            publisher: {
              "@type": "Organization",
              name: "Cargoo Import",
              logo: { "@type": "ImageObject", url: "https://cargooimport.eu/img/logo.png" },
            },
          }),
        }}
      />

      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem 0" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href={`/${params.lang}`} style={{ color: "#ff5500", fontWeight: 800, textDecoration: "none", fontSize: "1.1rem", letterSpacing: "-0.03em" }}>
            {dict.common.brandBack}
          </Link>
          <Link href={`/${params.lang}/blog`} style={{ color: "#94a3b8", fontWeight: 600, textDecoration: "none", fontSize: "0.85rem" }}>
            {dict.common.allArticles}
          </Link>
        </div>
      </header>

      {/* Article */}
      <article style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 1.5rem" }}>
        {/* Meta */}
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          {post.targetKeyword && (
            <span style={{ background: "rgba(255,85,0,0.1)", color: "#ff5500", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {post.targetKeyword}
            </span>
          )}
          {post.publishedAt && (
            <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
              {new Date(post.publishedAt).toLocaleDateString(params.lang, { year: "numeric", month: "long", day: "numeric" })}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: "1.5rem", color: "#ffffff" }}>
          {post.title}
        </h1>

        {/* Meta Description as intro */}
        {post.metaDescription && (
          <p style={{ fontSize: "1.15rem", color: "#94a3b8", marginBottom: "3rem", lineHeight: 1.7, borderLeft: "3px solid #ff5500", paddingLeft: "1.25rem" }}>
            {post.metaDescription}
          </p>
        )}

        <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", marginBottom: "3rem" }} />

        {/* Markdown Content */}
        <div className="prose-content">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>

      {/* CTA Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "4rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "1rem" }}>
            {dict.blogPost.ctaTitle}
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "2rem", lineHeight: 1.7 }}>
            {dict.blogPost.ctaDescription}
          </p>
          <Link
            href={`/${params.lang}`}
            style={{ display: "inline-block", background: "#ff5500", color: "#000", padding: "1rem 2.5rem", borderRadius: "9999px", fontWeight: 900, textDecoration: "none", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            {dict.blogPost.ctaButton}
          </Link>
        </div>
      </div>

      <style>{`
        .prose-content h1, .prose-content h2, .prose-content h3 {
          color: #ffffff;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.15;
        }
        .prose-content h1 { font-size: 1.9rem; }
        .prose-content h2 { font-size: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem; }
        .prose-content h3 { font-size: 1.2rem; color: #ff5500; }
        .prose-content p { line-height: 1.8; margin-bottom: 1.25rem; color: #cbd5e1; }
        .prose-content ul, .prose-content ol { padding-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; }
        .prose-content li { margin-bottom: 0.5rem; line-height: 1.7; }
        .prose-content strong { color: #ffffff; font-weight: 700; }
        .prose-content code { background: rgba(255,255,255,0.07); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
        .prose-content blockquote { border-left: 3px solid #ff5500; padding-left: 1rem; color: #94a3b8; font-style: italic; margin: 1.5rem 0; }
        .prose-content a { color: #ff5500; text-decoration: underline; }
        .prose-content a:hover { color: #ff7733; }
      `}</style>
    </main>
  );
}
