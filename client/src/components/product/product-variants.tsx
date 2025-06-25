"use client";

import { Button } from "@/components/ui/button";
import { Variant } from "@/lib/services/product";

interface ProductVariantsProps {
  variants: Variant[];
  variantName: string;
  optionName: string;
  selectedColor: string | null;
  selectedSize: string | null;
  onColorSelect: (color: string) => void;
  onSizeSelect: (size: string) => void;
}

export function ProductVariants({
  variants,
  variantName,
  optionName,
  selectedColor,
  selectedSize,
  onColorSelect,
  onSizeSelect,
}: ProductVariantsProps) {
  // Group variants by color and size
  const variantOptions = variants.reduce<{
    colors: Set<string>;
    sizes: Set<string>;
  }>(
    (acc, variant) => {
      acc.colors.add(variant.name);
      acc.sizes.add(variant.value);
      return acc;
    },
    { colors: new Set<string>(), sizes: new Set<string>() }
  );

  return (
    <>
      {/* Color Variants */}
      <div className="space-y-4">
        <h3 className="font-medium">{variantName}</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(variantOptions.colors).map((color) => (
            <Button
              key={color}
              variant={selectedColor === color ? "default" : "outline"}
              onClick={() => onColorSelect(color)}
              className="min-w-24"
            >
              {color}
            </Button>
          ))}
        </div>
      </div>

      {/* Size Variants */}
      <div className="space-y-4">
        <h3 className="font-medium">{optionName}</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(variantOptions.sizes).map((size) => {
            const isAvailable = variants.some(
              (v) => v.name === selectedColor && v.value === size && v.stock > 0
            );
            return (
              <Button
                key={size}
                variant={selectedSize === size ? "default" : "outline"}
                onClick={() => onSizeSelect(size)}
                disabled={!isAvailable}
                className="min-w-16"
              >
                {size}
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}
