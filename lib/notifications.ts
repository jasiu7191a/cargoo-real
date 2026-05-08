import { query, queryOne } from "@/lib/account-db";

export type NotificationType =
  | "quote_ready"
  | "quote_accepted"
  | "quote_rejected"
  | "message_received"
  | "order_paid"
  | "order_shipped"
  | "order_delivered"
  | "generic";

export type NotificationLang = "en" | "pl" | "de" | "fr";

export type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  meta: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

// -----------------------------------------------------------------------------
// Locale-aware copy for each notification type.
//   - title is a static string per locale
//   - body is built from the meta payload (typed per type below)
// Add a new entry here whenever a new NotificationType is introduced.
// -----------------------------------------------------------------------------

type Template<M> = {
  title: Record<NotificationLang, string>;
  body: (m: M, lang: NotificationLang) => string | null;
};

type QuoteMeta = { amount?: number | string; currency?: string };
type MessageMeta = { excerpt?: string };
type ShipmentMeta = { trackingNumber?: string; carrier?: string };
type GenericMeta = { title?: string; body?: string };

function fmtMoney(amount: number | string | undefined, currency: string | undefined, lang: NotificationLang) {
  if (amount == null || !currency) return "";
  const num = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(num)) return `${amount} ${currency}`;
  try {
    const localeMap: Record<NotificationLang, string> = {
      en: "en-GB",
      pl: "pl-PL",
      de: "de-DE",
      fr: "fr-FR",
    };
    return new Intl.NumberFormat(localeMap[lang], { style: "currency", currency }).format(num);
  } catch {
    return `${num.toFixed(2)} ${currency}`;
  }
}

const TEMPLATES: { [K in NotificationType]: Template<any> } = {
  quote_ready: {
    title: {
      en: "Your quote is ready",
      pl: "Twoja wycena jest gotowa",
      de: "Ihr Angebot ist bereit",
      fr: "Votre devis est prêt",
    },
    body: (m: QuoteMeta, lang) => {
      const total = fmtMoney(m.amount, m.currency, lang);
      if (!total) return null;
      return {
        en: `Total: ${total}. Open My Account to accept or reject.`,
        pl: `Suma: ${total}. Otwórz Moje konto, aby zaakceptować lub odrzucić.`,
        de: `Gesamt: ${total}. Öffnen Sie Mein Konto, um anzunehmen oder abzulehnen.`,
        fr: `Total : ${total}. Ouvrez Mon compte pour accepter ou refuser.`,
      }[lang];
    },
  },
  quote_accepted: {
    title: {
      en: "Quote accepted — please pay",
      pl: "Wycena zaakceptowana — czas zapłacić",
      de: "Angebot angenommen — bitte zahlen",
      fr: "Devis accepté — veuillez payer",
    },
    body: () => null,
  },
  quote_rejected: {
    title: {
      en: "Quote marked as rejected",
      pl: "Wycena oznaczona jako odrzucona",
      de: "Angebot als abgelehnt markiert",
      fr: "Devis marqué comme refusé",
    },
    body: () => null,
  },
  message_received: {
    title: {
      en: "New message from Cargoo",
      pl: "Nowa wiadomość od Cargoo",
      de: "Neue Nachricht von Cargoo",
      fr: "Nouveau message de Cargoo",
    },
    body: (m: MessageMeta) => (m.excerpt ? m.excerpt.slice(0, 240) : null),
  },
  order_paid: {
    title: {
      en: "Payment confirmed",
      pl: "Płatność potwierdzona",
      de: "Zahlung bestätigt",
      fr: "Paiement confirmé",
    },
    body: () => null,
  },
  order_shipped: {
    title: {
      en: "Your order has shipped",
      pl: "Twoje zamówienie zostało wysłane",
      de: "Ihre Bestellung wurde versandt",
      fr: "Votre commande a été expédiée",
    },
    body: (m: ShipmentMeta, lang) => {
      if (!m.trackingNumber && !m.carrier) return null;
      const carrier = m.carrier ?? "";
      const tn = m.trackingNumber ?? "";
      return {
        en: `${carrier ? carrier + " — " : ""}tracking: ${tn}`,
        pl: `${carrier ? carrier + " — " : ""}numer śledzenia: ${tn}`,
        de: `${carrier ? carrier + " — " : ""}Sendungsnummer: ${tn}`,
        fr: `${carrier ? carrier + " — " : ""}suivi : ${tn}`,
      }[lang];
    },
  },
  order_delivered: {
    title: {
      en: "Order delivered",
      pl: "Zamówienie dostarczone",
      de: "Bestellung zugestellt",
      fr: "Commande livrée",
    },
    body: () => null,
  },
  generic: {
    title: {
      en: "Notification",
      pl: "Powiadomienie",
      de: "Benachrichtigung",
      fr: "Notification",
    },
    // Generic notifications carry their own pre-rendered title/body in meta.
    body: (m: GenericMeta) => m?.body ?? null,
  },
};

