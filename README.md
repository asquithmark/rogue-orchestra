# Rogue Orchestra

## Configuration

The GitHub Pages workflow automatically generates `config.js` using the
`SUPABASE_URL` and `SUPABASE_KEY` secrets stored in the repository. During
deployment these values are written to `config.js` so the site has access to the
necessary credentials without committing them to source control.

For local development you can still create `config.js` manually. Copy
`config.example.js` to `config.js` and fill in your own Supabase URL and key.

## Running tests

1. Ensure Node.js is installed.
2. From the repository root run:

```bash
npm test
```

This executes a simple Node script that loads `songs.json` and confirms that every `audioFile` listed exists in the `assets/` directory.
