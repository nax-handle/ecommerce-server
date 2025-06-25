"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useGetCashbackHistory } from "@/lib/services/cashback";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const ITEMS_PER_PAGE = 10;

export default function CashbackPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: cashbackData, isLoading } = useGetCashbackHistory(
    currentPage,
    ITEMS_PER_PAGE
  );
  const { user } = useAuth();
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Xu của tôi</h1>
        <div className="text-lg font-medium text-blue-600">
          {formatPrice(user?.cashbackBalance || 0)} Xu
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {cashbackData?.data.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-4 border-b last:border-0"
            >
              <div>
                <div className="font-medium">
                  {transaction.type === "order" ? "Đơn hàng" : "Hoàn Xu"}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-blue-600">
                  +{formatPrice(Number(transaction.amount))} Xu
                </div>
                <div className="text-sm text-gray-500">
                  Mã đơn hàng {transaction.orderIds.map((item) => item)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {cashbackData && (
          <div className="mt-6">
            <Pagination
              pageCount={cashbackData.lastPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
