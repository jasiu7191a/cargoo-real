import React from "react";
import { LiveActivity } from "@/components/LiveActivity";

const BASE_URL = "https://www.cargooimport.eu";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Cargoo Import",
  url: BASE_URL,
  logo: `${BASE_URL}/assets/images/logo-image.jpg`,
  description:
    "Cargoo Import helps EU customers source, inspect, and ship lawful products from China with transparent pricing and full customs handling.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+48-500-685-000",
    email: "contact@cargooimport.eu",
    contactType: "customer service",
    areaServed: ["EU", "PL", "DE", "FR"],
    availableLanguage: ["en", "pl", "de", "fr"],
  },
  sameAs: [
    "https://www.facebook.com/profile.php?id=61578665194191",
    "https://www.instagram.com/cargooimport/",
    "https://www.tiktok.com/@cargooimport",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Cargoo Import",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {children}
      <LiveActivity />
    </>
  );
}
