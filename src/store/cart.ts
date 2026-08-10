import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  sub: string;
  size: string;
  price: number;
  qty: number;
  img: string | null;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  updateQty: (index: number, delta: number) => void;
  remove: (index: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find(
            (i) => i.productId === item.productId && i.size === item.size,
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                i === existing ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, qty }] };
        }),
      updateQty: (index, delta) =>
        set((s) => ({
          items: s.items
            .map((i, idx) => (idx === index ? { ...i, qty: i.qty + delta } : i))
            .filter((i) => i.qty > 0),
        })),
      remove: (index) =>
        set((s) => ({ items: s.items.filter((_, idx) => idx !== index) })),
      clear: () => set({ items: [] }),
    }),
    { name: "troobio_cart" },
  ),
);

export const cartCount = (items: CartItem[]) =>
  items.reduce((a, i) => a + i.qty, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((a, i) => a + i.qty * i.price, 0);
