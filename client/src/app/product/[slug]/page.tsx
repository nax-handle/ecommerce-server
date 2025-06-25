"use client";

import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import ProductGallery from "@/components/product/product-gallery";
import ProductInfo from "@/components/product/product-info";
import ShopInfo from "@/components/shop/shop-info";
import { ProductReviewsSummary } from "@/components/product/product-reviews-summary";
import { ProductLoading } from "@/components/ui/loading";
import { getProductBySlug } from "@/lib/services/product";
import { getShopById, Shop } from "@/lib/services/shop";
import {
  getReviewsProduct,
  getReviewStats,
  ReviewsProduct,
  Stats,
} from "@/lib/services/review";
import { useState } from "react";

export default function ProductPage() {
  const params = useParams();
  const [currentPage, setcurrentPage] = useState<number>(1);
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", params.slug],
    queryFn: () => getProductBySlug(params.slug as string),
  });

  const { data: shopData, isLoading: isLoadingShop } = useQuery<Shop | null>({
    queryKey: ["shop", productData?.data?.shop],
    queryFn: async () => {
      if (!productData?.data?.shop) return null;
      const data = await getShopById(productData.data.shop);
      return data;
    },
    enabled: !!productData?.data?.shop,
  });

  const { data: statsData, isLoading: isLoadingStats } = useQuery<Stats>({
    queryKey: ["reviewStats", params.slug],
    queryFn: async () => {
      return await getReviewStats(productData.data._id);
    },
    enabled: !!productData?.data?._id,
  });

  const { data: reviewsData, isLoading: isLoadingReviews } =
    useQuery<ReviewsProduct>({
      queryKey: ["reviews", params.slug],
      queryFn: async () => {
        return getReviewsProduct(productData?.data?._id, currentPage);
      },
      enabled: !!productData?.data?._id,
    });

  if (isLoadingProduct || isLoadingShop || isLoadingStats || isLoadingReviews) {
    return (
      <Container className="py-10">
        <ProductLoading />
      </Container>
    );
  }

  if (!productData?.data) {
    return (
      <Container>
        <div className="flex h-[600px] items-center justify-center">
          <p className="text-lg text-gray-500">Product not found</p>
        </div>
      </Container>
    );
  }

  const product = productData.data;

  return (
    <Container className="py-10">
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
        <ProductGallery images={[...(product.images || [])]} />
        <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
          <ProductInfo product={product} />
        </div>
      </div>

      <Separator className="my-10" />
      {shopData && <ShopInfo shop={shopData} />}

      <Separator className="my-10" />

      <div className="space-y-6">
        <h3 className="text-lg font-medium">Mô tả sản phẩm</h3>
        <div className="prose max-w-none">{product.description}</div>
      </div>

      <Separator className="my-10" />

      <ProductReviewsSummary
        productId={product._id}
        stats={statsData || { average: 0, total: 0, distribution: [] }}
        recentReviews={
          reviewsData?.reviews.map((review) => ({
            ...review,
            createdAt: new Date(review.createdAt).toISOString(),
          })) || []
        }
      />
      <Separator className="my-10" />

      <div>
        {product.attributes.map(
          (attribute: { name: string; value: string }) => (
            <div key={attribute.name} className="flex justify-between">
              <span>{attribute.name}:</span>
              <span>{attribute.value || "Không có thông tin"}</span>
            </div>
          )
        )}

        {product.optionName && (
          <div>
            <strong>Option:</strong> {product.optionName}
          </div>
        )}
      </div>
    </Container>
  );
}
