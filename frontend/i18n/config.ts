/**
 * Single source of truth for the supported locales. Imported by:
 * - middleware.ts (URL routing)
 * - i18n.ts (server-side message loader)
 * - components/landing/LanguageSwitcher.tsx (UI)
 */
export const locales = ["mn", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "mn";

export const localeMeta: Record<Locale, { label: string; flag: string; nativeName: string }> = {
  mn: { label: "Монгол", flag: "🇲🇳", nativeName: "Монгол" },
  en: { label: "English", flag: "🇬🇧", nativeName: "English" }
};
