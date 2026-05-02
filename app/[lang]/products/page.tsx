import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Script from "next/script";

export const dynamic = "force-dynamic";
const BASE_URL = "https://www.cargooimport.eu";

const CATEGORIES = ["All", "Sneakers", "Electronics", "Apparel", "Watches", "Handbags", "Accessories"];
const PRODUCT_META = {
  en: {
    title: "All Products | Cargoo Marketplace",
    description: "Browse product categories Cargoo can help source from China, then request an all-in quote with inspection, shipping, and customs support.",
  },
  pl: {
    title: "Wszystkie Produkty | Cargoo Marketplace",
    description: "Przeglądaj kategorie produktów, które Cargoo może pozyskać z Chin, i poproś o wycenę all-in z kontrolą jakości, wysyłką i obsługą celną.",
  },
  de: {
    title: "Alle Produkte | Cargoo Marktplatz",
    description: "Durchsuche Produktkategorien, die Cargoo aus China beschaffen kann, und fordere ein All-in-Angebot mit Prüfung, Versand und Zollsupport an.",
  },
  fr: {
    title: "Produits | Cargoo Marketplace",
    description: "Parcourez les catégories de produits que Cargoo peut sourcer en Chine, puis demandez un devis tout compris avec inspection, expédition et douane.",
  },
} as const;

const PLACEHOLDER_PRODUCTS = [
  { id: "1", name: "Air Jordan 1 Retro High OG", brand: "Jordan", category: "Sneakers", cargooPrice: "€120", retailPrice: "€190", img: "/img/placeholders/sneaker.png" },
  { id: "2", name: "Dyson Airwrap Styler", brand: "Dyson", category: "Electronics", cargooPrice: "€310", retailPrice: "€549", img: "/img/placeholders/tech.png" },
  { id: "3", name: "Prada Re-Edition 2005", brand: "Prada", category: "Handbags", cargooPrice: "€650", retailPrice: "€1,200", img: "/img/placeholders/bag.png" },
  { id: "4", name: "Rolex Datejust 41", brand: "Rolex", category: "Watches", cargooPrice: "€4,200", retailPrice: "€8,100", img: "/img/placeholders/watch.png" },
  { id: "5", name: "Off-White Hoodie", brand: "Off-White", category: "Apparel", cargooPrice: "€180", retailPrice: "€420", img: "/img/placeholders/apparel.png" },
  { id: "6", name: "Ray-Ban Aviators", brand: "Ray-Ban", category: "Accessories", cargooPrice: "€55", retailPrice: "€170", img: "/img/placeholders/accessory.png" },
  { id: "7", name: "Nike Dunk Low Retro", brand: "Nike", category: "Sneakers", cargooPrice: "€90", retailPrice: "€130", img: "/img/placeholders/sneaker.png" },
  { id: "8", name: "Sony WH-1000XM5", brand: "Sony", category: "Electronics", cargooPrice: "€220", retailPrice: "€380", img: "/img/placeholders/tech.png" },
];

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = params.lang || "en";
  const meta = PRODUCT_META[lang as keyof typeof PRODUCT_META] ?? PRODUCT_META.en;
  const { title, description } = meta;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${lang}/products`,
      languages: {
        en: `${BASE_URL}/en/products`,
        pl: `${BASE_URL}/pl/products`,
        de: `${BASE_URL}/de/products`,
        fr: `${BASE_URL}/fr/products`,
        "x-default": `${BASE_URL}/en/products`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${lang}/products`,
      siteName: "Cargoo Import",
      type: "website",
      images: [{ url: `${BASE_URL}/assets/images/logo-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/assets/images/logo-image.jpg`],
    },
  };
}

