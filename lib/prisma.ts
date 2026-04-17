import { PrismaClient } from '@prisma/client/wasm'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const prismaClientSingleton = () => {
  const connectionString = 
    (process.env.DATABASE_URL) || 
    (globalThis as any).DATABASE_URL || 
    (globalThis as any).env?.DATABASE_URL ||
    (process as any).env?.DATABASE_URL ||
    (typeof (globalThis as any).process !== 'undefined' ? (globalThis as any).process.env?.DATABASE_URL : undefined);
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing in Cloudflare variables.");
  }

  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    // The /wasm client works perfectly with adapters on Cloudflare
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
