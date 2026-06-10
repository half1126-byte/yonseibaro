/* homepage UX: filters, story expansion, and consultation modal */
(function () {
  "use strict";

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function setCurrent(buttons, active) {
    buttons.forEach(function (button) {
      var selected = button.getAttribute("data-filter") === active;
      if (selected) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  }

  function setupCaseTabs() {
    var tabs = document.querySelector("[data-case-tabs]");
    var grid = document.querySelector("[data-case-grid]");
    if (!tabs || !grid) return;

    var buttons = toArray(tabs.querySelectorAll("[data-filter]"));
    var cards = toArray(grid.querySelectorAll("[data-case]"));
    if (!buttons.length || !cards.length) return;

    function apply(filter) {
      setCurrent(buttons, filter);
      cards.forEach(function (card) {
        var groups = (card.getAttribute("data-case") || "").split(/\s+/);
        card.hidden = filter !== "all" && groups.indexOf(filter) === -1;
      });
    }

    tabs.addEventListener("click", function (event) {
      var button = event.target.closest("[data-filter]");
      if (!button) return;
      apply(button.getAttribute("data-filter"));
    });

    apply("all");
  }

  function setupStoryHub() {
    var tabs = document.querySelector("[data-story-tabs]");
    var grid = document.querySelector("[data-story-grid]");
    if (!tabs || !grid) return;

    var buttons = toArray(tabs.querySelectorAll("[data-filter]"));
    var cards = toArray(grid.querySelectorAll("[data-story]"));
    var moreButton = document.querySelector("[data-story-more]");
    if (!buttons.length || !cards.length) return;

    var activeFilter = "all";
    var expanded = false;

    function matches(card, filter) {
      return filter === "all" || card.getAttribute("data-story") === filter;
    }

    function apply(filter) {
      activeFilter = filter;
      setCurrent(buttons, filter);

      var hasHiddenMore = false;
      cards.forEach(function (card) {
        var isMore = card.classList.contains("story-card--more");
        var visible = matches(card, filter) && (!isMore || expanded);
        card.hidden = !visible;
        if (isMore && matches(card, filter) && !expanded) hasHiddenMore = true;
      });

      if (moreButton) moreButton.hidden = !hasHiddenMore;
    }

    tabs.addEventListener("click", function (event) {
      var button = event.target.closest("[data-filter]");
      if (!button) return;
      expanded = false;
      apply(button.getAttribute("data-filter"));
    });

    if (moreButton) {
      moreButton.addEventListener("click", function () {
        expanded = true;
        apply(activeFilter);
      });
    }

    apply(activeFilter);
  }

  function setupConsultModal() {
    var modal = document.querySelector("[data-consult-modal]");
    if (!modal) return;

    var panel = modal.querySelector(".consult-modal__panel");
    var closeButton = modal.querySelector(".consult-modal__close");
    var dismissButton = modal.querySelector("[data-consult-dismiss]");
    var closeTargets = toArray(modal.querySelectorAll("[data-consult-close]"));
    var lastFocus = null;
    var storageKey = "baroConsultDismissed";

    function readDismissed() {
      try { return window.sessionStorage.getItem(storageKey) === "1"; }
      catch (error) { return false; }
    }

    function writeDismissed() {
      try { window.sessionStorage.setItem(storageKey, "1"); }
      catch (error) {}
    }

    function isOpen() {
      return modal.classList.contains("is-open");
    }

    function focusable() {
      if (!panel) return [];
      return toArray(panel.querySelectorAll("a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])"))
        .filter(function (element) {
          return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement;
        });
    }

    function openModal() {
      if (isOpen() || readDismissed()) return;
      lastFocus = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      window.setTimeout(function () {
        (closeButton || panel || modal).focus();
      }, 80);
    }

    function closeModal(remember) {
      writeDismissed(); // 어떤 방식으로 닫아도 세션 내 재등장 없음
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    closeTargets.forEach(function (target) {
      target.addEventListener("click", function () {
        closeModal(false);
      });
    });

    if (dismissButton) {
      dismissButton.addEventListener("click", function () {
        closeModal(true);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (!isOpen()) return;
      if (event.key === "Escape") {
        closeModal(false);
        return;
      }
      if (event.key !== "Tab") return;

      var items = focusable();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    /* 강제 팝업 대신 스크롤 깊이 45% 도달 시 1회 제안.
       앵커 클릭(예약 CTA 등)으로 인한 점프 직후에는 발화 억제 — 행동 중인 사용자를 막지 않음 */
    if (!readDismissed()) {
      var fired = false;
      var suppressUntil = 0;
      document.addEventListener("click", function (event) {
        if (event.target.closest && event.target.closest('a[href*="#"]')) suppressUntil = Date.now() + 1800;
      });
      var onScrollDepth = function () {
        if (fired) return;
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        if (max > 0 && (window.scrollY || h.scrollTop) / max > 0.45 && Date.now() > suppressUntil) {
          fired = true;
          window.removeEventListener("scroll", onScrollDepth);
          openModal();
        }
      };
      window.addEventListener("scroll", onScrollDepth, { passive: true });
    }
  }

  setupCaseTabs();
  setupStoryHub();
  setupConsultModal();
})();
