"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadCleanUpHouseholdExcel, uploadSeniorCenterExcel } from "@/services/import";
import { CleanUpHouseholdImportRequest, CleanUpHouseholdImportResponse, SeniorCenterImportRequest, SeniorCenterImportResponse } from "@/types/import";

export function useUploadCleanUpHouseholdExcel() {
  return useMutation<CleanUpHouseholdImportResponse, Error, CleanUpHouseholdImportRequest>({
    mutationFn: uploadCleanUpHouseholdExcel,
  });
}


export function useUploadSeniorCenterExcel() {
  const queryClient = useQueryClient();

  return useMutation<SeniorCenterImportResponse, Error, SeniorCenterImportRequest>({
    mutationFn: uploadSeniorCenterExcel,
    onSuccess: () => {
      // 업로드 성공 시 경로당 목록 캐시를 갱신합니다.
      queryClient.invalidateQueries({ queryKey: ["seniorCenters"] });
    },
  });
}