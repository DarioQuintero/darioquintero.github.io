#!/usr/bin/env python3
"""
make-resume-pdf.py — turn cv.html into assets/Dario-Quintero-Resume.pdf.

    python tools/make-resume-pdf.py

Uses Chrome or Edge in the background (no window opens), so the PDF looks
exactly like printing the CV page, minus the date/title/URL lines a browser
normally adds at the top and bottom.

Runs automatically before every commit that changes cv.html or style.css
(see .githooks/pre-commit), so the downloadable PDF always matches the page.
"""

import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "cv.html"
OUTPUT = ROOT / "assets" / "Dario-Quintero-Resume.pdf"

# Where Chrome / Edge usually live, per system. The first one found is used.
BROWSERS = [
    # Windows
    r"%ProgramFiles%\Google\Chrome\Application\chrome.exe",
    r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe",
    r"%LocalAppData%\Google\Chrome\Application\chrome.exe",
    r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe",
    r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe",
    # macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    # Linux / anything on the PATH
    "google-chrome", "chromium", "chromium-browser", "chrome", "msedge",
]


def find_browser():
    for candidate in BROWSERS:
        path = os.path.expandvars(candidate)
        if os.path.isfile(path):
            return path
        found = shutil.which(path)
        if found:
            return found
    return None


def main():
    browser = find_browser()
    if not browser:
        sys.exit("Couldn't find Chrome or Edge, so the resume PDF wasn't updated.")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    tmp = OUTPUT.with_suffix(".tmp.pdf")
    with tempfile.TemporaryDirectory() as profile:      # a throwaway browser profile
        subprocess.run([
            browser,
            "--headless=new",
            "--disable-gpu",
            f"--user-data-dir={profile}",
            "--no-pdf-header-footer",                    # no date / title / URL lines
            "--print-to-pdf-no-header",                  # (same, for older browsers)
            "--virtual-time-budget=3000",                # let the page's scripts run first
            f"--print-to-pdf={tmp}",
            PAGE.as_uri(),
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)

    if not tmp.exists() or tmp.stat().st_size == 0:
        sys.exit("The browser didn't produce a PDF; the old one was kept.")
    tmp.replace(OUTPUT)

    pages = len(re.findall(rb"/Type\s*/Page\b(?!s)", OUTPUT.read_bytes()))
    note = "" if pages <= 1 else f"  (warning: it's {pages} pages long, not 1)"
    print(f"Updated {OUTPUT.relative_to(ROOT).as_posix()}{note}")


if __name__ == "__main__":
    main()
