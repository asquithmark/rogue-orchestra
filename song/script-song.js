// song/script-song.js - Offline-first player logic

const songContainer = document.getElementById('song-container');
const songTitleEl = document.getElementById('songTitle');
const songDescriptionEl = document.getElementById('songDescription');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const toggleDescription = document.getElementById('toggleDescription');
const audioEl = document.getElementById('audioPlayer');
let isPlaying = false;
let animationFrameId;

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

async function loadSong(songId, playOnLoad = false) {
  stopPlayback();
  const song = songs.find((s) => s.id === songId);
  if (!song) {
    console.error(`Song with ID ${songId} not found.`);
    songTitleEl.textContent = 'Track not found';
    songDescriptionEl.innerHTML = `We couldn't find this track. <br/><a href="../index.html" style="color: var(--accent-color);">Return to album tracklist.</a>`;
    document.querySelector('.progress-container').style.display = 'none';
    document.querySelector('.controls').style.display = 'none';
    return;
  }

  currentSongIndex = songs.findIndex((s) => s.id === songId);
  document.title = song.title;
  songTitleEl.textContent = song.title;
  songDescriptionEl.innerHTML = song.description;
  songContainer.dataset.songId = song.id;

  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: 'the rogue orchestra',
      album: 'The Rogue Orchestra',
      artwork: [{ src: '../assets/album.gif', type: 'image/gif' }],
    });
  }

  try {
    audioEl.src = `../assets/${song.audioFile}`;
    audioEl.load();
    audioEl.onloadedmetadata = () => {
      durationEl.textContent = formatTime(audioEl.duration);
      progressBar.value = 0;
      currentTimeEl.textContent = '0:00';
      if (playOnLoad) {
        playSong();
      }
    };
    audioEl.onended = () => changeSong(1, true);
  } catch (error) {
    console.error('Error loading audio file:', error);
  }
}

function playSong() {
  if (isPlaying) return;

  audioEl
    .play()
    .then(() => {
      isPlaying = true;
      playPauseBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      updateProgress();
    })
    .catch(() => {
      isPlaying = false;
      playPauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    });
}

function stopPlayback(isPausing = false) {
  if (!isPlaying) return;

  audioEl.onended = null;
  if (!isPausing) {
    audioEl.currentTime = 0;
  }
  audioEl.pause();

  isPlaying = false;
  cancelAnimationFrame(animationFrameId);
  playPauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
}

function changeSong(direction, autoPlay = true) {
  if (!songs.length) return;

  if (isPlaying) {
    stopPlayback();
  }

  currentSongIndex = (currentSongIndex + direction + songs.length) % songs.length;
  const nextSongId = songs[currentSongIndex].id;
  const url = new URL(window.location);
  url.searchParams.set('id', nextSongId);
  window.history.pushState({}, '', url);

  loadSong(nextSongId, autoPlay);
}

function updateProgress() {
  if (!isPlaying || isNaN(audioEl.duration)) return;

  const currentTime = audioEl.currentTime;
  const duration = audioEl.duration;

  if (currentTime <= duration) {
    progressBar.value = (currentTime / duration) * 100;
    currentTimeEl.textContent = formatTime(currentTime);
  } else {
    progressBar.value = 100;
    currentTimeEl.textContent = formatTime(duration);
  }

  animationFrameId = requestAnimationFrame(updateProgress);
}

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const popup = document.getElementById('introPopup');
  const continueBtn = document.getElementById('continueToSongBtn');

  if (popup && continueBtn) {
    if (!localStorage.getItem('hasSeenIntroPopup')) {
      popup.style.display = 'flex';
    }
    continueBtn.addEventListener('click', () => {
      popup.style.display = 'none';
      localStorage.setItem('hasSeenIntroPopup', 'true');
      if (isPlaying && audioEl.paused) {
        audioEl.play().catch(() => {});
      }
    });
  }

  await loadSongs();
  const urlParams = new URLSearchParams(window.location.search);
  const songIdParam = parseInt(urlParams.get('id'), 10);

  if (!isNaN(songIdParam)) {
    loadSong(songIdParam, true);
  } else if (songs.length) {
    loadSong(songs[0].id, true);
  } else {
    songTitleEl.textContent = 'No track selected.';
  }

  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      stopPlayback(true);
    } else {
      playSong();
    }
  });

  prevBtn.addEventListener('click', () => changeSong(-1));
  nextBtn.addEventListener('click', () => changeSong(1));

  progressBar.addEventListener('input', (e) => {
    const newTime = (e.target.value / 100) * (audioEl.duration || 0);
    audioEl.currentTime = newTime;
    currentTimeEl.textContent = formatTime(newTime);
  });

  toggleDescription.addEventListener('click', () => {
    songDescriptionEl.classList.toggle('collapsed');
    toggleDescription.textContent = songDescriptionEl.classList.contains('collapsed') ? 'show more' : 'show less';
  });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => playSong());
    navigator.mediaSession.setActionHandler('pause', () => stopPlayback(true));
    navigator.mediaSession.setActionHandler('previoustrack', () => changeSong(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => changeSong(1));
  }
});
