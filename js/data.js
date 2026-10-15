/* ==========================================================================
   DATA.JS — edit this file only. Everything on the site is rendered from it.
   Video: drop MP4 files in assets/video/ and match the filenames below.
   Until a file exists, the card shows a live animated placeholder.
   ========================================================================== */
window.SITE = {
  email: "hello@meicostudio.com",
  socials: [                              // empty url = hidden
    { label: "Instagram", url: "" },
    { label: "Vimeo",     url: "" },
    { label: "YouTube",   url: "" },
    { label: "GitHub",    url: "" }
  ],

  lede: "Independent creative studio building distinctive identities, digital experiences and motion that moves people.",
  subtitle: "Identity, digital & motion",

  about: {
    title: "We build brands and digital experiences with feeling, clarity and a little bit of magic.",
    text: [
      "Meico Studio is an independent creative studio partnering with ambitious people to make meaningful brands, thoughtful digital products and motion-led stories. We bring strategy and craft together to create work that feels distinct and works beautifully.",
      "From first thought to final frame, we build with curiosity, care and an eye for the details that make an idea unmistakably yours."
    ],
    lists: [
      { h: "Disciplines", items: ["Brand identity", "Digital experiences", "Art direction & design", "Motion & film"] },
      { h: "Approach", items: ["Creative direction", "Design systems", "Web development", "Motion design"] },
      { h: "Partnership", items: ["Strategy & identity", "Digital & web", "Motion & film", "Ongoing collaboration"] }
    ]
  },

  // cats: filter tabs are generated from these. art: placeholder shown until video exists.
  // Optional: embed: "https://player.vimeo.com/video/XXXX" (opens in the viewer instead of src)
  projects: [
    {
      id: "odometer-counter", color: "#E4572E", title: "Odometer Counter",
      sub: "A CSS-animated SVG odometer converted into an After Effects motion graphics template by a Python-to-JSX pipeline.",
      tools: "SVG / Python / ExtendScript", cats: ["After Effects", "Pipeline"],
      src: "assets/video/odometer-counter.mp4", poster: "", art: "odometer"
    },
    {
      id: "icon-set", color: "#22303a", title: "Three-Phase Icon Set",
      sub: "Eight animated icons — cart, bag, tag, bell, document, knight, monitor, megaphone — in white, dark and alpha phases. 18 seconds, 4K.",
      tools: "SVG / After Effects / JSX", cats: ["SVG", "After Effects"],
      src: "assets/video/icon-set.mp4", poster: "", art: "icons"
    },
    {
      id: "shield-gear", color: "#4b5e50", title: "Shield & Gear",
      sub: "A six-second pure CSS loop. The gear stays whole and moves as one piece.",
      tools: "SVG / CSS", cats: ["SVG"],
      src: "assets/video/shield-gear.mp4", poster: "", art: "gear"
    },
    {
      id: "shield-bolt", color: "#1b1b1d", title: "Shield & Bolt",
      sub: "A cut-out bolt animated across three six-second phases, with an expression-driven After Effects rig.",
      tools: "SVG / After Effects / Expressions", cats: ["SVG", "After Effects"],
      src: "assets/video/shield-bolt.mp4", poster: "", art: "bolt"
    },
    {
      id: "code-window", color: "#8a6a55", title: "Code Window",
      sub: "Looping CSS motion: staggered pops, a wobble, then retract and retype in a second sequence.",
      tools: "SVG / CSS", cats: ["SVG"],
      src: "assets/video/code-window.mp4", poster: "", art: "code"
    },
    {
      id: "tech-connect", color: "#2b4a6b", title: "Tech Connect",
      sub: "Nodes and traces animated as a connected system, with a matching After Effects import script.",
      tools: "SVG / After Effects / JSX", cats: ["SVG", "After Effects"],
      src: "assets/video/tech-connect.mp4", poster: "", art: "nodes"
    },
    {
      id: "fan-illustrations", color: "#a63d40", title: "Fan Illustrations",
      sub: "Animated 16:9 sports fan characters sharing one motion system, each with its own jersey and flag.",
      tools: "SVG / CSS", cats: ["SVG", "Illustration"],
      src: "assets/video/fan-illustrations.mp4", poster: "", art: "fans"
    },
    {
      id: "svg-to-prores", color: "#3a3a46", title: "SVG to ProRes",
      sub: "A headless render pipeline that captures SVG animation as ProRes QuickTime files for stock footage submission.",
      tools: "Node / Puppeteer / ffmpeg", cats: ["Pipeline"],
      src: "assets/video/svg-to-prores.mp4", poster: "", art: "bars"
    }
  ]
};
