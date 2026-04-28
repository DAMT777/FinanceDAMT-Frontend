import apiClient from "./client";
import { LoginRequest, LoginResponse, RegisterRequest } from "../types/api";

export const authApi = {
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/register", data);
    return response.data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const payload: LoginRequest = { email, password };
    const response = await apiClient.post<LoginResponse>("/auth/login", payload);
    return response.data;
  },

  async refresh(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/refresh", { refreshToken });
    return response.data;
  },

  async revoke(refreshToken: string): Promise<void> {
    await apiClient.post("/auth/revoke", { refreshToken });
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post("/auth/reset-password", { token, newPassword });
  },
};
