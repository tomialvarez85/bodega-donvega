// Video institucional de la bodega. Si el día de mañana se reemplaza el archivo, alcanza con
// pisar public/products/vid.mov (mismo nombre) o cambiar esta ruta.
const VIDEO_SRC = "/products/vid.mov";

export function VideoSection() {
  return (
    <section aria-labelledby="video-title" className="border-t border-hairline">
      <div className="mx-auto max-w-[1200px] px-6 py-[clamp(64px,8vw,104px)] sm:px-8">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
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

        {/* El video es vertical (grabado con celular): el ancho lo fija el propio video, no un
            aspect-video de 16:9 (eso lo dejaría con franjas negras enormes a los costados). */}
        <div className="mx-auto w-full max-w-[420px] overflow-hidden border border-hairline-mid bg-white/[0.03]">
          {/* Sin "type" en el <source>: así el navegador prueba el archivo directo en vez de
              descartarlo por el MIME de .mov (video/quicktime), que Chrome no reconoce. */}
          <video controls preload="metadata" playsInline className="block max-h-[80vh] w-full">
            <source src={VIDEO_SRC} />
            Tu navegador no puede reproducir este video.
          </video>
        </div>
      </div>
    </section>
  );
}
