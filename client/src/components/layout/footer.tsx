"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "../ui/container";

const footerLinks = {
  customerService: [
    { title: "Trung Tâm Trợ Giúp", href: "/help-center" },
    { title: "Hướng Dẫn Mua Hàng", href: "/buying-guide" },
    { title: "Hướng Dẫn Bán Hàng", href: "/selling-guide" },
    { title: "Thanh Toán", href: "/payment" },
    { title: "Vận Chuyển", href: "/shipping" },
    { title: "Trả Hàng & Hoàn Tiền", href: "/return-refund" },
    { title: "Chăm Sóc Khách Hàng", href: "/customer-care" },
    { title: "Chính Sách Bảo Hành", href: "/warranty" },
  ],
  about: [
    { title: "Về Toxos", href: "/about" },
    { title: "Điều Khoản", href: "/terms" },
    { title: "Chính Sách Bảo Mật", href: "/privacy" },
    { title: "Kênh Người Bán", href: "/seller" },
    { title: "Flash Sale", href: "/flash-sale" },
    { title: "Liên Hệ Truyền Thông", href: "/media" },
  ],
  payment: ["pointer", "stripe"],
  logistics: ["spx.png"],
  social: [
    { title: "Facebook", href: "https://facebook.com", icon: "facebook.png" },
    {
      title: "Instagram",
      href: "https://instagram.com",
      icon: "instagram.png",
    },
    { title: "LinkedIn", href: "https://linkedin.com", icon: "linkedin.png" },
  ],
};

export function Footer() {
  return (
    <Container>
      <footer className="mt-12 border-t w-full  bg-white">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-600">
                DỊCH VỤ KHÁCH HÀNG
              </h3>
              <ul className="space-y-2">
                {footerLinks.customerService.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-orange-500"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-600">
                VỀ TOXOS
              </h3>
              <ul className="space-y-2">
                {footerLinks.about.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-orange-500"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-600">
                THANH TOÁN
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {footerLinks.payment.map((icon) => (
                  <div
                    key={icon}
                    className="flex h-10 w-16 items-center justify-center rounded border bg-white p-2"
                  >
                    <Image
                      src={`/logo/${icon}.png`}
                      alt={icon.replace(".png", "")}
                      width={40}
                      height={24}
                      className="h-auto w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-600">
                ĐƠN VỊ VẬN CHUYỂN
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {footerLinks.logistics.map((icon) => (
                  <div
                    key={icon}
                    className="flex h-10 w-16 items-center justify-center rounded border bg-white p-2"
                  >
                    <Image
                      src={`/logistics/${icon}`}
                      alt={icon.replace(".png", "")}
                      width={40}
                      height={24}
                      className="h-auto w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-600">
                THỬ NGAY CURXOR TRACKING
              </h3>
              <div className="flex items-start space-x-4">
                <div className="w-24">
                  <Image
                    src="/qrcode.png"
                    alt="QR Code"
                    width={96}
                    height={96}
                    className="rounded border"
                    priority
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Link href="https://curxor-tracking.netlify.app/">
                    <Image
                      src="/app-store.png"
                      alt="Download App"
                      width={120}
                      height={40}
                      className="h-10 w-auto"
                      priority
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
            <div className="flex flex-col items-center justify-between space-y-4 text-sm text-gray-500 md:flex-row md:space-y-0">
              <p>© 2025 Toxos. Tất cả các quyền được bảo lưu.</p>
              <div className="flex space-x-4">
                <span>Quốc gia & Khu vực:</span>
                <Link href="#" className="hover:text-orange-500">
                  Việt Nam
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </Container>
  );
}
