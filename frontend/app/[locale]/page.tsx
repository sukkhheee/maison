import { SalonDirectory } from "@/components/landing/SalonDirectory";

/**
 * Root path — shows the directory of every active salon on the platform.
 * Customers click into one to reach `/[slug]` for that salon's booking
 * surface.
 */
export default function HomePage() {
  return <SalonDirectory />;
}
