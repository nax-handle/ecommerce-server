import { Shop } from "@/lib/services/shop";
import { CartShop } from "@/lib/services/cart";

export const dummyShops: Shop[] = [
  {
    id: "shop-1",
    name: "TechStore",
    slug: "techstore",
    logo: "/logo/avatar.png",
    description: "Your one-stop shop for all tech gadgets and accessories",
    phoneNumber: "+1-555-123-4567",
    address: "123 Tech Street",
    detailedAddress: "123 Tech Street, Silicon Valley, CA 94000",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "shop-2",
    name: "AccessoryHub",
    slug: "accessoryhub",
    logo: "/logo/avatar.png",
    description: "Premium accessories for your devices",
    phoneNumber: "+1-555-987-6543",
    address: "456 Accessory Lane",
    detailedAddress: "456 Accessory Lane, New York, NY 10001",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
];

export const findShopById = (shopId: string): Shop | undefined => {
  return dummyShops.find((shop) => shop.id === shopId);
};
