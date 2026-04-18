import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const envKeys = Object.keys(process.env);
  const globalKeys = Object.keys(globalThis).filter(k => k.toUpperCase() === k);
  
  return NextResponse.json({
    message: "Cargoo Environment Debugger",
    processEnvKeys: envKeys,
    globalContextKeys: globalKeys,
    nodeEnv: process.env.NODE_ENV,
    // Checking specifically for the existence (not the value) of our keys
    hasDatabaseUrl: !!(process.env.DATABASE_URL || (globalThis as any).DATABASE_URL),
    hasOpenAiKey: !!(process.env.OPENAI_API_KEY || (globalThis as any).OPENAI_API_KEY),
    hasResendKey: !!(process.env.RESEND_API_KEY || (globalThis as any).RESEND_API_KEY)
  });
}
