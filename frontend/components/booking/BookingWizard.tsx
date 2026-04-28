"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, PartyPopper, Sparkles } from "lucide-react";
import { StepIndicator } from "./StepIndicator";
import { ServiceSelection } from "./ServiceSelection";
import { BookingCalendar } from "./BookingCalendar";
import { BookingSummary, type CustomerForm } from "./BookingSummary";
import { QpayPaymentDialog } from "./QpayPaymentDialog";
import { Button } from "@/components/ui/button";
import { type Master } from "@/lib/data/masters";
import type { ServiceItem } from "@/lib/data/services";
import { formatDuration, formatMnt } from "@/lib/utils";
import {
  createBooking,
  toLocalDateTimeString,
  type BookingResponse
} from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";

const steps = [
  { id: "service", label: "Үйлчилгээ" },
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
  const [step, setStep] = useState(0);

  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  /**
   * Service ids handed over from the landing page via sessionStorage. Read
   * once on mount, then cleared so a refresh of /book starts blank. The
   * embedded ServiceSelection picks these up via its `initialSelected` prop
   * and fires onChange after fetching the catalog, which populates
   * `selectedServices` with full ServiceItem objects.
   */
  const [pendingServiceIds, setPendingServiceIds] = useState<string[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return;
    try {
      const ids = JSON.parse(raw) as string[];
      if (Array.isArray(ids) && ids.length > 0) {
        setPendingServiceIds(ids);
      }
    } catch {
      /* ignore malformed value */
    }
    window.sessionStorage.removeItem(PENDING_KEY);
  }, []);
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
          setTimeout(() => setStep(1), 600);
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
    return <BookingConfirmed booking={confirmed} />;
  }

  return (
    <div className="bg-bone min-h-screen">
      <div className="container pt-28 pb-24">
        <div className="flex items-center justify-between gap-4 mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition"
          >
            <ArrowLeft size={16} />
            Нүүр хуудас
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
              <ServiceStep
                salonSlug={salonSlug}
                // Prefer ids carried over from the landing page if the wizard
                // hasn't built up its own selection yet; otherwise echo the
                // current state (matters when the user comes BACK to step 0).
                initialSelected={
                  selectedServices.length > 0
                    ? selectedServices.map((s) => s.id)
                    : pendingServiceIds
                }
                onChange={setSelectedServices}
                onContinue={goNext}
                totals={totals}
                count={selectedServices.length}
              />
            )}

            {step === 1 && (
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
                onBack={goBack}
              />
            )}

            {step === 2 && time && master && (
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

function ServiceStep({
  salonSlug,
  initialSelected,
  onChange,
  onContinue,
  totals,
  count
}: {
  salonSlug: string;
  initialSelected: string[];
  onChange: (s: ServiceItem[]) => void;
  onContinue: () => void;
  totals: { minutes: number; price: number };
  count: number;
}) {
  return (
    <div>
      <div className="max-w-2xl mb-8">
        <span className="eyebrow">— Алхам 1</span>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl tracking-luxury-tight">
          Үйлчилгээгээ сонгоно уу
        </h2>
        <p className="mt-2 text-ink/55">
          Олон үйлчилгээг нэг захиалгад нэгтгэх боломжтой.
        </p>
      </div>

      <ServiceSelection
        salonSlug={salonSlug}
        variant="embedded"
        initialSelected={initialSelected}
        onChange={onChange}
      />

      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="sticky bottom-4 z-30 mt-10"
          >
            <div className="glass-light rounded-2xl shadow-soft p-4 flex items-center gap-4">
              <div className="hidden sm:grid h-12 w-12 rounded-full bg-gold-gradient place-items-center text-ink">
                <Sparkles size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-luxury-wide text-ink/50">
                  Сонгосон {count} үйлчилгээ
                </p>
                <p className="font-serif text-lg sm:text-xl truncate">
                  {formatMnt(totals.price)} ·{" "}
                  <span className="text-ink/60">
                    {formatDuration(totals.minutes)}
                  </span>
                </p>
              </div>
              <Button variant="gold" onClick={onContinue}>
                Үргэлжлүүлэх
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function BookingConfirmed({ booking }: { booking: BookingResponse }) {
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
          <Button asChild variant="gold">
            <Link href="/bookings">Миний захиалгууд</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Нүүр рүү буцах</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
