export interface Master {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  specialties: string[];
  fromPrice: number;
  signature?: boolean;
}

export const masters: Master[] = [
  {
    id: "any",
    name: "Хамгийн ойрын мастер",
    title: "Авто сонголт",
    avatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
    rating: 4.9,
    reviewCount: 0,
    yearsExperience: 0,
    specialties: ["Тохиромжтой цаг олно"],
    fromPrice: 0
  },
  {
    id: "m-anu",
    name: "Анужин",
    title: "Senior Stylist",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    rating: 4.95,
    reviewCount: 412,
    yearsExperience: 8,
    specialties: ["Цусан өнгө", "Balayage", "Editorial"],
    fromPrice: 95000,
    signature: true
  },
  {
    id: "m-bilg",
    name: "Билгүүн",
    title: "Color Specialist",
    avatar:
      "https://images.unsplash.com/photo-1545996124-0501ebae84d0?auto=format&fit=crop&w=600&q=80",
    rating: 4.88,
    reviewCount: 287,
    yearsExperience: 6,
    specialties: ["Гялбаа", "Натурал шилжилт"],
    fromPrice: 80000
  },
  {
    id: "m-soyo",
    name: "Соёлмаа",
    title: "Master Artist",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    rating: 5.0,
    reviewCount: 521,
    yearsExperience: 12,
    specialties: ["Bridal", "Updo", "Editorial"],
    fromPrice: 120000,
    signature: true
  },
  {
    id: "m-tem",
    name: "Тэмүүлэн",
    title: "Barber & Cut",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviewCount: 198,
    yearsExperience: 5,
    specialties: ["Эрэгтэй тайралт", "Сахал"],
    fromPrice: 60000
  },
  {
    id: "m-ode",
    name: "Одончимэг",
    title: "Nail Artist",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
    rating: 4.92,
    reviewCount: 342,
    yearsExperience: 7,
    specialties: ["Gel art", "Couture nails"],
    fromPrice: 65000
  },
  {
    id: "m-ulm",
    name: "Уламбаяр",
    title: "Spa Therapist",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    rating: 4.95,
    reviewCount: 156,
    yearsExperience: 9,
    specialties: ["Aromatherapy", "Deep tissue"],
    fromPrice: 150000
  }
];
