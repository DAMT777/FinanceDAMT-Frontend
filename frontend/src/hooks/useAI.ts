import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChatRequest) => aiApi.sendChatMessage(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["budget-status"] });
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["goals"] });
      void queryClient.invalidateQueries({ queryKey: ["saving-goals"] });
    },
  });
}
