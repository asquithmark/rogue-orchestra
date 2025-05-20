const assert = require('assert');
const fs = require('fs');
const path = require('path');

const songsPath = path.join(__dirname, '..', 'songs.json');
const songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));

songs.forEach(song => {
  const filePath = path.join(__dirname, '..', 'assets', song.audioFile);
  assert.ok(fs.existsSync(filePath), `Missing audio file: ${song.audioFile}`);
});

console.log('All audio files exist.');
