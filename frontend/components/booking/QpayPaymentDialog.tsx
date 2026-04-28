"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "qrcode";
import {
  Loader2,
  X,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Smartphone,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatMnt } from "@/lib/utils";
import {
  checkPaymentStatus,
  createInvoice,
  type BankLink,
  type InvoiceResponse,
  type PaymentStatus
} from "@/lib/api/payment";
import { ApiError } from "@/lib/api/client";

const ease = [0.22, 1, 0.36, 1];
const POLL_INTERVAL_MS = 3000;

interface Props {
  open: boolean;
  bookingId: number | null;
  amount: number;
  currency?: string;
  onPaid: () => void;
  onClose: () => void;
}

export function QpayPaymentDialog({
  open,
  bookingId,
  amount,
  currency = "MNT",
  onPaid,
  onClose
}: Props) {
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<PaymentStatus>("UNPAID");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 1: when the dialog opens, ask the backend for an invoice.
  useEffect(() => {
    if (!open || !bookingId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setStatus("PENDING");
    createInvoice(bookingId)
      .then((inv) => {
        if (cancelled) return;
        setInvoice(inv);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Invoice үүсгэж чадсангүй.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, bookingId]);

  // Step 2: render the QR locally from the qr_text.
  useEffect(() => {
    if (!invoice?.qrText) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(invoice.qrText, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
      color: { dark: "#111111", light: "#FFFFFF" }
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [invoice?.qrText]);

  // Step 3: poll for payment status until PAID.
  useEffect(() => {
    if (!open || !bookingId || !invoice || status === "PAID") return;
    pollTimer.current = setInterval(async () => {
      try {
        const r = await checkPaymentStatus(bookingId);
        setStatus(r.paymentStatus);
        if (r.paymentStatus === "PAID") {
          if (pollTimer.current) clearInterval(pollTimer.current);
          // Brief celebratory pause, then close.
          setTimeout(onPaid, 1400);
        }
      } catch {
        // swallow polling errors; user can hit "Шалгах" manually
      }
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [open, bookingId, invoice, status, onPaid]);

  const manualCheck = async () => {
    if (!bookingId) return;
    try {
      const r = await checkPaymentStatus(bookingId);
      setStatus(r.paymentStatus);
      if (r.paymentStatus === "PAID") setTimeout(onPaid, 1000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Алдаа гарлаа.");
    }
  };

  const copyQrText = async () => {
    if (!invoice?.qrText) return;
    try {
      await navigator.clipboard.writeText(invoice.qrText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 12, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            onClick={(e) => e.stopPropagation()}
            className="bg-bone w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 h-10 w-10 grid place-items-center rounded-full bg-ink/5 hover:bg-ink/10 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {status === "PAID" ? (
              <PaidView amount={amount} currency={currency} />
            ) : (
              <PendingView
                loading={loading}
                error={error}
                invoice={invoice}
                qrDataUrl={qrDataUrl}
                amount={amount}
                currency={currency}
                copied={copied}
                onCopyQr={copyQrText}
                onRefresh={manualCheck}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */

function PendingView({
  loading,
  error,
  invoice,
  qrDataUrl,
  amount,
  currency,
  copied,
  onCopyQr,
  onRefresh
}: {
  loading: boolean;
  error: string | null;
  invoice: InvoiceResponse | null;
  qrDataUrl: string | null;
  amount: number;
  currency: string;
  copied: boolean;
  onCopyQr: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="grid md:grid-cols-[1fr_1.05fr]">
      {/* Left: amount + QR */}
      <div className="bg-ink text-bone p-7 sm:p-8 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-24 -left-24 h-56 w-56 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #C9A96A, transparent 60%)" }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs uppercase tracking-luxury-wide text-gold-200">
            <ShieldCheck size={14} />
            QPay-р төлөх
          </div>
          <p className="mt-3 font-serif text-4xl gold-text">
            {formatMnt(amount, currency)}
          </p>
          <p className="text-bone/60 text-sm mt-1">Захиалга #{invoice?.bookingId ?? "—"}</p>

          <div className="mt-6 bg-white rounded-2xl p-4 grid place-items-center min-h-[280px]">
            {loading ? (
              <Loader2 className="text-gold-700 animate-spin" size={32} />
            ) : error ? (
              <div className="text-center text-rose-600 text-sm flex flex-col items-center gap-2">
                <AlertCircle size={24} />
                {error}
              </div>
            ) : qrDataUrl ? (
              <Image
                src={qrDataUrl}
                alt="QPay QR code"
                width={240}
                height={240}
                unoptimized
                className="rounded-md"
              />
            ) : invoice?.qrImage ? (
              <Image
                src={`data:image/png;base64,${invoice.qrImage}`}
                alt="QPay QR code"
                width={240}
                height={240}
                unoptimized
                className="rounded-md"
              />
            ) : (
              <Loader2 className="text-gold-700 animate-spin" size={32} />
            )}
          </div>

          {invoice?.qrText && (
            <button
              onClick={onCopyQr}
              className="mt-3 w-full glass rounded-md py-2 text-xs flex items-center justify-center gap-2 hover:bg-bone/5 transition"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-gold" />
                  Хуулагдсан
                </>
              ) : (
                <>
                  <Copy size={13} />
                  QR кодыг хуулах
                </>
              )}
            </button>
          )}

          <div className="mt-5 flex items-start gap-2 text-xs text-bone/60">
            <RefreshCw size={12} className="mt-0.5 shrink-0 animate-spin-slow" />
            <span>
              Төлбөр төлсний дараа автоматаар баталгаажна. Хэрэв 30 секундын
              дараа шинэчлэгдээгүй бол доорх "Шалгах"-ыг дарна уу.
            </span>
          </div>
        </div>
      </div>

      {/* Right: bank links */}
      <div className="p-7 sm:p-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-luxury-wide text-gold-700">
          <Smartphone size={14} />
          Банкны аппликейшнаар
        </div>
        <h3 className="mt-2 font-serif text-2xl tracking-luxury-tight">
          Төлбөрөө гүйцээнэ үү
        </h3>
        <p className="mt-2 text-sm text-ink/55">
          Доорх банкны логонуудаас сонгож, апп-аа нээгээд зураасан кодоор
          шилжүүлнэ. Эсвэл мобайл банкны QR уншуулагчаар уншуулна уу.
        </p>

        <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {(invoice?.bankLinks ?? []).slice(0, 12).map((b) => (
            <BankTile key={b.name + b.link} bank={b} />
          ))}
          {!loading && (invoice?.bankLinks ?? []).length === 0 && (
            <p className="col-span-full text-xs text-ink/40">
              QR код-оор уншуулна уу.
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <Button variant="primary" onClick={onRefresh}>
            <RefreshCw size={16} />
            Төлбөр шалгах
          </Button>
          <p className="text-[11px] text-ink/40 text-center">
            SSL-р шифрлэгдсэн · QPay merchant API · v2
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function BankTile({ bank }: { bank: BankLink }) {
  return (
    <a
      href={bank.link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group rounded-xl border border-ink/10 bg-white aspect-square",
        "flex flex-col items-center justify-center gap-1.5 p-2",
        "hover:border-gold hover:shadow-soft hover:-translate-y-0.5 transition-all"
      )}
    >
      {bank.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bank.logo}
          alt={bank.name}
          className="h-8 w-8 object-contain"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gold-gradient grid place-items-center text-[10px] text-ink font-bold">
          {bank.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <span className="text-[10px] text-ink/60 text-center leading-tight group-hover:text-gold-700 transition">
        {bank.description ?? bank.name}
      </span>
    </a>
  );
}

/* -------------------------------------------------------------------------- */

function PaidView({
  amount,
  currency
}: {
  amount: number;
  currency: string;
}) {
  return (
    <div className="p-12 text-center">
      <motion.div
        initial={{ scale: 0.6, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        className="mx-auto h-20 w-20 rounded-full bg-gold-gradient grid place-items-center text-ink shadow-gold"
      >
        <CheckCircle2 size={36} />
      </motion.div>
      <h2 className="mt-6 font-serif text-3xl tracking-luxury-tight">
        Төлбөр <span className="gold-text italic">амжилттай.</span>
      </h2>
      <p className="mt-2 text-ink/60">
        {formatMnt(amount, currency)} төлбөр хүлээн авлаа.
      </p>
    </div>
  );
}
