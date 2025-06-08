// script-index.js - Final Version with Popup Logic

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// Ensure Supabase credentials are loaded and initialize the client
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Supabase credentials not found. Make sure config.js is present and correct.");
}
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Functions ---

/**
 * Fetches the score for a single song from Supabase and updates the DOM.
 * @param {number} songId - The ID of the song to refresh.
 */
async function refreshScore(songId) {
  try {
    const { count: ups } = await supabase.from('votes').select('*', { head: true, count: 'exact' }).eq('song_id', songId).eq('vote', 'up');
    const { count: downs } = await supabase.from('votes').select('*', { head: true, count: 'exact' }).eq('song_id', songId).eq('vote', 'down');
    
    const score = (ups || 0) - (downs || 0);

    const scoreElement = document.querySelector(`.track-score[data-song-id="${songId}"]`);
    if (scoreElement) {
      scoreElement.textContent = score;
    }
  } catch (error) {
    console.error(`Error fetching score for song ${songId}:`, error);
  }
}


/**
 * Loads the initial track list from songs.json, displays it,
 * and then fetches the scores.
 */
async function loadTrackList() {
  try {
    const response = await fetch('./songs.json');
    if (!response.ok) throw new Error(`Failed to load songs.json: ${response.status}`);
    const songs = await response.json();
    const trackList = document.getElementById('trackList');
    
    if (!trackList) {
      console.error('No <ul id="trackList"> found in index.html');
      return;
    }

    trackList.innerHTML = ''; // Clear existing list

    // Display the list first from the local JSON file
    songs.forEach((song, index) => {
      const li = document.createElement('li');
      li.classList.add('track-item');
      li.style.setProperty('--delay', `${index * 0.07}s`);

      const a = document.createElement('a');
      a.href = `./song/song.html?id=${song.id}`;

      const titleSpan = document.createElement('span');
      titleSpan.textContent = song.title;

      const scoreSpan = document.createElement('span');
      scoreSpan.classList.add('track-score');
      scoreSpan.setAttribute('data-song-id', song.id); // Set a unique ID for updating
      scoreSpan.textContent = '...'; // Placeholder while score loads

      a.appendChild(titleSpan);
      a.appendChild(scoreSpan);
      li.appendChild(a);
      trackList.appendChild(li);

      // After rendering the track, fetch its score
      refreshScore(song.id);
    });

  } catch (error) {
    console.error('Error loading initial track list:', error);
    const trackList = document.getElementById('trackList');
    if(trackList) {
        trackList.innerHTML = '<li>Error loading tracks.</li>';
    }
  }
}

/**
 * Subscribes to real-time updates from the 'votes' table.
 */
function subscribeToVotes() {
  supabase
    .channel('public:votes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'votes' },
      (payload) => {
        const songId = payload.new?.song_id || payload.old?.song_id;
        if (songId) {
          refreshScore(songId);
        }
      }
    )
    .subscribe();
}


// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
  // --- Popup Logic ---
  const popup = document.getElementById('introPopup');
  const continueBtn = document.getElementById('continueToSongBtn');

  if (popup && continueBtn) {
      // Show popup only if the user hasn't seen it before
      if (!localStorage.getItem('hasSeenIntroPopup')) {
          popup.style.display = 'flex';
      }

      continueBtn.addEventListener('click', () => {
          popup.style.display = 'none';
          localStorage.setItem('hasSeenIntroPopup', 'true');
      });
  }

  // --- Load Content ---
  loadTrackList();
  subscribeToVotes();
});
