import type { Metadata } from "next";
import prisma from "@/lib/prisma";
export const dynamic = 'force-dynamic';

const langs = ['en','pl','de','fr'] as const;
type Lang = typeof langs[number];

const HOME_META: Record<Lang, { title: string; description: string; canonical: string }> = {
  en: {
    title: "Cargoo | Import from China Made Simple",
    description: "Cargoo helps EU customers source, inspect, and ship lawful products from China with clear pricing and delivery support.",
    canonical: "https://www.cargooimport.eu/",
  },
  pl: {
    title: "Cargoo | Import z Chin bez stresu",
    description: "Cargoo pomaga klientom z UE legalnie pozyskiwać, sprawdzać i wysyłać produkty z Chin, z jasną ceną i wsparciem w dostawie.",
    canonical: "https://www.cargooimport.eu/cargoo-pl/",
  },
  de: {
    title: "Cargoo | Import aus China leicht gemacht",
    description: "Cargoo hilft EU-Kunden, legale Produkte aus China zu beschaffen, zu prüfen und zu versenden - mit klaren Preisen und Lieferunterstützung.",
    canonical: "https://www.cargooimport.eu/cargoo-de/",
  },
  fr: {
    title: "Cargoo | Import depuis la Chine simplifié",
    description: "Cargoo aide les clients de l'UE à sourcer, contrôler et expédier légalement des produits depuis la Chine, avec des prix clairs et un accompagnement livraison.",
    canonical: "https://www.cargooimport.eu/cargoo-fr/",
  },
};

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = (langs.includes(params.lang as Lang) ? params.lang : 'en') as Lang;
  const meta = HOME_META[lang];

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.canonical,
      languages: {
        en: HOME_META.en.canonical,
        pl: HOME_META.pl.canonical,
        de: HOME_META.de.canonical,
        fr: HOME_META.fr.canonical,
        "x-default": HOME_META.en.canonical,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonical,
      siteName: "Cargoo Import",
      type: "website",
      images: [{ url: "https://www.cargooimport.eu/assets/images/logo-image.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["https://www.cargooimport.eu/assets/images/logo-image.jpg"],
    },
  };
}

