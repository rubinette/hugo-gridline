// Renders ```mermaid blocks with Pele. Colours and fonts come from the
// --pele-* variables in main.css, so light/dark switches need no re-render.
const config = document.querySelector("script[data-pele]");

if (config) {
  const blocks = [...document.querySelectorAll("pre.mermaid")];
  const { mountAsync } = await import(config.dataset.pele);
  const options = {
    zoom: {
      labels: {
        zoomIn: config.dataset.zoomIn,
        zoomOut: config.dataset.zoomOut,
        reset: config.dataset.zoomReset,
      },
    },
  };

  await Promise.all(blocks.map(async (pre) => {
    const host = document.createElement("div");
    host.className = "mermaid-diagram";
    pre.replaceWith(host);
    try {
      // Syntax errors are drawn in place by Pele itself.
      await mountAsync(host, pre.textContent, options);
    } catch (error) {
      // Only reached if a diagram chunk failed to load: show the source again.
      host.replaceWith(pre);
      console.error(error);
    }
  }));
}
