import {
  getDummyReviewStats,
  getDummyReviewsProduct,
  createDummyReview,
} from "@/data/dummy/reviews";
import { delay } from "@/data/dummy/auth";

export interface Stats {
  average: number;
  total: number;
  distribution: Distribution[];
}

export interface Distribution {
  stars: number;
  count: number;
  percentage: number;
}
export interface ReviewsProduct {
  reviews: Review[];
  page: string;
  limit: number;
  totalPages: number;
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  images: string[];
  userId: string;
  userName: string;
  userAvatar: string;
  variation: string;
  likes: number;
  product: string;
  orderId: string;
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

export const getReviewStats = async (productId: string): Promise<Stats> => {
  await delay(300); // Simulate network delay
  return getDummyReviewStats(productId);
};
export const getReviewsProduct = async (
  productId: string,
  page: number
): Promise<ReviewsProduct> => {
  await delay(500); // Simulate network delay
  return getDummyReviewsProduct(productId, page);
};

export interface ReviewProducts {
  comment: string;
  rating: number;
  product: string;
  orderId: string;
  shopId: string;
}

export const reviewProducts = async (
  reviews: ReviewProducts[]
): Promise<ReviewsProduct> => {
  await delay(800); // Simulate network delay
  return createDummyReview(reviews);
};
