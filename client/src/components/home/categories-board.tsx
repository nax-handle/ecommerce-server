"use client";

import Link from "next/link";
import { Smartphone, Home, Gamepad, Shirt } from "lucide-react";
import { Container } from "../ui/container";

const categories = [
  {
    title: "Home",
    icon: Home,
    href: "/category/home-living",
  },
  {
    title: "Mobile",
    icon: Smartphone,
    href: "/category/mobile",
  },
  {
    title: "Fashion",
    icon: Shirt,
    href: "/category/fashion",
  },

  {
    title: "Gaming",
    icon: Gamepad,
    href: "/category/gaming",
  },
];

export function CategoriesBoard() {
  return (
    <Container className="w-full bg-white  ">
      <div className="w-full bg-white ">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 p-4">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="flex flex-col items-center justify-center p-2 hover:text-blue-500 transition-colors text-center"
              >
                <category.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{category.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
