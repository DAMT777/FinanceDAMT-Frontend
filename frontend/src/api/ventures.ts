import apiClient from "./client";
import {
  CreateBatchRequest,
  CreateVentureRequest,
  UpdateBatchRequest,
  UpdateVentureRequest,
  VentureDto,
} from "../types/api";

export const venturesApi = {
  async getVentures(): Promise<VentureDto[]> {
    const response = await apiClient.get<VentureDto[]>("/ventures");
    return response.data;
  },

  async getVentureById(id: string): Promise<VentureDto> {
    const response = await apiClient.get<VentureDto>(`/ventures/${id}`);
    return response.data;
  },

  async createVenture(data: CreateVentureRequest): Promise<VentureDto> {
    const response = await apiClient.post<VentureDto>("/ventures", data);
    return response.data;
  },

  async updateVenture(id: string, data: UpdateVentureRequest): Promise<VentureDto> {
    const response = await apiClient.put<VentureDto>(`/ventures/${id}`, data);
    return response.data;
  },

  async deleteVenture(id: string): Promise<void> {
    await apiClient.delete(`/ventures/${id}`);
  },

  async addBatch(ventureId: string, data: CreateBatchRequest): Promise<VentureDto> {
    const response = await apiClient.post<VentureDto>(`/ventures/${ventureId}/batches`, data);
    return response.data;
  },

  async updateBatch(ventureId: string, batchId: string, data: UpdateBatchRequest): Promise<VentureDto> {
    const response = await apiClient.put<VentureDto>(`/ventures/${ventureId}/batches/${batchId}`, data);
    return response.data;
  },

  async deleteBatch(ventureId: string, batchId: string): Promise<VentureDto> {
    const response = await apiClient.delete<VentureDto>(`/ventures/${ventureId}/batches/${batchId}`);
    return response.data;
  },
};
