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
  title: "Cargoo | Import from China Made Simple",
  description: "Cargoo helps you source, ship, and deliver products with zero hassle.",
  verification: {
    google: "FrgLQ6zedzPxzSk0B3-piVkLyup3BGo006w22pl8yG4",
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
