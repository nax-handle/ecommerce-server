"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface ProductQuantityProps {
  quantity: number;
  stock: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function ProductQuantity({
  quantity,
  stock,
  onIncrement,
  onDecrement,
}: ProductQuantityProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Số lượng</h3>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onDecrement}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={onIncrement}
          disabled={quantity >= stock}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
