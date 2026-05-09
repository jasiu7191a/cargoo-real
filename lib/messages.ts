import { query, queryOne } from "@/lib/account-db";

export type MessageRow = {
  id: string;
  quote_request_id: string;
  sender_user_id: string | null;
  from_admin: boolean;
  content: string;
  read_at: string | null;
  created_at: string;
};

/** Returns true if the request belongs to userId. Used as a cheap auth gate
 *  before listing or posting messages on a request thread. */
export async function userOwnsRequest(userId: string, quoteRequestId: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    "SELECT id FROM quote_requests WHERE id = $1 AND user_id = $2",
    [quoteRequestId, userId]
  );
  return Boolean(row);
}

export async function listMessages(quoteRequestId: string): Promise<MessageRow[]> {
  return query<MessageRow>(
    `SELECT id, quote_request_id, sender_user_id, from_admin, content, read_at, created_at
     FROM messages
     WHERE quote_request_id = $1
     ORDER BY created_at ASC`,
    [quoteRequestId]
  );
}

export async function createMessage(input: {
  quoteRequestId: string;
  senderUserId: string;
  fromAdmin: boolean;
  content: string;
}): Promise<MessageRow> {
  const [row] = await query<MessageRow>(
    `INSERT INTO messages (quote_request_id, sender_user_id, from_admin, content)
     VALUES ($1, $2, $3, $4)
     RETURNING id, quote_request_id, sender_user_id, from_admin, content, read_at, created_at`,
    [input.quoteRequestId, input.senderUserId, input.fromAdmin, input.content]
  );
  return row;
}

/** Mark all messages on a thread as read (by the *other* party).
 *  Customer reading the thread → marks admin's messages as read.
 *  Admin reading the thread → marks customer's messages as read. */
export async function markThreadRead(
  quoteRequestId: string,
  whoIsReading: "customer" | "admin"
): Promise<number> {
  const fromAdminFilter = whoIsReading === "customer" ? true : false;
  const rows = await query<{ id: string }>(
    `UPDATE messages
     SET read_at = COALESCE(read_at, now())
     WHERE quote_request_id = $1 AND from_admin = $2 AND read_at IS NULL
     RETURNING id`,
    [quoteRequestId, fromAdminFilter]
  );
  return rows.length;
}

export async function unreadCountForUser(userId: string): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM messages m
     JOIN quote_requests qr ON qr.id = m.quote_request_id
     WHERE qr.user_id = $1
       AND m.from_admin = TRUE
       AND m.read_at IS NULL`,
    [userId]
  );
  return Number(row?.count ?? 0);
}