export default async function ProductsPage({ params }: { params: { lang: string } }) {
  const lang = params.lang || "en";

  return (
    <>
      <Navbar lang={lang} />

      <main id="productsPageContainer">
        <section style={{ padding: "120px 0 80px" }}>
          <div className="container">
            <div style={{ marginBottom: "5rem", textAlign: "center", position: "relative", paddingTop: "2rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--clr-orange)", textTransform: "uppercase", letterSpacing: "4px", marginBottom: "1.5rem", opacity: 0.8 }}>
                <i className="fa-solid fa-earth-americas" style={{ marginRight: "8px" }}></i> Global Sourcing
              </div>
              <h1 style={{ fontSize: "clamp(3rem, 8vw, 5rem)", fontWeight: 900, lineHeight: 1, marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "-2px", display: "inline-block", background: "linear-gradient(135deg, #fff 0%, var(--clr-orange) 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                All Products
              </h1>
              <div style={{ height: "4px", width: "60px", background: "var(--clr-orange)", margin: "0 auto 2rem", borderRadius: "2px" }}></div>
              <p className="text-muted" style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)", maxWidth: "800px", margin: "0 auto", lineHeight: 1.6, fontWeight: 500 }}>
                Hand-picked, factory-verified, and priced without the middleman markup. Tap any item to request a quote — we&apos;ll send an all-in price on WhatsApp.
              </p>
              <p className="text-muted" style={{ fontSize: "0.9rem", maxWidth: "760px", margin: "1rem auto 0", lineHeight: 1.6 }}>
                We only support lawful, non-counterfeit sourcing. Brand-owner restrictions, customs rules, and documentation requirements are checked before any order proceeds.
              </p>
            </div>

            {/* Category filter pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginBottom: "3rem" }}>
              {CATEGORIES.map((cat) => (
                <span
                  key={cat}
                  style={{
                    padding: "0.4rem 1.2rem",
                    borderRadius: "9999px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    border: "1px solid var(--clr-border)",
                    color: cat === "All" ? "#fff" : "var(--clr-text-muted)",
                    background: cat === "All" ? "var(--clr-orange)" : "transparent",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Product grid */}
            <div id="productsGrid" className="grid-layout">
              {PLACEHOLDER_PRODUCTS.map((p) => (
                <a
                  key={p.id}
                  href={`https://wa.me/48500685000?text=Hi%20Cargoo%2C%20I%27d%20like%20a%20quote%20for%20${encodeURIComponent(p.name)}`}
                  target="_blank"
                  rel="noopener"
                  className="product-card-v2"
                >
                  <span className="pc-badge" style={{ background: "rgba(0,200,83,0.15)", color: "#00c853", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase" }}>
                    ~40% Off Retail
                  </span>
                  <div className="pc-img">
                    <img src={p.img} alt={p.name} loading="lazy" />
                  </div>
                  <div className="pc-body">
                    <span className="pc-cat">{p.category}</span>
                    <h3 className="pc-name">{p.name}</h3>
                    <div className="pc-meta">
                      <span className="pc-price">{p.cargooPrice}</span>
                      <span style={{ textDecoration: "line-through", color: "var(--clr-text-muted)", fontSize: "0.85rem" }}>{p.retailPrice}</span>
                    </div>
                  </div>
                  <div className="pc-cta">
                    <i className="fa-brands fa-whatsapp"></i> Get Quote
                  </div>
                </a>
              ))}
            </div>

            {/* CTA banner */}
            <div
              className="glass-panel"
              style={{ marginTop: "5rem", padding: "4rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, right: 0, width: "20rem", height: "20rem", background: "rgba(255,85,0,0.06)", filter: "blur(80px)", pointerEvents: "none" }}></div>
              <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", marginBottom: "1.5rem" }}>
                Didn&apos;t find what you wanted?
              </h2>
              <p style={{ color: "var(--clr-text-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 2.5rem" }}>
                Our sourcing team can find almost any product from China. Send us a link or description and we&apos;ll quote it within 24 hours.
              </p>
              <a
                href="https://wa.me/48500685000?text=Hi%20Cargoo%2C%20I%27d%20like%20a%20quote%20for..."
                target="_blank"
                rel="noopener"
                className="btn btn-primary btn-lg btn-glow"
              >
                <i className="fa-brands fa-whatsapp"></i> Send Us a Link
              </a>
            </div>
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

      <Script src="/js/main.js" strategy="lazyOnload" />
    </>
  );
}
