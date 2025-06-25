"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import { useGetOrders, Order } from "@/lib/services/order";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import {
  ORDER_STATUS,
  SHIPPING_STATUS,
  ORDER_STATUS_LABELS,
  SHIPPING_STATUS_LABELS,
} from "@/lib/constants/order";
import { ProductReviewDialog } from "@/components/product/product-review-dialog";

const orderStatuses = [
  { label: "Tất cả", value: "ALL" },
  {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.PENDING],
    value: ORDER_STATUS.PENDING,
  },
  { label: ORDER_STATUS_LABELS[ORDER_STATUS.PAID], value: ORDER_STATUS.PAID },
  {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.SHIPPED],
    value: ORDER_STATUS.SHIPPED,
  },
  {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.CANCELLED],
    value: ORDER_STATUS.CANCELLED,
  },
  {
    label: ORDER_STATUS_LABELS[ORDER_STATUS.COD_PENDING],
    value: ORDER_STATUS.COD_PENDING,
  },
];

const ITEMS_PER_PAGE = 5;

const getImageUrl = (url: string) => {
  if (!url) return "/placeholder.png";
  if (url.startsWith("http")) return url;
  return url.startsWith("/") ? url : `/${url}`;
};

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order>();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: ordersData, isLoading } = useGetOrders(
    currentPage,
    ITEMS_PER_PAGE,
    activeStatus
  );
  const orders = ordersData?.data || [];
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
      case ORDER_STATUS.COD_PENDING:
        return "text-yellow-600 bg-yellow-50";
      case ORDER_STATUS.PAID:
        return "text-blue-600 bg-blue-50";
      case ORDER_STATUS.SHIPPED:
        return "text-purple-600 bg-purple-50";
      case ORDER_STATUS.CANCELLED:
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getShippingStatusColor = (status: string) => {
    switch (status) {
      case SHIPPING_STATUS.NOT_PACKED:
      case SHIPPING_STATUS.AWAITING_PICKUP:
        return "text-yellow-600 bg-yellow-50";
      case SHIPPING_STATUS.PACKED:
      case SHIPPING_STATUS.PROCESSING:
        return "text-blue-600 bg-blue-50";
      case SHIPPING_STATUS.IN_TRANSIT:
      case SHIPPING_STATUS.OUT_FOR_DELIVERY:
        return "text-purple-600 bg-purple-50";
      case SHIPPING_STATUS.DELIVERED:
        return "text-green-600 bg-green-50";
      case SHIPPING_STATUS.RETURNED:
        return "text-orange-600 bg-orange-50";
      case SHIPPING_STATUS.CANCELLED:
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const handleOpenReviewDialog = (order: Order) => {
    setSelectedOrder(order);
    setReviewDialogOpen(true);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 border-b">
            {orderStatuses.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                className={`px-4 py-2 text-sm font-medium relative ${
                  activeStatus === status.value
                    ? "text-blue-600"
                    : "text-gray-600"
                }`}
              >
                {status.label}
                {activeStatus === status.value && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">Không có đơn hàng nào</div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <Image
                      src={getImageUrl(order.shop.logo)}
                      alt={order.shop.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-medium">{order.shop.name}</h3>
                      <p className="text-sm text-gray-500">
                        Đơn hàng: {order.id} |{" "}
                        {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {
                        ORDER_STATUS_LABELS[
                          order.status as keyof typeof ORDER_STATUS_LABELS
                        ]
                      }
                    </span>
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${getShippingStatusColor(
                        order.shippingStatus
                      )}`}
                    >
                      {
                        SHIPPING_STATUS_LABELS[
                          order.shippingStatus as keyof typeof SHIPPING_STATUS_LABELS
                        ]
                      }
                    </span>
                  </div>
                </div>

                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b">
                    <Image
                      src={getImageUrl(item.productThumbnail)}
                      alt={item.productName}
                      width={80}
                      height={80}
                      className="rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      <p className="text-sm text-gray-500">
                        Phân loại: {item.variation}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm">x{item.quantity}</span>
                        <span className="text-blue-600">
                          ₫{formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Liên hệ người bán
                    </Button>
                    <Button variant="outline" size="sm">
                      Xem chi tiết đơn hàng
                    </Button>
                    {order.shippingStatus === SHIPPING_STATUS.DELIVERED &&
                      order.isReview === true && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReviewDialog(order)}
                        >
                          Đánh giá
                        </Button>
                      )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tổng số tiền:</p>
                    <p className="text-lg font-medium text-blue-600">
                      ₫{formatPrice(order.totalPrice)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      {!isLoading && ordersData && (
        <div className="mt-6">
          <Pagination
            pageCount={ordersData.totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      {selectedOrder && (
        <ProductReviewDialog
          isOpen={isReviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          orderItems={selectedOrder.orderItems}
          orderId={selectedOrder.id}
          shopId={selectedOrder.shop.id}
        />
      )}
    </div>
  );
}
