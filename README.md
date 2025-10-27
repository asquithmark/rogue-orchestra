# the rogue orchestra · local player

A local-first, Apple iOS "liquid glass" inspired music player built with React, Vite, and Tailwind CSS. Everything runs directly in the browser with your own audio files—no accounts, analytics, or network calls.

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```
   Open the printed local URL in your browser. The site automatically reloads when you change code.

3. **Build for production**
   ```bash
   npm run build
   ```
   The optimised files are emitted to `dist/`. Preview the build with:
   ```bash
   npm run preview
   ```

## Add your music

- Place audio files in `public/audio/` and artwork images in `public/artwork/`.
- Update `src/data/tracks.js` with the correct filenames, artwork paths, song titles, and credits. The placeholders are intentionally generic so you can supply the real information.
- The first entry in `tracks.js` is used for the album hero artwork.

## Customise the background tint

`src/utils/colorFromArtwork.js` currently returns a high-quality fallback gradient. When you are ready, replace the placeholder logic with a real dominant-colour extractor (for example, use an offscreen canvas to average pixels) and update the returned gradient or base colour.

## How playback works

- Audio playback is handled by the browser’s `<audio>` element inside `PlayerContext`.
- When a track plays, the Media Session API updates the system metadata so iOS lock screen and Control Centre controls show the right information and artwork.
- Playback continues as you navigate between the album page (`/`) and the full player view (`/track/:id`).

## Privacy and offline use

This project contains **no** analytics, tracking scripts, external fonts, or remote API calls. All audio files stay on your device and are served locally by Vite during development or any static file server in production.
