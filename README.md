# darioquintero.github.io

Plain HTML, CSS and JavaScript. No build step: open index.html in a browser.

    index.html      home page (intro + scratcher)
    works.html      grid of all works
    work.html       one template page used for every work
    style.css       all styling
    js/works.js     THE LIST OF WORKS — title, year, thumbnail, tags, description
    js/pages.js     what's on each work's page (edit it with tools/edit.py)
    js/main.js      builds the grid on works.html from the list
    js/work.js      fills in work.html for a single work
    works/          images and videos, one folder per work

## Editing pages

Run the page editor from this folder:

    python tools/edit.py

It opens the site in your browser (http://localhost:8000). Open any work and
click "Edit page" (bottom right):

- Left: the text, in Markdown — **bold**, *italic*, ## Heading,
  [link](https://...), - lists. A blank line starts a new paragraph.
- Right: images and videos, one per line. File names mean files in that
  work's folder (works/<id>/). Click a file under the box to add it;
  Shift+click puts it beside the previous one.
    01.webp
    02.webp "A caption"
    03.webp | 04.webp          ← side by side
    clip.mp4 loop              ← silent, repeating video
    https://youtube.com/...    ← YouTube / Vimeo
- Save (or Ctrl+S) writes to js/pages.js. Then commit and push as usual.

The editor only exists on your computer while edit.py is running — it never
appears on the live site. To add a NEW work, first add it to js/works.js
(title, year, thumbnail...), then open its page and click "Edit page".

## Previewing locally

Double-click index.html to open it in a browser. To preview exactly like the
live site, you can also run a tiny local server from this folder:

    python -m http.server

then open http://localhost:8000 . (Or use the "Live Server" extension in VS Code.)

## Cursors

Custom cursor images go in assets/cursors/ — see the README there.
Hotspots are set in the "Custom cursors" section at the bottom of style.css.

## Images and videos

Add photos and videos in any format (jpg, png, mov, mp4...) to works/ or
assets/images/, reference them in js/works.js as usual, then before
committing run:

    python tools/optimize-media.py

It converts photos to .webp and videos to smaller .mp4 files, shrinks
anything oversized, updates the references in the code for you, and moves
the originals to _originals/ (ignored by git, so they're never uploaded).
Use --dry-run to preview what it will do.

One-time setup: install Python, then `pip install pillow`, and ffmpeg for
videos (Windows: `winget install ffmpeg`).

On every push, GitHub also runs `--check` (see .github/workflows/check-media.yml):
a red X on the commit means something wasn't converted.
