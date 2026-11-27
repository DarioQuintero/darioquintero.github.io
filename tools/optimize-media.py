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
  • Videos (.mp4 .mov .m4v .avi .mkv)        ->  a smaller .mp4 (H.264)
      scaled down to MAX_VIDEO_WIDTH; plays in every browser
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
MP4_CRF = 28              # 0–51: lower = better quality but bigger files (23 ≈ looks like the original)
MP4_PRESET = "medium"     # encoding speed: "veryfast" = quicker but bigger files,
                          #   "slow" = smaller files but takes longer

# --check warns about finished files bigger than these:
IMAGE_SIZE_LIMIT = 1_000_000      # 1 MB
ANIMATION_SIZE_LIMIT = 5_000_000  # 5 MB, for animated images (converted GIFs)
VIDEO_SIZE_LIMIT = 20_000_000     # 20 MB
# ─────────────────────────────────────────────────────────────────────

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tif", ".tiff"}
VIDEO_EXTS = {".mp4", ".mov", ".m4v", ".avi", ".mkv"}

# Written into every video this script makes, so it knows which .mp4 files
# are already done (it's near the start of the file; no ffmpeg needed to check).
MARKER = "optimized by tools/optimize-media.py"
TEMP_SUFFIX = ".optimizing.mp4"     # a video being converted; removed if interrupted


def is_optimized_mp4(path):
    try:
        with open(path, "rb") as f:
            return MARKER.encode() in f.read(2_000_000)
    except OSError:
        return False


def is_animated_webp(path):
    with open(path, "rb") as f:
        return b"ANIM" in f.read(64)


def old_webm_copies():
    """Earlier versions made a .webm plus an .mp4 backup of each video. The
    .webm turned out bigger and far slower to make, so only the .mp4 is kept."""
    return [p for p in media_files() if p.suffix.lower() == ".webm" and p.with_suffix(".mp4").exists()]


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
    if path.name.endswith(TEMP_SUFFIX):
        return False
    if ext in VIDEO_EXTS:
        if ext == ".mp4":
            # Already made by this script (or the backup next to an old .webm): done.
            return not (is_optimized_mp4(path) or path.with_suffix(".webm").exists())
        return True
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


def update_page_short_names(old, new, dry_run):
    """In js/pages.js, a work's media list can name files in its own folder by
    file name alone (e.g. "01.jpg" for works/my-work/01.jpg). Update those."""
    import json, re
    parts = old.split("/")
    if len(parts) < 3 or parts[0] != "works":
        return False
    work_id, old_name = parts[1], "/".join(parts[2:])
    new_name = "/".join(new.split("/")[2:])
    pages_file = ROOT / "js" / "pages.js"
    if not pages_file.exists():
        return False
    text = pages_file.read_text(encoding="utf-8")
    marker = "const pages ="
    at = text.index(marker)
    pages = json.loads(text[at + len(marker):].strip().rstrip(";"))
    page = pages.get(work_id)
    if not page:
        return False
    pattern = r"(?<![\w./-])" + re.escape(old_name) + r"(?![\w.-])"
    updated = re.sub(pattern, new_name, page.get("media", ""))
    if updated == page.get("media", ""):
        return False
    if not dry_run:
        page["media"] = updated
        pages_file.write_text(text[:at] + marker + " " + json.dumps(pages, indent=2, ensure_ascii=False) + ";\n",
                              encoding="utf-8")
    return True


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
    if update_page_short_names(old, new, dry_run) and "js/pages.js" not in changed:
        changed.append("js/pages.js")
    return changed


def convert_image(src, dry_run):
    from PIL import Image, ImageOps

    dest = src.with_suffix(".webp")
    if dry_run:
        return dest
    with Image.open(src) as im:
        if getattr(im, "is_animated", False):            # animated GIF -> animated WebP
            # Lossless: for GIFs it's much smaller than lossy (and exact).
            im.save(dest, "WEBP", save_all=True, lossless=True, quality=80, method=4)
        else:
            im = ImageOps.exif_transpose(im)              # respect phone-camera rotation
            im.thumbnail((MAX_IMAGE_SIZE, MAX_IMAGE_SIZE), Image.LANCZOS)
            has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
            im = im.convert("RGBA" if has_alpha else "RGB")
            im.save(dest, "WEBP", quality=WEBP_QUALITY, method=4)
    return dest


def ffmpeg(args):
    # -stats shows a progress line (time and speed) while it works.
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-stats", *args], check=True)


