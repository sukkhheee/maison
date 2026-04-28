export type ServiceCategory =
  | "hair"
  | "color"
  | "nails"
  | "skin"
  | "spa";

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: "MNT";
  category: ServiceCategory;
  /** Unsplash image for visual hint */
  image: string;
  signature?: boolean;
}

export const categories: { id: ServiceCategory | "all"; label: string }[] = [
  { id: "all", label: "Бүгд" },
  { id: "hair", label: "Үс" },
  { id: "color", label: "Будалт" },
  { id: "nails", label: "Хумс" },
  { id: "skin", label: "Арьс" },
  { id: "spa", label: "Спа" }
];

export const services: ServiceItem[] = [
  {
    id: "svc-signature-cut",
    name: "Signature Cut & Style",
    description:
      "Нүүрний хэлбэрт тохирсон тайралт, мэргэжлийн стайлинг — Maison-ы тогтсон гарын үсэг.",
    durationMinutes: 75,
    price: 95000,
    currency: "MNT",
    category: "hair",
    signature: true,
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "svc-balayage",
    name: "Balayage & Gloss",
    description:
      "Нарийн гар хийцийн будалт, гялбаа нэмэгдүүлэх gloss — байгалийн өнгөний шилжилттэй.",
    durationMinutes: 180,
    price: 380000,
    currency: "MNT",
    category: "color",
    signature: true,
    image:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "svc-keratin",
    name: "Keratin Restoration",
    description:
      "Гэмтсэн үсийг сэргээх, гялалзуулах кератин процедур.",
    durationMinutes: 120,
    price: 240000,
    currency: "MNT",
    category: "hair",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "svc-manicure-gel",
    name: "Couture Gel Manicure",
    description: "Урт удаан өнгөтэй гель будалт, нарийн нямбай зураас.",
    durationMinutes: 60,
    price: 65000,
    currency: "MNT",
    category: "nails",
    image:
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "svc-facial",
    name: "Radiance Facial",
    description: "Гэрэлтэх арьс, чийгшил болон lifting эффект.",
    durationMinutes: 75,
    price: 180000,
    currency: "MNT",
    category: "skin",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "svc-spa-ritual",
    name: "Maison Spa Ritual",
    description:
      "90 минутын бүрэн релакс — массаж, аромотерапи, цайны зан үйл.",
    durationMinutes: 90,
    price: 220000,
    currency: "MNT",
    category: "spa",
    signature: true,
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80"
  }
];
