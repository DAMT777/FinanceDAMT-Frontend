import apiClient from "./client";
import { DashboardSummaryDto } from "../types/api";

export const dashboardApi = {
  async getSummary(month?: number, year?: number): Promise<DashboardSummaryDto> {
    const response = await apiClient.get<DashboardSummaryDto>("/dashboard", {
      params: { month, year },
    });
    return response.data;
  },
};
