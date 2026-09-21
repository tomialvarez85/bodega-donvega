// Link wa.me a partir de un teléfono argentino en cualquier formato razonable.
//
// Acepta "+54 9 11 5555-0101", "5491155550101", "011 5555-0101" o "11 5555-0101".
// Los números "de bolsillo" con 15 (011 15 5555-0101) no se pueden convertir de forma
// confiable: el checkout debería pedir el teléfono con código de área y sin el 15.
export function normalizeArPhone(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (digits.startsWith("54")) {
    // Celulares: 54 + 9 + área + número. Si falta el 9, wa.me no encuentra el chat.
    if (!digits.startsWith("549") && digits.length === 12) {
      digits = `549${digits.slice(2)}`;
    }
  } else {
    // Formato nacional: 10 dígitos (área + número), con o sin 0 inicial.
    if (digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length !== 10) return null;
    digits = `549${digits}`;
  }

  return digits.length >= 12 && digits.length <= 13 ? digits : null;
}

export function whatsappUrl(phone: string, message: string): string | null {
  const normalized = normalizeArPhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

// WhatsApp de la bodega (NEXT_PUBLIC_WHATSAPP_NUMBER, solo dígitos con código de país, ej.
// 5492610000000). Devuelve null si no está configurado: el botón simplemente no se muestra.
export function businessWhatsappUrl(message: string): string | null {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (number.length < 10) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