def convert_video(src, dry_run):
    dest = src.with_suffix(".mp4")
    if dry_run:
        return dest
    # Write to a temporary file first, so stopping halfway (Ctrl+C) leaves
    # the original untouched and nothing half-finished behind.
    tmp = src.with_name(src.stem + TEMP_SUFFIX)
    try:
        ffmpeg(["-i", str(src), "-vf", f"scale='min({MAX_VIDEO_WIDTH},iw)':-2",
                "-c:v", "libx264", "-preset", MP4_PRESET, "-crf", str(MP4_CRF), "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
                "-metadata", f"comment={MARKER}", str(tmp)])
    except BaseException:
        tmp.unlink(missing_ok=True)
        raise
    keep_original(src)
    tmp.replace(dest)
    return dest


def mark_as_done(mp4):
    """Add MARKER to an .mp4 that's already small (copied as-is, no re-encoding),
    so it isn't converted a second time."""
    if is_optimized_mp4(mp4):
        return
    tmp = mp4.with_name(mp4.stem + TEMP_SUFFIX)
    try:
        ffmpeg(["-i", str(mp4), "-c", "copy", "-movflags", "+faststart",
                "-metadata", f"comment={MARKER}", str(tmp)])
    except BaseException:
        tmp.unlink(missing_ok=True)
        raise
    tmp.replace(mp4)


def remove_old_webm(dry_run):
    """Point the site at the .mp4 instead of an old .webm, and move the .webm
    into _originals/."""
    if old_webm_copies() and not dry_run and not shutil.which("ffmpeg"):
        print("Old .webm copies found, but ffmpeg isn't installed — leaving them for now.")
        return
    for webm in old_webm_copies():
        mp4 = webm.with_suffix(".mp4")
        refs = update_references(rel(webm), rel(mp4), dry_run)
        if not dry_run:
            mark_as_done(mp4)
            keep_original(webm)
        print(f"  {rel(webm)}  ->  {rel(mp4)}   (old .webm copy no longer needed)")
        if refs:
            print(f"      references updated in: {', '.join(refs)}")


def check():
    problems = 0
    for p in old_webm_copies():
        print(f"  old .webm copy: {rel(p)} (the .mp4 next to it is used now)")
        problems += 1
    for p in media_files():
        if needs_work(p):
            print(f"  not converted: {rel(p)} ({size(p.stat().st_size)})")
            problems += 1
        elif p.suffix.lower() == ".webp" and p.stat().st_size > (
                ANIMATION_SIZE_LIMIT if is_animated_webp(p) else IMAGE_SIZE_LIMIT):
            print(f"  large image:   {rel(p)} ({size(p.stat().st_size)})")
            problems += 1
        elif p.suffix.lower() in (".webm", ".mp4") and p.stat().st_size > VIDEO_SIZE_LIMIT \
                and not (p.suffix.lower() == ".webm" and p.with_suffix(".mp4").exists()):
            print(f"  large video:   {rel(p)} ({size(p.stat().st_size)})")
            problems += 1
    if problems:
        print(f"\n{problems} file(s) to fix. Run:  python tools/optimize-media.py")
        return 1
    print("All images and videos are optimized.")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Convert the site's media to WebP / MP4.")
    parser.add_argument("--dry-run", action="store_true", help="show what would happen, change nothing")
    parser.add_argument("--check", action="store_true", help="only report problems")
    args = parser.parse_args()

    if args.check:
        sys.exit(check())

    # Leftovers from a conversion that was stopped halfway
    for p in media_files():
        if p.name.endswith(TEMP_SUFFIX) and not args.dry_run:
            p.unlink()

    if args.dry_run:
        print("Dry run — nothing will be changed.\n")
    remove_old_webm(args.dry_run)

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

    before = after = 0
    for src in todo:
        old_size = src.stat().st_size
        old_rel = rel(src)
        is_video = src.suffix.lower() in VIDEO_EXTS
        if is_video and not args.dry_run:
            print(f"  {old_rel}: converting video ({size(old_size)}) ...", flush=True)
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
            print(f"  {old_rel}  ->  {new_rel}   {size(old_size)} -> {size(new_size)}")
        if refs:
            print(f"      references updated in: {', '.join(refs)}")

    if not args.dry_run:
        print(f"\nDone. {size(before)} of originals -> {size(after)} on the site.")
        print("Originals are in _originals/ (ignored by git).")


if __name__ == "__main__":
    main()
