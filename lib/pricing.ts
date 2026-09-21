// Precio efectivo de un vino: el de oferta si está en oferta y realmente rebaja, si no el normal.
// Es el único lugar que decide esto: lo usan las páginas, el carrito y el checkout.

type Priced = {
  price: string | number;
  isOnSale: boolean;
  salePrice: string | number | null;
};

/** ¿Está en oferta con un precio promocional válido (positivo y menor al precio normal)? */
export function isDiscounted(product: Priced) {
  if (!product.isOnSale || product.salePrice == null) return false;
  const regular = Number(product.price);
  const sale = Number(product.salePrice);
  return regular > 0 && sale > 0 && sale < regular;
}

/** Lo que se cobra por una botella. */
export function effectivePrice(product: Priced) {
  return isDiscounted(product)
    ? Number(product.salePrice)
    : Number(product.price);
}
