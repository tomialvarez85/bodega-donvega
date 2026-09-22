"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "@/lib/admin-server";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { deleteImageQuietly, uploadImage } from "@/lib/storage";
import { comboItems, combos } from "@/lib/schema";
import {
  parseComboFormData,
  type ComboFieldErrors,
} from "@/lib/validation/combo";
import {
  isUuid,
  validateImageFile,
} from "@/lib/validation/product";

// Server Actions públicas como las de productos: cada una re-verifica la sesión.

export type SaveComboResult =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: ComboFieldErrors };

export type DeleteComboResult = { ok: true } | { ok: false; message: string };

const SLUG_TAKEN = "Ya existe un combo con ese slug";

export async function saveCombo(
  id: string | null,
  formData: FormData,
): Promise<SaveComboResult> {
  await requireAdmin();

  if (id !== null && !isUuid(id)) {
    return { ok: false, message: "Combo inválido." };
  }

  const existing = id
    ? (await db.select().from(combos).where(eq(combos.id, id)).limit(1))[0]
    : undefined;
  if (id && !existing) {
    return { ok: false, message: "Este combo ya no existe." };
  }

  const parsed = parseComboFormData(formData);
  const fieldErrors: ComboFieldErrors = parsed.ok ? {} : parsed.errors;

  const file = formData.get("image");
  const newImage = file instanceof File && file.size > 0 ? file : null;
  if (newImage) {
    const imageError = validateImageFile(newImage);
    if (imageError) fieldErrors.image = imageError;
  } else if (!existing) {
    fieldErrors.image = "Subí una imagen del combo";
  }

  if (!parsed.ok) return { ok: false, fieldErrors };
  const data = parsed.data;

  // Chequeo previo del slug para no subir una imagen que quedaría huérfana.
  const [slugTaken] = await db
    .select({ id: combos.id })
    .from(combos)
    .where(
      and(eq(combos.slug, data.slug), id ? ne(combos.id, id) : undefined),
    )
    .limit(1);
  if (slugTaken) fieldErrors.slug = SLUG_TAKEN;

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  let imageUrl = existing?.imageUrl ?? "";
  let uploadedUrl: string | null = null;

  if (newImage) {
    const upload = await uploadImage("combos", data.slug, newImage);
    if (!upload.ok) return { ok: false, message: upload.message };
    uploadedUrl = imageUrl = upload.url;
  }

  const { items, ...fields } = data;

  try {
    // Combo y contenido se guardan juntos: si algo falla no queda un combo a medias.
    await db.transaction(async (tx) => {
      let comboId = existing?.id;
      if (existing) {
        await tx
          .update(combos)
          .set({ ...fields, imageUrl })
          .where(eq(combos.id, existing.id));
        await tx.delete(comboItems).where(eq(comboItems.comboId, existing.id));
      } else {
        const [created] = await tx
          .insert(combos)
          .values({ ...fields, imageUrl })
          .returning({ id: combos.id });
        comboId = created.id;
      }

      await tx.insert(comboItems).values(
        items.map((item) => ({
          comboId: comboId!,
          productId: item.productId,
          quantity: item.quantity,
        })),
      );
    });
  } catch (error) {
    if (uploadedUrl) await deleteImageQuietly(uploadedUrl);
    if (isUniqueViolation(error)) {
      return { ok: false, fieldErrors: { slug: SLUG_TAKEN } };
    }
    if (isForeignKeyViolation(error)) {
      return {
        ok: false,
        fieldErrors: {
          items: "Alguno de los vinos elegidos ya no existe. Recargá la página.",
        },
      };
    }
    console.error("[admin] falló el guardado del combo", error);
    return { ok: false, message: "No se pudo guardar el combo." };
  }

  // Imagen reemplazada: la anterior ya no se usa.
  if (uploadedUrl && existing) await deleteImageQuietly(existing.imageUrl);

  revalidatePath("/admin/combos");
  revalidatePath("/promociones");
  return { ok: true };
}

export async function deleteCombo(id: string): Promise<DeleteComboResult> {
  await requireAdmin();

  if (!isUuid(id)) return { ok: false, message: "Combo inválido." };

  try {
    // Sus filas de combo_items se borran en cascada.
    const [deleted] = await db
      .delete(combos)
      .where(eq(combos.id, id))
      .returning({ imageUrl: combos.imageUrl });
    if (!deleted) return { ok: false, message: "Este combo ya no existe." };

    await deleteImageQuietly(deleted.imageUrl);
  } catch (error) {
    console.error("[admin] falló el borrado del combo", error);
    return { ok: false, message: "No se pudo eliminar el combo." };
  }

  revalidatePath("/admin/combos");
  revalidatePath("/promociones");
  return { ok: true };
}
