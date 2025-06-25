import { Order, OrdersResponse } from "@/lib/services/order";
import { SHIPPING_STATUS, ORDER_STATUS } from "@/lib/constants/order";

export const dummyOrders: Order[] = [
  {
    id: "order-1",
    isReview: false,
    shop: {
      id: "shop-1",
      name: "TechStore",
      logo: "/logo/avatar.png",
      slug: "techstore",
    },
    status: ORDER_STATUS.SHIPPED,
    shippingStatus: SHIPPING_STATUS.DELIVERED,
    createdAt: "2024-01-15T10:30:00Z",
    orderItems: [
      {
        id: "item-1",
        productName: "Wireless Bluetooth Headphones",
        productId: "1",
        productThumbnail: "/products/ex_prod.png",
        variation: "Black",
        quantity: 1,
        price: 79.99,
        tags: "electronics,audio",
        category: "Electronics",
      },
    ],
    totalPrice: 79.99,
  },
  {
    id: "order-2",
    isReview: true,
    shop: {
      id: "shop-2",
      name: "AccessoryHub",
      logo: "/logo/avatar.png",
      slug: "accessoryhub",
    },
    status: ORDER_STATUS.SHIPPED,
    shippingStatus: SHIPPING_STATUS.IN_TRANSIT,
    createdAt: "2024-01-20T14:20:00Z",
    orderItems: [
      {
        id: "item-2",
        productName: "Smartphone Case",
        productId: "2",
        productThumbnail: "/products/ex_prod.png",
        variation: "Clear",
        quantity: 2,
        price: 19.99,
        tags: "accessories,phone",
        category: "Accessories",
      },
    ],
    totalPrice: 39.98,
  },
  {
    id: "order-3",
    isReview: false,
    shop: {
      id: "shop-1",
      name: "TechStore",
      logo: "/logo/avatar.png",
      slug: "techstore",
    },
    status: ORDER_STATUS.PENDING,
    shippingStatus: SHIPPING_STATUS.NOT_PACKED,
    createdAt: "2024-01-25T09:15:00Z",
    orderItems: [
      {
        id: "item-3",
        productName: "Gaming Keyboard RGB",
        productId: "4",
        productThumbnail: "/products/ex_prod.png",
        variation: "Blue Switch",
        quantity: 1,
        price: 89.99,
        tags: "electronics,gaming",
        category: "Electronics",
      },
      {
        id: "item-4",
        productName: "Wireless Mouse",
        productId: "5",
        productThumbnail: "/products/ex_prod.png",
        variation: "Black",
        quantity: 1,
        price: 29.99,
        tags: "electronics,computer",
        category: "Electronics",
      },
    ],
    totalPrice: 119.98,
  },
  {
    id: "order-4",
    isReview: false,
    shop: {
      id: "shop-2",
      name: "AccessoryHub",
      logo: "/logo/avatar.png",
      slug: "accessoryhub",
    },
    status: ORDER_STATUS.PAID,
    shippingStatus: SHIPPING_STATUS.PACKED,
    createdAt: "2024-01-28T16:45:00Z",
    orderItems: [
      {
        id: "item-5",
        productName: "USB-C Hub",
        productId: "6",
        productThumbnail: "/products/ex_prod.png",
        variation: "7-Port",
        quantity: 1,
        price: 59.99,
        tags: "electronics,accessories",
        category: "Electronics",
      },
    ],
    totalPrice: 59.99,
  },
  {
    id: "order-5",
    isReview: false,
    shop: {
      id: "shop-1",
      name: "TechStore",
      logo: "/logo/avatar.png",
      slug: "techstore",
    },
    status: ORDER_STATUS.CANCELLED,
    shippingStatus: SHIPPING_STATUS.CANCELLED,
    createdAt: "2024-01-22T11:30:00Z",
    orderItems: [
      {
        id: "item-6",
        productName: "Laptop Stand",
        productId: "3",
        productThumbnail: "/products/ex_prod.png",
        variation: "Standard",
        quantity: 1,
        price: 45.99,
        tags: "office,accessories",
        category: "Office",
      },
    ],
    totalPrice: 45.99,
  },
  {
    id: "order-6",
    isReview: true,
    shop: {
      id: "shop-2",
      name: "AccessoryHub",
      logo: "/logo/avatar.png",
      slug: "accessoryhub",
    },
    status: ORDER_STATUS.COD_PENDING,
    shippingStatus: SHIPPING_STATUS.AWAITING_PICKUP,
    createdAt: "2024-01-30T12:00:00Z",
    orderItems: [
      {
        id: "item-7",
        productName: "Laptop Stand Adjustable",
        productId: "3",
        productThumbnail: "/products/ex_prod.png",
        variation: "Premium",
        quantity: 1,
        price: 65.99,
        tags: "office,accessories",
        category: "Office",
      },
    ],
    totalPrice: 65.99,
  },
];

export const getDummyOrders = (
  page: number,
  size: number,
  status?: string
): OrdersResponse => {
  let filteredOrders = dummyOrders;

  if (status && status !== "ALL") {
    filteredOrders = dummyOrders.filter((order) => order.status === status);
  }

  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  return {
    total: filteredOrders.length,
    totalPages: Math.ceil(filteredOrders.length / size),
    page,
    data: paginatedOrders,
  };
};

export const createDummyOrder = (checkoutData: any): any => {
  console.log("Creating order with data:", checkoutData);
  return {
    success: true,
    orderId: `order-${Date.now()}`,
    message: "Order created successfully",
  };
};
