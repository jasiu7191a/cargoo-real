import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],  // latin-ext covers Polish (ą ę ó ś ź ż ć ń ł), French (é è ê ë), German (ä ö ü ß), etc.
  variable: '--font-main',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cargooimport.eu"),
  title: "Cargoo | Import from China Made Simple",
  description: "Cargoo helps you source, ship, and deliver products with zero hassle.",
  alternates: {
    canonical: "https://www.cargooimport.eu",
  },
  openGraph: {
    title: "Cargoo | Import from China Made Simple",
    description: "Cargoo helps you source, ship, and deliver products with zero hassle.",
    url: "https://www.cargooimport.eu",
    siteName: "Cargoo Import",
    type: "website",
    images: [{ url: "/assets/images/logo-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cargoo | Import from China Made Simple",
    description: "Cargoo helps you source, ship, and deliver products with zero hassle.",
    images: ["/assets/images/logo-image.jpg"],
  },
  verification: {
    google: "FrgLQ6zedzPxzSk0B3-piVkLyup3BGo006w22pl8yG4",
  },
  icons: {
    icon: "/assets/images/favicon.png",
    apple: "/assets/images/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/search.css" />
      </head>
      <body className={jakarta.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
