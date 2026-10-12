"""Render the hand-drawn diagrams in tools/sketch/ to PNG files in assets/diagrams/.

    python tools/render.py                 # render everything
    python tools/render.py agent-loop ...  # render only these ids
    python tools/render.py --audit         # list text that overflows or overlaps

Needs Chrome or Edge (headless) and an internet connection the first time,
because the page loads rough.js and two fonts from public CDNs.
Standard library only.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKETCH = ROOT / "tools" / "sketch"
OUT = ROOT / "assets" / "diagrams"
CANDIDATES = [
    os.environ.get("CHROME", ""),
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    shutil.which("google-chrome") or "", shutil.which("chromium") or "", shutil.which("chromium-browser") or "",
]


def browser():
    for c in CANDIDATES:
        if c and Path(c).exists():
            return c
    sys.exit("No Chrome or Edge found. Set the CHROME environment variable to its path.")


def ids():
    found = []
    for script in re.findall(r'<script src="(d[^"]+\.js)"', (SKETCH / "sketch.html").read_text(encoding="utf-8")):
        f = SKETCH / script
        if f.exists():
            found += re.findall(r"^diagram\('([a-z0-9-]+)'", f.read_text(encoding="utf-8"), flags=re.M)
    return found


def chrome(args, query):
    url = (SKETCH / "sketch.html").as_uri() + "?" + query
    with tempfile.TemporaryDirectory() as profile:
        cmd = [browser(), "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
               "--force-device-scale-factor=1", "--window-size=1920,1080", "--virtual-time-budget=9000",
               "--allow-file-access-from-files", f"--user-data-dir={profile}", *args, url]
        return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=120)


def render(diagram_id):
    target = OUT / f"{diagram_id}.png"
    chrome([f"--screenshot={target}"], f"d={diagram_id}")
    return diagram_id, target.exists() and target.stat().st_size


def audit():
    dom = chrome(["--dump-dom"], "audit=1").stdout
    m = re.search(r'<pre id="report">(.*?)</pre>', dom, flags=re.S)
    text = (m.group(1) if m else "no report found; the page did not finish loading")
    print(text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"'))


if __name__ == "__main__":
    if "--audit" in sys.argv:
        audit()
        sys.exit(0)
    wanted = [a for a in sys.argv[1:] if not a.startswith("-")] or ids()
    OUT.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        for name, size in pool.map(render, wanted):
            print(f"{'ok  ' if size else 'FAIL'} {name}.png  {size // 1024 if size else 0} KB")
