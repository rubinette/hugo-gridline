// Renders ```mermaid blocks with Pele. Colours and fonts come from the
// --pele-* variables in main.css, so light/dark switches need no re-render.
const config = document.querySelector("script[data-pele]");

if (config) {
  const labels = config.dataset;
  const blocks = [...document.querySelectorAll("pre.mermaid")];
  const { mountAsync } = await import(labels.pele);
  const options = {
    zoom: {
      labels: { zoomIn: labels.zoomIn, zoomOut: labels.zoomOut, reset: labels.zoomReset },
    },
  };

  const icon = (d) =>
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="${d}"/></svg>`;

  // One shared dialog shows a copy of a diagram scaled to fill the window.
  let viewer;
  const getViewer = () => {
    if (viewer) return viewer;
    viewer = document.createElement("dialog");
    viewer.className = "diagram-viewer";
    viewer.innerHTML = `
      <div class="diagram-viewer-panel">
        <div class="diagram-viewer-bar">
          <p class="diagram-viewer-title" id="diagram-viewer-title"></p>
          <button type="button" class="diagram-viewer-close">${icon("M6 6l12 12M18 6 6 18")}</button>
        </div>
        <div class="diagram-viewer-canvas"></div>
      </div>`;
    const close = viewer.querySelector(".diagram-viewer-close");
    close.setAttribute("aria-label", labels.close);
    close.title = labels.close;
    close.addEventListener("click", () => viewer.close());
    // The dialog fills the window; a click on its margin (outside the panel) closes it.
    viewer.addEventListener("click", (event) => { if (event.target === viewer) viewer.close(); });
    viewer.addEventListener("close", () => {
      viewer.querySelector(".diagram-viewer-canvas").replaceChildren();
      viewer.trigger?.focus();
    });
    document.body.append(viewer);
    return viewer;
  };

  const expand = (host, trigger) => {
    const svg = host.querySelector(":scope > svg");
    if (!svg) return;
    const dialog = getViewer();
    const copy = svg.cloneNode(true);
    // Show the whole drawing even if it was zoomed in on the page, and let the
    // viewBox scale it up or down to fit the canvas.
    const width = svg.getAttribute("width");
    const height = svg.getAttribute("height");
    if (width && height) copy.setAttribute("viewBox", `0 0 ${width} ${height}`);
    for (const attr of ["width", "height", "tabindex"]) copy.removeAttribute(attr);
    Object.assign(copy.style, {
      width: "100%", height: "100%", maxWidth: "none", margin: "0",
      display: "block", cursor: "", userSelect: "", touchAction: "",
    });
    const caption = host.closest("figure")?.querySelector("figcaption");
    const title = dialog.querySelector(".diagram-viewer-title");
    title.textContent = caption ? caption.textContent.trim() : "";
    if (title.textContent) {
      dialog.setAttribute("aria-labelledby", title.id);
      dialog.removeAttribute("aria-label");
    } else {
      dialog.setAttribute("aria-label", labels.expand);
      dialog.removeAttribute("aria-labelledby");
    }

    dialog.querySelector(".diagram-viewer-canvas").replaceChildren(copy);
    dialog.trigger = trigger;
    dialog.showModal();
  };

  const addExpandButton = (host) => {
    // Pele rewrites the host on every render, so the button sits beside it.
    const button = document.createElement("button");
    button.type = "button";
    button.className = "diagram-expand";
    button.setAttribute("aria-label", labels.expand);
    button.title = labels.expand;
    button.innerHTML = icon("M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5");
    button.addEventListener("click", () => expand(host, button));
    host.after(button);
  };

  await Promise.all(blocks.map(async (pre) => {
    const host = document.createElement("div");
    host.className = "mermaid-diagram";
    pre.replaceWith(host);
    try {
      // Syntax errors are drawn in place by Pele itself.
      const mounted = await mountAsync(host, pre.textContent, options);
      if (!mounted.error) addExpandButton(host);
    } catch (error) {
      // Only reached if a diagram chunk failed to load: show the source again.
      host.replaceWith(pre);
      console.error(error);
    }
  }));
}
