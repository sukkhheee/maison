import { BookingWizard } from "@/components/booking/BookingWizard";

export default function BookPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  return <BookingWizard salonSlug={params.slug} />;
}
