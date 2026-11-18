// ─────────────────────────────────────────────────────────────
// YOUR WORKS
//
// To add a work:
//   1. Make a folder in /works named after it, e.g. works/plant-matter/
//   2. Put its images and videos in that folder.
//   3. Copy one of the entries below and fill it in.
//
// The order here is the order on the Work page.
//
//   id          used in the work's address (work.html?id=...).
//               lowercase, dashes instead of spaces, must be unique.
//   title       shown under the thumbnail
//   year        shown next to the title (leave as "" if none)
//   thumbnail   image shown in grids ("" = grey placeholder)
//   description short text beside the work on its own page ("" to leave out)
//   tags        not used yet — saved for the filter later
//   content     everything on the work's own page, top to bottom (see below)
//
// ── CONTENT BLOCKS ──
// "content" is a list of blocks, shown in order. Mix and repeat freely.
//
//   { type: "text", text: "A paragraph." }
//       Simple HTML works inside: <em>italic</em>, <strong>bold</strong>,
//       <a href="https://...">a link</a>, <br> for a line break.
//
//   { type: "image", src: "works/my-work/01.jpg", caption: "Optional caption" }
//
//   { type: "video", src: "works/my-work/clip.mp4", caption: "Optional" }
//       Your own video file (.mp4 or .webm), with play controls.
//       Add  loop: true  to make it play silently on repeat, like a GIF.
//
//   { type: "video", src: "https://www.youtube.com/watch?v=..." }
//   { type: "video", src: "https://vimeo.com/..." }
//       YouTube and Vimeo links are embedded automatically.
//
//   { type: "link", url: "https://...", label: "View the live piece" }
//       A standalone link. Links to other sites open in a new tab.
//
//   { type: "heading", text: "Process" }
//       A small heading to split a long page into sections.
//
// Every block's caption is optional — leave it out if you don't need it.
// ─────────────────────────────────────────────────────────────

const works = [
  {
    id: "plant-matter",
    title: "Plant Matter",
    year: "2026",
    thumbnail: "works/plant-matter/placeholder.svg",
    description: "Placeholder. This page shows every kind of content block — see the top of js/works.js.",
    tags: ["art"],
    content: [
      { type: "image", src: "works/plant-matter/placeholder.svg", caption: "Installation view (placeholder image)" },
      { type: "text", text: "This is a paragraph block. Write about the work here. Simple formatting works too: <em>italics</em>, <strong>bold</strong>, and <a href=\"https://example.com\">inline links</a>." },
      { type: "heading", text: "Process" },
      { type: "text", text: "Another paragraph. Blocks appear in the order they're listed, so you can alternate text, images and video however you like." },
      { type: "video", src: "works/plant-matter/placeholder.mp4", loop: true, caption: "A looping video file (placeholder)" },
      { type: "link", url: "https://example.com", label: "View the live piece" },
    ],
  },
  {
    id: "sink-explorations",
    title: "Sink Explorations",
    year: "2026",
    thumbnail: "works/sink-explorations/placeholder.svg",
    content: [
      { type: "image", src: "works/sink-explorations/placeholder.svg" },
    ],
    description: "",
    tags: ["art"],
  },
  {
    id: "core-apple",
    title: "Core Apple",
    year: "2026",
    thumbnail: "works/core-apple/placeholder.svg",
    content: [
      { type: "image", src: "works/core-apple/placeholder.svg" },
    ],
    description: "",
    tags: ["art"],
  },
  {
    id: "stamp-that",
    title: "Stamp That",
    year: "2026",
    thumbnail: "works/stamp-that/placeholder.svg",
    content: [
      { type: "image", src: "works/stamp-that/placeholder.svg" },
    ],
    description: "",
    tags: ["art"],
  },
  {
    id: "trail-cam-studies",
    title: "Trail Cam Studies",
    year: "2024",
    thumbnail: "works/trail-cam-studies/placeholder.svg",
    content: [
      { type: "image", src: "works/trail-cam-studies/placeholder.svg" },
    ],
    description: "",
    tags: ["art"],
  },
  {
    id: "machine-drawings",
    title: "Machine Drawings",
    year: "2025",
    thumbnail: "works/machine-drawings/placeholder.svg",
    content: [
      { type: "image", src: "works/machine-drawings/placeholder.svg" },
    ],
    description: "",
    tags: ["art", "code"],
  },
  {
    id: "untitled-01",
    title: "Untitled 01",
    year: "2025",
    thumbnail: "works/untitled-01/placeholder.svg",
    content: [
      { type: "image", src: "works/untitled-01/placeholder.svg" },
    ],
    description: "Placeholder work.",
    tags: ["art"],
  },
  {
    id: "untitled-02",
    title: "Untitled 02",
    year: "2025",
    thumbnail: "works/untitled-02/placeholder.svg",
    content: [
      { type: "image", src: "works/untitled-02/placeholder.svg" },
    ],
    description: "Placeholder work.",
    tags: ["art"],
  },
  {
    id: "untitled-03",
    title: "Untitled 03",
    year: "2024",
    thumbnail: "works/untitled-03/placeholder.svg",
    content: [
      { type: "image", src: "works/untitled-03/placeholder.svg" },
    ],
    description: "Placeholder work.",
    tags: ["art"],
  },
  {
    id: "untitled-04",
    title: "Untitled 04",
    year: "2024",
    thumbnail: "works/untitled-04/placeholder.svg",
    content: [
      { type: "image", src: "works/untitled-04/placeholder.svg" },
    ],
    description: "Placeholder work.",
    tags: ["art"],
  },
  {
    id: "untitled-05",
    title: "Untitled 05",
    year: "2023",
    thumbnail: "works/untitled-05/placeholder.svg",
    content: [
      { type: "image", src: "works/untitled-05/placeholder.svg" },
    ],
    description: "Placeholder work.",
    tags: ["art"],
  },
  {
    id: "untitled-06",
    title: "Untitled 06",
    year: "2023",
    thumbnail: "works/untitled-06/placeholder.svg",
    content: [
      { type: "image", src: "works/untitled-06/placeholder.svg" },
    ],
    description: "Placeholder work.",
    tags: ["art"],
  },
];
