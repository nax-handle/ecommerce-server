"use client";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/product/product-card";
import { Star, MessageCircle, Search } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";

// Mock data for shop
const shopInfo = {
  name: "HALO KAKI - GEN Z MẶC GÌ",
  avatar: "/products/ex_prod.png",
  isOnline: true,
  lastActive: "30 phút trước",
  products: 70,
  followers: "12.4k",
  rating: 4.9,
  totalRatings: "14.7k",
  responseRate: "84%",
  responseTime: "Trong Vài Giờ",
  joinedAt: "8 Năm Trước",
};

// Mock products data
const products = [
  {
    _id: "jeans-1",
    title: "JEANS DRAW BOX (Túi hộp phối 1 đai)",
    price: 498000,
    originalPrice: 598000,
    discount: 17,
    thumbnail: "/products/ex_prod.png",
    variants: [
      {
        _id: "v1",
        name: "Xanh",
        value: "M",
        stock: 10,
        price: 498000,
        sku: "JEANS-1-BLUE-M",
      },
      {
        _id: "v2",
        name: "Đen",
        value: "L",
        stock: 10,
        price: 498000,
        sku: "JEANS-1-BLACK-L",
      },
    ],
    rating: 4.9,
    soldCount: 178,
    slug: "jeans-draw-box",
    status: "active",
    stock: 20,
    shop: {
      _id: "shop1",
      name: "HALO KAKI",
      logo: "/logo/avatar.png",
      description: "Shop thời trang nam cao cấp",
      phoneNumber: "0123456789",
      address: "Hà Nội",
      detailedAddress: "123 Đường ABC, Quận XYZ",
      user: {
        _id: "user1",
        email: "shop@example.com",
        password: "hashed_password_here",
      },
    },
    description: "Quần jeans cao cấp với thiết kế túi hộp độc đáo",
    images: ["/products/ex_prod.png"],
    brand: "HALO KAKI",
    origin: "Việt Nam",
    category: "Quần Jean Nam",
    subcategory: "Quần Jean Nam Cao Cấp",
    variantName: "Màu sắc",
    optionName: "Kích cỡ",
    attributes: [],
    quantity: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "jeans-2",
    title: "JEANS XÁM ÁNH KIM TRƠN RÁCH ỐNG",
    price: 169000,
    originalPrice: 219000,
    discount: 32,
    thumbnail: "/products/ex_prod.png",
    variants: [
      { _id: "v3", name: "Xám", value: "M", stock: 10, price: 169000 },
      { _id: "v4", name: "Đen", value: "L", stock: 10, price: 169000 },
    ],
    rating: 4.9,
    soldCount: 15500,
    slug: "jeans-xam-anh-kim",
    status: "active",
    stock: 20,
    shop: {
      _id: "shop1",
      name: "HALO KAKI",
      logo: "/logo/avatar.png",
      description: "Shop thời trang nam cao cấp",
      phoneNumber: "0123456789",
      address: "Hà Nội",
      detailedAddress: "123 Đường ABC, Quận XYZ",
      user: {
        _id: "user1",
        email: "shop@example.com",
        password: "hashed_password_here",
      },
    },
    description: "Quần jeans xám ánh kim với thiết kế rách ống thời trang",
    images: ["/products/ex_prod.png"],
    brand: "HALO KAKI",
    origin: "Việt Nam",
    category: "Quần Jean Nam",
    subcategory: "Quần Jean Nam Cao Cấp",
    variantName: "Màu sắc",
    optionName: "Kích cỡ",
    attributes: [],
    quantity: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const categories = [
  "TẤT CẢ SẢN PHẨM",
  "Thời Trang Nam",
  "Phụ Kiện & Trang Sức Nữ",
  "Thời Trang Nữ",
];

export default function ShopPage() {
  return (
    <Container>
      <div className="max-w-[1200px] mx-auto py-6">
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <Image
                  src={shopInfo.avatar}
                  alt={shopInfo.name}
                  fill
                  className="rounded-lg object-cover"
                />
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                  <Star className="h-3 w-3 fill-current" />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-medium">{shopInfo.name}</h1>
                <p className="text-sm text-gray-500">
                  {shopInfo.isOnline ? "Online " : ""}
                  {shopInfo.lastActive}
                </p>
              </div>
            </div>

            <div className="flex-1 px-6 border-x">
              <div className="grid grid-cols-3 gap-8 text-sm">
                <div className="space-y-1 text-center">
                  <div className="text-gray-500">Sản Phẩm</div>
                  <div className="font-medium">{shopInfo.products}</div>
                </div>
                <div className="space-y-1 text-center">
                  <div className="text-gray-500">Người Theo Dõi</div>
                  <div className="font-medium">{shopInfo.followers}</div>
                </div>
                <div className="space-y-1 text-center">
                  <div className="text-gray-500">Đánh Giá</div>
                  <div className="font-medium text-blue-500">
                    {shopInfo.rating} ({shopInfo.totalRatings} Đánh Giá)
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button disabled variant="outline" className="h-9 gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat Ngay
              </Button>
              {/* <Button variant="outline" className="h-9">
                Theo Dõi
              </Button> */}
            </div>
          </div>

          {/* Shop Stats */}
          <div className="mt-4 flex items-center gap-6 border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-500">
                {shopInfo.responseRate}
              </div>
              <span className="text-sm text-gray-500">Tỉ Lệ Phản Hồi Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-500">
                {shopInfo.responseTime}
              </div>
              <span className="text-sm text-gray-500">Thời Gian Phản Hồi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-500">
                {shopInfo.joinedAt}
              </div>
              <span className="text-sm text-gray-500">Tham Gia</span>
            </div>
          </div>
        </Card>

        {/* Search and Categories */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Input placeholder="Tìm kiếm trong shop..." className="pl-10" />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-transparent data-[state=active]:text-red-500 data-[state=active]:border-b-2 data-[state=active]:border-red-500 rounded-none"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </Container>
  );
}
