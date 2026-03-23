// utils/navigation.ts (또는 page.tsx 내부에 작성)

export const openKakaoNavi = (name: string, address: string) => {
  // 카카오내비 길안내 URL 스킴
  // destination 파라미터에 '장소명,위도,경도'를 넣는 것이 정확하지만, 
  // 위경도가 없다면 주소만으로도 검색 결과 페이지를 띄울 수 있습니다.
  
  const encodedName = encodeURIComponent(name);
  const encodedAddr = encodeURIComponent(address);
  
  // 목적지 명칭과 주소를 포함한 카카오내비 검색 및 길안내 연동
  const naviUrl = `kakaonavi://search?q=${encodedAddr}`;
  const webUrl = `https://map.kakao.com/link/search/${encodedAddr}`;

  // 모바일 브라우저에서 실행 시도
  const checkApp = setTimeout(() => {
    // 앱이 설치되어 있지 않으면 카카오맵 웹페이지로 이동
    window.location.href = webUrl;
  }, 1000);

  window.location.href = naviUrl;
};