import apiClient from "./client";
import { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from "../types/api";

export const categoriesApi = {
  async getCategories(): Promise<CategoryDto[]> {
    const response = await apiClient.get<CategoryDto[]>("/categories");
    return response.data;
  },

  async getCategoryById(id: string): Promise<CategoryDto> {
    const response = await apiClient.get<CategoryDto>(`/categories/${id}`);
    return response.data;
  },

  async createCategory(data: CreateCategoryRequest): Promise<CategoryDto> {
    const response = await apiClient.post<CategoryDto>("/categories", data);
    return response.data;
  },

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<CategoryDto> {
    const response = await apiClient.put<CategoryDto>(`/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
