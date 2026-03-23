declare global {
  interface Window {
    Android?: {
      openKakaoNavi?: (name: string, address: string) => void;
    };
  }
}

export const openKakaoNavi = (name: string, address: string) => {
  if (typeof window === "undefined") return;

  const encodedAddr = encodeURIComponent(address);
  const encodedName = encodeURIComponent(name);

  const webFallback = `https://map.kakao.com/link/search/${encodedAddr}`;

  // 안드로이드용 intent 스킴
  const androidIntent =
    `intent://search?q=${encodedAddr}` +
    `#Intent;scheme=kakaonavi;package=com.locnall.KimGiSa;` +
    `S.browser_fallback_url=${encodeURIComponent(webFallback)};end`;

  // iOS용 커스텀 스킴
  const iosScheme = `kakaonavi://search?q=${encodedAddr}`;

  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(ua);
  const isIOS = /iphone|ipad|ipod/.test(ua);

  try {
    // 1) 안드로이드 앱 WebView 안이라면 네이티브 브리지 우선
    if (isAndroid && window.Android?.openKakaoNavi) {
      window.Android.openKakaoNavi(name, address);
      return;
    }

    // 2) 일반 안드로이드 브라우저 또는 브리지 없는 경우
    if (isAndroid) {
      const clickedAt = Date.now();

      setTimeout(() => {
        // 앱 전환이 안 일어났다면 fallback
        if (Date.now() - clickedAt < 1800) {
          window.location.href = webFallback;
        }
      }, 1200);

      window.location.href = androidIntent;
      return;
    }

    // 3) iPhone / iPad
    if (isIOS) {
      const clickedAt = Date.now();

      setTimeout(() => {
        if (Date.now() - clickedAt < 1800) {
          window.location.href = webFallback;
        }
      }, 1200);

      window.location.href = iosScheme;
      return;
    }

    // 4) PC 및 기타 환경
    window.open(webFallback, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("카카오내비 실행 실패:", error);
    window.open(webFallback, "_blank", "noopener,noreferrer");
  }
};