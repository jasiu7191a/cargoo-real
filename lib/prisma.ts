import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const prismaClientSingleton = () => {
  // SEARCH ALL POSSIBLE LOCATIONS
  const connectionString = 
    (process.env.DATABASE_URL) || 
    (globalThis as any).DATABASE_URL || 
    (globalThis as any).env?.DATABASE_URL ||
    (process as any).env?.DATABASE_URL ||
    (typeof (globalThis as any).process !== 'undefined' ? (globalThis as any).process.env?.DATABASE_URL : undefined);
  
  // CRITICAL: We MUST have the connection string or the adapter version will fail.
  // Standard PrismaClient() without an adapter will CRASH on Cloudflare.
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing. Check Cloudflare Dashboard -> Settings -> Variables.");
  }

  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    // Success: Return the client WITH the adapter
    return new PrismaClient({ adapter });
  } catch (error: any) {
    console.error("Prisma Initialization Error:", error);
    throw error;
  }
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
