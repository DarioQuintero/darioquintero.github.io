// ─────────────────────────────────────────────────────────────
// SCRATCHER
// A lottery-ticket style scratch-off over a grid of works.
//
// The grid size comes from index.html:
//   <div class="splash scratcher" data-rows="2" data-cols="3">
// It shows a random set of (rows x cols) works from works.js,
// different every time the page loads.
//
// Settings you might want to tweak:
const COVER_TEXT = "Scratch for six\nportfolio pieces.";            // text printed on the cover ("" for none, \n for a new line)
const COVER_TEXT_COLOR = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();;

// What the cover is made of:
//   "image" — the picture in COVER_IMAGE, stretched to fill the card
//   "blur"  — frosted glass: a blurred view of the works (settings below)
const COVER_STYLE = "image";
const COVER_IMAGE = "assets/images/aluminum-foil-background.webp";
const EMBOSS_TEXT = true;         // picture cover only: press COVER_TEXT into the
                                  //   picture instead of printing it in COVER_TEXT_COLOR
const EMBOSS_DEPTH = 0.75;           // how raised the letters look (screen pixels)

// Blur settings (only used when COVER_STYLE is "blur").
// The cover is frosted glass: a blurred, gray-tinted view of the works
// underneath. Scratching reveals them sharp.
const COVER_BLUR = 16;             // how blurry the works look through the cover (screen pixels)
const BLUR_IN_OKLAB = false;       // true = blur in the OKLab color space (smoother,
                                  //   no muddy edges where colors meet);
                                  //   false = the browser's ordinary RGB blur
const COVER_TINT = .01;           // 0–1: how strongly it's tinted gray
                                  //   (0 = no tint, 1 = solid gray, like before)

// The scratch is a round brush whose size changes with how fast the
// cursor moves (sizes in screen pixels):
const BRUSH_MIN = 1;              // width when moving slowly
const BRUSH_MAX = 20;              // width when moving fast
const SPEED_FOR_MAX = 5;        // speed (pixels per millisecond) that reaches BRUSH_MAX.
                                  //   lower = reaches max size more easily
const FASTER_IS_BIGGER = true;    // false = fast strokes get thinner instead
const SMOOTHING = 0.1;              // 0–1: how quickly the size follows speed changes
                                  //   (lower = smoother, higher = more jittery)

// Grain: tiny specks scattered along the edges of each scratch, so it looks
// torn instead of smooth.
const GRAIN = 0.3;                // 0 = smooth edges, 1 = very ragged
const GRAIN_SIZE = 1;             // size of each speck (screen pixels)
// The cover's tint color is --scratch-cover in style.css.
// ─────────────────────────────────────────────────────────────

// Everything below is wrapped in { } so its names (grid, canvas, …)
// don't clash with the other script files on the page.
{

const scratcher = document.querySelector(".scratcher");
const grid = scratcher.querySelector(".scratch-grid");
const canvas = scratcher.querySelector(".scratch-cover");
const ctx = canvas.getContext("2d");

const rows = Number(scratcher.dataset.rows) || 2;
const cols = Number(scratcher.dataset.cols) || 3;

// ── 1. Build the grid of works underneath ───────────────────

grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

// ── Keeping the card for the rest of the visit ──
// The card (which works, what's been scratched) is saved in this tab's
// sessionStorage, so leaving the home page and coming back shows it
// exactly as it was. sessionStorage is cleared when the tab is closed,
// and a reload deliberately starts over — both give a fresh card.
const SAVE_KEY = "scratcher-card";
const navigation = performance.getEntriesByType("navigation")[0];
let saved = null;
try {
  if (navigation && navigation.type === "reload") sessionStorage.removeItem(SAVE_KEY);
  else saved = JSON.parse(sessionStorage.getItem(SAVE_KEY));
} catch (e) { /* storage blocked: just use a fresh card */ }

// Use the saved works if they still fit this grid; otherwise pick a
// random set (shuffle a copy of the list, then take the first rows x cols).
let chosen = null;
if (saved && saved.rows === rows && saved.cols === cols) {
  chosen = saved.ids.map((id) => works.find((w) => w.id === id)).filter(Boolean);
  if (chosen.length !== rows * cols) chosen = null;
}
if (!chosen) {
  saved = null;
  const shuffled = [...works];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  chosen = shuffled.slice(0, rows * cols);
}

for (const work of chosen) {
  const cell = document.createElement("a");
  cell.className = "scratch-cell";
  cell.href = `work.html?id=${work.id}`;
  cell.innerHTML = `
    ${work.thumbnail ? `<img src="${work.thumbnail}" alt="${work.title}" loading="eager" fetchpriority="high">` : `<div class="placeholder"></div>`}
    <span>${work.title}</span>
  `;
  grid.appendChild(cell);
}

// Lines between the works, drawn ABOVE the cover so they always stay
// sharp and can't be scratched away. It's an empty copy of the grid
// whose cells draw their outlines into the 1px gaps.
const lines = document.createElement("div");
lines.className = "scratch-lines";
lines.style.gridTemplateRows = grid.style.gridTemplateRows;
lines.style.gridTemplateColumns = grid.style.gridTemplateColumns;
for (let i = 0; i < rows * cols; i++) lines.appendChild(document.createElement("div"));
scratcher.appendChild(lines);

// ── 2. Draw the cover ───────────────────────────────────────
//
// Two canvases work together:
//   mask    — invisible. Keeps track of what's still covered (opaque) and
//             what's been scratched away (transparent).
//   canvas  — what you see: a blurred, tinted picture of the works,
//             cut to the shape of the mask.

const mask = document.createElement("canvas");
const mctx = mask.getContext("2d");

// Screen pixels -> canvas pixels (canvases have more pixels than the
// screen shows on high-res displays).
function pixelScale() {
  return canvas.width / canvas.getBoundingClientRect().width;
}

// Draw a sharp copy of the works grid onto a canvas, matching where
// each cell, thumbnail and title sit on screen.
function drawWorks(target) {
  const tctx = target.getContext("2d");
  const origin = canvas.getBoundingClientRect();
  const s = pixelScale();
  const place = (r) => [(r.left - origin.left) * s, (r.top - origin.top) * s, r.width * s, r.height * s];

  // Background: the cells' color, not the line color — the lines are a
  // separate sharp layer on top, so they're left out of the blur.
  const firstCell = grid.children[0];
  tctx.fillStyle = firstCell ? getComputedStyle(firstCell).backgroundColor : "#fff";
  tctx.fillRect(0, 0, target.width, target.height);

  for (const cell of grid.children) {
    tctx.fillStyle = getComputedStyle(cell).backgroundColor;
    tctx.fillRect(...place(cell.getBoundingClientRect()));

    // Thumbnail, filled and cropped from the centre the same way CSS shows it.
    const img = cell.querySelector("img");
    if (img && img.complete && img.naturalWidth) {
      const [bx, by, bw, bh] = place(img.getBoundingClientRect());
      const k = Math.max(bw / img.naturalWidth, bh / img.naturalHeight);
      const sw = bw / k, sh = bh / k;                                  // part of the image that fits
      tctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, bx, by, bw, bh);
    }

    // Title
    const label = cell.querySelector("span");
    if (label) {
      const lc = getComputedStyle(label);
      const [lx, ly, lw, lh] = place(label.getBoundingClientRect());
      // The thin line above the title
      const line = parseFloat(lc.borderTopWidth) * s;
      if (line) {
        tctx.fillStyle = lc.borderTopColor;
        tctx.fillRect(lx, ly, lw, line);
      }
      const above = line + parseFloat(lc.paddingTop) * s;   // line + space before the text
      tctx.fillStyle = lc.color;
      tctx.font = `${lc.fontStyle} ${lc.fontWeight} ${parseFloat(lc.fontSize) * s}px ${lc.fontFamily}`;
      tctx.textBaseline = "middle";
      tctx.fillText(label.textContent, lx, ly + above + (lh - above) / 2);
    }
  }
}

// Repaint the visible cover: blurred works + gray tint, cut to the mask.
// ── OKLab blur ──
// Ordinary blurs average colors as raw RGB numbers, which makes muddy,
// darker fringes where two colors meet. OKLab is a color space built
// around how we see color, so averaging there blends smoothly. Steps:
//   1. shrink the image (the blur hides the lower resolution, and it's
//      much faster), then convert it to OKLab
//   2. blur each of the three channels (a fast blur close to a Gaussian)
//   3. convert back to RGB and scale up to full size

// sRGB 0–255 → linear light, precomputed for speed.
const SRGB_TO_LINEAR = new Float32Array(256).map((_, i) => {
  const c = i / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
});
function linearToSrgb(x) {
  x = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(x * 255)));
}

// Three box blurs in a row ≈ a Gaussian blur with standard deviation sigma.
function boxSizesForGauss(sigma) {
  const ideal = Math.sqrt((12 * sigma * sigma) / 3 + 1);
  let lo = Math.floor(ideal);
  if (lo % 2 === 0) lo--;
  const hi = lo + 2;
  const m = Math.round((12 * sigma * sigma - 3 * lo * lo - 12 * lo - 9) / (-4 * lo - 4));
  return [0, 1, 2].map((i) => ((i < m ? lo : hi) - 1) / 2);   // radii
}

// One box blur pass along rows (horizontal) or columns (vertical);
// pixels past the edge repeat the edge pixel, so edges don't fade.
function boxPass(src, dst, w, h, r, horizontal) {
  const lines = horizontal ? h : w, len = horizontal ? w : h;
  const step = horizontal ? 1 : w, lineStep = horizontal ? w : 1;
  const inv = 1 / (2 * r + 1);
  for (let line = 0; line < lines; line++) {
    const base = line * lineStep;
    const at = (i) => src[base + Math.min(len - 1, Math.max(0, i)) * step];
    let sum = 0;
    for (let i = -r; i <= r; i++) sum += at(i);
    for (let i = 0; i < len; i++) {
      dst[base + i * step] = sum * inv;
      sum += at(i + r + 1) - at(i - r);
    }
  }
}

function blurChannel(ch, w, h, sigma) {
  const tmp = new Float32Array(ch.length);
  for (const r of boxSizesForGauss(sigma)) {
    if (r < 1) continue;
    boxPass(ch, tmp, w, h, r, true);
    boxPass(tmp, ch, w, h, r, false);
  }
}

