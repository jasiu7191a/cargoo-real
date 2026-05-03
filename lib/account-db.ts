import { Pool } from "@neondatabase/serverless";

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL env var is required but not set.");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function query<T = any>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query(text, params as any[]);
  return result.rows as T[];
}

export async function queryOne<T = any>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

type TxClient = {
  query: <T = any>(text: string, params?: unknown[]) => Promise<T[]>;
  queryOne: <T = any>(text: string, params?: unknown[]) => Promise<T | null>;
};

export async function transaction<T>(fn: (client: TxClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
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
  }
}
