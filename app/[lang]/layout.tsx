import type { Metadata } from "next";
import "../globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-main',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Cargoo | Import from China Made Simple",
  description: "Cargoo helps you source, ship, and deliver products with zero hassle. Beginner-friendly importing for everyday people.",
};

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={params.lang || 'en'}>
      <body className={jakarta.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
