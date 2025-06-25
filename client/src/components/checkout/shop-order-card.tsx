"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { Order } from "@/app/checkout/types";
import { useCheckoutStore } from "@/store/use-checkout-store";

interface ShopOrderCardProps {
  order: Order;
  calculateOrderTotal: (order: Order) => number;
}

export function ShopOrderCard({
  order,
  calculateOrderTotal,
}: ShopOrderCardProps) {
  console.log(order);
  const setOrderMessage = useCheckoutStore((state) => state.setOrderMessage);

  const getImageUrl = (url: string) => {
    if (!url) return "/images/product-placeholder.svg";
    return url.startsWith("http") ? url : "/images/product-placeholder.svg";
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 relative">
            <Image
              src={getImageUrl(order.shop.logo)}
              alt={order.shop.name}
              fill
              className="object-cover rounded"
            />
          </div>
          <span className="font-medium">{order.shop.name}</span>
          <MessageCircle className="w-4 h-4 text-blue-600 ml-auto" />
        </div>

        <div className="space-y-4">
          {order.orderItems.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className="grid grid-cols-12 gap-4 items-center"
            >
              <div className="col-span-6 flex gap-3">
                <div className="w-20 h-20 relative">
                  <Image
                    src={item.thumbnail}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Loại: {item.tags}</p>
                </div>
              </div>
              <div className="col-span-2 text-center">
                ₫{item.price.toLocaleString()}
              </div>
              <div className="col-span-2 text-center">x{item.quantity}</div>
              <div className="col-span-2 text-right text-blue-500">
                ₫{(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-4">
            <span className="text-gray-500 whitespace-nowrap">Lời nhắn:</span>
            <Input
              placeholder="Lưu ý cho Người bán..."
              className="max-w-md"
              value={order.message || ""}
              onChange={(e) => setOrderMessage(order.shop.id, e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1">Phương thức vận chuyển: Nhanh</p>
              <p className="text-gray-500 text-sm">
                Đảm bảo nhận hàng từ 23 Tháng 3 - 24 Tháng 3
              </p>
              <p className="text-gray-500 text-sm">
                Nhận Voucher trị giá ₫15.000 nếu đơn hàng được giao đến bạn sau
                ngày 24 Tháng 3 2025.
              </p>
            </div>
            <div className="text-right">
              <span>₫5.000</span>
              <Button variant="link" className="text-blue-600 block">
                Thay Đổi
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex justify-end items-center gap-2">
          <span className="text-gray-500">
            Tổng số tiền ({order.orderItems.length} sản phẩm):
          </span>
          <span className="text-xl font-medium text-blue-500">
            ₫{calculateOrderTotal(order).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
