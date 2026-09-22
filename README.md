# Don Vega

Tienda online de la bodega Don Vega: catálogo de vinos, promociones y combos, carrito, checkout sin
pasarela de pago (el pedido se guarda y se continúa por WhatsApp) y panel de administración.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Drizzle ORM + Postgres · Zustand ·
Supabase Auth (login del panel) · Supabase Storage (imágenes cargadas desde el admin).

## Desarrollo local

```bash
npm install
cp .env.example .env      # completá los valores (ver comentarios dentro del archivo)
npm run db:migrate        # aplica las migraciones de drizzle/
npm run db:seed           # opcional: carga los 5 vinos reales
npm run dev
```

Sitio en <http://localhost:3000>, panel en <http://localhost:3000/admin>.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` | ESLint |
| `npm run db:generate` | Genera una migración nueva desde `lib/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones a `DATABASE_URL` |
| `npm run db:seed` | Carga los vinos reales (`-- --update` actualiza existentes) |
| `npm run db:seed-orders` | Pedidos de ejemplo. **Solo desarrollo** |

## Deploy

Ver [DEPLOY.md](DEPLOY.md).
