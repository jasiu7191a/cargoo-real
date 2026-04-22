// Server-only dictionary loader for i18n.
// Used by [lang]/ pages to pick the right translation bundle.

import en from "./dictionaries/en.json";
import pl from "./dictionaries/pl.json";
import de from "./dictionaries/de.json";
import fr from "./dictionaries/fr.json";

const dictionaries = { en, pl, de, fr } as const;

export type Locale = keyof typeof dictionaries;
export type Dictionary = typeof en;

export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "pl", "de", "fr"] as const;

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Returns the translation bundle for the given locale,
 * falling back to English when the locale is unknown.
 */
export function getDictionary(locale: string): Dictionary {
  return isLocale(locale) ? dictionaries[locale] : dictionaries.en;
}
