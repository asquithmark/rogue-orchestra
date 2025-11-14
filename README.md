# Rogue Orchestra · simple player

A lightweight music player built with React, Vite, and Tailwind CSS. It shows a list of your songs and lets you play them with the browser's built-in audio controls—no routing, themes, or advanced playback features.

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

- Place audio files in `public/audio/`.
- Update `src/data/tracks.js` with the correct filenames, artwork paths, song titles, and credits. You can leave `credits` blank if you do not need to display them.
- The first entry in `tracks.js` is loaded by default when the page opens.

## How playback works

- The player uses a single `<audio>` element. When you click "Play" next to any track it updates the source and starts playback.
- The browser provides the playback controls (play/pause, scrubber, and volume), so there is no custom UI to maintain.

## Privacy and offline use

This project contains **no** analytics, tracking scripts, external fonts, or remote API calls. All audio files stay on your device and are served locally by Vite during development or any static file server in production.
