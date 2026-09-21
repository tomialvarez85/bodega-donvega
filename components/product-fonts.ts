import { Libre_Baskerville } from "next/font/google";

// Cuerpo serif del diseño de la ficha de producto. Se importa solo desde esa página, así
// next/font no lo precarga en el resto del sitio.
export const baskerville = Libre_Baskerville({
  variable: "--font-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});
