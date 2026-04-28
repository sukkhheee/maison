import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./i18n/config";

export default createMiddleware({
  locales: [...locales],
  defaultLocale,
  // Mongolian URLs stay clean (`/`, `/book`); English URLs are prefixed
  // (`/en`, `/en/book`). Switch to "always" if both should be prefixed.
  localePrefix: "as-needed"
});

export const config = {
  // Skip static assets and API routes.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};
