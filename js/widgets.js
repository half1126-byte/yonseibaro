/* widgets — 카운트업 · 도트네비 · 서브네비 스파이 · 캐러셀 도트 · BA 슬라이더 · 라이트박스 · 로더 · 히어로 패럴랙스
   전부 존재 가드 — 페이지에 해당 요소 없으면 무동작. 바닐라 / 의존성 0. */
(function () {
  "use strict";
  var doc = document;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }

  /* ---- 브랜드 로더 (html.loading은 헤드 인라인 스크립트가 부여) ---- */
  (function loader() {
    var html = doc.documentElement;
    if (!html.classList.contains("loading")) return;
    var finish = function () {
      html.classList.remove("loading");
      try { window.sessionStorage.setItem("baroLoaded", "1"); } catch (e) {}
    };
    if (doc.readyState === "complete") window.setTimeout(finish, 600);
    else window.addEventListener("load", function () { window.setTimeout(finish, 600); });
    window.setTimeout(finish, 3200); // 페일세이프
  })();

  /* ---- 카운트업 [data-count] ---- */
  (function countUp() {
    var els = $$("[data-count]");
    if (!els.length) return;
    function setFinal(el) { el.textContent = el.getAttribute("data-count"); }
    if (reduce || !hasIO) { els.forEach(setFinal); return; }
    function animate(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target)) { setFinal(el); return; }
      var dur = 1400, start = null;
      var pad = (el.getAttribute("data-count").charAt(0) === "0") ? el.getAttribute("data-count").length : 0;
      function frame(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        var v = String(Math.round(target * eased));
        while (pad && v.length < pad) v = "0" + v;
        el.textContent = v;
        if (p < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animate(en.target); obs.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---- 도트 네비 — [data-dot] 섹션 인디케이터 (데스크톱, CSS가 노출 제어) ---- */
  (function dotNav() {
    var secs = $$("[data-dot]");
    if (secs.length < 3 || !hasIO) return;
    var nav = doc.createElement("nav");
    nav.className = "dot-nav";
    nav.setAttribute("aria-label", "섹션 바로가기");
    var map = {};
    secs.forEach(function (s) {
      if (!s.id) return;
      var a = doc.createElement("a");
      a.href = "#" + s.id;
      var label = doc.createElement("span");
      label.textContent = s.getAttribute("data-dot");
      a.appendChild(label);
      nav.appendChild(a);
      map[s.id] = a;
    });
    doc.body.appendChild(nav);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          Object.keys(map).forEach(function (id) { map[id].classList.remove("is-active"); map[id].removeAttribute("aria-current"); });
          map[en.target.id].classList.add("is-active");
          map[en.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-42% 0px -52% 0px", threshold: 0 });
    secs.forEach(function (s) { if (s.id) io.observe(s); });
  })();

  /* ---- 서브 네비 스파이 (.sub-nav a[href^="#"]) ---- */
  (function subNav() {
    var nav = doc.querySelector(".sub-nav");
    if (!nav || !hasIO) return;
    var links = $$('a[href^="#"]', nav);
    var targets = links.map(function (a) { return doc.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
    if (!targets.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + en.target.id;
          a.classList.toggle("is-active", on);
          if (on) { a.setAttribute("aria-current", "true"); a.scrollIntoView({ block: "nearest", inline: "nearest" }); }
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-38% 0px -55% 0px", threshold: 0 });
    targets.forEach(function (t) { io.observe(t); });
  })();

  /* ---- 캐러셀 도트 (.snap-row[data-carousel] + 인접 [data-dots])
     필터 탭이 카드 hidden을 바꾸면 도트도 재구성 (MutationObserver) ---- */
  (function carousels() {
    $$(".snap-row[data-carousel]").forEach(function (row) {
      var dotsWrap = row.parentElement.querySelector("[data-dots]");
      if (!dotsWrap) return;
      var dots = [];

      function visibleItems() {
        return Array.prototype.slice.call(row.children).filter(function (el) { return !el.hidden; });
      }

      function sync() {
        var items = visibleItems();
        var x = row.scrollLeft, best = 0, bestD = Infinity;
        items.forEach(function (item, i) {
          var d = Math.abs((item.offsetLeft - row.offsetLeft) - x);
          if (d < bestD) { bestD = d; best = i; }
        });
        dots.forEach(function (b, i) { b.classList.toggle("is-active", i === best); });
      }

      function build() {
        dotsWrap.textContent = "";
        dots = [];
        var items = visibleItems();
        if (items.length < 2) return;
        items.forEach(function (item, i) {
          var b = doc.createElement("button");
          b.type = "button";
          b.setAttribute("aria-label", (i + 1) + " / " + items.length + " 슬라이드로 이동");
          b.addEventListener("click", function () {
            item.scrollIntoView({ block: "nearest", inline: "start", behavior: reduce ? "auto" : "smooth" });
          });
          dotsWrap.appendChild(b);
          dots.push(b);
        });
        sync();
      }

      var ticking = false;
      row.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(function () { ticking = false; sync(); }); }
      }, { passive: true });

      if ("MutationObserver" in window) {
        new MutationObserver(function () { row.scrollLeft = 0; build(); })
          .observe(row, { attributes: true, subtree: true, attributeFilter: ["hidden"] });
      }
      build();
    });
  })();

  /* ---- BEFORE/AFTER 슬라이더 ---- */
  (function baSliders() {
    $$(".ba-slider").forEach(function (s) {
      var range = s.querySelector(".ba-slider__range");
      if (!range) return;
      function apply() { s.style.setProperty("--pos", range.value + "%"); }
      range.addEventListener("input", apply);
      apply();
    });
  })();

  /* ---- 라이트박스 ([data-lightbox] 이미지 줌) ---- */
  (function lightbox() {
    var triggers = $$("[data-lightbox]");
    if (!triggers.length) return;
    var box = doc.createElement("div");
    box.className = "lightbox";
    box.setAttribute("aria-hidden", "true");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "이미지 크게 보기");
    box.innerHTML = '<img alt="" /><button class="lightbox__close" type="button" aria-label="닫기">×</button>';
    doc.body.appendChild(box);
    var img = box.querySelector("img");
    var closeBtn = box.querySelector(".lightbox__close");
    var lastFocus = null;
    function open(src, alt) {
      img.src = src; img.alt = alt || "";
      lastFocus = doc.activeElement;
      box.classList.add("is-open");
      box.setAttribute("aria-hidden", "false");
      doc.body.classList.add("modal-open");
      closeBtn.focus();
    }
    function close() {
      box.classList.remove("is-open");
      box.setAttribute("aria-hidden", "true");
      doc.body.classList.remove("modal-open");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }
    triggers.forEach(function (t) {
      t.addEventListener("click", function () {
        var target = t.tagName === "IMG" ? t : t.querySelector("img");
        if (target) open(target.currentSrc || target.src, target.alt);
      });
      if (t.tagName === "IMG") {
        t.setAttribute("tabindex", "0");
        t.setAttribute("role", "button");
        t.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); t.click(); }
        });
      }
    });
    box.addEventListener("click", function (e) { if (e.target !== img) close(); });
    doc.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") { close(); return; }
      /* 닫기 버튼이 유일한 포커서블 — Tab을 가둠 */
      if (e.key === "Tab") { e.preventDefault(); closeBtn.focus(); }
    });
  })();

  /* ---- TU식 공지 팝업 (여러 장 슬라이드 + 칩 탭 + 자동 전환) ---- */
  (function noticePop() {
    var pop = doc.querySelector("[data-notice-pop]");
    if (!pop) return;
    var NEVER_KEY = "baroNoticeNever", SESSION_KEY = "baroNoticeClosed";
    try {
      if (window.localStorage.getItem(NEVER_KEY) === "1") return;
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch (e) {}

    var slides = $$("[data-np-slide]", pop);
    var tabs = $$("[data-np-tab]", pop);
    var idx = 0, timer = null;

    function goTo(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === idx); });
      tabs.forEach(function (t, k) {
        if (k === idx) t.setAttribute("aria-current", "true");
        else t.removeAttribute("aria-current");
      });
    }
    function stopAuto() { if (timer) { window.clearInterval(timer); timer = null; } }
    function startAuto() {
      if (reduce || slides.length < 2) return;
      stopAuto();
      timer = window.setInterval(function () { goTo(idx + 1); }, 5000);
    }
    function close(never) {
      stopAuto();
      pop.classList.remove("is-open");
      doc.body.classList.remove("modal-open");
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
        if (never) window.localStorage.setItem(NEVER_KEY, "1");
      } catch (e) {}
      window.setTimeout(function () { pop.hidden = true; }, 500);
    }

    tabs.forEach(function (t, k) { t.addEventListener("click", function () { stopAuto(); goTo(k); }); });
    var prev = pop.querySelector("[data-np-prev]"), next = pop.querySelector("[data-np-next]");
    if (prev) prev.addEventListener("click", function () { stopAuto(); goTo(idx - 1); });
    if (next) next.addEventListener("click", function () { stopAuto(); goTo(idx + 1); });
    pop.addEventListener("mouseenter", stopAuto);
    var neverBtn = pop.querySelector("[data-np-never]"), closeBtn = pop.querySelector("[data-np-close]");
    if (neverBtn) neverBtn.addEventListener("click", function () { close(true); });
    if (closeBtn) closeBtn.addEventListener("click", function () { close(false); });
    /* 센터 모달: 백드롭 클릭/Esc로 닫기 */
    var backdrop = pop.querySelector("[data-np-backdrop]");
    if (backdrop) backdrop.addEventListener("click", function () { close(false); });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && pop.classList.contains("is-open")) close(false);
    });

    window.setTimeout(function () {
      pop.hidden = false;
      doc.body.classList.add("modal-open");
      window.requestAnimationFrame(function () { pop.classList.add("is-open"); });
      startAuto();
    }, 1100);
  })();

  /* ---- 히어로 패럴랙스 (데스크톱 — 비주얼이 스크롤의 12%만 따라옴) ---- */
  (function heroParallax() {
    if (reduce || !window.matchMedia("(min-width:1000px)").matches) return;
    var v = doc.querySelector(".hero__visual img");
    if (!v) return;
    var ticking = false;
    function frame() {
      ticking = false;
      var y = Math.min(window.scrollY, window.innerHeight);
      v.style.transform = "translateY(" + (y * 0.12).toFixed(1) + "px)";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
    }, { passive: true });
  })();
})();
