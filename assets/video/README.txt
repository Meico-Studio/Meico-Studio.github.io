Drop one MP4 per project here; filenames must match js/data.js.

Web-ready loop (H.264, silent, 1280 wide, BT.709):
ffmpeg -i input.mov -vf "scale=1280:-2" -an -c:v libx264 -crf 22 -preset slow \
  -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -movflags +faststart assets/video/NAME.mp4

Optional poster frame (shown before the video loads, and for reduced-motion visitors):
ffmpeg -i input.mov -vf "scale=1280:-2" -frames:v 1 assets/poster/NAME.jpg
then set poster: "assets/poster/NAME.jpg" in js/data.js.

Keep previews under ~3 MB each. Alpha phases don't work in MP4; use the white or dark phase.
