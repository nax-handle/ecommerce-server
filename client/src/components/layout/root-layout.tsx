"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuthStore } from "@/store/use-auth-store";
import { useCartStore } from "@/lib/store/cart";

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  const initializeAuth = useAuthStore((state) => state.initialize);
  const initializeCart = useCartStore((state) => state.initializeCart);

  useEffect(() => {
    // Initialize dummy auth and cart data on app startup
    initializeAuth();
    initializeCart();
  }, [initializeAuth, initializeCart]);

  return (
    <>
      {!isAuthPage && <Header />}
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 mt-16">{children}</main>
        <Footer />
      </div>
    </>
  );
}
