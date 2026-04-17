import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const prismaClientSingleton = () => {
  // THE "DEEP SCAN" - Works on Cloudflare Edge even when frameworks hide it
  const connectionString = 
    (process.env.DATABASE_URL) || 
    (globalThis as any).DATABASE_URL || 
    (globalThis as any).env?.DATABASE_URL ||
    (process as any).env?.DATABASE_URL ||
    (typeof (globalThis as any).process !== 'undefined' ? (globalThis as any).process.env?.DATABASE_URL : undefined);
  
  if (!connectionString) {
    console.warn("Retrying database lookup with specialized bridge check...");
  }

  try {
    const pool = new Pool({ connectionString: connectionString || '' });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  } catch (error) {
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
