# BREEZY

An iPhone-first camera PWA prototype. Serve over HTTPS (for example GitHub Pages) to use camera access.

## Included
- Live camera preview, front/rear camera switching, front-camera mirror preference
- Digital zoom preview and matching center crop on capture
- Photo, portrait-framing, and square-crop modes (portrait mode is framing only, not computational depth blur)
- Local photo adjustments: looks, brightness, contrast, saturation, grain, vignette, date stamp, frames
- Suggestion email link to solanaachil@gmail.com
- Versioned service-worker shell cache

## Limitations
- This build does not yet include the requested AI composition model or automatic AI zoom. It does not label heuristics as AI.
- Zoom is digital crop, not optical zoom; supported devices/browser APIs vary.
- Portrait mode currently means a portrait-oriented framing mode; it does not create depth-aware background blur.
- On iOS, browser download behavior varies. Use the share/save flow offered by Safari if prompted.
- Real-device camera, PWA installation, and Photos saving still need testing on an iPhone.
