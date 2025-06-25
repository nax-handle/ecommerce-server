import { useQuery } from "@tanstack/react-query";
import { getDummyCashbackHistory } from "@/data/dummy/cashback";
import { delay } from "@/data/dummy/auth";

export interface CashbackTransaction {
  id: string;
  userId: string;
  amount: string;
  type: string;
  orderIds: string[];
  createdAt: string;
}

export interface CashbackResponse {
  data: CashbackTransaction[];
  total: number;
  page: number;
  lastPage: number;
}

export const getCashbackHistory = async (
  page: number,
  size: number
): Promise<CashbackResponse> => {
  await delay(500); // Simulate network delay
  return getDummyCashbackHistory(page, size);
};

export const useGetCashbackHistory = (page: number, size: number) => {
  return useQuery<CashbackResponse>({
    queryKey: ["cashback", page],
    queryFn: () => getCashbackHistory(page, size),
  });
};
