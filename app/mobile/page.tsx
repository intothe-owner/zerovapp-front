"use client";

import { useCleanUpHouseholdList } from "@/hooks/useCleanUpHousehold";
import Link from "next/link";
import {
  CleanUpHouseholdGroup,
  CleanUpHouseholdSortField,
  SortOrder,
} from "@/types/cleanUpHousehold";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

const MobileDashboardPage = () => {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");

  const [group, setGroup] = useState<CleanUpHouseholdGroup>("");
  const [sort, setSort] = useState<CleanUpHouseholdSortField>("localNo");
  const [order, setOrder] = useState<SortOrder>("asc");

  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      q,
      group,
      sort,
      order,
    }),
    [page, pageSize, q, group, sort, order]
  );

  const { data, isLoading, isError, error, isFetching } =
    useCleanUpHouseholdList(queryParams);

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
              <h2 className="text-lg font-bold">냉방기 클린UP 건강프로젝트<br/> 대상자 목록</h2>
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
            items.map((item) => (
              <Link
                key={item.id}
                href={`/mobile/views/${item.id}`}
                className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">연번 {item.no ?? "-"}</p>
                    <h3 className="mt-1 text-lg font-bold text-blue-600">
                      {item.name ?? "-"}
                    </h3>
                  </div>

                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {item.dong || "-"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-gray-500">휴대폰</span>
                    <span className="text-gray-900">{item.phone || "-"}</span>
                  </div>

                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-gray-500">
                      대리인 연락처
                    </span>
                    <span className="text-gray-900">
                      {item.proxyPhone || "-"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-gray-500">도로명주소</span>
                    <span className="break-words text-gray-900">
                      {item.roadAddress || "-"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-gray-500">상세주소</span>
                    <span className="break-words text-gray-900">
                      {item.detailAddress || "-"}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
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
    </div>
  );
};

export default MobileDashboardPage;