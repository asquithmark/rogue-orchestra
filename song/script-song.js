// song/script-song.js - Final Polished Version v5

// Attempt to load Supabase credentials dynamically. If config.js is missing or
// the credentials are invalid, voting/score features will be disabled but the
// rest of the page (audio playback, track info) will still work.
let supabase = null;
async function initSupabase() {
  try {
    const { SUPABASE_URL, SUPABASE_KEY } = await import('../config.js');
    if (SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('<')) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      return;
    }
    console.warn('Supabase credentials missing or invalid. Voting disabled.');
  } catch (err) {
    console.warn('config.js not found - votes disabled');
  }

  // If Supabase couldn't be initialized, disable voting UI and show placeholder
  // score so the rest of the page still functions.
  document.querySelectorAll('.track-score').forEach(el => (el.textContent = '-'));
  document.querySelectorAll('.vote').forEach(btn => (btn.disabled = true));
}

// --- DOM Elements ---
const songContainer = document.getElementById('song-container');
const songTitleEl = document.getElementById('songTitle');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const audioEl = document.getElementById('audioPlayer');
const feedbackHeader = document.querySelector('.feedback-header');
const votingSection = document.querySelector('.voting');
const controls = document.querySelector('.controls');
const progressContainer = document.querySelector('.progress-container');
const defaultFeedbackText = feedbackHeader ? feedbackHeader.textContent : '';
let isPlaying = false;
let animationFrameId; // To control the progress bar animation loop

// --- App State ---
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
    stopPlayback(); // Stop any currently playing track before loading a new one
    const song = songs.find(s => s.id === songId);
    if (!song) {
        console.error(`Song with ID ${songId} not found.`);
        songTitleEl.textContent = 'Track not found';
        document.title = 'Track not found';
        if (feedbackHeader) {
            feedbackHeader.innerHTML = `We couldn't find this track. <a href="../index.html" style="color: var(--accent-color);">Return to album tracklist.</a>`;
        }
        if (progressContainer) progressContainer.style.display = 'none';
        if (controls) controls.style.display = 'none';
        if (votingSection) votingSection.style.display = 'none';
        songContainer.dataset.songId = '';
        audioEl.removeAttribute('src');
        audioEl.load();
        return;
    }

    currentSongIndex = songs.findIndex(s => s.id === songId);
    document.title = song.title;
    songTitleEl.textContent = song.title;
    songContainer.dataset.songId = song.id;
    if (feedbackHeader) {
        feedbackHeader.textContent = defaultFeedbackText;
    }
    if (progressContainer) progressContainer.style.display = '';
    if (controls) controls.style.display = '';
    if (votingSection) votingSection.style.display = 'flex';
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
    } catch(error) {
        console.error('Error loading audio file:', error);
    }
}


function playSong() {
  if (isPlaying) return;

  audioEl.play()
    .then(() => {
      isPlaying = true;
      playPauseBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = "playing";
      updateProgress();
    })
    .catch(() => {
      isPlaying = false;
      playPauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
    });
}

// A new, robust function to handle all cases of stopping audio
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
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = "paused";
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

async function submitVote(songId, vote) {
  if (!supabase) return;
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
  if (!supabase) {
    scoreSpan.textContent = '-';
    return;
  }

  try {
    const { data, error } = await supabase
      .from('votes')
      .select('vote')
      .eq('song_id', songId);
    if (error) throw error;
    const ups = data.filter(v => v.vote === 'up').length;
    const downs = data.filter(v => v.vote === 'down').length;
    scoreSpan.textContent = ups - downs;
  } catch (error) {
    console.error('Error fetching score:', error);
    scoreSpan.textContent = '-';
  }
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
            if (isPlaying && audioEl.paused) {
                audioEl.play().catch(() => {});
            }
        });
    }

    await initSupabase();
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
            stopPlayback(true); // Call stop with 'isPausing' flag
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

    document.querySelectorAll('.vote').forEach((btn) => {
        btn.addEventListener('click', () => {
            const songId = parseInt(btn.closest('.container').dataset.songId, 10);
            const voteType = btn.dataset.vote;
            if (!isNaN(songId)) submitVote(songId, voteType);
        });
    });

    
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => playSong());
        navigator.mediaSession.setActionHandler('pause', () => stopPlayback(true));
        navigator.mediaSession.setActionHandler('previoustrack', () => changeSong(-1));
        navigator.mediaSession.setActionHandler('nexttrack', () => changeSong(1));
    }
});
