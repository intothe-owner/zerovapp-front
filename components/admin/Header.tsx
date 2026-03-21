'use client';

import { useState } from "react";
import IconDot from "../ui/IconDot";
import IconSearch from "../ui/IconSearch";
import AdminAuthActions from "./AdminAuthActions";

type HeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

/* --------------------------- Subcomponents --------------------------- */
const Header = ({ sidebarOpen, onToggleSidebar }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            className="inline-flex lg:hidden items-center justify-center rounded-xl border border-gray-200 h-10 w-10"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <IconMenu />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <div className="text-sm text-gray-500">관리자</div>
            <div className="text-sm font-medium">대시보드</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              placeholder="검색 ( / )"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IconSearch />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <TopIconButton ariaLabel="알림">
            <IconBell />
          </TopIconButton>
          {/* <AdminAuthActions /> */}
        </div>
      </div>
    </header>
  );
};



/* ------------------------------ Icons ------------------------------ */
function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TopIconButton({ children, ariaLabel }: { children: React.ReactNode; ariaLabel: string }) {
  return (
    <button
      aria-label={ariaLabel}
      className="inline-flex items-center justify-center rounded-xl border border-gray-200 h-10 w-10 hover:bg-gray-50"
    >
      {children}
    </button>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M15 17H9a6 6 0 0 1-6-6V9a7 7 0 1 1 14 0v2a6 6 0 0 0 6 6h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}

export default Header;
