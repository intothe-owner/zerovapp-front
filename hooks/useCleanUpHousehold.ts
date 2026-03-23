"use client";

import { useQuery, useMutation,useQueryClient} from "@tanstack/react-query";
import {
  getCleanUpHouseholdDetail,
  getCleanUpHouseholdList,
  uploadCleanUpHouseholdPhotos,
  archiveCleanUpHousehold,
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

export function useArchiveCleanUpHousehold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => archiveCleanUpHousehold(id),
    onSuccess: () => {
      // 리스트 쿼리 키인 "clean-up-households"가 포함된 모든 데이터를 무효화하여 리스트를 갱신합니다.
      queryClient.invalidateQueries({ queryKey: ["clean-up-households"] });
    },
  });
}