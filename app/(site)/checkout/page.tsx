import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-[clamp(20px,5vw,80px)] pt-14 pb-24 md:pt-20">
      <header className="mb-10 flex flex-col items-start gap-4">
        <p className="text-[10px] tracking-[0.18em] text-sand uppercase">
          Tu pedido
        </p>
        <h1 className="font-display text-[clamp(32px,5vw,56px)] leading-none font-light tracking-[0.02em] text-cream">
          Finalizar compra
        </h1>
        <div className="h-px w-10 bg-gold" />
      </header>

      <CheckoutForm />
    </div>
  );
}
