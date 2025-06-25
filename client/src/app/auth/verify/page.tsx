"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { verify } from "@/lib/services/auth";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [otp, setOtp] = useState("");

  const { mutate, isLoading, error } = useMutation({
    mutationFn: verify,
    onSuccess: () => {
      // Redirect to login page after successful verification
      router.push("/auth/login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    mutate({ email, otp });
  };

  if (!email) {
    return (
      <Container className="max-w-md py-20">
        <div className="text-center">
          <p className="text-red-500">Email không hợp lệ</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => router.push("/auth/register")}
          >
            Quay lại đăng ký
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="max-w-md py-20">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Xác thực tài khoản</h1>
          <p className="text-sm text-gray-500 mt-1">
            Nhập mã OTP đã được gửi đến email {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="otp">
              Mã OTP
            </label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã OTP"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error instanceof Error ? error.message : "Xác thực thất bại"}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Xác thực"}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500">
          Không nhận được mã?{" "}
          <button className="text-blue-500 hover:underline">Gửi lại</button>
        </p>
      </div>
    </Container>
  );
}
