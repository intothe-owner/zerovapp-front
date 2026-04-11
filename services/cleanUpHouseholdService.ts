import {
  CleanUpHouseholdListParams,
  CleanUpHouseholdListResponse,
  CleanUpHouseholdDetailResponse,
} from "@/types/cleanUpHousehold";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function buildQueryString(params: CleanUpHouseholdListParams) {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.q) searchParams.set("q", params.q);
  if (params.group) searchParams.set("group", params.group);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.order) searchParams.set("order", params.order);
  // 추가: 보관함 여부 전달
  if (params.isArchived !== undefined) {
    searchParams.set("isArchived", String(params.isArchived));
  }
  // [수정] 작업완료 여부 전달 추가
  if (params.isComplete !== undefined) {
    searchParams.set("isComplete", String(params.isComplete));
  }
  return searchParams.toString();
}

export async function getCleanUpHouseholdList(
  params: CleanUpHouseholdListParams
): Promise<CleanUpHouseholdListResponse> {
  const queryString = buildQueryString(params);
  console.log(queryString);
  const response = await fetch(`${BACKEND_URL}/households/list?${queryString}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "목록을 불러오지 못했습니다.");
  }

  return data;
}

export async function getCleanUpHouseholdDetail(
  id: number
): Promise<CleanUpHouseholdDetailResponse> {
  const response = await fetch(`${BACKEND_URL}/households/${id}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "상세 정보를 불러오지 못했습니다.");
  }

  return data;
}

export type UploadHouseholdPhotosPayload = {
  id: number;
  addressImage?: File | null;
  beforeImage?: File | null;
  duringImage?: File | null;
  afterImage?: File | null;
};

export async function uploadCleanUpHouseholdPhotos(
  payload: UploadHouseholdPhotosPayload
) {
  const formData = new FormData();

  if (payload.addressImage) formData.append("addressImage", payload.addressImage);
  if (payload.beforeImage) formData.append("beforeImage", payload.beforeImage);
  if (payload.duringImage) formData.append("duringImage", payload.duringImage);
  if (payload.afterImage) formData.append("afterImage", payload.afterImage);

  const res = await fetch(`${BACKEND_URL}/households/${payload.id}/photos`, {
    method: "PUT",
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || data?.message || "사진 업로드에 실패했습니다.");
  }

  return data;
}

export async function archiveCleanUpHousehold(id: number,is_complete?:boolean) {
  // 백엔드 주소에 맞춰 PATCH 요청 전송
  const response = await axios.patch(`${BACKEND_URL}/households/${id}/archive`, {
    is_complete: is_complete ?? false // 서버에서 req.body.is_complete로 받게 됨
  });
  return response.data;
}


// services/cleanUpHouseholdService.ts 에 추가

export async function createCleanUpHousehold(payload: any) {
  const response = await fetch(`${BACKEND_URL}/households`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "대상자 등록에 실패했습니다.");
  }

  return data;
}