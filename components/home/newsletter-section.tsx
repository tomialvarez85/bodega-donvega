import { NewsletterSignup } from "@/components/newsletter-signup";

export function NewsletterSection() {
  return (
    <section aria-labelledby="newsletter-title" className="border-t border-hairline">
      <div className="mx-auto max-w-[1200px] px-6 py-[clamp(64px,8vw,104px)] text-center sm:px-8">
        <div className="mx-auto mb-10 flex max-w-[560px] flex-col items-center gap-4">
          <div className="h-px w-7 bg-gold" />
          <p className="text-[11px] font-medium tracking-[0.14em] text-sand uppercase">
            Newsletter
          </p>
          <h2
            id="newsletter-title"
            className="font-display text-[clamp(28px,4vw,44px)] leading-[1.15] text-cream"
          >
            No te pierdas nada de la bodega
          </h2>
          <p className="text-sm leading-[1.75] text-sand">
            Sumate para enterarte primero de nuevos lanzamientos, promociones y
            eventos de Don Vega. Sin spam: solo novedades de la bodega, cuando
            realmente hay algo para contar.
          </p>
        </div>

        <NewsletterSignup variant="inline" className="mx-auto max-w-md" />
      </div>
    </section>
  );
}
