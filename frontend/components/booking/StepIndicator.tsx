"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
}

interface Props {
  steps: Step[];
  current: number;
}

export function StepIndicator({ steps, current }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, i) => {
          const isDone = i < current;
          const isActive = i === current;
          return (
            <div key={step.id} className="flex-1 flex items-center last:flex-none">
              {/* Node */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1 : 0.92,
                      backgroundColor: isDone
                        ? "#C9A96A"
                        : isActive
                        ? "#111111"
                        : "#ffffff"
                    }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "h-9 w-9 rounded-full grid place-items-center text-sm font-medium border",
                      isDone
                        ? "border-gold text-ink"
                        : isActive
                        ? "border-ink text-bone"
                        : "border-ink/15 text-ink/40"
                    )}
                  >
                    {isDone ? <Check size={16} strokeWidth={3} /> : i + 1}
                  </motion.div>
                  {isActive && (
                    <motion.span
                      layoutId="step-glow"
                      className="absolute inset-0 rounded-full ring-2 ring-gold/40"
                    />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p
                    className={cn(
                      "text-[10px] uppercase tracking-luxury-wide",
                      isActive ? "text-gold-700" : "text-ink/40"
                    )}
                  >
                    Алхам {i + 1}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isActive || isDone ? "text-ink" : "text-ink/40"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="flex-1 mx-3 sm:mx-5 h-px bg-ink/10 relative overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ scaleX: isDone ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ originX: 0 }}
                    className="absolute inset-0 bg-gold-gradient"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
