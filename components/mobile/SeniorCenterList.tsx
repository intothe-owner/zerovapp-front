"use client";

import { useSeniorCenterList, useUpdateSeniorCenter } from "@/hooks/useSeniorCenter";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useCallback } from "react";
import SeniorCenterSwipeableItem from "./SeniorCenterSwipeableItem"; 
import { useQueryClient } from "@tanstack/react-query";
import Swal from 'sweetalert2';
import {
  List,
  Archive,
  CheckCircle,
  Search,
  MapPin,
  Loader2,
  Plus,
  Wind,
  Trash2, 
  Home
} from "lucide-react";
import { SeniorCenterSortField, SortOrder } from "@/types/seniorCenter";
import { openKakaoNavi } from "@/lib/navigation";

type TabType = "LIST" | "ARCHIVE" | "COMPLETE";
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

const SeniorCenterList = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  const activeTab = (searchParams.get("tab") as TabType) || "LIST";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 20;
  const keyword = searchParams.get("keyword") || "";
  const sortField = (searchParams.get("sortField") as SeniorCenterSortField) || "seq";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "ASC";
  
  const [searchInput, setSearchInput] = useState(keyword);

  const filterParams = {
    isComplete: activeTab === "COMPLETE" ? true : false,
    isArchive: activeTab === "ARCHIVE" ? true : (activeTab === "LIST" ? false : undefined)
  };

  const { data: listData, isLoading } = useSeniorCenterList({
    page,
    pageSize,
    keyword,
    sortField,
    sortOrder,
    ...filterParams
  });

  const updateMutation = useUpdateSeniorCenter();
  const items = listData?.items || [];
  const pagination = listData?.pagination;

  const updateUrlParams = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.set(key, String(value));
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    updateUrlParams({ keyword: searchInput, page: 1 });
  };

  const handleArchive = useCallback(async (id: number, currentArchiveStatus: boolean) => {
    try {
      await updateMutation.mutateAsync({ id, isArchive: !currentArchiveStatus });
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: 'success',
        title: !currentArchiveStatus ? '작업 동선에 추가됨' : '목록으로 복구됨'
      });
      queryClient.invalidateQueries({ queryKey: ["senior-centers"] });
    } catch (error) {
      alert("상태 변경 실패");
    }
  }, [updateMutation, queryClient]);

  const handleComplete = useCallback(async (id: number) => {
    try {
      const result = await Swal.fire({
        title: '작업 완료 처리하시겠습니까?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#d33',
        confirmButtonText: '완료',
        cancelButtonText: '취소'
      });

      if (result.isConfirmed) {
        await updateMutation.mutateAsync({ id, isComplete: true });
        Swal.fire('완료!', '작업이 완료 처리되었습니다.', 'success');
        queryClient.invalidateQueries({ queryKey: ["senior-centers"] });
      }
    } catch (error) {
      alert("완료 처리 실패");
    }
  }, [updateMutation, queryClient]);

  const handleCancel = useCallback(async (id: number) => {
    try {
      const result = await Swal.fire({
        title: '작업을 취소하시겠습니까?',
        text: '취소된 항목은 회색으로 비활성화되며 수정할 수 없습니다.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '네, 취소합니다',
        cancelButtonText: '아니오'
      });

      if (result.isConfirmed) {
        await updateMutation.mutateAsync({ id, isCancel: true, isArchive: false } as any);
        Swal.fire('취소 완료', '해당 항목이 취소 처리되었습니다.', 'success');
        queryClient.invalidateQueries({ queryKey: ["senior-centers"] });
      }
    } catch (error) {
      alert("취소 처리 실패");
    }
  }, [updateMutation, queryClient]);

  const handleTabChange = (tab: TabType) => {
    updateUrlParams({ tab, page: 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur px-5 h-14 flex items-center">
        <h1 className="text-lg font-black tracking-tight text-gray-900">
          {activeTab === "LIST" && "청소목록"}
          {activeTab === "ARCHIVE" && "오늘 작업 동선"}
          {activeTab === "COMPLETE" && "작업완료 목록"}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-4 space-y-4">
        {/* 통계 섹션 */}
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400">전체 건수</p>
            <p className="mt-0.5 text-xl font-black text-gray-900">{pagination?.total ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400">조회 건수</p>
            <p className="mt-0.5 text-xl font-black text-gray-900">{items.length}</p>
          </div>
        </section>

        {/* 검색 섹션 */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                2026년 경로당 사업<br /> 대상자 목록
              </h2>
              <p className="mt-1 text-sm text-gray-500 font-medium">
                성명, 휴대폰, 대리인 연락처, 도로명주소로 검색할 수 있습니다.
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-3 max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-2">
                <select className="hidden w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500 font-bold">
                  <option value="">전체 그룹</option>
                  <option value="vulnerable">취약계층</option>
                  <option value="senior">어르신</option>
                </select>

                {activeTab !== "ARCHIVE" && (
                  <>
                    <select
                      value={sortField}
                      onChange={(e) => updateUrlParams({ sortField: e.target.value, page: 1 })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500 font-bold"
                    >
                      <option value="seq">연번 정렬</option>
                      <option value="dong">동별 정렬</option>
                      <option value="name">이름 정렬</option>
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => updateUrlParams({ sortOrder: e.target.value, page: 1 })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500 font-bold"
                    >
                      <option value="ASC">오름차순</option>
                      <option value="DESC">내림차순</option>
                    </select>
                  </>
                )}

                <select
                  value={pageSize}
                  onChange={(e) => updateUrlParams({ pageSize: Number(e.target.value), page: 1 })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500 font-bold col-span-2"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}개씩 보기
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="성명 / 휴대폰 / 대리인 / 주소 검색"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 font-bold"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-95"
              >
                검색하기
              </button>
            </form>
          </div>
        </section>

        {/* 리스트 본문 */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
          ) : (
            items.map((item) => {
              // ✅ 수정 완료: isCanceled가 아닌 isCancel을 확인하도록 변경
              const isItemCanceled = (item as any).isCancel;

              return (
                <div 
                  key={item.id} 
                  // ✅ isCancel이 true일 경우 포인터 이벤트를 완전히 차단(pointer-events-none)하고 회색조 및 반투명(opacity-40 grayscale) 처리
                  className={isItemCanceled ? "pointer-events-none opacity-40 grayscale select-none transition-all" : ""}
                >
                  <SeniorCenterSwipeableItem
                    isArchive={activeTab === "ARCHIVE"}
                    onArchive={() => handleArchive(item.id, activeTab === "ARCHIVE")}
                  >
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        {/* 왼쪽: 기기 원형 아이콘 및 정보 */}
                        {/* ✅ Link 컴포넌트에서도 취소된 경우 클릭 이벤트 무시 처리 보강 */}
                        <Link 
                          href={isItemCanceled ? "#" : `/mobile/senior/view/${item.id}`} 
                          onClick={(e) => { if (isItemCanceled) e.preventDefault(); }}
                          className="flex items-center gap-4 flex-1 min-w-0 active:opacity-60 transition-opacity"
                        >
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">{item.dong}</span>
                              <span className="text-[10px] font-mono text-gray-300 font-bold uppercase tracking-widest">NO.{item.seq}</span>
                            </div>
                            <h3 className="text-[15px] font-black text-gray-900 truncate">{item.name}</h3>
                            <div className="flex items-center gap-1 text-gray-400">
                              <MapPin size={10} strokeWidth={3} className="shrink-0" />
                              <span className="text-[11px] font-bold truncate">{item.roadAddress}</span>
                            </div>
                          </div>
                        </Link>

                        {/* 오른쪽: 정사각형 아이콘 버튼 */}
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          {activeTab === "LIST" && (
                            <button
                              onClick={(e) => { e.preventDefault(); handleCancel(item.id); }}
                              className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 text-gray-600 active:scale-95 transition-all hover:bg-gray-200"
                            >
                              <Trash2 size={18} strokeWidth={2.5} className="mb-0.5" />
                              <span className="text-[11px] font-black">취소</span>
                            </button>
                          )}
                          {activeTab === "ARCHIVE" && (
                            <>
                              <button
                                onClick={(e) => { e.preventDefault(); handleCancel(item.id); }}
                                className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 text-gray-600 active:scale-95 transition-all hover:bg-gray-200"
                              >
                                <Trash2 size={18} strokeWidth={2.5} className="mb-0.5" />
                                <span className="text-[11px] font-black">취소</span>
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); handleComplete(item.id); }}
                                className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white active:scale-95 transition-all shadow-sm hover:bg-blue-700"
                              >
                                <CheckCircle size={18} strokeWidth={2.5} className="mb-0.5" />
                                <span className="text-[11px] font-black">완료</span>
                              </button>
                            </>
                          )}
                        </div>
                      
                      </div>
                        {/* 카카오내비 버튼 (보관함 전용) */}
                                        {activeTab === "ARCHIVE" && (
                                          <div className="mt-4 border-t border-gray-100 pt-3">
                                            <button
                                              onClick={(e) => {
                                                e.preventDefault();
                                                openKakaoNavi(item.roadAddress, item.longitude ?? "", item.latitude ?? "");
                                              }}
                                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-3 text-sm font-bold text-[#191919] active:opacity-80"
                                            >
                                              <img src="/icons/kakaonavi.png" alt="" className="w-5 h-5" />
                                              카카오내비 길안내 시작
                                            </button>
                                          </div>
                                        )}
                    </div>
                    
                  </SeniorCenterSwipeableItem>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* 하단 탭 내비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 pb-safe backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around">
          <button
            onClick={() => router.push('/')}
            className={`flex flex-col items-center gap-1 `}
          >
            <Home size={22} />
            <span className="text-[10px] font-bold">홈</span>
          </button>
          <button onClick={() => handleTabChange("LIST")} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "LIST" ? "text-blue-600" : "text-gray-400"}`}>
            <List size={22} strokeWidth={activeTab === "LIST" ? 2.5 : 2} />
            <span className="text-[10px] font-black">청소목록</span>
          </button>
          <button onClick={() => handleTabChange("ARCHIVE")} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "ARCHIVE" ? "text-blue-600" : "text-gray-400"}`}>
            <Archive size={22} strokeWidth={activeTab === "ARCHIVE" ? 2.5 : 2} />
            <span className="text-[10px] font-black">작업동선</span>
          </button>
          <button onClick={() => handleTabChange("COMPLETE")} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "COMPLETE" ? "text-blue-600" : "text-gray-400"}`}>
            <CheckCircle size={22} strokeWidth={activeTab === "COMPLETE" ? 2.5 : 2} />
            <span className="text-[10px] font-black">완료항목</span>
          </button>
        </div>
      </nav>

      {/* 플로팅 버튼 */}
      <Link href="/mobile/senior/register" className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-xl">
        <Plus size={28} />
      </Link>
    </div>
  );
};

export default SeniorCenterList;