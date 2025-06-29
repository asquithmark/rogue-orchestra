// song/script-song.js - Final Polished Version v5

import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Supabase credentials not found.");
}
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- DOM Elements ---
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
const eqButtons = document.querySelectorAll('.eq-btn');

// --- Web Audio API Setup ---
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioSource; 
let gainNode; 
let eqNodes = {}; 
let currentBuffer; 
let startTime = 0; 
let pausedAt = 0; 
let isPlaying = false;
let animationFrameId; // To control the progress bar animation loop
const FADE_TIME = 1.5;

// --- App State ---
let songs = [];
let currentSongIndex = -1;

// --- EQ PRESETS ---
const EQ_PRESETS = {
  'standard': [],
  'bass-boost': [
    { frequency: 100, gain: 7, type: 'lowshelf' },
    { frequency: 600, gain: -1, type: 'peaking' }
  ],
  'classical': [
    { frequency: 200, gain: -6, type: 'lowshelf' },
    { frequency: 5000, gain: -3, type: 'peaking' },
    { frequency: 10000, gain: 4, type: 'highshelf' }
  ],
  'small-speakers': [
      { frequency: 120, gain: -6, type: 'highpass' },
      { frequency: 3000, gain: 3, type: 'peaking' },
  ]
};
let activeEQ = 'standard';


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
    stopPlayback(); // Stop any currently playing track before loading a new one
    const song = songs.find(s => s.id === songId);
    if (!song) {
        console.error(`Song with ID ${songId} not found.`);
        songTitleEl.textContent = 'Track not found';
        songDescriptionEl.innerHTML = `We couldn't find this track. <br/><a href="../index.html" style="color: var(--accent-color);">Return to album tracklist.</a>`;
        document.querySelector('.progress-container').style.display = 'none';
        document.querySelector('.controls').style.display = 'none';
        return;
    }

    currentSongIndex = songs.findIndex(s => s.id === songId);
    document.title = song.title;
    songTitleEl.textContent = song.title;
    songDescriptionEl.innerHTML = song.description;
    songContainer.dataset.songId = song.id;
    refreshScore(song.id);

    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: 'the rogue orchestra',
            album: 'The Rogue Orchestra',
            artwork: [{ src: '../assets/album.gif', type: 'image/gif' }],
        });
    }
    
    try {
        const response = await fetch(`../assets/${song.audioFile}`);
        const arrayBuffer = await response.arrayBuffer();
        audioContext.decodeAudioData(arrayBuffer, (buffer) => {
            currentBuffer = buffer;
            durationEl.textContent = formatTime(buffer.duration);
            progressBar.value = 0;
            currentTimeEl.textContent = '0:00';
            if (playOnLoad) {
                playSong();
            }
        });
    } catch(error) {
        console.error('Error loading or decoding audio file:', error);
    }
}

function setupAudioNodes() {
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = currentBuffer;
    
    gainNode = audioContext.createGain();
    
    const rms = getRMS(currentBuffer.getChannelData(0));
    const targetRMS = 0.1; 
    const gainValue = targetRMS / rms;
    gainNode.gain.value = Math.min(gainValue, 1.5); 

    let lastNode = gainNode;
    eqNodes = {};
    EQ_PRESETS[activeEQ].forEach((setting, i) => {
        const filter = audioContext.createBiquadFilter();
        filter.type = setting.type;
        filter.frequency.value = setting.frequency;
        filter.gain.value = setting.gain;
        lastNode.connect(filter);
        lastNode = filter;
        eqNodes[i] = filter;
    });

    audioSource.connect(lastNode);
    lastNode.connect(audioContext.destination);

    // Set the onended handler that will advance the track
    audioSource.onended = () => {
      // This will now only fire when the track finishes naturally
      // because we disconnect it before any manual stop.
      if (isPlaying) {
        isPlaying = false;
        changeSong(1, true);
      }
    };
}

