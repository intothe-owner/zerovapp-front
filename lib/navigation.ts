export const openKakaoNavi = (name: string, address: string) => {
  const encodedAddr = encodeURIComponent(address);
  const encodedName = encodeURIComponent(name);

  // 1. 안드로이드용 Intent 스킴
  // - package: 카카오내비 패키지명
  // - S.browser_fallback_url: 앱이 없을 때 이동할 웹 주소 (카카오맵 검색 결과)
  const androidIntent = `intent://search?q=${encodedAddr}#Intent;scheme=kakaonavi;package=com.locnall.KimGiSa;S.browser_fallback_url=${encodeURIComponent('https://map.kakao.com/link/search/' + address)};end`;

  // 2. iOS 및 기타 환경용 커스텀 스킴
  const iosScheme = `kakaonavi://search?q=${encodedAddr}`;
  const webFallback = `https://map.kakao.com/link/search/${encodedAddr}`;

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("android")) {
    // 안드로이드라면 Intent 스킴 사용 (가장 확실함)
    window.location.href = androidIntent;
  } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
    // iOS 처리 (기존 방식 유지하되 타임아웃 최소화)
    const start = Date.now();
    setTimeout(() => {
      if (Date.now() - start < 1500) {
        window.location.href = webFallback;
      }
    }, 1000);
    window.location.href = iosScheme;
  } else {
    // PC 등 기타 환경
    window.open(webFallback, '_blank');
  }
};