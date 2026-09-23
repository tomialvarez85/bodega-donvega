// Sin imports de servidor: solo lo usa el Client Component de la verificación de edad.
// sessionStorage vive únicamente en el navegador; estas funciones nunca se llaman en el servidor.

const STORAGE_KEY = "edad-verificada";

// true si ya confirmó ser mayor de edad en esta apertura del sitio (pestaña/sesión actual).
// sessionStorage se borra al cerrar la pestaña, así que se vuelve a preguntar en cada visita
// nueva, pero no en cada página mientras navega dentro de la misma sesión.
export function isAgeVerified(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Modo privado, storage lleno o deshabilitado: no se puede recordar la elección, se
    // vuelve a preguntar (falla hacia el lado seguro, no hacia "dejar pasar").
    return false;
  }
}

export function setAgeVerified() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Si no se puede guardar, simplemente se vuelve a preguntar en la próxima página.
  }
}
