import { CashbackTransaction, CashbackResponse } from "@/lib/services/cashback";

export const dummyCashbackTransactions: CashbackTransaction[] = [
  {
    id: "cashback-1",
    userId: "user-1",
    amount: "5.99",
    type: "earned",
    orderIds: ["order-1"],
    createdAt: "2024-01-16T10:00:00Z",
  },
  {
    id: "cashback-2",
    userId: "user-1",
    amount: "2.50",
    type: "earned",
    orderIds: ["order-2"],
    createdAt: "2024-01-20T16:30:00Z",
  },
  {
    id: "cashback-3",
    userId: "user-1",
    amount: "10.00",
    type: "redeemed",
    orderIds: [],
    createdAt: "2024-01-22T09:15:00Z",
  },
];

export const getDummyCashbackHistory = (
  page: number,
  size: number
): CashbackResponse => {
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const paginatedTransactions = dummyCashbackTransactions.slice(
    startIndex,
    endIndex
  );

  return {
    data: paginatedTransactions,
    total: dummyCashbackTransactions.length,
    page,
    lastPage: Math.ceil(dummyCashbackTransactions.length / size),
  };
};
