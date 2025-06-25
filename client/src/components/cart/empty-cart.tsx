"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function EmptyCart() {
  const router = useRouter();

  return (
    <div className="min-h-[400px] max-w-[1200px] mx-auto flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative w-[240px] h-[240px]">
        <Image
          src="/images/empty-cart.png"
          alt="Empty Cart"
          fill
          className="object-contain"
        />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">
        Giỏ hàng của bạn đang trống
      </h2>
      <p className="text-gray-500 text-center max-w-[400px]">
        Hãy thêm sản phẩm vào giỏ hàng để mua sắm.
      </p>
      <Button onClick={() => router.push("/")} className="mt-2">
        Tiếp tục mua sắm
      </Button>
    </div>
  );
}
