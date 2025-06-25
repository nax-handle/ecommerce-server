"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { register } from "@/lib/services/auth";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate, isLoading, error } = useMutation({
    mutationFn: register,
    onSuccess: () => {
      // Redirect to verify page with email
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email, password });
  };

  return (
    <Container className="max-w-md py-20">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Đăng ký tài khoản</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tạo tài khoản để mua sắm dễ dàng hơn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Mật khẩu
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error instanceof Error ? error.message : "Đăng ký thất bại"}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500">
          Đã có tài khoản?{" "}
          <a href="/auth/login" className="text-blue-500 hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </Container>
  );
}
