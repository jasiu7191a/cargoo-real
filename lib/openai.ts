import OpenAI from "openai";

/**
 * Shared OpenAI client for the Cargoo Platform.
 * Lazily initialized to prevent build-time crashes when API keys are missing.
 */
let openaiInstance: OpenAI | null = null;

export const getOpenAI = () => {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is missing. Please check your Cloudflare Environment Variables.");
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
};

export interface GeneratedContent {
  title: string;
  slug: string;
  metaDescription: string;
  content: string; // Markdown
}

/**
 * Standard prompt for generating a Cargoo Sourcing Guide.
 */
export const SOURCING_GUIDE_PROMPT = (keyword: string) => `
You are a senior sourcing agent and logistics expert for Cargoo Import, a platform helping EU businesses import from China.
Generate a comprehensive, high-converting sourcing guide for the targeting keyword/topic: "${keyword}".

Requirements:
- Title: Catchy, professional, SEO-optimized (e.g. "The 2026 Guide to Importing [Topic]")
- Slug: URL-safe hyphenated string based on the title.
- Meta Description: Compelling summary under 160 chars.
- Content: Long-form Markdown. Must include:
  ### 📦 Why Import [Topic]?
  ### 🛡️ Verified Sourcing & Quality Control
  ### 🚢 Logistics & Shipping to EU
  ### 📜 Customs & Duties (Focus on Poland/Germany/France)
  ### ⚡ How Cargoo Can Help (CTA)

Tone: Professional, authoritative, yet approachable.
Return the result as a raw JSON object with keys: title, slug, metaDescription, content.
`;
