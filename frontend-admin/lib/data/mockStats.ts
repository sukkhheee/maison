export interface RevenuePoint {
  day: string;
  fullDay: string;
  value: number;
  bookings: number;
}

/** 7 хоногийн орлогын мэдээлэл — даваа → ням */
export const weeklyRevenue: RevenuePoint[] = [
  { day: "Да", fullDay: "Даваа",     value: 1_240_000, bookings: 14 },
  { day: "Мя", fullDay: "Мягмар",    value: 1_580_000, bookings: 17 },
  { day: "Лх", fullDay: "Лхагва",    value: 1_320_000, bookings: 15 },
  { day: "Пү", fullDay: "Пүрэв",     value: 1_780_000, bookings: 19 },
  { day: "Ба", fullDay: "Баасан",    value: 2_100_000, bookings: 22 },
  { day: "Бя", fullDay: "Бямба",     value: 2_640_000, bookings: 28 },
  { day: "Ня", fullDay: "Ням",       value: 2_160_000, bookings: 19 }
];

export const totalWeekRevenue = weeklyRevenue.reduce((a, p) => a + p.value, 0);
export const totalWeekBookings = weeklyRevenue.reduce((a, p) => a + p.bookings, 0);

export interface StatsKpi {
  label: string;
  value: string;
  rawValue: number;
  change: { percent: number; positive: boolean; vs: string };
  trend: number[];
}

export const kpis: StatsKpi[] = [
  {
    label: "Өнөөдрийн орлого",
    value: "2,160,000₮",
    rawValue: 2_160_000,
    change: { percent: 12.4, positive: true, vs: "өчигдөртэй харьцуулахад" },
    trend: [1.24, 1.58, 1.32, 1.78, 2.1, 2.64, 2.16]
  },
  {
    label: "Нийт захиалга",
    value: "19",
    rawValue: 19,
    change: { percent: 5.6, positive: true, vs: "7 хоногийн дундаж" },
    trend: [14, 17, 15, 19, 22, 28, 19]
  },
  {
    label: "Шинэ үйлчлүүлэгч",
    value: "8",
    rawValue: 8,
    change: { percent: 11.1, positive: false, vs: "өнгөрсөн долоо хоног" },
    trend: [12, 9, 7, 10, 13, 14, 8]
  },
  {
    label: "Хүлээгдэж буй төлбөр",
    value: "315,000₮",
    rawValue: 315_000,
    change: { percent: 8.0, positive: false, vs: "5 захиалга" },
    trend: [180, 220, 250, 200, 290, 310, 315]
  }
];