// Blur a canvas in OKLab. sigma is in that canvas's pixels.
// Returns a new (smaller) canvas; draw it scaled up to full size.
function oklabBlur(source, sigma) {
  const f = Math.max(1, Math.min(8, Math.floor(sigma / 3)));   // shrink factor
  const W = source.width, H = source.height;
  const w = Math.ceil(W / f), h = Math.ceil(H / f);
  const px = source.getContext("2d").getImageData(0, 0, W, H).data;

  // 1. Shrink: average each f×f block in linear light (the physically
  //    correct way to mix light), then convert each block to OKLab.
  const R = new Float32Array(w * h), G = new Float32Array(w * h), Bl = new Float32Array(w * h);
  const count = new Float32Array(w * h);
  for (let y = 0; y < H; y++) {
    const row = ((y / f) | 0) * w;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, j = row + ((x / f) | 0);
      R[j] += SRGB_TO_LINEAR[px[i]];
      G[j] += SRGB_TO_LINEAR[px[i + 1]];
      Bl[j] += SRGB_TO_LINEAR[px[i + 2]];
      count[j]++;
    }
  }
  const L = new Float32Array(w * h), A = new Float32Array(w * h), B = new Float32Array(w * h);
  for (let j = 0; j < w * h; j++) {
    const r = R[j] / count[j], g = G[j] / count[j], b = Bl[j] / count[j];
    const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    L[j] = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    A[j] = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    B[j] = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  }

  // 2. Blur each channel.
  const sig = sigma / f;
  blurChannel(L, w, h, sig);
  blurChannel(A, w, h, sig);
  blurChannel(B, w, h, sig);

  // 3. OKLab → RGB.
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d");
  const img = octx.createImageData(w, h);
  const d = img.data;
  for (let j = 0; j < w * h; j++) {
    const l_ = L[j] + 0.3963377774 * A[j] + 0.2158037573 * B[j];
    const m_ = L[j] - 0.1055613458 * A[j] - 0.0638541728 * B[j];
    const s_ = L[j] - 0.0894841775 * A[j] - 1.2914855480 * B[j];
    const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
    d[j * 4]     = linearToSrgb( 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
    d[j * 4 + 1] = linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
    d[j * 4 + 2] = linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
    d[j * 4 + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  return out;
}

// Same hand-written blur, but in plain RGB (looks like the browser's own
// blur). Used when BLUR_IN_OKLAB is off but the browser can't blur.
function rgbBlur(source, sigma) {
  const f = Math.max(1, Math.min(8, Math.floor(sigma / 3)));   // shrink factor
  const W = source.width, H = source.height;
  const w = Math.ceil(W / f), h = Math.ceil(H / f);
  const px = source.getContext("2d").getImageData(0, 0, W, H).data;

  const R = new Float32Array(w * h), G = new Float32Array(w * h), B = new Float32Array(w * h);
  const count = new Float32Array(w * h);
  for (let y = 0; y < H; y++) {
    const row = ((y / f) | 0) * w;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, j = row + ((x / f) | 0);
      R[j] += px[i]; G[j] += px[i + 1]; B[j] += px[i + 2];
      count[j]++;
    }
  }
  for (let j = 0; j < w * h; j++) { R[j] /= count[j]; G[j] /= count[j]; B[j] /= count[j]; }

  const sig = sigma / f;
  blurChannel(R, w, h, sig);
  blurChannel(G, w, h, sig);
  blurChannel(B, w, h, sig);

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d");
  const img = octx.createImageData(w, h);
  const d = img.data;
  for (let j = 0; j < w * h; j++) {
    d[j * 4] = R[j]; d[j * 4 + 1] = G[j]; d[j * 4 + 2] = B[j]; d[j * 4 + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  return out;
}

// Can this browser blur on a canvas (ctx.filter)? Safari can't yet, and
// silently ignores it — so test it: blur one dot and see if it spreads.
const CANVAS_BLUR_WORKS = (() => {
  try {
    const t = document.createElement("canvas");
    t.width = t.height = 9;
    const tc = t.getContext("2d");
    tc.filter = "blur(2px)";
    tc.fillRect(4, 4, 1, 1);
    return tc.getImageData(0, 4, 1, 1).data[3] > 0 || tc.getImageData(2, 4, 1, 1).data[3] > 0;
  } catch (e) {
    return false;
  }
})();

// The cover picture (when COVER_STYLE is "image"), loaded right away.
let coverImage = null;
if (COVER_STYLE === "image") {
  coverImage = new Image();
  coverImage.src = COVER_IMAGE;
}

// Draw the cover picture filling the whole canvas, cropped to fit
// without stretching (like CSS object-fit: cover).
function drawCoverImage(w, h) {
  const iw = coverImage.naturalWidth, ih = coverImage.naturalHeight;
  const k = Math.max(w / iw, h / ih);
  const dw = iw * k, dh = ih * k;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(coverImage, (w - dw) / 2, (h - dh) / 2, dw, dh);
  return { x: (w - dw) / 2, y: (h - dh) / 2, k };
}

// Embossed text: the letters show the same picture as around them, with a
// light edge up-left and a dark edge down-right, as if pressed up from behind.
function drawEmbossedText(text, x, y, placed) {
  const d = EMBOSS_DEPTH * pixelScale();

  ctx.save();
  ctx.shadowBlur = d;                                   // soften the edges slightly
  // Dark edge (bottom-right).
  ctx.shadowColor = ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillText(text, x + d, y + d);
  // Light edge (top-left).
  ctx.shadowColor = ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillText(text, x - d, y - d);
  ctx.restore();

  // The face of the letters: the picture itself, lined up exactly with the
  // picture underneath, so only the edges give the letters away.
  const face = ctx.createPattern(coverImage, "no-repeat");
  if (face) {                     // (null if the picture isn't fully loaded yet)
    face.setTransform(new DOMMatrix().translate(placed.x, placed.y).scale(placed.k));
    ctx.fillStyle = face;
    ctx.fillText(text, x, y);
  }
  // A faint sheen on the raised face.
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillText(text, x, y);
}

function drawCover(fast = false) {
  const w = canvas.width, h = canvas.height;
  if (!w || !h) return;
  const s = pixelScale();

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, w, h);

  let placed = null;   // where the cover picture was drawn (picture cover only)
  if (COVER_STYLE === "image" && coverImage && coverImage.complete && coverImage.naturalWidth) {
    // ── Picture cover ──
    placed = drawCoverImage(w, h);
  } else {
  // ── Blur cover ──
  // Sharp copy of the works, then draw it blurred.
  const sharp = document.createElement("canvas");
  sharp.width = w;
  sharp.height = h;
  drawWorks(sharp);

  let done = false;
  // Hand-written blur: always in OKLab mode, and also whenever the browser
  // can't blur by itself (Safari). Otherwise the browser's quick blur.
  if ((BLUR_IN_OKLAB && !fast) || !CANVAS_BLUR_WORKS) {
    try {
      const blurred = (BLUR_IN_OKLAB ? oklabBlur : rgbBlur)(sharp, COVER_BLUR * s);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(blurred, 0, 0, w, h);              // scale back up to full size
      done = true;
    } catch (e) {
      // Browsers block reading the pixels of images opened straight from
      // disk (file://), which the OKLab blur needs. Then it falls back to
      // the ordinary blur below. On a server / GitHub Pages it works.
    }
  }
  if (!done) {
    ctx.drawImage(sharp, 0, 0);                        // unblurred underlay so the edges don't fade
    ctx.filter = `blur(${COVER_BLUR * s}px)`;
    ctx.drawImage(sharp, 0, 0);
    ctx.filter = "none";
  }

  // Gray tint on top.
  ctx.globalAlpha = COVER_TINT;
  ctx.fillStyle = getComputedStyle(scratcher).getPropertyValue("--scratch-cover").trim() || "#9a9a9a";
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  } // end of blur cover

  if (COVER_TEXT) {
    ctx.fillStyle = COVER_TEXT_COLOR;
    // Same font and size as the intro paragraph (scaled to canvas pixels).
    const para = getComputedStyle(document.querySelector(".intro-text p") || document.body);
    ctx.font = `${para.fontStyle} ${para.fontWeight} ${48 * pixelScale()}px ${para.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // "\n" in COVER_TEXT starts a new line; the lines are centered as a group.
    const lines = COVER_TEXT.split("\n");
    const lineHeight = 48 * pixelScale() * 1.2;
    lines.forEach((line, i) => {
      const y = h / 2 + (i - (lines.length - 1) / 2) * lineHeight;
      if (EMBOSS_TEXT && placed) drawEmbossedText(line, w / 2, y, placed);
      else ctx.fillText(line, w / 2, y);
    });
  }

  // Keep only the parts that haven't been scratched.
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(mask, 0, 0);
  ctx.restore();
}

// Match the canvases' pixel size to their size on screen (sharp on
// high-res screens). On resize, keep whatever was already scratched.
function sizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(rect.width * dpr);
  const h = Math.round(rect.height * dpr);
  if (w === canvas.width && h === canvas.height) return;

  let old = null;
  if (mask.dataset.ready) {
    old = document.createElement("canvas");
    old.width = mask.width;
    old.height = mask.height;
    old.getContext("2d").drawImage(mask, 0, 0);
  }

  canvas.width = mask.width = w;
  canvas.height = mask.height = h;

  if (old) {
    mctx.drawImage(old, 0, 0, w, h);          // scratches so far, resized
  } else {
    mctx.fillStyle = "#000";
    mctx.fillRect(0, 0, w, h);                // start fully covered
    mask.dataset.ready = "1";
  }

  // While the window is being resized, use the quick blur; redraw with
  // the full OKLab blur once resizing has stopped for a moment.
  drawCover(true);
  clearTimeout(sizeCanvas.timer);
  sizeCanvas.timer = setTimeout(() => drawCover(), 150);
}

new ResizeObserver(sizeCanvas).observe(canvas);

// Thumbnails and fonts load a moment after the page; redraw the cover
// once they're ready so the blurred picture includes them.
//
// Until then the whole scratcher stays hidden, then fades in all at once
// (see .scratcher.is-ready in style.css) — so the works never "pop in".
// If something is very slow, it shows anyway after MAX_WAIT milliseconds.
const MAX_WAIT = 3000;
const ready = Promise.all([
  ...[...grid.querySelectorAll("img")].map((img) => img.decode().catch(() => {})),
  coverImage ? coverImage.decode().catch(() => {}) : null,
  document.fonts ? document.fonts.ready : null,
]);
const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT));
// The saved scratches, if returning to this card.
const savedScratches = new Promise((resolve) => {
  if (!saved || !saved.mask) return resolve(null);
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = saved.mask;
});

Promise.race([ready, timeout]).then(async () => {
  const img = await savedScratches;
  sizeCanvas();   // make sure the canvases are set up first, so the
                  // first resize can't wipe the restored scratches
  if (img) {
    mctx.save();
    mctx.globalCompositeOperation = "copy";              // replace the mask entirely
    mctx.drawImage(img, 0, 0, mask.width, mask.height);   // (stretched if the size changed)
    mctx.restore();
  }
  drawCover();
  scratcher.classList.add("is-ready");
  saveCard();
});

// Save the card: which works, and the scratches (as a small image).
function saveCard() {
  try {
    sessionStorage.setItem(SAVE_KEY, JSON.stringify({
      rows,
      cols,
      ids: chosen.map((w) => w.id),
      mask: mask.dataset.ready ? mask.toDataURL() : null,
    }));
  } catch (e) { /* storage full or blocked: the card just won't be kept */ }
}
// Put the saved scratches back onto the mask, then redraw the cover.
function restoreScratches() {
  let data = null;
  try { data = JSON.parse(sessionStorage.getItem(SAVE_KEY)); } catch (e) {}
  if (!data || !data.mask) return drawCover();
  const img = new Image();
  img.onload = () => {
    mctx.save();
    mctx.globalCompositeOperation = "copy";
    mctx.drawImage(img, 0, 0, mask.width, mask.height);
    mctx.restore();
    drawCover();
  };
  img.onerror = () => drawCover();
  img.src = data.mask;
}

// Coming back with the browser's Back button can restore this page from
// memory instead of reloading it — and browsers may have cleared the
// canvases while it was stored. Redraw from the saved copy.
window.addEventListener("pageshow", (e) => {
  if (e.persisted) restoreScratches();
});
// Same if the browser drops the canvas while the tab is in the background.
canvas.addEventListener("contextrestored", restoreScratches);

// Save when leaving the page (following a link, switching tabs, closing).
window.addEventListener("pagehide", saveCard);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveCard();
});

// ── 3. The brush ─────────────────────────────────────────

let lastScreen = null;        // previous point in screen pixels + time, to measure speed
let brush = BRUSH_MIN;        // current brush width (screen pixels), smoothed

// Work out the brush width from the cursor's speed.
function brushFor(e) {
  const dt = Math.max(1, e.timeStamp - lastScreen.t);
  const dist = Math.hypot(e.clientX - lastScreen.x, e.clientY - lastScreen.y);
  const speed = dist / dt;                                   // pixels per millisecond
  let amount = Math.min(speed / SPEED_FOR_MAX, 1);          // 0 (still) to 1 (fast)
  if (!FASTER_IS_BIGGER) amount = 1 - amount;
  const target = BRUSH_MIN + (BRUSH_MAX - BRUSH_MIN) * amount;
  brush += (target - brush) * SMOOTHING;                     // ease toward the target
  return brush;
}

// Erase a round-ended line from one point to another.
function scratch(from, to, size) {
  const k = pixelScale();                  // screen px -> canvas px
  const width = size * k;
  const half = width / 2;

  // The specks are worked out once, then erased from both canvases, so
  // the visible cover and the mask always match.
  const specks = [];
  if (GRAIN > 0) {
    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    // Direction across the stroke (for a single click, any direction).
    const nx = len ? -dy / len : 0, ny = len ? dx / len : 1;
    const speck = Math.max(1, GRAIN_SIZE * k);
    const band = Math.max(2 * k, half * 0.8);   // how far specks spread around each edge
    const steps = Math.max(1, Math.ceil(len / k));
    const perStep = Math.ceil(GRAIN * 6);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = from.x + dx * t, cy = from.y + dy * t;
      for (let j = 0; j < perStep; j++) {
        // Pick an edge, then a random distance from the centre line that
        // clusters around that edge: some specks inside, some outside.
        const side = Math.random() < 0.5 ? -1 : 1;
        const d = side * (half * (1 - GRAIN * 0.5) + (Math.random() - 0.3) * band * GRAIN);
        const along = (Math.random() - 0.5) * k * 2;   // a little jitter along the line too
        specks.push([
          cx + nx * d + (len ? dx / len : 0) * along - speck / 2,
          cy + ny * d + (len ? dy / len : 0) * along - speck / 2,
          speck,
        ]);
      }
    }
  }

  // Erase from the visible cover and from the mask.
  for (const c of [ctx, mctx]) {
    c.save();
    c.globalCompositeOperation = "destination-out";   // erase instead of paint
    // The smooth core, a bit thinner when there's grain (the specks
    // make up the edge).
    c.lineWidth = Math.max(1, width * (1 - GRAIN * 0.5));
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    c.moveTo(from.x, from.y);
    c.lineTo(to.x, to.y);
    c.stroke();
    // The grainy edge.
    for (const [x, y, sz] of specks) c.fillRect(x, y, sz, sz);
    c.restore();
  }
}

// ── 4. Mouse / touch handling ───────────────────────────────

let scratching = false;
let last = null;              // previous point, so drags are continuous
let start = null;             // where the press began, to tell a click from a drag
let startedOnClear = false;   // was that spot already scratched before this press?

// Is the cover already scratched away at canvas point p?
// (Counts as scratched if it's at least half see-through — thin, soft
// scratch lines are never fully transparent even in the middle.)
function isClearAt(p) {
  return mctx.getImageData(Math.floor(p.x), Math.floor(p.y), 1, 1).data[3] < 128;
}

function toCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
}

canvas.addEventListener("pointerdown", (e) => {
  scratching = true;
  canvas.setPointerCapture(e.pointerId);
  last = toCanvas(e);
  start = { x: e.clientX, y: e.clientY };
  startedOnClear = isClearAt(last);
  lastScreen = { x: e.clientX, y: e.clientY, t: e.timeStamp };
  brush = FASTER_IS_BIGGER ? BRUSH_MIN : BRUSH_MAX;   // a fresh press starts at the "still" size
  scratch(last, last, brush);
});

canvas.addEventListener("pointermove", (e) => {
  if (!scratching) return;
  const p = toCanvas(e);
  scratch(last, p, brushFor(e));
  last = p;
  lastScreen = { x: e.clientX, y: e.clientY, t: e.timeStamp };
});

canvas.addEventListener("pointerup", (e) => {
  scratching = false;
  saveCard();

  // A click (not a drag) on an area that's already scratched opens
  // the work underneath it.
  const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
  if (moved > 5 || !startedOnClear) return;

  canvas.style.pointerEvents = "none";
  const under = document.elementFromPoint(e.clientX, e.clientY);
  canvas.style.pointerEvents = "";
  const link = under && under.closest("a");
  if (link) link.click();
});

canvas.addEventListener("pointercancel", () => { scratching = false; });

}
