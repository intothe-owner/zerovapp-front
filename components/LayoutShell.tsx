"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "./SiteFooter";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isUnbox = pathname?.startsWith("/unbox");
  const isApply = pathname?.startsWith("/apply");
  const isAdmin = pathname?.startsWith("/admin");

  // ✅ /unbox는 상위 헤더/패딩 없이 "그대로" 렌더
  if (isUnbox) {
    return <>{children}</>;
  }

  if(isApply){
    return <>{children}</>
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  // ✅ 나머지 페이지는 기존 레이아웃 유지
  return (
    <>
      <main className="pt-16">{children}</main>
    </>
  );
}
