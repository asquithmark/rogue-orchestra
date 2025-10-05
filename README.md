# Rogue Orchestra

## Offline-first experience

This project now ships as a streamlined, offline-first player. All track details
and audio files are bundled with the site, so the music library and playback
controls work entirely in the browser without needing any external services or
an internet connection once the assets are cached. Open `index.html` to browse
the album, then jump into any song page for rich descriptions, player controls,
and the optional immersive listening prompt.

Because the interface runs purely on static files, you can host it anywhere that
can serve HTML—GitHub Pages, Netlify, or even your local file system.

## Running tests

1. Ensure Node.js is installed.
2. From the repository root run:

```bash
npm test
```

This executes a simple Node script that loads `songs.json` and confirms that
every `audioFile` listed exists in the `assets/` directory.
