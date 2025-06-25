"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface QuantitySelectorProps {
  max: number;
  onQuantityChange?: (quantity: number) => void;
  initialQuantity?: number;
}

export function QuantitySelector({
  max,
  onQuantityChange = () => {},
  initialQuantity = 1,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(Math.min(initialQuantity, max));

  const increaseQuantity = () => {
    if (quantity < max) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center rounded-lg border border-gray-200 bg-white">
        <button
          onClick={decreaseQuantity}
          className="flex h-9 w-9 items-center justify-center border-r border-gray-200 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-14 items-center justify-center text-center text-sm font-medium text-gray-900">
          {quantity}
        </div>
        <button
          onClick={increaseQuantity}
          className="flex h-9 w-9 items-center justify-center border-l border-gray-200 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={quantity >= max}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
