"use client";

import { motion } from "framer-motion";

const stats = [
  { kpi: "12", label: "Шилдэг мастер" },
  { kpi: "2.4K+", label: "Сэтгэл хангалуун үйлчлүүлэгч" },
  { kpi: "4.9★", label: "Дундаж үнэлгээ" },
  { kpi: "5", label: "Жилийн туршлага" }
];

export function Stats() {
  return (
    <section className="bg-ink text-bone py-16 sm:py-20">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-bone/10 rounded-2xl overflow-hidden">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-ink p-8 sm:p-10 text-center"
            >
              <p className="font-serif text-4xl sm:text-5xl gold-text">
                {s.kpi}
              </p>
              <p className="mt-2 text-xs uppercase tracking-luxury-wide text-bone/60">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
