"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ProductFiltersProps {
  filters: {
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
  };
  onFilterChange: (filters: {
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
  }) => void;
}

export function ProductFilters({
  filters,
  onFilterChange,
}: ProductFiltersProps) {
  const [minPrice, setMinPrice] = useState<string>(
    filters.minPrice?.toString() ?? ""
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    filters.maxPrice?.toString() ?? ""
  );
  const [selectedRating, setSelectedRating] = useState<number | null>(
    filters.rating ?? null
  );

  const handleApplyFilters = () => {
    onFilterChange({
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      rating: selectedRating || undefined,
    });
  };
  const handleDeleteFilters = () => {
    onFilterChange({
      minPrice: undefined,
      maxPrice: undefined,
      rating: undefined,
    });
  };
  const handleRatingClick = (rating: number) => {
    setSelectedRating(selectedRating === rating ? null : rating);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Khoảng Giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-price">Từ</Label>
                <Input
                  id="min-price"
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-price">Đến</Label>
                <Input
                  id="max-price"
                  type="number"
                  placeholder="1000000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Đánh Giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant="ghost"
                className={`w-full justify-start px-2 ${
                  selectedRating === rating ? "bg-blue-50 text-blue-600" : ""
                }`}
                onClick={() => handleRatingClick(rating)}
              >
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < rating
                          ? "fill-current text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2">trở lên</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <Button
        onClick={handleApplyFilters}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Áp Dụng
      </Button>
      <Button
        onClick={handleDeleteFilters}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        Xóa bộ lọc
      </Button>
    </div>
  );
}
