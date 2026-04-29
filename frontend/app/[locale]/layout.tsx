import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import Script from "next/script";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { locales, type Locale } from "@/i18n/config";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Hero" });
  return {
    title: "Maison — Luxury Salon & Spa",
    description: t("description"),
    themeColor: "#111111"
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();

  // Required by next-intl when using `localePrefix: "as-needed"` so static
  // generation knows which locale this render is for.
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col">
        {/* Google Identity Services — provides window.google.accounts for the
            Google Sign-In button on /login. Loaded once at the layout level so
            switching between routes doesn't refetch it. */}
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
