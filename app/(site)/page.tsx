import { BodegaStrip } from "@/components/home/bodega-strip";
import { FeaturedWines } from "@/components/home/featured-wines";
import { Hero } from "@/components/home/hero";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { VideoSection } from "@/components/home/video-section";
import { getCatalogVarietals, getFeaturedProducts } from "@/lib/products";

// Lee los vinos destacados de la base en cada visita (no se prerenderiza en el build).
export const dynamic = "force-dynamic";

export default async function Home() {
  // Si la base no responde, el Home igual carga (sin la sección de vinos).
  const [featured, varietals] = await Promise.all([
    getFeaturedProducts(3),
    getCatalogVarietals(),
  ]).catch((error) => {
    console.error("[home] no se pudieron leer los vinos destacados", error);
    return [[], []] as const;
  });

  return (
    <div className="bg-ink text-cream">
      <Hero />
      <VideoSection />
      <FeaturedWines products={[...featured]} />
      <BodegaStrip varietalCount={varietals.length} />
      <NewsletterSection />
    </div>
  );
}
