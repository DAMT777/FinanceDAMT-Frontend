import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";

export function useDashboard(month?: number, year?: number) {
  return useQuery({
    queryKey: ["dashboard", month, year],
    queryFn: () => dashboardApi.getSummary(month, year),
    // Normalize the collection fields so consumers can iterate without null
    // guards. Names mirror the real API contract (see DashboardSummaryDto).
    select: (data) => ({
      ...data,
      expenseBreakdown: data?.expenseBreakdown ?? [],
      incomeVsExpensesLast6Months: data?.incomeVsExpensesLast6Months ?? [],
      balanceEvolutionLast6Months: data?.balanceEvolutionLast6Months ?? [],
      spendingHeatmap: data?.spendingHeatmap ?? [],
    }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
