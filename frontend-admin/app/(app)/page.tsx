"use client";

import { useMemo } from "react";
import {
  Wallet,
  ClipboardList,
  UserPlus,
  Clock4
} from "lucide-react";
import { StatsCard, type StatAccent } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentBookings } from "@/components/dashboard/RecentBookings";
import { Skeleton } from "@/components/shared/Skeleton";
import { useApi } from "@/lib/useApi";
import { getDailyStats, getWeeklyRevenue } from "@/lib/api/admin";
import { formatMnt } from "@/lib/utils";

const ACCENTS: StatAccent[] = ["emerald", "indigo", "violet", "amber"];

export default function DashboardHome() {
  const statsQuery = useApi(() => getDailyStats(), []);
  // We share the weekly revenue fetch with the chart visually, but each card
  // computing its own trend keeps coupling minimal — small dataset, fine to refetch.
  const weeklyQuery = useApi(() => getWeeklyRevenue(), []);

  const trends = useMemo(() => {
    const values = (weeklyQuery.data ?? []).map((p) => p.revenue);
    const counts = (weeklyQuery.data ?? []).map((p) => p.bookingCount);
    return { values, counts };
  }, [weeklyQuery.data]);

  // KPI definitions, derived from server data with sensible defaults.
  const kpis = useMemo(() => {
    const stats = statsQuery.data;
    const weekly = weeklyQuery.data ?? [];
    const yesterday = weekly.length >= 2 ? weekly[weekly.length - 2].revenue : 0;
    const today = weekly.length >= 1 ? weekly[weekly.length - 1].revenue : 0;
    const yesterdayCount =
      weekly.length >= 2 ? weekly[weekly.length - 2].bookingCount : 0;
    const todayCount =
      weekly.length >= 1 ? weekly[weekly.length - 1].bookingCount : 0;

    const revPct = yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0;
    const cntPct =
      yesterdayCount > 0
        ? ((todayCount - yesterdayCount) / yesterdayCount) * 100
        : 0;

    return [
      {
        label: "Өнөөдрийн орлого",
        value: stats ? formatMnt(stats.todayRevenue) : "—",
        change: {
          percent: Math.abs(Math.round(revPct * 10) / 10),
          positive: revPct >= 0,
          vs: "өчигдөртэй харьцуулахад"
        },
        trend: trends.values.length ? trends.values : [0, 0, 0, 0, 0, 0, 0]
      },
      {
        label: "Өнөөдрийн захиалга",
        value: stats ? String(stats.todayBookingCount) : "—",
        change: {
          percent: Math.abs(Math.round(cntPct * 10) / 10),
          positive: cntPct >= 0,
          vs: "өчигдөртэй харьцуулахад"
        },
        trend: trends.counts.length ? trends.counts : [0, 0, 0, 0, 0, 0, 0]
      },
      {
        label: "Шинэ үйлчлүүлэгч",
        value: stats ? String(stats.newClientsToday) : "—",
        change: { percent: 0, positive: true, vs: "өнөөдөр" },
        trend: trends.counts.length ? trends.counts : [0, 0, 0, 0, 0, 0, 0]
      },
      {
        label: "Хүлээгдэж буй төлбөр",
        value: stats ? formatMnt(stats.pendingPayments) : "—",
        change: {
          percent: stats?.pendingPaymentCount ?? 0,
          positive: false,
          vs: `${stats?.pendingPaymentCount ?? 0} захиалга`
        },
        trend: trends.values.length ? trends.values : [0, 0, 0, 0, 0, 0, 0]
      }
    ];
  }, [statsQuery.data, weeklyQuery.data, trends]);

  const ICONS = [Wallet, ClipboardList, UserPlus, Clock4];
  const loading = statsQuery.loading || weeklyQuery.loading;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl tracking-tight">
            Сайн уу
          </h2>
          <p className="text-fg-muted mt-1 text-sm">
            Энд таны салоны өнөөдрийн товч дүгнэлт.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !statsQuery.data
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))
          : kpis.map((kpi, i) => (
              <StatsCard
                key={kpi.label}
                icon={ICONS[i]}
                label={kpi.label}
                value={kpi.value}
                change={kpi.change}
                trend={kpi.trend}
                accent={ACCENTS[i]}
                delay={i * 0.05}
              />
            ))}
      </div>

      {/* Chart + Recent bookings */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <RevenueChart />
        <RecentBookings />
      </div>
    </div>
  );
}
