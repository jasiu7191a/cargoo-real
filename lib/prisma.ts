import { PrismaClient } from '@prisma/client/wasm'
import { PrismaNeonHTTP } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

// Neon HTTP driver, NOT the WebSocket Pool. On Cloudflare Workers a Pool
// cached at module level is reused across requests, and Workers forbid using
// I/O objects (the pool's WebSocket) created in one request from another —
// every prisma call on a warm isolate then throws "Cannot perform I/O on
// behalf of a different request" / "Connection terminated", which surfaced
// as bare 502s on /api/agent/trigger and 500s on blog SSR. The HTTP driver
// is stateless (one fetch per query), so the client is safe to cache.
// Trade-off: no interactive transactions — nothing using this client needs
// them (lib/account-db.ts handles the transactional raw-SQL paths).
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
    const adapter = new PrismaNeonHTTP(neon(connectionString));
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
