"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
// import { createOrder } from "@/lib/services/order";
import { useRouter, useSearchParams } from "next/navigation";

interface OrderProduct {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
  hasVariants: boolean;
  variantId?: string;
  variantName?: string;
  variantValue?: string;
}

interface OrderAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [products, setProducts] = useState<OrderProduct[]>([]);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data));
        setProducts(parsedData.products);
      } catch (error) {
        console.error("Error parsing product data:", error);
        router.push("/"); // Redirect to home if data is invalid
      }
    }
  }, [searchParams, router]);

  const [addresses] = useState<OrderAddress[]>([
    {
      id: "addr1",
      fullName: "John Doe",
      phone: "0123456789",
      address: "123 Sample Street, District 1, Ho Chi Minh City",
      isDefault: true,
    },
  ]);

  const defaultAddress = addresses.find((addr) => addr.isDefault);

  const subtotal = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
  const shippingFee = 30000;
  const total = subtotal + shippingFee;

  const handleCreateOrder = async () => {
    if (!defaultAddress) {
      alert("Please select a delivery address");
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        items: products.map((product) => ({
          productId: product._id,
          ...(product.hasVariants && product.variantId
            ? { variantId: product.variantId }
            : {}),
          quantity: product.quantity,
        })),
        addressId: defaultAddress.id,
        paymentMethod,
      };

      // const result = await createOrder(orderData);
      router.push(`/order/success?orderId=${"orderId"}`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold mb-6">Thanh Toán</h1>

      {/* Delivery Address */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Địa Chỉ Nhận Hàng</h2>
          <Button variant="outline" size="sm">
            Thay đổi
          </Button>
        </div>
        {defaultAddress && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{defaultAddress.fullName}</span>
              <span className="text-gray-500">|</span>
              <span>{defaultAddress.phone}</span>
            </div>
            <p className="text-gray-600">{defaultAddress.address}</p>
          </div>
        )}
      </div>

      {/* Products */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-medium mb-4">Sản Phẩm</h2>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-md overflow-hidden">
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{product.title}</h3>
                {product.hasVariants &&
                  product.variantName &&
                  product.variantValue && (
                    <p className="text-sm text-gray-500">
                      Phân loại: {product.variantName}, {product.variantValue}
                    </p>
                  )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-blue-500">
                    ₫{formatPrice(product.price)}
                  </span>
                  <span className="text-gray-500">x{product.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-medium mb-4">Phương Thức Thanh Toán</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod("cod")}
            />
            <span>Thanh toán khi nhận hàng</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === "card"}
              onChange={(e) => setPaymentMethod("card")}
            />
            <span>Thẻ tín dụng/ghi nợ</span>
          </label>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Tổng Thanh Toán</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Tạm tính</span>
            <span>₫{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phí vận chuyển</span>
            <span>₫{formatPrice(shippingFee)}</span>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Tổng tiền</span>
            <span className="text-xl font-medium text-blue-500">
              ₫{formatPrice(total)}
            </span>
          </div>
        </div>
        <Button
          className="w-full mt-6"
          size="lg"
          onClick={handleCreateOrder}
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : "Đặt Hàng"}
        </Button>
      </div>
    </Container>
  );
}
