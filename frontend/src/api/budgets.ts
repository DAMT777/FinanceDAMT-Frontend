import apiClient from "./client";
import { BudgetDto, SetBudgetRequest } from "../types/api";

export const budgetsApi = {
  async getBudgets(month?: number, year?: number): Promise<BudgetDto[]> {
    const response = await apiClient.get<BudgetDto[]>("/budgets", { params: { month, year } });
    return response.data;
  },

  async getBudgetStatus(month?: number, year?: number): Promise<BudgetDto[]> {
    const response = await apiClient.get<BudgetDto[]>("/budgets/status", { params: { month, year } });
    return response.data;
  },

  async setBudget(data: SetBudgetRequest): Promise<BudgetDto> {
    const response = await apiClient.post<BudgetDto>("/budgets", data);
    return response.data;
  },

  async deleteBudget(id: string): Promise<void> {
    await apiClient.delete(`/budgets/${id}`);
  },
};
