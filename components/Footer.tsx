import React from "react";
import Link from "next/link";

function homeUrl(lang: string) {
  const map: Record<string, string> = {
    en: "https://www.cargooimport.eu",
    pl: "https://www.cargooimport.eu/cargoo-pl/",
    de: "https://www.cargooimport.eu/cargoo-de/",
    fr: "https://www.cargooimport.eu/cargoo-fr/",
  };
  return map[lang] ?? map.en;
}

interface FooterProps {
  lang?: string;
}

const T = {
  en: {
    tagline:    "Import from China Made Simple. We help you source verified products, small electronics, fashion items, and more.",
    company:    "Company",
    aboutUs:    "About Us",
    howItWorks: "How It Works",
    services:   "Services",
    blog:       "Blog & Insights",
    careers:    "Careers",
    contact:    "Contact Us",
    legal:      "Legal",
    terms:      "Terms of Service",
    privacy:    "Privacy Policy",
    refund:     "Refund Policy",
    copyright:  "All rights reserved.",
  },
  pl: {
    tagline:    "Import z Chin bez stresu. Pomagamy zamawiac zweryfikowane produkty, drobna elektronike, mode i wiecej.",
    company:    "Firma",
    aboutUs:    "O nas",
    howItWorks: "Jak to działa",
    services:   "Usługi",
    blog:       "Blog i Wiedza",
    careers:    "Kariera",
    contact:    "Kontakt",
    legal:      "Prawne",
    terms:      "Regulamin",
    privacy:    "Polityka prywatności",
    refund:     "Polityka zwrotów",
    copyright:  "Wszelkie prawa zastrzeżone.",
  },
  de: {
    tagline:    "Import aus China leicht gemacht. Wir helfen dir, gepruefte Produkte, Elektronik, Mode und mehr einfach zu bestellen.",
    company:    "Unternehmen",
    aboutUs:    "Über uns",
    howItWorks: "So funktioniert's",
    services:   "Leistungen",
    blog:       "Blog & Ratgeber",
    careers:    "Karriere",
    contact:    "Kontakt",
    legal:      "Rechtliches",
    terms:      "AGB",
    privacy:    "Datenschutz",
    refund:     "Rückgabe-Richtlinie",
    copyright:  "Alle Rechte vorbehalten.",
  },
  fr: {
    tagline:    "Import depuis la Chine simplifie. Nous vous aidons a commander des produits verifies, de l'electronique, de la mode et bien plus.",
    company:    "Société",
    aboutUs:    "À propos",
    howItWorks: "Comment ça marche",
    services:   "Services",
    blog:       "Blog & Guides",
    careers:    "Carrières",
    contact:    "Contact",
    legal:      "Légal",
    terms:      "Conditions générales",
    privacy:    "Politique de confidentialité",
    refund:     "Politique de remboursement",
    copyright:  "Tous droits réservés.",
  },
} as const;

type Lang = keyof typeof T;

export function Footer({ lang = "en" }: FooterProps) {
  const t = T[(lang as Lang)] ?? T.en;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <a
              href={homeUrl(lang)}
              className="logo footer-logo"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, color: "#fff" }}
            >
              <i className="fa-solid fa-cube" style={{ color: "var(--clr-orange)" }}></i> Cargoo
            </a>
            <p>{t.tagline}</p>
            <div className="social-links">
              <a href="https://www.facebook.com/profile.php?id=61578665194191" target="_blank" rel="noopener" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/cargooimport/" target="_blank" rel="noopener" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://www.tiktok.com/@cargooimport" target="_blank" rel="noopener" aria-label="TikTok">
                <i className="fa-brands fa-tiktok"></i>
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="footer-links">
            <h4>{t.company}</h4>
            <ul>
              <li><a href={`${homeUrl(lang)}#what-is-cargoo`}>{t.aboutUs}</a></li>
              <li><a href={`${homeUrl(lang)}#how-it-works`}>{t.howItWorks}</a></li>
              <li><a href={`${homeUrl(lang)}#services`}>{t.services}</a></li>
              <li><Link href={`/${lang}/blog`}>{t.blog}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-links">
            <h4>{t.contact}</h4>
            <ul style={{ gap: "1rem", display: "flex", flexDirection: "column" }}>
              <li>
                <a href="mailto:contact@cargooimport.eu">
                  <i className="fa-solid fa-envelope" style={{ marginRight: "8px", color: "var(--clr-orange)" }}></i>
                  contact@cargooimport.eu
                </a>
              </li>
              <li>
                <a href="tel:+48500685000">
                  <i className="fa-solid fa-phone" style={{ marginRight: "8px", color: "var(--clr-orange)" }}></i>
                  +48 500 685 000
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-links">
            <h4>{t.legal}</h4>
            <ul>
              <li><a href="https://www.cargooimport.eu/terms">{t.terms}</a></li>
              <li><a href="https://www.cargooimport.eu/privacy">{t.privacy}</a></li>
              <li><a href="https://www.cargooimport.eu/refund">{t.refund}</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Cargoo. {t.copyright}</p>
          <div className="payment-methods">
            <i className="fa-brands fa-cc-visa"></i>
            <i className="fa-brands fa-cc-mastercard"></i>
            <i className="fa-brands fa-cc-paypal"></i>
            <i className="fa-brands fa-stripe"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}
