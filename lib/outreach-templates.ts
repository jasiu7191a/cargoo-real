/**
 * Cold-outreach + follow-up copy with light spintax variation so two
 * consecutive sends never look identical. ESPs (Gmail, Outlook) cluster
 * messages with identical subject/body across recipients and flag the
 * cluster as spam — varied copy keeps each send unique enough to stay out
 * of bulk classifiers.
 *
 * Spintax syntax:
 *   {Hi|Hello|Hey} {name}
 *   → randomly picks one of "Hi", "Hello", "Hey".
 *
 * Nested {} blocks are NOT supported (would need a real parser); keep
 * variations one level deep.
 */

import { esc } from "./mail-esc";

export function spin(template: string): string {
  return template.replace(/\{([^{}]+)\}/g, (_match, opts: string) => {
    const choices = opts.split("|").map(s => s.trim()).filter(Boolean);
    if (choices.length === 0) return "";
    return choices[Math.floor(Math.random() * choices.length)];
  });
}

export interface DripContext {
  /** Display name or company we have for the prospect. Falls back to "there". */
  greetingName?: string | null;
  /** Original product / topic from the first touch — anchors the follow-up. */
  productName?: string | null;
  /** Their language for the email — falls back to English copy if unknown. */
  lang: string;
}

/**
 * Returns the {subject, bodyHtml} for follow-up touch #N. Each template runs
 * through spin() so wording rotates per send. Bodies are intentionally short
 * — long follow-ups perform worse than 2-3 sentence nudges.
 */
export function buildFollowUpEmail(
  touchNumber: 2 | 3,
  ctx: DripContext
): { subject: string; bodyHtml: string } {
  const safeName = esc(ctx.greetingName?.trim() || "there");
  const safeProduct = esc(ctx.productName?.trim() || "your sourcing request");

  if (ctx.lang === "pl") {
    if (touchNumber === 2) {
      return {
        subject: spin(`{Krótkie pytanie|Szybkie pytanie|Jedno krótkie pytanie} — ${safeProduct}`),
        bodyHtml: spin(
          `<p>{Cześć|Dzień dobry} ${safeName},</p>
<p>{Wracam do tematu|Odświeżam wątek|Wracam jeszcze raz} dot. <strong>${safeProduct}</strong>. {Czy nadal szukasz dostawcy z Chin?|Czy temat jest u Was nadal aktualny?|Czy chcecie żebyśmy ruszyli z wyceną?}</p>
<p>{Mogę przygotować|Przygotujemy|Wyślę} 2-3 zweryfikowane oferty fabryczne z pełnym landed cost (towar + transport + cło VAT) w ciągu 24h.</p>
<p>{Pozdrawiam|Best regards|Z poważaniem},<br/>Cargoo Import</p>`
        ),
      };
    }
    return {
      subject: spin(`{Ostatnie wiadomości|Ostatnia próba} — ${safeProduct}`),
      bodyHtml: spin(
        `<p>{Cześć|Dzień dobry} ${safeName},</p>
<p>{Nie chcę naprzykrzać się|Wiem że jesteście zajęci} — to mój ostatni follow-up odnośnie <strong>${safeProduct}</strong>.</p>
<p>{Jeśli temat jest nieaktualny|Jeśli to nie jest dobry moment}, daj proszę znać jednym słowem — usunę z listy. {Jeśli ma sens|Jeśli chcecie spróbować}, odpowiedz "tak" i przyślę propozycję jeszcze dziś.</p>
<p>Cargoo Import</p>`
      ),
    };
  }

  if (ctx.lang === "de") {
    if (touchNumber === 2) {
      return {
        subject: spin(`{Kurze Frage|Schnelle Frage} — ${safeProduct}`),
        bodyHtml: spin(
          `<p>{Hallo|Guten Tag} ${safeName},</p>
<p>{Ich melde mich nochmal|Kurzes Update} zu <strong>${safeProduct}</strong>. {Ist das Thema bei Ihnen noch aktuell?|Suchen Sie weiterhin einen Lieferanten?}</p>
<p>Wir liefern in 24h 2-3 geprüfte Werksangebote mit komplettem Landed Cost (Ware + Fracht + Zoll + USt.).</p>
<p>Beste Grüße,<br/>Cargoo Import</p>`
        ),
      };
    }
    return {
      subject: spin(`{Letzter Versuch|Letzte Nachricht} — ${safeProduct}`),
      bodyHtml: spin(
        `<p>{Hallo|Guten Tag} ${safeName},</p>
<p>{Letztes Follow-Up|Letzte Mail} zu <strong>${safeProduct}</strong>. Wenn es bei Ihnen nicht passt, einfach eine kurze Antwort — ich nehme Sie von der Liste.</p>
<p>Cargoo Import</p>`
      ),
    };
  }

  if (ctx.lang === "fr") {
    if (touchNumber === 2) {
      return {
        subject: spin(`{Petite question|Une question rapide} — ${safeProduct}`),
        bodyHtml: spin(
          `<p>{Bonjour|Salut} ${safeName},</p>
<p>{Je reviens vers vous|Petit follow-up} concernant <strong>${safeProduct}</strong>. {Le sujet est-il toujours d'actualité ?|Cherchez-vous toujours un fournisseur en Chine ?}</p>
<p>On peut vous envoyer 2-3 devis usine vérifiés avec le coût total (marchandise + fret + douane + TVA) sous 24h.</p>
<p>Cordialement,<br/>Cargoo Import</p>`
        ),
      };
    }
    return {
      subject: spin(`{Dernière relance|Dernier message} — ${safeProduct}`),
      bodyHtml: spin(
        `<p>{Bonjour|Salut} ${safeName},</p>
<p>Dernier follow-up sur <strong>${safeProduct}</strong>. Si ce n'est plus pertinent, un simple mot et je vous retire de la liste.</p>
<p>Cargoo Import</p>`
      ),
    };
  }

  // EN default
  if (touchNumber === 2) {
    return {
      subject: spin(`{Quick question|Quick follow-up|One question} — ${safeProduct}`),
      bodyHtml: spin(
        `<p>{Hi|Hello|Hey} ${safeName},</p>
<p>{Circling back|Following up|Bumping this} on <strong>${safeProduct}</strong>. {Is sourcing this still on your radar?|Are you still evaluating suppliers?|Is this still something you're looking at?}</p>
<p>{We can ship|I can send|Happy to send} 2-3 verified factory quotes with full landed cost (goods + freight + duty + VAT) inside 24 hours.</p>
<p>{Best|Cheers|Thanks},<br/>Cargoo Import</p>`
      ),
    };
  }
  return {
    subject: spin(`{Last note|Closing the loop|Last try} — ${safeProduct}`),
    bodyHtml: spin(
      `<p>{Hi|Hello} ${safeName},</p>
<p>{Final follow-up|Last message} on <strong>${safeProduct}</strong>. If it's no longer relevant, just reply "no" and I'll remove you. If timing works, "yes" and I'll send the quote today.</p>
<p>Cargoo Import</p>`
    ),
  };
}

