import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const prismaClientSingleton = () => {
  // SEARCH ALL POSSIBLE LOCATIONS WITHOUT SPECIAL IMPORTS
  const connectionString = 
    (process.env.DATABASE_URL) || 
    (globalThis as any).DATABASE_URL || 
    (globalThis as any).env?.DATABASE_URL ||
    (process as any).env?.DATABASE_URL;
  
  if (!connectionString) {
    console.error("CRITICAL: DATABASE_URL not found in any environment context.");
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
