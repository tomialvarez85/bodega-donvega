import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  /** Stock al momento de agregar; tope para las cantidades del carrito. */
  stock: number;
};

/** Datos vigentes de un producto, tal como los devuelve el servidor. */
export type FreshProduct = Omit<CartItem, "quantity">;

type CartState = {
  items: CartItem[];
  // UI (no se persiste)
  isOpen: boolean;
  notice: string | null;

  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  /** Alinea el carrito con los datos actuales de la base (precio, stock, disponibilidad). */
  syncItems: (fresh: FreshProduct[]) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const units = (n: number) => `${n} ${n === 1 ? "unidad" : "unidades"}`;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      notice: null,

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existing = items.find((item) => item.id === product.id);
        const current = existing?.quantity ?? 0;
        const wanted = current + Math.max(1, Math.floor(quantity));
        const allowed = Math.min(wanted, product.stock);

        let notice: string | null = null;
        if (product.stock <= 0) {
          notice = `${product.name} no tiene stock disponible.`;
        } else if (allowed === current) {
          notice = `Ya tenés en el carrito las ${units(product.stock)} disponibles de ${product.name}.`;
        } else if (allowed < wanted) {
          notice = `Solo hay ${units(product.stock)} de ${product.name}: cargamos el máximo disponible.`;
        }

        // Datos frescos del producto (precio, stock, imagen) pisan los guardados.
        const nextItems =
          allowed <= 0
            ? items
            : existing
              ? items.map((item) =>
                  item.id === product.id
                    ? { ...item, ...product, quantity: allowed }
                    : item,
                )
              : [...items, { ...product, quantity: allowed }];

        set({ items: nextItems, notice, isOpen: true });
      },

      setQuantity: (id, quantity) =>
        set((state) => ({
          notice: null,
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: Math.min(Math.max(quantity, 1), item.stock),
                }
              : item,
          ),
        })),

      syncItems: (fresh) =>
        set((state) => {
          const byId = new Map(fresh.map((product) => [product.id, product]));
          const items = state.items.flatMap((item) => {
            const current = byId.get(item.id);
            // Ya no existe, se ocultó o se agotó: sale del carrito.
            if (!current || current.stock <= 0) return [];
            return [
              {
                ...item,
                ...current,
                quantity: Math.min(item.quantity, current.stock),
              },
            ];
          });
          return { items };
        }),

      removeItem: (id) =>
        set((state) => ({
          notice: null,
          items: state.items.filter((item) => item.id !== id),
        })),

      clear: () => set({ items: [], notice: null }),
      open: () => set({ isOpen: true, notice: null }),
      close: () => set({ isOpen: false, notice: null }),
    }),
    {
      name: "don-vega-cart",
      version: 1,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const selectItemCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectTotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
