import apiClient from "./client";
import {
  CreateSubscriptionRequest,
  SubscriptionDto,
  UpdateSubscriptionRequest,
} from "../types/api";

export const subscriptionsApi = {
  async getSubscriptions(): Promise<SubscriptionDto[]> {
    const response = await apiClient.get<SubscriptionDto[]>("/subscriptions");
    return response.data;
  },

  async getSubscriptionById(id: string): Promise<SubscriptionDto> {
    const response = await apiClient.get<SubscriptionDto>(`/subscriptions/${id}`);
    return response.data;
  },

  async createSubscription(data: CreateSubscriptionRequest): Promise<SubscriptionDto> {
    const response = await apiClient.post<SubscriptionDto>("/subscriptions", data);
    return response.data;
  },

  async updateSubscription(id: string, data: UpdateSubscriptionRequest): Promise<SubscriptionDto> {
    const response = await apiClient.put<SubscriptionDto>(`/subscriptions/${id}`, data);
    return response.data;
  },

  async deleteSubscription(id: string): Promise<void> {
    await apiClient.delete(`/subscriptions/${id}`);
  },
};
