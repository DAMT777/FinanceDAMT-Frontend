import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "../api/transactions";
import { CreateTransactionRequest, TransactionFilters, UpdateTransactionRequest } from "../types/api";

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => transactionsApi.getTransactions(filters),
    staleTime: 0,
    retry: 1,
  });
}

// Income/expense movements change account balances on the server, so the
// account and net-worth queries must be refreshed alongside the dashboard to
// keep every screen showing the same numbers.
function invalidateFinancialData(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["transactions"] });
  void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  void queryClient.invalidateQueries({ queryKey: ["accounts"] });
  void queryClient.invalidateQueries({ queryKey: ["netWorth"] });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionRequest) => transactionsApi.createTransaction(payload),
    onSuccess: () => {
      invalidateFinancialData(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionRequest }) =>
      transactionsApi.updateTransaction(id, data),
    onSuccess: () => {
      invalidateFinancialData(queryClient);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.deleteTransaction(id),
    onSuccess: () => {
      invalidateFinancialData(queryClient);
    },
  });
}
