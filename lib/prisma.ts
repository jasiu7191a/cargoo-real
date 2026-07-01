import { PrismaClient } from '@prisma/client/wasm'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'

// poolQueryViaFetch makes Pool.query() go over a stateless HTTP fetch instead
// of a pooled WebSocket. On Cloudflare Workers a WebSocket cached at module
// level is reused across requests, which the runtime forbids — every prisma
// call on a warm isolate then threw "Cannot perform I/O on behalf of a
// different request" / "Connection terminated", surfacing as bare 502s on
// /api/agent/trigger and 500s on blog SSR. With fetch-per-query there is no
// cross-request I/O object, so caching the client below is safe.
// Note: PrismaNeonHTTP + neon() is NOT equivalent here — at these package
// versions it drops the adapter's custom type parsers, so DateTime columns
// come back as Date objects and the query engine rejects them ("Conversion
// failed: expected a string in column 'publishedAt'"). The Pool shim forwards
// the adapter's `types` config; only pool.connect() (Prisma interactive
// transactions — unused in this codebase) would fall back to a WebSocket.
neonConfig.poolQueryViaFetch = true;

let prismaInstance: PrismaClient | null = null;

export const getPrisma = (): PrismaClient => {
  if (prismaInstance) return prismaInstance;

  const connectionString = process.env.DATABASE_URL;

  // Build Phase Safety Shield
  if (!connectionString) {
    console.warn("⚠️ PRISMA SHIELD: DATABASE_URL not found. Returning safe build-time proxy.");
    return new Proxy({}, {
      get: (_, prop) => {
        return new Proxy(() => {}, {
          get: () => () => Promise.resolve([]),
          apply: () => Promise.resolve([])
        });
      }
    }) as unknown as PrismaClient;
  }

  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    prismaInstance = new PrismaClient({ adapter });
    return prismaInstance;
  } catch (error: any) {
    console.error("Prisma Initialization Error:", error);
    return new Proxy({}, {
      get: () => new Proxy(() => {}, {
        get: () => () => Promise.resolve([]),
        apply: () => Promise.resolve([])
      })
    }) as unknown as PrismaClient;
  }
};

// Export a proxy that mimics PrismaClient but delays initialization until a property is accessed
const prisma = new Proxy({}, {
  get: (_, prop) => {
    const client = getPrisma();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
}) as unknown as PrismaClient;

declare global {
  var prisma: PrismaClient | undefined;
}

// Singleton pattern for consistency in dev
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;
