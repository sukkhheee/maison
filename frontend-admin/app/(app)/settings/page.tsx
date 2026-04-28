"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, Check, AlertCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextArea } from "@/components/ui/Field";
import { Skeleton, ErrorBlock } from "@/components/shared/Skeleton";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  getSalonSettings,
  updateSalonSettings,
  type AdminSalonSettings
} from "@/lib/api/admin-salon";
import { ApiError } from "@/lib/api/client";

const COMMON_TIMEZONES = [
  "Asia/Ulaanbaatar",
  "Asia/Hovd",
  "Asia/Choibalsan",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "UTC"
];

export default function SettingsPage() {
  const { data, loading, error, refetch } = useApi(() => getSalonSettings(), []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">Тохиргоо</h2>
        <p className="text-fg-muted text-sm mt-1">
          Салоны үндсэн мэдээлэл, цагийн бүсийг удирдах.
        </p>
      </div>

      {error ? (
        <ErrorBlock message={error.message} onRetry={refetch} />
      ) : loading || !data ? (
        <div className="card p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <SalonForm initial={data} onSaved={refetch} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function SalonForm({
  initial,
  onSaved
}: {
  initial: AdminSalonSettings;
  onSaved: () => void;
}) {
  const { refreshMe } = useAuth();

  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [address, setAddress] = useState(initial.address ?? "");
  const [timezone, setTimezone] = useState(initial.timezone);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setName(initial.name);
    setEmail(initial.email ?? "");
    setPhone(initial.phone ?? "");
    setAddress(initial.address ?? "");
    setTimezone(initial.timezone);
  }, [initial]);

  const dirty =
    name !== initial.name ||
    email !== (initial.email ?? "") ||
    phone !== (initial.phone ?? "") ||
    address !== (initial.address ?? "") ||
    timezone !== initial.timezone;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await updateSalonSettings({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        timezone
      });
      // Salon name might be displayed in the sidebar — refresh AuthProvider too.
      await refreshMe();
      onSaved();
      setSavedAt(Date.now());
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("Алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={submit}
      className="space-y-6"
    >
      {/* Identity card */}
      <Section title="Үндсэн мэдээлэл" description="Зочид болон захиалгад харагдана.">
        <Field
          label="Салоны нэр"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Холбоо барих имэйл"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@maison.mn"
          />
          <Field
            label="Утас"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+976 7700 0000"
          />
        </div>
        <TextArea
          label="Хаяг"
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Чингэлтэй дүүрэг, Улаанбаатар"
        />
      </Section>

      {/* Locale + slug */}
      <Section
        title="Цагийн бүс"
        description="Бүх цаг тооцоолол энэ бүсэд хийгдэнэ — буруу тохируулсан тохиолдолд захиалгын цаг сэлгэгдэх эрсдэлтэй."
      >
        <label className="block">
          <span className="text-xs font-medium text-fg flex items-center gap-1">
            Timezone <span className="text-rose-500">*</span>
          </span>
          <div className="mt-1 relative">
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-surface text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors appearance-none"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
              {!COMMON_TIMEZONES.includes(timezone) && (
                <option value={timezone}>{timezone}</option>
              )}
            </select>
            <Globe
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none"
            />
          </div>
        </label>
      </Section>

      {/* Read-only identity */}
      <Section title="Систем" description="Эдгээр утгыг өөрчлөх боломжгүй.">
        <div className="grid sm:grid-cols-2 gap-4">
          <ReadOnly label="URL slug" value={`/${initial.slug}`} mono />
          <ReadOnly label="ID" value={`#${initial.id}`} mono />
        </div>
      </Section>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        {savedAt && !dirty && !error && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <Check size={12} />
            Хадгалагдсан
          </span>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={submitting || !dirty}
        >
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Хадгалж байна…
            </>
          ) : (
            <>
              <Save size={14} />
              Хадгалах
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
}

function Section({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6 space-y-4">
      <div>
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="text-xs text-fg-muted mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function ReadOnly({
  label,
  value,
  mono
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-fg">{label}</span>
      <span
        className={`mt-1 h-10 px-3 inline-flex items-center rounded-md border border-border bg-surface-2 text-sm text-fg-muted ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