const t: Record<Lang, Record<string, string>> = {
  en: {
    badge: "FACTORY-DIRECT · NO SCAMS · NO GUESSWORK",
    h1a: "IMPORT ANYTHING",
    h1b: "FROM CHINA.",
    subtitle: "Sneakers, electronics, fashion, home goods — send us a link, we handle sourcing, QC, and shipping to your door. No MOQs. No surprise customs bills.",
    getQuote: "Get Free Quote",
    browseCatalog: "Browse Catalog",
    searchPlaceholder: "Search products, brands, categories...",
    trust1: "500+ orders shipped", trust2: "2–4 week delivery", trust3: "As seen on TikTok", trust4: "Escrow until QC passes", trust5: "EN · PL · DE · FR",
    whatTitle: "What is Cargoo?",
    whatDesc: "Think of us as your bilingual team on the ground in Shenzhen. Spot a product on TikTok, Alibaba, or 1688? Send us the link. We negotiate the factory price, photo-verify every unit before it ships, and handle customs so the price you see is the price you pay.",
    weeksLabel: "Weeks to your door",
    weeksDesc: "Average time from quote approval to delivery — customs handled.",
    escrowTitle: "Escrow Protected",
    escrowDesc: "Your money is held safely until our QC team approves the goods — video and photos sent before shipment.",
    trendingSubtitle: "Popular right now",
    trendingTitle: "Trending this week",
    trendingDesc: "A peek at what customers are ordering — every item factory-verified before it ships.",
    fullCatalog: "Browse full catalog",
    howSubtitle: "How It Works",
    howTitle: "From TikTok link to your doorstep in 4 steps",
    howDesc: "No paperwork. No Mandarin required. No middlemen fees stacked on top — just one transparent price.",
    step1Title: "Send the link", step1Desc: "Spotted something on TikTok, Alibaba, 1688 or Taobao? Drop the URL into WhatsApp. Describe it in English — we'll translate.",
    step2Title: "Get your all-in quote", step2Desc: "Within 24 hours we send one number — product, shipping, customs, and service fee included. No surprises at the door.",
    step3Title: "We buy & inspect", step3Desc: "Money held in escrow. Our Shenzhen team photo-verifies every unit and sends you proof before the crate leaves China.",
    step4Title: "Delivered, duties paid", step4Desc: "We clear EU customs in your name and drop the package at your door in 2–4 weeks. You sign, we're done.",
    servicesSubtitle: "What We Handle",
    servicesTitle: "Everything between \"I want this\" and \"it's at my door\"",
    servicesDesc: "Built for regular shoppers and small flippers — not Fortune 500 importers. No broker fees, no minimum orders, no Mandarin required.",
    feature1: "Single items welcome — no MOQs on most products",
    feature2: "Bilingual team on the ground in Shenzhen",
    feature3: "WhatsApp updates at every stage of the order",
    feature4: "EU customs cleared in your name — no surprise bills",
    agentTitle: "Dedicated Sourcing Agent",
    agentDesc: "Reach out via WhatsApp to chat directly with our bilingual sourcing agents on the ground in China.",
    whySubtitle: "Why Cargoo Wins",
    whyTitle: "Built for the buyer, not the broker",
    whyDesc: "We cut out the layers of middlemen and pass the savings to you — with a human on WhatsApp when you need one.",
    ctaTitle: "Got a link?", ctaHighlight: "We'll quote it.",
    ctaDesc: "Average quote turnaround: under 24 hours. Message us on WhatsApp — a real bilingual human replies, not a bot.",
    blogSubtitle: "Knowledge Base", blogTitle: "From our blog", allArticles: "All articles →",
    footerDesc: "Import from China Made Simple. We help you source verified products, small electronics, fashion items, and more.",
    footerCompany: "Company", footerContact: "Contact Us", footerLegal: "Legal",
    calcSubtitle: "Cost Calculator", calcTitle: "See your landed cost in 10 seconds",
    calcDesc: "A ballpark estimate — your real quote on WhatsApp will be this price or less.",
    faqSubtitle: "FAQ", faqTitle: "Questions we get every week",
    faqDesc: "Still unsure? Ping us on WhatsApp — we reply in minutes during EU business hours.",
  },
  pl: {
    badge: "PROSTO Z FABRYKI · ZERO SCAMÓW · ZERO DOMYSŁÓW",
    h1a: "ZAIMPORTUJ WSZYSTKO",
    h1b: "Z CHIN.",
    subtitle: "Sneakersy, elektronika, moda, artykuły domowe — wyślij nam link, zajmiemy się pozyskiwaniem, kontrolą jakości i dostawą. Bez MOQ. Bez ukrytych opłat celnych.",
    getQuote: "Darmowa Wycena",
    browseCatalog: "Przeglądaj Katalog",
    searchPlaceholder: "Szukaj produktów, marek, kategorii...",
    trust1: "500+ zamówień wysłanych", trust2: "Dostawa 2–4 tygodnie", trust3: "Widziany na TikTok", trust4: "Escrow do przejścia QC", trust5: "EN · PL · DE · FR",
    whatTitle: "Czym jest Cargoo?",
    whatDesc: "Traktuj nas jak swój dwujęzyczny zespół w Shenzhen. Zauważyłeś produkt na TikToku, Alibaba lub 1688? Wyślij nam link. Negocjujemy cenę fabryczną, weryfikujemy każdą sztukę przed wysyłką i zajmujemy się cłem — cena którą widzisz, to cena którą płacisz.",
    weeksLabel: "Tygodnie do Twoich drzwi",
    weeksDesc: "Średni czas od zatwierdzenia wyceny do dostawy — cło w cenie.",
    escrowTitle: "Ochrona Escrow",
    escrowDesc: "Twoje pieniądze są bezpiecznie trzymane do momentu zatwierdzenia towaru przez nasz zespół QC — wideo i zdjęcia przed wysyłką.",
    trendingSubtitle: "Popularne teraz",
    trendingTitle: "Trendy w tym tygodniu",
    trendingDesc: "Rzut oka na to, co zamawiają klienci — każdy produkt zweryfikowany fabrycznie przed wysyłką.",
    fullCatalog: "Przeglądaj pełny katalog",
    howSubtitle: "Jak to działa",
    howTitle: "Od linku TikTok do Twoich drzwi w 4 krokach",
    howDesc: "Bez papierkowej roboty. Bez chińskiego. Bez ukrytych prowizji — tylko jedna przejrzysta cena.",
    step1Title: "Wyślij link", step1Desc: "Widziałeś coś na TikToku, Alibaba, 1688 lub Taobao? Wrzuć URL na WhatsApp. Opisz po polsku — przetłumaczymy.",
    step2Title: "Otrzymaj wycenę all-in", step2Desc: "W ciągu 24 godzin wysyłamy jedną kwotę — produkt, wysyłka, cło i opłata serwisowa wliczone. Bez niespodzianek przy drzwiach.",
    step3Title: "Kupujemy i sprawdzamy", step3Desc: "Pieniądze w depozycie. Nasz zespół w Shenzhen weryfikuje każdą sztukę zdjęciami i wysyła Ci dowód przed opuszczeniem Chin przez przesyłkę.",
    step4Title: "Dostarczone, cło zapłacone", step4Desc: "Odprawiamy unijne cło na Twoje nazwisko i dostarczamy paczkę pod drzwi w 2–4 tygodnie. Podpisujesz, jesteśmy gotowi.",
    servicesSubtitle: "Co obsługujemy",
    servicesTitle: "Wszystko między \"chcę to\" a \"jest pod moimi drzwiami\"",
    servicesDesc: "Stworzone dla zwykłych kupujących i małych handlarzy — nie dla importerów z Fortune 500. Bez opłat pośredników, bez minimalnych zamówień, bez chińskiego.",
    feature1: "Pojedyncze przedmioty mile widziane — brak MOQ dla większości produktów",
    feature2: "Dwujęzyczny zespół na miejscu w Shenzhen",
    feature3: "Aktualizacje WhatsApp na każdym etapie zamówienia",
    feature4: "Odprawa celna UE na Twoje nazwisko — bez niespodziewanych rachunków",
    agentTitle: "Dedykowany Agent Sourcingowy",
    agentDesc: "Skontaktuj się przez WhatsApp, aby porozmawiać bezpośrednio z naszymi dwujęzycznymi agentami sourcingowymi w Chinach.",
    whySubtitle: "Dlaczego Cargoo wygrywa",
    whyTitle: "Zbudowane dla kupującego, nie dla pośrednika",
    whyDesc: "Eliminujemy warstwy pośredników i przekazujemy oszczędności Tobie — z człowiekiem na WhatsApp kiedy go potrzebujesz.",
    ctaTitle: "Masz link?", ctaHighlight: "Wycenimy to.",
    ctaDesc: "Średni czas realizacji wyceny: poniżej 24 godzin. Napisz do nas na WhatsApp — odpowiada prawdziwy dwujęzyczny człowiek, nie bot.",
    blogSubtitle: "Baza Wiedzy", blogTitle: "Z naszego bloga", allArticles: "Wszystkie artykuły →",
    footerDesc: "Import z Chin Made Simple. Pomagamy zamawiac zweryfikowane produkty, elektronike, mode i wiele wiecej.",
    footerCompany: "Firma", footerContact: "Kontakt", footerLegal: "Prawne",
    calcSubtitle: "Kalkulator Kosztów", calcTitle: "Poznaj swój koszt lądowania w 10 sekund",
    calcDesc: "Przybliżone szacunki — Twoja prawdziwa wycena na WhatsApp będzie równa tej cenie lub niższa.",
    faqSubtitle: "FAQ", faqTitle: "Pytania które dostajemy co tydzień",
    faqDesc: "Nadal nie pewny? Napisz do nas na WhatsApp — odpowiadamy w minuty podczas europejskich godzin pracy.",
  },
  de: {
    badge: "DIREKT VOM HERSTELLER · KEINE BETRÜGEREIEN · KEINE RATEREI",
    h1a: "ALLES IMPORTIEREN",
    h1b: "AUS CHINA.",
    subtitle: "Sneaker, Elektronik, Mode, Haushaltswaren — schick uns einen Link, wir kümmern uns um Beschaffung, QK und Lieferung. Keine MOQs. Keine versteckten Zollgebühren.",
    getQuote: "Kostenloses Angebot",
    browseCatalog: "Katalog durchsuchen",
    searchPlaceholder: "Produkte, Marken, Kategorien suchen...",
    trust1: "500+ versendete Bestellungen", trust2: "Lieferung 2–4 Wochen", trust3: "Auf TikTok gesehen", trust4: "Treuhand bis QK bestanden", trust5: "EN · PL · DE · FR",
    whatTitle: "Was ist Cargoo?",
    whatDesc: "Stell dir uns als dein zweisprachiges Team vor Ort in Shenzhen vor. Hast du ein Produkt auf TikTok, Alibaba oder 1688 entdeckt? Schick uns den Link. Wir verhandeln den Fabrikpreis, überprüfen jede Einheit vor dem Versand und erledigen den Zoll.",
    weeksLabel: "Wochen bis zu deiner Tür",
    weeksDesc: "Durchschnittliche Zeit von der Angebotsfreigabe bis zur Lieferung — Zoll inklusive.",
    escrowTitle: "Treuhand-Schutz",
    escrowDesc: "Dein Geld wird sicher gehalten, bis unser QK-Team die Waren genehmigt — Video und Fotos vor dem Versand.",
    trendingSubtitle: "Jetzt beliebt",
    trendingTitle: "Trends dieser Woche",
    trendingDesc: "Ein Blick auf das, was Kunden bestellen — jeder Artikel vor dem Versand fabrikseitig verifiziert.",
    fullCatalog: "Vollständigen Katalog durchsuchen",
    howSubtitle: "So funktioniert es",
    howTitle: "Vom TikTok-Link zu deiner Haustür in 4 Schritten",
    howDesc: "Kein Papierkram. Kein Mandarin erforderlich. Keine gestapelten Vermittlergebühren — nur ein transparenter Preis.",
    step1Title: "Link senden", step1Desc: "Etwas auf TikTok, Alibaba, 1688 oder Taobao entdeckt? URL in WhatsApp eingeben. Auf Deutsch beschreiben — wir übersetzen.",
    step2Title: "All-in-Angebot erhalten", step2Desc: "Innerhalb von 24 Stunden senden wir eine Zahl — Produkt, Versand, Zoll und Servicegebühr inklusive.",
    step3Title: "Wir kaufen & prüfen", step3Desc: "Geld in Treuhand. Unser Shenzhen-Team überprüft jede Einheit mit Fotos und sendet dir den Nachweis, bevor die Kiste China verlässt.",
    step4Title: "Geliefert, Zoll bezahlt", step4Desc: "Wir erledigen den EU-Zoll auf deinen Namen und liefern das Paket in 2–4 Wochen an deine Tür. Du unterschreibst, wir sind fertig.",
    servicesSubtitle: "Was wir übernehmen",
    servicesTitle: "Alles zwischen \"Ich will das\" und \"es ist an meiner Tür\"",
    servicesDesc: "Gebaut für normale Käufer und kleine Händler — nicht für Fortune 500-Importeure.",
    feature1: "Einzelartikel willkommen — keine MOQs bei den meisten Produkten",
    feature2: "Zweisprachiges Team vor Ort in Shenzhen",
    feature3: "WhatsApp-Updates in jeder Bestellphase",
    feature4: "EU-Zoll auf deinen Namen — keine Überraschungsrechnungen",
    agentTitle: "Dedizierter Beschaffungsagent",
    agentDesc: "Kontaktiere uns über WhatsApp, um direkt mit unseren zweisprachigen Beschaffungsagenten in China zu sprechen.",
    whySubtitle: "Warum Cargoo gewinnt",
    whyTitle: "Für den Käufer gebaut, nicht für den Makler",
    whyDesc: "Wir eliminieren die Zwischenhändler-Schichten und geben die Einsparungen an dich weiter.",
    ctaTitle: "Hast du einen Link?", ctaHighlight: "Wir machen ein Angebot.",
    ctaDesc: "Durchschnittliche Angebotslaufzeit: unter 24 Stunden. Schreib uns auf WhatsApp — ein echter zweisprachiger Mensch antwortet.",
    blogSubtitle: "Wissensdatenbank", blogTitle: "Aus unserem Blog", allArticles: "Alle Artikel →",
    footerDesc: "Import aus China leicht gemacht. Wir helfen dir, gepruefte Produkte, Elektronik, Mode und mehr zu bestellen.",
    footerCompany: "Unternehmen", footerContact: "Kontakt", footerLegal: "Rechtliches",
    calcSubtitle: "Kostenkalkulator", calcTitle: "Sieh deine Landekosten in 10 Sekunden",
    calcDesc: "Eine grobe Schätzung — dein echtes Angebot auf WhatsApp wird diesen Preis haben oder niedriger sein.",
    faqSubtitle: "FAQ", faqTitle: "Fragen die wir jede Woche bekommen",
    faqDesc: "Noch unsicher? Schreib uns auf WhatsApp — wir antworten in Minuten während der EU-Geschäftszeiten.",
  },
  fr: {
    badge: "DIRECTEMENT DE L'USINE · SANS ARNAQUES · SANS DEVINETTES",
    h1a: "IMPORTEZ TOUT",
    h1b: "DEPUIS LA CHINE.",
    subtitle: "Sneakers, électronique, mode, articles ménagers — envoyez-nous un lien, on gère l'approvisionnement, le contrôle qualité et la livraison. Sans MOQ. Sans frais douaniers surprises.",
    getQuote: "Devis Gratuit",
    browseCatalog: "Parcourir le Catalogue",
    searchPlaceholder: "Rechercher des produits, marques, catégories...",
    trust1: "500+ commandes expédiées", trust2: "Livraison 2–4 semaines", trust3: "Vu sur TikTok", trust4: "Entiercement jusqu'au CQ", trust5: "EN · PL · DE · FR",
    whatTitle: "C'est quoi Cargoo?",
    whatDesc: "Pensez à nous comme votre équipe bilingue sur le terrain à Shenzhen. Vous avez repéré un produit sur TikTok, Alibaba ou 1688? Envoyez-nous le lien. Nous négocions le prix d'usine, vérifions chaque unité avant expédition et gérons la douane.",
    weeksLabel: "Semaines jusqu'à votre porte",
    weeksDesc: "Délai moyen de l'approbation du devis à la livraison — douane incluse.",
    escrowTitle: "Protection par Séquestre",
    escrowDesc: "Votre argent est conservé en sécurité jusqu'à ce que notre équipe CQ approuve les marchandises — vidéo et photos avant expédition.",
    trendingSubtitle: "Populaire maintenant",
    trendingTitle: "Tendances de la semaine",
    trendingDesc: "Un aperçu de ce que les clients commandent — chaque article vérifié en usine avant expédition.",
    fullCatalog: "Parcourir le catalogue complet",
    howSubtitle: "Comment ça marche",
    howTitle: "Du lien TikTok à votre porte en 4 étapes",
    howDesc: "Pas de paperasse. Pas de mandarin requis. Pas de frais d'intermédiaires — juste un prix transparent.",
    step1Title: "Envoyez le lien", step1Desc: "Repéré quelque chose sur TikTok, Alibaba, 1688 ou Taobao? Envoyez l'URL sur WhatsApp. Décrivez en français — on traduit.",
    step2Title: "Recevez votre devis tout compris", step2Desc: "Dans les 24 heures on envoie un seul chiffre — produit, livraison, douane et frais de service inclus.",
    step3Title: "On achète et inspecte", step3Desc: "Argent en séquestre. Notre équipe à Shenzhen vérifie chaque unité par photos et vous envoie la preuve avant que la caisse quitte la Chine.",
    step4Title: "Livré, droits payés", step4Desc: "On dédouane à l'UE en votre nom et livrons le colis à votre porte en 2–4 semaines.",
    servicesSubtitle: "Ce qu'on gère",
    servicesTitle: "Tout entre \"je veux ça\" et \"c'est à ma porte\"",
    servicesDesc: "Conçu pour les acheteurs ordinaires et les petits revendeurs — pas pour les importateurs Fortune 500.",
    feature1: "Articles unitaires bienvenus — pas de MOQ pour la plupart des produits",
    feature2: "Équipe bilingue sur le terrain à Shenzhen",
    feature3: "Mises à jour WhatsApp à chaque étape de la commande",
    feature4: "Douane UE dédouanée en votre nom — sans factures surprises",
    agentTitle: "Agent d'approvisionnement dédié",
    agentDesc: "Contactez-nous via WhatsApp pour discuter directement avec nos agents bilingues en Chine.",
    whySubtitle: "Pourquoi Cargoo gagne",
    whyTitle: "Conçu pour l'acheteur, pas pour le courtier",
    whyDesc: "On élimine les couches d'intermédiaires et vous faisons bénéficier des économies.",
    ctaTitle: "Vous avez un lien?", ctaHighlight: "On vous fait un devis.",
    ctaDesc: "Délai moyen de devis: moins de 24 heures. Écrivez-nous sur WhatsApp — un vrai humain bilingue répond.",
    blogSubtitle: "Base de Connaissances", blogTitle: "De notre blog", allArticles: "Tous les articles →",
    footerDesc: "Importer de Chine, c'est simple. On vous aide a commander des produits verifies, electronique, mode et plus encore.",
    footerCompany: "Entreprise", footerContact: "Contact", footerLegal: "Légal",
    calcSubtitle: "Calculateur de Coûts", calcTitle: "Voyez votre coût de débarquement en 10 secondes",
    calcDesc: "Une estimation approximative — votre vrai devis sur WhatsApp sera ce prix ou moins.",
    faqSubtitle: "FAQ", faqTitle: "Questions qu'on reçoit chaque semaine",
    faqDesc: "Encore incertain? Écrivez-nous sur WhatsApp — on répond en minutes pendant les heures ouvrables européennes.",
  },
};

