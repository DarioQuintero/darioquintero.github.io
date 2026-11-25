// ─────────────────────────────────────────────────────────────
// YOUR WORKS
//
// To add a work:
//   1. Make a folder in /works named after it, e.g. works/plant-matter/
//   2. Put its images and videos in that folder.
//   3. Copy one of the entries below and fill it in.
//
// The Work page lists works by year, newest first (see the bottom of
// this file). Works from the same year keep the order they have here.
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
//   { type: "row", items: [
//       { type: "image", src: "works/my-work/01.jpg", caption: "Optional" },
//       { type: "image", src: "works/my-work/02.jpg" },
//   ] }
//       Two or more images (or videos) side by side, in equal-width columns.
//       Put any number of image/video blocks in "items".
//
// Every block's caption is optional — leave it out if you don't need it.
// ─────────────────────────────────────────────────────────────

const works = [
  {
    id: "thumbs-up",
    title: "Thumbs Up",
    year: "2024",
    thumbnail: "works/thumbs-up/thumbnail.png",
    content: [
      { type: "video", src: "https://www.youtube.com/watch?v=CL9S3yzByPw"},
      {type: "image", src: "works/thumbs-up/thumbs-up-model.jpg"},
      { type: "text", text: "Thumbs Up is a fighting game in which two thumbs locked in place engage in hand-to-hand combat. It was made in Unity at the CMU Game Creation Society."},
      { type: "text", text: "The game was pitched and led by me throughout Carnegie Mellon's Fall 2024 semester. I led a team of 6 which consisted of four programmers, an artist and a sound designer. "},
      { type: "text", text: "I was also heavily involved in the art direction. Throughout the course of development I trained the other artist, who was previously exclusively a traditional artist, to sculpt and model in Blender. The other artist sculpted the thumb characters and created the environment; I handled retopology, rigging, texturing, and animation of the hand characters."},
    ],
    description: "A Unity-developed video game.",
    tags: ["game development"]
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
    id: "comfyui-abstractions",
    title: "ComfyUI Abstractions",
    year: "2024",
    thumbnail: "works/comfyui-abstractions/constellation-2.jpg",
    content: [
      { type: "text", text: `This is an experiment I did using ComfyUI, a tool for creating and executing. Stable Diffusion pipelines. In this workflow, I first used the epiCRealism SDXL checkpoint with 5 steps and a denoise of 0.55, then injected noise into the latent image, and then plugged that into another k-sampler running on the default runcomy model for 20 steps and with a denoise value of 1 and I got these interesting results. Pictured on the top center is the p5.js sketch, and pictured on the bottom center is the intermediate image produced by epiCRealism. By chaining together models in unexpected ways, I was surprised by the unique visual structures that arose.` },
      { type: "text", text: `On the bottom right is an image with the workflow embedded in the metadata.` },
      { type: "image", src: "works/comfyui-abstractions/constellation-1.jpg" },
      { type: "image", src: "works/comfyui-abstractions/constellation-2.jpg" },
      { type: "row", items: [
        { type: "image", src: "works/comfyui-abstractions/intermediate-sketch.jpg", caption: "The p5.js sketch" },
        { type: "image", src: "works/comfyui-abstractions/intermediate-output.jpg", caption: "Intermediate image produced by epiCRealism" },
      ] },
      { type: "image", src: "works/comfyui-abstractions/workflow.jpg", caption: "Workflow" },
    ],
    description: "Images made by chaining together diffusion models.",
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

// ── Sort by year, newest first ──────────────────────────────
// Used everywhere: the Work page, and Prev / Next on each work's page.
// Works with no year go last. To show oldest first, swap a and b below.
const yearOf = (w) => parseInt(w.year, 10) || -Infinity;
works.sort((a, b) => yearOf(b) - yearOf(a));
