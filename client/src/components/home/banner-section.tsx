"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const bannerImages = [
  {
    src: "/banners/banner.jpg",
    alt: "Thiết Bị Điện Hạ Thế",
    href: "/promo/voltage",
  },
  {
    src: "/banners/banner2.jpg",
    alt: "Khuyến Mãi Đặc Biệt",
    href: "/promo/deals",
  },
  {
    src: "/banners/banner2.jpg",
    alt: "Hàng Mới Về",
    href: "/promo/new",
  },
];

const promoItems = [
  {
    title: "102.000₫",
    subtitle: "Trả góp 0% - Miễn phí",
    image: "/banners/banner.jpg",
    href: "/promo/1",
  },
  {
    title: "67.810₫",
    subtitle: "Chống Sốc & Va Đập",
    image: "/banners/banner.jpg",
    href: "/promo/2",
  },
  {
    title: "168.000₫",
    subtitle: "Công Suất Lớn",
    image: "/banners/banner.jpg",
    href: "/promo/3",
  },
  {
    title: "11.300₫",
    subtitle: "Chính Hãng - Đền 10",
    image: "/banners/banner.jpg",
    href: "/promo/4",
  },
];

export function BannerSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + bannerImages.length) % bannerImages.length
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
  };

  return (
    <div className="w-full bg-white">
      <div className="max-w-[1200px] mx-auto pt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="hidden md:block md:col-span-1">
            <div className="bg-gray-50 rounded-lg p-2 space-y-2">
              <div className="text-sm font-semibold px-2 py-1 text-blue-500">
                Danh Mục
              </div>
              <div className="text-sm px-2 py-1 hover:text-blue-500 cursor-pointer">
                Thời trang nam
              </div>
            </div>
          </div>

          {/* Main banner carousel */}
          <div className="md:col-span-2 lg:col-span-3 relative rounded-lg overflow-hidden">
            <div className="relative h-[300px] w-full">
              {bannerImages.map((banner, index) => (
                <Link
                  key={banner.href}
                  href={banner.href}
                  className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={banner.src}
                    alt={banner.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </Link>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentSlide ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Promotional items on the right */}
          <div className="md:col-span-1 space-y-2">
            {promoItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block relative h-[70px] bg-gray-50 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
              >
                <div className="absolute inset-0 p-2 flex items-center">
                  <div className="flex-1">
                    <div className="text-blue-500 font-semibold">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-600">{item.subtitle}</div>
                  </div>
                  <div className="w-16 h-16 relative">
                    <Image
                      src={item.image}
                      alt={item.subtitle}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
