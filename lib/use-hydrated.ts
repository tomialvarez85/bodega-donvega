import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false en el servidor y durante la hidratación; true después. Sirve para no
// renderizar datos de localStorage (carrito) hasta que el HTML ya coincide.
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
