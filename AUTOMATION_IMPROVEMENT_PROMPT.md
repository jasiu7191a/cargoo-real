# Cargoo automation improvement — handoff prompt

Wklej całość tej treści w nowej sesji Claude Code w katalogu
`C:\Users\jasiu\.antigravity\cargoo-real-fixed`. Prompt jest
samowystarczalny — zakłada zerowy kontekst poza tym co tutaj.

---

## Kontekst

Cargoo to platforma sourcing/import z Chin do EU. Site składa się z:

- **`cargoo/`** — statyczna strona www na Cloudflare Pages (deploy via
  `wrangler pages deploy .`, **brak gita**)
- **`cargoo-real-fixed/`** — Next.js admin na Cloudflare Pages
  (`admin.cargooimport.eu`, git-tracked, deploy on push to main)

Stack: Next.js 14, Prisma + Neon Postgres, Stripe, Resend, Cloudflare R2,
Gemini API. Cloudflare Workers edge runtime z `nodejs_compat`.

Aktualnie istnieją dwa systemy automation które działają, ale mają
luki w jakości i konwersji:

1. **SEO Engine** (`/admin/content`) — Gemini-powered blog generator
2. **Cold Outreach** (`/admin/outreach`) — B2B email outreach z follow-ups

Po audycie kodu zidentyfikowano 5 priorytetowych ulepszeń (P0-P2).
Niżej masz dokładny plan implementacji.

## Stan obecny (file map)

### Blog Generator
- `app/api/admin/content/generate/route.ts` — endpoint do ręcznego
  generowania artykułu (Gemini call, DRAFT po wygenerowaniu)
- `app/api/admin/content/publish/route.ts` — publikacja artykułu
- `app/api/admin/content/route.ts` — list/delete artykułów
- `app/api/agent/trigger/route.ts` — autonomic endpoint zabezpieczony
  `AGENT_SECRET`, generuje 1 artykuł na keyword z bazy
- `app/api/agent/leads-pipeline/route.ts` — wyciąga keywordy z ostatnich
  30 dni leadów, generuje brakujące artykuły
- `app/api/agent/seo-check/route.ts` — sprawdza indeksację via Google
  Custom Search API (LIMIT 100/dzień — niewystarczające)
- `app/admin/view-components/content-generator.tsx` — UI w panelu
- `app/admin/view-components/seo-artifact-list.tsx` — lista artykułów
- `prisma/schema.prisma` — modele `BlogPost`, `SeoCheck`

### Cold Outreach
- `app/api/admin/outreach/route.ts` — list leadów + manual send
- `app/api/admin/outreach/cold/route.ts` — wysyłka cold email z daily
  cap (default 10) + 12h cooldown na adres
- `app/api/admin/outreach/send/route.ts` — manual send do konkretnego
  leada
- `app/api/admin/leads/route.ts` — leadgen z form na www
- `app/api/admin/email-health/route.ts` — agregat bounce/spam rates
- `app/api/admin/history/route.ts` — historia działań admina
- `lib/services/outreach.ts` — serwisy
- `lib/services/leads.ts` — serwisy
- `lib/mail.ts` — Resend wrapper, `sendColdEmail`, `stripBodyPlaceholder`
- `app/admin/(dashboard)/outreach/page.tsx` — UI
- `app/api/webhooks/resend/route.ts` — odbiera DELIVERED/BOUNCED/SPAM
  webhook events
- `prisma/schema.prisma` — modele `Lead`, `ColdOutreach`, `EmailEvent`

## Problemy zidentyfikowane (z audytu kodu)

### Blog Generator
- **Każdy artykuł ma identyczną strukturę** (Why Import / Sourcing & QC
  / Logistics / Customs / How Cargoo Helps). Po 20-30 artykułach Google
  detection flaguje jako templated content.
- **Brak FAQ + Schema.org FAQPage** w żadnym artykule. Tracimy potencjał
  rich snippets w SERP (= +30% CTR gdy działa).
- **Brak internal linkingu** — nowe artykuły nie linkują do innych blog
  postów ani do `/products` / kategorii. Crawl depth zbyt duża, topical
  authority zerowa.
