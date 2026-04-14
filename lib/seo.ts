import { Metadata } from "next";

interface MetadataProps {
  title: string;
  description: string;
  lang: string;
  path: string;
  image?: string;
}

export function generateCargooMetadata({
  title,
  description,
  lang,
  path,
  image = "/og-image.png"
}: MetadataProps): Metadata {
  const baseUrl = "https://cargoo.com";
  const url = `${baseUrl}/${lang}/${path}`;

  return {
    title: `${title} | Cargoo - Import from China`,
    description: description,
    alternates: {
      canonical: url,
      languages: {
        en: `${baseUrl}/en/${path}`,
        pl: `${baseUrl}/pl/${path}`,
        de: `${baseUrl}/de/${path}`,
        fr: `${baseUrl}/fr/${path}`,
      },
    },
    openGraph: {
      title: title,
      description: description,
      url: url,
      siteName: "Cargoo",
      locale: lang === 'pl' ? 'pl_PL' : lang === 'fr' ? 'fr_FR' : lang === 'de' ? 'de_DE' : 'en_US',
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
