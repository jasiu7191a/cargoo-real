/**
 * Inserts 3 French blog posts directly into the database.
 * Usage:
 *   DATABASE_URL="postgres://..." node prisma/seed-fr-blogs.js
 */

const { Client } = require("pg");
const { randomBytes } = require("crypto");

function cuid() {
  return "c" + randomBytes(11).toString("base64url").slice(0, 24);
}

const now = new Date().toISOString();

const posts = [
  {
    id: cuid(),
    title: "Comment importer depuis la Chine vers l'Europe en 2026 : guide complet",
    slug: "importer-depuis-chine-europe-2026-fr",
    targetKeyword: "importer de Chine",
    metaDescription:
      "Tout ce qu'un importateur européen doit savoir en 2026 : trouver un fournisseur fiable, négocier, gérer la douane et recevoir sa commande sans mauvaise surprise.",
    lang: "fr",
    content: `## Pourquoi importer depuis la Chine en 2026 ?

La Chine reste le premier atelier du monde. En 2026, les plateformes comme **1688**, **Taobao** et **Alibaba** donnent accès à des millions de références à des prix d'usine — très souvent 3 à 5 fois moins chers qu'en Europe.

Que vous soyez revendeur, e-commerçant ou particulier curieux, importer est aujourd'hui accessible à tous, à condition de connaître les règles.

---

## Étape 1 — Trouver et vérifier un fournisseur

Commencez sur **Alibaba** pour les fournisseurs anglophones ou **1688** pour les prix directement en yuan (sans la marge d'intermédiaire Alibaba).

**Ce qu'il faut vérifier :**
- Badge *Trade Assurance* sur Alibaba (paiement sécurisé)
- Ancienneté du compte (préférez +3 ans)
- Note et volume de transactions
- Certification de l'usine (ISO, CE, etc.) si pertinente

> **Astuce Cargoo :** Notre équipe sur place à Shenzhen visite les usines et vous envoie des photos avant que vous ne versiez le moindre euro.

---

## Étape 2 — Négocier le bon prix

La plupart des usines acceptent la négociation, surtout si vous commandez un volume raisonnable. Voici comment procéder :

1. Demandez 3 devis concurrents pour la même référence
2. Mentionnez votre volume prévisionnel (même si c'est une première commande)
3. Négociez les frais d'emballage et d'étiquetage

Pour des petites quantités, passez par un **agent sourcing** comme Cargoo : nous regroupons les commandes de plusieurs clients pour obtenir de meilleures conditions.

---

## Étape 3 — Choisir son mode de transport

| Mode | Délai | Coût indicatif | Idéal pour |
|------|-------|----------------|------------|
| Mer (LCL) | 25–35 jours | Bas | Gros volumes, produits lourds |
| Mer (FCL) | 25–35 jours | Très bas | Conteneur complet |
| Air express | 5–10 jours | Élevé | Petits colis urgents |
| Train (terrestre) | 18–22 jours | Moyen | Europe centrale |

Pour la plupart des commandes particuliers et petits commerçants, **l'aérien** reste le choix le plus pratique : délai maîtrisé et suivi en temps réel.

---

## Étape 4 — La douane européenne expliquée simplement

Depuis 2021, **toutes les importations** dans l'UE sont soumises à la TVA, même les colis inférieurs à 22 €. Voici les seuils à retenir :

- **< 150 €** (valeur déclarée) : TVA uniquement, pas de droits de douane
- **> 150 €** : TVA + droits de douane (selon catégorie produit, en général 0–17 %)

**Documents nécessaires :**
- Facture commerciale (commercial invoice)
- Liste de colisage (packing list)
- Certificat d'origine si demandé

Chez Cargoo, nous gérons tout cela pour vous : la facture est préparée correctement, les droits sont inclus dans votre prix, et le colis arrive dédouané.

---

## Étape 5 — Inspection qualité avant envoi

C'est l'étape que la plupart des importateurs débutants sautent — et qu'ils regrettent.

**Avant l'expédition, exigez :**
- Photos de chaque article
- Vidéo de déballage d'un échantillon
- Contrôle des dimensions et du marquage CE si applicable

Notre service d'inspection inclus vérifie chaque unité avant que la marchandise ne quitte la Chine.

---

## Conclusion

Importer depuis la Chine en 2026 n'a jamais été aussi accessible. Avec les bons outils et un partenaire de confiance sur place, vous pouvez recevoir vos produits en 2 à 4 semaines, au prix d'usine, sans les mauvaises surprises à la livraison.

**Envoyez-nous votre lien produit sur WhatsApp — nous vous enverrons un devis complet sous 24 h.**
`,
  },
  {
    id: cuid(),
    title: "Fret maritime vs fret aérien depuis la Chine : comparatif complet 2026",
    slug: "fret-maritime-vs-aerien-chine-comparatif-fr",
    targetKeyword: "fret maritime Chine",
    metaDescription:
      "Mer ou avion ? Découvrez comment choisir le bon mode d'expédition depuis la Chine selon votre budget, le poids de votre commande et vos délais.",
    lang: "fr",
    content: `## La question que tout importateur se pose

Vous avez trouvé votre produit, négocié le prix et confirmé la commande. Reste le choix crucial : **mer ou avion ?**

Ce choix a un impact direct sur votre coût final (le fameux *landed cost*) et sur votre délai de livraison. Voici une analyse complète pour 2026.

---

## Le fret aérien : rapide, pratique, plus coûteux

### Comment ça fonctionne

Votre marchandise part de Shenzhen, Guangzhou ou Shanghai et arrive à Paris CDG, Roissy ou Francfort en 5 à 10 jours ouvrés. Idéal pour les petits volumes ou les produits à forte valeur.

### Tarifs indicatifs (2026)

| Poids | Coût indicatif par kg |
|-------|----------------------|
| < 5 kg | 8–14 €/kg |
| 5–30 kg | 6–10 €/kg |
| 30–100 kg | 4–7 €/kg |

> Note : les transporteurs comme DHL, FedEx et UPS appliquent un **poids volumétrique** (L×l×h / 5000). Un colis léger mais encombrant peut être facturé bien plus cher.

### Avantages du fret aérien
- ✅ Délai prévisible (5–10 jours)
- ✅ Suivi en temps réel
- ✅ Moins de risques de dommages
- ✅ Adapté aux produits de valeur (électronique, montres)

### Inconvénients
- ❌ Prix élevé pour les gros volumes
- ❌ Restrictions sur certains produits (batteries, liquides)
- ❌ Coût s'envole au-dessus de 50 kg

---

## Le fret maritime : économique pour les gros volumes

### LCL vs FCL

- **LCL (Less than Container Load)** : vous partagez un conteneur avec d'autres importateurs. Idéal dès 0,5 m³.
- **FCL (Full Container Load)** : vous louez un conteneur entier (20' ou 40'). Rentable à partir de 10–15 m³.

### Tarifs indicatifs (2026)

| Mode | Coût indicatif |
|------|---------------|
| LCL | 80–150 €/m³ |
| FCL 20' | 1 200–2 500 € |
| FCL 40' | 1 800–3 500 € |

**Délai typique porte-à-porte :** 30 à 45 jours (Chine → port européen + dédouanement + livraison finale).

### Avantages du fret maritime
- ✅ Coût très bas pour les gros volumes
- ✅ Pas de restriction sur les produits
- ✅ Adapté aux meubles, textiles, gros électroménager

### Inconvénients
- ❌ Délai long et plus aléatoire (retards portuaires)
- ❌ Risque d'humidité / dommages si emballage insuffisant
- ❌ Documentation plus complexe (B/L, certificats)

---

## Tableau de décision rapide

| Critère | Choisissez l'aérien si… | Choisissez le maritime si… |
|---------|------------------------|---------------------------|
| Poids | < 100 kg | > 200 kg |
| Valeur | Élevée (électronique) | Moyenne à faible (textile) |
| Délai | Urgent (< 2 semaines) | Flexible (> 4 semaines) |
| Produit | Fragile, de marque | Volumineux, résistant |

---

## Le cas du train : l'option méconnue

Depuis 2020, le **fret ferroviaire Chine-Europe** a explosé. Partant de Xi'an ou Chengdu vers Duisbourg ou Łódź, ce mode offre un bon compromis :

- Délai : 18–22 jours
- Coût : entre l'aérien et le maritime
- Idéal pour : Europe centrale (Pologne, Allemagne, République tchèque)

---

## Notre recommandation pour les importateurs débutants

Pour votre **première commande** ou pour des quantités inférieures à 50 kg, partez sur **l'aérien express**. Le surcoût est marginal comparé au risque de rater une vente ou de bloquer votre trésorerie 6 semaines.

Une fois votre produit validé et vos volumes en hausse, passez au maritime LCL : vous pouvez diviser votre coût logistique par 3 à 5.

**Chez Cargoo, nous gérons les deux modes** et vous conseillons en fonction de votre commande spécifique. Envoyez-nous votre produit sur WhatsApp pour un devis incluant le transport.
`,
  },
  {
    id: cuid(),
    title: "Comment acheter sur Alibaba sans se faire arnaquer : guide 2026",
    slug: "acheter-alibaba-sans-arnaque-guide-fr",
    targetKeyword: "acheter sur Alibaba",
    metaDescription:
      "Alibaba regorge de fournisseurs sérieux — et d'escrocs. Voici comment distinguer les deux, sécuriser votre paiement et recevoir exactement ce que vous avez commandé.",
    lang: "fr",
    content: `## Alibaba est-il fiable en 2026 ?

Avec plus de 150 000 fournisseurs actifs, Alibaba est incontestablement la plus grande marketplace B2B du monde. La plupart des vendeurs sont légitimes — mais pas tous.

Les arnaques sur Alibaba ne ressemblent pas à celles d'un marché de rue : elles sont souvent sophistiquées, avec de faux certificats, de fausses photos et des avis gonflés. Ce guide vous donne les outils pour les repérer avant qu'elles ne vous coûtent de l'argent.

---

## Les 5 arnaques les plus courantes

### 1. La substitution de produit
Vous recevez un échantillon impeccable, puis la commande en série utilise des matériaux inférieurs. C'est l'arnaque la plus répandue.

**Comment l'éviter :** Exigez une inspection avant expédition. Payez en plusieurs fois (30 % à la commande, 70 % après inspection photos).

### 2. Le faux Trade Assurance
Certains vendeurs créent des sites qui imitent l'interface Alibaba pour collecter un virement hors plateforme.

**Comment l'éviter :** Ne payez **jamais** en dehors de la plateforme Alibaba ou via Western Union / crypto. Utilisez toujours Trade Assurance.

### 3. Les faux certificats CE / ISO
Des fournisseurs peu scrupuleux fournissent de faux certificats téléchargés sur internet.

**Comment l'éviter :** Vérifiez le numéro de certificat directement sur le site de l'organisme certificateur (TÜV, SGS, Bureau Veritas).

### 4. La photo volée
Le vendeur utilise des photos de produits fabriqués par quelqu'un d'autre.

**Comment l'éviter :** Demandez une photo du produit avec un papier mentionnant votre nom et la date d'aujourd'hui (*live photo proof*).

### 5. Le minimum de commande gonflé artificiellement
Le MOQ (Minimum Order Quantity) affiché est 500 unités, mais après négociation, le fournisseur descend à 10. Signe qu'il est prêt à vendre n'importe quoi à n'importe qui.

---

## Comment vérifier un fournisseur Alibaba en 5 minutes

**Étape 1 — Regardez l'ancienneté**
Préférez les fournisseurs actifs depuis au moins 3 ans. Moins de 1 an = risque élevé.

**Étape 2 — Vérifiez le badge "Verified Supplier"**
Ce badge implique un audit physique de l'usine par un tiers. C'est un bon signal de sérieux.

**Étape 3 — Lisez les avis négatifs en priorité**
Trier les avis par note la plus basse vous révèle les vrais problèmes : retards, qualité différente, SAV inexistant.

**Étape 4 — Posez des questions techniques**
Demandez des détails sur la composition des matériaux, les processus de fabrication, les certifications. Un fournisseur sérieux répond précisément.

**Étape 5 — Recherchez l'entreprise sur Google + WeChat**
Cherchez le nom de l'entreprise + "scam" ou "review". Consultez aussi les forums d'importateurs francophones.

---

## Sécuriser son paiement : les règles d'or

| Méthode | Recommandation |
|---------|---------------|
| Trade Assurance (Alibaba) | ✅ Idéal — remboursement possible si le produit ne correspond pas |
| Virement SWIFT / TT | ⚠️ Acceptable avec un fournisseur confirmé après plusieurs commandes |
| PayPal (biens) | ✅ Protection acheteur, mais peu accepté par les usines |
| Western Union / Crypto | ❌ Jamais — aucun recours possible |

**La règle du 30/70 :** Payez 30 % à la commande et 70 % après réception de l'inspection qualité (photos + vidéo). La plupart des fournisseurs sérieux acceptent ce schéma.

---

## Quand faire appel à un agent sourcing ?

Si vous :
- Commandez pour la première fois
- N'êtes pas à l'aise en anglais (et encore moins en mandarin)
- Commandez un produit complexe ou réglementé
- Voulez une inspection qualité sans vous déplacer

…un **agent sourcing comme Cargoo** est la solution la plus sécurisée. Notre équipe est sur place à Shenzhen, parle mandarin couramment et connaît les fournisseurs locaux. Vous payez une fois, nous gérons tout.

---

## Récapitulatif : check-list avant de commander

- [ ] Fournisseur actif depuis +3 ans
- [ ] Badge Verified Supplier ou Gold Supplier vérifié
- [ ] Au moins 20 avis avec des détails
- [ ] Certificats vérifiés auprès de l'organisme émetteur
- [ ] Paiement via Trade Assurance uniquement
- [ ] Échantillon commandé et approuvé avant la série
- [ ] Inspection qualité confirmée avant expédition
- [ ] Contrat ou bon de commande signé avec spécifications produit

**Vous avez trouvé un produit et vous voulez savoir si le fournisseur est fiable ? Envoyez-nous le lien sur WhatsApp — nous vous donnons notre avis gratuitement.**
`,
  },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set. Run with: DATABASE_URL=postgres://... node prisma/seed-fr-blogs.js");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();
  console.log("✅ Connected to database");

  for (const post of posts) {
    try {
      await client.query(
        `INSERT INTO "BlogPost" (id, title, slug, content, "targetKeyword", "metaDescription", lang, status, "publishedAt", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'PUBLISHED', $8, $8, $8)
         ON CONFLICT (slug) DO NOTHING`,
        [post.id, post.title, post.slug, post.content, post.targetKeyword, post.metaDescription, post.lang, now]
      );
      console.log(`✅ Inserted: ${post.slug}`);
    } catch (err) {
      console.error(`❌ Failed to insert ${post.slug}:`, err.message);
    }
  }

  await client.end();
  console.log("\n🎉 Done! 3 French blog posts are now PUBLISHED.");
}

main();
