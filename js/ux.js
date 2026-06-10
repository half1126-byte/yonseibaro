/* homepage UX: filters, story expansion */
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

  setupCaseTabs();
  setupStoryHub();
})();
