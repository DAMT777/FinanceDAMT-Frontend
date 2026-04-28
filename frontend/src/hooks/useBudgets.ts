import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { budgetsApi } from "../api/budgets";
import { SetBudgetRequest } from "../types/api";

export function useBudgets(month?: number, year?: number) {
  return useQuery({
    queryKey: ["budgets", month, year],
    queryFn: () => budgetsApi.getBudgets(month, year),
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useSetBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SetBudgetRequest) => budgetsApi.setBudget(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
      void queryClient.invalidateQueries({ queryKey: ["budget-status"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsApi.deleteBudget(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
