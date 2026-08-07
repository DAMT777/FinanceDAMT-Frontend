import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { venturesApi } from "../api/ventures";
import {
  CreateBatchRequest,
  CreateVentureRequest,
  UpdateBatchRequest,
  UpdateVentureRequest,
} from "../types/api";

export function useVentures() {
  return useQuery({
    queryKey: ["ventures"],
    queryFn: venturesApi.getVentures,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useVenture(id: string | undefined) {
  return useQuery({
    queryKey: ["ventures", id],
    queryFn: () => venturesApi.getVentureById(id as string),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["ventures"] });
}

export function useCreateVenture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVentureRequest) => venturesApi.createVenture(data),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateVenture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVentureRequest }) =>
      venturesApi.updateVenture(id, data),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteVenture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => venturesApi.deleteVenture(id),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useAddBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ventureId, data }: { ventureId: string; data: CreateBatchRequest }) =>
      venturesApi.addBatch(ventureId, data),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ventureId, batchId, data }: { ventureId: string; batchId: string; data: UpdateBatchRequest }) =>
      venturesApi.updateBatch(ventureId, batchId, data),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ventureId, batchId }: { ventureId: string; batchId: string }) =>
      venturesApi.deleteBatch(ventureId, batchId),
    onSuccess: () => invalidate(queryClient),
  });
}
