// ─────────────────────────────────────────────────────────────
// PAGE CONTENT for each work — managed by the page editor.
//
// Easiest: run  python tools/edit.py  and click "Edit page" on any work.
// (You can also edit this file by hand; keep it valid JSON inside the { }.)
//
//   text   Markdown for the column on the left
//   media  images/videos for the right, one per line;
//          several on one line separated by | sit side by side
// ─────────────────────────────────────────────────────────────

const pages = {
  "core-apple": {
    "text": "[Read this Medium article](https://medium.com/@dario.r.quintero/becoming-apple-without-morphological-skeleton-1f36241a892e?postPublishedType=repub) for a thorough writeup about the project.\n\nSome excerpts from the article:\n\n*\"Apple Without Morphological Skeleton\" is a program written in C++ which simulates sand-like behaviors in the pixels of an image. These sand-like behaviors are affected by the morphological structure of the image. The resultant movement of pixels then affects the morphological structure of the image.*\n\n*I like the apple with respect to how it is a sort of primitive form. Because it is such a familiar shape, I believe it complements the unfamiliarity of the shapes produced by the program. The cross-section of the apple references the distance transform. The color and quality of a fruit’s flesh is usually closely related to its distance from the skin, or, the distance from the core.*",
    "media": "gif-simple.webp\ngif-1.webp\ngif-2.webp\nhttps://www.youtube.com/watch?v=VzU4qI4dHnM\nspread.webp\nparrot.webp\n"
  },
  "stamp-that": {
    "text": "",
    "media": "placeholder.svg"
  },
  "machine-drawings": {
    "text": "",
    "media": "placeholder.svg"
  },
  "untitled-02": {
    "text": "",
    "media": "placeholder.svg"
  },
  "thumbs-up": {
    "text": "Thumbs Up is a fighting game in which two thumbs locked in place engage in hand-to-hand combat. It was made in Unity at the CMU Game Creation Society.\n\nThe game was pitched and led by me throughout Carnegie Mellon's Fall 2024 semester. I led a team of 6 which consisted of four programmers, an artist and a sound designer.\n\nI was also heavily involved in the art direction. Throughout the course of development I trained the other artist, who was previously exclusively a traditional artist, to sculpt and model in Blender. The other artist sculpted the thumb characters and created the environment; I handled retopology, rigging, texturing, and animation of the hand characters.",
    "media": "https://www.youtube.com/watch?v=CL9S3yzByPw\nthumbs-up-model.webp"
  },
  "trail-cam-studies": {
    "text": "This is project about data collection, curation, and manipulation in regards to trail cameras. I was interested in how trail cameras attempt to digitize nature in the absence of human presence, despite how observer effects make that impossible.\n\n[Read a thorough writeup on the project here.](https://github.com/DarioQuintero/caltech-trailcam-curation)",
    "media": "thumbnail.webp\ncoyote-1.webp\ncoyote-2.webp\ncoyote_umap.webp | generations_tsne.webp\nglitch-1.webp\nglitch-2.webp\n"
  },
  "comfyui-abstractions": {
    "text": "An experiment using Comfy UI, a tool for creating and executing Stable Diffusion pipelines. I was curious what it would look like to switch models halfway through the diffusion process. \n\nTo start, I used p5.js to generate compositions of ellipses as a starting point for an image-to-image pass. From there, I:\n1. Ran the pass with the epiCRealism XL checkpoint (5 steps, denoise 0.55)\n2. Injected noise into the latent image\n3. Plugged the output another k-sampler running on the default RunComfy model (20 steps)\n\nThe distributions of white speckles in the generated images resemble phyllotactic spirals or constellations.\n",
    "media": "constellation-1.webp\nconstellation-2.webp\nintermediate-sketch.webp \"The p5.js sketch\" | intermediate-output.webp \"Intermediate image produced by epiCRealism\"\nworkflow.webp \"The ComfyUI Workflow\"\n\n"
  },
  "untitled-03": {
    "text": "",
    "media": "placeholder.svg"
  },
  "untitled-04": {
    "text": "",
    "media": "placeholder.svg"
  },
  "untitled-05": {
    "text": "",
    "media": "placeholder.svg"
  },
  "untitled-06": {
    "text": "",
    "media": "placeholder.svg"
  },
  "train-of-thoughts": {
    "text": "On Train of Thoughts, I had a real actor, a motion capture suit, and the goal of using the motion capture suit to create a 2D stylized, 3D animated likeness of the actor. After much tinkering, testing, backtracking, and learning to use Rokoko products and Unreal Engine for the first time, I developed a workflow for efficiently creating such animations. \n\nI took advantage of Unreal’s Metahuman system to create a likeness of the actor using a 3D scan. Since the Metahuman was rigged, I could then use Rokoko’s plug-in for Unreal to send mocap data directly to the engine to the model. \n\nFrom there, I wrote a shader to emulate a sketch effect and did final cleanup in the sequencer to produce the final result. \n\nFilm made with crew of 19 people in a summer through the Gameheads program.",
    "media": "https://www.youtube.com/watch?v=eLzlfw8wsUY\ntrain-of-thoughts-1.webp\n"
  },
  "automajumper": {
    "text": "Automajumper is a 3D sidescrolling platformer which occurs amidst a Conway's Game of Life Simulation. Made in Unity at the Game Creation Society over the course of a semester.\n\nI pitched the game and led a team of 6 over the course of my first semester. I created all character and environment assets. I also created the cutscene at the beginning of the game. I handled materials and lighting as well.",
    "media": "https://youtu.be/bHRFtCT8s1E\nscreenshot-1.webp\nscreenshot-2.webp\nscreenshot-3.webp\n"
  },
  "blink": {
    "text": "Passes face tracking data as a uniform to a shader which impact the shader rendering the image. Blinking creates particles which induce ripples that propagate and interact with one another. By shaking one's head, one can disperse the accumulation of water that happens over time by blinking.\nMy goal was to create an interactive experience that induces the viewer to reconsider their relationship to a webcam.",
    "media": "https://www.youtube.com/watch?v=YBoHuS8315o\nblink-1.webp | blink-2.webp\n"
  },
  "chicana-soul": {
    "text": "I worked on the Ballerina motion capture retargeting as well as compositing of the digital model into the physical ballerina box. Also created digital camera shots and learned Niagara particle system to add ambient dust to the scene.\nMade with a team of 13 over the course of a summer through the Gameheads program.",
    "media": "https://www.youtube.com/watch?v=hG5lHw77Yqg\nchicana-soul-1.webp\n"
  }
};
