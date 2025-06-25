"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  MapPin,
  Package,
  // Ticket,
  Gift,
  // CreditCard,
  // Bell,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    title: "Thông tin tài khoản",
    href: "/profile",
    icon: User,
  },
  {
    title: "Địa chỉ",
    href: "/profile/addresses",
    icon: MapPin,
  },
  {
    title: "Đơn hàng của tôi",
    href: "/profile/orders",
    icon: Package,
  },
  // {
  //   title: "Voucher",
  //   href: "/profile/vouchers",
  //   icon: Ticket,
  // },
  {
    title: "Xu của tôi",
    href: "/profile/cashback",
    icon: Gift,
  },
  // {
  //   title: "Thẻ thanh toán",
  //   href: "/profile/payment",
  //   icon: CreditCard,
  // },
  // {
  //   title: "Thông báo",
  //   href: "/profile/notifications",
  //   icon: Bell,
  // },
];

export function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100",
            pathname === item.href
              ? "bg-blue-50 text-blue-600 font-medium"
              : "text-gray-600"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
      <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-all hover:bg-red-50">
        <LogOut className="h-4 w-4" />
        Đăng xuất
      </button>
    </nav>
  );
}
