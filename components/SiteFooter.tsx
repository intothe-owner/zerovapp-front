"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type SiteFooterProps = {
  companyName?: string;
  infoLine?: string;
  copyrightName?: string;
};

export default function SiteFooter({
  companyName = "UNBOX",
  infoLine = "사업자등록번호 216-57-00778 | 대표 신동훈 | 부산광역시 부산진구 전포대로 275번길 65(전포동) | 010-4181-5082",
  copyrightName,
}: SiteFooterProps) {
  const year = new Date().getFullYear();
  const owner = copyrightName ?? companyName;

  const router = useRouter();
  const { status } = useSession();
  const authed = status === "authenticated";

  const onLogout = async () => {
    await signOut({ redirect: false });
    router.refresh();
    router.push("/");
  };

  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3 text-sm text-gray-600">
            <div className="font-semibold text-gray-900">{companyName}</div>
            <div className="leading-relaxed">{infoLine}</div>
            <div className="pt-3 text-xs text-gray-500">
              © {year}. {owner}. All rights reserved.
            </div>
          </div>

          <div className="pt-1">
            {authed ? (
              <button
                type="button"
                aria-label="로그아웃"
                onClick={onLogout}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
                title="로그아웃"
              >
                <UnlockIcon />
              </button>
            ) : (
              <Link
                href="/login"
                aria-label="관리자 로그인"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
                title="로그인"
              >
                <LockIcon />
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17 10V8a5 5 0 0 0-9.58-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}