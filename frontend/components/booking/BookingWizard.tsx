"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CalendarCheck2, Loader2, PartyPopper } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { StepIndicator } from "./StepIndicator";
import { BookingCalendar } from "./BookingCalendar";
import { BookingSummary, type CustomerForm } from "./BookingSummary";
import { QpayPaymentDialog } from "./QpayPaymentDialog";
import { Button } from "@/components/ui/button";
import { type Master } from "@/lib/data/masters";
import type { ServiceItem } from "@/lib/data/services";
import { fetchServices } from "@/lib/api/catalog";
import {
  createBooking,
  toLocalDateTimeString,
  type BookingResponse
} from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";

const steps = [
  { id: "calendar", label: "Мастер & цаг" },
  { id: "confirm", label: "Баталгаажуулалт" }
];

const ease = [0.22, 1, 0.36, 1];

interface Props {
  /** Tenant slug from the URL — this booking is scoped to that salon. */
  salonSlug: string;
}

/** sessionStorage key the salon landing page uses to hand off selected services. */
const PENDING_KEY = "salonbook.pending-services";

export function BookingWizard({ salonSlug }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  /**
   * Hydration state for the service handoff. We always arrive here with a list
   * of service ids in sessionStorage (the landing page's "Continue" button is
   * the only legitimate way in); fetching the catalog and matching ids gives us
   * full ServiceItem objects so totals + the summary render correctly.
   *
   * If there is no handoff (someone typed /book directly), we bounce back to
   * the salon landing page so they can pick services first.
   */
  const [hydrating, setHydrating] = useState(true);
  const [hydrationError, setHydrationError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    let ids: string[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) ids = parsed;
      } catch {
        /* ignore malformed value */
      }
      window.sessionStorage.removeItem(PENDING_KEY);
    }
    if (ids.length === 0) {
      // Nothing to book — send the customer to the salon landing page so they
      // can pick services. We use replace to keep the back button sane.
      router.replace(`/${salonSlug}`);
      return;
    }
    let cancelled = false;
    fetchServices(salonSlug)
      .then((all) => {
        if (cancelled) return;
        const picked = all.filter((s) => ids.includes(s.id));
        if (picked.length === 0) {
          router.replace(`/${salonSlug}`);
          return;
        }
        setSelectedServices(picked);
        setHydrating(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setHydrationError(e?.message ?? "Үйлчилгээний жагсаалтыг ачаалж чадсангүй.");
        setHydrating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [salonSlug, router]);

  // Master is null until BookingCalendar fetches the salon's staff and the
  // user picks (or auto-selects) one.
  const [master, setMaster] = useState<Master | null>(null);
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [time, setTime] = useState<string | null>(null);

  const [customer, setCustomer] = useState<CustomerForm>({
    name: "",
    phone: "",
    email: ""
  });

  // Auto-fill the contact form from the signed-in user's profile so customers
  // don't have to retype name + email on every booking.
  useEffect(() => {
    if (!user) return;
    setCustomer((prev) => ({
      name: prev.name || user.fullName,
      phone: prev.phone,
      email: prev.email || user.email
    }));
  }, [user]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<BookingResponse | null>(null);
  // After a booking is created we open the QPay dialog. Confirmation screen
  // appears only once the dialog reports PAID.
  const [pendingBooking, setPendingBooking] = useState<BookingResponse | null>(null);

  const totals = useMemo(() => {
    const minutes = selectedServices.reduce((a, s) => a + s.durationMinutes, 0);
    const price = selectedServices.reduce((a, s) => a + s.price, 0);
    return { minutes, price };
  }, [selectedServices]);

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleConfirm = async () => {
    if (!time || !master) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createBooking(salonSlug, {
        staffExternalId: master.id,
        serviceExternalIds: selectedServices.map((s) => s.id),
        startTime: toLocalDateTimeString(date, time),
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          email: customer.email.trim() || undefined
        }
      });
      // Booking created — now open QPay dialog. The confirmation screen only
      // shows AFTER payment lands (or the user closes the dialog).
      setPendingBooking(res);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "BOOKING_CONFLICT") {
          setSubmitError(
            "Сонгосон цаг яг одоо өөр захиалгатай давхцлаа. Өөр цаг сонгож үргэлжлүүлнэ үү."
          );
          // Send the user back to the calendar step with cleared time so they can repick.
          setTime(null);
          setTimeout(() => setStep(0), 600);
        } else if (err.code === "OUTSIDE_WORKING_HOURS") {
          setSubmitError("Энэ мастерын ажлын цагт энэ цаг багтахгүй байна.");
        } else {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError("Гэнэтийн алдаа гарлаа. Дахин оролдоно уу.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return <BookingConfirmed booking={confirmed} signedIn={!!user} />;
  }

  if (hydrating) {
    return (
      <div className="bg-bone min-h-[100svh] grid place-items-center">
        <Loader2 className="animate-spin text-ink/40" size={28} />
      </div>
    );
  }

  if (hydrationError) {
    return (
      <div className="bg-bone min-h-[100svh] grid place-items-center px-4">
        <div className="max-w-md text-center">
          <p className="text-rose-700">{hydrationError}</p>
          <Button asChild variant="gold" className="mt-6">
            <Link href={`/${salonSlug}`}>Үйлчилгээ сонгох</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bone min-h-screen">
      <div className="container pt-28 pb-24">
        <div className="flex items-center justify-between gap-4 mb-10">
          <Link
            href={`/${salonSlug}`}
            className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition"
          >
            <ArrowLeft size={16} />
            Үйлчилгээ сонгох рүү буцах
          </Link>
        </div>

        <div className="mb-12">
          <StepIndicator steps={steps} current={step} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease }}
          >
            {step === 0 && (
              <BookingCalendar
                salonSlug={salonSlug}
                selectedServices={selectedServices}
                master={master}
                date={date}
                time={time}
                onChange={({ master: m, date: d, time: t }) => {
                  setMaster(m);
                  setDate(d);
                  setTime(t);
                }}
                onContinue={goNext}
                // No previous wizard step — "Back" jumps the customer to the
                // salon landing page so they can re-pick services.
                onBack={() => router.push(`/${salonSlug}`)}
              />
            )}

            {step === 1 && time && master && (
              <BookingSummary
                services={selectedServices}
                master={master}
                date={date}
                time={time}
                customer={customer}
                onCustomerChange={setCustomer}
                submitting={submitting}
                errorMessage={submitError}
                onBack={goBack}
                onConfirm={handleConfirm}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <QpayPaymentDialog
        open={pendingBooking !== null}
        bookingId={pendingBooking?.id ?? null}
        amount={pendingBooking?.totalPrice ?? totals.price}
        currency={pendingBooking?.currency ?? "MNT"}
        onPaid={() => {
          if (pendingBooking) setConfirmed(pendingBooking);
          setPendingBooking(null);
        }}
        onClose={() => {
          // User dismissed the QR — keep the booking but show the confirmation
          // screen anyway; they can pay later via "Миний захиалгууд".
          if (pendingBooking) setConfirmed(pendingBooking);
          setPendingBooking(null);
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function BookingConfirmed({
  booking,
  signedIn
}: {
  booking: BookingResponse;
  signedIn: boolean;
}) {
  return (
    <div className="bg-bone min-h-[100svh] grid place-items-center px-4 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0.6, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 16 }}
          className="mx-auto h-20 w-20 rounded-full bg-gold-gradient grid place-items-center text-ink shadow-gold"
        >
          <PartyPopper size={32} />
        </motion.div>

        <h2 className="mt-8 font-serif text-4xl tracking-luxury-tight">
          Захиалга <span className="gold-text italic">бэлэн.</span>
        </h2>
        <p className="mt-3 text-ink/60 leading-relaxed">
          Захиалгын дугаар <strong>#{booking.id}</strong> үүслээ. Бид таны
          имэйл рүү баталгаажуулалт илгээлээ. Захиалгын өдрийн өмнө 24 цаг
          гэхэд танд сануулга очно.
        </p>

        <div className="gold-divider my-8" />

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {signedIn ? (
            <Button asChild variant="gold">
              <Link href="/bookings" className="inline-flex items-center gap-2">
                <CalendarCheck2 size={16} />
                Миний захиалгууд
              </Link>
            </Button>
          ) : (
            <Button asChild variant="gold">
              <Link href="/login">Захиалгаа хадгалахын тулд нэвтрэх</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/">Нүүр рүү буцах</Link>
          </Button>
        </div>

        {!signedIn && (
          <p className="mt-6 text-xs text-ink/45 leading-relaxed">
            Нэвтэрсэн тохиолдолд таны бүх захиалгыг нэг дороос харах боломжтой
            болно.
          </p>
        )}
      </motion.div>
    </div>
  );
}
