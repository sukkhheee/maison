import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { ServiceSelection } from "@/components/booking/ServiceSelection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <ServiceSelection />
    </>
  );
}
