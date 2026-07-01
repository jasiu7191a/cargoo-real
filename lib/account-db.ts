import { neon, Pool } from "@neondatabase/serverless";

/**
 * Two clients on purpose:
 *
 *   neon()  — HTTP client. Used by query() / queryOne(). Stateless, no
 *             WebSockets, safe for concurrent calls (Promise.all) and
 *             cold-starts on Cloudflare Workers. This is what Neon
 *             recommends for serverless/edge runtimes.
 *
 *   Pool    — WebSocket client. Used by transaction() because we need a
 *             pinned connection across BEGIN/COMMIT. Allocated lazily
 *             so routes that don't open a transaction never pay the
 *             WebSocket cost.
 */

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL env var is required but not set.");
  }
  return connectionString;
}

let httpSql: ReturnType<typeof neon> | null = null;
function getHttp() {
  if (!httpSql) httpSql = neon(getConnectionString());
  return httpSql;
}

export async function query<T = any>(text: string, params: unknown[] = []): Promise<T[]> {
  const rows = await getHttp()(text, params as any[]);
  return rows as T[];
}

export async function queryOne<T = any>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

// A fresh Pool per transaction, closed before returning. Caching a Pool at
// module level breaks on Cloudflare Workers: the pooled WebSocket belongs to
// the request that opened it, and any later request touching it throws
// "Cannot perform I/O on behalf of a different request". Neon's guidance for
// Workers is exactly this create-use-end lifecycle.
function newPool() {
  return new Pool({ connectionString: getConnectionString() });
}

type TxClient = {
  query: <T = any>(text: string, params?: unknown[]) => Promise<T[]>;
  queryOne: <T = any>(text: string, params?: unknown[]) => Promise<T | null>;
};

export async function transaction<T>(fn: (client: TxClient) => Promise<T>): Promise<T> {
  const pool = newPool();
  const client = await pool.connect();
  const tx: TxClient = {
    query: async <R = any>(text: string, params: unknown[] = []) => {
      const result = await client.query(text, params as any[]);
      return result.rows as R[];
    },
    queryOne: async <R = any>(text: string, params: unknown[] = []) => {
      const result = await client.query(text, params as any[]);
      return (result.rows[0] ?? null) as R | null;
    },
  };

  try {
    await client.query("BEGIN");
    const value = await fn(tx);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end().catch(() => {});
  }
}
