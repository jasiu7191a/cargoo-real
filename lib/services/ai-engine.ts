import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not defined in the environment variables.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

/**
 * Smart Sourcing Assistant - Evaluates a product/link for risk and margin.
 */
export async function analyzeProductSourcing(productName: string, url?: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a senior product sourcing expert for an import business specializating in China. Your goal is to evaluate risk factors, estimated margins, and suggest better sourcing alternatives."
        },
        {
          role: "user",
          content: `Evaluate sourcing for Product: "${productName}"${url ? ` (Link: ${url})` : ''}. 
          Provide a JSON response with:
          - riskScore (1-10)
          - riskFactors (array)
          - estimatedMarginPercent (range)
          - sourcingAdvice (string)
          - alternativeKeywords (array)`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("Error in analyzeProductSourcing:", error);
    return null;
  }
}

/**
 * SEO Content Engine - Generates blog posts targeting buyer intent.
 */
export async function generateSEOBlogPost(topic: string, products: string[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a senior product growth strategist and SEO expert. Generate a long-form, high-intent blog post that converts readers into import customers."
        },
        {
          role: "user",
          content: `Topic: "${topic}"
          Targeted products: ${products.join(", ")}
          
          Generate:
          1. A compelling title
          2. Meta description (max 160 chars)
          3. Full Markdown content with H1, H2, and H3 tags.
          4. Internal link suggestions.
          
          Focus on trust, savings, and the ease of using Cargoo's service.`
        }
      ],
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error in generateSEOBlogPost:", error);
    return null;
  }
}
