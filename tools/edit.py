#!/usr/bin/env python3
"""
edit.py — preview the site on your computer with the page editor switched on.

    python tools/edit.py            then open http://localhost:8000
    python tools/edit.py 8080       (use a different port)

Open any work's page and click "Edit page" (bottom right). Your edits are
saved into js/pages.js; commit and push as usual to put them online.

Only this computer can connect, and the editor never appears on the live
site. Needs only Python — nothing to install. Stop it with Ctrl+C.
"""

import http.server
import json
import re
import socketserver
import sys
import webbrowser
from pathlib import Path
from urllib.parse import urlparse, parse_qs

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "js" / "pages.js"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
MEDIA_EXTS = {".webp", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".avif",
              ".webm", ".mp4", ".mov", ".m4v"}
VALID_ID = re.compile(r"^[a-z0-9][a-z0-9-]*$")
MARKER = "const pages ="


def load_pages():
    """Read js/pages.js -> (the comment header, {id: {text, media}})."""
    if not PAGES.exists():
        return "", {}
    source = PAGES.read_text(encoding="utf-8")
    at = source.index(MARKER)
    body = source[at + len(MARKER):].strip()
    if body.endswith(";"):
        body = body[:-1]
    return source[:at], json.loads(body)


def save_pages(header, pages):
    text = header + MARKER + " " + json.dumps(pages, indent=2, ensure_ascii=False) + ";\n"
    tmp = PAGES.with_suffix(".js.tmp")
    tmp.write_text(text, encoding="utf-8")
    tmp.replace(PAGES)                       # swap in all at once: never half-written


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")   # always show the latest files
        super().end_headers()

    def log_message(self, fmt, *args):
        pass                                    # keep the terminal quiet

    def send_json(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/__edit/ping":
            return self.send_json(200, {"editor": True})
        if url.path == "/__edit/files":
            work_id = parse_qs(url.query).get("id", [""])[0]
            if not VALID_ID.match(work_id):
                return self.send_json(400, {"error": "bad id"})
            folder = ROOT / "works" / work_id
            files = sorted(
                p.relative_to(ROOT).as_posix()
                for p in folder.rglob("*")
                if p.is_file() and p.suffix.lower() in MEDIA_EXTS
            ) if folder.exists() else []
            return self.send_json(200, {"folder": f"works/{work_id}/", "files": files})
        return super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != "/__edit/save":
            return self.send_json(404, {"error": "not found"})
        try:
            data = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            work_id = data["id"]
            if not VALID_ID.match(work_id):
                return self.send_json(400, {"error": "bad id"})
            header, pages = load_pages()
            pages[work_id] = {"text": str(data.get("text", "")), "media": str(data.get("media", ""))}
            save_pages(header, pages)
            print(f"  saved {work_id}")
            return self.send_json(200, {"ok": True})
        except json.JSONDecodeError:
            return self.send_json(500, {"error": "js/pages.js isn't valid JSON — fix it by hand, or undo your last manual edit"})
        except Exception as e:
            return self.send_json(500, {"error": str(e)})


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    try:
        server = Server(("127.0.0.1", PORT), Handler)    # this computer only
    except OSError:
        sys.exit(f"Port {PORT} is busy. Try:  python tools/edit.py {PORT + 1}")
    url = f"http://localhost:{PORT}/works.html"
    print(f"Editing preview running at {url}")
    print("Open a work and click 'Edit page'. Press Ctrl+C to stop.\n")
    try:
        webbrowser.open(url)
    except Exception:
        pass
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
