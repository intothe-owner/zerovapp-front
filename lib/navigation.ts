export const openKakaoNavi = (name: string, address: string) => {
  const encodedAddr = encodeURIComponent(address);
  
  // Intent 스킴 사용 (안드로이드 전용)
  // S.browser_fallback_url은 앱이 없을 때 이동할 주소입니다.
  const intentUrl = `intent://search?q=${encodedAddr}#Intent;scheme=kakaonavi;package=com.locnall.KimGiSa;S.browser_fallback_url=${encodeURIComponent('https://map.kakao.com/link/search/' + address)};end`;

  // 단순 이동 (타임아웃 필요 없음)
  window.location.href = intentUrl;
};