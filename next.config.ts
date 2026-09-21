import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vinos viejos de demo (seed anterior). Se puede quitar cuando ya no existan en la base.
      { protocol: "https", hostname: "picsum.photos" },
      // Imágenes subidas desde el admin (Vercel Blob, store público).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
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
