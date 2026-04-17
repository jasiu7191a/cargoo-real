import OpenAI from "openai";

/**
 * Shared OpenAI client for the Cargoo Platform.
 * Uses the OPENAI_API_KEY from environment variables.
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
