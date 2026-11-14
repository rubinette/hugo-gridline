#!/usr/bin/env python3
"""Copy the Gridline styles and scripts this theme uses from gridline-style.

The theme does not keep its own copy of the design system: the CSS modules
and JS under assets/css/gridline/ and assets/js/gridline/ come from
https://github.com/rubinette/gridline-style (src/css, src/js). Edit them
there, then run this script so the theme follows.

  python3 scripts/sync-gridline-style.py [--from ../gridline-style]
  python3 scripts/sync-gridline-style.py --check     # exit 1 if out of date

The source defaults to $GRIDLINE_STYLE, else ../gridline-style next to this
repository. Each copied file starts with a line naming its source version.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# Cascade order matters: layouts/_partials/head.html concatenates in this order.
CSS = ("tokens", "base", "construction", "components", "prose", "blog", "diagram", "syntax")
JS = ("boot", "site", "diagram")


def source_label(src: Path) -> str:
    version = (src / "VERSION").read_text(encoding="utf-8").strip() if (src / "VERSION").exists() else "?"
    try:
        commit = subprocess.run(["git", "-C", str(src), "rev-parse", "--short", "HEAD"], capture_output=True, text=True, check=True).stdout.strip()
        dirty = subprocess.run(["git", "-C", str(src), "status", "--porcelain", "--", "src"], capture_output=True, text=True, check=True).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        commit, dirty = "unknown", ""
    return f"gridline-style {version} ({commit}{'+dirty' if dirty else ''})"


def planned(src: Path) -> dict[Path, str]:
    label = source_label(src)
    out: dict[Path, str] = {}
    for name in CSS:
        text = (src / "src" / "css" / f"{name}.css").read_text(encoding="utf-8")
        out[ROOT / "assets" / "css" / "gridline" / f"{name}.css"] = f"/* Synced from {label} src/css/{name}.css by scripts/sync-gridline-style.py. Edit it there. */\n{text}"
    for name in JS:
        text = (src / "src" / "js" / f"{name}.js").read_text(encoding="utf-8")
        out[ROOT / "assets" / "js" / "gridline" / f"{name}.js"] = f"// Synced from {label} src/js/{name}.js by scripts/sync-gridline-style.py. Edit it there.\n{text}"
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--from", dest="source", type=Path,
                        default=Path(os.environ.get("GRIDLINE_STYLE", ROOT.parent / "gridline-style")))
    parser.add_argument("--check", action="store_true", help="report differences instead of writing")
    args = parser.parse_args()
    src = args.source.expanduser().resolve()
    if not (src / "src" / "css" / "tokens.css").exists():
        print(f"ERROR: {src} is not a gridline-style checkout (no src/css/tokens.css). Use --from or $GRIDLINE_STYLE.", file=sys.stderr)
        return 2

    files = planned(src)
    managed = {ROOT / "assets" / "css" / "gridline", ROOT / "assets" / "js" / "gridline"}
    strays = sorted(p for d in managed if d.exists() for p in d.iterdir() if p not in files)
    # The version label alone does not make a copy stale: compare content below it.
    body = lambda text: text.split("\n", 1)[1] if "\n" in text else text
    stale = [p for p, text in files.items() if not p.exists() or body(p.read_text(encoding="utf-8")) != body(text)]

    if args.check:
        for p in stale:
            print(f"STALE: {p.relative_to(ROOT)}")
        for p in strays:
            print(f"STRAY: {p.relative_to(ROOT)}")
        if stale or strays:
            print("Run: python3 scripts/sync-gridline-style.py")
            return 1
        print(f"OK: {len(files)} files match {source_label(src)}")
        return 0

    # Writing also refreshes the version label of files whose content is unchanged.
    for p in [p for p, text in files.items() if not p.exists() or p.read_text(encoding="utf-8") != text]:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(files[p], encoding="utf-8")
        print(f"wrote {p.relative_to(ROOT)}")
    for p in strays:
        p.unlink()
        print(f"removed {p.relative_to(ROOT)}")
    print(f"OK: synced {len(files)} files from {source_label(src)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
