import { formatPrice } from "@/lib/format";
import { effectivePrice, isDiscounted } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type PricedProduct = {
  price: string;
  isOnSale: boolean;
  salePrice: string | null;
  saleLabel: string | null;
};

const styles = {
  // Fichas del catálogo, del Home y de la promociones.
  card: {
    price: "font-display text-xl font-light text-cream",
    old: "text-xs text-stone",
    label: "text-sm",
  },
  // Ficha de producto.
  hero: {
    price:
      "font-display text-5xl leading-none font-bold tracking-[-0.02em] text-cream",
    old: "text-xl text-stone",
    label: "text-lg",
  },
} as const;

// Precio de un vino: si está en oferta, el precio promocional va al frente y el anterior
// queda tachado en un tono apagado; la etiqueta ("Verano 2026") va en cursiva dorada, en
// minúsculas y sin adornos: se lee como una nota, no como un cartel.
export function ProductPrice({
  product,
  variant = "card",
  className,
}: {
  product: PricedProduct;
  variant?: keyof typeof styles;
  className?: string;
}) {
  const s = styles[variant];
  const current = effectivePrice(product);

  if (current <= 0) {
    return (
      <span className={cn(s.price, "italic", className)}>A confirmar</span>
    );
  }

  if (!isDiscounted(product)) {
    return (
      <span className={cn(s.price, "tabular-nums", className)}>
        {formatPrice(current)}
      </span>
    );
  }

  return (
    <span className={cn("flex flex-col items-start gap-0.5", className)}>
      {product.saleLabel && (
        <span className={cn("font-display text-gold italic", s.label)}>
          {product.saleLabel}
        </span>
      )}
      <span className="flex items-baseline gap-2.5">
        <span className="sr-only">Precio de oferta:</span>
        <span className={cn(s.price, "tabular-nums")}>
          {formatPrice(current)}
        </span>
        <span className="sr-only">Precio anterior:</span>
        <s className={cn(s.old, "tabular-nums")}>
          {formatPrice(product.price)}
        </s>
      </span>
    </span>
  );
}
