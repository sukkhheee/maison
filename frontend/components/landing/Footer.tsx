"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const t = useTranslations("Footer");

  const cols = [
    {
      title: t("colBrand"),
      links: [
        { href: "/#story", label: t("colBrandStory") },
        { href: "/#masters", label: t("colBrandMasters") },
        { href: "/careers", label: t("colBrandCareers") }
      ]
    },
    {
      title: t("colServices"),
      links: [
        { href: "/#services", label: t("colServicesHair") },
        { href: "/#services", label: t("colServicesBeauty") },
        { href: "/#services", label: t("colServicesSpa") }
      ]
    },
    {
      title: t("colContact"),
      links: [
        { href: "mailto:hello@maison.mn", label: "hello@maison.mn", icon: Mail },
        { href: "tel:+97677000000", label: "+976 7700 0000", icon: Phone },
        { href: "#", label: "Чингэлтэй, УБ", icon: MapPin }
      ]
    }
  ];

  return (
    <footer className="relative mt-32 text-bone">
      {/* Glassmorphism layered background */}
      <div className="absolute inset-0 bg-ink" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(1200px 400px at 10% 0%, rgba(201,169,106,0.25), transparent), radial-gradient(900px 300px at 90% 100%, rgba(201,169,106,0.18), transparent)"
        }}
      />

      <div className="relative container py-20">
        {/* Top: brand statement */}
        <div className="grid lg:grid-cols-12 gap-12 pb-14 border-b border-bone/10">
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="h-10 w-10 rounded-full bg-gold-gradient grid place-items-center text-ink font-serif text-lg">
                M
              </span>
              <span className="font-serif text-2xl">Maison</span>
            </Link>
            <p className="text-bone/70 leading-relaxed max-w-md">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="glass h-10 w-10 rounded-full grid place-items-center hover:bg-gold/20 hover:border-gold/40 transition-all"
                  aria-label="Social"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title} className="lg:col-span-2 space-y-4">
              <h4 className="text-xs uppercase tracking-luxury-wide text-gold-300">
                {col.title}
              </h4>
              <ul className="space-y-3 text-sm">
                {col.links.map((l) => {
                  const Icon = (l as any).icon;
                  return (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="inline-flex items-center gap-2 text-bone/70 hover:text-gold transition-colors"
                      >
                        {Icon && <Icon size={14} />}
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-luxury-wide text-gold-300">
              {t("newsletterTitle")}
            </h4>
            <p className="text-sm text-bone/60">{t("newsletterDescription")}</p>
            <form className="glass rounded-md flex items-center p-1.5">
              <input
                type="email"
                placeholder={t("newsletterPlaceholder")}
                className="bg-transparent flex-1 px-3 py-2 text-sm placeholder:text-bone/40 focus:outline-none"
              />
              <button
                type="button"
                className="bg-gold-gradient text-ink text-xs uppercase tracking-luxury-wide px-4 py-2 rounded-sm hover:brightness-110 transition"
              >
                {t("newsletterSubmit")}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-bone/50">
          <p>{t("rights", { year: new Date().getFullYear() })}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gold transition">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-gold transition">
              {t("terms")}
            </Link>
            <Link href="/cookies" className="hover:text-gold transition">
              {t("cookies")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
