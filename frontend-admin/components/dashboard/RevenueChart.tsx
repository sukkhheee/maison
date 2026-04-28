"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps
} from "recharts";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { getWeeklyRevenue } from "@/lib/api/admin";
import { useApi } from "@/lib/useApi";
import { Skeleton } from "@/components/shared/Skeleton";
import { cn, formatMnt, formatMntCompact } from "@/lib/utils";

const GOLD = "#C9A96A";
const SHORT_DAY = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];
const FULL_DAY = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];

interface ChartPoint {
  day: string;
  fullDay: string;
  value: number;
  bookings: number;
}

export function RevenueChart() {
  const { data, loading, error } = useApi(() => getWeeklyRevenue(), []);

  const chartData = useMemo<ChartPoint[]>(
    () =>
      (data ?? []).map((p) => {
        const d = new Date(p.date);
        return {
          day: SHORT_DAY[d.getDay()],
          fullDay: FULL_DAY[d.getDay()],
          value: p.revenue,
          bookings: p.bookingCount
        };
      }),
    [data]
  );

  const totalRevenue = chartData.reduce((a, p) => a + p.value, 0);
  const totalBookings = chartData.reduce((a, p) => a + p.bookings, 0);

  // Quick trend: last 3 days vs first 3 days within the 7-day window.
  const change = useMemo(() => {
    if (chartData.length < 6) return null;
    const earlySum = chartData.slice(0, 3).reduce((a, p) => a + p.value, 0);
    const lateSum = chartData.slice(-3).reduce((a, p) => a + p.value, 0);
    if (earlySum === 0) return null;
    return ((lateSum - earlySum) / earlySum) * 100;
  }, [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card p-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-fg-muted uppercase tracking-wider">
            <TrendingUp size={12} className="text-accent" />
            7 хоногийн орлого
          </div>
          {loading && !data ? (
            <Skeleton className="h-9 w-44 mt-2" />
          ) : (
            <p className="font-serif text-3xl tracking-tight mt-2 tabular-nums">
              {formatMnt(totalRevenue)}
            </p>
          )}
          <p className="text-xs text-fg-muted mt-1">
            {totalBookings} захиалга · сүүлийн 7 хоног
          </p>
        </div>

        {change !== null && (
          <div className="text-right">
            <div
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                change >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              )}
            >
              {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {change >= 0 ? "+" : ""}
              {change.toFixed(1)}%
            </div>
            <p className="text-xs text-fg-muted mt-1.5">7 хоногийн чиг хандлага</p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-[260px] -ml-3">
        {error ? (
          <div className="h-full grid place-items-center text-sm text-rose-600 dark:text-rose-400">
            {error.message}
          </div>
        ) : loading && chartData.length === 0 ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(127,127,127,0.18)" />
              <XAxis
                dataKey="day"
                stroke="rgba(127,127,127,0.7)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(127,127,127,0.7)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v) => formatMntCompact(v as number)}
              />

              <Tooltip
                cursor={{ stroke: GOLD, strokeWidth: 1, strokeDasharray: "4 4" }}
                content={<RevenueTooltip />}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke={GOLD}
                strokeWidth={2.5}
                fill="url(#revenue-fill)"
                dot={{ r: 4, fill: GOLD, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: GOLD, stroke: "white", strokeWidth: 2 }}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

function RevenueTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as ChartPoint;
  return (
    <div className="bg-surface border border-border rounded-md p-3 shadow-soft text-xs min-w-[140px]">
      <p className="text-fg-muted">{point.fullDay}</p>
      <p className="font-serif text-base mt-0.5 text-accent">
        {formatMnt(point.value)}
      </p>
      <p className="text-[10px] text-fg-muted mt-0.5 uppercase tracking-wider">
        {point.bookings} захиалга
      </p>
    </div>
  );
}
