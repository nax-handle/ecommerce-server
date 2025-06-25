"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSubmitOrder } from "@/lib/services/order";
import { toast } from "sonner";

interface OrderSummaryCardProps {
  totalAmount: number;
  shippingFee: number;
  orders: Order[];
  selectedAddress: Address;
  paymentMethod: string;
}

interface Address {
  street: string;
  ward: string;
  district: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  note: string;
}

interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  thumbnail: string;
  category?: string;
  tags?: string;
  quantity: number;
  price: number;
  variant?: {
    name: string;
    value: string;
  };
}

interface Order {
  shop: {
    id: string;
    name: string;
    logo: string;
    slug: string;
  };
  orderItems: OrderItem[];
}

export function OrderSummaryCard({
  totalAmount,
  shippingFee,
  orders,
  selectedAddress,
  paymentMethod,
}: OrderSummaryCardProps) {
  const { mutate: submitOrder, isPending } = useSubmitOrder();

  const handleOrderSubmit = () => {
    const checkoutData = {
      paymentMethod,
      address: selectedAddress,
      orders: orders.map((order) => ({
        shop: {
          id: order.shop.id,
          name: order.shop.name,
          logo: order.shop.logo,
          slug: order.shop.slug,
        },
        shopId: order.shop.id,
        orderItems: order.orderItems.map((item) => ({
          productId: item.id,
          variantId: item.variantId,
          productName: item.name,
          productThumbnail: item.thumbnail,
          category: item.category || "",
          tags: item.variant
            ? `${item.variant.name}, ${item.variant.value}`
            : "",
          quantity: item.quantity,
          price: item.price,
        })),
      })),
    };

    submitOrder(checkoutData, {
      onSuccess: (data: { url: string }) => {
        toast.success("Đặt hàng thành công!");
        window.location.href = data.url;
      },
      onError: (error) => {
        toast.error("Đặt hàng thất bại. Vui lòng thử lại!");
        console.error("Order submission error:", error);
      },
    });
  };

  const total = totalAmount + shippingFee;

  return (
    <Card className="sticky top-4">
      <CardContent className="p-4">
        <h3 className="font-medium mb-4">Tổng đơn hàng</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tạm tính</span>
            <span>₫{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Phí vận chuyển</span>
            <span>₫{shippingFee.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Tổng cộng</span>
            <span className="text-blue-500">₫{total.toLocaleString()}</span>
          </div>
        </div>
        <Button
          className="w-full mt-4"
          size="lg"
          onClick={handleOrderSubmit}
          disabled={isPending}
        >
          {isPending ? "Đang xử lý..." : "Đặt hàng"}
        </Button>
      </CardContent>
    </Card>
  );
}
