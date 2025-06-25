export interface Shop {
  id: string;
  name: string;
  logo: string;
  slug: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  thumbnail: string;
  price: number;
  quantity: number;
  category: string;
  tags: string;
  variant?: {
    name: string;
    value: string;
  };
}

export interface Order {
  id: string;
  shop: Shop;
  isReview: boolean;
  orderItems: OrderItem[];
}

export interface CheckoutData {
  user: {
    id: string;
    name: string;
  };
  orders: Order[];
}

export type PaymentMethod = "pointer_wallet" | "stripe" | "cod";
