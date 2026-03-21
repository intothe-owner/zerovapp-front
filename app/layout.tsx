// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import LayoutShell from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: {
    default: "미라클온",
    template: "%s | 미라클온",
  },
  description: "미라클온 재능기부단체로서 당신에게 기적이 되어주겠습니다.",
  keywords: [
    "미라클온",
    "봉사단체",
    "AI수업",
    "코딩수업",
    "플로깅봉사",
    "선물"
  ],
  icons: {
    icon: "/icon.ico",
    shortcut: "/icon.ico",
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "미라클온",
    description: "사업자·법인, 세무, 자산, 상속·증여 컨설팅",
    type: "website",
    locale: "ko_KR",
  },
};

// ✅ “타이틀바(주소창/상단바) 색상” = theme-color
export const viewport: Viewport = {
  themeColor: "#7dd3fc", // 연파랑 (Tailwind sky-300 느낌)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#070b14] text-white">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
