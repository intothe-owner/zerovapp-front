"use client";

import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Siderbar";
import { useCleanUpHouseholdList } from "@/hooks/useCleanUpHousehold";
import Link from "next/link";
import {
  CleanUpHouseholdGroup,
  CleanUpHouseholdSortField,
  SortOrder,
} from "@/types/cleanUpHousehold";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

const AdminDashboardTemplate = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

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

  const { data, isLoading, isError, error, isFetching } = useCleanUpHouseholdList(queryParams);

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
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">전체 건수</p>
              <p className="mt-2 text-2xl font-bold">{pagination?.total ?? 0}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">현재 페이지</p>
              <p className="mt-2 text-2xl font-bold">{pagination?.page ?? 1}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">페이지 크기</p>
              <p className="mt-2 text-2xl font-bold">{pagination?.pageSize ?? pageSize}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">상태</p>
              <p className="mt-2 text-2xl font-bold">
                {isLoading ? "로딩중" : isFetching ? "갱신중" : "정상"}
              </p>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold">냉방기 클린UP 대상자 목록</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    성명, 휴대폰, 대리인 연락처, 도로명주소로 검색할 수 있습니다.
                  </p>
                </div>
                <Link
                  href="/admin/excel-upload"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  엑셀 업로드
                </Link>
              </div>

              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                <div className="xl:col-span-4">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="성명 / 휴대폰 / 대리인 / 주소 검색"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="xl:col-span-2">
                  <select
                    value={group}
                    onChange={handleGroupChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">전체 그룹</option>
                    <option value="vulnerable">취약계층</option>
                    <option value="senior">어르신</option>
                  </select>
                </div>

                <div className="xl:col-span-2">
                  <select
                    value={sort}
                    onChange={handleSortChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="localNo">연번 정렬</option>
                    <option value="dong">동별 정렬</option>
                  </select>
                </div>

                <div className="xl:col-span-2">
                  <select
                    value={order}
                    onChange={handleOrderChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="asc">오름차순</option>
                    <option value="desc">내림차순</option>
                  </select>
                </div>

                <div className="xl:col-span-1">
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}개
                      </option>
                    ))}
                  </select>
                </div>

                <div className="xl:col-span-1">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    검색
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm overflow-hidden">
            {isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error instanceof Error ? error.message : "목록을 불러오지 못했습니다."}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                        <th className="px-4 py-3 text-left font-semibold">연번</th>
                        <th className="px-4 py-3 text-left font-semibold">동</th>
                        <th className="px-4 py-3 text-left font-semibold">성명</th>
                        <th className="px-4 py-3 text-left font-semibold">휴대폰</th>
                        <th className="px-4 py-3 text-left font-semibold">대리인 연락처</th>
                        <th className="px-4 py-3 text-left font-semibold">도로명주소</th>
                        <th className="px-4 py-3 text-left font-semibold">상세주소</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                            목록을 불러오는 중입니다.
                          </td>
                        </tr>
                      ) : items.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                            조회된 데이터가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3">{item.no}</td>
                            <td className="px-4 py-3">{item.dong}</td>
                            <td className="px-4 py-3 font-medium">
                              <Link href={`/admin/views/${item.id}`} className="text-blue-600 hover:underline">
                                {item.name}
                              </Link>
                            </td>
                            <td className="px-4 py-3">{item.phone || "-"}</td>
                            <td className="px-4 py-3">{item.proxyPhone || "-"}</td>
                            <td className="px-4 py-3 break-words">{item.roadAddress}</td>
                            <td className="px-4 py-3 break-words">{item.detailAddress || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-500">
                    총 <span className="font-semibold text-gray-900">{pagination?.total ?? 0}</span>건
                    / {pagination?.page ?? 1} 페이지
                    {pagination?.totalPages ? ` / 전체 ${pagination.totalPages} 페이지` : ""}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={!pagination || pagination.page <= 1}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                    >
                      이전
                    </button>

                    <span className="px-2 text-sm font-medium">
                      {pagination?.page ?? 1} / {pagination?.totalPages ?? 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (!pagination) return;
                        setPage((prev) => Math.min(pagination.totalPages, prev + 1));
                      }}
                      disabled={!pagination || pagination.page >= pagination.totalPages}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                    >
                      다음
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardTemplate;