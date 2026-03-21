"use client";

import { useQuery, useMutation,useQueryClient} from "@tanstack/react-query";
import {
  getCleanUpHouseholdDetail,
  getCleanUpHouseholdList,
  uploadCleanUpHouseholdPhotos,
  type UploadHouseholdPhotosPayload,
} from "@/services/cleanUpHouseholdService";
import { CleanUpHouseholdListParams } from "@/types/cleanUpHousehold";

export function useCleanUpHouseholdList(params: CleanUpHouseholdListParams) {
  return useQuery({
    queryKey: ["clean-up-households", params],
    queryFn: () => getCleanUpHouseholdList(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCleanUpHouseholdDetail(id: number) {
  return useQuery({
    queryKey: ["clean-up-household-detail", id],
    queryFn: () => getCleanUpHouseholdDetail(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
export function useUploadCleanUpHouseholdPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadHouseholdPhotosPayload) =>
      uploadCleanUpHouseholdPhotos(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["cleanUpHouseholdDetail", variables.id],
      });
    },
  });
}