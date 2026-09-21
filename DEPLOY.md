# Deploy de Don Vega en Vercel

## Variables de entorno

| Variable | Obligatoria | Dónde sale |
| --- | --- | --- |
| `DATABASE_URL` | Sí, **antes del primer build** | Postgres (Neon vía Vercel Storage, o Supabase). En Supabase usá el *Transaction pooler* (puerto 6543) |
| `ADMIN_EMAIL` | Sí | Email con el que ingresa el dueño |
| `ADMIN_PASSWORD_HASH` | Sí | `npm run admin:hash` (en Vercel se pega **sin** las barras `\`) |
| `SESSION_SECRET` | Sí | Aleatorio, mínimo 32 caracteres |
| `BLOB_READ_WRITE_TOKEN` | Sí, para subir imágenes desde el admin | Se inyecta al conectar un Blob store **público** |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Sí, para el botón de WhatsApp del checkout | Solo dígitos: `5492610000000`. Se lee en el build |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | Tu dominio, ej. `https://www.donvega.com.ar`. Se lee en el build |

Generar `SESSION_SECRET`:

```
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## Pasos

1. **Subí el repo a GitHub** (commit de todo, incluida `drizzle/` con las migraciones y
   `public/products/` con las fotos). `.env` no se sube.
2. **Vercel → Add New → Project → Import** el repo. Framework: Next.js (se detecta solo). Node 20.9+.
   **No pulses Deploy todavía.**
3. **Base de datos:** *Storage → Create Database → Postgres (Neon)* conectada al proyecto (agrega
   `DATABASE_URL`), o pegá la URL de Supabase como variable. Región recomendada: São Paulo (`gru1`).
4. **Imágenes:** *Storage → Create → Blob* con acceso **Public**, conectado al proyecto
   (agrega `BLOB_READ_WRITE_TOKEN`).
5. **Variables restantes** (*Settings → Environment Variables*, Production): `ADMIN_EMAIL`,
   `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SITE_URL`.
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
- `/admin` redirige a `/admin/login`; ingresás con `ADMIN_EMAIL` y tu contraseña.
- Desde el admin: editás un precio, creás un producto de prueba **con imagen** (prueba el Blob).
- Hacés un pedido de prueba: baja el stock, aparece en `/admin/pedidos`, el botón de WhatsApp abre el chat.
- `/robots.txt` y `/sitemap.xml` muestran tu dominio.

## Antes de abrir al público

- Cargar precios reales (el seed deja `0`) y stock real.
- Confirmar que `public/products/*.png` son las fotos originales:
  `malbec-reserva`, `cabernet-franc`, `malbec-joven`, `adn-cabernet-sauvignon`, `adn-bonarda`.
- Revisar los datos de contacto del footer (`lib/site.ts`: email, Instagram, teléfono).
- Sacar la ruta `/admin` del alcance de curiosos: la contraseña debe ser larga; el hash bcrypt ya
  protege contra filtraciones de la variable.
- El checkout no tiene límite de pedidos por IP (solo honeypot). Si aparece spam, sumar rate limiting
  (Vercel Firewall o Upstash).

## Cambios de esquema a futuro

Editá `lib/schema.ts`, corré `npm run db:generate`, commiteá y aplicá `npm run db:migrate` contra
producción **antes** de deployar el código que lo usa.