/**
 * Win-back email for QUOTED leads that didn't pay within the window. Includes
 * a 10% discount placeholder — the caller is expected to inject a real Stripe
 * coupon URL via {couponUrl}.
 */
export function buildWinBackEmail(ctx: DripContext & { couponCode?: string; couponUrl?: string }): {
  subject: string;
  bodyHtml: string;
} {
  const safeName = esc(ctx.greetingName?.trim() || "there");
  const safeProduct = esc(ctx.productName?.trim() || "your order");
  const code = esc(ctx.couponCode || "WELCOME10");
  const url = esc(ctx.couponUrl || "https://cargooimport.eu");

  if (ctx.lang === "pl") {
    return {
      subject: spin(`{Twoja wycena ${safeProduct}|Powracam z rabatem 10%}`),
      bodyHtml: spin(
        `<p>{Cześć|Dzień dobry} ${safeName},</p>
<p>Twoja wycena ${safeProduct} {jest nadal aktualna|wciąż czeka}. {Żeby ułatwić decyzję|Żeby zachęcić} dorzucamy <strong>10% rabatu</strong> jeśli zatwierdzisz w tym tygodniu.</p>
<p>Kod: <strong>${code}</strong> — <a href="${url}">aktywuj wycenę</a></p>
<p>Cargoo Import</p>`
      ),
    };
  }

  return {
    subject: spin(`{Your quote for ${safeProduct} is still live|10% off if you confirm this week}`),
    bodyHtml: spin(
      `<p>{Hi|Hello} ${safeName},</p>
<p>Your quote for <strong>${safeProduct}</strong> {is still active|hasn't expired yet}. To make the decision easier we're adding a <strong>10% discount</strong> if you confirm this week.</p>
<p>Code: <strong>${code}</strong> — <a href="${url}">activate quote</a></p>
<p>Cargoo Import</p>`
    ),
  };
}
