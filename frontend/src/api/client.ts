import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../config/env";
import { storage } from "../utils/storage";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    return config;
  }

  if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = AxiosHeaders.from(config.headers);
  }

  config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error("Missing refresh token");
      }

      const { data } = await axios.post<{
        accessToken: string;
        refreshToken: string;
      }>(`${apiClient.defaults.baseURL}/auth/refresh`, { token: refreshToken });

      await storage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      await storage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);

      if (!(originalRequest.headers instanceof AxiosHeaders)) {
        originalRequest.headers = AxiosHeaders.from(originalRequest.headers);
      }
      originalRequest.headers.set("Authorization", `Bearer ${data.accessToken}`);

      return apiClient(originalRequest);
    } catch (refreshError) {
      await storage.removeItem(ACCESS_TOKEN_KEY);
      await storage.removeItem(REFRESH_TOKEN_KEY);

      const authStore = await import("../store/authStore");
      await authStore.useAuthStore.getState().logout();

      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
