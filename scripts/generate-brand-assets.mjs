// Genera los íconos y la imagen para compartir (Open Graph) a partir de la paleta de Don Vega.
// Uso: node scripts/generate-brand-assets.mjs
//
// public/logo.png es un cuadro liso sin isotipo, así que los íconos usan un monograma "V"
// dibujado con formas (sin depender de fuentes). Para usar el logo real, reemplazá
// app/icon.png, app/apple-icon.png, app/favicon.ico y app/opengraph-image.png.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const WINE = "#6e0f1f";
const CREAM = "#f7f3ec";
const GOLD = "#b08d57";
const app = path.resolve("app");

// Monograma V en un lienzo de 512x512.
const vPath = "M112 118 H196 L256 322 L316 118 H400 L300 400 H212 Z";
const iconSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${WINE}"/>
  <path d="${vPath}" fill="${CREAM}"/>
  <rect x="24" y="24" width="464" height="464" fill="none" stroke="${GOLD}" stroke-width="6"/>
</svg>`;

const png = (svg) => sharp(Buffer.from(svg)).png().toBuffer();

// ICO con un PNG embebido (válido desde Windows Vista y en todos los navegadores).
function icoFromPng(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0);
  entry.writeUInt8(size === 256 ? 0 : size, 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);
  return Buffer.concat([header, entry, pngBuffer]);
}

fs.writeFileSync(path.join(app, "icon.png"), await png(iconSvg(512)));
fs.writeFileSync(path.join(app, "apple-icon.png"), await png(iconSvg(180)));
fs.writeFileSync(
  path.join(app, "favicon.ico"),
  icoFromPng(await png(iconSvg(48)), 48),
);

// Open Graph / Twitter: 1200x630, monograma + nombre.
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${CREAM}"/>
  <rect x="32" y="32" width="1136" height="566" fill="none" stroke="${GOLD}" stroke-opacity="0.6" stroke-width="2"/>
  <g transform="translate(510 96) scale(0.36)">
    <rect width="512" height="512" fill="${WINE}"/>
    <path d="${vPath}" fill="${CREAM}"/>
  </g>
  <text x="600" y="368" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="96" fill="#0e0d0c" letter-spacing="2">Don Vega</text>
  <rect x="568" y="404" width="64" height="2" fill="${GOLD}"/>
  <text x="600" y="462" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#3a3632" letter-spacing="6">BODEGA DE VINOS</text>
</svg>`;
const og = await png(ogSvg);
fs.writeFileSync(path.join(app, "opengraph-image.png"), og);
fs.writeFileSync(path.join(app, "twitter-image.png"), og);

console.log("Listo: icon.png, apple-icon.png, favicon.ico, opengraph-image.png, twitter-image.png");
