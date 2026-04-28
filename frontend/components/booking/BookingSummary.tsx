"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  ShieldCheck,
  User2,
  Loader2,
  AlertCircle
} from "lucide-react";
import type { ServiceItem } from "@/lib/data/services";
import type { Master } from "@/lib/data/masters";
import { Button } from "@/components/ui/button";
import { cn, formatDuration, formatMnt } from "@/lib/utils";
import { monthName } from "@/lib/data/slots";

export interface CustomerForm {
  name: string;
  phone: string;
  email: string;
}

interface Props {
  services: ServiceItem[];
  master: Master;
  date: Date;
  time: string;
  customer: CustomerForm;
  onCustomerChange: (next: CustomerForm) => void;
  submitting?: boolean;
  errorMessage?: string | null;
  onBack: () => void;
  onConfirm: () => void;
}

export function BookingSummary({
  services,
  master,
  date,
  time,
  customer,
  onCustomerChange,
  submitting = false,
  errorMessage = null,
  onBack,
  onConfirm
}: Props) {
  const totalMinutes = services.reduce((a, s) => a + s.durationMinutes, 0);
  const totalPrice = services.reduce((a, s) => a + s.price, 0);

  const [h, m] = time.split(":").map(Number);
  const end = new Date(date);
  end.setHours(h, m + totalMinutes);
  const endTime = `${String(end.getHours()).padStart(2, "0")}:${String(
    end.getMinutes()
  ).padStart(2, "0")}`;

  const customerComplete =
    customer.name.trim().length >= 2 && customer.phone.trim().length >= 6;

  const setField =
    (k: keyof CustomerForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onCustomerChange({ ...customer, [k]: e.target.value });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid lg:grid-cols-[1.4fr_1fr] gap-8"
    >
      {/* Left card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-ink/8 shadow-soft">
        <span className="eyebrow">— Захиалга баталгаажуулах</span>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-luxury-tight">
          Бүх зүйл бэлэн.
        </h2>
        <p className="mt-2 text-ink/55">
          Доорх мэдээллийг шалгаад баталгаажуулна уу.
        </p>

        {/* Master row */}
        <div className="mt-8 flex items-center gap-4 p-4 rounded-xl bg-bone-200/50">
          <div className="relative h-16 w-16 rounded-full overflow-hidden ring-2 ring-gold/40">
            <Image src={master.avatar} alt={master.name} fill sizes="64px" className="object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-luxury-wide text-ink/40">
              Таны мастер
            </p>
            <p className="font-serif text-xl">{master.name}</p>
            <p className="text-sm text-ink/55">{master.title}</p>
          </div>
          <User2 size={20} className="text-gold-700" />
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <InfoTile
            icon={<CalendarDays size={18} className="text-gold-700" />}
            label="Огноо"
            value={`${monthName(date)}, ${date.getDate()}`}
          />
          <InfoTile
            icon={<Clock size={18} className="text-gold-700" />}
            label="Цаг"
            value={`${time} – ${endTime}`}
          />
          <InfoTile
            icon={<MapPin size={18} className="text-gold-700" />}
            label="Байршил"
            value="Maison · Чингэлтэй, УБ"
          />
          <InfoTile
            icon={<ShieldCheck size={18} className="text-gold-700" />}
            label="Цуцлах"
            value="24 цагийн өмнө үнэгүй"
          />
        </div>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-luxury-wide text-ink/40 mb-3">
            Үйлчилгээнүүд
          </p>
          <ul className="divide-y divide-ink/5">
            {services.map((s) => (
              <li key={s.id} className="py-3 flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0">
                  <Image src={s.image} alt={s.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{s.name}</p>
                  <p className="text-xs text-ink/50">{formatDuration(s.durationMinutes)}</p>
                </div>
                <span className="font-serif text-lg">{formatMnt(s.price)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer form */}
        <div className="mt-8">
          <p className="text-xs uppercase tracking-luxury-wide text-ink/40 mb-3">
            Холбоо барих мэдээлэл
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Нэр"
              required
              value={customer.name}
              onChange={setField("name")}
              placeholder="Бат-Эрдэнэ"
            />
            <Field
              label="Утас"
              required
              value={customer.phone}
              onChange={setField("phone")}
              placeholder="+976 9900 0000"
              type="tel"
            />
            <div className="sm:col-span-2">
              <Field
                label="Имэйл"
                value={customer.email}
                onChange={setField("email")}
                placeholder="you@example.com"
                type="email"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right card — light editorial style to match the rest of the page */}
      <aside className="bg-white text-ink rounded-2xl p-6 sm:p-8 self-start sticky top-24 overflow-hidden relative border border-ink/8 shadow-soft">
        <div
          aria-hidden
          className="absolute -top-32 -right-32 h-64 w-64 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(201,169,106,0.5), transparent 60%)" }}
        />
        <div className="relative">
          <p className="eyebrow">— Нийт</p>
          <p className="mt-2 font-serif text-5xl gold-text">{formatMnt(totalPrice)}</p>
          <p className="text-ink/55 text-sm mt-1">{formatDuration(totalMinutes)} үргэлжлэх</p>

          <div className="my-6 gold-divider" />

          <div className="space-y-2 text-sm">
            <Row label="Үйлчилгээ" value={formatMnt(totalPrice)} />
            <Row label="Үйлчилгээний хураамж" value={formatMnt(0)} />
            <Row label="Хямдрал" value="—" muted />
          </div>

          <div className="my-6 gold-divider" />

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 flex items-start gap-2"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <p className="text-xs text-ink/55 leading-relaxed">
            "Баталгаажуулах" товчийг дарснаар та манай{" "}
            <a className="text-gold-700 underline" href="#">үйлчилгээний нөхцөл</a>
            -ийг хүлээн зөвшөөрч байна.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Button
              variant="gold"
              size="lg"
              disabled={submitting || !customerComplete}
              onClick={onConfirm}
              className={cn((submitting || !customerComplete) && "opacity-60")}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Илгээж байна…
                </>
              ) : (
                "Баталгаажуулах"
              )}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onBack}
              disabled={submitting}
            >
              Буцаж засах
            </Button>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-ink/50">
            <ShieldCheck size={14} className="text-gold-700" />
            QPay-р баталгаажсан төлбөр · SSL шифрлэгдсэн
          </div>
        </div>
      </aside>
    </motion.div>
  );
}

function Field({
  label,
  required,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-luxury-wide text-ink/50">
        {label} {required && <span className="text-gold-700">*</span>}
      </span>
      <input
        {...rest}
        className={cn(
          "mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm",
          "focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30",
          "placeholder:text-ink/30 transition"
        )}
      />
    </label>
  );
}

function InfoTile({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-ink/8 p-4 flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-luxury-wide text-ink/40">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink/55">{label}</span>
      <span className={muted ? "text-ink/35" : "text-ink"}>{value}</span>
    </div>
  );
}
