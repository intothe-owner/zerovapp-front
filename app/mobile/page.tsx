"use client";

import { useArchiveCleanUpHousehold, useCleanUpHouseholdList } from "@/hooks/useCleanUpHousehold";
import Link from "next/link";
import {
  CleanUpHouseholdGroup,
  CleanUpHouseholdSortField,
  SortOrder,
} from "@/types/cleanUpHousehold";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import SwipeableItem from "./SwipeableItem";
import { useQueryClient } from "@tanstack/react-query";
import {
  List,
  Archive,
  RotateCcw,
  ChevronUp,   // 추가
  ChevronDown  // 추가
} from "lucide-react";
import { openKakaoNavi } from "@/lib/navigation";
import axios from "axios";
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];
type TabType = "LIST" | "ARCHIVE";
const MobileDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("LIST"); // 탭 상태 추가
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");

  const [group, setGroup] = useState<CleanUpHouseholdGroup>("");
  const [sort, setSort] = useState<CleanUpHouseholdSortField>("localNo");
  const [order, setOrder] = useState<SortOrder>("asc");

  const queryClient = useQueryClient(); // 3. 인스턴스 생성 (오류 해결 포인트!)
  const archiveMutation = useArchiveCleanUpHousehold(); // 4. 보관 뮤테이션 사용
  // 보관/복구 핸들러 (탭에 따라 동작 다르게)
  const handleToggleArchive = async (id: number, name: string, isArchiving: boolean) => {
    await archiveMutation.mutateAsync(id);

  };


  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      q,
      group,
      sort,
      order,
      // 탭에 따라 백엔드에 보관 여부 전달
      isArchived: activeTab === "ARCHIVE",
    }),
    [page, pageSize, q, group, sort, order, activeTab]
  );
  

  const { data, isLoading, isError, error } = useCleanUpHouseholdList(queryParams);


  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  };

  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPage(1);
    setPageSize(Number(e.target.value));
  };

  const handleGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPage(1);
    setGroup(e.target.value as CleanUpHouseholdGroup);
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPage(1);
    setSort(e.target.value as CleanUpHouseholdSortField);
  };

  const handleOrderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPage(1);
    setOrder(e.target.value as SortOrder);
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
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="relative flex h-14 items-center justify-between px-4">


          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-gray-900">
            대상자 목록
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
              <h2 className="text-lg font-bold">냉방기 클린UP 건강프로젝트<br /> 대상자 목록</h2>
              <p className="mt-1 text-sm text-gray-500">
                성명, 휴대폰, 대리인 연락처, 도로명주소로 검색할 수 있습니다.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-3">


              <div className="grid grid-cols-2 gap-2">
                <select
                  value={group}
                  onChange={handleGroupChange}
                  className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">전체 그룹</option>
                  <option value="vulnerable">취약계층</option>
                  <option value="senior">어르신</option>
                </select>
                {activeTab !== "ARCHIVE"?
                <select
                  value={sort}
                  onChange={handleSortChange}
                  className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="localNo">연번 정렬</option>
                  <option value="dong">동별 정렬</option>
                </select>:null}
                {activeTab !== "ARCHIVE"?
                <select
                  value={order}
                  onChange={handleOrderChange}
                  className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="asc">오름차순</option>
                  <option value="desc">내림차순</option>
                </select>:null}

                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}개
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="성명 / 휴대폰 / 대리인 / 주소 검색"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                검색
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
          ) : (
            items.map((item, index) => (
              <SwipeableItem
                key={item.id}
                isArchive={activeTab === "ARCHIVE"}
                onArchive={() => handleToggleArchive(item.id, item.name, activeTab === "LIST")}
              >
                <div className="relative block p-4 transition active:bg-gray-50">
                  <Link href={`/mobile/views/${item.id}`} className="block">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium text-gray-400">연번 {item.no ?? "-"}</p>
                        <h3 className="mt-0.5 text-lg font-extrabold text-blue-600">{item.name}</h3>
                      </div>
                      {activeTab === "ARCHIVE" && <Archive size={14} className="text-gray-400" />}
                    </div>

                    {/* 정보 영역과 버튼 영역을 flex로 분리 */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      {/* 왼쪽: 주소 및 연락처 정보 */}
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

                      {/* 오른쪽: 순서 조정 버튼 (보관함에서만 표시) */}
                      {activeTab === "ARCHIVE" && (
                        <div className="flex flex-col gap-1 border-l border-gray-100 pl-3">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleMove(index, 'up');
                            }}
                            disabled={index === 0}
                            className="rounded-md bg-gray-50 p-1.5 active:bg-gray-200 disabled:opacity-20"
                          >
                            <ChevronUp size={20} className="text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleMove(index, 'down');
                            }}
                            disabled={index === items.length - 1}
                            className="rounded-md bg-gray-50 p-1.5 active:bg-gray-200 disabled:opacity-20"
                          >
                            <ChevronDown size={20} className="text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* 카카오내비 버튼 (보관함 전용) */}
                  {activeTab === "ARCHIVE" && (
                    <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openKakaoNavi(item.roadAddress,item.longitude??"",item.latitude??"");
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
            ))
          )}
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 pb-safe backdrop-blur">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around">
          <button
            onClick={() => { setActiveTab("LIST"); setPage(1); }}
            className={`flex flex-col items-center gap-1 transition ${activeTab === "LIST" ? "text-blue-600" : "text-gray-400"
              }`}
          >
            <List size={20} />
            <span className="text-[10px] font-bold">청소목록</span>
          </button>

          <button
            onClick={() => { setActiveTab("ARCHIVE"); setPage(1); }}
            className={`flex flex-col items-center gap-1 transition ${activeTab === "ARCHIVE" ? "text-blue-600" : "text-gray-400"
              }`}
          >
            <Archive size={20} />
            <span className="text-[10px] font-bold">오늘 작업 동선</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileDashboardPage;