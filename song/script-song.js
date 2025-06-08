// song/script-song.js

import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- DOM ELEMENTS ---
const songContainer = document.getElementById('song-container');
const songTitleEl = document.getElementById('songTitle');
const songDescriptionEl = document.getElementById('songDescription');
const albumArtEl = document.getElementById('albumArt');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const toggleDescription = document.getElementById('toggleDescription');
const backLink = document.getElementById('backLink');

let songs = [];
let currentSongIndex = -1;

// --- FUNCTIONS ---

// Load all songs from the JSON file
async function loadSongs() {
  try {
    const res = await fetch('../songs.json');
    if (!res.ok) throw new Error('Failed to fetch songs.json');
    songs = await res.json();
  } catch (error) {
    console.error(error);
  }
}

// Load a specific song by its ID and set up the player
function loadSong(songId) {
  const song = songs.find(s => s.id === songId);
  if (!song) {
    console.error(`Song with ID ${songId} not found.`);
    songTitleEl.textContent = 'Track not found';
    return;
  }

  currentSongIndex = songs.findIndex(s => s.id === songId);

  // Update page content
  document.title = song.title;
  songTitleEl.textContent = song.title;
  songDescriptionEl.innerHTML = song.description;
  audioPlayer.src = `../assets/${song.audioFile}`;
  
  // Set the data-song-id on the container for the voting logic
  songContainer.dataset.songId = song.id;

  // Set the data-song-id on the voting buttons dynamically
  document.querySelectorAll('.vote').forEach(btn => {
    btn.dataset.songId = song.id;
  });

  // Refresh the score for the new song
  refreshScore(song.id);
}

// Play the current song
function playSong() {
  audioPlayer.play();
  playPauseBtn.querySelector('i').classList.remove('fa-play');
  playPauseBtn.querySelector('i').classList.add('fa-pause');
}

// Pause the current song
function pauseSong() {
  audioPlayer.pause();
  playPauseBtn.querySelector('i').classList.remove('fa-pause');
  playPauseBtn.querySelector('i').classList.add('fa-play');
}

// Update progress bar and time display
function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progressBar.value = progressPercent;

  // Update time displays
  durationEl.textContent = formatTime(duration);
  currentTimeEl.textContent = formatTime(currentTime);
}

// Format time from seconds to MM:SS
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

// Set progress bar when user seeks
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audioPlayer.duration;
  audioPlayer.currentTime = (clickX / width) * duration;
}

// Go to the previous or next song
function changeSong(direction) {
  currentSongIndex = (currentSongIndex + direction + songs.length) % songs.length;
  const nextSongId = songs[currentSongIndex].id;
  // Update the URL and load the new song
  const url = new URL(window.location);
  url.searchParams.set('id', nextSongId);
  window.history.pushState({}, '', url);
  loadSong(nextSongId);
  playSong();
}

// Submit a vote ('up' or 'down') for a song
async function submitVote(songId, vote) {
  const { error } = await supabase
    .from('votes')
    .insert({ song_id: songId, vote });
  if (error) {
    console.error('Insert error:', error);
    return;
  }
  await refreshScore(songId);
}

// Fetch and display the current score for a song
async function refreshScore(songId) {
  const { count: ups, error: errUp } = await supabase
    .from('votes')
    .select('*', { head: true, count: 'exact' })
    .eq('song_id', songId)
    .eq('vote', 'up');
  if (errUp) console.error('Error fetching up-votes:', errUp);

  const { count: downs, error: errDown } = await supabase
    .from('votes')
    .select('*', { head: true, count: 'exact' })
    .eq('song_id', songId)
    .eq('vote', 'down');
  if (errDown) console.error('Error fetching down-votes:', errDown);

  const scoreSpan = document.querySelector('[data-score]');
  if (scoreSpan) {
    scoreSpan.textContent = (ups || 0) - (downs || 0);
  }
}

// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', async () => {
  // Load all song data first
  await loadSongs();

  // Get song ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const songId = parseInt(urlParams.get('id'));

  if (songId && !isNaN(songId)) {
    loadSong(songId);
  } else {
    console.error('No valid song ID found in URL.');
    songTitleEl.textContent = 'No track selected.';
  }

  // --- EVENT LISTENERS ---

  playPauseBtn.addEventListener('click', () => {
    const isPlaying = !audioPlayer.paused;
    isPlaying ? pauseSong() : playSong();
  });

  prevBtn.addEventListener('click', () => changeSong(-1));
  nextBtn.addEventListener('click', () => changeSong(1));

  audioPlayer.addEventListener('timeupdate', updateProgress);
  audioPlayer.addEventListener('ended', () => changeSong(1));
  progressBar.addEventListener('input', (e) => {
    audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration;
  });

  toggleDescription.addEventListener('click', () => {
    songDescriptionEl.classList.toggle('collapsed');
    const isCollapsed = songDescriptionEl.classList.contains('collapsed');
    toggleDescription.textContent = isCollapsed ? 'show more' : 'show less';
  });

  document.querySelectorAll('.vote').forEach((btn) => {
    btn.addEventListener('click', () => {
      const songId = parseInt(songContainer.dataset.songId, 10);
      const voteType = btn.dataset.vote;
      if (!isNaN(songId)) {
        submitVote(songId, voteType);
      }
    });
  });
});
