"use client";

import { useArchiveCleanUpHousehold, useCleanUpHouseholdList } from "@/hooks/useCleanUpHousehold";
import Link from "next/link";
import Swal from 'sweetalert2'
import {
  CleanUpHouseholdGroup,
  CleanUpHouseholdSortField,
  SortOrder,
} from "@/types/cleanUpHousehold";
import { ChangeEvent, FormEvent, useMemo, useState,Suspense, useCallback } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SwipeableItem from "./SwipeableItem";
import { useQueryClient } from "@tanstack/react-query";
import {
  List,
  Archive,
  CheckCircle,
  ChevronUp,   // 추가
  ChevronDown,  // 추가
  Trash2,
  Plus,
  Search
} from "lucide-react";
import { openKakaoNavi } from "@/lib/navigation";
import axios from "axios";
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];
type TabType = "LIST" | "ARCHIVE" | "COMPLETE"; // COMPLETE 추가
const DashboardContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabType) || "LIST";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 20;
  const sort = (searchParams.get("sort") as CleanUpHouseholdSortField) || "localNo";
  const order = (searchParams.get("order") as SortOrder) || "asc";
  const q = searchParams.get("q") || "";
 
  const group = (searchParams.get("group") as CleanUpHouseholdGroup) || "";
  const [searchInput, setSearchInput] = useState(q);


  const updateQueryParams = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );
