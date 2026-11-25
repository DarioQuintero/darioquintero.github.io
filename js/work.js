// Fills in work.html for whichever work is named in the address,
// e.g. work.html?id=plant-matter
//
// The page is built from the work's "content" blocks in js/works.js, in
// the order they're listed:
//   images and videos  -> the large column on the right
//   text, headings, links -> the column on the left, under the title

const id = new URLSearchParams(window.location.search).get("id");
const work = works.find((w) => w.id === id);

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

// The 11-character ID of a YouTube video link, or null.
function youtubeId(src) {
  const m = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

// YouTube's still images for a video, sharpest first. Not every video has
// the sharpest sizes; a missing one comes back as a tiny 120px gray image.
const YT_STILLS = ["maxresdefault", "sddefault", "hqdefault"];

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
    // YouTube: show the sharpest still image with a play button; YouTube's
    // own player is only loaded when it's clicked (see "Play YouTube videos"
    // below). YouTube's player on its own often shows a blurry preview.
    const yt = youtubeId(b.src);
    if (yt) {
      const title = b.caption || work.title;
      return `
        <figure class="block-media">
          <div class="video-embed yt-poster" data-yt="${yt}" data-title="${title}">
            <img src="https://i.ytimg.com/vi/${yt}/${YT_STILLS[0]}.jpg" alt="" data-still="0">
            <button type="button" class="yt-play" aria-label="Play video: ${title}"></button>
          </div>
          ${caption(b)}
        </figure>`;
    }
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
    // A .webm made by tools/optimize-media.py has a .mp4 backup next to it,
    // for browsers that can't play .webm (older iPhones). The browser picks
    // the first one it can play.
    const sources = /\.webm$/i.test(b.src)
      ? `<source src="${b.src}" type="video/webm">
         <source src="${b.src.replace(/\.webm$/i, ".mp4")}" type="video/mp4">`
      : `<source src="${b.src}">`;
    return `
      <figure class="block-media">
        <video ${options} preload="metadata">${sources}</video>
        ${caption(b)}
      </figure>`;
  },

  // Several images/videos side by side, in equal-width columns.
  row: (b) => {
    const items = b.items || [];
    return `<div class="block-row" style="--columns: ${items.length}">${items.map(renderBlock).join("")}</div>`;
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

const MEDIA_TYPES = ["image", "video", "row"];   // these go on the right

const text = document.getElementById("work-text");
const media = document.getElementById("work-media");
const prevNext = document.getElementById("work-prevnext");

if (!work) {
  text.innerHTML = `<p>Work not found.</p>`;
} else {
  document.title = `${work.title} — Dario Quintero`;
  const blocks = work.content || [];

  // Left: title, year, description, then the text blocks.
  text.innerHTML = `
    <h1>${work.title}</h1>
    ${work.year ? `<p class="work-year">${work.year}</p>` : ""}
    ${work.description ? `<p>${work.description}</p>` : ""}
    ${blocks.filter((b) => !MEDIA_TYPES.includes(b.type)).map(renderBlock).join("")}
  `;

  // Right: images and videos, large.
  const mediaBlocks = blocks.filter((b) => MEDIA_TYPES.includes(b.type));
  media.innerHTML = mediaBlocks.length
    ? mediaBlocks.map(renderBlock).join("")
    : work.thumbnail
      ? render.image({ src: work.thumbnail })
      : `<div class="placeholder"></div>`;

  // Previous / next work (wrapping around at the ends).
  const i = works.indexOf(work);
  const prev = works[(i - 1 + works.length) % works.length];
  const next = works[(i + 1) % works.length];
  prevNext.innerHTML = `
    <a href="work.html?id=${prev.id}">Prev</a> / <a href="work.html?id=${next.id}">Next</a>
  `;
}

// ── Play YouTube videos ─────────────────────────────────────

// If a still image is missing (YouTube sends a tiny 120px gray image
// instead), try the next size down.
document.querySelectorAll(".yt-poster img").forEach((img) => {
  const check = () => {
    const i = Number(img.dataset.still);
    if (img.naturalWidth <= 120 && i < YT_STILLS.length - 1) {
      img.dataset.still = i + 1;
      img.src = `https://i.ytimg.com/vi/${img.closest(".yt-poster").dataset.yt}/${YT_STILLS[i + 1]}.jpg`;
    }
  };
  img.addEventListener("load", check);
  img.addEventListener("error", check);
  if (img.complete) check();        // already loaded (e.g. from the browser's cache)
});

// Clicking the poster swaps in YouTube's player, already playing.
document.addEventListener("click", (e) => {
  const poster = e.target.closest(".yt-poster");
  if (!poster) return;
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${poster.dataset.yt}?autoplay=1&rel=0`;
  iframe.title = poster.dataset.title;
  iframe.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
  iframe.allowFullscreen = true;
  poster.replaceChildren(iframe);
  poster.classList.remove("yt-poster");
});
