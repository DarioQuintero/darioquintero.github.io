#!/usr/bin/env python3
"""
optimize-media.py — keep the site's images and videos small and quick to load.

Run it from the repo folder before committing:

    python tools/optimize-media.py             convert everything that needs it
    python tools/optimize-media.py --dry-run   show what it would do, change nothing
    python tools/optimize-media.py --check     only report problems (GitHub runs this)

What it does, for files in works/ and assets/images/:
  • Photos (.jpg .jpeg .png .gif .bmp .tif)  ->  .webp
      resized so the longest side is at most MAX_IMAGE_SIZE pixels
  • Videos (.mp4 .mov .m4v .avi .mkv)        ->  .webm  + a small .mp4 backup
      (older iPhones can't play .webm; the site falls back to the .mp4)
  • Updates every reference in the .html files, style.css and js/*.js
      e.g. "works/plant-matter/01.jpg" becomes "works/plant-matter/01.webp"
  • Moves the originals into _originals/ (same folders), which git ignores.
      Nothing is deleted — to undo, move a file back and change the reference.

SVG files (the cursors, placeholders) are already tiny and are left alone.

Needs: Python 3, Pillow (pip install pillow) and ffmpeg for videos
(Windows: winget install ffmpeg). The --check mode needs neither.
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

# ── Settings ─────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
MEDIA_DIRS = ["works", "assets/images"]            # folders to look in
ORIGINALS = ROOT / "_originals"                    # where originals are kept
REFERENCE_FILES = ["*.html", "style.css", "js/*.js"]

MAX_IMAGE_SIZE = 2000     # longest side of a photo, in pixels
WEBP_QUALITY = 82         # 0–100: higher = sharper but bigger files
MAX_VIDEO_WIDTH = 1280    # videos wider than this are scaled down
WEBM_CRF = 34             # 0–63: lower = better quality but bigger files
MP4_CRF = 28              # 0–51: lower = better quality but bigger files

# --check warns about finished files bigger than these:
IMAGE_SIZE_LIMIT = 600_000        # 600 KB
VIDEO_SIZE_LIMIT = 10_000_000     # 10 MB
# ─────────────────────────────────────────────────────────────────────

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tif", ".tiff"}
VIDEO_EXTS = {".mp4", ".mov", ".m4v", ".avi", ".mkv"}


def media_files():
    for folder in MEDIA_DIRS:
        base = ROOT / folder
        if base.exists():
            yield from (p for p in sorted(base.rglob("*")) if p.is_file())


def needs_work(path):
    """Is this a photo or video that should be converted?"""
    ext = path.suffix.lower()
    if ext in IMAGE_EXTS:
        return True
    if ext in VIDEO_EXTS:
        # An .mp4 next to a .webm of the same name is the backup copy: done.
        return not (ext == ".mp4" and path.with_suffix(".webm").exists())
    return False


def rel(path):
    return path.relative_to(ROOT).as_posix()


def size(n):
    return f"{n / 1_000_000:.1f} MB" if n >= 1_000_000 else f"{n / 1000:.0f} KB"


def keep_original(path):
    """Move an original into _originals/, keeping its folder structure."""
    dest = ORIGINALS / path.relative_to(ROOT)
    dest.parent.mkdir(parents=True, exist_ok=True)
    n = 1
    while dest.exists():                       # never overwrite an earlier original
        dest = dest.with_name(f"{path.stem} ({n}){path.suffix}")
        n += 1
    shutil.move(str(path), str(dest))
    return dest


def update_references(old, new, dry_run):
    """Replace "old/path.jpg" with "new/path.webp" in the site's code."""
    changed = []
    for pattern in REFERENCE_FILES:
        for f in sorted(ROOT.glob(pattern)):
            text = f.read_text(encoding="utf-8")
            if old in text:
                changed.append(rel(f))
                if not dry_run:
                    f.write_text(text.replace(old, new), encoding="utf-8")
    return changed


