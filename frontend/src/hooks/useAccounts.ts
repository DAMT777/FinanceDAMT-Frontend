import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountsApi } from "../api/accounts";
import { CreateAccountRequest } from "../types/api";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: accountsApi.getAccounts,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useNetWorth() {
  return useQuery({
    queryKey: ["netWorth"],
    queryFn: accountsApi.getNetWorth,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccountRequest) => accountsApi.createAccount(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
      void queryClient.invalidateQueries({ queryKey: ["netWorth"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.deleteAccount(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
      void queryClient.invalidateQueries({ queryKey: ["netWorth"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
