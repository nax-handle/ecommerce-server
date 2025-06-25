"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ThumbsUp, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ReviewCardProps {
  review: {
    _id: string;
    rating: number;
    comment: string;
    images?: string[];
    userName: string;
    userAvatar: string;
    createdAt: string;
    variation: string;
    likes: number;
    isLiked?: boolean;
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [isLiked, setIsLiked] = useState(review.isLiked || false);
  const [likesCount, setLikesCount] = useState(review.likes);
  const [showFullComment, setShowFullComment] = useState(false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const shouldTruncate = review.comment.length > 300;
  const displayComment =
    shouldTruncate && !showFullComment
      ? review.comment.slice(0, 300) + "..."
      : review.comment;

  return (
    <div className="space-y-4 border-b pb-6">
      {/* User Info and Rating */}
      <div className="flex items-start gap-3">
        <Image
          src={review.userAvatar}
          alt={review.userName}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="flex-1">
          <h4 className="font-medium">{review.userName}</h4>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-4 w-4",
                  star <= review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                )}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm", {
              locale: vi,
            })}
            | Phân loại: {review.variation}
          </p>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-3">
        <p className="text-gray-700 whitespace-pre-line">{displayComment}</p>
        {shouldTruncate && (
          <button
            onClick={() => setShowFullComment(!showFullComment)}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            {showFullComment ? "Thu gọn" : "Xem thêm"}
          </button>
        )}

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            {review.images.map((image, index) => (
              <div
                key={index}
                className="relative h-[100px] w-[100px] overflow-hidden rounded-lg"
              >
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            className={cn(
              "text-gray-500 hover:text-blue-600",
              isLiked && "text-blue-600"
            )}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Hữu ích ({likesCount})
          </Button>
          <Button disabled variant="ghost" size="sm" className="text-gray-500">
            <MessageCircle className="h-4 w-4 mr-2" />
            Trả lời
          </Button>
        </div>
      </div>
    </div>
  );
}
