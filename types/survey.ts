export type SurveyQuestionType = "multiple" | "subjective";

export interface SurveyQuestionOptionItem {
  id: number;
  questionId: number;
  optionNo: number;
  optionText: string;
}

export interface SurveyQuestionItem {
  id: number;
  surveyId: number;
  orderNo: number;
  type: SurveyQuestionType;
  question: string;
  options?: SurveyQuestionOptionItem[];
}

export interface SurveyItem {
  id: number;
  title: string;
  intro: string | null;
  isActive: boolean;
  questions?: SurveyQuestionItem[];
}

export interface SurveyResponseAnswerItem {
  id: number;
  responseId: number;
  questionId: number;
  selectedOptionNo: number | null;
  subjectiveAnswer: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponseItem {
  id: number;
  surveyId: number;
  householdId: number;
  respondentName: string;
  surveyYear: number;
  surveyMonth: number;
  surveyDay: number;
  signaturePath: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  survey?: SurveyItem;
  answers?: SurveyResponseAnswerItem[];
}

export interface GetSurveyResponseByHouseholdResponse {
  item: SurveyResponseItem;
}

export type SurveyMultipleQuestion = {
  id: string | number;
  type: "multiple";
  question: string;
  options: [string, string, string, string, string];
};

export type SurveySubjectiveQuestion = {
  id: string | number;
  type: "subjective";
  question: string;
};

export type SurveyQuestion = SurveyMultipleQuestion | SurveySubjectiveQuestion;

export type SaveSurveyPayload = {
  title: string;
  intro?: string | null;
  questions: (
    | {
        type: "multiple";
        question: string;
        options: [string, string, string, string, string];
      }
    | {
        type: "subjective";
        question: string;
      }
  )[];
};

export type SurveyActiveResponse = {
  item: {
    id: number;
    title: string;
    intro: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    questions: {
      id: number;
      type: SurveyQuestionType;
      question: string;
      sortOrder: number;
      options: {
        id: number;
        optionNo: number;
        optionText: string;
      }[];
    }[];
  };
};