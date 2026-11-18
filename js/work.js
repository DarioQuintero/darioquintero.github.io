// Fills in work.html for whichever work is named in the address,
// e.g. work.html?id=plant-matter
//
// The page is built from the work's "content" blocks in js/works.js
// (text, image, video, link, heading), in the order they're listed.

const id = new URLSearchParams(window.location.search).get("id");
const work = works.find((w) => w.id === id);
const page = document.getElementById("work-detail");

// ── Helpers ─────────────────────────────────────────────────

// Caption under an image/video, if there is one.
function caption(block) {
  return block.caption ? `<figcaption class="caption">${block.caption}</figcaption>` : "";
}

// Turn a YouTube or Vimeo page link into its embeddable player link.
// Returns null for anything else (e.g. your own .mp4 file).
function embedUrl(src) {
  let m = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
  m = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  return null;
}

// Links to other sites open in a new tab; links within the site don't.
function isExternal(url) {
  return /^https?:\/\//.test(url) && !url.startsWith(location.origin);
}

// ── One function per block type ─────────────────────────────

const render = {
  text: (b) => `<p class="block-text">${b.text}</p>`,

  heading: (b) => `<h2 class="block-heading">${b.text}</h2>`,

  image: (b) => `
    <figure class="block-media">
      <img src="${b.src}" alt="${b.alt || b.caption || work.title}" loading="lazy">
      ${caption(b)}
    </figure>`,

  video: (b) => {
    const embed = embedUrl(b.src);
    if (embed) {
      return `
        <figure class="block-media">
          <div class="video-embed">
            <iframe src="${embed}" title="${b.caption || work.title}" loading="lazy"
              allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
          </div>
          ${caption(b)}
        </figure>`;
    }
    // Your own video file. loop: true = silent, autoplaying, repeating (like a GIF).
    const options = b.loop ? "autoplay muted loop playsinline" : "controls playsinline";
    return `
      <figure class="block-media">
        <video src="${b.src}" ${options} preload="metadata"></video>
        ${caption(b)}
      </figure>`;
  },

  link: (b) => {
    const newTab = isExternal(b.url) ? ` target="_blank" rel="noopener"` : "";
    return `<p class="block-link"><a href="${b.url}"${newTab}>${b.label || b.url} ↗</a></p>`;
  },
};

function renderBlock(block) {
  const fn = render[block.type];
  if (!fn) {
    console.warn(`works.js: unknown block type "${block.type}" in "${work.id}"`);
    return "";
  }
  return fn(block);
}

// ── Build the page ──────────────────────────────────────────

if (!work) {
  page.innerHTML = `<p>Work not found. <a href="works.html">Back to all work</a></p>`;
} else {
  document.title = `${work.title} — Dario Quintero`;

  const blocks = work.content || [];
  const body = blocks.length
    ? blocks.map(renderBlock).join("")
    : `<div class="placeholder"></div>`;

  page.innerHTML = `
    <div class="work-content">${body}</div>
    <div class="work-info">
      <h1>${work.title}</h1>
      ${work.year ? `<p class="caption">${work.year}</p>` : ""}
      ${work.description ? `<p>${work.description}</p>` : ""}
      <p><a href="works.html">← All work</a></p>
    </div>
  `;
}
