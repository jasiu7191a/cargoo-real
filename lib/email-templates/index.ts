import { template as de } from "./de";
import { template as en } from "./en";
import { template as fr } from "./fr";
import { template as pl } from "./pl";

const templates: Record<string, string> = { de, en, fr, pl };

/**
 * Returns the branded HTML email template for the given language.
 * Falls back to English. Replace {{BODY}} and {{UNSUB_URL}} before sending.
 */
export function getEmailTemplate(lang: string): string {
  return templates[lang] ?? templates["en"];
}
