# Rogue Orchestra

## Configuration

Copy `config.example.js` to `config.js` and replace the placeholder values with your own Supabase project credentials. The site expects `config.js` to define `SUPABASE_URL` and `SUPABASE_KEY` constants used by the client scripts.

## Running tests

1. Ensure Node.js is installed.
2. From the repository root run:

```bash
npm test
```

This executes a simple Node script that loads `songs.json` and confirms that every `audioFile` listed exists in the `assets/` directory.
