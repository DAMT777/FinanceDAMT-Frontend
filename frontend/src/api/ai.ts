import apiClient from "./client";
import {
  AIRecommendationDto,
  ChatMessageDto,
  ChatRequest,
  ChatResponse,
  FinancialScoreDto,
  ParseExpenseResult,
  SpendingPredictionDto,
} from "../types/api";

export const aiApi = {
  async sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>("/ai/chat", data);
    return response.data;
  },

  async getChatHistory(): Promise<ChatMessageDto[]> {
    const response = await apiClient.get<ChatMessageDto[]>("/ai/chat/history");
    return response.data;
  },

  async parseExpense(input: string): Promise<ParseExpenseResult> {
    const response = await apiClient.post<{ parsed: ParseExpenseResult }>("/ai/parse-expense", { input });
    return response.data.parsed;
  },

  async getRecommendations(): Promise<AIRecommendationDto[]> {
    const response = await apiClient.get<AIRecommendationDto[]>("/ai/recommendations");
    return response.data;
  },

  async generateRecommendations(): Promise<AIRecommendationDto[]> {
    const response = await apiClient.post<AIRecommendationDto[]>("/ai/recommendations/generate");
    return response.data;
  },

  async getFinancialScore(): Promise<FinancialScoreDto> {
    const response = await apiClient.get<FinancialScoreDto>("/ai/score");
    return response.data;
  },

  async calculateFinancialScore(): Promise<FinancialScoreDto> {
    const response = await apiClient.post<FinancialScoreDto>("/ai/score/calculate");
    return response.data;
  },

  async getSpendingPrediction(): Promise<SpendingPredictionDto> {
    const response = await apiClient.get<SpendingPredictionDto>("/ai/prediction");
    return response.data;
  },
};
