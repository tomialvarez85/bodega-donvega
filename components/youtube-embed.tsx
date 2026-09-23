"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// Video de YouTube con carga diferida: hasta que se hace click se muestra solo la miniatura
// (una imagen liviana), nunca el iframe de YouTube — eso evita el peso y los scripts de terceros
// que trae el embed en el primer render de la página.
export function YoutubeEmbed({
  videoId,
  title,
}: {
  videoId: string;
  /** Título accesible del video (lo anuncian los lectores de pantalla). */
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  // maxresdefault no existe para todos los videos (solo si se subió en alta resolución): si
  // falla, se cae a hqdefault, que sí está garantizado.
  const [thumbnail, setThumbnail] = useState(
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  );

  return (
    // aspect-video fija la relación 16:9 en los dos estados (miniatura y reproductor), así el
    // click no mueve el resto de la página.
    <div className="relative aspect-video w-full overflow-hidden border border-hairline-mid bg-white/[0.03]">
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Reproducir video: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-gold"
        >
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes="(min-width: 1024px) 1200px, 100vw"
            className="object-cover"
            onError={() =>
              setThumbnail(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)
            }
          />
          {/* Vela la miniatura apenas, para que el círculo dorado se lea sobre cualquier imagen. */}
          <span aria-hidden className="absolute inset-0 bg-ink/25 transition-colors duration-200 group-hover:bg-ink/40" />
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold bg-ink/60 transition-transform duration-200 group-hover:scale-105 sm:h-20 sm:w-20"
          >
            <Play className="ml-1 h-6 w-6 fill-gold text-gold sm:h-7 sm:w-7" strokeWidth={1.5} />
          </span>
        </button>
      )}
    </div>
  );
}
