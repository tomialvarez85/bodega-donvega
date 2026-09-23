import type { NextConfig } from "next";

// Imágenes subidas desde el admin: bucket público de Supabase Storage del proyecto.
function supabaseImagePattern() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return [];
  try {
    const url = new URL(raw);
    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vinos viejos de demo (seed anterior). Se puede quitar cuando ya no existan en la base.
      { protocol: "https", hostname: "picsum.photos" },
      // Miniaturas de video de YouTube (components/youtube-embed.tsx).
      { protocol: "https", hostname: "img.youtube.com" },
      ...supabaseImagePattern(),
    ],
  },
  experimental: {
    serverActions: {
      // El admin sube la imagen dentro de la Server Action (máx. 4 MB de archivo + overhead
      // multipart). Vercel corta en 4,5 MB de todas formas.
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
