"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MessageCircle, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { Shop } from "@/lib/services/shop";

interface ShopInfoProps {
  shop: Shop;
}

export default function ShopInfo({ shop }: ShopInfoProps) {
  const router = useRouter();
  const logoUrl = shop.logo?.startsWith("http")
    ? shop.logo
    : "/logo/avatar.png";

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <Image
              src={logoUrl}
              alt={shop.name}
              fill
              className="rounded-lg object-cover"
            />
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
              <Star className="h-3 w-3 fill-current" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-medium">{shop.name}</h3>
            <p className="text-sm text-gray-500">{shop.description}</p>
          </div>
        </div>

        <div className="px-6">
          <div className="flex items-center gap-8 text-sm">
            <div className="space-y-1 text-center">
              <div className="text-gray-500">Địa chỉ</div>
              <div className="font-medium text-blue-500">{shop.address}</div>
            </div>
            <div className="space-y-1 text-center">
              <div className="text-gray-500">Liên hệ</div>
              <div className="font-medium">{shop.phoneNumber}</div>
            </div>
          </div>
        </div>
        <div className="flex w-fit gap-2 px-6 ml-auto">
          <Button disabled variant="outline" className="h-9 gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat Ngay
          </Button>
          <Button
            onClick={() => router.push(`/shop/${shop.slug}`)}
            variant="outline"
            className="h-9"
          >
            Xem Shop
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6 border-t pt-4">
        <div className="flex items-center gap-2">
          <div className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-500">
            Mall
          </div>
          <span className="text-sm text-gray-500">Thương hiệu chính hãng</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-500">
            Yêu thích+
          </div>
          <span className="text-sm text-gray-500">Shop bán hàng uy tín</span>
        </div>
      </div>
    </div>
  );
}
