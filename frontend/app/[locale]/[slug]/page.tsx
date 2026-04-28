import { SalonHeader } from "@/components/landing/SalonHeader";
import { ServiceSelection } from "@/components/booking/ServiceSelection";

/**
 * Public-facing landing for a single salon. Compact salon-specific header +
 * the service selection grid. Catalog (services) is fetched client-side from
 * `/api/v1/public/salons/{slug}/services` so the same static page works for
 * every tenant without per-salon prerendering.
 */
export default function SalonHomePage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  return (
    <>
      <SalonHeader salonSlug={params.slug} />
      <ServiceSelection salonSlug={params.slug} />
    </>
  );
}
