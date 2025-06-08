// song/script-song.js - Final Version with Media Session and Popup Logic

import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Supabase credentials not found.");
}
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- DOM ELEMENTS ---
const songContainer = document.getElementById('song-container');
const songTitleEl = document.getElementById('songTitle');
const songDescriptionEl = document.getElementById('songDescription');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const toggleDescription = document.getElementById('toggleDescription');

let songs = [];
let currentSongIndex = -1;

// --- FUNCTIONS ---

async function loadSongs() {
  try {
    const res = await fetch('../songs.json');
    if (!res.ok) throw new Error('Failed to fetch songs.json');
    songs = await res.json();
  } catch (error) {
    console.error(error);
  }
}

function loadSong(songId) {
  const song = songs.find(s => s.id === songId);
  if (!song) {
    console.error(`Song with ID ${songId} not found.`);
    songTitleEl.textContent = 'Track not found';
    return;
  }

  currentSongIndex = songs.findIndex(s => s.id === songId);
  document.title = song.title;
  songTitleEl.textContent = song.title;
  songDescriptionEl.innerHTML = song.description;
  audioPlayer.src = `../assets/${song.audioFile}`;
  
  songContainer.dataset.songId = song.id;
  refreshScore(song.id);

  // NEW: Media Session API for Lock Screen Controls
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: 'the rogue orchestra',
      album: 'The Rogue Orchestra',
      artwork: [
        // Using a static PNG for lock screen is required. 
        // Best to create a real 512x512 PNG version of your album art.
        { src: 'https://placehold.co/512x512/000000/4e6464?text=R.O.', sizes: '512x512', type: 'image/png' },
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => playSong());
    navigator.mediaSession.setActionHandler('pause', () => pauseSong());
    navigator.mediaSession.setActionHandler('previoustrack', () => changeSong(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => changeSong(1));
  }
}

function playSong() {
  audioPlayer.play();
  playPauseBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = "playing";
  }
}

function pauseSong() {
  audioPlayer.pause();
  playPauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = "paused";
  }
}

function changeSong(direction) {
  currentSongIndex = (currentSongIndex + direction + songs.length) % songs.length;
  const nextSongId = songs[currentSongIndex].id;
  const url = new URL(window.location);
  url.searchParams.set('id', nextSongId);
  window.history.pushState({}, '', url);
  loadSong(nextSongId);
  playSong();
}

function updateProgress(e) {
    //... (function remains the same)
}
function formatTime(seconds) {
    //... (function remains the same)
}
async function submitVote(songId, vote) {
    //... (function remains the same)
}
async function refreshScore(songId) {
    //... (function remains the same)
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
  // NEW: Popup Logic moved here
  const popup = document.getElementById('introPopup');
  const continueBtn = document.getElementById('continueToSongBtn');

  if (popup && continueBtn) {
      if (!localStorage.getItem('hasSeenIntroPopup')) {
          popup.style.display = 'flex';
          localStorage.setItem('hasSeenIntroPopup', 'true'); // Set flag immediately
      }

      continueBtn.addEventListener('click', () => {
          popup.style.display = 'none';
      });
  }

  await loadSongs();
  const urlParams = new URLSearchParams(window.location.search);
  const songId = parseInt(urlParams.get('id'), 10);

  if (songId && !isNaN(songId)) {
    loadSong(songId);
  } else {
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
  audioPlayer.addEventListener('loadedmetadata', updateProgress);
  audioPlayer.addEventListener('ended', () => changeSong(1));
  progressBar.addEventListener('input', (e) => {
    if (audioPlayer.duration) {
      audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration;
    }
  });

  toggleDescription.addEventListener('click', () => {
    songDescriptionEl.classList.toggle('collapsed');
    toggleDescription.textContent = songDescriptionEl.classList.contains('collapsed') ? 'show more' : 'show less';
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

// The functions updateProgress, formatTime, submitVote, and refreshScore are assumed to be here, unchanged from your working version. I'm omitting them for brevity.
