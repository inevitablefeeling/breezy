# Breezy

A free, iPhone-first photography PWA prototype.

## Files
- `index.html` — app structure
- `styles.css` — responsive interface and motion
- `app.js` — camera, grid, zoom, capture and save interactions
- `manifest.json` — installable web app metadata
- `service-worker.js` — offline app shell
- `icons/breezy.svg` — app icon

## Run locally
Use a local web server rather than opening `index.html` as a file. Camera access requires a secure context: HTTPS or localhost.

## Publish with GitHub Pages
1. Upload all files and folders in this ZIP to the root of a public GitHub repository.
2. Open repository **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch `main` and folder `/ (root)`, then save.
5. Wait for the published Pages URL, then open it in Safari.
6. Allow camera access. To install, use Safari's Share menu → Add to Home Screen.

## Current prototype
Implemented: camera preview, front/back camera switching, simple digital preview zoom, rule-of-thirds grid, photo capture, save/download, responsive controls, animations, and an offline app shell.

Not implemented yet: AI scene analysis/composition recommendations, portrait segmentation, advanced optical camera controls, film looks, and a full photo editor. The visible non-PHOTO modes are placeholders for later development.

## Privacy
The prototype requests camera access only after the user taps **Open camera**. Video is displayed in the browser and is not uploaded to a server. Captured photos remain in the page until the page is closed; saving downloads the image to the device.
