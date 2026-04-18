import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSeniorCenterDetail, getSeniorCenterList, updateSeniorCenter, uploadSeniorCenterPhotos, uploadSeniorCenterReportPhoto } from "@/services/seniorCenterService";
import { SeniorCenterItem, SeniorCenterListParams } from "@/types/seniorCenter";

export function useSeniorCenterList(params: SeniorCenterListParams) {
  return useQuery({
    queryKey: ["senior-centers", params],
    queryFn: () => getSeniorCenterList(params),
    placeholderData: (previousData) => previousData,
  });
}
/**
 * 2. 경로당 상세 정보 조회 훅
 */
export function useSeniorCenterDetail(id: number) {
  return useQuery({
    queryKey: ["senior-center", id],
    queryFn: () => getSeniorCenterDetail(id),
    // ID가 유효한 숫자인 경우에만 쿼리를 실행합니다.
    enabled: !!id && !isNaN(id),
  });
}

/**
 * 3. 경로당 정보 수정(상태 업데이트 등) 훅
 */
export function useUpdateSeniorCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<SeniorCenterItem> & { id: number }) =>
      updateSeniorCenter(payload.id, payload),
    onSuccess: (data, variables) => {
      // 수정 성공 시 해당 항목의 상세 정보와 전체 리스트 쿼리를 무효화하여 최신화합니다.
      queryClient.invalidateQueries({ queryKey: ["senior-center", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["senior-centers"] });
    },
  });
}

/**
 * 4. 경로당 사진 업로드 훅
 */
export function useUploadSeniorCenterPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: number; beforeImage?: File; afterImage?: File }) =>
      uploadSeniorCenterPhotos(payload.id, payload),
    onSuccess: (_data, variables) => {
      // 사진 업로드 성공 시 상세 정보를 다시 불러옵니다.
      queryClient.invalidateQueries({ queryKey: ["senior-center", variables.id] });
    },
  });
}

/**
 * 경로당 상세 보고서 사진 업로드 훅
 */
export function useUploadSeniorCenterReportPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadSeniorCenterReportPhoto,
    onSuccess: (_data, variables) => {
      // 업로드 성공 시 해당 경로당의 상세 정보 쿼리를 무효화하여 화면을 갱신합니다.
      queryClient.invalidateQueries({
        queryKey: ["senior-center", variables.centerId]
      });
    },
    onError: (error: any) => {
      console.error("Report Photo Upload Error:", error);
    }
  });
}