import { useMutation, useQuery } from "@tanstack/react-query";
import { SHIPPING_STATUS } from "@/lib/constants/order";
import { getDummyOrders, createDummyOrder } from "@/data/dummy/orders";
import { delay } from "@/data/dummy/auth";

export interface OrderItem {
  id: string;
  productName: string;
  productId: string;
  productThumbnail: string;
  variation: string;
  quantity: number;
  price: number;
  tags: string;
  category: string;
}
export interface Order {
  id: string;
  isReview: boolean;
  shop: {
    id: string;
    name: string;
    logo: string;
    slug: string;
  };
  status: string;
  shippingStatus: (typeof SHIPPING_STATUS)[keyof typeof SHIPPING_STATUS];
  createdAt: string;
  orderItems: OrderItem[];
  totalPrice: number;
}

export interface OrdersResponse {
  total: number;
  totalPages: number;
  page: number;
  data: Order[];
}

export const getOrders = async (
  page: number,
  size: number,
  status?: string
) => {
  await delay(500); // Simulate network delay
  console.log("Fetching orders with status:", status);
  return getDummyOrders(page, size, status);
};

export const useGetOrders = (page: number, size: number, status?: string) => {
  return useQuery<OrdersResponse>({
    queryKey: ["orders", page, status],
    queryFn: () => getOrders(page, size, status),
  });
};

interface CheckoutData {
  paymentMethod: string;
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    note: string;
  };
  orders: {
    shop: {
      name: string;
      logo: string;
      slug: string;
    };
    orderItems: {
      productId: string;
      variantId: string;
      productName: string;
      productThumbnail: string;
      category: string;
      tags: string;
      quantity: number;
      price: number;
    }[];
  }[];
}

export const useSubmitOrder = () => {
  return useMutation({
    mutationFn: async (checkoutData: CheckoutData) => {
      await delay(1000); // Simulate network delay
      return createDummyOrder(checkoutData);
    },
  });
};
