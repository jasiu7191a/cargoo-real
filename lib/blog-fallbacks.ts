export type BlogFallbackPost = {
  id: string;
  title: string;
  slug: string;
  metaDescription: string;
  targetKeyword: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  lang: "en" | "pl" | "de" | "fr";
  status: "PUBLISHED";
  content: string;
};

const date = new Date("2026-05-01T08:00:00.000Z");

const content = {
  en: `## Start with product legality

Before you ask for a quote, check whether the product can legally enter the EU. Branded goods, electronics, cosmetics, toys, and batteries can require extra documentation or may be blocked by brand-owner or customs rules.

## Verify the supplier

Use factory photos, production history, sample checks, and payment terms to filter suppliers. A low unit price is not useful if the supplier cannot prove quality or export readiness.

## Calculate the landed cost

Your real cost is product price, inland handling, inspection, freight, duty, VAT, and service fees. Cargoo packages those numbers into one all-in quote before you pay.`,
  pl: `## Zacznij od legalności produktu

Zanim poprosisz o wycenę, sprawdź, czy produkt może legalnie trafić do UE. Towary markowe, elektronika, kosmetyki, zabawki i baterie mogą wymagać dodatkowych dokumentów albo podlegać ograniczeniom celnym.

## Zweryfikuj dostawcę

Zdjęcia z fabryki, historia produkcji, kontrola próbki i warunki płatności pomagają odsiać ryzykownych sprzedawców. Niska cena nie wystarczy, jeśli dostawca nie potrafi udowodnić jakości.

## Policz koszt końcowy

Realny koszt to cena produktu, obsługa lokalna, kontrola jakości, transport, cło, VAT i prowizja. Cargoo składa te pozycje w jedną wycenę all-in przed płatnością.`,
  de: `## Beginne mit der Produktzulassung

Prüfe vor der Angebotsanfrage, ob das Produkt legal in die EU eingeführt werden kann. Markenware, Elektronik, Kosmetik, Spielzeug und Batterien können zusätzliche Dokumente oder Zollprüfungen erfordern.

## Prüfe den Lieferanten

Fabrikfotos, Produktionshistorie, Musterprüfung und Zahlungsbedingungen helfen, riskante Anbieter auszusortieren. Ein niedriger Stückpreis hilft nicht, wenn Qualität und Exportfähigkeit fehlen.

## Berechne die Gesamtkosten

Der echte Preis besteht aus Produktkosten, lokaler Abwicklung, Prüfung, Fracht, Zoll, Mehrwertsteuer und Servicegebühr. Cargoo fasst alles vor der Zahlung in einem All-in-Angebot zusammen.`,
  fr: `## Commencez par la conformité du produit

Avant de demander un devis, vérifiez si le produit peut entrer légalement dans l'UE. Les produits de marque, l'électronique, les cosmétiques, les jouets et les batteries peuvent demander des documents supplémentaires.

## Vérifiez le fournisseur

Photos d'usine, historique de production, contrôle d'échantillon et conditions de paiement aident à écarter les fournisseurs risqués. Un prix bas ne suffit pas si la qualité n'est pas prouvée.

## Calculez le coût rendu

Le vrai coût inclut produit, manutention locale, inspection, fret, droits, TVA et frais de service. Cargoo regroupe ces éléments dans un devis tout compris avant paiement.`,
};