- **`SOURCING_GUIDE_PROMPT` zduplikowany** w `app/api/agent/trigger/`
  i `app/api/admin/content/generate/` — ryzyko drift.
- **Brak deduplikacji** — `leads-pipeline` może generować 5 artykułów na
  ten sam temat jeśli keyword powtarza się w leadach.
- **Single-shot generation** — jeden Gemini call. Lepszy quality
  pattern: outline → expand sections → polish.
- **Brak external citations** — Gemini halucynuje URL-e. Powinno być
  enforced "cite at least 3 real .gov / .eu sources".
- **Brak Schema.org Article + DatePublished** w renderowanym HTML
  artykułów (sprawdź `app/[lang]/blog/[slug]/` — może już jest).

### Cold Outreach
- **Brak reply detection** — `EmailEvent` ma DELIVERED/BOUNCED/SPAM/
  OPENED/CLICKED ale brak REPLIED. Jak ktoś odpowie, system nadal
  wysyła follow-up #2 → spam doświadczenie.
- **Brak drip automation** — touch 1/2/3 jest tracked ale wymaga
  ręcznego triggera. Powinien być cron który auto-triggera follow-upy
  na podstawie cooldownu i statusu odpowiedzi.
- **Brak spintax / variation** — wszystkie maile mogą mieć ten sam
  subject/body → ESP (Gmail/Outlook) flag jako spam patterns.
- **Daily cap 10 = za nisko po warm-up** — brak strategii ramp-up
  (10 → 20 → 40 → 80 w 4 tygodnie).
- **Brak win-back** — leady w status `QUOTED` ale bez `PAID` po 7+
  dniach powinny dostać reminder z incentive (np. -10%).
- **Brak `List-Unsubscribe` header w mailach** — GDPR / CAN-SPAM
  compliance risk. Sprawdź `lib/mail.ts` czy jest dodany.

### SEO Engine
- **Google Custom Search API** ma 100 free queries/day — przy 60+
  artykułach × 4 locales = 240+ URL-i. Pełen sweep zajmuje >2 dni.
- **`SeoCheck` zwraca tylko `indexed: yes/no`** — nie pozycja, nie CTR,
  nie impressions. Nie wiesz czy artykuł rankuje na pos 1 czy 50.
- **Brak GSC API integration** — Google Search Console daje DARMOWO
  impressions/clicks/position/CTR per query. 10x cenniejsze.

### Architektura / Observability
- **Brak scheduled cron** — wszystko on-demand. Powinien być
  Cloudflare cron trigger który raz dziennie:
  - Wywołuje seo-check
  - Wywołuje leads-pipeline
  - Wysyła follow-upy które przekroczyły cooldown
- **Brak conversion attribution** — który blog post wygenerował
  którego leada? Bez UTM tracking + first-touch attribution → nie wiesz
  co naprawdę działa.

## Plan implementacji

Wykonaj w tej kolejności. Każda faza ma jasne deliverables. Commituj
PO KAŻDEJ fazie — łatwiej revert pojedynczy commit niż całość.

### Faza 1 — DRY prompt + dedup (15 min)
**Cel:** wyeliminować drift między dwoma kopiami `SOURCING_GUIDE_PROMPT`
i zapobiec generowaniu duplikatów.

1. Stwórz `lib/seo-prompts.ts` z eksportowaną funkcją
   `buildBlogPrompt(keyword: string, lang: 'en'|'pl'|'de'|'fr',
   options?: { existingPostTitles?: string[]; relatedSlugs?: string[];
   includeFaq?: boolean; varietyHint?: 'guide'|'comparison'|'listicle'|'how-to' })`.
2. Zaimportuj w obu routes (`app/api/agent/trigger/route.ts` i
   `app/api/admin/content/generate/route.ts`). Usuń duplikaty.
3. W `app/api/agent/leads-pipeline/route.ts` przed generowaniem dodaj
   **dedup check**:
   ```ts
   const exists = await prisma.blogPost.findFirst({
     where: {
       OR: [
         { targetKeyword: keyword, lang },
         { title: { contains: keyword, mode: 'insensitive' } },
       ],
     },
   });
   if (exists) { skipped.push(keyword); continue; }
   ```

