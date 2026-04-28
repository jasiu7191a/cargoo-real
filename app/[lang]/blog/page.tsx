import Link from "next/link";
import prisma from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionaries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const dict = getDictionary(params.lang);
  return {
    title: dict.blog.metaTitle,
    description: dict.blog.metaDescription,
    alternates: { canonical: `https://blog.cargooimport.eu/${params.lang}/blog` },
  };
}

export default async function BlogIndexPage({ params, searchParams }: { params: { lang: string }; searchParams?: { all?: string } }) {
  const dict = getDictionary(params.lang);
  const showAll = searchParams?.all === "true";
  let posts: any[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        ...(showAll ? {} : { lang: params.lang })
      },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true, slug: true, metaDescription: true, targetKeyword: true, publishedAt: true, lang: true },
    });
  } catch (e) {
    console.error("Failed to load blog posts:", e);
  }

  return (
    <main style={{ background: "#050505", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem 0" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href={`/${params.lang}`} style={{ color: "#ff5500", fontWeight: 800, textDecoration: "none", fontSize: "1.1rem", letterSpacing: "-0.03em" }}>
            {dict.common.brandBack}
          </Link>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link
              href={`/${params.lang}/blog?all=true`}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                color: showAll ? "#000" : "#e2e8f0",
                backgroundColor: showAll ? "#ff5500" : "transparent",
                transition: "all 0.2s",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              All
            </Link>
            {["en", "pl", "de", "fr"].map((lang) => (
              <Link
                key={lang}
                href={`/${lang}/blog`}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: params.lang === lang && !showAll ? "#000" : "#e2e8f0",
                  backgroundColor: params.lang === lang && !showAll ? "#ff5500" : "transparent",
                  transition: "all 0.2s",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {lang}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "1rem" }}>
            {dict.blog.heroLine1}<br />
            <span style={{ color: "#ff5500" }}>{dict.blog.heroLine2}</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: "600px", lineHeight: 1.7 }}>
            {dict.blog.subtitle}
          </p>
        </div>

        {posts.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "1.5rem" }}>
            <p style={{ color: "#64748b" }}>{dict.blog.empty}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/${params.lang}/blog/${post.slug}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <article
                  className="glass-panel"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "1.5rem",
                    padding: "2rem",
                    transition: "border-color 0.2s, background 0.2s",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                        {showAll && (
                          <span style={{ background: "rgba(100,200,255,0.1)", color: "#64c8ff", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            {post.lang}
                          </span>
                        )}
                        {post.targetKeyword && (
                          <span style={{ background: "rgba(255,85,0,0.1)", color: "#ff5500", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            {post.targetKeyword}
                          </span>
                        )}
                      </div>
                      <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: "0.75rem" }}>
                        {post.title}
                      </h2>
                      {post.metaDescription && (
                        <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.6 }}>
                          {post.metaDescription}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ color: "#64748b", fontSize: "0.75rem" }}>
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(params.lang, { year: "numeric", month: "short", day: "numeric" }) : ""}
                      </div>
                      <div style={{ marginTop: "1rem", color: "#ff5500", fontWeight: 700, fontSize: "0.8rem" }}>
                        {dict.blog.readGuide}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
