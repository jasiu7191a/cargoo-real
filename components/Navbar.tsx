"use client";

import React, { useState } from "react";
import Link from "next/link";

interface NavbarProps {
  lang?: string;
}

export function Navbar({ lang = "en" }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const langs = ["en", "pl", "de", "fr"] as const;

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

  return (
    <>
      <header className="header" id="header">
        <div className="container nav-container">
          <Link
            href={`/${lang}`}
            className="logo"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, fontSize: "1.5rem", color: "#fff" }}
          >
            <i className="fa-solid fa-cube" style={{ color: "var(--clr-orange)" }}></i> Cargoo
          </Link>

          <nav className="desktop-nav">
            <ul className="nav-links">
              <li>
                <Link href={`/${lang}/products`} className="nav-highlight-cta">
                  <i className="fa-solid fa-sparkles"></i> Products
                </Link>
              </li>
              <li><Link href={`/${lang}#how-it-works`}>How It Works</Link></li>
              <li><Link href={`/${lang}#services`}>Services</Link></li>
              <li><Link href={`/${lang}#pricing`}>Calculator</Link></li>
              <li><a href={`https://blog.cargooimport.eu/${lang}/blog`}>Blog</a></li>
            </ul>
          </nav>

          <div className="nav-actions">
            <div
              className="lang-switch"
              style={{ display: "flex", gap: "0.3rem", background: "rgba(255,255,255,0.05)", padding: "0.2rem", borderRadius: "2rem", border: "1px solid var(--clr-border)" }}
            >
              {langs.map((l) => (
                <Link
                  key={l}
                  href={`/${l}/products`}
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
              href="https://wa.me/48500685000?text=Hi%20Cargoo%2C%20I%27d%20like%20a%20quote%20for..."
              target="_blank"
              rel="noopener"
              className="btn btn-primary btn-nav"
            >
              <i className="fa-brands fa-whatsapp"></i> Get Quote
            </a>
            <button className="mobile-toggle" aria-label="Toggle Navigation" onClick={toggle}>
              <i className="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${open ? " active" : ""}`} id="mobileMenu">
        <div className="mobile-menu-header">
          <Link
            href={`/${lang}`}
            className="logo"
            style={{ color: "white", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800 }}
            onClick={close}
          >
            <i className="fa-solid fa-cube" style={{ color: "var(--clr-orange)" }}></i> Cargoo
          </Link>
          <button className="close-menu" aria-label="Close menu" onClick={close}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <ul className="mobile-nav-links">
          <li><Link href={`/${lang}/products`} className="mobile-link" onClick={close}>Products</Link></li>
          <li><Link href={`/${lang}#how-it-works`} className="mobile-link" onClick={close}>How It Works</Link></li>
          <li><Link href={`/${lang}#services`} className="mobile-link" onClick={close}>Services</Link></li>
          <li><Link href={`/${lang}#pricing`} className="mobile-link" onClick={close}>Calculator</Link></li>
          <li><a href={`https://blog.cargooimport.eu/${lang}/blog`} className="mobile-link" onClick={close}>Blog</a></li>
        </ul>
        <div className="mobile-nav-cta">
          <div className="lang-switch-mobile" style={{ display: "flex", gap: "1rem", marginBottom: "2rem", padding: "0 1.5rem" }}>
            {langs.map((l) => (
              <Link
                key={l}
                href={`/${l}/products`}
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
            href="https://wa.me/48500685000?text=Hi%20Cargoo%2C%20I%27d%20like%20a%20quote%20for..."
            target="_blank"
            rel="noopener"
            className="btn btn-primary btn-block mobile-link"
          >
            <i className="fa-brands fa-whatsapp"></i> Get Quote
          </a>
        </div>
      </div>
      <div className={`mobile-overlay${open ? " active" : ""}`} id="mobileOverlay" onClick={close}></div>
    </>
  );
}
