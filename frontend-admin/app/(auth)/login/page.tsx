"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { login, status } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already authenticated? Skip the form.
  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ email: email.trim(), password });
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card p-8 w-full max-w-md"
    >
      <h1 className="font-serif text-3xl tracking-tight">Нэвтрэх</h1>
      <p className="text-fg-muted text-sm mt-1">
        Салоны админ панель руу нэвтэрнэ үү.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field
          label="Имэйл"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Field
          label="Нууц үг"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Нэвтэрч байна…
            </>
          ) : (
            "Нэвтрэх"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-border text-sm text-fg-muted text-center">
        Шинэ салон уу?{" "}
        <Link
          href="/get-started"
          className="text-accent hover:underline font-medium"
        >
          Бүртгүүлэх
        </Link>
      </div>
    </motion.div>
  );
}

function Field({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
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
    </label>
  );
}
