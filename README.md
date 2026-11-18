# darioquintero.github.io

Plain HTML, CSS and JavaScript. No build step: open index.html in a browser.

    index.html      home page (intro + scratcher)
    works.html      grid of all works
    work.html       one template page used for every work
    bio.html        bio page
    style.css       all styling
    js/works.js     THE LIST OF WORKS — edit this to add/change work, including
                    each work's page content (text, images, videos, links)
    js/main.js      builds the grid on works.html from the list
    js/work.js      fills in work.html for a single work
    works/          images and videos, one folder per work

## Previewing locally

Double-click index.html to open it in a browser. To preview exactly like the
live site, you can also run a tiny local server from this folder:

    python -m http.server

then open http://localhost:8000 . (Or use the "Live Server" extension in VS Code.)

## Cursors

Custom cursor images go in assets/cursors/ — see the README there.
Hotspots are set in the "Custom cursors" section at the bottom of style.css.
