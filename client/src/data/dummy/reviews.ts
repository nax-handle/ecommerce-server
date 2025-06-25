import {
  Review,
  ReviewsProduct,
  Stats,
  Distribution,
  ReviewProducts,
} from "@/lib/services/review";

export const dummyReviews: Review[] = [
  {
    _id: "review-1",
    rating: 5,
    comment:
      "Excellent headphones! The sound quality is amazing and battery life is great.",
    images: [],
    userId: "user-1",
    userName: "John Doe",
    userAvatar: "/logo/avatar.png",
    variation: "Black",
    likes: 12,
    product: "1",
    orderId: "order-1",
    shopId: "shop-1",
    createdAt: "2024-01-16T09:00:00Z",
    updatedAt: "2024-01-16T09:00:00Z",
  },
  {
    _id: "review-2",
    rating: 4,
    comment: "Good quality case, fits perfectly and provides good protection.",
    images: [],
    userId: "user-2",
    userName: "Jane Smith",
    userAvatar: "/logo/avatar.png",
    variation: "Clear",
    likes: 8,
    product: "2",
    orderId: "order-2",
    shopId: "shop-2",
    createdAt: "2024-01-18T15:30:00Z",
    updatedAt: "2024-01-18T15:30:00Z",
  },
  {
    _id: "review-3",
    rating: 5,
    comment: "Perfect laptop stand, very sturdy and adjustable.",
    images: [],
    userId: "user-3",
    userName: "Bob Johnson",
    userAvatar: "/logo/avatar.png",
    variation: "Standard",
    likes: 5,
    product: "3",
    orderId: "order-3",
    shopId: "shop-1",
    createdAt: "2024-01-20T11:15:00Z",
    updatedAt: "2024-01-20T11:15:00Z",
  },
];

export const getDummyReviewStats = (productId: string): Stats => {
  const productReviews = dummyReviews.filter(
    (review) => review.product === productId
  );
  const total = productReviews.length;

  if (total === 0) {
    return {
      average: 0,
      total: 0,
      distribution: [
        { stars: 5, count: 0, percentage: 0 },
        { stars: 4, count: 0, percentage: 0 },
        { stars: 3, count: 0, percentage: 0 },
        { stars: 2, count: 0, percentage: 0 },
        { stars: 1, count: 0, percentage: 0 },
      ],
    };
  }

  const ratingCounts = [0, 0, 0, 0, 0]; // [1-star, 2-star, 3-star, 4-star, 5-star]
  let totalRating = 0;

  productReviews.forEach((review) => {
    ratingCounts[review.rating - 1]++;
    totalRating += review.rating;
  });

  const average = totalRating / total;
  const distribution: Distribution[] = ratingCounts
    .map((count, index) => ({
      stars: index + 1,
      count,
      percentage: (count / total) * 100,
    }))
    .reverse(); // Reverse to show 5-star first

  return {
    average,
    total,
    distribution,
  };
};

export const getDummyReviewsProduct = (
  productId: string,
  page: number
): ReviewsProduct => {
  const productReviews = dummyReviews.filter(
    (review) => review.product === productId
  );
  const limit = 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedReviews = productReviews.slice(startIndex, endIndex);

  return {
    reviews: paginatedReviews,
    page: page.toString(),
    limit,
    totalPages: Math.ceil(productReviews.length / limit),
  };
};

export const createDummyReview = (
  reviews: ReviewProducts[]
): ReviewsProduct => {
  console.log("Creating reviews:", reviews);
  return {
    reviews: [],
    page: "1",
    limit: 10,
    totalPages: 1,
  };
};
