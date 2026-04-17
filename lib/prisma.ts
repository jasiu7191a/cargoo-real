import { PrismaClient } from '@prisma/client/wasm'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'
import { getRequestContext } from '@opennextjs/cloudflare'

const prismaClientSingleton = () => {
  // 1. Try to get the connection string from all possible sources
  // Prioritize Cloudflare Request Context for runtime stability
  let connectionString = process.env.DATABASE_URL;

  try {
    const ctx = getRequestContext();
    if (ctx?.env?.DATABASE_URL) {
      connectionString = ctx.env.DATABASE_URL as string;
    }
  } catch (e) {
    // Context might not be available during certain build/init phases
  }

  // Fallbacks for local dev or misconfigured environments
  if (!connectionString) {
    connectionString = (globalThis as any).DATABASE_URL || (globalThis as any).env?.DATABASE_URL;
  }
  
  // 2. Build Phase / Missing URL Safety Shield
  if (!connectionString) {
    console.warn("⚠️ PRISMA SHIELD: DATABASE_URL not found. Returning safe proxy.");
    return new Proxy({}, {
      get: (_, prop) => {
        return new Proxy(() => {}, {
          get: () => () => Promise.resolve([]),
          apply: () => Promise.resolve([])
        });
      }
    }) as unknown as PrismaClient;
  }

  // 3. Optimized Edge Initialization
  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  } catch (error: any) {
    console.error("Prisma Fatal Initialization Error:", error);
    // Return the safe proxy instead of throwing a worker-killing exception
    return new Proxy({}, {
        get: (_, prop) => {
          return new Proxy(() => {}, {
            get: () => () => Promise.resolve([]),
            apply: () => Promise.resolve([])
          });
        }
      }) as unknown as PrismaClient;
  }
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// We do NOT use the singleton pattern directly in Cloudflare Workers 
// because global state can be unpredictable. We re-initialize safely if needed.
const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
