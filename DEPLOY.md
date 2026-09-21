# Deploy de Don Vega en Vercel

## Variables de entorno

| Variable | Obligatoria | Dónde sale |
| --- | --- | --- |
| `DATABASE_URL` | Sí (también en el build) | Base Postgres conectada al proyecto (Neon vía Vercel Storage) o Supabase |
| `ADMIN_EMAIL` | Sí | El email con el que ingresa el dueño |
| `ADMIN_PASSWORD_HASH` | Sí | `npm run admin:hash` (en Vercel se pega **sin** las barras `\`) |
| `SESSION_SECRET` | Sí | Aleatorio, mínimo 32 caracteres |
| `BLOB_READ_WRITE_TOKEN` | Sí (para subir imágenes) | Se inyecta al conectar un Blob store **público** |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | Tu dominio, ej. `https://www.donvega.com.ar` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Sí (botón de WhatsApp del checkout) | Número de la bodega, solo dígitos: `5492610000000` |

Generar `SESSION_SECRET`:

```
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## Pasos

1. **Subí el repo a GitHub.** Commit de todo (incluida la carpeta `drizzle/`, que tiene las
   migraciones). `.env` no se sube: está en `.gitignore`.
2. **Vercel → Add New → Project → Import** el repo. Framework: Next.js (se detecta solo).
   No hace falta tocar build ni output. **No pulses Deploy todavía** (paso 5).
3. **Base de datos:** en el proyecto, *Storage → Create Database → Postgres (Neon)* y conectala al
   proyecto para los tres entornos. Vercel agrega `DATABASE_URL` sola. Región recomendada:
   São Paulo (`sa-east-1` / `gru1`). Con Supabase: pegá la connection string del *Session pooler*
   como `DATABASE_URL`.
4. **Imágenes:** *Storage → Create → Blob* con acceso **Public**, conectado al proyecto. Vercel
   agrega `BLOB_READ_WRITE_TOKEN`.
5. **Variables restantes** (*Settings → Environment Variables*, entorno Production): `ADMIN_EMAIL`,
   `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`. Después **Deploy**.
   `DATABASE_URL` tiene que existir antes del primer build o el build falla.
6. **Migración y datos iniciales** (una sola vez, desde tu computadora, apuntando a la base de
   producción). PowerShell:

   ```powershell
   $env:DATABASE_URL = "postgres://USUARIO:CLAVE@HOST/DB?sslmode=require"
   npm run db:migrate
   npm run db:seed        # carga los 5 vinos reales (precio 0, stock 20: se ajustan desde /admin)
   Remove-Item Env:DATABASE_URL
   ```

   Usá la misma URL que está en Vercel (podés copiarla de *Storage → tu base → .env.local*).
   Las imágenes de los 5 vinos se sirven desde `public/products/` (ver más abajo): subilas al repo antes de deployar.
   **Nunca** corras `db:seed-orders` en producción: son pedidos de ejemplo.
7. **Verificá:** `/`, `/catalogo`, un producto, `/admin/login` (ingresá y creá un producto de
   prueba con imagen), `/robots.txt`, `/sitemap.xml`.
8. **Dominio propio:** *Settings → Domains*. Después ajustá `NEXT_PUBLIC_SITE_URL` y **redeployá**
   (se lee en el build).
9. **Preview al compartir:** pegá el link en WhatsApp; si mostró una versión vieja, Meta tiene
   una caché (debugger de Facebook para forzar el refresh).

## Cambios de esquema a futuro

Editá `lib/schema.ts`, corré `npm run db:generate` (crea un `.sql` nuevo en `drizzle/`), commiteá,
y aplicá con `npm run db:migrate` contra producción **antes** de deployar el código que lo usa.

## Imágenes de los vinos del seed

Los 5 vinos apuntan a `/products/<nombre>.png`, es decir, archivos dentro de `public/products/` que
**tenés que agregar al repo** (no vienen incluidos):

```
public/products/malbec-reserva.png
public/products/cabernet-franc.png
public/products/malbec-joven.png
public/products/adn-cabernet-sauvignon.png
public/products/adn-bonarda.png
```

Los vinos que se creen desde `/admin` suben su imagen a Vercel Blob y no dependen de esa carpeta.
