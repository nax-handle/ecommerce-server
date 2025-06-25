"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart, Search, User } from "lucide-react";
import Image from "next/image";
import { Container } from "../ui/container";
import { useAuthStore } from "@/store/use-auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/lib/store/cart";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore((state) => state.totalItems);
  const [keyword, setKeyword] = useState<string>();
  return (
    <Container className="fixed top-0 left-0 right-0 z-50 w-full ">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Toxos Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>

            <div className="flex flex-1 items-center justify-center px-6">
              <div className="w-full max-w-2xl">
                <div className="relative">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      router.push(`/search?keyword=${keyword}`);
                    }}
                  >
                    <Input
                      onChange={(e) => setKeyword(e.target.value)}
                      type="search"
                      placeholder="Search for products..."
                      className="w-full rounded-full border-2 border-blue-500 pl-4 pr-12 focus:border-blue-600"
                    />
                    <Button
                      type="submit"
                      className="absolute right-0 top-0 h-full rounded-r-full bg-blue-500 px-6 hover:bg-blue-600"
                    >
                      <Search className="h-5 w-5 text-white" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-5 w-5" />
                    <span>{user?.email || ""}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/profile/orders" className="w-full">
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                onClick={() => router.push("/cart")}
                className="relative flex items-center  text-sm text-gray-700 hover:text-blue-500"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                  {totalItems || 0}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </Container>
  );
}
