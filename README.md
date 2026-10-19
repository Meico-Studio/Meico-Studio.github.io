# Meico Studio portfolio

A responsive, dependency-free portfolio based on the supplied Squarespace reference. Open `index.html` directly or serve this folder with any static web server.

## Update the portfolio

Edit `projects.js` to change project titles, categories, descriptions, poster paths, and video paths. Project categories generate the work filters automatically. The 22 project videos are bundled locally under `assets/videos/`; each is 960×540 (16:9). Widescreen posters are extracted from the clips at 4.75 seconds, and six-second, silent 60 fps hover previews are stored in `assets/previews/` and warmed only as projects approach the viewport.

The layout uses a spacious desktop header, a three-column 16:9 gallery, centered titles, and a compact centered footer. The gallery stays three columns through tablet widths and switches to one column on phones. The mobile navigation opens as a translucent full-screen menu. Project tiles play muted previews on hover-capable devices; selecting a tile or title opens the full-resolution video in the player.

The player hides its native download and picture-in-picture controls and blocks context-menu saving as a casual deterrent. This static site cannot prevent visitors from retrieving public video files through browser developer tools; real access control requires authenticated hosting and DRM streaming.

The Contact navigation scrolls to the footer, where visitors can select `info.meicostudio@gmail.com` to compose an email.
