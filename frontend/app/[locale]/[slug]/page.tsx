import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { ServiceSelection } from "@/components/booking/ServiceSelection";

/**
 * Public-facing landing for a single salon. Catalog (services + masters) is
 * fetched client-side from `/api/v1/public/salons/{slug}/...` so the same
 * static page works for every tenant without per-salon prerendering.
 */
export default function SalonHomePage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  return (
    <>
      <Hero salonSlug={params.slug} />
      <Stats />
      <ServiceSelection salonSlug={params.slug} />
    </>
  );
}
