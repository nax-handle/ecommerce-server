"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { QuantitySelector } from "./quantity-selector";
import { Star, ShoppingCart } from "lucide-react";
import { VariantColorSelect } from "./variant-title-select";
import { VariantSizeSelect } from "./variant-value-select";
import { Product } from "@/lib/services/product";
import { useAddToCart } from "@/lib/services/cart";
import { toast } from "sonner";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  const hasVariants = product.variants.length > 0;

  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [previousVariant, setPreviousVariant] = useState<string | null>(null);

  const onChangeQuantity = (value: number) => {
    setQuantity(value);
  };

  const handleNameSelect = (name: string | null) => {
    const oldVariant = currentVariant?._id;
    setSelectedName(name);
    setSelectedValue(null);

    if (oldVariant && name === null) {
      setPreviousVariant(oldVariant);
    }
  };

  const handleValueSelect = (value: string | null) => {
    const oldVariant = currentVariant?._id;
    setSelectedValue(value);

    const newVariant = product.variants.find(
      (v) => v.name === selectedName && v.value === value
    );

    if (oldVariant && newVariant && previousVariant) {
      setPreviousVariant(null);
    }
  };

  const uniqueNames = hasVariants
    ? Array.from(new Set(product.variants.map((v) => v.name)))
    : [];
  const allValues = hasVariants
    ? Array.from(new Set(product.variants.map((v) => v.value))).sort(
        (a, b) => Number(a) - Number(b)
      )
    : [];
  const hasSizeOptions = allValues.some((value) => value !== "");
  const nameAvailability = uniqueNames.map((name) => {
    const hasAvailableVariants = product.variants.some(
      (v) =>
        v.name === name &&
        (!selectedValue || v.value === selectedValue) &&
        v.stock > 0
    );
    return {
      name,
      available: selectedValue ? hasAvailableVariants : true,
    };
  });

  const valueAvailability = allValues.map((value) => {
    const hasAvailableVariants = product.variants.some(
      (v) =>
        v.value === value &&
        (!selectedName || v.name === selectedName) &&
        v.stock > 0
    );
    return {
      value,
      available: selectedName ? hasAvailableVariants : true,
    };
  });

  const currentVariant = product.variants.find(
    (v) => v.name === selectedName && v.value === selectedValue
  );

  const currentPrice = currentVariant?.price || product.price;
  const currentStock = currentVariant?.stock || product.stock || 0;
  const totalVariantStock =
    product.variants?.reduce(
      (total, variant) => total + (variant.stock || 0),
      0
    ) || 0;

  const handleAddToCart = async () => {
    if (hasVariants && !currentVariant) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }

    const cartData = {
      productId: product._id,
      quantity: quantity,
      shopId: product.shop,
      ...(currentVariant && { variantId: currentVariant._id }),
    };

    addToCart(cartData);
  };

  const handleBuyNow = () => {
    if (hasVariants && !currentVariant) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }

    const purchaseData = {
      products: [
        {
          _id: product._id,
          title: product.title,
          price: currentPrice,
          quantity: quantity,
          thumbnail: product.thumbnail,
          hasVariants: hasVariants,
          ...(hasVariants && currentVariant
            ? {
                variantId: currentVariant._id,
                variantName: currentVariant.name,
                variantValue: currentVariant.value,
              }
            : {}),
        },
      ],
    };

    const queryString = encodeURIComponent(JSON.stringify(purchaseData));
    window.location.href = `/order?data=${queryString}`;
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900 leading-relaxed">
          {product.title}
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-blue-500 font-medium">{0}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= 0
                      ? "fill-blue-500 text-blue-500"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-gray-500">
            <span>{0} Đánh Giá</span>
          </div>
          <div className="text-gray-500">
            <span>{product.soldCount} Đã Bán</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-gray-500 line-through">
            ₫{formatPrice(product.price)}
          </span>
          <span className="text-3xl font-bold text-blue-500">
            ₫
            {formatPrice(
              product.price - (product.price * product.discount) / 100
            )}
          </span>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
            -{product.discount || 0}% GIẢM
          </span>
        </div>
      </div>

      {hasVariants ? (
        <div className="space-y-6 py-2">
          <VariantColorSelect
            names={nameAvailability}
            selectedName={selectedName || ""}
            onSelect={handleNameSelect}
            title={product.variantName}
          />

          {hasSizeOptions && (
            <VariantSizeSelect
              values={valueAvailability}
              selectedValue={selectedValue}
              onSelect={handleValueSelect}
              title={product.optionName}
            />
          )}
          <div className="text-sm text-gray-500">
            <>
              {selectedName && selectedValue && (
                <span>Còn {currentStock} sản phẩm</span>
              )}
              {!selectedName && !selectedValue && (
                <span className="ml-2">Tổng {totalVariantStock} sản phẩm</span>
              )}
            </>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          {currentStock > 0 ? (
            <>
              <span>Còn {currentStock} sản phẩm</span>
              {product.variants && (
                <span className="ml-2">
                  (Tổng {totalVariantStock} sản phẩm)
                </span>
              )}
            </>
          ) : (
            <span className="text-red-500">Hết hàng</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        <QuantitySelector
          initialQuantity={quantity}
          onQuantityChange={onChangeQuantity}
          max={currentStock}
        />
        <Button
          onClick={handleAddToCart}
          disabled={
            isAddingToCart ||
            currentStock === 0 ||
            (hasVariants && !currentVariant)
          }
          className="flex-1 h-12 gap-2"
        >
          <ShoppingCart className="h-5 w-5" />
          Thêm vào giỏ hàng
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={currentStock === 0 || (hasVariants && !currentVariant)}
          variant="default"
          className="flex-1 h-12"
        >
          Mua ngay
        </Button>
      </div>

      <div className="border-t pt-6 mt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Thương hiệu:</span>
            <span className="font-medium">{product.brand}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Xuất xứ:</span>
            <span className="font-medium">{product.origin}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