**Test:** wywołaj `POST /api/agent/leads-pipeline` dwukrotnie. Drugi
run powinien skipować już-istniejące keywordy.

### Faza 2 — FAQ + Schema.org FAQPage (30-60 min)
**Cel:** dodać sekcję FAQ do każdego nowego artykułu + JSON-LD który
Google renderuje jako rich snippet.

1. W `buildBlogPrompt` (faza 1) dodaj instrukcję:
   ```
   At the end of the article, generate 5-7 frequently asked questions
   with answers (2-4 sentences each). Return them in a separate `faq`
   field of the JSON output:
   {
     "title": "...",
     "slug": "...",
     "metaDescription": "...",
     "content": "...",
     "faq": [
       { "question": "...", "answer": "..." },
       ...
     ]
   }
   ```
2. Zaktualizuj parsing w obu routes — czytaj `faq` array.
3. Zaktualizuj Prisma schema:
   ```prisma
   model BlogPost {
     ...
     faq           Json?  // [{ question, answer }, ...]
   }
   ```
   Migration: `npx prisma migrate dev --name add_blogpost_faq` lub
   napisz SQL bezpośrednio do `neon-migrations/` dla user-driven run.
4. W rendererze artykułu (sprawdź `app/[lang]/blog/[slug]/page.tsx`
   lub podobny) dodaj:
   - HTML section z FAQ pod content (accordion)
   - JSON-LD `<script type="application/ld+json">` z `@type: FAQPage`
5. Re-generuj 3-5 testowych artykułów w admin panelu, sprawdź czy:
   - FAQ widać na stronie
   - JSON-LD valid (sprawdź w Google Rich Results Test)

**Test:** Google Rich Results Test
(`https://search.google.com/test/rich-results`) → wpisz URL artykułu →
powinno wykazać FAQPage eligible.

### Faza 3 — Internal linking automation (30 min)
**Cel:** każdy nowy artykuł linkuje do 3-5 powiązanych już-published
postów. Buduje topical authority + zmniejsza crawl depth.

1. W routes generujących blog (trigger + content/generate) PRZED
   wywołaniem Gemini:
   ```ts
   const candidates = await prisma.blogPost.findMany({
     where: { status: 'PUBLISHED', lang },
     select: { slug: true, title: true, targetKeyword: true },
     orderBy: { publishedAt: 'desc' },
     take: 20,
   });
   ```
2. Wstrzyknij listę do promptu:
   ```
   Where contextually relevant, link to 3-5 of these existing articles
   using Markdown links [Title](/<lang>/blog/<slug>). Do NOT fabricate
   slugs. Choose only from this list:
   ${candidates.map(c => `- ${c.title} → /${lang}/blog/${c.slug}`).join('\n')}
   ```
3. Po generacji parse content, zlicz `[text](/...blog/<slug>)` matches.
   Jeśli <3, regen z mocniejszą instrukcją (raz).

**Test:** wygeneruj nowy artykuł na popularny keyword który MA już
related posty w bazie. Otwórz w preview — powinno być 3-5 internal
links do `/blog/...`.

### Faza 4 — Drip automation + reply detection (1-2h)
**Cel:** zautomatyzować follow-upy + wykrywać odpowiedzi żeby nie
spamować.

1. **Reply detection** — Resend nie ma natywnego replied webhooka, ale
   możesz użyć dedykowanego inbox `replies@cargooimport.eu` jako
   reply-to (zamiast `contact@`):
   - W `lib/mail.ts` `sendColdEmail`: set `reply_to: 'replies@cargooimport.eu'`
   - Skonfiguruj forwarding z `replies@` na webhook endpoint
     `/api/webhooks/inbound-reply` (Cloudflare Email Routing + Worker)
   - W webhook parse `From:` header, lookup `ColdOutreach` po email,
     ustaw flagę `replied: true` (dodaj kolumnę do Prisma).
   - Drip cron NIE wyśle follow-upu jeśli `replied = true`.

