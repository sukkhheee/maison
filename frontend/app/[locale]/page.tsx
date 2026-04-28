import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";

/**
 * Platform landing — shown when no tenant slug is in the URL. Hero's "Book
 * now" CTA is hidden (no salon context); customers reach a real booking flow
 * via /[slug] which their salon shares with them.
 *
 * Future: turn this into a real marketing page or a salon directory.
 */
export default function PlatformHomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <section className="bg-bone py-24">
        <div className="container max-w-3xl text-center">
          <span className="eyebrow">— For salons</span>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl tracking-luxury-tight leading-[1.1]">
            Энэ бол <span className="italic gold-text">платформ</span> юм.
          </h2>
          <p className="mt-5 text-ink/60 leading-relaxed">
            Maison нь олон салоны цаг захиалгын систем. Үйлчлүүлэгчид өөрийн
            үзсэн салоны URL-аар захиалга өгдөг —{" "}
            <span className="font-mono text-sm bg-bone-200 px-1.5 py-0.5 rounded">
              /your-salon-slug
            </span>{" "}
            хэлбэрээр.
          </p>
          <p className="mt-3 text-sm text-ink/50">
            Салоны эзэн бол admin самбар-аар бүртгүүлээд өөрийн URL-аа авна.
          </p>
        </div>
      </section>
    </>
  );
}
