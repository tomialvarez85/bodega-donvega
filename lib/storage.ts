import "server-only";

import { randomUUID } from "node:crypto";

import { IMAGE_TYPES } from "@/lib/validation/product";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// Imágenes subidas desde el admin (productos, combos y paquetes de visita): Supabase Storage.
// El bucket es público (las imágenes se ven en el sitio) y solo el admin autenticado puede
// escribir en él: la subida usa la sesión del admin, sin claves secretas. Ver supabase/storage.sql.
export const IMAGE_BUCKET = "images";

const publicPrefix = () =>
  `${getSupabaseEnv().url.replace(/\/+$/, "")}/storage/v1/object/public/${IMAGE_BUCKET}/`;

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

// Sube el archivo a `<carpeta>/<slug>-<id>.<ext>` y devuelve su URL pública.
export async function uploadImage(
  folder: string,
  slug: string,
  file: File,
): Promise<UploadResult> {
  try {
    const supabase = await createClient();
    const path = `${folder}/${slug}-${randomUUID().slice(0, 8)}.${IMAGE_TYPES[file.type]}`;

    const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

    if (error) {
      console.error("[admin] falló la subida a Supabase Storage", error);
      const detail = `${error.message} ${(error as { statusCode?: string }).statusCode ?? ""}`;
      if (/bucket not found/i.test(detail)) {
        return {
          ok: false,
          message: `No existe el bucket «${IMAGE_BUCKET}» en Supabase Storage. Crealo con supabase/storage.sql.`,
        };
      }
      if (/row-level security|unauthorized|not authorized|403/i.test(detail)) {
        return {
          ok: false,
          message:
            "Supabase rechazó la subida: faltan las políticas de Storage. Corré supabase/storage.sql.",
        };
      }
      return {
        ok: false,
        message: "No se pudo subir la imagen. Probá de nuevo en un momento.",
      };
    }

    return { ok: true, url: supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl };
  } catch (error) {
    console.error("[admin] falló la subida a Supabase Storage", error);
    return {
      ok: false,
      message: "No se pudo subir la imagen. Probá de nuevo en un momento.",
    };
  }
}

// Borra la imagen del bucket si es nuestra (no las de /public ni las externas). Falla en silencio.
export async function deleteImageQuietly(url: string) {
  try {
    const prefix = publicPrefix();
    if (!url.startsWith(prefix)) return;
    const path = decodeURIComponent(url.slice(prefix.length));
    const supabase = await createClient();
    const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
    if (error) console.error("[admin] no se pudo borrar la imagen", path, error);
  } catch (error) {
    console.error("[admin] no se pudo borrar la imagen", url, error);
  }
}
