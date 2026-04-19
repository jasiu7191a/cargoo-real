import { PrismaClient } from '@prisma/client/wasm'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

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

// Singleton pattern for consistency in dev
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;
