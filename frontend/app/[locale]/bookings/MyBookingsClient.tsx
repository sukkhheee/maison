"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Loader2, MapPin, Sparkles, User2 } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchMyBookings, type CustomerBooking } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { cn, formatMnt } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1];

const statusLabel: Record<CustomerBooking["status"], string> = {
  PENDING: "Хүлээгдэж буй",
  CONFIRMED: "Баталгаажсан",
  COMPLETED: "Дууссан",
  CANCELLED: "Цуцалсан",
  NO_SHOW: "Ирээгүй"
};

const paymentLabel: Record<CustomerBooking["paymentStatus"], string> = {
  UNPAID: "Төлөгдөөгүй",
  PENDING: "Төлбөр хүлээгдэж буй",
  PAID: "Төлөгдсөн",
  REFUNDED: "Буцаагдсан",
  FAILED: "Амжилтгүй"
};

const statusTone: Record<CustomerBooking["status"], string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-ink/10 text-ink/70",
  CANCELLED: "bg-rose-100 text-rose-800",
  NO_SHOW: "bg-rose-100 text-rose-800"
};

export function MyBookingsClient() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [bookings, setBookings] = useState<CustomerBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Send anonymous visitors to /login with a return-to hint.
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    setError(null);
    fetchMyBookings()
      .then((items) => {
        if (!cancelled) setBookings(items);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError) {
          if (e.status === 401) {
            router.replace("/login");
            return;
          }
          setError(e.message);
        } else {
          setError("Захиалгын жагсаалтыг ачаалж чадсангүй.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user, router]);

  if (!ready || (ready && user && bookings === null && !error)) {
    return (
      <div className="bg-bone min-h-[100svh] grid place-items-center">
        <Loader2 className="animate-spin text-ink/40" size={28} />
      </div>
    );
  }

  if (!user) {
    // Will be redirected by the effect; render nothing in the meantime.
    return null;
  }

  return (
    <div className="bg-bone min-h-[100svh]">
      <div className="container pt-28 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="max-w-2xl"
        >
          <span className="eyebrow">— Миний захиалгууд</span>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl tracking-luxury-tight leading-[1.1]">
            Сайн байна уу,
            <br />
            <span className="italic gold-text">{user.fullName}.</span>
          </h1>
          <p className="mt-5 text-ink/60 leading-relaxed">
            Таны захиалсан болон ирэх захиалгууд энд харагдана.
          </p>
        </motion.div>

        {error && (
          <div className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            {error}
          </div>
        )}

        {!error && bookings && bookings.length === 0 && (
          <div className="mt-12 rounded-2xl border border-ink/10 bg-white p-12 text-center">
            <Sparkles className="mx-auto text-gold" size={28} />
            <p className="mt-4 font-serif text-xl">
              Та одоогоор захиалга үүсгээгүй байна.
            </p>
            <p className="mt-2 text-ink/55 text-sm">
              Нүүр хуудаснаас дуртай үйлчилгээгээ сонгож эхлээрэй.
            </p>
            <Button asChild variant="gold" className="mt-6">
              <Link href="/">Үйлчилгээ үзэх</Link>
            </Button>
          </div>
        )}

        {!error && bookings && bookings.length > 0 && (
          <ul className="mt-12 grid gap-5 lg:grid-cols-2">
            {bookings.map((b, i) => (
              <motion.li
                key={b.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease, delay: i * 0.04 }}
                className="rounded-2xl bg-white border border-ink/8 p-6 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-luxury-wide text-ink/45">
                      Захиалга #{b.id}
                    </p>
                    <h3 className="mt-1 font-serif text-2xl tracking-luxury-tight leading-tight">
                      {b.salonName ?? "Salon"}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[11px] uppercase tracking-luxury-wide",
                      statusTone[b.status]
                    )}
                  >
                    {statusLabel[b.status]}
                  </span>
                </div>

                <div className="gold-divider my-5" />

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <Detail
                    icon={<CalendarDays size={14} />}
                    label="Огноо"
                    value={formatDate(b.startTime)}
                  />
                  <Detail
                    icon={<Clock size={14} />}
                    label="Цаг"
                    value={`${formatTime(b.startTime)} – ${formatTime(b.endTime)}`}
                  />
                  <Detail
                    icon={<User2 size={14} />}
                    label="Мастер"
                    value={b.staffName}
                  />
                  {b.salonSlug && (
                    <Detail
                      icon={<MapPin size={14} />}
                      label="Салон"
                      value={b.salonSlug}
                    />
                  )}
                </dl>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-luxury-wide text-ink/45">
                    Үйлчилгээнүүд
                  </p>
                  <p className="mt-1 text-ink/80">{b.serviceNames.join(" · ")}</p>
                </div>

                <div className="mt-6 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-luxury-wide text-ink/45">
                      Нийт
                    </p>
                    <p className="font-serif text-2xl text-gold-700">
                      {formatMnt(Number(b.totalPrice))}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-[11px] uppercase tracking-luxury-wide px-3 py-1 rounded-full",
                      b.paymentStatus === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-ink/5 text-ink/60"
                    )}
                  >
                    {paymentLabel[b.paymentStatus]}
                  </span>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Detail({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-luxury-wide text-ink/45 inline-flex items-center gap-1.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-ink/80">{value}</dd>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" });
}
