import { template as en } from "./en";
import { template as pl } from "./pl";
import { template as de } from "./de";
import { template as fr } from "./fr";

const templates: Record<string, string> = { en, pl, de, fr };

/**
 * Returns the branded HTML email template for the given language.
 * Falls back to English if the language is not supported.
 * Replace {{BODY}} with the email body HTML and {{UNSUB_URL}} with the unsubscribe link.
 */
export function getEmailTemplate(lang: string): string {
  return templates[lang] ?? templates["en"];
}
