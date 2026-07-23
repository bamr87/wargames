/*
 * Wargames fork override — loaded after the zer0-mistakes theme bundle when
 * `user_overrides: true` (see _config.yml).
 *
 * The left sidebar (_data/navigation/wargames.yml) is a two-level tree: one
 * collapsible group per game, its levels as children. Two things need fixing
 * up on the client:
 *
 *   1. The theme's nav-tree marks EVERY item `.active` at render time, so every
 *      link shows the highlighted "current" style. We clear that and re-apply
 *      `.active` to only the link matching the current page.
 *   2. Groups start collapsed, so on a first visit the active level is hidden.
 *      We expand the ancestor group(s) of the current link (and, on a game
 *      index page, that game's own level list) and scroll it into view.
 */
(function () {
  "use strict";

  function normPath(p) {
    // strip origin if present, collapse duplicate slashes, drop trailing slash
    try {
      p = new URL(p, window.location.origin).pathname;
    } catch (e) { /* p is already a path */ }
    return p.replace(/\/{2,}/g, "/").replace(/index\.html$/, "").replace(/\/+$/, "");
  }

  function openCollapse(el, toggleSelector) {
    if (!el) return;
    el.classList.add("show");
    var toggle = toggleSelector
      ? document.querySelector(toggleSelector)
      : (el.id ? document.querySelector('[data-bs-target="#' + el.id + '"]') : null);
    if (toggle) {
      toggle.classList.remove("collapsed");
      toggle.setAttribute("aria-expanded", "true");
    }
  }

  function fixSidebar() {
    var links = document.querySelectorAll(".nav-tree a.nav-tree-link[href]");
    if (!links.length) return;

    var here = normPath(window.location.pathname);
    var current = null;

    links.forEach(function (a) {
      a.classList.remove("active");          // clear the theme's over-broad active
      a.removeAttribute("aria-current");
      if (!current && normPath(a.getAttribute("href")) === here) current = a;
    });

    if (!current) return;

    current.classList.add("active");
    current.setAttribute("aria-current", "page");

    // Expand every enclosing collapsible group (reveals the active level).
    var node = current.closest(".collapse");
    while (node) {
      openCollapse(node);
      node = node.parentElement ? node.parentElement.closest(".collapse") : null;
    }

    // If the current link is itself a group header (e.g. a game index page),
    // open its own level list too.
    var wrap = current.parentElement;
    var ownToggle = wrap && wrap.querySelector('[data-bs-target^="#"]');
    if (ownToggle) openCollapse(document.querySelector(ownToggle.getAttribute("data-bs-target")), null);

    if (current.scrollIntoView) {
      try { current.scrollIntoView({ block: "center", behavior: "auto" }); } catch (e) { /* older browsers */ }
    }
  }

  function run() {
    fixSidebar();
    // Re-run once more after any theme sidebar-state restore has settled.
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(fixSidebar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
