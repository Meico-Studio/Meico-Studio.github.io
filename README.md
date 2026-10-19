# Meico Studio portfolio

A responsive, dependency-free portfolio based on the supplied Squarespace reference. Open `index.html` directly or serve this folder with any static web server.

## Update the portfolio

Edit `projects.js` to change project titles, categories, descriptions, poster paths, and video paths. Project categories generate the work filters automatically. The portfolio includes 22 960×540 MP4 projects under `assets/videos/`. MP4 posters are extracted at 4.75 seconds. Six-second, silent 60 fps hover previews are warmed only as projects approach the viewport. Run `node generate-project-pages.mjs` after changing projects to refresh each clean `/projects/<slug>/` share page and its project-specific Open Graph/Twitter metadata.

The site includes a selected-work gallery, capabilities, handoff formats, a four-step process, and contact section. The portfolio uses a spacious desktop header and three-column 16:9 gallery, with responsive navigation and layout on phones. Project tiles play muted previews on hover-capable devices; selecting a tile or title opens the video and shows the format included in that project. The project dialog can email the project’s share URL, whose static page carries that project’s poster image, title, and description as link-preview metadata.

Animated SVG, After Effects projects, Lottie JSON, and editable sources are listed as request-per-project formats; they are not included with the public previews. The player hides its native download and picture-in-picture controls and blocks context-menu saving as a casual deterrent. Static hosting cannot prevent visitors from retrieving public video assets through browser developer tools; real access control requires authenticated hosting and suitable media protection.

The Contact navigation scrolls to the footer, where visitors can select `info.meicostudio@gmail.com` to compose an email.
