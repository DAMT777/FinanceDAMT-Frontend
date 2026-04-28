import apiClient from "./client";
import {
  AccountDto,
  CreateAccountRequest,
  NetWorthDto,
  TransferRequest,
  UpdateAccountRequest,
} from "../types/api";

export const accountsApi = {
  async getAccounts(): Promise<AccountDto[]> {
    const response = await apiClient.get<AccountDto[]>("/accounts");
    return response.data;
  },

  async getAccountById(id: string): Promise<AccountDto> {
    const response = await apiClient.get<AccountDto>(`/accounts/${id}`);
    return response.data;
  },

  async createAccount(data: CreateAccountRequest): Promise<AccountDto> {
    const response = await apiClient.post<AccountDto>("/accounts", data);
    return response.data;
  },

  async updateAccount(id: string, data: UpdateAccountRequest): Promise<AccountDto> {
    const response = await apiClient.put<AccountDto>(`/accounts/${id}`, data);
    return response.data;
  },

  async deleteAccount(id: string): Promise<void> {
    await apiClient.delete(`/accounts/${id}`);
  },

  async transfer(fromAccountId: string, toAccountId: string, amount: number): Promise<void> {
    const payload: TransferRequest = { fromAccountId, toAccountId, amount };
    await apiClient.post("/accounts/transfer", payload);
  },

  async getNetWorth(): Promise<NetWorthDto> {
    const response = await apiClient.get<NetWorthDto>("/accounts/net-worth");
    return response.data;
  },
};
