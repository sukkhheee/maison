"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CalendarCheck2, Menu, User2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
  const t = useTranslations("Navbar");
  const navLinks = [
    { href: "/#services", label: t("services") },
    { href: "/#masters", label: t("masters") },
    { href: "/#story", label: t("story") }
  ];

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "glass-light border-b border-ink/5 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className={cn(
              "h-9 w-9 rounded-full grid place-items-center transition-colors",
              scrolled ? "bg-ink text-bone" : "bg-bone/10 backdrop-blur text-bone"
            )}
          >
            <span className="font-serif text-lg">M</span>
          </span>
          <span
            className={cn(
              "font-serif text-xl tracking-luxury-tight transition-colors",
              scrolled ? "text-ink" : "text-bone"
            )}
          >
            Maison
          </span>
        </Link>

        {/* Center links */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm tracking-wide transition-colors relative group",
                scrolled ? "text-ink/70 hover:text-ink" : "text-bone/80 hover:text-bone"
              )}
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher variant={scrolled ? "dark" : "light"} />
          <Link
            href="/bookings"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors",
              scrolled
                ? "text-ink/80 hover:text-ink hover:bg-ink/5"
                : "text-bone/90 hover:text-bone hover:bg-bone/10"
            )}
          >
            <CalendarCheck2 size={16} />
            {t("myBookings")}
          </Link>
          <Link
            href="/login"
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm border transition-all",
              scrolled
                ? "border-ink/20 text-ink hover:border-gold hover:text-gold-700"
                : "border-bone/30 text-bone hover:border-gold hover:bg-bone/5"
            )}
          >
            <User2 size={16} />
            {t("login")}
          </Link>
        </div>

        {/* Mobile trigger */}
        <div className="md:hidden flex items-center gap-1">
          <LanguageSwitcher variant={scrolled ? "dark" : "light"} />
          <button
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "p-2 rounded-md transition-colors",
              scrolled ? "text-ink hover:bg-ink/5" : "text-bone hover:bg-bone/10"
            )}
            aria-label={t("openMenu")}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <motion.div
        initial={false}
        animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="md:hidden overflow-hidden glass-light"
      >
        <div className="container py-6 flex flex-col gap-4">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-ink/80 hover:text-ink py-2 border-b border-ink/5"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link
              href="/bookings"
              className="flex-1 text-center py-3 rounded-md border border-ink/20 text-ink"
            >
              {t("myBookings")}
            </Link>
            <Link
              href="/login"
              className="flex-1 text-center py-3 rounded-md bg-ink text-bone"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}