def convert_image(src, dry_run):
    from PIL import Image, ImageOps

    dest = src.with_suffix(".webp")
    if dry_run:
        return dest
    with Image.open(src) as im:
        if getattr(im, "is_animated", False):            # animated GIF -> animated WebP
            im.save(dest, "WEBP", save_all=True, quality=WEBP_QUALITY, method=6)
        else:
            im = ImageOps.exif_transpose(im)              # respect phone-camera rotation
            im.thumbnail((MAX_IMAGE_SIZE, MAX_IMAGE_SIZE), Image.LANCZOS)
            has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
            im = im.convert("RGBA" if has_alpha else "RGB")
            im.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)
    return dest


def ffmpeg(args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


def convert_video(src, dry_run):
    webm, mp4 = src.with_suffix(".webm"), src.with_suffix(".mp4")
    if dry_run:
        return webm
    # Move the original aside first (it may itself be the .mp4 we're about to write).
    original = keep_original(src)
    scale = f"scale='min({MAX_VIDEO_WIDTH},iw)':-2"
    ffmpeg(["-i", str(original), "-vf", scale,
            "-c:v", "libvpx-vp9", "-crf", str(WEBM_CRF), "-b:v", "0", "-row-mt", "1",
            "-c:a", "libopus", "-b:a", "96k", str(webm)])
    ffmpeg(["-i", str(original), "-vf", scale,
            "-c:v", "libx264", "-preset", "veryfast", "-crf", str(MP4_CRF), "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(mp4)])
    return webm


def check():
    problems = 0
    for p in media_files():
        if needs_work(p):
            print(f"  not converted: {rel(p)} ({size(p.stat().st_size)})")
            problems += 1
        elif p.suffix.lower() == ".webp" and p.stat().st_size > IMAGE_SIZE_LIMIT:
            print(f"  large image:   {rel(p)} ({size(p.stat().st_size)})")
            problems += 1
        elif p.suffix.lower() in (".webm", ".mp4") and p.stat().st_size > VIDEO_SIZE_LIMIT:
            print(f"  large video:   {rel(p)} ({size(p.stat().st_size)})")
            problems += 1
    if problems:
        print(f"\n{problems} file(s) to fix. Run:  python tools/optimize-media.py")
        return 1
    print("All images and videos are optimized.")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Convert the site's media to WebP / WebM.")
    parser.add_argument("--dry-run", action="store_true", help="show what would happen, change nothing")
    parser.add_argument("--check", action="store_true", help="only report problems")
    args = parser.parse_args()

    if args.check:
        sys.exit(check())

    todo = [p for p in media_files() if needs_work(p)]
    if not todo:
        print("Nothing to do: all images and videos are already optimized.")
        return

    has_videos = any(p.suffix.lower() in VIDEO_EXTS for p in todo)
    if has_videos and not shutil.which("ffmpeg"):
        print("Videos found, but ffmpeg isn't installed — skipping videos.")
        print("  Install it (Windows: winget install ffmpeg), then run this again.\n")
        todo = [p for p in todo if p.suffix.lower() not in VIDEO_EXTS]
    if any(p.suffix.lower() in IMAGE_EXTS for p in todo):
        try:
            import PIL  # noqa: F401
        except ImportError:
            sys.exit("Pillow isn't installed. Run:  pip install pillow")

    if args.dry_run:
        print("Dry run — nothing will be changed.\n")
    before = after = 0
    for src in todo:
        old_size = src.stat().st_size
        old_rel = rel(src)
        is_video = src.suffix.lower() in VIDEO_EXTS
        try:
            dest = (convert_video if is_video else convert_image)(src, args.dry_run)
        except Exception as e:
            print(f"  ! {old_rel}: failed ({e})")
            continue
        if not args.dry_run and not is_video:
            keep_original(src)
        new_rel = rel(dest)
        refs = update_references(old_rel, new_rel, args.dry_run)
        before += old_size
        if args.dry_run:
            print(f"  {old_rel}  ->  {new_rel}")
        else:
            new_size = dest.stat().st_size
            after += new_size
            extra = f" (+ .mp4 backup, {size(dest.with_suffix('.mp4').stat().st_size)})" if is_video else ""
            print(f"  {old_rel}  ->  {new_rel}   {size(old_size)} -> {size(new_size)}{extra}")
        if refs:
            print(f"      references updated in: {', '.join(refs)}")

    if not args.dry_run:
        print(f"\nDone. {size(before)} of originals -> {size(after)} on the site.")
        print("Originals are in _originals/ (ignored by git).")


if __name__ == "__main__":
    main()
