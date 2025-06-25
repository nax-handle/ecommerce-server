import { findShopById } from "@/data/dummy/shops";
import { delay } from "@/data/dummy/auth";

export interface Shop {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  phoneNumber: string;
  address: string;
  detailedAddress: string;
  createdAt: string;
  updatedAt: string;
}

export const getShopById = async (shopId: string): Promise<Shop> => {
  await delay(300); // Simulate network delay
  const shop = findShopById(shopId);
  if (!shop) {
    throw new Error("Shop not found");
  }
  return shop;
};
