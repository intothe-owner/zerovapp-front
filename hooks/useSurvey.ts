import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveSurvey, saveSurvey,resetActiveSurvey,getSurveyResponseByHousehold } from "@/services/surveyService";
import type { SaveSurveyPayload } from "@/types/survey";
import type { GetSurveyResponseByHouseholdResponse } from "@/types/survey";
export function useActiveSurvey() {
  return useQuery({
    queryKey: ["activeSurvey"],
    queryFn: getActiveSurvey,
    retry: false,
  });
}

export function useSaveSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveSurveyPayload) => saveSurvey(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["activeSurvey"],
      });
    },
  });
}
export function useResetActiveSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetActiveSurvey,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["activeSurvey"],
      });
    },
  });
}

export function useSurveyResponseByHousehold(householdId?: number) {
  return useQuery<GetSurveyResponseByHouseholdResponse>({
    queryKey: ["survey-response-by-household", householdId],
    queryFn: () => getSurveyResponseByHousehold(householdId as number),
    enabled: !!householdId && householdId > 0,
    retry: false,
  });
}