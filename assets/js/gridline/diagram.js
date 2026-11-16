// Synced from gridline-style 0.1.0 (1e854b9) src/js/diagram.js by scripts/sync-gridline-style.py. Edit it there.
// Renders <pre class="mermaid"> blocks with Pele (MIT, github.com/obsidianmd/pele)
// and adds an expand-to-window viewer with zoom. Colours and fonts come from the
// --pele-* variables in diagram.css, so light/dark switches need no re-render.
// Configuration lives on the script element: data-pele (module URL) and the
// translated labels. If Pele cannot load (offline), the source stays visible.
const config = document.querySelector("script[data-pele]");

if (config) {
  const labels = config.dataset;
  const blocks = [...document.querySelectorAll("pre.mermaid")];
  let pele;
  try {
    pele = blocks.length ? await import(labels.pele) : null;
  } catch (error) {
    console.warn("Pele did not load; diagrams stay as source.", error);
  }

  if (pele) {
    const { mountAsync, enableZoom } = pele;
    const zoomLabels = { zoomIn: labels.zoomIn, zoomOut: labels.zoomOut, reset: labels.zoomReset };
    const options = { zoom: { labels: zoomLabels } };
    // In the viewer the controls are always there, and zooming goes deeper.
    const viewerZoom = { always: true, maxScale: 8, labels: zoomLabels };
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
        viewer.zoom?.destroy();
        viewer.zoom = undefined;
        viewer.querySelector(".diagram-viewer-canvas").replaceChildren();
        viewer.trigger?.focus();
      });
      document.body.append(viewer);
      return viewer;
    };

    const expand = (host, trigger) => {
      const svg = host.querySelector(":scope > svg");
      if (!svg) return;
      const width = Number(svg.getAttribute("width"));
      const height = Number(svg.getAttribute("height"));
      if (!width || !height) return;
      const dialog = getViewer();
      const copy = svg.cloneNode(true);
      // Start from the whole drawing even if it was zoomed in on the page. The
      // width/height attributes stay: Pele's zoom reads the natural size from them.
      copy.setAttribute("viewBox", `0 0 ${width} ${height}`);
      copy.removeAttribute("tabindex");
      // Fit the canvas (a size container) exactly, scaling up or down, so the
      // box matches the drawing and zoom levels are measured from the real fit.
      Object.assign(copy.style, {
        width: `min(100cqw, 100cqh * ${width / height})`, height: "auto", maxWidth: "none",
        margin: "", display: "block", cursor: "", userSelect: "", touchAction: "",
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
      const canvas = dialog.querySelector(".diagram-viewer-canvas");
      canvas.replaceChildren(copy);
      dialog.trigger = trigger;
      dialog.showModal();
      // After showModal, so Pele measures the laid-out canvas.
      dialog.zoom = enableZoom(canvas, viewerZoom);
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
        // A diagram chunk failed to load: show the source again.
        host.replaceWith(pre);
        console.error(error);
      }
    }));
  }
}
