import Link from "next/link";
import prisma from "@/lib/prisma";
import { getDictionary } from "@/lib/dictionaries";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";
const BASE_URL = "https://www.cargooimport.eu";

function formatPostDate(date: Date, lang: string) {
  try {
    return new Date(date).toLocaleDateString(lang, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return new Date(date).toISOString().slice(0, 10);
  }
}

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const dict = getDictionary(params.lang);
  return {
    title: dict.blog.metaTitle,
    description: dict.blog.metaDescription,
    alternates: {
      canonical: `${BASE_URL}/${params.lang}/blog`,
      languages: {
        en: `${BASE_URL}/en/blog`,
        pl: `${BASE_URL}/pl/blog`,
        de: `${BASE_URL}/de/blog`,
        fr: `${BASE_URL}/fr/blog`,
        "x-default": `${BASE_URL}/en/blog`,
      },
    },
    openGraph: {
      title: dict.blog.metaTitle,
      description: dict.blog.metaDescription,
      url: `${BASE_URL}/${params.lang}/blog`,
      siteName: "Cargoo Import",
      type: "website",
      images: [{ url: `${BASE_URL}/assets/images/logo-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.blog.metaTitle,
      description: dict.blog.metaDescription,
      images: [`${BASE_URL}/assets/images/logo-image.jpg`],
    },
  };
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: { lang: string };
  searchParams?: { all?: string };
}) {
  const dict = getDictionary(params.lang);
  const showAll = searchParams?.all === "true";
  let posts: any[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        ...(showAll ? {} : { lang: params.lang }),
      },
      orderBy: [
        { publishedAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        metaDescription: true,
        targetKeyword: true,
        publishedAt: true,
        lang: true,
      },
    });
  } catch (e) {
    console.error("Failed to load blog posts:", e);
  }

  return (
    <>
      <Navbar lang={params.lang} />

      <main style={{ minHeight: "100vh" }}>
        <section style={{ padding: "120px 0 80px" }}>
          <div className="container">

            {/* Blog heading */}
            <div style={{ marginBottom: "4rem", textAlign: "center" }}>
              <h1
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 4rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.05,
                  marginBottom: "1rem",
                  color: "#fff",
                }}
              >
                {dict.blog.heroLine1}
                <br />
                <span style={{ color: "var(--clr-orange)" }}>{dict.blog.heroLine2}</span>
              </h1>
              <p style={{ color: "var(--clr-text-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
                {dict.blog.subtitle}
              </p>
            </div>

            {/* Language / "All" filter pills */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "3rem" }}>
              <Link
                href={`/${params.lang}/blog?all=true`}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid var(--clr-border)",
                  color: showAll ? "#fff" : "var(--clr-text-muted)",
                  background: showAll ? "var(--clr-orange)" : "transparent",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                All
              </Link>
              {(["en", "pl", "de", "fr"] as const).map((lang) => (
                <Link
                  key={lang}
                  href={`/${lang}/blog`}
                  style={{
                    padding: "0.4rem 1rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    border: "1px solid var(--clr-border)",
                    color: params.lang === lang && !showAll ? "#fff" : "var(--clr-text-muted)",
                    background: params.lang === lang && !showAll ? "var(--clr-orange)" : "transparent",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {lang}
                </Link>
              ))}
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
              <div
                style={{
                  padding: "4rem",
                  textAlign: "center",
                  border: "1px dashed rgba(255,255,255,0.1)",
                  borderRadius: "1.5rem",
                }}
              >
                <p style={{ color: "var(--clr-text-muted)" }}>{dict.blog.empty}</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/${post.lang}/blog/${post.slug}`}
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
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              marginBottom: "0.75rem",
                              flexWrap: "wrap",
                            }}
                          >
                            {showAll && (
                              <span
                                style={{
                                  background: "rgba(100,200,255,0.1)",
                                  color: "#64c8ff",
                                  padding: "0.2rem 0.6rem",
                                  borderRadius: "9999px",
                                  fontSize: "0.65rem",
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.1em",
                                }}
                              >
                                {post.lang}
                              </span>
                            )}
                            {post.targetKeyword && (
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
                                {post.targetKeyword}
                              </span>
                            )}
                          </div>
                          <h2
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: 800,
                              color: "#ffffff",
                              letterSpacing: "-0.02em",
                              lineHeight: 1.25,
                              marginBottom: "0.75rem",
                            }}
                          >
                            {post.title}
                          </h2>
                          {post.metaDescription && (
                            <p style={{ color: "var(--clr-text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                              {post.metaDescription}
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ color: "var(--clr-text-muted)", fontSize: "0.75rem" }}>
                            {post.publishedAt ? formatPostDate(post.publishedAt, params.lang) : ""}
                          </div>
                          <div
                            style={{
                              marginTop: "1rem",
                              color: "var(--clr-orange)",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
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
        </section>
      </main>

      <Footer lang={params.lang} />
    </>
  );
}
