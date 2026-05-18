import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getFallbackBlogPost } from "@/lib/blog-fallbacks";

// ISR: cache each rendered post for 10 minutes. Posts only change when
// admins re-publish, so serving from the edge cache eliminates the 30-50s
// Prisma + Neon cold-start latency that visitors were seeing.
export const revalidate = 600;

const BASE_URL = "https://www.cargooimport.eu";

const HOME_URLS: Record<string, string> = {
  en: "https://www.cargooimport.eu",
  pl: "https://www.cargooimport.eu/cargoo-pl/",
  de: "https://www.cargooimport.eu/cargoo-de/",
  fr: "https://www.cargooimport.eu/cargoo-fr/",
};
const homeUrl = (lang: string) => HOME_URLS[lang] ?? HOME_URLS.en;

function formatPostDate(date: Date, lang: string) {
  try {
    return new Date(date).toLocaleDateString(lang, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return new Date(date).toISOString().slice(0, 10);
  }
}

async function loadAdminBlogPost(lang: string, slug: string) {
  const { default: prisma } = await import("@/lib/prisma");
  return prisma.blogPost.findFirst({ where: { slug, lang } });
}

// Find published siblings sharing the same targetKeyword in other locales.
// Used to emit accurate hreflang alternates — emitting a fixed cross-lang
// URL (the same slug under a different /lang/ path) 404s because slugs
// are stored with a {lang}- prefix that doesn't translate.
async function loadSiblings(targetKeyword: string | null | undefined, lang: string) {
  if (!targetKeyword) return [] as { lang: string; slug: string }[];
  try {
    const { default: prisma } = await import("@/lib/prisma");
    const rows = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED", targetKeyword, lang: { not: lang } },
      select: { lang: true, slug: true },
    });
    const byLang = new Map<string, string>();
    for (const r of rows) if (!byLang.has(r.lang)) byLang.set(r.lang, r.slug);
    return Array.from(byLang.entries()).map(([l, s]) => ({ lang: l, slug: s }));
  } catch (e) {
    console.error("[generateMetadata] sibling lookup failed:", e);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string; lang: string } }) {
  let post: any = null;
  try {
    post = await loadAdminBlogPost(params.lang, params.slug);
  } catch (e) {
    console.error("[generateMetadata] Admin content error for", params.slug, e);
  }

  post = post || getFallbackBlogPost(params.lang, params.slug);
  if (!post) return {};
  const localeMap: Record<string, string> = {
    en: "en_US",
    pl: "pl_PL",
    de: "de_DE",
    fr: "fr_FR",
  };

  const siblings = await loadSiblings(post.targetKeyword, params.lang);
  const languages: Record<string, string> = {
    [params.lang]: `${BASE_URL}/${params.lang}/blog/${params.slug}`,
  };
  for (const s of siblings) {
    languages[s.lang] = `${BASE_URL}/${s.lang}/blog/${s.slug}`;
  }
  languages["x-default"] = languages.en ?? languages[params.lang];

  return {
    title: post.title + " | Cargoo Import",
    description: post.metaDescription || "",
    openGraph: {
      title: post.title,
      description: post.metaDescription || "",
      url: `${BASE_URL}/${params.lang}/blog/${params.slug}`,
      siteName: "Cargoo Import",
      type: "article",
      locale: localeMap[params.lang] ?? "en_US",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: ["Cargoo Import"],
      section: "EU–China Sourcing & Logistics",
      tags: post.targetKeyword ? [post.targetKeyword] : undefined,
      images: [{ url: `${BASE_URL}/assets/images/logo-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription || "",
      images: [`${BASE_URL}/assets/images/logo-image.jpg`],
    },
    alternates: {
      canonical: `${BASE_URL}/${params.lang}/blog/${params.slug}`,
      languages,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string; lang: string } }) {
  const dict = getDictionary(params.lang);

  let post: any = null;
  if (!post) {
    try {
      post = await loadAdminBlogPost(params.lang, params.slug);
    } catch (e) {
      console.error("[BlogPostPage] DB error:", e);
      return (
      <>
        <Navbar lang={params.lang} />
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <h1 style={{ color: "var(--clr-orange)", fontSize: "2rem", fontWeight: 900 }}>Temporarily unavailable</h1>
            <p style={{ color: "var(--clr-text-muted)", marginTop: "1rem" }}>
              We&apos;re having trouble loading this article. Please try again in a moment.
            </p>
            <Link
              href={`/${params.lang}/blog`}
              style={{ display: "inline-block", marginTop: "2rem", color: "var(--clr-orange)", fontWeight: 700, textDecoration: "underline" }}
            >
              ← Back to blog
            </Link>
          </div>
        </main>
        <Footer lang={params.lang} />
      </>
      );
    }
  }

  post = post || getFallbackBlogPost(params.lang, params.slug);

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const canonicalUrl = `${BASE_URL}/${params.lang}/blog/${params.slug}`;
  const blogListUrl  = `${BASE_URL}/${params.lang}/blog`;

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    inLanguage: params.lang,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    author: { "@type": "Organization", name: "Cargoo Import", url: BASE_URL },
    publisher: {
      "@type": "Organization",
      name: "Cargoo Import",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/assets/images/favicon.png` },
    },
  };

  // FAQ rendering: trust only well-formed {question, answer} pairs. Bad
  // data must NOT explode the page or emit invalid JSON-LD (Google penalises
  // structurally broken FAQPage markup).
  const faqEntries: { question: string; answer: string }[] = (() => {
    const raw = (post as any).faq;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((e: any) => e && typeof e.question === "string" && typeof e.answer === "string")
      .map((e: any) => ({ question: e.question.trim(), answer: e.answer.trim() }))
      .filter((e: { question: string; answer: string }) => e.question && e.answer);
  })();

  const faqSchema = faqEntries.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: homeUrl(params.lang) },
      { "@type": "ListItem", position: 2, name: "Blog", item: blogListUrl },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <Navbar lang={params.lang} />

      <main style={{ minHeight: "100vh" }}>
        <article style={{ maxWidth: "800px", margin: "0 auto", padding: "6rem 1.5rem 4rem" }}>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: "2rem", fontSize: "0.8rem", color: "var(--clr-text-muted)" }}>
            <a href={homeUrl(params.lang)} style={{ color: "var(--clr-text-muted)", textDecoration: "none" }}>
              Home
            </a>
            <span style={{ margin: "0 0.4rem" }}>›</span>
            <Link href={`/${params.lang}/blog`} style={{ color: "var(--clr-text-muted)", textDecoration: "none" }}>
              Blog
            </Link>
            <span style={{ margin: "0 0.4rem" }}>›</span>
            <span style={{ color: "#94a3b8" }}>{post.title}</span>
          </nav>

          {/* Tags + date */}
          <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            {post.targetKeyword && (
              <span
                style={{
                  background: "rgba(255,85,0,0.1)",
                  color: "var(--clr-orange)",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {post.targetKeyword}
              </span>
            )}
            {post.publishedAt && (
              <span style={{ color: "var(--clr-text-muted)", fontSize: "0.8rem" }}>
                {formatPostDate(post.publishedAt, params.lang)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              marginBottom: "1.5rem",
              color: "#ffffff",
            }}
          >
            {post.title}
          </h1>

          {/* Intro */}
          {post.metaDescription && (
            <p
              style={{
                fontSize: "1.15rem",
                color: "#94a3b8",
                marginBottom: "3rem",
                lineHeight: 1.7,
                borderLeft: "3px solid var(--clr-orange)",
                paddingLeft: "1.25rem",
              }}
            >
              {post.metaDescription}
            </p>
          )}

          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", marginBottom: "3rem" }} />

          {/* Markdown content */}
          <div className="prose-content">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* FAQ — rendered as native <details> accordion so it works without
              JS and Googlebot still sees the questions/answers in HTML. */}
          {faqEntries.length > 0 && (
            <section
              aria-labelledby="faq-heading"
              style={{
                marginTop: "4rem",
                paddingTop: "3rem",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h2
                id="faq-heading"
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                  marginBottom: "1.5rem",
                }}
              >
                {{
                  en: "Frequently asked questions",
                  pl: "Najczęściej zadawane pytania",
                  de: "Häufig gestellte Fragen",
                  fr: "Questions fréquentes",
                }[params.lang as "en"|"pl"|"de"|"fr"] ?? "Frequently asked questions"}
              </h2>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {faqEntries.map((item, idx) => (
                  <details
                    key={idx}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "0.75rem",
                      padding: "1rem 1.25rem",
                    }}
                  >
                    <summary
                      style={{
                        cursor: "pointer",
                        fontWeight: 700,
                        color: "#ffffff",
                        listStyle: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                      }}
                    >
                      <span>{item.question}</span>
                      <span style={{ color: "var(--clr-orange)", fontWeight: 900 }}>＋</span>
                    </summary>
                    <p
                      style={{
                        marginTop: "0.75rem",
                        color: "#cbd5e1",
                        lineHeight: 1.7,
                        fontSize: "0.95rem",
                      }}
                    >
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* CTA banner */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "4rem 1.5rem", textAlign: "center" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "1rem" }}>
              {dict.blogPost.ctaTitle}
            </h2>
            <p style={{ color: "var(--clr-text-muted)", marginBottom: "2rem", lineHeight: 1.7 }}>
              {dict.blogPost.ctaDescription}
            </p>
            <a
              href={homeUrl(params.lang)}
              style={{
                display: "inline-block",
                background: "var(--clr-orange)",
                color: "#000",
                padding: "1rem 2.5rem",
                borderRadius: "9999px",
                fontWeight: 900,
                textDecoration: "none",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {dict.blogPost.ctaButton}
            </a>
          </div>
        </div>
      </main>

      <Footer lang={params.lang} />

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
        .prose-content h3 { font-size: 1.2rem; color: var(--clr-orange); }
        .prose-content p { line-height: 1.8; margin-bottom: 1.25rem; color: #cbd5e1; }
        .prose-content ul, .prose-content ol { padding-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; }
        .prose-content li { margin-bottom: 0.5rem; line-height: 1.7; }
        .prose-content strong { color: #ffffff; font-weight: 700; }
        .prose-content code { background: rgba(255,255,255,0.07); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
        .prose-content blockquote { border-left: 3px solid var(--clr-orange); padding-left: 1rem; color: #94a3b8; font-style: italic; margin: 1.5rem 0; }
        .prose-content a { color: var(--clr-orange); text-decoration: underline; }
        .prose-content a:hover { opacity: 0.8; }
      `}</style>
    </>
  );
}
