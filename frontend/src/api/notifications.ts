import apiClient from "./client";
import { NotificationDto } from "../types/api";

export const notificationsApi = {
  async getNotifications(): Promise<NotificationDto[]> {
    const response = await apiClient.get<NotificationDto[]>("/notifications");
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>("/notifications/unread-count");
    return response.data.count;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post("/notifications/read-all");
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};
