import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartShop } from "@/lib/services/cart";
import { getDummyCart } from "@/data/dummy/cart";

interface CartState {
  cartItems: CartShop[];
  totalItems: number;
  setCartItems: (items: CartShop[]) => void;
  updateTotalItems: () => void;
  initializeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: getDummyCart(), // Initialize with dummy data
      totalItems: 0,
      setCartItems: (items) => {
        set({ cartItems: items });
        get().updateTotalItems();
      },
      updateTotalItems: () => {
        const total = get().cartItems.reduce((acc, shop) => {
          return (
            acc +
            shop.products.reduce((sum, product) => sum + product.quantity, 0)
          );
        }, 0);
        set({ totalItems: total });
      },
      initializeCart: () => {
        const dummyCart = getDummyCart();
        set({ cartItems: dummyCart });
        get().updateTotalItems();
      },
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => (state) => {
        // Initialize cart with dummy data and update totals after rehydration
        if (state) {
          state.updateTotalItems();
        }
      },
    }
  )
);
