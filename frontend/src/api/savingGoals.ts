import apiClient from "./client";
import {
  AddContributionRequest,
  CreateSavingGoalRequest,
  SavingGoalDto,
  UpdateSavingGoalRequest,
} from "../types/api";

export const savingGoalsApi = {
  async getSavingGoals(): Promise<SavingGoalDto[]> {
    const response = await apiClient.get<SavingGoalDto[]>("/saving-goals");
    return response.data;
  },

  async getSavingGoalById(id: string): Promise<SavingGoalDto> {
    const response = await apiClient.get<SavingGoalDto>(`/saving-goals/${id}`);
    return response.data;
  },

  async createSavingGoal(data: CreateSavingGoalRequest): Promise<SavingGoalDto> {
    const response = await apiClient.post<SavingGoalDto>("/saving-goals", data);
    return response.data;
  },

  async updateSavingGoal(id: string, data: UpdateSavingGoalRequest): Promise<SavingGoalDto> {
    const response = await apiClient.put<SavingGoalDto>(`/saving-goals/${id}`, data);
    return response.data;
  },

  async deleteSavingGoal(id: string): Promise<void> {
    await apiClient.delete(`/saving-goals/${id}`);
  },

  async addContribution(goalId: string, data: AddContributionRequest): Promise<SavingGoalDto> {
    const response = await apiClient.post<SavingGoalDto>(`/saving-goals/${goalId}/contributions`, data);
    return response.data;
  },

  async removeContribution(goalId: string, contributionId: string): Promise<void> {
    await apiClient.delete(`/saving-goals/${goalId}/contributions/${contributionId}`);
  },
};
