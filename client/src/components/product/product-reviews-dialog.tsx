"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/review/review-card";
import { Star, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductReviewsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    average: number;
    total: number;
    distribution: Array<{
      stars: number;
      count: number;
      percentage: number;
    }>;
  };
  reviews: {
    _id: string;
    rating: number;
    comment: string;
    images?: string[];
    userName: string;
    userAvatar: string;
    createdAt: string;
    variation: string;
    likes: number;
  }[];
}

const ITEMS_PER_PAGE = 5;

export function ProductReviewsDialog({
  isOpen,
  onClose,
  stats,
  reviews,
}: ProductReviewsDialogProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showWithImages, setShowWithImages] = useState(false);

  const filteredReviews = reviews.filter((review) => {
    if (filterRating && review.rating !== filterRating) return false;
    if (showWithImages && (!review.images || review.images.length === 0))
      return false;
    return true;
  });

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReviews = filteredReviews.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <div className="flex-1 overflow-y-auto px-1">
          {/* Rating Summary */}
          <div className="flex gap-8 border-b pb-6 sticky top-0 bg-white z-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.average}/5
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= Math.floor(stats.average)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {stats.total} đánh giá
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1">
              {stats.distribution.map((stat) => (
                <div key={stat.stars} className="flex items-center gap-2 mb-2">
                  <div className="w-12 text-sm">{stat.stars} sao</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-500">{stat.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 py-4 border-b overflow-x-auto sticky top-[104px] bg-white z-10">
            <Button
              variant={filterRating === null ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilterRating(null);
                setCurrentPage(1);
              }}
            >
              Tất cả
            </Button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={filterRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterRating(rating);
                  setCurrentPage(1);
                }}
              >
                {rating} Sao (
                {stats.distribution.find((d) => d.stars === rating)?.count})
              </Button>
            ))}
            <Button
              variant={showWithImages ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowWithImages(!showWithImages);
                setCurrentPage(1);
              }}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Có hình ảnh
            </Button>
          </div>

          <div className="space-y-6 mt-6">
            {paginatedReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={{
                  ...review,
                  createdAt: review.createdAt,
                }}
              />
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trang trước
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Trang sau
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
