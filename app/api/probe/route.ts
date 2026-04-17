import { NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";

export const dynamic = 'force-dynamic';

export async function GET() {
  // FIND THE CONNECTION STRING ANYWAY WE CAN
  const connectionString = 
    process.env.DATABASE_URL || 
    (globalThis as any).DATABASE_URL || 
    (globalThis as any).env?.DATABASE_URL ||
    (process as any).env?.DATABASE_URL;

  if (!connectionString) {
    return NextResponse.json({ 
      status: "🚨 DEAD: Connection string is totally missing.",
      visibleKeys: Object.keys(process.env).filter(k => k.includes('DATA'))
    });
  }

  try {
    const pool = new Pool({ connectionString });
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    client.release();
    
    return NextResponse.json({ 
      status: "✅ LIVE: Database connected successfully!",
      time: res.rows[0]
    });
  } catch (err: any) {
    return NextResponse.json({ 
      status: "🛑 ERROR: Found the link, but cannot log in.",
      error: err.message,
      hint: "Check if your Neon password (npg_...) is correct and has no spaces."
    });
  }
}
