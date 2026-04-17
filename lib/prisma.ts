import { PrismaClient } from '@prisma/client/wasm'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const prismaClientSingleton = () => {
  // 1. LOOK FOR CONNECTION STRING
  const connectionString = 
    (process.env.DATABASE_URL) || 
    (globalThis as any).DATABASE_URL || 
    (globalThis as any).env?.DATABASE_URL ||
    (process as any).env?.DATABASE_URL ||
    (typeof (globalThis as any).process !== 'undefined' ? (globalThis as any).process.env?.DATABASE_URL : undefined);
  
  // 2. BUILD-TIME SAFETY: If we are in the Cloudflare build environment, 
  // we might not have a DATABASE_URL. Return a dummy client to avoid crashing the build.
  if (!connectionString) {
    console.warn("⚠️ BUILD PHASE SAFE-MODE: DATABASE_URL not found. Shields activated.");
    // Return a dummy object that blocks Prisma initialization during build
    return new Proxy({}, {
      get: () => { 
        return () => { throw new Error("Prisma used at build time without DATABASE_URL"); }
      }
    }) as any;
  }

  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  } catch (error: any) {
    console.error("Prisma Initialization Error:", error);
    return new PrismaClient();
  }
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
