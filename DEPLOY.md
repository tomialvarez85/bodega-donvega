# Deploy de Don Vega en Vercel

## Variables de entorno

| Variable | Obligatoria | Dónde sale |
| --- | --- | --- |
| `DATABASE_URL` | Sí, **antes del primer build** | Postgres (Neon vía Vercel Storage, o Supabase). En Supabase usá el *Transaction pooler* (puerto 6543) |
| `NEXT_PUBLIC_SUPABASE_URL` | Sí, **antes del build** | Supabase > Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí, **antes del build** | Supabase > Project Settings > API > clave `anon` / `publishable` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Sí, para el botón de WhatsApp del checkout | Solo dígitos: `5492610000000`. Se lee en el build |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | Tu dominio, ej. `https://www.donvega.com.ar`. Se lee en el build |

## Pasos

1. **Subí el repo a GitHub** (commit de todo, incluida `drizzle/` con las migraciones y
   `public/products/` con las fotos). `.env` no se sube.
2. **Vercel → Add New → Project → Import** el repo. Framework: Next.js (se detecta solo). Node 20.9+.
   **No pulses Deploy todavía.**
3. **Base de datos:** *Storage → Create Database → Postgres (Neon)* conectada al proyecto (agrega
   `DATABASE_URL`), o pegá la URL de Supabase como variable. Región recomendada: São Paulo (`gru1`).
4. **Imágenes:** en Supabase > SQL Editor, pegá y corré `supabase/storage.sql` (crea el bucket público
   `images` y las políticas para que solo el admin suba, reemplace o borre). No hace falta ninguna
   variable de entorno extra.
5. **Variables restantes** (*Settings → Environment Variables*, Production): `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SITE_URL`.
   Después **Deploy**.
6. **Migraciones y datos iniciales** (una vez, desde tu PC, contra la base de producción).
   Para migrar en Supabase usá el *Session pooler* (puerto 5432). PowerShell:

   ```powershell
   $env:DATABASE_URL = "postgres://USUARIO:CLAVE@HOST/DB?sslmode=require"
   npm run db:migrate     # aplica drizzle/0000 … 0009 (productos, pedidos, combos, ofertas, visitas)
   npm run db:seed        # opcional: 5 vinos reales, precio 0 y stock 20 (se ajustan desde /admin)
   npm run db:seed-experiences   # opcional: 3 paquetes de visitas de ejemplo (contenido provisorio)
   Remove-Item Env:DATABASE_URL
   ```

   **Nunca** corras `db:seed-orders` en producción: son pedidos de ejemplo.
7. **Verificá** (ver checklist abajo).
8. **Dominio propio:** *Settings → Domains*. Después ajustá `NEXT_PUBLIC_SITE_URL` y **redeployá**.

## Checklist del primer deploy

- `/`, `/catalogo`, un producto, `/promociones` cargan sin errores.
- `/admin` redirige a `/admin/login`; ingresás con el usuario admin creado en Supabase (Authentication > Users).
- Desde el admin: editás un precio, creás un producto de prueba **con imagen** (prueba Supabase Storage).
- Hacés un pedido de prueba: baja el stock, se guarda en la tabla `orders` (el panel ya no tiene pantalla de pedidos: se ve desde Supabase → Table Editor) y el botón de WhatsApp abre el chat.
- `/robots.txt` y `/sitemap.xml` muestran tu dominio.

## Antes de abrir al público

- Cargar precios reales (el seed deja `0`) y stock real.
- Confirmar que `public/products/*.png` son las fotos originales:
  `malbec-reserva`, `cabernet-franc`, `malbec-joven`, `adn-cabernet-sauvignon`, `adn-bonarda`.
- Revisar los datos de contacto y de ubicación en `lib/site.ts`: email, Instagram, teléfono y `LOCATION` (dirección real, horarios e indicaciones de acceso; se muestran en `/contacto` y `/visitas`).
- Supabase > Authentication > Sign In / Providers: verificar que **"Allow new users to sign up"** esté
  desactivado. El panel acepta a cualquier usuario autenticado de ese proyecto, y el único debe ser el admin.
- El checkout no tiene límite de pedidos por IP (solo honeypot). Si aparece spam, sumar rate limiting
  (Vercel Firewall o Upstash).

## Cambios de esquema a futuro

Editá `lib/schema.ts`, corré `npm run db:generate`, commiteá y aplicá `npm run db:migrate` contra
producción **antes** de deployar el código que lo usa.
