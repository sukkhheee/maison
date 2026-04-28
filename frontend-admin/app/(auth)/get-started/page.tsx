"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

/**
 * Single-page onboarding: collects salon info + admin credentials, then
 * registers the tenant + first SALON_ADMIN in one transaction. The user is
 * logged in immediately on success.
 */
export default function GetStartedPage() {
  const router = useRouter();
  const { registerSalon, status } = useAuth();

  const [salonName, setSalonName] = useState("");
  const [salonSlug, setSalonSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  // Auto-suggest a slug from the salon name unless the user has edited it manually.
  const suggestedSlug = useMemo(() => slugify(salonName), [salonName]);
  useEffect(() => {
    if (!slugTouched) setSalonSlug(suggestedSlug);
  }, [suggestedSlug, slugTouched]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await registerSalon({
        salonName: salonName.trim(),
        salonSlug: salonSlug.trim().toLowerCase(),
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Бүртгэлд алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  const passwordStrong = password.length >= 8;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card p-8 w-full max-w-2xl"
    >
      <p className="text-xs uppercase tracking-wider text-accent font-semibold">
        Шинэ салон бүртгүүлэх
      </p>
      <h1 className="font-serif text-3xl tracking-tight mt-2">
        Maison-аас эхлүүлье
      </h1>
      <p className="text-fg-muted text-sm mt-1">
        Доорх мэдээллийг бөглөснөөр салоны админ панель таны эзэмшилд орно.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-6">
        {/* Salon */}
        <Section title="Салоны мэдээлэл">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Салоны нэр"
              required
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              placeholder="Maison Salon"
            />
            <Field
              label="URL slug"
              required
              value={salonSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSalonSlug(slugify(e.target.value));
              }}
              hint={
                salonSlug
                  ? `maison.mn/${salonSlug}/book`
                  : "Жижиг үсэг + зураас"
              }
            />
          </div>
        </Section>

        {/* Admin */}
        <Section title="Админ хэрэглэгч">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Бүтэн нэр"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Бат-Эрдэнэ"
            />
            <Field
              label="Утас"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+976 9900 0000"
              type="tel"
            />
            <Field
              label="Имэйл"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@maison.mn"
            />
            <Field
              label="Нууц үг"
              required
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={
                password.length === 0
                  ? "8-аас доошгүй тэмдэгт"
                  : passwordStrong
                  ? "✓ Хангалттай"
                  : `${password.length}/8 тэмдэгт`
              }
              hintAccent={passwordStrong ? "good" : undefined}
            />
          </div>
        </Section>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <p className="text-xs text-fg-muted">
            Аккаунттай юу?{" "}
            <Link href="/login" className="text-accent hover:underline font-medium">
              Нэвтрэх
            </Link>
          </p>
          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={submitting || !passwordStrong}
            className={cn(!passwordStrong && "opacity-60")}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Үүсгэж байна…
              </>
            ) : (
              <>
                Салон үүсгэх
                <Check size={16} />
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-luxury-wide text-fg-muted font-semibold mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  hintAccent?: "good" | "bad";
}

function Field({ label, hint, hintAccent, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-fg">{label}</span>
      <input
        {...rest}
        className={cn(
          "mt-1 w-full h-10 px-3 rounded-md border border-border bg-surface text-sm",
          "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
          "placeholder:text-fg-muted/60 transition-colors"
        )}
      />
      {hint && (
        <span
          className={cn(
            "block mt-1 text-[10px]",
            hintAccent === "good"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-fg-muted"
          )}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
