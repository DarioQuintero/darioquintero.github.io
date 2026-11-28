// ─────────────────────────────────────────────────────────────
// YOUR WORKS
//
// To add a work:
//   1. Make a folder in /works named after it, e.g. works/plant-matter/
//   2. Put its images and videos in that folder.
//   3. Copy one of the entries below and fill it in.
//   4. Fill in its page with the page editor (python tools/edit.py).
//
// The Work page lists works by year, newest first (see the bottom of
// this file). Works from the same year keep the order they have here.
//
//   id          used in the work's address (work.html?id=...).
//               lowercase, dashes instead of spaces, must be unique.
//   title       shown under the thumbnail
//   year        shown next to the title (leave as "" if none)
//   thumbnail   image shown in grids ("" = grey placeholder)
//               a YouTube link also works: its video still is used
//   description short text beside the work on its own page ("" to leave out)
//   tags        used by the tag buttons on the Work page
//
// What's ON each work's page (its text, images and videos) lives in
// js/pages.js. Easiest way to edit it: run  python tools/edit.py  and click
// "Edit page" on the work. A new work gets an empty page to fill in there.
// ─────────────────────────────────────────────────────────────

const works = [
    
    //--------------- ART ---------------\\

  {
    id: "club-stamps",
    title: "Club Stamps",
    year: "2026",
    thumbnail: "works/club-stamps/hand-back-flash.webp",
    description: "A series of stamps and drawings.",
    tags: ["art"],
  },
  {
    id: "core-apple",
    title: "Core Apple",
    year: "2026",
    thumbnail: "works/core-apple/thumbnail.webp",
    description: `A program written in C++ which simulates sand-like behaviors in the pixels of an image. `,
    tags: ["art"],
  },
  {
    id: "fence-collages",
    title: "Fence Collages",
    year: "2026",
    thumbnail: "works/fence-collages/3-downsample.webp",
    description: "A series of collages made computationally.",
    tags: ["art"],
  },
  {
    id: "trail-cam-studies",
    title: "Trail Cam Studies",
    year: "2024",
    thumbnail: "works/trail-cam-studies/thumbnail.webp",
    description: "A collection of camera trap photos from the Caltech Southwest Trailcams dataset.",
    tags: ["art"],
  },
  {
    id: "comfyui-abstractions",
    title: "ComfyUI Abstractions",
    year: "2024",
    thumbnail: "works/comfyui-abstractions/constellation-1.webp",
    description: "Images made by chaining together diffusion models.",
    tags: ["art"],
  },

  //--------------- GAME DEVELOPMENT ---------------\\
  
  {
    id: "cod-mw4",
    title: "Call of Duty: Modern Warfare 4",
    year: "2026",
    thumbnail: "works/cod-mw4/thumbnail.webp",
    description: "Animation Programmer. ",
    tags: ["game development"],
  },
  {
    id: "ahn-chill-room",
    title: "AHN Chill Room: Pocket Edition",
    year: "2025",
    thumbnail: "works/ahn-chill-room/thumbnail.webp",
    description: "Unity Game Development",
    tags: ["game development"],
  },
  {
    id: "thumbs-up",
    title: "Thumbs Up",
    year: "2024",
    thumbnail: "works/thumbs-up/thumbnail.webp",
    description: "A Unity-developed video game.",
    tags: ["game development"]
  },
  {
    id: "chicana-soul",
    title: "Chicana Soul",
    year: "2024",
    thumbnail: "https://www.youtube.com/watch?v=hG5lHw77Yqg",
    description: "A short film with VFX made using Unreal Engine, Blender, and After Effects. ",
    tags: ["game development"],
  },
  {
    id: "train-of-thoughts",
    title: "Train of Thoughts",
    year: "2023",
    thumbnail: "works/train-of-thoughts/thumbnail.webp",
    description: "Short film made with Unreal Engine using virtual production techniques.",
    tags: ["game development"],
  },
  {
    id: "automajumper",
    title: "Automajumper",
    year: "2023",
    thumbnail: "works/automajumper/thumbnail.webp",
    description: "A Unity-developed video game.",
    tags: ["game development"],
  },
];

// ── Sort by year, newest first ──────────────────────────────
// Used everywhere: the Work page, and Prev / Next on each work's page.
// Works with no year go last. To show oldest first, swap a and b below.
// YouTube links as thumbnails: use the video's still image. The largest
// still doesn't exist for every video (YouTube then sends a tiny grey
// image), so fall back to smaller ones.
{
  const YT_LINK = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([\w-]{11})/;
  for (const w of works) {
    const m = (w.thumbnail || "").match(YT_LINK);
    if (m) w.thumbnail = `https://i.ytimg.com/vi/${m[1]}/maxresdefault.jpg`;
  }
  const smaller = { maxresdefault: "sddefault", sddefault: "hqdefault" };
  document.addEventListener("load", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.src.includes("i.ytimg.com") || img.naturalWidth > 120) return;
    const m = img.src.match(/\/(maxresdefault|sddefault)\.jpg$/);
    if (m) img.src = img.src.replace(m[1], smaller[m[1]]);
  }, true);
}

const yearOf = (w) => parseInt(w.year, 10) || -Infinity;
works.sort((a, b) => yearOf(b) - yearOf(a));
