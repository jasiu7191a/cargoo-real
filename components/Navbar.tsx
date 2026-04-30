"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  lang?: string;
}

const T = {
  en: {
    products:   "Products",
    howItWorks: "How It Works",
    services:   "Services",
    calculator: "Calculator",
    blog:       "Blog",
    getQuote:   "Get Quote",
    wa:         "Hi%20Cargoo%2C%20I%27d%20like%20a%20quote%20for...",
  },
  pl: {
    products:   "Produkty",
    howItWorks: "Jak to działa",
    services:   "Usługi",
    calculator: "Kalkulator",
    blog:       "Blog",
    getQuote:   "Wycena",
    wa:         "Cze%C5%9B%C4%87%20Cargoo%2C%20chcia%C5%82bym%20uzyska%C4%87%20wycen%C4%99...",
  },
  de: {
    products:   "Produkte",
    howItWorks: "So funktioniert's",
    services:   "Leistungen",
    calculator: "Rechner",
    blog:       "Blog",
    getQuote:   "Angebot",
    wa:         "Hallo%20Cargoo%2C%20ich%20h%C3%A4tte%20gerne%20ein%20Angebot...",
  },
  fr: {
    products:   "Produits",
    howItWorks: "Comment ça marche",
    services:   "Services",
    calculator: "Calculateur",
    blog:       "Blog",
    getQuote:   "Devis",
    wa:         "Bonjour%20Cargoo%2C%20je%20voudrais%20un%20devis...",
  },
} as const;

type Lang = keyof typeof T;
const LANGS = ["en", "pl", "de", "fr"] as const;

export function Navbar({ lang = "en" }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = T[(lang as Lang)] ?? T.en;

  const toggle = () => {
    setOpen((v) => {
      document.body.style.overflow = !v ? "hidden" : "";
      return !v;
    });
  };

  const close = () => {
    setOpen(false);
    document.body.style.overflow = "";
  };

  /** Replace only the language segment so users stay on the same page type */
  const langUrl = (l: string) => {
    if (!pathname) return `/${l}`;
    return pathname.replace(/^\/(en|pl|de|fr)(\/|$)/, `/${l}$2`) || `/${l}`;
  };

  const productsUrl = (l: string) => {
    const map: Record<string, string> = {
      en: "https://www.cargooimport.eu/products.html",
      pl: "https://www.cargooimport.eu/cargoo-pl/products.html",
      de: "https://www.cargooimport.eu/cargoo-de/products.html",
      fr: "https://www.cargooimport.eu/cargoo-fr/products.html",
    };
    return map[l] ?? map.en;
  };

  const homeUrl = (l: string) => {
    const map: Record<string, string> = {
      en: "https://www.cargooimport.eu",
      pl: "https://www.cargooimport.eu/cargoo-pl/",
      de: "https://www.cargooimport.eu/cargoo-de/",
      fr: "https://www.cargooimport.eu/cargoo-fr/",
    };
    return map[l] ?? map.en;
  };

  return (
    <>
      <header className="header" id="header">
        <div className="container nav-container">
          <a
            href={homeUrl(lang)}
            className="logo"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, fontSize: "1.5rem", color: "#fff" }}
          >
            <i className="fa-solid fa-cube" style={{ color: "var(--clr-orange)" }}></i> Cargoo
          </a>

          <nav className="desktop-nav">
            <ul className="nav-links">
              <li>
                <a href={productsUrl(lang)} className="nav-highlight-cta">
                  <i className="fa-solid fa-sparkles"></i> {t.products}
                </a>
              </li>
              <li><a href={`${homeUrl(lang)}#how-it-works`}>{t.howItWorks}</a></li>
              <li><a href={`${homeUrl(lang)}#services`}>{t.services}</a></li>
              <li><a href={`${homeUrl(lang)}#pricing`}>{t.calculator}</a></li>
              <li><Link href={`/${lang}/blog`}>{t.blog}</Link></li>
            </ul>
          </nav>

          <div className="nav-actions">
            <div
              className="lang-switch"
              style={{ display: "flex", gap: "0.3rem", background: "rgba(255,255,255,0.05)", padding: "0.2rem", borderRadius: "2rem", border: "1px solid var(--clr-border)" }}
            >
              {LANGS.map((l) => (
                <Link
                  key={l}
                  href={langUrl(l)}
                  className={`lang-link${lang === l ? " active" : ""}`}
                  style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: "1rem",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: lang === l ? "#fff" : "#888",
                    background: lang === l ? "var(--clr-orange)" : "transparent",
                    textDecoration: "none",
                  }}
                >
                  {l.toUpperCase()}
                </Link>
              ))}
            </div>

            <a
              href={`https://wa.me/48500685000?text=${t.wa}`}
              target="_blank"
              rel="noopener"
              className="btn btn-primary btn-nav"
            >
              <i className="fa-brands fa-whatsapp"></i> {t.getQuote}
            </a>
            <button className="mobile-toggle" aria-label="Toggle Navigation" onClick={toggle}>
              <i className="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${open ? " active" : ""}`} id="mobileMenu">
        <div className="mobile-menu-header">
          <a
            href={homeUrl(lang)}
            className="logo"
            style={{ color: "white", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800 }}
            onClick={close}
          >
            <i className="fa-solid fa-cube" style={{ color: "var(--clr-orange)" }}></i> Cargoo
          </a>
          <button className="close-menu" aria-label="Close menu" onClick={close}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <ul className="mobile-nav-links">
          <li><a href={productsUrl(lang)} className="mobile-link" onClick={close}>{t.products}</a></li>
          <li><a href={`${homeUrl(lang)}#how-it-works`} className="mobile-link" onClick={close}>{t.howItWorks}</a></li>
          <li><a href={`${homeUrl(lang)}#services`} className="mobile-link" onClick={close}>{t.services}</a></li>
          <li><a href={`${homeUrl(lang)}#pricing`} className="mobile-link" onClick={close}>{t.calculator}</a></li>
          <li><Link href={`/${lang}/blog`} className="mobile-link" onClick={close}>{t.blog}</Link></li>
        </ul>
        <div className="mobile-nav-cta">
          <div className="lang-switch-mobile" style={{ display: "flex", gap: "1rem", marginBottom: "2rem", padding: "0 1.5rem" }}>
            {LANGS.map((l) => (
              <Link
                key={l}
                href={langUrl(l)}
                onClick={close}
                style={{
                  color: lang === l ? "var(--clr-orange)" : "#fff",
                  textDecoration: "none",
                  opacity: lang === l ? 1 : 0.5,
                  fontWeight: 700,
                  borderBottom: lang === l ? "2px solid var(--clr-orange)" : "none",
                }}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
          <a
            href={`https://wa.me/48500685000?text=${t.wa}`}
            target="_blank"
            rel="noopener"
            className="btn btn-primary btn-block mobile-link"
          >
            <i className="fa-brands fa-whatsapp"></i> {t.getQuote}
          </a>
        </div>
      </div>
      <div className={`mobile-overlay${open ? " active" : ""}`} id="mobileOverlay" onClick={close}></div>
    </>
  );
}
