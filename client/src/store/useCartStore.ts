import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "_id">) => "added" | "updated";
  setQuantityByProduct: (
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (newItem) => {
        const state = get();
        const existing = state.items.find((i) => i.product === newItem.product);
        if (existing) {
          set({
            items: state.items.map((i) =>
              i._id === existing._id
                ? {
                    ...i,
                    quantity: i.quantity + newItem.quantity,
                    size: i.size === newItem.size ? i.size : "Mixed",
                    color: i.color === newItem.color ? i.color : "Mixed",
                  }
                : i,
            ),
          });
          return "updated";
        }
        set({
          items: [...state.items, { ...newItem, _id: crypto.randomUUID() }],
        });
        return "added";
      },
      setQuantityByProduct: (productId, quantity, size, color) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.product !== productId)
              : state.items.map((i) =>
                  i.product === productId
                    ? {
                        ...i,
                        quantity,
                        size: size ?? i.size,
                        color: color ?? i.color,
                      }
                    : i,
                ),
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i._id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i._id !== id)
              : state.items.map((i) => (i._id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      total: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    { name: "zyra-cart" },
  ),
);