function playSong() {
  if (isPlaying || !currentBuffer) return;
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  setupAudioNodes();
  
  startTime = audioContext.currentTime - pausedAt;
  audioSource.start(0, pausedAt);
  isPlaying = true;

  playPauseBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = "playing";
  updateProgress();
}

// A new, robust function to handle all cases of stopping audio
function stopPlayback(isPausing = false) {
    if (!isPlaying) return;
    
    if (isPausing) {
        pausedAt = audioContext.currentTime - startTime;
    }
    
    // THE CRITICAL FIX: Explicitly remove the onended handler
    // to prevent it from firing after a manual stop.
    if (audioSource) {
      audioSource.onended = null;
      audioSource.stop(0);
      audioSource = null;
    }

    isPlaying = false;
    cancelAnimationFrame(animationFrameId);
    playPauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = "paused";
}


function changeSong(direction, autoPlay = true) {
    if (!songs.length) return;

    if (isPlaying) {
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + FADE_TIME);
        setTimeout(() => {
          stopPlayback();
        }, FADE_TIME * 1000);
    }
    
    currentSongIndex = (currentSongIndex + direction + songs.length) % songs.length;
    const nextSongId = songs[currentSongIndex].id;
    const url = new URL(window.location);
    url.searchParams.set('id', nextSongId);
    window.history.pushState({}, '', url);

    pausedAt = 0;
    
    loadSong(nextSongId, autoPlay);
}

function updateProgress() {
    if (!isPlaying || !currentBuffer) return;
    
    const currentTime = pausedAt + (audioContext.currentTime - startTime);
    const duration = currentBuffer.duration;
    
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

async function submitVote(songId, vote) {
  const { error } = await supabase.from('votes').insert({ song_id: songId, vote });
  if (error) { 
      console.error('Insert error:', error);
  } else {
      refreshScore(songId);
  }
}

async function refreshScore(songId) {
  const scoreSpan = document.querySelector('.voting .track-score');
  if (!scoreSpan) return;

  try {
    const { count: ups } = await supabase.from('votes').select('*', { head: true, count: 'exact' }).eq('song_id', songId).eq('vote', 'up');
    const { count: downs } = await supabase.from('votes').select('*', { head: true, count: 'exact' }).eq('song_id', songId).eq('vote', 'down');
    scoreSpan.textContent = (ups || 0) - (downs || 0);
  } catch (error) {
      console.error('Error fetching score:', error);
      scoreSpan.textContent = '-';
  }
}

function getRMS(data) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => {
    // Popup logic
    const popup = document.getElementById('introPopup');
    const continueBtn = document.getElementById('continueToSongBtn');

    if (popup && continueBtn) {
        if (!localStorage.getItem('hasSeenIntroPopup')) {
            popup.style.display = 'flex';
        }
        continueBtn.addEventListener('click', () => {
            popup.style.display = 'none';
            localStorage.setItem('hasSeenIntroPopup', 'true');
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
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

    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            stopPlayback(true); // Call stop with 'isPausing' flag
        } else {
            playSong();
        }
    });

    prevBtn.addEventListener('click', () => changeSong(-1));
    nextBtn.addEventListener('click', () => changeSong(1));
    
    progressBar.addEventListener('input', (e) => {
        if (!currentBuffer) return;
        
        const wasPlaying = isPlaying;
        if(wasPlaying) {
            stopPlayback(false);
        }

        const newTime = (e.target.value / 100) * currentBuffer.duration;
        pausedAt = newTime;
        currentTimeEl.textContent = formatTime(newTime);
        
        if (wasPlaying) {
            playSong();
        }
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

    eqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            activeEQ = btn.dataset.eq;
            eqButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (isPlaying) {
                const wasPlaying = isPlaying;
                stopPlayback(true);
                if(wasPlaying){
                    playSong();
                }
            }
        });
    });
    
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => playSong());
        navigator.mediaSession.setActionHandler('pause', () => stopPlayback(true));
        navigator.mediaSession.setActionHandler('previoustrack', () => changeSong(-1));
        navigator.mediaSession.setActionHandler('nexttrack', () => changeSong(1));
    }
});
