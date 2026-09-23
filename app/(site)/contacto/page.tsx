import { Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";

import { FacebookIcon } from "@/components/facebook-icon";
import { InstagramIcon } from "@/components/instagram-icon";
import { TiktokIcon } from "@/components/tiktok-icon";
import { UbicacionBodega } from "@/components/ubicacion-bodega";
import { CONTACT, facebookUrl, instagramUrl, tiktokUrl } from "@/lib/site";
import { businessWhatsappDisplay, businessWhatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Cómo llegar a la bodega Don Vega en Tinogasta, Catamarca, horarios de atención y contacto directo por WhatsApp, email e Instagram.",
};

const gutter = "px-[clamp(20px,5vw,80px)]";
const label = "text-[10px] tracking-[0.18em] text-sand uppercase";
const contactLink =
  "text-sm text-cream underline-offset-4 transition-colors hover:text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";

export default function ContactoPage() {
  const whatsappUrl = businessWhatsappUrl(
    "Hola Don Vega, quería hacerles una consulta.",
  );
  const whatsappNumber = businessWhatsappDisplay();

  return (
    <div>
      <header
        className={`border-b border-hairline pt-14 pb-10 md:pt-20 ${gutter}`}
      >
        <p className="mb-3 text-[10px] tracking-[0.18em] text-sand uppercase">
          Tinogasta, Catamarca
        </p>
        <h1 className="font-display text-[clamp(32px,5vw,56px)] leading-none font-light tracking-[0.02em] text-cream">
          Contacto
        </h1>
        <div className="my-6 h-px w-10 bg-gold" />
        <p className="max-w-xl text-base leading-[1.75] text-sand">
          Escribinos o visitanos. Estamos en Tinogasta, a 1.230 metros sobre el
          nivel del mar.
        </p>
      </header>

      <section
        aria-labelledby="ubicacion"
        className={`mx-auto max-w-[1440px] py-[72px] ${gutter}`}
      >
        <h2
          id="ubicacion"
          className="mb-10 font-display text-[clamp(28px,4vw,40px)] leading-[1.1] font-semibold tracking-[-0.01em] text-cream"
        >
          Dónde estamos
        </h2>
        <UbicacionBodega />
      </section>

      <section
        aria-labelledby="contacto-directo"
        className={`border-t border-hairline py-[72px] ${gutter}`}
      >
        <div className="mx-auto max-w-[1440px]">
          <h2
            id="contacto-directo"
            className="mb-10 font-display text-[clamp(28px,4vw,40px)] leading-[1.1] font-semibold tracking-[-0.01em] text-cream"
          >
            Contacto directo
          </h2>

          <dl className="grid border-x-[0.5px] border-t-[0.5px] border-hairline sm:grid-cols-2 lg:grid-cols-3">
            {whatsappUrl && (
              <div className="flex flex-col gap-3 border-b-[0.5px] border-hairline p-6 sm:p-8">
                <dt className={`${label} flex items-center gap-2`}>
                  <MessageCircle aria-hidden className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  WhatsApp
                </dt>
                <dd className="flex flex-col items-start gap-4">
                  <span className="font-display text-2xl leading-none text-cream tabular-nums">
                    {whatsappNumber}
                  </span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[52px] items-center justify-center bg-wine px-8 text-xs tracking-[0.18em] text-cream uppercase transition-[background-color,transform] duration-200 hover:bg-[#501320] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.99]"
                  >
                    Escribir por WhatsApp
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                </dd>
              </div>
            )}

            {CONTACT.phone && (
              <div className="flex flex-col gap-3 border-b-[0.5px] border-hairline p-6 sm:p-8">
                <dt className={`${label} flex items-center gap-2`}>
                  <Phone aria-hidden className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  Teléfono
                </dt>
                <dd>
                  <a href={`tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`} className={contactLink}>
                    {CONTACT.phone}
                  </a>
                </dd>
              </div>
            )}

            <div className="flex flex-col gap-3 border-b-[0.5px] border-hairline p-6 sm:p-8">
              <dt className={`${label} flex items-center gap-2`}>
                <Mail aria-hidden className="h-4 w-4 text-gold" strokeWidth={1.5} />
                Email
              </dt>
              <dd>
                <a href={`mailto:${CONTACT.email}`} className={`${contactLink} break-all`}>
                  {CONTACT.email}
                </a>
              </dd>
            </div>

            <div className="flex flex-col gap-3 border-b-[0.5px] border-hairline p-6 sm:p-8">
              <dt className={`${label} flex items-center gap-2`}>
                <span className="text-gold">
                  <InstagramIcon size={16} />
                </span>
                Instagram
              </dt>
              <dd>
                <a
                  href={instagramUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={contactLink}
                >
                  @{CONTACT.instagram}
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </dd>
            </div>

            <div className="flex flex-col gap-3 border-b-[0.5px] border-hairline p-6 sm:p-8">
              <dt className={`${label} flex items-center gap-2`}>
                <span className="text-gold">
                  <FacebookIcon size={16} />
                </span>
                Facebook
              </dt>
              <dd>
                <a
                  href={facebookUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={contactLink}
                >
                  {CONTACT.facebook}
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </dd>
            </div>

            <div className="flex flex-col gap-3 border-b-[0.5px] border-hairline p-6 sm:p-8">
              <dt className={`${label} flex items-center gap-2`}>
                <span className="text-gold">
                  <TiktokIcon size={16} />
                </span>
                TikTok
              </dt>
              <dd>
                <a
                  href={tiktokUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={contactLink}
                >
                  @{CONTACT.tiktok}
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
