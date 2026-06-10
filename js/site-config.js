/* 실제 전환 정보 — 확정 시 여기 한 곳만 채우면 전 페이지 CTA에 반영됩니다 (widgets.js가 주입).
   비워두면 기존 placeholder 동작이 유지됩니다. */
window.BARO_CONFIG = {
  tel: "",            // 예: "031-123-4567"
  naverBooking: "",   // 예: "https://booking.naver.com/booking/13/bizes/XXXXXX"
  kakaoChannel: "",   // 예: "https://pf.kakao.com/_xxxxxx"
  address: "",        // 예: "경기 안양시 동안구 ○○로 00, 0층"
  mapEmbedUrl: "",    // 네이버/카카오 지도 임베드 URL — 입력 시 맵 카드가 실제 지도로 교체
  ga4: ""             // 예: "G-XXXXXXXXXX" — 입력 시 gtag 로드 + CTA 클릭 이벤트 전송
};
