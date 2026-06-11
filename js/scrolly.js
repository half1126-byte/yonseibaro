/* scrolly — 핀드 스크롤 서사 (이도 scrollyframes 어댑트: 영상 없이 텍스트 크로스페이드)
   마크업 기본값은 .is-static(정적 그리드) — 조건 통과 시에만 핀 모드로 격상 (프로그레시브 인핸스먼트).
   reduced-motion / sticky 미지원이면 손대지 않음. 바닐라 ES5, 의존성 0. */
(function () {
  "use strict";
  var sec = document.querySelector(".section--pin");
  var pin = sec && sec.querySelector("[data-pinscroll]");
  if (!sec || !pin) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stickyOK = window.CSS && CSS.supports && CSS.supports("position", "sticky");
  var mobile = window.matchMedia && window.matchMedia("(max-width: 699px)").matches;
  if (reduce || !stickyOK || mobile) return; // is-static 유지 — 모바일은 본론 도달 지연 방지(전환형 재배치)

  var steps = Array.prototype.slice.call(pin.querySelectorAll("[data-pin-step]"));
  if (steps.length < 2) return;
  var ghost = pin.querySelector("[data-pin-ghost]");
  var bar = pin.querySelector("[data-pin-bar]");
  var active = 0;

  sec.classList.remove("is-static");

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function setActive(idx) {
    if (idx === active) return;
    active = idx;
    for (var i = 0; i < steps.length; i++) steps[i].classList.toggle("is-active", i === idx);
    if (ghost) ghost.textContent = pad(idx + 1);
  }

  var ticking = false;
  function frame() {
    ticking = false;
    var rect = pin.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    if (total <= 0) return;
    var p = Math.min(1, Math.max(0, -rect.top / total));
    var idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
    setActive(idx);
    if (bar) bar.style.width = (p * 100).toFixed(1) + "%";
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
  }, { passive: true });
  window.addEventListener("resize", frame);
  frame();
})();
