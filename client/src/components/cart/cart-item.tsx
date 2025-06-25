"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "@/lib/services/cart";
import { VariantColorSelect } from "../product/variant-title-select";
import { VariantSizeSelect } from "../product/variant-value-select";
import { useUpdateVariant } from "@/lib/services/cart";

interface CartItemProps {
  item: CartItem;
  shopId: string;
}

export function CartItemCard({ item, shopId }: CartItemProps) {
  const { mutate: updateVariant } = useUpdateVariant();
  const [selectedName, setSelectedName] = useState(item.variant?.name || "");
  const [selectedValue, setSelectedValue] = useState(item.variant?.value || "");

  const handleNameSelect = (name: string | null) => {
    if (!name) return;
    setSelectedName(name);

    const newVariant = item.variants?.find(
      (v) => v.name === name && v.value === selectedValue
    );

    if (newVariant) {
      const updateData = {
        productId: item._id,
        quantity: item.quantity.toString(),
        oldVariantId: item.variantId!,
        newVariantId: newVariant._id,
        shopId: shopId,
      };
      console.log("Updating variant:", updateData);
      updateVariant(updateData);
    }
  };

  const handleValueSelect = (value: string | null) => {
    if (!value) return;
    setSelectedValue(value);

    const newVariant = item.variants?.find(
      (v) => v.name === selectedName && v.value === value
    );

    if (newVariant) {
      const updateData = {
        productId: item._id,
        quantity: item.quantity.toString(),
        oldVariantId: item.variantId!,
        newVariantId: newVariant._id,
        shopId: shopId,
      };
      console.log("Updating variant:", updateData);
      updateVariant(updateData);
    }
  };

  const uniqueNames = Array.from(
    new Set(item.variants?.map((v) => v.name) || [])
  );
  const allValues = Array.from(
    new Set(item.variants?.map((v) => v.value) || [])
  ).sort((a, b) => Number(a) - Number(b));

  const nameAvailability = uniqueNames.map((name) => {
    const hasAvailableVariants = item.variants?.some(
      (v) => v.name === name && v.stock > 0
    );
    return {
      name,
      available: hasAvailableVariants || false,
    };
  });

  const valueAvailability = allValues.map((value) => {
    const hasAvailableVariants = item.variants?.some(
      (v) => v.value === value && v.stock > 0
    );
    return {
      value,
      available: hasAvailableVariants || false,
    };
  });

  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <div className="relative w-24 h-24">
        <Image
          src={item.thumbnail}
          alt={item.title}
          fill
          className="object-cover rounded-md"
        />
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="font-medium">{item.title}</h3>

        {item.variants && (
          <div className="space-y-2">
            <VariantColorSelect
              names={nameAvailability}
              selectedName={selectedName}
              onSelect={handleNameSelect}
              title="Màu sắc"
            />
            <VariantSizeSelect
              values={valueAvailability}
              selectedValue={selectedValue}
              onSelect={handleValueSelect}
              title="Kích cỡ"
            />
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-blue-500 font-medium">
            ₫{formatPrice(item.price)}
          </span>
          <span className="text-gray-500">x{item.quantity}</span>
        </div>
      </div>
    </div>
  );
}
