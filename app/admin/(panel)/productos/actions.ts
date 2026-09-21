"use server";

import { put } from "@vercel/blob";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import {
  deleteBlobQuietly,
  isForeignKeyViolation,
  isUniqueViolation,
} from "@/lib/admin-server";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import {
  IMAGE_TYPES,
  isUuid,
  parseProductFormData,
  validateImageFile,
  type FieldErrors,
} from "@/lib/validation/product";

// Las Server Actions son endpoints públicos: se pueden invocar sin pasar por /admin
// (y por lo tanto sin proxy.ts). Cada una re-verifica la sesión.

export type SaveResult =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: FieldErrors };

export type DeleteResult = { ok: true } | { ok: false; message: string };

export async function saveProduct(
  id: string | null,
  formData: FormData,
): Promise<SaveResult> {
  await requireAdmin();

  if (id !== null && !isUuid(id)) {
    return { ok: false, message: "Producto inválido." };
  }

  const existing = id
    ? (await db.select().from(products).where(eq(products.id, id)).limit(1))[0]
    : undefined;
  if (id && !existing) {
    return { ok: false, message: "Este producto ya no existe." };
  }

  const parsed = parseProductFormData(formData);
  const fieldErrors: FieldErrors = parsed.ok ? {} : parsed.errors;

  const file = formData.get("image");
  const newImage = file instanceof File && file.size > 0 ? file : null;
  if (newImage) {
    const imageError = validateImageFile(newImage);
    if (imageError) fieldErrors.image = imageError;
  } else if (!existing) {
    fieldErrors.image = "Subí una imagen del producto";
  }

  if (!parsed.ok) return { ok: false, fieldErrors };
  const data = parsed.data;

  // Chequeo previo del slug para no subir una imagen que quedaría huérfana.
  const [slugTaken] = await db
    .select({ id: products.id })
    .from(products)
    .where(
      and(eq(products.slug, data.slug), id ? ne(products.id, id) : undefined),
    )
    .limit(1);
  if (slugTaken) fieldErrors.slug = "Ya existe un producto con ese slug";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  let imageUrl = existing?.imageUrl ?? "";
  let uploadedUrl: string | null = null;

  if (newImage) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return {
        ok: false,
        message:
          "Falta BLOB_READ_WRITE_TOKEN en el servidor: no se puede subir la imagen.",
      };
    }
    try {
      const blob = await put(
        `products/${data.slug}.${IMAGE_TYPES[newImage.type]}`,
        newImage,
        { access: "public", addRandomSuffix: true, contentType: newImage.type },
      );
      uploadedUrl = imageUrl = blob.url;
    } catch (error) {
      console.error("[admin] falló la subida a Vercel Blob", error);
      return {
        ok: false,
        message: "No se pudo subir la imagen. Probá de nuevo en un momento.",
      };
    }
  }

  try {
    if (existing) {
      await db
        .update(products)
        .set({ ...data, imageUrl })
        .where(eq(products.id, existing.id));
    } else {
      await db.insert(products).values({ ...data, imageUrl });
    }
  } catch (error) {
    if (uploadedUrl) await deleteBlobQuietly(uploadedUrl);
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        fieldErrors: { slug: "Ya existe un producto con ese slug" },
      };
    }
    console.error("[admin] falló el guardado del producto", error);
    return { ok: false, message: "No se pudo guardar el producto." };
  }

  // Imagen reemplazada: la anterior ya no se usa.
  if (uploadedUrl && existing) await deleteBlobQuietly(existing.imageUrl);

  revalidatePath("/admin/productos");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<DeleteResult> {
  await requireAdmin();

  if (!isUuid(id)) return { ok: false, message: "Producto inválido." };

  try {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ imageUrl: products.imageUrl });
    if (!deleted) return { ok: false, message: "Este producto ya no existe." };

    await deleteBlobQuietly(deleted.imageUrl);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return {
        ok: false,
        message:
          "Este vino forma parte de un combo. Sacalo del combo (o desactivalo) antes de eliminarlo.",
      };
    }
    console.error("[admin] falló el borrado del producto", error);
    return { ok: false, message: "No se pudo eliminar el producto." };
  }

  revalidatePath("/admin/productos");
  return { ok: true };
}
