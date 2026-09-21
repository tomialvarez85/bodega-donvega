import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Imágenes placeholder del seed.
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
};

export default nextConfig;
