/* 실제 전환 정보 — 확정 시 여기 한 곳만 바꾸면 전 페이지 CTA에 반영됩니다 (widgets.js가 주입).
   ⚠ 아래 값은 시안 확인용 더미 — 개원 확정 시 실제 값으로 교체할 것.
   ⚠ 타 업체로 연결될 수 있는 구체 더미 URL/번호는 쓰지 않는다 (3차 검수 3-1). */
window.BARO_CONFIG = {
  draftInfo: true,    // true면 화면에 "시안용 임시 정보" 고지 자동 표시 — 실정보 입력 시 false로
  showPopup: false,   // 개원일·주소·예약 링크 확정 전까지 공지 팝업 비활성 (3차 검수 6-4)

  tel: "031-000-0000",                       // 더미(000 국번 = 명백한 무효 번호, 푸터와 일치) — 실제 대표번호로 교체
  naverBooking: "https://booking.naver.com/", // 더미(네이버 예약 홈) — 실제 예약 URL로 교체
  kakaoChannel: "https://pf.kakao.com/",      // 더미(카카오 채널 홈) — 실제 채널 URL로 교체
  address: "",                                // 비움 — 실존 건물 충돌 방지(검수 지적). 확정 시 실제 주소 입력
  mapEmbedUrl: "https://maps.google.com/maps?q=%EB%B2%94%EA%B3%84%EC%97%AD&z=16&output=embed&hl=ko", // 더미(범계역) — 네이버/카카오 지도 임베드로 교체
  ga4: ""             // GA4 측정 ID(G-XXXX) 확정 시 입력 → 트래킹 자동 활성
};
