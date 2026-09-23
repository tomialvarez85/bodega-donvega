import { YoutubeEmbed } from "@/components/youtube-embed";

// Video institucional de la bodega. El id es fijo: si el día de mañana se reemplaza el video,
// alcanza con cambiar este valor.
const VIDEO_ID = "htmn7X9SF8Q";

export function VideoSection() {
  return (
    <section aria-labelledby="video-title" className="border-t border-hairline">
      <div className="mx-auto max-w-[1200px] px-6 py-[clamp(64px,8vw,104px)] sm:px-8">
        <div className="mb-10 flex flex-col gap-4">
          <div className="flex items-center gap-5">
            <div className="h-px w-7 bg-gold" />
            <p className="text-[11px] font-medium tracking-[0.14em] text-sand uppercase">
              La bodega
            </p>
          </div>
          <h2
            id="video-title"
            className="max-w-[480px] font-display text-[clamp(28px,4vw,44px)] leading-[1.15] text-cream"
          >
            Conocé Don Vega
          </h2>
        </div>

        {/* 835px: 726px + 15%. Centrado dentro de la sección. */}
        <div className="mx-auto w-full max-w-[835px]">
          <YoutubeEmbed videoId={VIDEO_ID} title="Conocé Don Vega" />
        </div>
      </div>
    </section>
  );
}