type LegalSlug = "terms" | "privacy" | "refund";

function publicLegalUrl(lang: Lang, slug: LegalSlug) {
  if (lang === "en") return `https://www.cargooimport.eu/${slug}`;
  return `https://www.cargooimport.eu/cargoo-${lang}/${slug}`;
}

export default async function Home({ params }: { params: { lang: string } }) {
  const lang = (langs.includes(params.lang as Lang) ? params.lang : 'en') as Lang;
  const s = t[lang];
  const blogBase = `https://www.cargooimport.eu/${lang}/blog`;

  let latestPosts: { title: string; slug: string; metaDescription: string | null; targetKeyword: string | null }[] = [];
  try {
    latestPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED", lang },
      orderBy: [
        { publishedAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      take: 3,
      select: { title: true, slug: true, metaDescription: true, targetKeyword: true },
    });
  } catch (e) {
    console.error("Failed to load blog posts for homepage:", e);
  }

  return (
    <>
      {/* Header */}
      <header className="header" id="header">
        <div className="container nav-container">
          <a href={`/${lang}`} className="logo" style={{display:'flex',alignItems:'center',gap:'0.5rem',fontWeight:800,fontSize:'1.5rem',color:'#fff'}}>
            <i className="fa-solid fa-cube" style={{color:'var(--clr-orange)'}}></i> Cargoo
          </a>
          <nav className="desktop-nav">
            <ul className="nav-links">
              <li><a href={`/${lang}/products`} className="nav-highlight-cta"><i className="fa-solid fa-sparkles"></i> Products</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#pricing">Calculator</a></li>
              <li><a href={blogBase}>Blog</a></li>
            </ul>
          </nav>
          <div className="nav-actions">
            <div className="lang-switch" style={{display:'flex',gap:'0.3rem',background:'rgba(255,255,255,0.05)',padding:'0.2rem',borderRadius:'2rem',border:'1px solid var(--clr-border)'}}>
              {(['en','pl','de','fr'] as const).map(l => (
                <a key={l} href={`/${l}`} className={`lang-link${lang===l?' active':''}`} style={{padding:'0.2rem 0.5rem',borderRadius:'1rem',fontSize:'0.7rem',fontWeight:700,color: lang===l ? '#fff' : '#888',background: lang===l ? 'var(--clr-orange)' : 'transparent',textDecoration:'none'}}>{l.toUpperCase()}</a>
              ))}
            </div>
            <a href="https://wa.me/48500685000?text=Hi%20Cargoo%2C%20I%27d%20like%20a%20quote%20for..." target="_blank" rel="noopener" className="btn btn-primary btn-nav"><i className="fa-brands fa-whatsapp"></i> {s.getQuote}</a>
            <button className="mobile-toggle" aria-label="Toggle Navigation"><i className="fa-solid fa-bars"></i></button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className="mobile-menu" id="mobileMenu">
        <div className="mobile-menu-header">
          <a href={`/${lang}`} className="logo" style={{color:'white',display:'flex',alignItems:'center',gap:'0.5rem',fontWeight:800}}>
            <i className="fa-solid fa-cube" style={{color:'var(--clr-orange)'}}></i> Cargoo
          </a>
          <button className="close-menu" id="closeMenu" aria-label="Close menu"><i className="fa-solid fa-xmark"></i></button>
        </div>
        <ul className="mobile-nav-links">
          <li><a href={`/${lang}/products`} className="mobile-link">Products</a></li>
          <li><a href="#how-it-works" className="mobile-link">How It Works</a></li>
          <li><a href="#services" className="mobile-link">Services</a></li>
          <li><a href="#pricing" className="mobile-link">Calculator</a></li>
          <li><a href={blogBase} className="mobile-link">Blog</a></li>
        </ul>
        <div className="mobile-nav-cta">
          <div className="lang-switch-mobile" style={{display:'flex',gap:'1rem',marginBottom:'2rem',padding:'0 1.5rem'}}>
            {(['en','pl','de','fr'] as const).map(l => (
              <a key={l} href={`/${l}`} style={{color: lang===l ? 'var(--clr-orange)' : '#fff',textDecoration:'none',opacity: lang===l ? 1 : 0.5,fontWeight:700,borderBottom: lang===l ? '2px solid var(--clr-orange)' : 'none'}}>{l.toUpperCase()}</a>
            ))}
          </div>
          <a href="https://wa.me/48500685000?text=Hi%20Cargoo%2C%20I%27d%20like%20a%20quote%20for..." target="_blank" rel="noopener" className="btn btn-primary btn-block mobile-link"><i className="fa-brands fa-whatsapp"></i> {s.getQuote}</a>
        </div>
      </div>
      <div className="mobile-overlay" id="mobileOverlay"></div>

      <main>
        {/* Hero */}
        <section className="hero viral-hero" id="hero">
          <div className="mesh-bg">
            <div className="mesh-blob mesh-1"></div>
            <div className="mesh-blob mesh-2"></div>
          </div>
          <div className="container hero-container-single">
            <div className="hero-content text-center" style={{maxWidth:'900px',margin:'0 auto'}}>
              <div className="badge glass-badge fade-up"><i className="fa-solid fa-bolt" style={{color:'var(--clr-orange)',marginRight:'6px'}}></i> {s.badge}</div>
              <h1 className="fade-up delay-1 super-title">{s.h1a} <br/><span className="gradient-text">{s.h1b}</span></h1>
              <p className="fade-up delay-2 subtitle-large">{s.subtitle}</p>
              <div className="hero-buttons fade-up delay-3" style={{justifyContent:'center',marginBottom:'2rem',display:'flex',flexWrap:'wrap',gap:'1rem'}}>
                <a href="https://wa.me/48500685000?text=Hi%20Cargoo%2C%20I%27d%20like%20a%20quote%20for..." target="_blank" rel="noopener" className="btn btn-primary btn-glow btn-lg"><i className="fa-brands fa-whatsapp"></i> {s.getQuote}</a>
                <a href={`/${lang}/products`} className="btn btn-secondary btn-lg">{s.browseCatalog} <i className="fa-solid fa-arrow-right"></i></a>
              </div>
              <div className="global-search hero-search fade-up delay-4" role="search">
                <div className="search-input-wrapper">
                  <i className="fa-solid fa-magnifying-glass" style={{fontSize:'1.25rem'}}></i>
                  <input type="text" className="search-input input-lg" placeholder={s.searchPlaceholder} aria-label="Search" role="combobox" aria-expanded="false" aria-controls="searchDropdown"/>
                  <button className="search-clear" aria-label="Clear Search"><i className="fa-solid fa-xmark"></i></button>
                </div>
                <div className="search-dropdown" id="searchDropdown" role="listbox">
                  <div className="search-scroll-area" id="searchResultsArea"></div>
                </div>
              </div>
              <div className="trust-strip fade-up delay-4">
                <span><i className="fa-solid fa-box-archive"></i> {s.trust1}</span>
                <span><i className="fa-solid fa-stopwatch"></i> {s.trust2}</span>
                <span><i className="fa-brands fa-tiktok"></i> {s.trust3}</span>
                <span><i className="fa-solid fa-lock"></i> {s.trust4}</span>
                <span><i className="fa-solid fa-language"></i> {s.trust5}</span>
              </div>
            </div>
          </div>
        </section>

        {/* What is Cargoo */}
        <section className="what-is-cargoo" id="what-is-cargoo">
          <div className="container">
            <div className="bento-grid">
              <div className="bento-card glass-panel bento-large fade-up scroll-trigger">
                <div className="card-icon"><i className="fa-solid fa-bolt"></i></div>
                <h2>{s.whatTitle}</h2>
                <p>{s.whatDesc}</p>
              </div>
              <div className="bento-card glass-panel bento-vertical bg-gradient-orange fade-up scroll-trigger delay-1">
                <div className="huge-number">2-4</div>
                <h3>{s.weeksLabel}</h3>
                <p>{s.weeksDesc}</p>
              </div>
              <div className="bento-card glass-panel flex-center fade-up scroll-trigger delay-2 text-center" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem'}}>
                <i className="fa-solid fa-shield-halved" style={{fontSize:'2.5rem',color:'var(--clr-blue)',marginBottom:'1rem'}}></i>
                <h3 style={{margin:'0 0 0.5rem 0'}}>{s.escrowTitle}</h3>
                <p style={{margin:0,fontSize:'0.9rem',color:'var(--clr-text-muted)'}}>{s.escrowDesc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Teaser */}
        <section className="product-teaser" id="product-teaser" style={{padding:'4rem 0'}}>
          <div className="container">
            <div className="section-header text-center fade-up scroll-trigger" style={{marginBottom:'3rem'}}>
              <span className="subtitle">{s.trendingSubtitle}</span>
              <h2>{s.trendingTitle}</h2>
              <p>{s.trendingDesc}</p>
            </div>
            <div className="teaser-grid fade-up scroll-trigger">
              {[
                {cat:'Sneakers',name:'Designer Sneakers',img:'/img/placeholders/sneaker.png',time:'3 weeks delivery'},
                {cat:'Electronics',name:'Wireless Earbuds',img:'/img/placeholders/tech.png',time:'2 weeks delivery'},
                {cat:'Apparel',name:'Streetwear Hoodie',img:'/img/placeholders/apparel.png',time:'3 weeks delivery'},
                {cat:'Watches',name:'Luxury Timepiece',img:'/img/placeholders/watch.png',time:'3 weeks delivery'},
                {cat:'Handbags',name:'Designer Handbag',img:'/img/placeholders/bag.png',time:'3 weeks delivery'},
                {cat:'Accessories',name:'Luxury Sunglasses',img:'/img/placeholders/accessory.png',time:'3 weeks delivery'},
              ].map(p => (
                <a key={p.cat} href={`/${lang}/products`} className="teaser-card">
                  <div className="teaser-img"><img src={p.img} alt={p.name} loading="lazy"/></div>
                  <div className="teaser-body">
                    <p className="teaser-cat">{p.cat}</p>
                    <h4>{p.name}</h4>
                    <p className="teaser-meta">{p.time}</p>
                  </div>
                </a>
              ))}
            </div>
            <div className="text-center" style={{marginTop:'2.5rem'}}>
              <a href={`/${lang}/products`} className="btn btn-primary">{s.fullCatalog} <i className="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works" id="how-it-works">
          <div className="container">
            <div className="section-header text-center fade-up scroll-trigger">
              <span className="subtitle">{s.howSubtitle}</span>
              <h2>{s.howTitle}</h2>
              <p>{s.howDesc}</p>
            </div>
            <div className="steps-container">
              {[
                {icon:'fa-regular fa-paper-plane',n:'1',title:s.step1Title,desc:s.step1Desc},
                {icon:'fa-solid fa-calculator',n:'2',title:s.step2Title,desc:s.step2Desc},
                {icon:'fa-solid fa-microscope',n:'3',title:s.step3Title,desc:s.step3Desc},
                {icon:'fa-solid fa-house-chimney',n:'4',title:s.step4Title,desc:s.step4Desc},
              ].map((step,i) => (
                <div key={i} className={`step-card fade-up scroll-trigger delay-${i+1}`}>
                  <div className="step-icon">
                    <i className={step.icon}></i>
                    <span className="step-number">{step.n}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="services bg-light" id="services">
          <div className="container">
            <div className="section-flex">
              <div className="services-info fade-right scroll-trigger">
                <span className="subtitle">{s.servicesSubtitle}</span>
                <h2>{s.servicesTitle}</h2>
                <p>{s.servicesDesc}</p>
                <ul className="features-list">
                  <li><i className="fa-solid fa-check-circle text-orange"></i> {s.feature1}</li>
                  <li><i className="fa-solid fa-check-circle text-orange"></i> {s.feature2}</li>
                  <li><i className="fa-solid fa-check-circle text-orange"></i> {s.feature3}</li>
                  <li><i className="fa-solid fa-check-circle text-orange"></i> {s.feature4}</li>
                </ul>
                <div style={{marginTop:'3rem',padding:'1.5rem',background:'var(--clr-bg-surface-elevated)',border:'1px solid var(--clr-border)',borderRadius:'1rem',display:'flex',alignItems:'center',gap:'1rem'}}>
                  <div style={{background:'rgba(255,107,0,0.1)',padding:'1rem',borderRadius:'0.75rem',color:'var(--clr-orange)'}}>
                    <i className="fa-solid fa-headset fa-2x"></i>
                  </div>
                  <div>
                    <h4 style={{margin:'0 0 0.35rem 0',fontSize:'1.1rem'}}>{s.agentTitle}</h4>
                    <p style={{margin:0,fontSize:'0.9rem',color:'var(--clr-text-muted)'}}>{s.agentDesc}</p>
                  </div>
                </div>
              </div>
              <div className="services-grid">
                {[
                  {icon:'fa-solid fa-handshake',title:'Product Sourcing',desc:'We find verified manufacturers with reliable production capabilities.'},
                  {icon:'fa-solid fa-comments',title:'Supplier Communication',desc:'We negotiate terms, OEM details, and pricing on your behalf.'},
                  {icon:'fa-solid fa-microscope',title:'Quality Inspection',desc:'Video/photo proof and detailed reports before final payment.'},
                  {icon:'fa-solid fa-truck-fast',title:'Shipping & Logistics',desc:'Optimized freight forwarding solutions at wholesale rates.'},
                  {icon:'fa-solid fa-file-signature',title:'Customs Handling',desc:'We handle FDA, CE compliance, tariffs, and all clearance documents.'},
                  {icon:'fa-solid fa-shield-halved',title:'Secure Payments',desc:'We manage escrow payments and FX conversion to protect you.'},
                ].map((svc,i) => (
                  <div key={i} className={`service-card fade-up scroll-trigger delay-${i+1}`}>
                    <div className="service-icon"><i className={svc.icon}></i></div>
                    <h4>{svc.title}</h4>
                    <p>{svc.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section className="why-us" id="why-choose-us">
          <div className="container">
            <div className="section-header text-center fade-up scroll-trigger">
              <span className="subtitle">{s.whySubtitle}</span>
              <h2>{s.whyTitle}</h2>
              <p>{s.whyDesc}</p>
            </div>
            <div className="benefits-grid">
              {[
                {icon:'fa-solid fa-graduation-cap',title:'Zero learning curve',desc:"First-time importer? No problem. Send a link, approve the quote — we handle the rest."},
                {icon:'fa-solid fa-tags',title:'One transparent price',desc:"Product + shipping + customs + our fee — all on one line. No surprise VAT bills."},
                {icon:'fa-solid fa-handshake-angle',title:'QC before you pay in full',desc:"Your money sits in escrow. We photograph every unit before the factory sees the cash."},
                {icon:'fa-solid fa-jet-fighter-up',title:'Pick your speed',desc:"Standard or express air — choose your delivery speed and budget. 5 to 14 days."},
              ].map((b,i) => (
                <div key={i} className={`benefit-box fade-up scroll-trigger delay-${i+1}`}>
                  <div className="benefit-icon"><i className={b.icon}></i></div>
                  <h3>{b.title}</h3>
                  <p>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section className="calculator bg-light" id="pricing">
          <div className="container container-sm">
            <div className="calculator-card fade-up scroll-trigger">
              <div className="calc-header">
                <span className="subtitle">{s.calcSubtitle}</span>
                <h2>{s.calcTitle}</h2>
                <p>{s.calcDesc}</p>
              </div>
              <div className="calc-form">
                <div className="form-group">
                  <label htmlFor="productCost">Total Product Cost (€)</label>
                  <input type="number" id="productCost" placeholder="e.g. 500" min="0"/>
                </div>
                <div className="form-group">
                  <label htmlFor="weight">Estimated Weight (kg)</label>
                  <input type="number" id="weight" placeholder="e.g. 5" min="0"/>
                </div>
                <div className="form-group">
                  <label>Shipping Method</label>
                  <div className="calc-shipping-options">
                    <input type="radio" name="shippingMethod" id="ship_std" value="air_standard" defaultChecked/>
                    <label htmlFor="ship_std"><strong>Standard Air</strong><span>€15/kg · 10–14 days</span></label>
                    <input type="radio" name="shippingMethod" id="ship_exp" value="air_express"/>
                    <label htmlFor="ship_exp"><strong>Express Air</strong><span>€18/kg · 5–7 days</span></label>
                  </div>
                </div>
                <button id="calculateBtn" className="btn btn-primary btn-block btn-lg">Calculate Estimate <i className="fa-solid fa-arrow-right"></i></button>
              </div>
              <div className="calc-results hidden" id="calcResults">
                <div className="result-row"><span>Product Cost</span><span id="resProduct">€0.00</span></div>
                <div className="result-row"><span>Est. Shipping</span><span id="resShipping">€0.00</span></div>
                <div className="result-row"><span>Cargoo Service Fee</span><span id="resService">€0.00</span></div>
                <div className="result-row"><span>Customs &amp; Duties</span><span id="resCustoms">€0.00</span></div>
                <div className="result-divider"></div>
                <div className="result-row total"><span>Total Estimated Cost</span><span id="resTotal" className="text-blue">€0.00</span></div>
                <p className="calc-note">*This is a rough estimate. Actual costs may vary based on volumetric weight and specific tariffs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials" id="testimonials">
          <div className="container">
            <div className="section-header text-center fade-up scroll-trigger">
              <span className="subtitle">Real Receipts</span>
              <h2>500+ orders. Zero scams. Here&apos;s the proof.</h2>
              <p>Every review below is a verified Cargoo order — name, city, and order number on the record.</p>
            </div>
            <div className="testimonial-grid">
              {[
                {img:'https://i.pravatar.cc/100?img=5',name:'Sarah J.',loc:'Warsaw, PL · Order #CG-1824',text:'"Saw a pair of Jordan 1s on TikTok and almost got burned by a sketchy DHgate seller. Sent the link to Cargoo instead — they sent factory photos before shipping, and the pair landed in Warsaw in 19 days."'},
                {img:'https://i.pravatar.cc/100?img=11',name:'Mike T.',loc:'Berlin, DE · Order #CG-1759',text:'"I wanted a Moncler jacket without the €1,800 markup. Had a quote on WhatsApp by morning. All-in price, no hidden customs bill at the door. This is how importing should work."'},
                {img:'https://i.pravatar.cc/100?img=12',name:'David L.',loc:'Paris, FR · Order #CG-1691',text:'"Cargoo\'s QC team sent me a 12-photo inspection report before the crate left Shenzhen. Caught a defect on one pair and swapped it — saved me a refund headache."'},
              ].map((t,i) => (
                <div key={i} className={`testimonial-card fade-up scroll-trigger delay-${i+1}`}>
                  <div className="quote-icon"><i className="fa-solid fa-quote-left"></i></div>
                  <div className="testimonial-stars"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></div>
                  <p className="testimonial-text">{t.text}</p>
                  <div className="testimonial-author">
                    <img src={t.img} alt={t.name} className="author-img" loading="lazy"/>
                    <div className="author-info">
                      <h4>{t.name} <span className="verified-check"><i className="fa-solid fa-circle-check"></i></span></h4>
                      <span>{t.loc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq" id="faq" style={{padding:'6rem 0'}}>
          <div className="container container-sm">
            <div className="section-header text-center fade-up scroll-trigger" style={{marginBottom:'3rem'}}>
              <span className="subtitle">{s.faqSubtitle}</span>
              <h2>{s.faqTitle}</h2>
              <p>{s.faqDesc}</p>
            </div>
            <div className="faq-list">
              {[
                {q:'Is this legal? What about customs?',a:'Yes — importing goods for personal use or small-scale resale is fully legal across the EU. We declare every shipment honestly, pay VAT and import duties in your name, and hand you the paperwork.'},
                {q:'What if the product arrives broken or wrong?',a:'We photo-inspect every unit before it leaves China, so 95% of issues are caught upstream. If something is still wrong on arrival, we reship or refund at our cost within 14 days.'},
                {q:'Do I need a business or VAT number?',a:'Nope. Most of our customers are individuals — sneakerheads, hobbyists, side-hustlers. We handle personal imports and small-business orders the same way.'},
                {q:'How is pricing calculated?',a:'Product cost + shipping by weight + EU customs & VAT + our 8% service fee (min €25). You see every line item on the quote — no markup hidden in the product price.'},
                {q:'When do I pay?',a:'After you approve the quote, you pay into escrow (Stripe, PayPal, or bank transfer). Funds release to the factory only after our QC team signs off.'},
                {q:'Can I order replicas or branded goods?',a:"We source factory-direct unbranded goods and non-counterfeit items for personal use. We don't touch obvious trademark infringements. Ask and we'll tell you honestly what's sourceable."},
              ].map((faq,i) => (
                <details key={i} className="faq-item fade-up scroll-trigger">
                  <summary><span>{faq.q}</span><i className="fa-solid fa-plus faq-toggle"></i></summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta" id="cta">
          <div className="container">
            <div className="cta-content fade-up scroll-trigger text-center">
              <h2>{s.ctaTitle} <span className="text-orange">{s.ctaHighlight}</span></h2>
              <p>{s.ctaDesc}</p>
              <div className="contact-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:'2rem',marginTop:'4rem'}}>
                <a href="mailto:contact@cargooimport.eu" className="contact-box glass-panel text-center pulse-box">
                  <i className="fa-solid fa-envelope-open-text" style={{color:'var(--clr-orange)'}}></i>
                  <span className="text-white" style={{fontSize:'clamp(1.1rem,4vw,2rem)',letterSpacing:'-0.5px',whiteSpace:'nowrap'}}>contact@cargooimport.eu</span>
                  <p style={{color:'var(--clr-orange)',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',marginTop:'1rem'}}>Tap to Email</p>
                </a>
                <a href="https://wa.me/48500685000?text=Hi%20Cargoo%2C%20I%27d%20like%20a%20quote%20for..." target="_blank" rel="noopener" className="contact-box glass-panel text-center pulse-box" style={{borderColor:'#25D366',boxShadow:'0 0 30px rgba(37,211,102,0.15)'}}>
                  <i className="fa-brands fa-whatsapp" style={{color:'#25D366'}}></i>
                  <span className="text-white" style={{fontSize:'clamp(1.2rem,5vw,2.2rem)',letterSpacing:'-0.5px',whiteSpace:'nowrap'}}>+48 500 685 000</span>
                  <p style={{color:'#25D366',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',marginTop:'1rem'}}>Message us on WhatsApp</p>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Blog Section */}
      <section style={{background:'#0a0a0a',padding:'5rem 0',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <div className="container">
          <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem',marginBottom:'2.5rem'}}>
            <div>
              <span style={{color:'var(--clr-orange)',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.12em',fontSize:'0.75rem'}}>{s.blogSubtitle}</span>
              <h2 style={{fontSize:'clamp(1.8rem,4vw,2.8rem)',fontWeight:900,letterSpacing:'-0.04em',marginTop:'0.4rem'}}>{s.blogTitle}</h2>
            </div>
            <a href={blogBase} style={{color:'var(--clr-orange)',fontWeight:700,textDecoration:'none',fontSize:'0.9rem'}}>{s.allArticles}</a>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1.5rem'}}>
            {latestPosts.length > 0 ? latestPosts.map((post) => (
              <a key={post.slug} href={`${blogBase}/${post.slug}`} style={{textDecoration:'none',display:'block',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'1.25rem',padding:'1.75rem',transition:'border-color 0.2s'}}>
                {post.targetKeyword && (
                  <span style={{background:'rgba(255,85,0,0.1)',color:'var(--clr-orange)',padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.65rem',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em'}}>{post.targetKeyword}</span>
                )}
                <h3 style={{color:'#fff',fontSize:'1.1rem',fontWeight:800,letterSpacing:'-0.02em',margin:'0.85rem 0 0.5rem'}}>{post.title}</h3>
                {post.metaDescription && (
                  <p style={{color:'#94a3b8',fontSize:'0.85rem',lineHeight:1.6}}>{post.metaDescription}</p>
                )}
                <div style={{color:'var(--clr-orange)',fontWeight:700,fontSize:'0.8rem',marginTop:'1.25rem'}}>Read guide →</div>
              </a>
            )) : (
              <p style={{color:'#94a3b8',fontSize:'0.9rem'}}>
                <a href={blogBase} style={{color:'var(--clr-orange)',textDecoration:'none'}}>Visit our blog →</a>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href={`/${lang}`} className="logo footer-logo" style={{display:'flex',alignItems:'center',gap:'0.5rem',fontWeight:800,color:'#fff'}}>
                <i className="fa-solid fa-cube" style={{color:'var(--clr-orange)'}}></i> Cargoo
              </a>
              <p>{s.footerDesc}</p>
              <div className="social-links">
                <a href="https://www.facebook.com/profile.php?id=61578665194191" target="_blank" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="https://www.instagram.com/cargooimport/" target="_blank" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                <a href="https://www.tiktok.com/@cargooimport" target="_blank" aria-label="TikTok"><i className="fa-brands fa-tiktok"></i></a>
              </div>
            </div>
            <div className="footer-links">
              <h4>{s.footerCompany}</h4>
              <ul>
                <li><a href="#what-is-cargoo">About Us</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href={blogBase}>Blog &amp; Insights</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>{s.footerContact}</h4>
              <ul style={{gap:'1rem',display:'flex',flexDirection:'column'}}>
                <li><a href="mailto:contact@cargooimport.eu"><i className="fa-solid fa-envelope" style={{marginRight:'8px',color:'var(--clr-orange)'}}></i>contact@cargooimport.eu</a></li>
                <li><a href="tel:+48500685000"><i className="fa-solid fa-phone" style={{marginRight:'8px',color:'var(--clr-orange)'}}></i>+48 500 685 000</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>{s.footerLegal}</h4>
              <ul>
                <li><a href={publicLegalUrl(lang, "terms")}>Terms of Service</a></li>
                <li><a href={publicLegalUrl(lang, "privacy")}>Privacy Policy</a></li>
                <li><a href={publicLegalUrl(lang, "refund")}>Refund Policy</a></li>
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

      {/* Floating WhatsApp */}
      <a href="https://wa.me/48500685000?text=Hi%20Cargoo%2C%20I%27d%20like%20a%20quote%20for..." target="_blank" rel="noopener" className="floating-whatsapp" aria-label="Contact on WhatsApp">
        <i className="fa-brands fa-whatsapp"></i>
      </a>

      {/* Load static JS */}
      <script src="/js/estimate-state.js" defer></script>
      <script src="/js/image-config.js" defer></script>
      <script src="/js/product-images.js" defer></script>
      <script src="/js/image-adapter.js" defer></script>
      <script src="/js/search-data.js" defer></script>
      <script src="/js/search-api.js" defer></script>
      <script src="/js/search-ui.js" defer></script>
      <script src="/js/main.js" defer></script>
    </>
  );
}
