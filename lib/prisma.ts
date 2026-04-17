import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'
import { getRequestContext } from '@opennextjs/cloudflare'

const prismaClientSingleton = () => {
  let connectionString: string | undefined;

  try {
    // 1. THE OFFICIAL TUNNEL: Ask Cloudflare for the env object
    const ctx = getRequestContext();
    connectionString = (ctx.env as any).DATABASE_URL;
  } catch (e) {
    // 2. FALLBACK: If not on Cloudflare (local dev), check process.env
    connectionString = process.env.DATABASE_URL;
  }
  
  if (!connectionString) {
    console.error("CRITICAL: DATABASE_URL not found in Cloudflare Context or Environment.");
    return new PrismaClient();
  }

  try {
    const pool = new Pool({ connectionString });
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