export const BLOG_FALLBACK_POSTS: BlogFallbackPost[] = [
  {
    id: "fallback-en-import",
    title: "How to Import from China to the EU in 2026",
    slug: "import-from-china-to-eu-2026",
    metaDescription: "A practical guide to legal sourcing, supplier checks, freight choices, customs, VAT, and landed cost planning for EU importers.",
    targetKeyword: "Import Guide",
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
    lang: "en",
    status: "PUBLISHED",
    content: content.en,
  },
  {
    id: "fallback-en-suppliers",
    title: "Supplier Verification Checklist for China Sourcing",
    slug: "china-supplier-verification-checklist",
    metaDescription: "Use this checklist to evaluate Chinese suppliers before paying: factory proof, samples, quality checks, documentation, and shipping readiness.",
    targetKeyword: "Sourcing",
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
    lang: "en",
    status: "PUBLISHED",
    content: content.en,
  },
  {
    id: "fallback-en-freight",
    title: "Sea Freight vs Air Freight from China",
    slug: "sea-vs-air-freight-from-china",
    metaDescription: "Compare sea and air freight for China imports, including delivery speed, cost structure, customs handling, and when each option makes sense.",
    targetKeyword: "Logistics",
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
    lang: "en",
    status: "PUBLISHED",
    content: content.en,
  },
  {
    id: "fallback-pl-import",
    title: "Jak importować z Chin do UE w 2026 roku",
    slug: "import-z-chin-do-ue-2026",
    metaDescription: "Praktyczny przewodnik po legalnym sourcingu, weryfikacji dostawców, transporcie, cle, VAT i kosztach końcowych dla klientów z UE.",
    targetKeyword: "Przewodnik",
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
    lang: "pl",
    status: "PUBLISHED",
    content: content.pl,
  },
  {
    id: "fallback-pl-suppliers",
    title: "Checklista weryfikacji dostawcy z Chin",
    slug: "checklista-weryfikacji-dostawcy-z-chin",
    metaDescription: "Sprawdź dostawcę przed płatnością: potwierdzenie fabryki, próbki, kontrola jakości, dokumenty i gotowość do wysyłki.",
    targetKeyword: "Sourcing",
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
    lang: "pl",
    status: "PUBLISHED",
    content: content.pl,
  },
  {
    id: "fallback-pl-freight",
    title: "Transport morski czy lotniczy z Chin",
    slug: "transport-morski-czy-lotniczy-z-chin",
    metaDescription: "Porównaj transport morski i lotniczy z Chin: czas dostawy, strukturę kosztów, odprawę celną i najlepsze zastosowania.",
    targetKeyword: "Logistyka",
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
    lang: "pl",
    status: "PUBLISHED",
    content: content.pl,
  },
  {
    id: "fallback-de-import",
    title: "Import aus China in die EU im Jahr 2026",
    slug: "import-aus-china-in-die-eu-2026",
    metaDescription: "Ein praktischer Leitfaden zu legalem Sourcing, Lieferantenprüfung, Fracht, Zoll, Mehrwertsteuer und Landed-Cost-Planung.",
    targetKeyword: "Import-Guide",
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
    lang: "de",
    status: "PUBLISHED",
    content: content.de,
  },
  {
    id: "fallback-de-suppliers",
    title: "Checkliste zur Prüfung chinesischer Lieferanten",
    slug: "checkliste-pruefung-chinesischer-lieferanten",
    metaDescription: "Prüfe Lieferanten vor der Zahlung: Fabriknachweis, Muster, Qualitätskontrolle, Dokumente und Versandbereitschaft.",
    targetKeyword: "Sourcing",
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
    lang: "de",
    status: "PUBLISHED",
    content: content.de,
  },
  {
    id: "fallback-de-freight",
    title: "Seefracht oder Luftfracht aus China",
    slug: "seefracht-oder-luftfracht-aus-china",
    metaDescription: "Vergleiche See- und Luftfracht aus China nach Lieferzeit, Kostenstruktur, Zollabwicklung und passenden Einsatzfällen.",
    targetKeyword: "Logistik",
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
    lang: "de",
    status: "PUBLISHED",
    content: content.de,
  },
  {
    id: "fallback-fr-import",
    title: "Importer de Chine vers l'UE en 2026",
    slug: "importer-de-chine-vers-ue-2026",
    metaDescription: "Guide pratique sur le sourcing légal, la vérification fournisseur, le fret, la douane, la TVA et le coût rendu pour l'UE.",
    targetKeyword: "Guide Import",
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
    lang: "fr",
    status: "PUBLISHED",
    content: content.fr,
  },
  {
    id: "fallback-fr-suppliers",
    title: "Checklist de vérification fournisseur en Chine",
    slug: "checklist-verification-fournisseur-chine",
    metaDescription: "Vérifiez un fournisseur avant paiement: preuves d'usine, échantillons, contrôle qualité, documents et préparation expédition.",
    targetKeyword: "Sourcing",
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
    lang: "fr",
    status: "PUBLISHED",
    content: content.fr,
  },
  {
    id: "fallback-fr-freight",
    title: "Fret maritime ou aérien depuis la Chine",
    slug: "fret-maritime-ou-aerien-depuis-la-chine",
    metaDescription: "Comparez fret maritime et aérien depuis la Chine: délais, structure de coût, douane et cas d'utilisation.",
    targetKeyword: "Logistique",
    publishedAt: date,
    createdAt: date,
    updatedAt: date,
    lang: "fr",
    status: "PUBLISHED",
    content: content.fr,
  },
];

export function getFallbackBlogPosts(lang: string, showAll = false) {
  return BLOG_FALLBACK_POSTS.filter((post) => showAll || post.lang === lang);
}

export function getFallbackBlogPost(lang: string, slug: string) {
  return BLOG_FALLBACK_POSTS.find((post) => post.lang === lang && post.slug === slug) || null;
}
