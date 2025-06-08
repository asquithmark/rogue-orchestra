// script-index.js (in root, next to index.html)

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to load and display the track list
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

    // Clear existing list to avoid duplicates
    trackList.innerHTML = '';

    songs.forEach(song => {
      const li = document.createElement('li');
      li.classList.add('track-item');

      const a = document.createElement('a');
      // Add the 'track-button' class for styling
      a.classList.add('track-button');
      a.href = `./song/song.html?id=${song.id}`;

      const titleSpan = document.createElement('span');
      titleSpan.textContent = song.title;

      const scoreSpan = document.createElement('span');
      scoreSpan.classList.add('track-score');
      scoreSpan.setAttribute('data-score', song.id);
      scoreSpan.textContent = '0'; // Default score

      a.appendChild(titleSpan);
      a.appendChild(scoreSpan);
      li.appendChild(a);
      trackList.appendChild(li);

      // Refresh the score for this track
      refreshScore(song.id);
    });
  } catch (error) {
    console.error('Error loading track list:', error);
  }
}

// Fetch and display the score for a given song ID
async function refreshScore(songId) {
  // Count up-votes
  const { count: ups, error: errUp } = await supabase
    .from('votes')
    .select('*', { head: true, count: 'exact' })
    .eq('song_id', songId)
    .eq('vote', 'up');
  if (errUp) {
    console.error('Error fetching up-votes for', songId, errUp);
    return;
  }

  // Count down-votes
  const { count: downs, error: errDown } = await supabase
    .from('votes')
    .select('*', { head: true, count: 'exact' })
    .eq('song_id', songId)
    .eq('vote', 'down');
  if (errDown) {
    console.error('Error fetching down-votes for', songId, errDown);
    return;
  }

  // Find the <span data-score="songId">
  const selector = `[data-score="${songId}"]`;
  const span = document.querySelector(selector);
  if (span) {
    span.textContent = (ups - downs).toString();
  }
}

// On page load, load the track list and refresh scores
document.addEventListener('DOMContentLoaded', () => {
  loadTrackList();

  // Optional: subscribe to real-time updates
  supabase
    .channel('votes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'votes' },
      payload => {
        const newSongId = payload.new.song_id;
        refreshScore(newSongId);
      }
    )
    .subscribe();
});
