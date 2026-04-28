import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { locales } from "./config";

/**
 * Locale-aware {@link Link}, {@link useRouter}, {@link usePathname} that
 * automatically handle the `/en` prefix per the `as-needed` policy. Use these
 * everywhere instead of the raw `next/navigation` exports so the active locale
 * is preserved across navigations and `pathname` is always the de-localized
 * canonical path (e.g. `/book` whether you're on `/book` or `/en/book`).
 */
export const { Link, useRouter, usePathname, redirect } =
  createSharedPathnamesNavigation({
    locales,
    localePrefix: "as-needed"
  });
