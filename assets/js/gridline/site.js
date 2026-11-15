// Synced from gridline-style 0.1.0 (cf17ab7) src/js/site.js by scripts/sync-gridline-style.py. Edit it there.
// Gridline page behaviour: theme toggle, mobile navigation, docs navigation,
// copy buttons, on-this-page highlight. Every feature checks for its markup,
// so one file serves every template. Content stays usable without it.
(() => {
  const doc = document;
  const root = doc.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  // Theme toggle. The <head> snippet restores the stored choice before paint.
  const themeBtn = doc.querySelector(".theme-toggle");
  if (themeBtn) {
    const dark = matchMedia("(prefers-color-scheme: dark)");
    const current = () => root.getAttribute("data-theme") || (dark.matches ? "dark" : "light");
    const sync = () => themeBtn.setAttribute("aria-pressed", String(current() === "dark"));
    themeBtn.hidden = false;
    sync();
    dark.addEventListener("change", sync);
    themeBtn.addEventListener("click", () => {
      const next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("gridline-theme", next); } catch (e) {}
      sync();
    });
  }

  // A disclosure button that opens a panel (mobile site nav, docs nav).
  const disclose = (button, panel, wideQuery) => {
    if (!button || !panel) return;
    const setOpen = (open) => {
      button.setAttribute("aria-expanded", String(open));
      panel.dataset.open = String(open);
    };
    button.hidden = false;
    button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && panel.dataset.open === "true") { setOpen(false); button.focus(); }
    });
    if (wideQuery) matchMedia(wideQuery).addEventListener("change", (e) => { if (e.matches) setOpen(false); });
    return setOpen;
  };

  const menuBtn = doc.querySelector(".menu-toggle");
  const nav = doc.getElementById("site-nav");
  if (nav && nav.children.length) {
    const setOpen = disclose(menuBtn, nav, "(min-width: 821px)");
    if (setOpen) doc.addEventListener("click", (e) => {
      if (nav.dataset.open === "true" && !nav.contains(e.target) && !menuBtn.contains(e.target)) setOpen(false);
    });
  }
  disclose(doc.querySelector(".docs-nav-toggle"), doc.getElementById("docs-nav-list"));

  // Copy buttons on code blocks.
  if (navigator.clipboard) {
    doc.querySelectorAll(".code-block").forEach((block) => {
      const btn = block.querySelector(".copy");
      const code = block.querySelector("pre code") || block.querySelector("pre");
      if (!btn || !code) return;
      const label = btn.textContent;
      btn.hidden = false;
      btn.setAttribute("aria-live", "polite"); // screen readers hear "Copied
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code.innerText.replace(/\n$/, ""));
          btn.textContent = btn.dataset.done || label;
          setTimeout(() => { btn.textContent = label; }, 1600);
        } catch (e) {}
      });
    });
  }

  // Wide tables and diagrams scroll sideways; a scroll box that overflows
  // must be reachable by keyboard (WCAG 2.1.1), so give it a tab stop.
  const scrollers = [...doc.querySelectorAll(".table-wrap, .prose .mermaid")];
  if (scrollers.length) {
    const sync = () => scrollers.forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 1) el.setAttribute("tabindex", "0");
      else if (el.getAttribute("tabindex") === "0") el.removeAttribute("tabindex");
    });
    sync();
    addEventListener("resize", sync, { passive: true });
  }

  // Highlight the current section in an on-this-page rail.
  const tocLinks = [...doc.querySelectorAll(".toc-aside a[href^='#']")];
  if (tocLinks.length && "IntersectionObserver" in window) {
    const byHeading = new Map();
    tocLinks.forEach((a) => {
      const el = doc.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (el) byHeading.set(el, a);
    });
    let active = null;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (active) active.removeAttribute("aria-current");
        active = byHeading.get(entry.target);
        if (active) active.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    byHeading.forEach((_, el) => io.observe(el));
  }
})();
