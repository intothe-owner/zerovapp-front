import type { SaveSurveyPayload, SurveyActiveResponse,GetSurveyResponseByHouseholdResponse } from "@/types/survey";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function saveSurvey(payload: SaveSurveyPayload) {
  const res = await fetch(`${API_BASE_URL}/survey`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "설문 저장에 실패했습니다.");
  }

  return data;
}

export async function getActiveSurvey(): Promise<SurveyActiveResponse> {
  const res = await fetch(`${API_BASE_URL}/survey/active`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("등록된 설문이 없습니다.");
    }
    throw new Error(data?.message || data?.error || "설문을 불러오지 못했습니다.");
  }

  return data;
}

export async function resetActiveSurvey() {
  const res = await fetch(`${API_BASE_URL}/survey/active`, {
    method: "DELETE",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "설문 초기화에 실패했습니다.");
  }

  return data;
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data && data.message) ||
      "요청 처리 중 오류가 발생했습니다.";
    throw new Error(String(message));
  }

  return data as T;
}

export async function getSurveyResponseByHousehold(
  householdId: number
): Promise<GetSurveyResponseByHouseholdResponse> {
  const res = await fetch(
    `${API_BASE_URL}/survey/response/household/${householdId}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  return parseJson<GetSurveyResponseByHouseholdResponse>(res);
}