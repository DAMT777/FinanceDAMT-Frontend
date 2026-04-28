import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { savingGoalsApi } from "../api/savingGoals";
import { AddContributionRequest, CreateSavingGoalRequest } from "../types/api";

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: savingGoalsApi.getSavingGoals,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSavingGoalRequest) => savingGoalsApi.createSavingGoal(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["goals"] });
      void queryClient.invalidateQueries({ queryKey: ["saving-goals"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAddContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: AddContributionRequest }) =>
      savingGoalsApi.addContribution(goalId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["goals"] });
      void queryClient.invalidateQueries({ queryKey: ["saving-goals"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => savingGoalsApi.deleteSavingGoal(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["goals"] });
      void queryClient.invalidateQueries({ queryKey: ["saving-goals"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
