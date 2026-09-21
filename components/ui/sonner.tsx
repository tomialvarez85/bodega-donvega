"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

// Versión mínima del Toaster de shadcn, sin next-themes (el sistema es oscuro).
export function Toaster(props: ToasterProps) {
  return <Sonner theme="dark" position="top-right" richColors {...props} />;
}
