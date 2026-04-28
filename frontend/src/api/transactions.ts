import apiClient from "./client";
import {
  CreateTransactionRequest,
  PaginatedResult,
  TransactionDto,
  TransactionFilters,
  UpdateTransactionRequest,
} from "../types/api";

export const transactionsApi = {
  async getTransactions(filters: TransactionFilters = {}): Promise<PaginatedResult<TransactionDto>> {
    const response = await apiClient.get<PaginatedResult<TransactionDto>>("/transactions", { params: filters });
    return response.data;
  },

  async getTransactionById(id: string): Promise<TransactionDto> {
    const response = await apiClient.get<TransactionDto>(`/transactions/${id}`);
    return response.data;
  },

  async createTransaction(data: CreateTransactionRequest): Promise<TransactionDto> {
    const response = await apiClient.post<TransactionDto>("/transactions", data);
    return response.data;
  },

  async updateTransaction(id: string, data: UpdateTransactionRequest): Promise<TransactionDto> {
    const response = await apiClient.put<TransactionDto>(`/transactions/${id}`, data);
    return response.data;
  },

  async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}`);
  },

  async getRecurringTransactions(): Promise<TransactionDto[]> {
    const response = await apiClient.get<TransactionDto[]>("/transactions/recurring");
    return response.data;
  },
};
