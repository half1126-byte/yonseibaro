/* 섹션 커버 리빌 — section[data-cover]에 퍼플 커튼을 넣고, 뷰 진입 시 위로 걷어냄.
   데스크톱(스냅과 동일 조건) 전용. threshold:0 + rootMargin으로 긴 섹션도 반드시 트리거.
   reduce-motion / no-IO / 모바일 → 커버 없음(콘텐츠 그대로). no-JS → 커버 미생성(콘텐츠 보임). */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = window.matchMedia && window.matchMedia("(min-width:1000px) and (pointer:fine)").matches;
  if (reduce || !desktop || !("IntersectionObserver" in window)) return;
  var secs = Array.prototype.slice.call(document.querySelectorAll("section[data-cover]"));
  if (!secs.length) return;
  secs.forEach(function (s) {
    var c = document.createElement("i"); c.className = "sec-cover"; c.setAttribute("aria-hidden", "true");
    s.insertBefore(c, s.firstChild);
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        var c = en.target.querySelector(".sec-cover");
        if (c) c.classList.add("lift");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0, rootMargin: "0px 0px -28% 0px" });
  secs.forEach(function (s) { io.observe(s); });
})();
