"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Siderbar";
import { useSeniorCenterList } from "@/hooks/useSeniorCenter"; // 훅 임포트
import { SeniorCenterSortField, SortOrder } from "@/types/seniorCenter";
import {
  List,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
  Upload,
  Loader2,
  LucideFileText,
  FileText
} from "lucide-react";
import axios from "axios";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];
type TabType = "LIST" | "COMPLETE";

export default function SeniorCenterListTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // URL 파라미터 기반 상태
  const activeTab = (searchParams.get("tab") as TabType) || "LIST";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 20;
  const keyword = searchParams.get("keyword") || "";
  const sortField = (searchParams.get("sortField") as SeniorCenterSortField) || "seq";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "ASC";
  // 기존 코드
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // ✅ 새롭게 추가할 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState("노인장애인복지과"); // 기본 선택값
  const [reportTarget, setReportTarget] = useState<{ id: number; name: string; category: "AIR_CONDITIONER" | "AIR_PURIFIER" } | null>(null);

  const [searchInput, setSearchInput] = useState(keyword);

  // ✅ Hooks 적용: 데이터 로딩 및 상태 관리
  const { data: listData, isLoading, isFetching } = useSeniorCenterList({
    page,
    pageSize,
    keyword,
    sortField,
    sortOrder,
    isComplete: activeTab === "COMPLETE",
  });

  const data = listData?.items || [];
  const pagination = listData?.pagination;
  const totalCount = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const updateUrlParams = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.set(key, String(value));
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ keyword: searchInput, page: 1 });
  };
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  // ✅ 기관(organization) 파라미터 추가
  const handleDownloadPdf = async (id: number, name: string, category: "AIR_CONDITIONER" | "AIR_PURIFIER", organization?: string) => {
    const categoryName = category === "AIR_CONDITIONER" ? "에어컨" : "공기청정기";
    const loadingKey = `${id}-${category}`;


    setDownloadingId(loadingKey);
    try {
      // 백엔드로 기관 정보를 전달해야 한다면 쿼리스트링 등으로 추가 (필요에 따라 수정)
      const apiUrl = `${BACKEND_URL}/api/senior-centers/${id}/reports/${category}/pdf${organization ? `?org=${encodeURIComponent(organization)}` : ''}`;

      const response = await axios.get(apiUrl, {
        responseType: 'blob',
      });

      // ... 기존 다운로드 트리거 로직 동일 ...
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${organization}_${name}_${categoryName}_작업보고서.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsModalOpen(false); // 다운로드 성공 시 모달 닫기
    } catch (error) {
      console.error("PDF 다운로드 실패:", error);
      alert("PDF를 생성하는 도중 오류가 발생했습니다.");
    } finally {
      setDownloadingId(null);
    }
  };
  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 flex">
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col min-h-screen lg:pl-72">
        <Header sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />

        <main className="p-6 space-y-6 w-full max-w-7xl mx-auto">
          {/* 상태 카드 섹션 */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500 font-bold">전체 건수</p>
              <p className="mt-2 text-2xl font-black text-indigo-600">{totalCount.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500 font-bold">현재 페이지</p>
              <p className="mt-2 text-2xl font-black">{page}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500 font-bold">페이지 크기</p>
              <p className="mt-2 text-2xl font-black">{pageSize}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500 font-bold">상태</p>
              <p className="mt-2 text-2xl font-black">
                {isLoading ? "로딩중" : isFetching ? "갱신중" : "정상"}
              </p>
            </div>
          </section>

          {/* 탭 네비게이션 */}
          <div className="flex items-center gap-2 border-b border-gray-200">
            <button
              onClick={() => updateUrlParams({ tab: "LIST", page: 1 })}
              className={`px-6 py-4 text-sm font-bold transition-all relative ${activeTab === "LIST" ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              전체 목록
              {activeTab === "LIST" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
            </button>
            <button
              onClick={() => updateUrlParams({ tab: "COMPLETE", page: 1 })}
              className={`px-6 py-4 text-sm font-bold transition-all relative ${activeTab === "COMPLETE" ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              완료 항목
              {activeTab === "COMPLETE" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
            </button>
          </div>

          {/* 검색폼 섹션 */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">경로당 에어컨 & 공기청정기 목록</h2>
              <button
                onClick={() => router.push('/admin/senior/excel-upload')}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              >
                <Upload size={16} className="text-indigo-600" />
                엑셀 명단 업로드
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[280px] space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">상세 검색</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="경로당명 / 담당자명 / 주소 / 연락처 검색"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="w-32 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">정렬 기준</label>
                <select
                  value={sortField}
                  onChange={(e) => updateUrlParams({ sortField: e.target.value, page: 1 })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="seq">번호 순</option>
                  <option value="dong">동별 정렬</option>
                </select>
              </div>

              <div className="w-32 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">정렬 방향</label>
                <select
                  value={sortOrder}
                  onChange={(e) => updateUrlParams({ sortOrder: e.target.value, page: 1 })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="ASC">오름차순</option>
                  <option value="DESC">내림차순</option>
                </select>
              </div>

              <div className="w-32 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">표시 개수</label>
                <select
                  value={pageSize}
                  onChange={(e) => updateUrlParams({ pageSize: Number(e.target.value), page: 1 })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size}개씩</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95">
                조회하기
              </button>
            </form>
          </section>

          {/* 테이블 리스트 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden font-sans">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-600 font-bold">
                  <tr>
                    <th className="px-4 py-4 w-16 text-center">번호</th>
                    <th className="px-6 py-4">경로당명</th>
                    <th className="px-6 py-4">주소</th>
                    <th className="px-6 py-4">담당자</th>
                    <th className="px-6 py-4">연락처</th>
                    <th className="px-6 py-4 text-center">보고서</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr><td colSpan={6} className="py-20 text-center text-gray-400">로딩 중...</td></tr>
                  ) : data.length === 0 ? (
                    <tr><td colSpan={6} className="py-20 text-center text-gray-400">데이터가 없습니다.</td></tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-4 py-4 text-gray-400 font-mono text-center text-xs">{item.seq}</td>

                        {/* ✅ 경로당명에 상세페이지 링크 추가 */}
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/senior/${item.id}`}
                            className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors hover:underline decoration-indigo-200 underline-offset-4"
                          >
                            {item.name}
                          </Link>
                        </td>

                        <td className="px-6 py-4 text-gray-600 truncate max-w-[200px] font-medium">{item.roadAddress}</td>
                        <td className="px-6 py-4 font-medium text-gray-700">{item.managerName || "-"}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{item.managerPhone || "-"}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            {/* ✅ 에어컨 버튼 수정: 클릭 시 모달 오픈 */}
                            <button
                              onClick={() => {
                                setReportTarget({ id: item.id, name: item.name, category: "AIR_CONDITIONER" });
                                setIsModalOpen(true);
                              }}
                              disabled={downloadingId === `${item.id}-AIR_CONDITIONER`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50"
                            >
                              {downloadingId === `${item.id}-AIR_CONDITIONER` ? <Loader2 size={12} className="animate-spin" /> : <LucideFileText size={12} />}
                              에어컨
                            </button>

                            {/* ✅ 공청기 PDF 다운로드 버튼 */}
                            <button
                              onClick={() => handleDownloadPdf(item.id, item.name, "AIR_PURIFIER",'노인장애인복지과')}
                              disabled={downloadingId === `${item.id}-AIR_PURIFIER`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50"
                            >
                              {downloadingId === `${item.id}-AIR_PURIFIER` ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
                              공청기
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 하단 페이징 */}
            <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm font-medium text-gray-500">
                전체 <span className="text-indigo-600 font-black">{totalCount.toLocaleString()}</span>건 | 페이지 <span className="text-gray-900 font-bold">{page}</span> / {totalPages || 1}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateUrlParams({ page: Math.max(1, page - 1) })}
                  disabled={page <= 1}
                  className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1.5 px-4 text-sm font-bold">
                  <span className="text-indigo-600">{page}</span>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-500">{totalPages || 1}</span>
                </div>
                <button
                  onClick={() => updateUrlParams({ page: Math.min(totalPages, page + 1) })}
                  disabled={page >= totalPages}
                  className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* ✅ 기관 선택 모달창 */}
      {isModalOpen && reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">보고서 기관 선택</h3>
              <p className="text-xs text-gray-500 mt-1">{reportTarget.name} - 에어컨 보고서</p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">제출할 기관을 선택해주세요</label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="노인장애인복지과">노인장애인복지과</option>
                <option value="해운대구청">해운대구청</option>
              </select>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPdf(reportTarget.id, reportTarget.name, reportTarget.category, selectedOrg)}
                disabled={downloadingId === `${reportTarget.id}-${reportTarget.category}`}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-all disabled:bg-gray-400"
              >
                {downloadingId === `${reportTarget.id}-${reportTarget.category}` ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                다운로드
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}