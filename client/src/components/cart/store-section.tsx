"use client";

import { Store } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CartItem } from "./cart-item";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
}

interface StoreSectionProps {
  storeId: string;
  storeName: string;
  items: CartItem[];
  selectedItems: Set<string>;
  onSelectStore: (storeId: string, selected: boolean) => void;
  onSelectItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function StoreSection({
  storeId,
  storeName,
  items,
  selectedItems,
  onSelectStore,
  onSelectItem,
  onUpdateQuantity,
  onRemoveItem,
}: StoreSectionProps) {
  const isStoreSelected = items.every((item) => selectedItems.has(item.id));
  const storeTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center space-x-4 border-b pb-4">
        <Checkbox
          checked={isStoreSelected}
          onCheckedChange={(checked) => onSelectStore(storeId, !!checked)}
          className="h-5 w-5"
        />
        <Store className="h-5 w-5" />
        <span className="font-medium">{storeName}</span>
        <div className="flex-1" />
        <span className="text-sm text-gray-500">
          Tổng đơn: ₫{formatPrice(storeTotal)}
        </span>
      </div>

      <div className="divide-y">
        {items.map((item) => (
          <CartItem
            key={item.id}
            {...item}
            isSelected={selectedItems.has(item.id)}
            onSelect={onSelectItem}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemoveItem}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center space-x-4 rounded-lg bg-gray-50 p-4">
        <span className="text-sm font-medium">Voucher của Shop</span>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          Chọn hoặc nhập mã
        </button>
      </div>
    </div>
  );
}
