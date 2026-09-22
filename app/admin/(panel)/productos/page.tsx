import { Pencil, Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { DeleteProductButton } from "@/components/admin/delete-product-button";
import {
  ProductActiveCell,
  ProductPriceCell,
  ProductStockCell,
} from "@/components/admin/inline/inline-cells";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";
import { formatPrice } from "@/lib/format";
import { effectivePrice, isDiscounted } from "@/lib/pricing";
import { getAdminProducts } from "@/lib/products";
import type { Product } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Productos" };

// Si el vino está en oferta, el precio efectivo va debajo del campo (que edita el precio normal).
function SaleNote({ product }: { product: Product }) {
  if (!isDiscounted(product)) return null;
  return (
    <span className="mt-0.5 block text-right text-[11px] text-gold tabular-nums">
      Oferta: {formatPrice(effectivePrice(product))}
    </span>
  );
}

function SaleBadge({ product }: { product: Product }) {
  if (!product.isOnSale) return null;
  return (
    <Badge className="bg-gold/15 text-gold" title={product.saleLabel ?? undefined}>
      En oferta
    </Badge>
  );
}

// Menos de este número de unidades se marca como stock bajo.
const LOW_STOCK = 5;

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();

  const { q: rawQ } = await searchParams;
  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ)?.trim() || undefined;
  const rows = await getAdminProducts(q);

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-cream">Productos</h1>
          <p className="text-sm text-sand">
            {rows.length} {rows.length === 1 ? "producto" : "productos"}
            {q ? ` que coinciden con «${q}»` : ""}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className={cn(
            buttonVariants(),
            "h-10 gap-2 px-4 text-sm font-medium",
          )}
        >
          <Plus aria-hidden />
          Nuevo producto
        </Link>
      </div>

      <form role="search" className="flex flex-wrap items-center gap-2">
        <label htmlFor="q" className="sr-only">
          Buscar por nombre
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Buscar por nombre…"
          className="h-10 w-full max-w-xs border border-input bg-card px-3 text-base text-cream md:text-sm outline-none placeholder:text-stone focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25"
        />
        <Button
          type="submit"
          variant="outline"
          className="h-10 gap-2 border-input bg-card px-4"
        >
          <Search aria-hidden />
          Buscar
        </Button>
        {q && (
          <Link
            href="/admin/productos"
            className="px-2 text-sm text-sand underline underline-offset-4 hover:text-cream"
          >
            Limpiar
          </Link>
        )}
      </form>

      <div className="border border-input bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-16">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden min-[1320px]:table-cell">Categoría</TableHead>
              <TableHead className="hidden min-[1320px]:table-cell">Varietal</TableHead>
              <TableHead className="hidden text-right xl:table-cell">
                Precio
              </TableHead>
              <TableHead className="hidden text-right xl:table-cell">Stock</TableHead>
              <TableHead className="hidden xl:table-cell">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-sand"
                >
                  {q
                    ? "Ningún producto coincide con la búsqueda."
                    : "Todavía no hay productos. Creá el primero con «Nuevo producto»."}
                </TableCell>
              </TableRow>
            )}
            {rows.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative h-14 w-11 bg-muted">
                    <Image
                      src={product.imageUrl}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-contain"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium whitespace-normal text-cream">
                  {product.name}
                  <span className="block text-xs font-normal text-stone">
                    {product.line}
                    {product.vintage ? ` · ${product.vintage}` : ""}
                  </span>
                  {/* En pantallas chicas, los datos de las columnas ocultas van acá. */}
                  <span className="block text-xs font-normal text-stone min-[1320px]:hidden">
                    {product.category} · {product.varietal}
                  </span>
                  <span className="mt-2 flex flex-col items-start gap-2 font-normal xl:hidden">
                    <span className="flex flex-wrap items-start gap-x-3 gap-y-2">
                      <span className="flex flex-col items-end">
                        <ProductPriceCell
                          id={product.id}
                          name={product.name}
                          price={product.price}
                        />
                        <SaleNote product={product} />
                      </span>
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="text-[11px] tracking-wide text-stone uppercase"
                        >
                          Stock
                        </span>
                        <ProductStockCell
                          id={product.id}
                          name={product.name}
                          stock={product.stock}
                        />
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <ProductActiveCell
                        id={product.id}
                        name={product.name}
                        active={product.active}
                      />
                      <SaleBadge product={product} />
                    </span>
                  </span>
                </TableCell>
                <TableCell className="hidden min-[1320px]:table-cell">
                  {product.category}
                </TableCell>
                <TableCell className="hidden whitespace-normal min-[1320px]:table-cell">
                  {product.varietal}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <ProductPriceCell
                    id={product.id}
                    name={product.name}
                    price={product.price}
                  />
                  <SaleNote product={product} />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
                    <ProductStockCell
                      id={product.id}
                      name={product.name}
                      stock={product.stock}
                    />
                    {product.stock === 0 ? (
                      <Badge className="bg-red-500/15 text-red-200">
                        Sin stock
                      </Badge>
                    ) : product.stock < LOW_STOCK ? (
                      <Badge className="bg-amber-500/15 text-amber-300">
                        Stock bajo
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex flex-col items-start gap-1.5">
                    <ProductActiveCell
                      id={product.id}
                      name={product.name}
                      active={product.active}
                    />
                    <SaleBadge product={product} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      aria-label={`Editar ${product.name}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "border-input bg-card h-10 w-10 px-0 xl:h-7 xl:w-auto xl:px-2.5",
                      )}
                    >
                      <Pencil aria-hidden />
                      <span className="hidden xl:inline">Editar</span>
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
