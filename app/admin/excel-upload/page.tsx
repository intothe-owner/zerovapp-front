"use client";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Siderbar";
import { useUploadCleanUpHouseholdExcel } from "@/hooks/useImport";
import { ImportListType } from "@/types/import";
import { ChangeEvent, DragEvent, FormEvent, useMemo, useState } from "react";

const AdminExcelUploadPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const [file, setFile] = useState<File | null>(null);
  const [programYear, setProgramYear] = useState<number>(2026);
  const [listType, setListType] = useState<ImportListType>("SELECTED");
  const [overwrite, setOverwrite] = useState<boolean>(true);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useUploadCleanUpHouseholdExcel();

  const acceptedText = useMemo(() => {
    return ".xls, .xlsx";
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) return;

    const lowerName = selected.name.toLowerCase(); 
    if (!lowerName.endsWith(".xls") && !lowerName.endsWith(".xlsx")) {
      alert("엑셀 파일(.xls, .xlsx)만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }

    setFile(selected);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const dropped = e.dataTransfer.files?.[0] ?? null;
    if (!dropped) return;

    const lowerName = dropped.name.toLowerCase();
    if (!lowerName.endsWith(".xls") && !lowerName.endsWith(".xlsx")) {
      alert("엑셀 파일(.xls, .xlsx)만 업로드할 수 있습니다.");
      return;
    }

    setFile(dropped);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("업로드할 엑셀 파일을 선택해 주세요.");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        file,
        programYear,
        listType,
        overwrite,
      }); 

      alert("엑셀 업로드가 완료되었습니다.");
      setFile(null);
    } catch (error) {
      console.error(error);
    }
  };

  const result = uploadMutation.data;

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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-2xl font-bold tracking-tight">냉난방기 클린UP 엑셀 업로드</h1>
              <p className="text-sm text-gray-500">
                백엔드 업로드 경로: <span className="font-medium">/import/upload</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">사업연도</label>
                  <input
                    type="number"
                    value={programYear}
                    onChange={(e) => setProgramYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    min={2000}
                    max={2100}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">명단 구분</label>
                  <select
                    value={listType}
                    onChange={(e) => setListType(e.target.value as ImportListType)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="SELECTED">선정자 (SELECTED)</option>
                    <option value="WAITLIST">대기자 (WAITLIST)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">저장 방식</label>
                  <select
                    value={overwrite ? "true" : "false"}
                    onChange={(e) => setOverwrite(e.target.value === "true")}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="true">기존 데이터 덮어쓰기</option>
                    <option value="false">중복 시 업데이트</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">엑셀 파일</label>

                <label
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="file"
                    accept={acceptedText}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="space-y-2">
                    <p className="text-base font-semibold text-gray-800">
                      파일을 드래그하거나 클릭해서 업로드
                    </p>
                    <p className="text-sm text-gray-500">지원 형식: {acceptedText}</p>
                    {file && (
                      <div className="mt-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
                        선택 파일: <span className="font-semibold">{file.name}</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadMutation.isPending ? "업로드 중..." : "엑셀 업로드"}
                </button>

                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    파일 제거
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">상태</p>
              <p className="mt-2 text-xl font-bold">
                {uploadMutation.isPending
                  ? "업로드 중"
                  : uploadMutation.isSuccess
                  ? "완료"
                  : uploadMutation.isError
                  ? "실패"
                  : "대기"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">저장 행 수</p>
              <p className="mt-2 text-xl font-bold">{result?.savedRows ?? 0}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">에러 행 수</p>
              <p className="mt-2 text-xl font-bold">{result?.errorCount ?? 0}</p>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold">업로드 결과</h2>
            </div>

            {uploadMutation.isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {uploadMutation.error.message}
              </div>
            )}

            {uploadMutation.isSuccess && result && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">파일명</p>
                    <p className="mt-1 font-semibold break-all">{result.fileName ?? "-"}</p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">사업연도</p>
                    <p className="mt-1 font-semibold">{result.programYear ?? "-"}</p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">명단 구분</p>
                    <p className="mt-1 font-semibold">{result.listType ?? "-"}</p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">전체 행 수</p>
                    <p className="mt-1 font-semibold">{result.totalRows ?? 0}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-800">처리 메시지</p>
                  <p className="mt-2 text-sm text-gray-600">{result.message}</p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-800">에러 목록</p>

                  {result.errors && result.errors.length > 0 ? (
                    <div className="mt-3 max-h-80 overflow-y-auto rounded-lg bg-gray-50 p-3">
                      <ul className="space-y-2 text-sm text-red-600">
                        {result.errors.map((error, index) => (
                          <li key={`${error}-${index}`} className="break-words">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">에러가 없습니다.</p>
                  )}
                </div>
              </div>
            )}

            {!uploadMutation.isSuccess && !uploadMutation.isError && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                아직 업로드 결과가 없습니다.
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminExcelUploadPage;