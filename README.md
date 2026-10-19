# Meico Studio portfolio

A responsive, dependency-free portfolio based on the supplied Squarespace reference. Open `index.html` directly or serve this folder with any static web server.

## Update the portfolio

Edit `projects.js` to change project titles, categories, descriptions, poster paths, and video paths. Project categories generate the work filters automatically. The portfolio includes 22 960×540 MP4 projects under `assets/videos/` and three animated PDF icons under `assets/animations/`. MP4 posters are extracted at 4.75 seconds; the SVG posters are frozen at the same point in their animation loop. Six-second, silent 60 fps hover previews for the MP4s are warmed only as projects approach the viewport, while the SVG icons play their native vector animation on hover.

The layout uses a spacious desktop header, a three-column 16:9 gallery, centered titles, and a compact centered footer. The gallery stays three columns through tablet widths and switches to one column on phones. The mobile navigation opens as a translucent full-screen menu. Project tiles play muted previews on hover-capable devices; selecting a tile or title opens the full-resolution video or animated SVG in the player.

The player hides its native download and picture-in-picture controls and blocks context-menu saving as a casual deterrent. This static site cannot prevent visitors from retrieving public video files through browser developer tools; real access control requires authenticated hosting and DRM streaming.

The Contact navigation scrolls to the footer, where visitors can select `info.meicostudio@gmail.com` to compose an email.
