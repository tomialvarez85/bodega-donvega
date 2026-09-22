-- Almacenamiento de imágenes del admin (productos, combos y paquetes de visita).
-- Pegalo una sola vez en Supabase > SQL Editor > New query > Run. Es seguro volver a correrlo.

-- 1) Bucket público «images»: las imágenes se ven en el sitio sin autenticación.
--    Solo acepta imágenes de hasta 4 MB (el mismo límite que valida el admin).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2) Solo un usuario autenticado (el admin) puede subir, reemplazar o borrar.
--    Leer no necesita política: el bucket es público. El registro público de Supabase Auth
--    está desactivado, así que el único usuario autenticado es el admin.
drop policy if exists "images: el admin sube" on storage.objects;
create policy "images: el admin sube"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'images');

drop policy if exists "images: el admin reemplaza" on storage.objects;
create policy "images: el admin reemplaza"
  on storage.objects for update to authenticated
  using (bucket_id = 'images')
  with check (bucket_id = 'images');

drop policy if exists "images: el admin borra" on storage.objects;
create policy "images: el admin borra"
  on storage.objects for delete to authenticated
  using (bucket_id = 'images');
