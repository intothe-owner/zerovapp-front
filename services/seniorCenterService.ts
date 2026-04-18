import { SeniorCenterItem, SeniorCenterListParams, SeniorCenterListResponse } from "@/types/seniorCenter";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function getSeniorCenterList(
  params: SeniorCenterListParams
): Promise<SeniorCenterListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.keyword) searchParams.set("keyword", params.keyword);
  if (params.sortField) searchParams.set("sortField", params.sortField);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.isComplete !== undefined) searchParams.set("isComplete", String(params.isComplete));
  if (params.isArchive !== undefined ) searchParams.set("isArchive", String(params.isArchive));

  const res = await fetch(`${BACKEND_URL}/senior?${searchParams.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "데이터 로드 실패");

  // 백엔드 응답 형식이 items/pagination 구조가 아닐 경우 매핑 처리가 필요할 수 있습니다.
  return {
    items: data.data,
    pagination: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      total: data.total || 0,
      totalPages: Math.ceil((data.total || 0) / (params.pageSize || 20)),
    },
  };
}

/**
 * 2. 경로당 상세 조회 (요청하신 함수)
 */
export async function getSeniorCenterDetail(id: number): Promise<SeniorCenterItem> {
  const { data } = await axios.get(`${BACKEND_URL}/senior/${id}`);
  if (!data.ok) throw new Error(data.message || "상세 정보 로드 실패");
  return data.data;
}

/**
 * 3. 경로당 정보 수정 (요청하신 함수)
 */
export async function updateSeniorCenter(
  id: number, 
  payload: Partial<SeniorCenterItem>
): Promise<SeniorCenterItem> {
  const { data } = await axios.patch(`${BACKEND_URL}/senior/${id}`, payload);
  if (!data.ok) throw new Error(data.message || "정보 수정 실패");
  return data.data;
}

/**
 * 4. 경로당 사진 업로드
 */
export async function uploadSeniorCenterPhotos(
  id: number,
  payload: { beforeImage?: File; afterImage?: File }
) {
  const formData = new FormData();
  if (payload.beforeImage) formData.append("beforeImage", payload.beforeImage);
  if (payload.afterImage) formData.append("afterImage", payload.afterImage);

  const { data } = await axios.put(`${BACKEND_URL}/api/senior-centers/${id}/photos`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  
  if (!data.ok) throw new Error(data.message || "사진 업로드 실패");
  return data.data;
}

/**
 * 경로당 상세 보고서 사진 업로드 (에어컨/공기청정기 전용)
 */
export async function uploadSeniorCenterReportPhoto(payload: {
  centerId: number;
  category: string;
  fieldName: string;
  file: File;
}) {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("fieldName", payload.fieldName);

  // 엔드포인트 예시: /api/senior-centers/10/reports/AIR_CONDITIONER/photos
  const { data } = await axios.put(
    `${BACKEND_URL}/api/senior-centers/${payload.centerId}/reports/${payload.category}/photos`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  if (!data.ok) throw new Error(data.message || "보고서 사진 업로드 실패");
  return data.data;
}