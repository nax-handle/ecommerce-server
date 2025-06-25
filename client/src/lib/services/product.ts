import { useQuery } from "@tanstack/react-query";
import {
  generateDummyProductsResponse,
  findProductBySlug,
  dummyProducts,
} from "@/data/dummy/products";
import { delay } from "@/data/dummy/auth";

export interface Variant {
  _id: string;
  name: string;
  value: string;
  stock: number;
  price: number;
  sku: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  status: string;
  price: number;
  discount: number;
  stock: number;
  description: string;
  thumbnail: string;
  images: string[];
  soldCount: number;
  brand: string;
  origin: string;
  shop: string;
  category: string;
  subcategory: string;
  variantName: string;
  optionName: string;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  variants: Variant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  data: {
    total: number;
    totalPage: number;
    page: number;
    products: Product[];
  };
  message: string;
}

export const getProducts = async ({
  pageParam = 1,
  size = 12,
}: {
  pageParam?: number;
  size?: number;
}) => {
  await delay(500); // Simulate network delay
  return generateDummyProductsResponse(pageParam, size);
};

export const getProductBySlug = async (slug: string) => {
  await delay(300); // Simulate network delay
  const product = findProductBySlug(slug);
  if (!product) {
    throw new Error("Product not found");
  }
  return { data: product };
};

export interface SearchProductsParams {
  keyword?: string;
  sortByPrice?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  page?: number;
}

export async function searchProducts(
  params: SearchProductsParams
): Promise<ProductsResponse> {
  await delay(500); // Simulate network delay

  let filteredProducts = [...dummyProducts];

  // Apply keyword filter
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword)
    );
  }

  // Apply price filter
  if (params.minPrice) {
    filteredProducts = filteredProducts.filter(
      (product) => product.price >= params.minPrice!
    );
  }
  if (params.maxPrice) {
    filteredProducts = filteredProducts.filter(
      (product) => product.price <= params.maxPrice!
    );
  }

  // Apply sorting
  if (params.sortByPrice) {
    filteredProducts.sort((a, b) =>
      params.sortByPrice === "asc" ? a.price - b.price : b.price - a.price
    );
  }

  // Apply pagination
  const page = params.page || 1;
  const size = 12;
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return {
    data: {
      total: filteredProducts.length,
      totalPage: Math.ceil(filteredProducts.length / size),
      page,
      products: paginatedProducts,
    },
    message: "Products searched successfully",
  };
}

export function useSearchProducts(params: SearchProductsParams) {
  return useQuery({
    queryKey: ["products", "search", params],
    queryFn: () => searchProducts(params),
  });
}
