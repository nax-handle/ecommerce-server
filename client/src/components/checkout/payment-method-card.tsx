"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wallet, CreditCard, AppWindowMac } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/app/checkout/types";

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (value: PaymentMethod) => void;
}

export function PaymentMethodCard({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodCardProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium">Phương thức thanh toán</h3>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value: string) =>
              onPaymentMethodChange(value as PaymentMethod)
            }
            className="space-y-3"
          >
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border p-4",
                paymentMethod === "pointer_wallet" &&
                  "border-blue-500 bg-blue-50"
              )}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="pointer_wallet" id="pointer_wallet" />
                <label
                  htmlFor="pointer_wallet"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-medium">Pointer Wallet</span>
                    <div className="inline-flex items-center ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-600">
                      Hoàn tiền 5%
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div
              className={cn(
                "flex items-center justify-between rounded-lg border p-4",
                paymentMethod === "stripe" && "border-blue-500 bg-blue-50"
              )}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="stripe" id="stripe" />
                <label
                  htmlFor="stripe"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-medium">Stripe</span>
                    <div className="inline-flex items-center ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-600">
                      Hoàn tiền 2%
                    </div>
                  </div>
                </label>
              </div>
            </div>
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border p-4",
                paymentMethod === "cod" && "border-blue-500 bg-blue-50"
              )}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="cod" id="cod" />
                <label
                  htmlFor="cod"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <AppWindowMac className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-medium">COD</span>
                    <div className="inline-flex items-center ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-600">
                     Thanh toán khi nhận hàng
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
