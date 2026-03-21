"use client";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Siderbar";
import {
  useActiveSurvey,
  useResetActiveSurvey,
  useSaveSurvey,
} from "@/hooks/useSurvey";
import type {
  SaveSurveyPayload,
  SurveyQuestion,
  SurveyQuestionType,
} from "@/types/survey";
import { useEffect, useMemo, useState } from "react";

type MultipleChoiceQuestion = {
  id: string | number;
  type: "multiple";
  question: string;
  options: [string, string, string, string, string];
};

type SubjectiveQuestion = {
  id: string | number;
  type: "subjective";
  question: string;
};

const createMultipleQuestion = (): MultipleChoiceQuestion => ({
  id: crypto.randomUUID(),
  type: "multiple",
  question: "",
  options: ["", "", "", "", ""],
});

const createSubjectiveQuestion = (): SubjectiveQuestion => ({
  id: crypto.randomUUID(),
  type: "subjective",
  question: "",
});

function normalizeLoadedQuestions(rawQuestions: {
  id: number;
  type: SurveyQuestionType;
  question: string;
  sortOrder: number;
  options: {
    id: number;
    optionNo: number;
    optionText: string;
  }[];
}[]): SurveyQuestion[] {
  return rawQuestions.map((q) => {
    if (q.type === "multiple") {
      const sortedOptions = [...(q.options ?? [])].sort(
        (a, b) => a.optionNo - b.optionNo
      );

      const options: [string, string, string, string, string] = [
        sortedOptions[0]?.optionText ?? "",
        sortedOptions[1]?.optionText ?? "",
        sortedOptions[2]?.optionText ?? "",
        sortedOptions[3]?.optionText ?? "",
        sortedOptions[4]?.optionText ?? "",
      ];

      return {
        id: q.id,
        type: "multiple",
        question: q.question,
        options,
      };
    }

    return {
      id: q.id,
      type: "subjective",
      question: q.question,
    };
  });
}

