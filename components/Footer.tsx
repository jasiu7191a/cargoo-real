import React from "react";
import Link from "next/link";

interface FooterProps {
  lang?: string;
}

const T = {
  en: {
    tagline:    "Import from China Made Simple. We help you easily order brand items, small electronics, fashion items, and more.",
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
    tagline:    "Import z Chin bez stresu. Pomagamy łatwo zamawiać markowe rzeczy, drobną elektronikę, modę i więcej.",
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
    tagline:    "Import aus China leicht gemacht. Wir helfen dir, Markenprodukte, Elektronik, Mode und mehr einfach zu bestellen.",
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
    tagline:    "Import depuis la Chine simplifié. Nous vous aidons à commander des articles de marque, de l'électronique, de la mode et bien plus.",
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
            <Link
              href={`/${lang}`}
              className="logo footer-logo"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, color: "#fff" }}
            >
              <i className="fa-solid fa-cube" style={{ color: "var(--clr-orange)" }}></i> Cargoo
            </Link>
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
              <li><Link href={`/${lang}#what-is-cargoo`}>{t.aboutUs}</Link></li>
              <li><Link href={`/${lang}#how-it-works`}>{t.howItWorks}</Link></li>
              <li><Link href={`/${lang}#services`}>{t.services}</Link></li>
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
              <li><Link href={`/${lang}/terms`}>{t.terms}</Link></li>
              <li><Link href={`/${lang}/privacy`}>{t.privacy}</Link></li>
              <li><Link href={`/${lang}/refund`}>{t.refund}</Link></li>
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
