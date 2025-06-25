import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const ratingVariants = {
  default: {
    star: "text-yellow-500 fill-yellow-500",
    emptyStar: "text-gray-300 fill-transparent",
  },
};

interface RatingsProps {
  rating: number;
  totalStars?: number;
  size?: number;
  Icon?: React.ElementType;
  variant?: keyof typeof ratingVariants;
  onChange?: (rating: number) => void;
}

const Ratings = ({
  rating,
  totalStars = 5,
  size = 40,
  Icon = Star,
  variant = "default",
  onChange,
  ...props
}: RatingsProps) => {
  return (
    <div className={cn("flex items-center gap-2")} {...props}>
      {[...Array(totalStars)].map((_, i) => {
        const starValue = i + 1;
        return (
          <Icon
            key={starValue}
            size={size}
            onClick={() => onChange?.(starValue)}
            className={cn(
              starValue <= rating
                ? ratingVariants[variant].star
                : ratingVariants[variant].emptyStar,
              "cursor-pointer"
            )}
          />
        );
      })}
    </div>
  );
};

export { Ratings };
