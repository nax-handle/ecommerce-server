import React from "react";
import { CartItem, useUpdateVariant } from "@/lib/services/cart";
import { toast } from "sonner";
import { VariantColorSelect } from "@/components/product/variant-title-select";
import { VariantSizeSelect } from "@/components/product/variant-value-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "../ui/button";

interface SelectedProduct {
  product: CartItem;
  shopId: string;
  tempVariant?: {
    name: string | null;
    value: string | null;
  };
}

interface VariantDialogProps {
  selectedProduct: {
    product: CartItem;
    shopId: string;
    tempVariant?: {
      name: string | null;
      value: string | null;
    };
  } | null;
  variantDialogOpen: boolean;
  setVariantDialogOpen: (open: boolean) => void;
  setSelectedProduct: (product: SelectedProduct | null) => void;
}

const VariantDialog: React.FC<VariantDialogProps> = ({
  selectedProduct,
  variantDialogOpen,
  setVariantDialogOpen,
  setSelectedProduct,
}) => {
  const { mutate: updateVariant, isPending: isUpdatingVariant } =
    useUpdateVariant();
  return (
    <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chọn phân loại</DialogTitle>
        </DialogHeader>
        {selectedProduct && (
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-4 pb-4 border-b">
              <div className="relative h-16 w-16">
                <Image
                  src={
                    selectedProduct.product.thumbnail.startsWith("http")
                      ? selectedProduct.product.thumbnail
                      : "/placeholder-product.png"
                  }
                  alt={selectedProduct.product.title}
                  width={64}
                  height={64}
                  className="rounded-md object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{selectedProduct.product.title}</h3>
                <p className="text-sm text-blue-500">
                  ₫{selectedProduct.product.price.toLocaleString()}
                </p>
              </div>
            </div>

            <VariantColorSelect
              names={Array.from(
                new Set(
                  selectedProduct.product.variants?.map(
                    (v: { name: string }) => v.name
                  ) || []
                )
              ).map((name: string) => ({
                name,
                available:
                  !isUpdatingVariant &&
                  (selectedProduct.product.variants?.some(
                    (v: { name: string; value: string; stock: number }) =>
                      v.name === name &&
                      (!selectedProduct.product.variant?.value ||
                        v.value === selectedProduct.product.variant.value) &&
                      v.stock > 0
                  ) ||
                    false),
              }))}
              selectedName={
                selectedProduct.tempVariant?.name ??
                selectedProduct.product.variant?.name ??
                null
              }
              onSelect={(name) => {
                if (isUpdatingVariant) return;
                setSelectedProduct({
                  ...selectedProduct,
                  tempVariant: {
                    name,
                    value: null,
                  },
                });
              }}
              title="Màu sắc"
            />
            <VariantSizeSelect
              values={Array.from(
                new Set(
                  selectedProduct.product.variants?.map(
                    (v: { value: string }) => v.value
                  ) || []
                )
              ).map((value: string) => ({
                value,
                available:
                  !isUpdatingVariant &&
                  (selectedProduct.product.variants?.some(
                    (v: { name: string; value: string; stock: number }) =>
                      v.value === value &&
                      (!selectedProduct.product.variant?.name ||
                        v.name === selectedProduct.product.variant.name) &&
                      v.stock > 0
                  ) ||
                    false),
              }))}
              selectedValue={
                selectedProduct.tempVariant?.value ??
                selectedProduct.product.variant?.value ??
                null
              }
              onSelect={(value) => {
                if (isUpdatingVariant) return;
                setSelectedProduct({
                  ...selectedProduct,
                  tempVariant: {
                    name:
                      selectedProduct.tempVariant?.name ??
                      selectedProduct.product.variant?.name ??
                      null,
                    value,
                  },
                });
              }}
              title="Kích cỡ"
            />
            <DialogFooter>
              <Button
                onClick={() => {
                  setSelectedProduct(null);
                  setVariantDialogOpen(false);
                }}
                variant="outline"
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  const selectedName =
                    selectedProduct.tempVariant?.name ??
                    selectedProduct.product.variant?.name;
                  const selectedValue =
                    selectedProduct.tempVariant?.value ??
                    selectedProduct.product.variant?.value;
                  if (!selectedName || !selectedValue) {
                    toast.error("Vui lòng chọn đầy đủ phân loại");
                    return;
                  }
                  const newVariant = selectedProduct.product.variants?.find(
                    (v: { name: string; value: string }) =>
                      v.name === selectedName && v.value === selectedValue
                  );
                  if (newVariant) {
                    updateVariant(
                      {
                        productId: selectedProduct.product._id,
                        quantity: selectedProduct.product.quantity.toString(),
                        oldVariantId: selectedProduct.product.variantId!,
                        newVariantId: newVariant._id,
                        shopId: selectedProduct.shopId,
                      },
                      {
                        onSuccess: () => {
                          setSelectedProduct(null);
                          setVariantDialogOpen(false);
                          toast.success("Cập nhật phân loại thành công");
                        },
                        onError: (error) => {
                          toast.error(
                            error.response?.data?.message ||
                              "Failed to update variant"
                          );
                        },
                      }
                    );
                  }
                }}
                disabled={isUpdatingVariant}
              >
                {isUpdatingVariant ? "Đang cập nhật..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VariantDialog;