// 2. 상태 변경 시 URL 업데이트 함수
  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string | number>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        params.set(key, String(value));
      });
      return params.toString();
    },
    [searchParams]
  );
  // 탭 변경 시 처리
  const handleTabChange = (tab: TabType) => {
    setSearchInput("");
    // pageSize만 유지하고 나머지는 제외
    router.push(`${pathname}?tab=${tab}&page=1&pageSize=${pageSize}`);
  };
  
 
  
  

  const queryClient = useQueryClient(); // 3. 인스턴스 생성 (오류 해결 포인트!)
  const archiveMutation = useArchiveCleanUpHousehold(); // 4. 보관 뮤테이션 사용
  // 보관/복구 핸들러 (탭에 따라 동작 다르게)
  const handleToggleArchive = async (id: number, name: string, isFromList: boolean) => {
    if (isFromList) {
      // 1. 청소목록 탭에서 스와이프 했을 때 (보관함으로 이동)
      await archiveMutation.mutateAsync({ id });
    } else {
      // 2. 보관함(작업동선) 탭에서 스와이프 했을 때 (즉시 목록으로 복구)
      await archiveMutation.mutateAsync({ id });
    }
  };
  // 5. 페이지 변경 시 처리
  const setPage = (newPage: number | ((prev: number) => number)) => {
    const nextP = typeof newPage === "function" ? newPage(page) : newPage;
    updateQueryParams({ page: nextP });
  };
  // 버튼 전용: 작업 완료 처리 함수
  const handleCompleteTask = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: '작업 완료 처리',
      text: `${name}님의 작업을 완료 상태로 변경하시겠습니까?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '완료 처리',
      cancelButtonText: '취소',
      confirmButtonColor: '#2563eb'
    });

    if (result.isConfirmed) {
      await archiveMutation.mutateAsync({ id, is_complete: true });
    }
  };

  const queryParams = useMemo(() => ({
    page,
    pageSize,
    sort,
    order,
    group: group || undefined, // "" 대신 undefined를 보내도록 처리 (필요에 따라 선택)
    q,
    isArchived: activeTab === "ARCHIVE",
    isComplete: activeTab === "COMPLETE",
  }), [page, pageSize, sort, order, group, q, activeTab]);


  const { data, isLoading, isError, error } = useCleanUpHouseholdList(queryParams);


 const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    updateQueryParams({ q: searchInput, page: 1 }); // 검색 시 페이지 1로 리셋
  };

  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({ pageSize: e.target.value, page: 1 });
  };

  const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({ group: e.target.value, page: 1 });
  };

 const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({ sort: e.target.value, page: 1 });
  };

  const handleOrderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({ order: e.target.value, page: 1 });
  };

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  // 순서 변경 함수 (현재는 로컬 배열에서만 변경, 실제 DB 연동은 아래 별도 설명)
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const dragId = items[index].id;
    const dropId = items[targetIndex].id;
    console.log(process.env.NEXT_PUBLIC_API_BASE_URL);

    try {
      // 순서 변경 API 호출
      await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/households/reorder`, {
        dragId,
        dropId
      });

      // 리스트 새로고침
      queryClient.invalidateQueries({ queryKey: ["clean-up-households"] });
    } catch (error) {
      alert("순서 변경에 실패했습니다.");
    }
  };

  const handleDeleteTask = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: '취소 확인',
      text: `${name}님의 작업을 취소하시겠습니까? 취소하시면 보고서 작성이 불가능합니다.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      confirmButtonColor: '#ef4444' // 빨간색
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/households/${id}`);
        Swal.fire('취소됨', '성공적으로 취소되었습니다.', 'success');
        queryClient.invalidateQueries({ queryKey: ["clean-up-households"] });
      } catch (error) {
        Swal.fire('오류', '취소 중 문제가 발생했습니다.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="relative flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-bold">
            {activeTab === "LIST" && "청소목록"}
            {activeTab === "ARCHIVE" && "오늘 작업 동선"}
            {activeTab === "COMPLETE" && "작업완료 목록"}
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-4 space-y-4">
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">전체 건수</p>
            <p className="mt-1 text-xl font-bold">{pagination?.total ?? 0}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">보고서 완료건수</p>
            <p className="mt-1 text-xl font-bold">
              {/* {isLoading ? "로딩중" : isFetching ? "갱신중" : "정상"} */}
            </p>
          </div>


        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-bold">2026년 냉방기 세척 클린UP 사업<br /> 대상자 목록</h2>
              <p className="mt-1 text-sm text-gray-500">
                성명, 휴대폰, 대리인 연락처, 도로명주소로 검색할 수 있습니다.
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-3 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={group}
              onChange={handleGroupChange}
              className="hidden w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">전체 그룹</option>
              <option value="vulnerable">취약계층</option>
              <option value="senior">어르신</option>
            </select>

            {activeTab !== "ARCHIVE" && (
              <>
                <select
                  value={sort}
                  onChange={handleSortChange}
                  className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="localNo">연번 정렬</option>
                  <option value="dong">동별 정렬</option>
                </select>
                <select
                  value={order}
                  onChange={handleOrderChange}
                  className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="asc">오름차순</option>
                  <option value="desc">내림차순</option>
                </select>
              </>
            )}

            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
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
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <button
            type="submit"
            className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            검색하기
          </button>
        </form>
          </div>
        </section>

        <section className="space-y-3">
          {isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error instanceof Error
                ? error.message
                : "목록을 불러오지 못했습니다."}
            </div>
          ) : isLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm">
              목록을 불러오는 중입니다.
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm">
              조회된 데이터가 없습니다.
            </div>
          ) : items.map((item, index) => (
            <SwipeableItem
              key={item.id}
              isArchive={activeTab === "ARCHIVE"}
              onArchive={
                activeTab === "COMPLETE" || item.isCancel
                  ? undefined
                  : () => handleToggleArchive(item.id, item.name, activeTab === "LIST")
              }
            >

              <div className={`relative block p-4 transition ${item.isCancel
                  ? 'bg-gray-50 opacity-60 grayscale pointer-events-none select-none'
                  : 'active:bg-gray-50 bg-white'
                }`}>
                <div className="flex items-start justify-between">

                  <Link href={item.isCancel ? 'javascript:;' : `/mobile/views/${item.id}`} className="flex-1 block">
                    <p className="text-[11px] font-medium text-gray-400">연번 {item.no ?? "-"}</p>
                    <h3 className="mt-0.5 text-lg font-extrabold text-blue-600 inline-block">{item.name}</h3>
                  </Link>

                  {/* 아이콘 버튼 영역 (이미지 요청 사항) */}
                  <div className="flex items-center gap-2">
                    {/* 1. 휴지통 삭제 버튼 (목록과 보관함에서 표시) */}
                    {(activeTab === "LIST" || activeTab === "ARCHIVE") && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteTask(item.id, item.name); }}
                        className="flex flex-col items-center justify-center rounded-lg border border-red-500 p-1 px-2 text-red-500 active:bg-red-50"
                      >
                        <Trash2 size={20} />
                        <span className="text-[10px] font-bold">취소</span>
                      </button>
                    )}

                    {/* 2. 완료 체크 버튼 (보관함에서만 표시) */}
                    {activeTab === "ARCHIVE" && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCompleteTask(item.id, item.name); }}
                        className="flex flex-col items-center justify-center rounded-lg border border-blue-600 p-1 px-2 text-blue-600 active:bg-blue-50"
                      >
                        <CheckCircle size={20} />
                        <span className="text-[10px] font-bold">완료</span>
                      </button>
                    )}
                  </div>
                </div>

                <Link href={item.isCancel ? 'javascript:;' : `/mobile/views/${item.id}`} className="block mt-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 space-y-1 text-[13px]">
                      <div className="flex items-center gap-3">
                        <span className="w-16 font-semibold text-gray-400">휴대폰</span>
                        <span className="font-medium text-gray-700">{item.phone || "-"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-16 font-semibold text-gray-400">도로명주소</span>
                        <span className="flex-1 truncate font-medium text-gray-700">
                          {item.roadAddress || "-"}
                        </span>
                      </div>
                    </div>

                    {/* 순서 변경 버튼 (보관함 전용) */}
                    {activeTab === "ARCHIVE" && (
                      <div className="flex flex-col gap-1 border-l border-gray-100 pl-3">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMove(index, 'up'); }}
                          disabled={index === 0}
                          className="rounded-md bg-gray-50 p-1.5 disabled:opacity-20"
                        >
                          <ChevronUp size={20} className="text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMove(index, 'down'); }}
                          disabled={index === items.length - 1}
                          className="rounded-md bg-gray-50 p-1.5 disabled:opacity-20"
                        >
                          <ChevronDown size={20} className="text-gray-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </Link>

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
            </SwipeableItem>
          ))}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm mb-20">
          <div className="space-y-3">
            <div className="text-center text-sm text-gray-500">
              총 <span className="font-semibold text-gray-900">{pagination?.total ?? 0}</span>건
              {" / "}
              {pagination?.page ?? 1} 페이지
              {pagination?.totalPages ? ` / 전체 ${pagination.totalPages} 페이지` : ""}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination || pagination.page <= 1}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                이전
              </button>

              <div className="min-w-[72px] text-center text-sm font-medium text-gray-900">
                {pagination?.page ?? 1} / {pagination?.totalPages ?? 1}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!pagination) return;
                  setPage((prev) => Math.min(pagination.totalPages, prev + 1));
                }}
                disabled={!pagination || pagination.page >= pagination.totalPages}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        </section>
      </main>
      <Link
        href="/mobile/register"
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-xl transition-transform active:scale-95"
      >
        <Plus size={28} />
      </Link>
      {/* 하단 탭 내비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 pb-safe backdrop-blur">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around">
          <button
            onClick={() => handleTabChange("LIST")}
            className={`flex flex-col items-center gap-1 ${activeTab === "LIST" ? "text-blue-600" : "text-gray-400"}`}
          >
            <List size={20} />
            <span className="text-[10px] font-bold">청소목록</span>
          </button>

          <button
            onClick={() => handleTabChange("ARCHIVE")}
            className={`flex flex-col items-center gap-1 ${activeTab === "ARCHIVE" ? "text-blue-600" : "text-gray-400"}`}
          >
            <Archive size={20} />
            <span className="text-[10px] font-bold">작업동선</span>
          </button>

          <button
            onClick={() => handleTabChange("COMPLETE")}
            className={`flex flex-col items-center gap-1 ${activeTab === "COMPLETE" ? "text-green-600" : "text-gray-400"}`}
          >
            <CheckCircle size={20} />
            <span className="text-[10px] font-bold">작업완료</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default DashboardContent;