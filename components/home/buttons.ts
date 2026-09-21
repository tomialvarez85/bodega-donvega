// Botones del diseño de referencia: cuadrados, 12px en mayúsculas, con leve elevación al
// hover. Clases autocontenidas (sin buttonVariants) para no pelear con los estilos de shadcn.
const base =
  "inline-flex items-center justify-center border px-8 py-[13px] text-center text-xs font-medium tracking-[0.07em] uppercase transition-[background-color,color,border-color,transform] duration-150 hover:-translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export const solidButton = `${base} border-cream bg-cream text-ink hover:bg-transparent hover:text-cream active:translate-y-0`;
export const ghostButton = `${base} border-cream/70 bg-transparent text-cream hover:border-gold hover:text-gold`;
