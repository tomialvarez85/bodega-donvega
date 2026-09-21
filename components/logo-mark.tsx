// Monograma "DV" del diseño de referencia. SVG inline: escala sin pérdida y hereda la
// tipografía del sitio (--font-display) sin cargar ninguna imagen.
export function LogoMark({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  // Usa currentColor: el color sale de la clase (el sistema es oscuro: crema).
  const fg = "currentColor";
  const letter = {
    fontFamily: "var(--font-display), Georgia, serif",
    fontSize: 62,
    fontWeight: 300,
    letterSpacing: -2,
  } as const;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Don Vega, monograma DV"
      className={`text-cream ${className}`.trim()}
    >
      <rect x="4" y="4" width="92" height="92" fill="none" stroke={fg} strokeWidth="1.2" />
      <rect x="8" y="8" width="84" height="84" fill="none" stroke="#b08d57" strokeWidth="0.6" />
      <text x="16" y="72" fill={fg} style={letter}>
        D
      </text>
      <text x="46" y="72" fill={fg} style={letter}>
        V
      </text>
      <line x1="16" y1="78" x2="84" y2="78" stroke="#b08d57" strokeWidth="0.8" />
    </svg>
  );
}
