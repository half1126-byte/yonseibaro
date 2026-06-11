/* autovideo — 앰비언트 영상 동시 재생 캡 (이도 파이프라인 이식)
   [data-autovideo]: 뷰포트에서 가장 잘 보이는 N개만 재생(모바일 2/데스크톱 4),
   나머지는 일시정지 → 모바일 AV1 동시 디코딩 렉 방지.
   poster + preload="none" → 화면 밖은 로드·디코드 안 함.
   prefers-reduced-motion / 데이터절약 / 2G → 재생 안 함(poster 유지). 바닐라 / 의존성 0. */
(function () {
  "use strict";

  /* 인앱 브라우저(카톡 등)는 poster·자동재생을 렌더 안 해 빈 박스만 보임.
     → 영상 요소 자체 배경에 poster를 깔아, 영상이 안 떠도 '사진'은 항상 보이게. */
  Array.prototype.forEach.call(document.querySelectorAll("video[poster]"), function (v) {
    var p = v.getAttribute("poster");
    if (!p) return;
    v.style.backgroundImage = 'url("' + p + '")';
    v.style.backgroundSize = "cover";
    v.style.backgroundPosition = "center";
    v.style.backgroundRepeat = "no-repeat";
  });

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn = navigator.connection || {};
  var saveData = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || "");

  var vids = Array.prototype.slice.call(
    document.querySelectorAll("video[data-autovideo]")
  );
  if (!vids.length || reduce || saveData) return; // reduce/데이터절약: poster 유지

  function play(v) {
    if (v.dataset.playing === "1") return;
    if (v.preload === "none") v.preload = "auto"; // 첫 재생 시 로드
    v.dataset.playing = "1";
    var p = v.play();
    if (p && p.catch) p.catch(function () {}); /* autoplay 거부 무시(poster 유지) */
  }
  function pause(v) {
    if (v.dataset.playing !== "1") return;
    v.dataset.playing = "0";
    try { v.pause(); } catch (e) {}
  }

  if (!("IntersectionObserver" in window)) {
    vids.forEach(play);
    return;
  }

  /* 동시 재생 제한 */
  var MOBILE = (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) ||
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  var MAX = MOBILE ? 2 : 4;

  var ratios = new Map();
  var raf = 0;
  function reconcile() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      var arr = [];
      ratios.forEach(function (r, v) { arr.push([v, r]); });
      arr.sort(function (a, b) { return b[1] - a[1]; });
      for (var i = 0; i < arr.length; i++) {
        if (i < MAX) play(arr[i][0]); else pause(arr[i][0]);
      }
    });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting && en.intersectionRatio > 0) {
        ratios.set(en.target, en.intersectionRatio);
      } else {
        ratios.delete(en.target);
        pause(en.target);
      }
    });
    reconcile();
  }, { rootMargin: "0px 0px -10% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });

  vids.forEach(function (v) { io.observe(v); });
})();
