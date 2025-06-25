"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const setCartItems = useCartStore((state) => state.setCartItems);

  useEffect(() => {
    // Clear cart after successful checkout
    setCartItems([]);
  }, [setCartItems]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Đặt hàng thành công!
            </h1>

            <p className="max-w-md text-gray-600">
              Cảm ơn bạn đã mua hàng. Chúng tôi sẽ gửi email xác nhận đơn hàng
              và thông tin vận chuyển cho bạn.
            </p>

            <div className="mt-8 flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Button
                onClick={() => router.push("/profile/orders")}
                variant="outline"
                className="min-w-[200px]"
              >
                Xem đơn hàng
              </Button>

              <Button
                onClick={() => router.push("/")}
                className="min-w-[200px]"
              >
                Tiếp tục mua sắm
              </Button>
            </div>

            <div className="mt-8 rounded-lg bg-gray-50 p-6 text-left">
              <h2 className="mb-4 text-lg font-semibold">Thông tin hữu ích</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  • Bạn sẽ nhận được email xác nhận đơn hàng trong vòng vài phút
                </li>
                <li>
                  • Theo dõi đơn hàng của bạn trong mục "Đơn hàng của tôi"
                </li>
                <li>
                  • Nếu cần hỗ trợ, vui lòng liên hệ với chúng tôi qua chat hoặc
                  hotline
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
