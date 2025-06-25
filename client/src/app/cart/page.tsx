"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCart,
  useRemoveItem,
  CartItem,
  useAddToCart,
} from "@/lib/services/cart";
import { getAuthToken } from "@/lib/auth";

import Image from "next/image";

import { ChevronDown } from "lucide-react";
import { EmptyCart } from "@/components/cart/empty-cart";
import { useCartStore } from "@/lib/store/cart";
import VariantDialog from "@/components/cart/variant-dialog";
import CartFooter from "@/components/cart/cart-footer";

interface SelectedProduct {
  product: CartItem;
  shopId: string;
  tempVariant?: {
    name: string | null;
    value: string | null;
  };
}

export default function CartPage() {
  const router = useRouter();
  const { data: cartShops, isLoading } = useCart();
  const { mutate: updateQuantity, isPending: isUpdating } = useAddToCart();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveItem();

  const setCartItems = useCartStore((state) => state.setCartItems);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] =
    useState<SelectedProduct | null>(null);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);

  useEffect(() => {
    if (cartShops) {
      setCartItems(cartShops);
    }
  }, [cartShops, setCartItems]);

  // Authentication check removed - now works with dummy data

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!cartShops?.length) {
    return (
      <div className="min-h-screen  bg-gray-50 py-8">
        <div className="container max-w-[1200px]  mx-auto px-4">
          <h1 className="mb-6 text-2xl font-bold">Giỏ hàng</h1>
          <div className="rounded-lg border  bg-white">
            <EmptyCart />
          </div>
        </div>
      </div>
    );
  }

  const totalItemsInCart = cartShops.reduce(
    (sum, shop) => sum + shop.products.length,
    0
  );

  const getProductKey = (productId: string, variantId?: string) => {
    return `${productId}${variantId ? `-${variantId}` : ""}`;
  };

  const handleSelectStore = (shopId: string, selected: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    const shop = cartShops.find((s) => s.id === shopId);
    if (!shop) return;

    shop.products.forEach((product) => {
      const productKey = getProductKey(product._id, product.variantId);
      if (selected) {
        newSelectedItems.add(productKey);
      } else {
        newSelectedItems.delete(productKey);
      }
    });

    setSelectedItems(newSelectedItems);
  };

  const handleSelectItem = (productId: string, variantId?: string) => {
    const newSelectedItems = new Set(selectedItems);
    const productKey = getProductKey(productId, variantId);

    if (selectedItems.has(productId)) {
      Array.from(selectedItems).forEach((key) => {
        if (key.startsWith(productId)) {
          newSelectedItems.delete(key);
        }
      });
    }

    if (newSelectedItems.has(productKey)) {
      newSelectedItems.delete(productKey);
    } else {
      newSelectedItems.add(productKey);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleUpdateQuantity = (
    productId: string,
    quantity: number,
    shopId: string,
    variantId?: string
  ) => {
    const productKey = getProductKey(productId, variantId);

    // Nếu sản phẩm đang cập nhật, không cho phép bấm tiếp
    if (updatingItems.has(productKey)) return;

    setUpdatingItems((prev) => new Set(prev).add(productKey)); // Đánh dấu đang cập nhật

    const product = cartShops
      .flatMap((shop) => shop.products)
      .find((p) => p._id === productId && p.variantId === variantId);

    if (!product) {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productKey);
        return newSet;
      });
      return;
    }

    const stock =
      product.variants?.find((v) => v._id === variantId)?.stock ??
      product.stock;
    if (
      product.quantity + quantity < 1 ||
      product.quantity + quantity > stock
    ) {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productKey);
        return newSet;
      });
      return;
    }

    updateQuantity(
      { productId, quantity, shopId, variantId: variantId || "" },
      {
        onSuccess: () => {
          setUpdatingItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productKey);
            return newSet;
          });
        },
        onError: () => {
          setUpdatingItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productKey);
            return newSet;
          });
        },
      }
    );
  };

  const handleRemoveItem = (
    productId: string,
    shopId: string,
    variantId?: string
  ) => {
    removeItem({ productId, shopId, variantId: variantId || "" });
  };

  const isAllSelected =
    selectedItems.size ===
    cartShops.reduce((sum, shop) => sum + shop.products.length, 0);

  return (
    <main className="min-h-screen max-w-[1200px] mx-auto bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-6 text-2xl font-bold">Giỏ hàng</h1>

        <div className="mb-4 rounded-lg border bg-white p-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => {
                  const newSelectedItems = new Set<string>();
                  if (checked) {
                    cartShops.forEach((shop) => {
                      shop.products.forEach((product) => {
                        newSelectedItems.add(
                          getProductKey(product._id, product.variantId)
                        );
                      });
                    });
                  }
                  setSelectedItems(newSelectedItems);
                }}
                className="h-5 w-5"
              />
              <span className="font-medium">
                Tất cả ({totalItemsInCart} sản phẩm)
              </span>
            </div>
            <div className="flex-1" />
            <span className="text-sm text-gray-500">Đơn giá</span>
            <span className="w-32 text-sm text-gray-500">Số lượng</span>
            <span className="w-24 text-sm text-gray-500">Thành tiền</span>
            <span className="w-8" />
          </div>
        </div>

        <div className="space-y-4">
          {cartShops.map((shop) => (
            <div
              key={shop.id}
              className="rounded-lg border bg-white p-4 space-y-4"
            >
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={shop.products.every((product) =>
                    selectedItems.has(
                      getProductKey(product._id, product.variantId)
                    )
                  )}
                  onCheckedChange={(checked) =>
                    handleSelectStore(shop.id, !!checked)
                  }
                  className="h-5 w-5"
                />
                <div className="flex items-center space-x-2">
                  {shop.logo && (
                    <div className="relative h-8 w-8">
                      <Image
                        src={
                          shop.logo.startsWith("http")
                            ? shop.logo
                            : "/logo/avatar.png"
                        }
                        alt={shop.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    </div>
                  )}
                  <span className="font-medium">{shop.name}</span>
                </div>
              </div>

              <div className="space-y-4">
                {shop.products.map((product) => (
                  <div
                    key={`${shop.id}-${product._id}-${product.variantId || ""}`}
                    className="flex items-center space-x-4 py-4 border-t cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      handleSelectItem(product._id, product.variantId)
                    }
                  >
                    <Checkbox
                      checked={selectedItems.has(
                        getProductKey(product._id, product.variantId)
                      )}
                      onCheckedChange={() =>
                        handleSelectItem(product._id, product.variantId)
                      }
                      className="h-5 w-5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex flex-1 items-center space-x-4">
                      <div className="relative h-20 w-20">
                        <Image
                          src={
                            product.thumbnail?.startsWith("http")
                              ? product.thumbnail
                              : "/placeholder-product.png"
                          }
                          alt={product.title}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="line-clamp-2 text-sm">
                          {product.title}
                        </h3>
                        {product.variants && (
                          <button
                            onClick={() => {
                              const currentVariant = product.variants?.find(
                                (v) => v._id === product.variantId
                              );
                              setSelectedProduct({
                                product: {
                                  ...product,
                                  variant: currentVariant
                                    ? {
                                        name: currentVariant.name,
                                        value: currentVariant.value,
                                        price: currentVariant.price,
                                      }
                                    : undefined,
                                },
                                shopId: shop.id,
                              });
                              setVariantDialogOpen(true);
                            }}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500"
                          >
                            <span>
                              Phân Loại:{" "}
                              {product.variants.find(
                                (v) => v._id === product.variantId
                              )?.name || "Chọn màu"}
                              ,{" "}
                              {product.variants.find(
                                (v) => v._id === product.variantId
                              )?.value || "Chọn size"}
                            </span>
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        )}
                        <p className="text-sm font-medium text-blue-500">
                          ₫
                          {(
                            product.variants?.find(
                              (v) => v._id === product.variantId
                            )?.price || product.price
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="h-8 w-8 rounded-md border"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateQuantity(
                              product._id,
                              -1,
                              shop.id,
                              product.variantId
                            );
                          }}
                          disabled={product.quantity <= 1 || isUpdating}
                        >
                          -
                        </button>

                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              product._id,
                              parseInt(e.target.value) - product.quantity,
                              shop.id,
                              product.variantId
                            )
                          }
                          className="h-8 w-16 rounded-md border px-2 text-center"
                          min="1"
                          disabled={true}
                        />

                        <button
                          className="h-8 w-8 rounded-md border"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateQuantity(
                              product._id,
                              1,
                              shop.id,
                              product.variantId
                            );
                          }}
                          disabled={
                            updatingItems.has(
                              getProductKey(product._id, product.variantId)
                            ) || isUpdating
                          }
                        >
                          +
                        </button>
                      </div>
                      <p className="w-24 text-right font-medium text-blue-500">
                        ₫
                        {(
                          (product.variants?.find(
                            (v) => v._id === product.variantId
                          )?.price || product.price) * product.quantity
                        ).toLocaleString()}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(
                            product._id,
                            shop.id,
                            product.variantId
                          );
                        }}
                        className="text-gray-400 hover:text-gray-500"
                        disabled={isRemoving}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <CartFooter
          cartData={cartShops}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          isAllSelected={isAllSelected}
          totalItems={totalItemsInCart}
          getProductKey={getProductKey}
        />
      </div>

      <VariantDialog
        selectedProduct={selectedProduct}
        variantDialogOpen={variantDialogOpen}
        setVariantDialogOpen={setVariantDialogOpen}
        setSelectedProduct={setSelectedProduct}
      />
    </main>
  );
}
