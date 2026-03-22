"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type MobileTopBarProps = {
  title: string;
  rightSlot?: React.ReactNode;
  fallbackHref?: string;
};

export default function MobileTopBar({
  title,
  rightSlot,
  fallbackHref,
}: MobileTopBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    if (fallbackHref) {
      router.push(fallbackHref);
      return;
    }

    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="h-6 w-6 text-gray-800" />
        </button>

        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-gray-900">
          {title}
        </h1>

        <div className="flex min-w-[40px] justify-end">{rightSlot}</div>
      </div>
    </header>
  );
}