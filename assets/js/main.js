(() => {
  const doc = document;
  const root = doc.documentElement;

  // Theme toggle: only rendered when params.colorScheme = "auto".
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

  // Mobile navigation.
  const menuBtn = doc.querySelector(".menu-toggle");
  const nav = doc.getElementById("site-nav");
  if (menuBtn && nav && nav.children.length) {
    const setOpen = (open) => {
      menuBtn.setAttribute("aria-expanded", String(open));
      nav.dataset.open = String(open);
    };
    menuBtn.hidden = false;
    menuBtn.addEventListener("click", () => setOpen(menuBtn.getAttribute("aria-expanded") !== "true"));
    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.dataset.open === "true") { setOpen(false); menuBtn.focus(); }
    });
    doc.addEventListener("click", (e) => {
      if (nav.dataset.open === "true" && !nav.contains(e.target) && !menuBtn.contains(e.target)) setOpen(false);
    });
    matchMedia("(min-width: 821px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  // Copy buttons on code blocks.
  if (navigator.clipboard) {
    doc.querySelectorAll(".code-block").forEach((block) => {
      const btn = block.querySelector(".copy");
      const code = block.querySelector("pre code") || block.querySelector("pre");
      if (!btn || !code) return;
      const label = btn.textContent;
      btn.hidden = false;
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code.innerText.replace(/\n$/, ""));
          btn.textContent = btn.dataset.done || label;
          setTimeout(() => { btn.textContent = label; }, 1600);
        } catch (e) {}
      });
    });
  }

  // Highlight the current section in the table of contents.
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
