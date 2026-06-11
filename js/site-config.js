/* 실제 전환 정보 — 확정 시 여기 한 곳만 바꾸면 전 페이지 CTA에 반영됩니다 (widgets.js가 주입).
   ⚠ 아래 값이 비어 있으면 페이지의 정적 placeholder(#contact 앵커, 안내 카드)가 그대로 유지됩니다 — 안전한 기본값.
   ⚠ 이 파일이 다루지 않는 "수동 교체" 항목 (런치 시 scripts/check.py가 검사):
      ① 각 페이지 <head>의 JSON-LD telephone/address  ② og:image 도메인  ③ 푸터 외 본문에 박힌 주소 문구
      ④ <meta name="robots"> noindex 6페이지  ⑤ robots.txt */
window.BARO_CONFIG = {
  draftInfo: true,    // true면 화면에 "시안용 임시 정보" 고지 자동 표시 — 실정보 입력 시 false로
  showPopup: false,   // true로 바꿔야만 공지 팝업 표시 (기본 꺼짐 — config 로드 실패 시에도 안 뜸)

  tel: "031-000-0000",  // 더미(000 국번 = 무효) — 실제 대표번호로 교체. 따옴표 필수
  naverBooking: "",     // 실제 네이버 예약 URL 입력 전까지 비움 → CTA는 #contact 앵커 유지
  kakaoChannel: "",     // 실제 카카오 채널 URL 입력 전까지 비움
  address: "",          // 실제 주소 확정 시 입력 → 오시는 길에 자동 반영
  mapEmbedUrl: "",      // 네이버/카카오 지도 임베드 URL 입력 시 맵 카드가 실제 지도로 교체
  ga4: ""               // GA4 측정 ID(G-XXXX) 입력 시 CTA 클릭/스크롤 트래킹 자동 활성
};