2. **Drip cron** — Cloudflare cron trigger raz dziennie o 09:00 UTC:
   - Dodaj `wrangler.json` `triggers.crons`:
     ```json
     "triggers": { "crons": ["0 9 * * *"] }
     ```
   - Stwórz endpoint `app/api/agent/drip/route.ts` zabezpieczony
     `AGENT_SECRET`.
   - Logika: znajdź `ColdOutreach` gdzie:
     - `replied = false`
     - `touchNumber < 3`
     - `sentAt < NOW() - INTERVAL '3 days'` (cooldown między touches)
     - lead status != PAID/UNSUBSCRIBED
   - Wygeneruj follow-up body (zwięzły, "wracam do tematu...") i wyślij
     przez `sendColdEmail` z `touchNumber = previous + 1`.

3. **Win-back kampania** w tym samym cronie:
   - Znajdź `Lead` gdzie `status = 'QUOTED'` + `updatedAt < NOW() -
     INTERVAL '7 days'`.
   - Wyślij email z 10% rabatem (Stripe Coupons API + utm tracking link).

**Test:** uruchom `wrangler dev`, wywołaj `POST /api/agent/drip` z
`AGENT_SECRET`. Sprawdź w bazie czy `touchNumber` urósł dla starych
sendów.

### Faza 5 — Spintax + variation (30-60 min)
**Cel:** uniknąć spam filterów przez randomizację treści.

1. W `lib/mail.ts` dodaj funkcję:
   ```ts
   function spin(template: string): string {
     return template.replace(/\{([^{}]+)\}/g, (_, opts) => {
       const choices = opts.split('|');
       return choices[Math.floor(Math.random() * choices.length)];
     });
   }
   ```
2. Template:
   ```
   {Hi|Hello|Hey} {name},

   {I noticed|I saw|I came across} you {import|source|buy} from {China|Asia}.
   ...
   ```
3. Wywołaj `spin(body)` przed `sendColdEmail`.

### Faza 6 — `List-Unsubscribe` header (15 min)
**Cel:** GDPR / CAN-SPAM compliance, Gmail nie wrzuca do spamu.

1. Stwórz endpoint `/api/unsubscribe?token=...` (już może istnieć —
   sprawdź `app/api/unsubscribe/`).
2. W `lib/mail.ts` `sendColdEmail`:
   ```ts
   headers: {
     'List-Unsubscribe': `<${PUBLIC_SITE_URL}/api/unsubscribe?email=${encodeURIComponent(to)}&token=${HMAC_TOKEN}>, <mailto:unsubscribe@cargooimport.eu>`,
     'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
   }
   ```
3. Endpoint dodaje email do tabeli `Unsubscribed` (nowa).
4. `sendColdEmail` przed wysyłką sprawdza `Unsubscribed.findFirst({ email })`.

### Faza 7 — GSC API integration (1-2h, OPTIONAL)
**Cel:** zamienić Google Custom Search (100/day limit) na Google
Search Console API (darmowe, full data).

1. User musi w Google Cloud Console włączyć Search Console API.
2. Wygenerować service account JSON, wgrać jako env var
   `GSC_SERVICE_ACCOUNT_JSON`.
3. Dodać service account email jako "owner" w GSC dla property
   `cargooimport.eu`.
4. Stwórz `lib/gsc.ts` z klientem (GSC API endpoint:
   `https://searchconsole.googleapis.com/webmasters/v3/sites/.../searchAnalytics/query`).
5. Zamień implementację w `app/api/agent/seo-check/route.ts`:
   - Query GSC API dla każdego artykułu
   - Zapisz `impressions`, `clicks`, `ctr`, `position` per query w
     nowym `SeoMetric` modelu Prisma
6. Dashboard `/admin/content` pokazuje 5 best i 5 worst performing
   posts.

## Anti-goals (czego NIE robić w tej rundzie)

- **NIE refaktoruj `js/product-images.js`** — już zoptymalizowane przez
  JSON.parse minify. Out of scope.
- **NIE dodawaj DALL·E / image gen do blog postów** — drogie + risky,
  zostawić na osobną sesję.
