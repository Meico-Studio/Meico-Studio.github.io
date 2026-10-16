# Meico Studio portfolio

A responsive, dependency-free portfolio based on the supplied Squarespace reference. Open `index.html` directly or serve this folder with any static web server.

## Update the portfolio

Edit `projects.js` to change project titles, descriptions, poster paths, and video paths. The six supplied MP4s and their poster stills are bundled locally in `assets/videos/` and `assets/posters/`. The original full videos, poster thumbnails, and lightweight hover previews are all clean and contain no added watermark; posters are stills from 4.75 seconds.

The layout follows the reference: a spacious desktop header, a three-column square gallery, centered titles, and a compact centered footer. The gallery stays three columns through tablet widths and switches to one column on phones. The mobile navigation opens as a translucent full-screen menu. Project tiles play muted previews on hover-capable devices; selecting a tile or title opens the full player.

The player hides its native download and picture-in-picture controls and blocks context-menu saving as a casual deterrent. This static site cannot prevent visitors from retrieving public video files through browser developer tools; real access control requires authenticated hosting and DRM streaming.

The current clips have white backgrounds; the thumbnail border helps define each tile against the white page.

The Contact navigation scrolls to the footer, where visitors can select `info.meicostudio@gmail.com` to compose an email.
