import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { lang: string } }) {
  return {
    title: "Import Guides & Sourcing Blog | Cargoo",
    description: "Expert guides on importing from China: sourcing tips, logistics, customs duties, and finding reliable suppliers for EU businesses.",
    alternates: { canonical: `https://cargooimport.eu/${params.lang}/blog` },
  };
}

export default async function BlogIndexPage({ params }: { params: { lang: string } }) {
  let posts: any[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true, slug: true, metaDescription: true, targetKeyword: true, publishedAt: true },
    });
  } catch (e) {
    console.error("Failed to load blog posts:", e);
  }

  return (
    <main style={{ background: "#050505", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem 0" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 1.5rem" }}>
          <Link href={`/${params.lang}`} style={{ color: "#ff5500", fontWeight: 800, textDecoration: "none", fontSize: "1.1rem", letterSpacing: "-0.03em" }}>
            ← Cargoo
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "1rem" }}>
            Import Guides &<br />
            <span style={{ color: "#ff5500" }}>Sourcing Intelligence</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: "600px", lineHeight: 1.7 }}>
            Expert knowledge for EU businesses importing from China — covering suppliers, logistics, customs, and more.
          </p>
        </div>

        {posts.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "1.5rem" }}>
            <p style={{ color: "#64748b" }}>No articles published yet. Check back soon.</p>
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
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "1.5rem",
                    padding: "2rem",
                    transition: "border-color 0.2s, background 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,85,0,0.3)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,85,0,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      {post.targetKeyword && (
                        <span style={{ background: "rgba(255,85,0,0.1)", color: "#ff5500", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", display: "inline-block", marginBottom: "0.75rem" }}>
                          {post.targetKeyword}
                        </span>
                      )}
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
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }) : ""}
                      </div>
                      <div style={{ marginTop: "1rem", color: "#ff5500", fontWeight: 700, fontSize: "0.8rem" }}>
                        Read guide →
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
