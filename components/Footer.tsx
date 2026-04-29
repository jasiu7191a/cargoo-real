import React from "react";
import Link from "next/link";

interface FooterProps {
  lang?: string;
}

export function Footer({ lang = "en" }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link
              href={`/${lang}`}
              className="logo footer-logo"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, color: "#fff" }}
            >
              <i className="fa-solid fa-cube" style={{ color: "var(--clr-orange)" }}></i> Cargoo
            </Link>
            <p>Import from China Made Simple. We help you easily order brand items, small electronics, fashion items, and more.</p>
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

          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li><Link href={`/${lang}#what-is-cargoo`}>About Us</Link></li>
              <li><Link href={`/${lang}#how-it-works`}>How It Works</Link></li>
              <li><Link href={`/${lang}#services`}>Services</Link></li>
              <li><a href={`https://blog.cargooimport.eu/${lang}/blog`}>Blog &amp; Insights</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Contact Us</h4>
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

          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><Link href={`/${lang}/terms`}>Terms of Service</Link></li>
              <li><Link href={`/${lang}/privacy`}>Privacy Policy</Link></li>
              <li><Link href={`/${lang}/refund`}>Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Cargoo. All rights reserved.</p>
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
