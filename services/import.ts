import { CleanUpHouseholdImportRequest, CleanUpHouseholdImportResponse } from "@/types/import";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
console.log(BACKEND_URL);

if (!BACKEND_URL) {
  // 개발 중 빠르게 인지하기 위한 체크
  console.warn("BACKEND_URL 환경변수가 설정되지 않았습니다.");
}

export async function uploadCleanUpHouseholdExcel(
  payload: CleanUpHouseholdImportRequest
): Promise<CleanUpHouseholdImportResponse> {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("programYear", String(payload.programYear));
  formData.append("listType", payload.listType);
  formData.append("overwrite", String(payload.overwrite));

  const response = await fetch(`${BACKEND_URL}/import/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "엑셀 업로드 중 오류가 발생했습니다.");
  }

  return data;
}