"use server";

import { and, eq, isNull, lt, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { combos, experiences, newsletterSubscribers, products } from "@/lib/schema";
import { isUuid } from "@/lib/validation/product";
import {
  parsePrice,
  parseStock,
  type InlineResult,
  type PriceInlineInput,
  type ProductInlineInput,
} from "@/lib/validation/inline";

// Edición en línea de las tablas del admin: cada acción cambia UN solo campo del registro.
// Son endpoints públicos como toda Server Action: cada una re-verifica la sesión y repite la
// validación del navegador, que nunca es la que manda.

const invalid = (message: string): InlineResult<never> => ({
  ok: false,
  kind: "invalid",
  message,
});
const failed = (message: string): InlineResult<never> => ({
  ok: false,
  kind: "error",
  message,
});

const BAD_REQUEST = "No se pudo guardar: datos inválidos.";

async function prepare(id: string) {
  await requireAdmin();
  return isUuid(id);
}

// ---------------------------------------------------------------------------------------------
// Productos: precio, stock y estado
// ---------------------------------------------------------------------------------------------

export async function updateProductField(
  id: string,
  input: ProductInlineInput,
): Promise<InlineResult<string | boolean>> {
  if (!(await prepare(id))) return failed("Producto inválido.");

  try {
    if (input.field === "price") {
      if (typeof input.value !== "string") return failed(BAD_REQUEST);
      const parsed = parsePrice(input.value, { min: "zero" });
      if (!parsed.ok) return invalid(parsed.error);

      // Un vino en oferta necesita un precio normal mayor al de oferta. La condición va en el
      // mismo UPDATE para que no haya carrera con una edición de la oferta.
      const updated = await db
        .update(products)
        .set({ price: parsed.value })
        .where(
          and(
            eq(products.id, id),
            or(
              eq(products.isOnSale, false),
              isNull(products.salePrice),
              lt(products.salePrice, parsed.value),
            ),
          ),
        )
        .returning({ price: products.price });
      if (updated.length === 0) {
        const [current] = await db
          .select({ salePrice: products.salePrice })
          .from(products)
          .where(eq(products.id, id))
          .limit(1);
        if (!current) return failed("Este producto ya no existe.");
        return invalid(
          `Tiene que ser mayor al precio de oferta (${Number(current.salePrice).toLocaleString("es-AR")}). Cambiá la oferta desde «Editar».`,
        );
      }
      revalidatePath("/admin/productos");
      return { ok: true, value: updated[0].price };
    }

    if (input.field === "stock") {
      if (typeof input.value !== "string") return failed(BAD_REQUEST);
      const parsed = parseStock(input.value);
      if (!parsed.ok) return invalid(parsed.error);

      const updated = await db
        .update(products)
        .set({ stock: Number(parsed.value) })
        .where(eq(products.id, id))
        .returning({ stock: products.stock });
      if (updated.length === 0) return failed("Este producto ya no existe.");
      revalidatePath("/admin/productos");
      return { ok: true, value: String(updated[0].stock) };
    }

    if (input.field === "active") {
      if (typeof input.value !== "boolean") return failed(BAD_REQUEST);
      const updated = await db
        .update(products)
        .set({ active: input.value })
        .where(eq(products.id, id))
        .returning({ active: products.active });
      if (updated.length === 0) return failed("Este producto ya no existe.");
      revalidatePath("/admin/productos");
      return { ok: true, value: updated[0].active };
    }
  } catch (error) {
    console.error("[admin] falló la edición en línea del producto", error);
    return failed("No se pudo guardar el cambio. Probá de nuevo.");
  }

  return failed(BAD_REQUEST);
}

// ---------------------------------------------------------------------------------------------
// Combos: precio (mayor a 0) y estado
// ---------------------------------------------------------------------------------------------

export async function updateComboField(
  id: string,
  input: PriceInlineInput,
): Promise<InlineResult<string | boolean>> {
  if (!(await prepare(id))) return failed("Combo inválido.");

  try {
    if (input.field === "price") {
      if (typeof input.value !== "string") return failed(BAD_REQUEST);
      const parsed = parsePrice(input.value, { min: "positive" });
      if (!parsed.ok) return invalid(parsed.error);

      const updated = await db
        .update(combos)
        .set({ price: parsed.value })
        .where(eq(combos.id, id))
        .returning({ price: combos.price });
      if (updated.length === 0) return failed("Este combo ya no existe.");
      revalidatePath("/admin/combos");
      revalidatePath("/promociones");
      return { ok: true, value: updated[0].price };
    }

    if (input.field === "active") {
      if (typeof input.value !== "boolean") return failed(BAD_REQUEST);
      const updated = await db
        .update(combos)
        .set({ active: input.value })
        .where(eq(combos.id, id))
        .returning({ active: combos.active });
      if (updated.length === 0) return failed("Este combo ya no existe.");
      revalidatePath("/admin/combos");
      revalidatePath("/promociones");
      return { ok: true, value: updated[0].active };
    }
  } catch (error) {
    console.error("[admin] falló la edición en línea del combo", error);
    return failed("No se pudo guardar el cambio. Probá de nuevo.");
  }

  return failed(BAD_REQUEST);
}

// ---------------------------------------------------------------------------------------------
// Visitas (paquetes): precio (0 = "a consultar") y estado
// ---------------------------------------------------------------------------------------------

export async function updateExperienceField(
  id: string,
  input: PriceInlineInput,
): Promise<InlineResult<string | boolean>> {
  if (!(await prepare(id))) return failed("Paquete inválido.");

  try {
    if (input.field === "price") {
      if (typeof input.value !== "string") return failed(BAD_REQUEST);
      const parsed = parsePrice(input.value, { min: "zero" });
      if (!parsed.ok) return invalid(parsed.error);

      const updated = await db
        .update(experiences)
        .set({ price: parsed.value })
        .where(eq(experiences.id, id))
        .returning({ price: experiences.price });
      if (updated.length === 0) return failed("Este paquete ya no existe.");
      revalidatePath("/admin/visitas");
      revalidatePath("/visitas");
      return { ok: true, value: updated[0].price };
    }

    if (input.field === "active") {
      if (typeof input.value !== "boolean") return failed(BAD_REQUEST);
      const updated = await db
        .update(experiences)
        .set({ active: input.value })
        .where(eq(experiences.id, id))
        .returning({ active: experiences.active });
      if (updated.length === 0) return failed("Este paquete ya no existe.");
      revalidatePath("/admin/visitas");
      revalidatePath("/visitas");
      revalidatePath("/visitas/reservar");
      return { ok: true, value: updated[0].active };
    }
  } catch (error) {
    console.error("[admin] falló la edición en línea del paquete", error);
    return failed("No se pudo guardar el cambio. Probá de nuevo.");
  }

  return failed(BAD_REQUEST);
}

// ---------------------------------------------------------------------------------------------
// Newsletter: solo el estado (activo/inactivo)
// ---------------------------------------------------------------------------------------------

export async function updateNewsletterSubscriberActive(
  id: string,
  active: boolean,
): Promise<InlineResult<boolean>> {
  if (!(await prepare(id))) return failed("Suscriptor inválido.");

  try {
    const updated = await db
      .update(newsletterSubscribers)
      .set({ active })
      .where(eq(newsletterSubscribers.id, id))
      .returning({ active: newsletterSubscribers.active });
    if (updated.length === 0) return failed("Este suscriptor ya no existe.");
    revalidatePath("/admin/newsletter");
    return { ok: true, value: updated[0].active };
  } catch (error) {
    console.error("[admin] falló la edición en línea del suscriptor", error);
    return failed("No se pudo guardar el cambio. Probá de nuevo.");
  }
}
