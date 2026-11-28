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
    "text": "[Read this Medium article](https://medium.com/@dario.r.quintero/becoming-apple-without-morphological-skeleton-1f36241a892e?postPublishedType=repub) for a thorough write-up about the project.\n\nSome excerpts from the article:\n\n*\"Apple Without Morphological Skeleton\" is a program written in C++ which simulates sand-like behaviors in the pixels of an image. These sand-like behaviors are affected by the morphological structure of the image. The resultant movement of pixels then affects the morphological structure of the image.*\n\n*I like the apple with respect to how it is a sort of primitive form. Because it is such a familiar shape, I believe it complements the unfamiliarity of the shapes produced by the program. The cross-section of the apple references the distance transform. The color and quality of a fruit’s flesh is usually closely related to its distance from the skin, or, the distance from the core.*",
    "media": "gif-simple.mp4 loop\ngif-2.mp4 loop\nhttps://www.youtube.com/watch?v=VzU4qI4dHnM\nspread.webp\nparrot.mp4 loop\n"
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
    "text": "This is a project about data collection, curation, and manipulation in regards to trail cameras. I was interested in how trail cameras attempt to digitize nature in the absence of human presence, despite how observer effects make that impossible.\n\n[Read a thorough write-up on the project here.](https://github.com/DarioQuintero/caltech-trailcam-curation)",
    "media": "thumbnail.webp\ncoyote-1.webp\ncoyote-2.webp\ncoyote_umap.webp | generations_tsne.webp\nglitch-1.webp\nglitch-2.webp\n"
  },
  "comfyui-abstractions": {
    "text": "An experiment using ComfyUI, a tool for creating and executing Stable Diffusion pipelines. I was curious what it would look like to switch models halfway through the diffusion process. \n\nTo start, I used p5.js to generate compositions of ellipses as a starting point for an image-to-image pass. From there, I:\n1. Ran the pass with the epiCRealism XL checkpoint (5 steps, denoise 0.55)\n2. Injected noise into the latent image\n3. Plugged the output into another KSampler running on the default RunComfy model (20 steps)\n\nThe distributions of white speckles in the generated images resemble phyllotactic spirals or constellations.\n",
    "media": "constellation-1.webp\nconstellation-2.webp\nworkflow.webp \"The ComfyUI Workflow\"\nintermediate-output.webp \"Intermediate image produced by epiCRealism\" | intermediate-sketch.webp \"The p5.js sketch\"\n\n"
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
    "text": "On Train of Thoughts, I had a real actor, a motion capture suit, and the goal of using the motion capture suit to create a 2D stylized, 3D animated likeness of the actor. After much tinkering, testing, backtracking, and learning to use Rokoko products and Unreal Engine for the first time, I developed a workflow for efficiently creating such animations. \n\nI took advantage of Unreal’s MetaHuman system to create a likeness of the actor using a 3D scan. Since the MetaHuman was rigged, I could then use Rokoko’s plug-in for Unreal to send mocap data directly to the model in the engine. \n\nFrom there, I wrote a shader to emulate a sketch effect and did final cleanup in Sequencer to produce the final result. \n\nFilm made with a crew of 19 people in a summer through the Gameheads program.",
    "media": "https://www.youtube.com/watch?v=eLzlfw8wsUY\ntrain-of-thoughts-1.webp\n"
  },
  "automajumper": {
    "text": "Automajumper is a 3D side-scrolling platformer which occurs amidst a Conway's Game of Life simulation. Made in Unity at the Game Creation Society over the course of a semester.\n\nI pitched the game and led a team of 6 over the course of my first semester. I created all character and environment assets. I also created the cutscene at the beginning of the game. I handled materials and lighting as well.",
    "media": "https://youtu.be/bHRFtCT8s1E\nscreenshot-1.webp\nscreenshot-2.webp\nscreenshot-3.webp\n"
  },
  "blink": {
    "text": "Blink passes face-tracking data as a uniform to a shader, which affects how the image is rendered. Blinking creates particles which induce ripples that propagate and interact with one another. By shaking one's head, one can disperse the accumulation of water that happens over time by blinking.\nMy goal was to create an interactive experience that induces the viewer to reconsider their relationship to a webcam.",
    "media": "https://www.youtube.com/watch?v=YBoHuS8315o\nblink-1.webp | blink-2.webp\n"
  },
  "chicana-soul": {
    "text": "I worked on the ballerina motion capture retargeting as well as compositing of the digital model into the physical ballerina box. Also created digital camera shots and learned Niagara particle system to add ambient dust to the scene.\nMade with a team of 13 over the course of a summer through the Gameheads program.",
    "media": "https://www.youtube.com/watch?v=hG5lHw77Yqg\nchicana-soul-1.webp\n"
  },
  "club-stamps": {
    "text": "",
    "media": "hand-back.webp\nhand-back-closeup-1.webp\nhand-front-closeup.webp\n\ntreadmill-1.webp\ntreadmill-2.webp | test.webp\nseated.webp\nnineteen.webp\n\nportrait-2.webp"
  },
  "cod-mw4": {
    "text": "I interned at Infinity Ward as an Animation Programmer during Summer 2026. I worked on two projects for MW4 prior to its Fall 2026 release date during my internship. \n\nThe first was an animation node written in C++ which would add procedural sway to humans standing on top of vehicles and moving platforms. Each bone affected by the node has a free-floating particle associated with it. That particle experiences 3 forces: a spring force, directed towards the bone's desired position based on the animation playing; an inertial force, based on the world space acceleration of the platform the human is standing on; and a custom force, which in this case is an oscillating vector which simulates the jittering of suspension driving over subtly bumpy terrain. Each bone then rotates to point to its free-floating particle, creating the effect.\n\nThe second project dealt with the combined playback of multiple animations at runtime. A tree structure is processed depth-first to blend hand-authored animations and the outputs of procedural animation code together. The authoring of this tree had become extremely disorganized and messy (the player character animtree had grown to over 44,000 nodes), prompting the need for a way to separate the tree into phases to better understand how poses are being calculated. These phases include things such as base pose, IK layers, physics simulation, etc. I worked across the engine pipeline to create a system for a) authoring animtrees in phases and b) calculating final poses in phases according to the authored data. This changes how all animation poses are calculated across the Call of Duty engine.\n",
    "media": "motorcycle-video.mp4 \"A video of the node turned up a comical amount. Notice the sway of the hips of the soldier standing on the motorcycle.\"\nplain-driving-video.mp4 \"A video of the node turned off. Notice how static the soldier in the back of the truck looks.\"\ninertial-effect-demo.mp4 \"A video with the node turned on showcasing the soldier's procedural reaction to crashing into a wall.\"\nspring-damping-ratios.mp4 \"A video with the node turned on showcasing different damping ratios for the spring force.\"\nanimtree.webp \"An image illustrating different atomic animations which are combined via the tree to produce a pose.\"\nanimtree-graph.webp \"A graph illustrating the messiness of the player animtree, which has around 44,000 nodes.\"\n"
  },
  "ahn-chill-room": {
    "text": "Chill Room: Pocket Edition is a mobile app for iOS and Android built in partnership with Allegheny Health Network’s Chill Project. The mission of the project is to equip middle school students with the tools they need to navigate their emotions and strengthen their ability to identify, discuss, and react to stress with resilience.\n\nOver Summer 2025 I worked at Carnegie Mellon's Center for Transformational Play as a developer for this project. Notable features I worked on include:\n- A tool to generate Unity assets for villagers and associated villager-player dialogue interactions from a designer-facing spreadsheet.\n- A resource accumulation and upgrade system which enabled offline resource generation and progressive economy scaling.\n- A rhythm-based minigame with synchronous visuals and input processing.\n\n[Read more about the project here](https://www.cmu.edu/ctp/projects/ahn_chill_room.html) ",
    "media": "thumbnail.webp\nhttps://www.cmu.edu/ctp/projects/chill_room_trailer.mp4\n"
  },
  "fence-collages": {
    "text": "",
    "media": "3-downsample.jpg\n3-sort.jpg\n"
  }
};
