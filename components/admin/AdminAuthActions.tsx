"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function AdminAuthActions() {
  const { data: session, status } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  const user = (session as any)?.user;
  const displayName = user?.name || user?.adminId || "관리자";
  const role = user?.role === "admin" ? "관리자" : "사용자";

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  if (status === "loading") {
    return (
      <div className="hidden sm:flex items-center rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
        세션 확인 중...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
          {String(displayName).slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900">{displayName}</div>
          <div className="text-xs text-gray-500">{role}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loggingOut ? "로그아웃 중..." : "로그아웃"}
      </button>
    </div>
  );
}