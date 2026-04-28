export type AdminBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type AdminPaymentStatus = "PAID" | "UNPAID";

export interface AdminBooking {
  id: number;
  staffId: string;
  clientName: string;
  clientPhone: string;
  service: string;
  start: Date;
  end: Date;
  status: AdminBookingStatus;
  paymentStatus: AdminPaymentStatus;
  totalPrice: number;
}

/**
 * Hard-coded slots used by the calendar demo. start/end are expressed in
 * decimal hours (e.g. 9.5 = 09:30) and combined with the requested date.
 */
const SEED: Array<{
  staffId: string;
  start: number;
  end: number;
  client: string;
  phone: string;
  svc: string;
  status: AdminBookingStatus;
  paid: AdminPaymentStatus;
  price: number;
}> = [
  { staffId: "m-anu", start: 9, end: 10.25, client: "Б. Эрдэнэ", phone: "9911 0011", svc: "Signature Cut & Style", status: "CONFIRMED", paid: "PAID", price: 95_000 },
  { staffId: "m-anu", start: 11, end: 14, client: "Г. Сараа", phone: "9911 0012", svc: "Balayage & Gloss", status: "CONFIRMED", paid: "PAID", price: 380_000 },
  { staffId: "m-anu", start: 15, end: 16.25, client: "Д. Туяа", phone: "9911 0013", svc: "Cut & Style", status: "PENDING", paid: "UNPAID", price: 95_000 },
  { staffId: "m-anu", start: 17, end: 19, client: "Х. Мөнхзул", phone: "9911 0014", svc: "Keratin Restoration", status: "CONFIRMED", paid: "PAID", price: 240_000 },

  { staffId: "m-bilg", start: 10, end: 13, client: "С. Болор", phone: "9911 0021", svc: "Color Restoration", status: "CONFIRMED", paid: "PAID", price: 240_000 },
  { staffId: "m-bilg", start: 14, end: 15, client: "Ц. Дэлгэр", phone: "9911 0022", svc: "Quick Color", status: "CANCELLED", paid: "UNPAID", price: 80_000 },
  { staffId: "m-bilg", start: 16, end: 18, client: "Б. Хулан", phone: "9911 0023", svc: "Highlights", status: "CONFIRMED", paid: "PAID", price: 220_000 },

  { staffId: "m-soyo", start: 9.5, end: 11, client: "Ж. Энхжин", phone: "9911 0031", svc: "Bridal Updo", status: "CONFIRMED", paid: "PAID", price: 320_000 },
  { staffId: "m-soyo", start: 13, end: 14.25, client: "А. Намуун", phone: "9911 0032", svc: "Editorial Style", status: "CONFIRMED", paid: "PAID", price: 250_000 },
  { staffId: "m-soyo", start: 15.5, end: 17, client: "О. Цэвэлмаа", phone: "9911 0033", svc: "Updo & Makeup", status: "PENDING", paid: "UNPAID", price: 280_000 },

  { staffId: "m-tem", start: 10.5, end: 11.25, client: "Б. Ариунаа", phone: "9911 0041", svc: "Барбер тайралт", status: "CONFIRMED", paid: "PAID", price: 60_000 },
  { staffId: "m-tem", start: 14.5, end: 15.5, client: "Х. Бат", phone: "9911 0042", svc: "Сахал засуулах", status: "PENDING", paid: "UNPAID", price: 40_000 },
  { staffId: "m-tem", start: 16, end: 17, client: "Г. Анхбаяр", phone: "9911 0043", svc: "Cut + Beard", status: "CONFIRMED", paid: "PAID", price: 95_000 },

  { staffId: "m-ode", start: 11, end: 12, client: "Г. Оюун", phone: "9911 0051", svc: "Couture Manicure", status: "CONFIRMED", paid: "PAID", price: 65_000 },
  { staffId: "m-ode", start: 14, end: 15.5, client: "Н. Энхтуяа", phone: "9911 0052", svc: "Gel Art", status: "CONFIRMED", paid: "PAID", price: 95_000 },
  { staffId: "m-ode", start: 17, end: 18.5, client: "Б. Сувд", phone: "9911 0053", svc: "Manicure + Pedicure", status: "PENDING", paid: "UNPAID", price: 130_000 },

  { staffId: "m-ulm", start: 10, end: 11.5, client: "Б. Цолмон", phone: "9911 0061", svc: "Maison Spa Ritual", status: "CONFIRMED", paid: "PAID", price: 220_000 },
  { staffId: "m-ulm", start: 13, end: 14.25, client: "Д. Гэрэлт-Од", phone: "9911 0062", svc: "Aromatherapy", status: "COMPLETED", paid: "PAID", price: 180_000 },
  { staffId: "m-ulm", start: 16, end: 17.5, client: "О. Бямбасүрэн", phone: "9911 0063", svc: "Deep Tissue", status: "PENDING", paid: "UNPAID", price: 180_000 }
];

export function getBookingsForDate(date: Date): AdminBooking[] {
  return SEED.map((s, i) => {
    const start = new Date(date);
    start.setHours(Math.floor(s.start), Math.round((s.start % 1) * 60), 0, 0);
    const end = new Date(date);
    end.setHours(Math.floor(s.end), Math.round((s.end % 1) * 60), 0, 0);
    return {
      id: 1000 + i,
      staffId: s.staffId,
      clientName: s.client,
      clientPhone: "+976 " + s.phone,
      service: s.svc,
      start,
      end,
      status: s.status,
      paymentStatus: s.paid,
      totalPrice: s.price
    };
  });
}
