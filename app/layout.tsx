// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import LayoutShell from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: {
    default: "제로브이",
    template: "%s | 제로브이",
  },
  description: " 재능기부단체로서 당신에게 기적이 되어주겠습니다.",
  keywords: [
    "",
    
  ],
  icons: {
    icon: "/icon.ico",
    shortcut: "/icon.ico",
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "제로브이",
    description: "",
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
