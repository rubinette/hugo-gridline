// Synced from gridline-style 0.1.0 (e0eee62) src/js/boot.js by scripts/sync-gridline-style.py. Edit it there.
(function () {
  var r = document.documentElement;
  r.className = r.className.replace(/\bno-js\b/, "js");
  try {
    var t = localStorage.getItem("gridline-theme");
    if (t === "light" || t === "dark") r.setAttribute("data-theme", t);
  } catch (e) {}
})();
