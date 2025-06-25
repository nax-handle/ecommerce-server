"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ratings } from "@/components/ui/rating";
import { OrderItem } from "@/lib/services/order";
import { useMutation } from "@tanstack/react-query";
import { ReviewProducts, reviewProducts } from "@/lib/services/review";
import { toast } from "sonner";

interface ProductReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  orderId: string;
  shopId: string;
}

export function ProductReviewDialog({
  isOpen,
  onClose,
  orderItems,
  orderId,
  shopId,
}: ProductReviewDialogProps) {
  const [reviews, setReviews] = useState<{
    [itemId: string]: {
      rating: number;
      comment: string;
      productId: string;
      variation: string;
    };
  }>({});

  const handleRatingChange = (itemId: string, rating: number) => {
    const targetItem = orderItems.find((item) => item.id === itemId);
    if (!targetItem) return;

    setReviews((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        rating,
        productId: targetItem.productId,
        variation: targetItem.variation,
      },
    }));
  };

  const handleCommentChange = (itemId: string, comment: string) => {
    const targetItem = orderItems.find((item) => item.id === itemId);
    if (!targetItem) return;

    setReviews((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        comment,
        productId: targetItem.productId,
        variation: targetItem.variation,
      },
    }));
  };
  const { mutate } = useMutation({
    mutationFn: (reviews: ReviewProducts[]) => reviewProducts(reviews),
    mutationKey: ["review"],
    onError: (error) => {
      toast.message("Đánh giá sản phẩm thất bại");
    },
    onSuccess: () => {
      toast.message("Đánh giá sản phẩm thành công");
    },
  });
  const handleSubmit = () => {
    const reviewData = Object.entries(reviews).map(([itemId, review]) => ({
      ...review,
      product: review.productId,
      orderId,
      shopId,
      itemId,
    }));
    mutate(reviewData);
    console.log("Review Data:", reviewData);
    setReviews({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <h2 className="text-lg font-medium">Đánh giá sản phẩm</h2>
        {orderItems.map((item) => (
          <div key={item.id} className="mt-4">
            <h3 className="font-medium">
              {item.productName}
              {item.variation && ` - ${item.variation}`}{" "}
              {/* Hiển thị biến thể nếu có */}
            </h3>
            <div className="mx-auto w-fit my-5">
              <Ratings
                rating={reviews[item.id]?.rating || 0}
                onChange={(rating) => handleRatingChange(item.id, rating)}
              />
            </div>
            <Input
              placeholder="Nhập bình luận của bạn"
              value={reviews[item.id]?.comment || ""}
              onChange={(e) => handleCommentChange(item.id, e.target.value)}
              className="mt-2"
            />
          </div>
        ))}
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} className="ml-2">
            Gửi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
