import { useMutation, useQuery } from "@tanstack/react-query";
import { aiApi } from "../api/ai";
import { ChatRequest } from "../types/api";

export function useRecommendations() {
  return useQuery({
    queryKey: ["ai", "recommendations"],
    queryFn: aiApi.getRecommendations,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useFinancialScore() {
  return useQuery({
    queryKey: ["ai", "score"],
    queryFn: aiApi.getFinancialScore,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useChatMessage() {
  return useMutation({
    mutationFn: (payload: ChatRequest) => aiApi.sendChatMessage(payload),
  });
}
