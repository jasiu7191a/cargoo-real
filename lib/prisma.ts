import { PrismaClient } from '@prisma/client/wasm'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const prismaClientSingleton = () => {
  // 1. Prioritize standard process.env (populated by OpenNext at runtime)
  let connectionString = process.env.DATABASE_URL;

  // 2. Build Phase / Missing URL Safety Shield
  // This prevents the build from crashing if the URL isn't present yet.
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

  // 3. Reliable Edge Initialization
  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  } catch (error: any) {
    console.error("Prisma Initialization Error:", error);
    // Return a safe proxy instead of throwing a worker-killing exception (Error 1101)
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

// Singleton pattern for consistency
const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
