import { create } from "zustand";

interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  thumbnail: string;
  category: string;
  tags: string;
  quantity: number;
  price: number;
  variant?: {
    name: string;
    value: string;
  };
}

interface Order {
  shop: {
    id: string;
    name: string;
    logo: string;
    slug: string;
  };
  orderItems: OrderItem[];
  message?: string;
}

interface CheckoutStore {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  clearOrders: () => void;
  setOrderMessage: (shopId: string, message: string) => void;
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  clearOrders: () => set({ orders: [] }),
  setOrderMessage: (shopId, message) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.shop.id === shopId ? { ...order, message } : order
      ),
    })),
}));
