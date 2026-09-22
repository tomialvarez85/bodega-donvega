import { ExternalLink } from "lucide-react";

import { ghostButton } from "@/components/home/buttons";
import { directionsUrl, LOCATION, mapEmbedUrl } from "@/lib/site";

const label = "text-[10px] tracking-[0.18em] text-sand uppercase";

// Ubicación de la bodega: mapa, botón «Cómo llegar», horarios e indicaciones de acceso.
// Se usa tal cual en /contacto y en /visitas. Sin props toma los datos de LOCATION (lib/site.ts);
// cada dato se puede pasar por props para usarlo con otros valores.
export function UbicacionBodega({
  address = LOCATION.address,
  hours = LOCATION.hours,
  directions = LOCATION.directions,
}: {
  address?: string;
  hours?: string[];
  directions?: string[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
      {/* El contenedor fija la proporción: el iframe se adapta a cualquier ancho sin desbordar. */}
      <div className="relative aspect-[4/3] w-full min-w-0 border border-hairline-mid bg-white/[0.03] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[420px]">
        <iframe
          title="Mapa con la ubicación de la bodega Don Vega"
          src={mapEmbedUrl(address)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-8">
        <div>
          <p className={label}>Dirección</p>
          <p className="mt-2 font-display text-2xl leading-snug text-cream">
            {address}
          </p>
          <a
            href={directionsUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ghostButton} mt-5 gap-2`}
          >
            Cómo llegar
            <ExternalLink aria-hidden className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </div>

        {hours.length > 0 && (
          <div className="border-t border-hairline pt-6">
            <p className={label}>Horarios de atención</p>
            <ul className="mt-2 flex flex-col gap-1">
              {hours.map((line) => (
                <li key={line} className="text-sm leading-[1.7] text-cream">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {directions.length > 0 && (
          <div className="border-t border-hairline pt-6">
            <p className={label}>Indicaciones de acceso</p>
            <div className="mt-2 flex flex-col gap-3">
              {directions.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-[1.7] whitespace-pre-line text-sand"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
