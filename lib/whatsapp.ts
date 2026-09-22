// WhatsApp de la bodega (NEXT_PUBLIC_WHATSAPP_NUMBER, solo dígitos con código de país, ej.
// 5492610000000). Devuelve null si no está configurado: el botón simplemente no se muestra.
export function businessWhatsappUrl(message: string): string | null {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (number.length < 10) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// Número de WhatsApp de la bodega para mostrar en pantalla ("+5493835000000" => "+54 9 3835000000").
// Devuelve null si NEXT_PUBLIC_WHATSAPP_NUMBER no está configurado.
export function businessWhatsappDisplay(): string | null {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (number.length < 10) return null;
  return number.startsWith("549")
    ? `+54 9 ${number.slice(3)}`
    : `+${number}`;
}
