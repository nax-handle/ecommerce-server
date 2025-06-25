"use client";

import { useState } from "react";
import { AddressCard } from "@/components/checkout/address-card";
import { ShopOrderCard } from "@/components/checkout/shop-order-card";
import { PaymentMethodCard } from "@/components/checkout/payment-method-card";
import { OrderSummaryCard } from "@/components/checkout/order-summary-card";
import { CheckoutData, Order, PaymentMethod } from "./types";
import { useAuthStore } from "@/store/use-auth-store";
import { useCheckoutStore } from "@/store/use-checkout-store";

export default function CheckoutPage() {
  const user = useAuthStore((state) => state.user);
  const orders = useCheckoutStore((state) => state.orders);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    user: {
      id: user?.id || "",
      name: user?.name || "",
    },
    orders,
  });

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("pointer_wallet");
  const [selectedAddress, setSelectedAddress] = useState({
    street: "123 Đường ABC",
    ward: "Phường 1",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    state: "Hồ Chí Minh",
    country: "Vietnam",
    postalCode: "700000",
    latitude: 10.762622,
    longitude: 106.660172,
    note: "Giao hàng ngoài giờ hành chính",
  });

  const calculateOrderTotal = (order: Order) => {
    return order.orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const calculateTotal = () => {
    return checkoutData.orders.reduce(
      (sum, order) => sum + calculateOrderTotal(order),
      0
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4">
      <AddressCard
        userName={checkoutData.user.name}
        address={
          selectedAddress.street +
          ", " +
          selectedAddress.ward +
          ", " +
          selectedAddress.district +
          ", " +
          selectedAddress.city
        }
      />

      {checkoutData.orders.map((order, index) => (
        <ShopOrderCard
          key={index}
          order={order}
          calculateOrderTotal={calculateOrderTotal}
        />
      ))}

      <PaymentMethodCard
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
      />

      <OrderSummaryCard
        totalAmount={calculateTotal()}
        shippingFee={checkoutData.orders.length * 5000}
        orders={checkoutData.orders}
        selectedAddress={selectedAddress}
        paymentMethod={paymentMethod}
      />
    </div>
  );
}
