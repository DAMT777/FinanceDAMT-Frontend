import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";

export function useDashboard(month?: number, year?: number) {
  return useQuery({
    queryKey: ["dashboard", month, year],
    queryFn: () => dashboardApi.getSummary(month, year),
    select: (data) => ({
      ...data,
      expenseByCategory: data?.expenseByCategory ?? [],
      monthlyTrend: data?.monthlyTrend ?? [],
      balanceEvolution: data?.balanceEvolution ?? [],
      spendingHeatmap: data?.spendingHeatmap ?? [],
      recentTransactions: data?.recentTransactions ?? [],
      savingGoals: data?.savingGoals ?? [],
      budgets: data?.budgets ?? [],
    }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
