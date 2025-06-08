// song/script-song.js - Final Polished Version

import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Supabase credentials not found.");
}
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
  document.querySelectorAll('.vote').forEach(btn => btn.dataset.songId = song.id);
  refreshScore(song.id);

  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: 'the rogue orchestra',
      album: 'The Rogue Orchestra',
      artwork: [
        { src: '../assets/album-art-512.png', sizes: '512x512', type: 'image/png' },
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
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = "playing";
}

function pauseSong() {
  audioPlayer.pause();
  playPauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = "paused";
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
  const { duration, currentTime } = e.srcElement;
  if(duration) {
    const progressPercent = (currentTime / duration) * 100;
    progressBar.value = progressPercent;
    durationEl.textContent = formatTime(duration);
  }
  currentTimeEl.textContent = formatTime(currentTime);
}

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

async function submitVote(songId, vote) {
  const { error } = await supabase.from('votes').insert({ song_id: songId, vote });
  if (error) console.error('Insert error:', error);
  else refreshScore(songId);
}

async function refreshScore(songId) {
  const { count: ups } = await supabase.from('votes').select('*', { head: true, count: 'exact' }).eq('song_id', songId).eq('vote', 'up');
  const { count: downs } = await supabase.from('votes').select('*', { head: true, count: 'exact' }).eq('song_id', songId).eq('vote', 'down');
  const scoreSpan = document.querySelector('.track-score[data-score]');
  if (scoreSpan) scoreSpan.textContent = (ups || 0) - (downs || 0);
}

document.addEventListener('DOMContentLoaded', async () => {
  const popup = document.getElementById('introPopup');
  const continueBtn = document.getElementById('continueToSongBtn');

  if (popup && continueBtn) {
      if (!localStorage.getItem('hasSeenIntroPopup')) {
          popup.style.display = 'flex';
          localStorage.setItem('hasSeenIntroPopup', 'true');
      }
      continueBtn.addEventListener('click', () => {
          popup.style.display = 'none';
      });
  }

  await loadSongs();
  const urlParams = new URLSearchParams(window.location.search);
  const songId = parseInt(urlParams.get('id'), 10);

  if (songId && !isNaN(songId)) loadSong(songId);
  else songTitleEl.textContent = 'No track selected.';

  playPauseBtn.addEventListener('click', () => {
    audioPlayer.paused ? playSong() : pauseSong();
  });
  prevBtn.addEventListener('click', () => changeSong(-1));
  nextBtn.addEventListener('click', () => changeSong(1));
  audioPlayer.addEventListener('timeupdate', updateProgress);
  audioPlayer.addEventListener('loadedmetadata', updateProgress);
  audioPlayer.addEventListener('ended', () => changeSong(1));
  progressBar.addEventListener('input', (e) => {
    if (audioPlayer.duration) audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration;
  });
  toggleDescription.addEventListener('click', () => {
    songDescriptionEl.classList.toggle('collapsed');
    toggleDescription.textContent = songDescriptionEl.classList.contains('collapsed') ? 'show more' : 'show less';
  });
  document.querySelectorAll('.vote').forEach((btn) => {
    btn.addEventListener('click', () => {
      const songId = parseInt(btn.closest('.container').dataset.songId, 10);
      const voteType = btn.dataset.vote;
      if (!isNaN(songId)) submitVote(songId, voteType);
    });
  });
});
