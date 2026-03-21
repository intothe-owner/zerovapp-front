"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadCleanUpHouseholdExcel } from "@/services/import";
import { CleanUpHouseholdImportRequest, CleanUpHouseholdImportResponse } from "@/types/import";

export function useUploadCleanUpHouseholdExcel() {
  return useMutation<CleanUpHouseholdImportResponse, Error, CleanUpHouseholdImportRequest>({
    mutationFn: uploadCleanUpHouseholdExcel,
  });
}