function pickLang(raw: string | null | undefined): NotificationLang {
  if (raw === "pl" || raw === "de" || raw === "fr" || raw === "en") return raw;
  return "en";
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  meta?: Record<string, unknown>;
  link?: string | null;
  /** Override per-call. If omitted, uses the user's stored `lang`. */
  lang?: NotificationLang;
  /** Override the templated title (use sparingly — i18n breaks). */
  titleOverride?: string;
  /** Override the templated body. */
  bodyOverride?: string | null;
};

export async function createNotification(input: CreateNotificationInput): Promise<NotificationRow> {
  const meta = input.meta ?? {};
  let lang: NotificationLang;
  if (input.lang) {
    lang = input.lang;
  } else {
    const u = await queryOne<{ lang: string | null }>(
      "SELECT lang FROM users WHERE id = $1",
      [input.userId]
    );
    lang = pickLang(u?.lang);
  }

  const tpl = TEMPLATES[input.type];
  // For 'generic', the title may live in meta.
  const genericTitle =
    input.type === "generic" ? (meta as GenericMeta)?.title : undefined;
  const title = input.titleOverride ?? genericTitle ?? tpl.title[lang];
  const body =
    input.bodyOverride !== undefined
      ? input.bodyOverride
      : tpl.body(meta, lang);

  const [row] = await query<NotificationRow>(
    `INSERT INTO notifications (user_id, type, title, body, link, meta)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)
     RETURNING *`,
    [input.userId, input.type, title, body, input.link ?? null, JSON.stringify(meta)]
  );
  return row;
}

/** Best-effort wrapper: never throws. Use this from inside business-critical
 *  routes (quote-send, payment webhook) so a notification failure never
 *  bubbles up and rolls back the actual operation. */
export async function tryCreateNotification(
  input: CreateNotificationInput
): Promise<NotificationRow | null> {
  try {
    return await createNotification(input);
  } catch (e) {
    console.error("notifications: create failed", e);
    return null;
  }
}

export async function listForUser(
  userId: string,
  opts: { limit?: number; onlyUnread?: boolean } = {}
): Promise<NotificationRow[]> {
  const limit = Math.min(Math.max(opts.limit ?? 30, 1), 100);
  if (opts.onlyUnread) {
    return query<NotificationRow>(
      `SELECT * FROM notifications
       WHERE user_id = $1 AND is_read = FALSE
       ORDER BY created_at DESC
       LIMIT ${limit}`,
      [userId]
    );
  }
  return query<NotificationRow>(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT ${limit}`,
    [userId]
  );
}

export async function unreadCount(userId: string): Promise<number> {
  const row = await queryOne<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE",
    [userId]
  );
  return Number(row?.count ?? 0);
}

export async function markRead(userId: string, id: string): Promise<NotificationRow | null> {
  return queryOne<NotificationRow>(
    `UPDATE notifications
     SET is_read = TRUE, read_at = COALESCE(read_at, now())
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId]
  );
}

export async function markAllRead(userId: string): Promise<number> {
  const rows = await query<{ id: string }>(
    `UPDATE notifications
     SET is_read = TRUE, read_at = COALESCE(read_at, now())
     WHERE user_id = $1 AND is_read = FALSE
     RETURNING id`,
    [userId]
  );
  return rows.length;
}