- **NIE zmieniaj mobile UX, header, layout strony www** — wszystko
  poza `cargoo-real-fixed` poza scope.
- **NIE odpalaj Neon migrations bez instrukcji user-owi** — pisz SQL
  do `neon-migrations/2026XXXX_XXX.sql` i powiedz user'owi żeby wkleił
  do Neon SQL Editor.
- **NIE zmieniaj Stripe / R2 / customer accounts logic** — out of scope.

## Acceptance criteria

Po wszystkich fazach (minimum 1-4):

1. ✅ `SOURCING_GUIDE_PROMPT` istnieje tylko w `lib/seo-prompts.ts`,
   nie duplikuje się.
2. ✅ Dedup w `leads-pipeline` blokuje generowanie 2nd artykułu na ten
   sam keyword.
3. ✅ Nowy blog post ma FAQ section (5-7 pytań) + JSON-LD FAQPage
   widoczne w Rich Results Test.
4. ✅ Nowy blog post ma 3-5 internal links do innych published postów.
5. ✅ Cron job uruchamiany codziennie (Cloudflare cron trigger) wysyła
   follow-up touches.
6. ✅ Jeśli prospect odpowie na cold mail, `ColdOutreach.replied = true`
   i system NIE wysyła follow-upów.
7. ✅ Cold maile mają `List-Unsubscribe` header.
8. ✅ Spintax variations w subject/body żeby każdy send miał inną
   treść.

## Co dać userowi po skończeniu

Krótki raport (≤300 słów):

- ile commits zostało utworzonych
- co dokładnie zmieniono (zwięzła lista pliku → cel)
- jakie env vars trzeba dodać do Cloudflare Pages (np. nowy
  AGENT_SECRET dla cron, GSC_SERVICE_ACCOUNT_JSON jeśli faza 7)
- jakie Neon migracje user musi uruchomić (lista plików w
  `neon-migrations/`)
- jakie zewnętrzne actions wymagane (np. set up Cloudflare Email
  Routing dla replies@, włączenie GSC API w Google Cloud Console)
- co testować po deployu (lista smoke testów)

## Pliki które najprawdopodobniej zmodyfikujesz

```
lib/seo-prompts.ts                                  (NEW)
lib/mail.ts                                         (MODIFY)
lib/gsc.ts                                          (NEW, faza 7)
app/api/admin/content/generate/route.ts             (MODIFY)
app/api/admin/outreach/cold/route.ts                (MODIFY)
app/api/agent/trigger/route.ts                      (MODIFY)
app/api/agent/leads-pipeline/route.ts               (MODIFY — dedup)
app/api/agent/seo-check/route.ts                    (MODIFY — GSC)
app/api/agent/drip/route.ts                         (NEW)
app/api/webhooks/inbound-reply/route.ts             (NEW)
app/api/unsubscribe/route.ts                        (MODIFY/CREATE)
app/[lang]/blog/[slug]/page.tsx                     (MODIFY — render FAQ + JSON-LD)
prisma/schema.prisma                                (MODIFY — BlogPost.faq, ColdOutreach.replied, Unsubscribed, SeoMetric)
neon-migrations/20260512_blog_faq_and_outreach.sql  (NEW)
wrangler.json                                       (MODIFY — crons trigger)
```

## Pierwsze kroki gdy zaczynasz sesję

1. `git status` — upewnij się że masz clean working tree
2. `git pull` — fresh main
3. Przeczytaj `prisma/schema.prisma` — current state modeli
4. Przeczytaj `app/api/agent/trigger/route.ts` i
   `app/api/admin/content/generate/route.ts` — duplikowany prompt
5. Zacznij od **Fazy 1** (DRY + dedup) — najmniej ryzykowne, daje
   solidną bazę do reszty
6. Commit po każdej fazie. Łatwiej cofnąć pojedynczy commit niż 4 fazy
   w jednym.
7. Każdy commit message zaczyna od `feat(automation):` lub
   `refactor(automation):` lub `fix(automation):`.

---

**Powodzenia. Jak coś niejasne — read code, don't guess.**