export default function AdminSurveyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const activeSurveyQuery = useActiveSurvey();
  const saveSurveyMutation = useSaveSurvey();
  const resetSurveyMutation = useResetActiveSurvey();
  const [surveyTitle, setSurveyTitle] = useState(
    "2026년 해운대구 냉방기 클린UP 건강프로젝트 사업 만족도조사"
  );
  const [surveyIntro, setSurveyIntro] = useState(
    "안녕하세요?\n본 설문의 목적은 사업 만족도 조사를 통해 더 나은 서비스를 제공하고 의견을 반영하기 위함입니다. 바쁘시더라도 정성껏 응답해 주시기 바랍니다."
  );

  const [draftType, setDraftType] = useState<SurveyQuestionType>("multiple");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [submittedQuestions, setSubmittedQuestions] = useState<SurveyQuestion[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
  const loaded = activeSurveyQuery.data?.item;

  if (!loaded) return;

  const normalizedQuestions = normalizeLoadedQuestions(loaded.questions ?? []);

  setSurveyTitle(loaded.title || "");
  setSurveyIntro(loaded.intro || "");
  setQuestions(normalizedQuestions);
  setSubmittedQuestions(normalizedQuestions);
}, [activeSurveyQuery.data]);

  const canSubmit = useMemo(() => {
    if (!surveyTitle.trim()) return false;
    if (questions.length === 0) return false;

    return questions.every((q) => {
      if (!q.question.trim()) return false;
      if (q.type === "multiple") {
        return q.options.every((opt) => opt.trim());
      }
      return true;
    });
  }, [surveyTitle, questions]);

  const handleAddQuestion = () => {
    setMessage("");

    if (draftType === "multiple") {
      setQuestions((prev) => [...prev, createMultipleQuestion()]);
    } else {
      setQuestions((prev) => [...prev, createSubjectiveQuestion()]);
    }
  };

  const handleChangeQuestionType = (index: number, type: SurveyQuestionType) => {
    setQuestions((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (type === "multiple") {
          return {
            id: item.id,
            type: "multiple",
            question: item.question,
            options: ["", "", "", "", ""],
          };
        }

        return {
          id: item.id,
          type: "subjective",
          question: item.question,
        };
      })
    );
  };

  const handleChangeQuestionText = (index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, question: value } : item))
    );
  };

  const handleChangeOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((item, i) => {
        if (i !== questionIndex || item.type !== "multiple") return item;

        const nextOptions = [...item.options] as [
          string,
          string,
          string,
          string,
          string
        ];
        nextOptions[optionIndex] = value;

        return {
          ...item,
          options: nextOptions,
        };
      })
    );
  };

  const handleRemoveQuestion = (index: number) => {
    setMessage("");
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    setMessage("");

    setQuestions((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= next.length) return prev;

      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleResetAll = async () => {
  try {
    setMessage("");

    await resetSurveyMutation.mutateAsync();

    setSurveyTitle("2026년 해운대구 냉방기 클린UP 건강프로젝트 사업 만족도조사");
    setSurveyIntro(
      "안녕하세요?\n본 설문의 목적은 사업 만족도 조사를 통해 더 나은 서비스를 제공하고 의견을 반영하기 위함입니다. 바쁘시더라도 정성껏 응답해 주시기 바랍니다."
    );
    setDraftType("multiple");
    setQuestions([]);
    setSubmittedQuestions([]);

    setMessage("설문이 초기화되었습니다.");
  } catch (err) {
    setMessage(err instanceof Error ? err.message : "설문 초기화에 실패했습니다.");
  }
};

  const handleSubmitSurvey = async () => {
    if (!canSubmit) return;

    const payload: SaveSurveyPayload = {
      title: surveyTitle.trim(),
      intro: surveyIntro.trim() || null,
      questions: questions.map((q) =>
        q.type === "multiple"
          ? {
              type: "multiple",
              question: q.question.trim(),
              options: q.options.map((opt) => opt.trim()) as [
                string,
                string,
                string,
                string,
                string
              ],
            }
          : {
              type: "subjective",
              question: q.question.trim(),
            }
      ),
    };

    try {
      setMessage("");

      await saveSurveyMutation.mutateAsync(payload);

      const normalizedSubmitted = questions.map((q) =>
        q.type === "multiple"
          ? {
              ...q,
              options: [...q.options] as [string, string, string, string, string],
            }
          : { ...q }
      );

      setSubmittedQuestions(normalizedSubmitted);
      setMessage("설문이 저장되었습니다.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "설문 저장에 실패했습니다.");
    }
  };

  const isLoadingInitial = activeSurveyQuery.isLoading;
  const initialLoadError =
    activeSurveyQuery.isError && activeSurveyQuery.error instanceof Error
      ? activeSurveyQuery.error.message
      : "";

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="lg:pl-72">
        <Header sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-xl font-bold">설문조사 등록</h1>
                <p className="mt-1 text-sm text-gray-500">
                  객관식 또는 서술식 문항을 추가하고 등록하면 DB와 미리보기에 반영됩니다.
                </p>
              </div>

              <button
  type="button"
  onClick={handleResetAll}
  disabled={resetSurveyMutation.isPending}
  className="inline-flex items-center justify-center rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
>
  {resetSurveyMutation.isPending ? "초기화 중..." : "초기화"}
</button>
            </div>
          </section>

          {isLoadingInitial ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-sm text-gray-500">
              설문 정보를 불러오는 중입니다.
            </section>
          ) : null}

          {!isLoadingInitial && initialLoadError && initialLoadError !== "등록된 설문이 없습니다." ? (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
              {initialLoadError}
            </section>
          ) : null}

          {message ? (
            <section
              className={`rounded-2xl border p-4 text-sm shadow-sm ${
                message.includes("실패")
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {message}
            </section>
          ) : null}

          <section className="grid grid-cols-1 xl:grid-cols-[520px_minmax(0,1fr)] gap-6">
            <div className="space-y-6">
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold">기본 정보</h2>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      설문 제목
                    </label>
                    <input
                      type="text"
                      value={surveyTitle}
                      onChange={(e) => {
                        setMessage("");
                        setSurveyTitle(e.target.value);
                      }}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                      placeholder="설문 제목을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      안내 문구
                    </label>
                    <textarea
                      value={surveyIntro}
                      onChange={(e) => {
                        setMessage("");
                        setSurveyIntro(e.target.value);
                      }}
                      rows={5}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                      placeholder="설문 안내 문구를 입력하세요"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold">문항 추가</h2>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                  <select
                    value={draftType}
                    onChange={(e) => {
                      setMessage("");
                      setDraftType(e.target.value as SurveyQuestionType);
                    }}
                    className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                  >
                    <option value="multiple">객관식</option>
                    <option value="subjective">서술식</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    문항 추가
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold">문항 작성</h2>
                  <span className="text-sm text-gray-500">총 {questions.length}개</span>
                </div>

                {questions.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                    아직 추가된 문항이 없습니다.
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="rounded-2xl border border-gray-200 p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                              {index + 1}번 문항
                            </span>

                            <select
                              value={question.type}
                              onChange={(e) =>
                                handleChangeQuestionType(
                                  index,
                                  e.target.value as SurveyQuestionType
                                )
                              }
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                            >
                              <option value="multiple">객관식</option>
                              <option value="subjective">서술식</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(index, "up")}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              위로
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(index, "down")}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              아래로
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(index)}
                              className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              삭제
                            </button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            질문
                          </label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) =>
                              handleChangeQuestionText(index, e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                            placeholder="질문 내용을 입력하세요"
                          />
                        </div>

                        {question.type === "multiple" && (
                          <div className="mt-4 space-y-3">
                            <p className="text-sm font-medium text-gray-700">
                              보기 5개
                            </p>

                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="grid grid-cols-[28px_1fr] items-center gap-2"
                              >
                                <div className="flex items-center justify-center">
                                  <input
                                    type="radio"
                                    disabled
                                    name={`preview-radio-${question.id}`}
                                    className="h-4 w-4"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    handleChangeOption(
                                      index,
                                      optionIndex,
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                                  placeholder={`보기 ${optionIndex + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handleSubmitSurvey}
                    disabled={!canSubmit || saveSurveyMutation.isPending}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {saveSurveyMutation.isPending ? "저장 중..." : "등록"}
                  </button>
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold">설문 미리보기</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    저장되었거나 현재 작성 중인 설문 내용이 표시됩니다.
                  </p>
                </div>
              </div>

              <div className="mx-auto max-w-[760px] border border-gray-300 bg-white px-8 py-8">
                <div className="mx-auto max-w-[560px]">
                  <div className="inline-block bg-yellow-100 px-4 py-2 text-center text-xl font-extrabold leading-tight">
                    {surveyTitle || "설문 제목"}
                  </div>

                  <div className="mt-5 bg-gray-100 px-4 py-4 text-[15px] leading-8 whitespace-pre-wrap text-gray-700">
                    {surveyIntro || "설문 안내 문구가 여기에 표시됩니다."}
                  </div>

                  <div className="mt-8 space-y-8">
                    {submittedQuestions.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                        등록된 설문 문항이 없습니다.
                      </div>
                    ) : (
                      submittedQuestions.map((question, index) => (
                        <div key={question.id}>
                          <div className="text-[17px] font-semibold leading-8 text-gray-900">
                            {question.type === "multiple"
                              ? `${index + 1}. ${question.question}`
                              : question.question}
                          </div>

                          {question.type === "multiple" ? (
                            <div className="mt-3 border-2 border-gray-400 px-4 py-3">
                              <div className="grid grid-cols-1 gap-y-2 md:grid-cols-2 md:gap-x-6">
                                {question.options.map((option, optionIndex) => (
                                  <label
                                    key={optionIndex}
                                    className="flex items-center gap-2 text-[15px] text-gray-800"
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${question.id}`}
                                      className="h-4 w-4"
                                      disabled
                                    />
                                    <span>
                                      ({optionIndex + 1}) {option}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 min-h-[110px] border-2 border-gray-400 bg-white" />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4 bg-gray-100 px-3 py-1 text-[15px] font-semibold text-gray-800">
                    본 서비스에 대한 의견을 확인합니다.
                  </div>

                  <div className="border-t border-gray-400 px-3 py-2 text-center text-[15px] font-semibold text-gray-800">
                    2026년&nbsp;&nbsp;&nbsp;월&nbsp;&nbsp;&nbsp;일&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;성명&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(서명)
                  </div>
                </div>
              </div>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}