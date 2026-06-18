import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  productIds: string[];
  toggle: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (id) =>
        set((state) => ({
          productIds: state.productIds.includes(id)
            ? state.productIds.filter((p) => p !== id)
            : [...state.productIds, id],
        })),
      isWishlisted: (id) => get().productIds.includes(id),
      clear: () => set({ productIds: [] }),
    }),
    { name: "zyra-wishlist" },
  ),
);
