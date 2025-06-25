"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { Container } from "@/components/ui/container";
import { Loader2 } from "lucide-react";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const code = searchParams.get("code");

  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (!code) {
        router.push("/auth/login");
        return;
      }

      try {
        console.log(code);
        await login("", "", "google", code);
        router.push("/");
      } catch (error) {
        console.error("Google login failed:", error);
        router.push("/auth/login");
      }
    };

    handleGoogleLogin();
  }, [code, login, router]);

  return (
    <Container className="max-w-md py-20">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-lg font-medium">
          Đang xử lý đăng nhập với Google...
        </p>
      </div>
    </Container>
  );
}
