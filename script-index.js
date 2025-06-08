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

    trackList.innerHTML = ''; // Clear existing list

    songs.forEach(song => {
      const li = document.createElement('li');
      li.classList.add('track-item');

      // The link itself is the button
      const a = document.createElement('a');
      a.href = `./song/song.html?id=${song.id}`;
      a.classList.add('track-button'); // Apply button styling

      // This div will contain the title and score
      const trackRow = document.createElement('div');
      trackRow.classList.add('track-row');

      // Title span
      const titleSpan = document.createElement('span');
      titleSpan.textContent = song.title;

      // Score span
      const scoreSpan = document.createElement('span');
      scoreSpan.classList.add('track-score');
      scoreSpan.setAttribute('data-score', song.id);
      scoreSpan.textContent = '0'; // Default score

      // Append title and score to the row
      trackRow.appendChild(titleSpan);
      trackRow.appendChild(scoreSpan);
      
      // Append the row to the link
      a.appendChild(trackRow);
      
      // Append the link to the list item
      li.appendChild(a);
      
      // Append the list item to the main list
      trackList.appendChild(li);

      // Fetch the actual score
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

// On page load, load the track list and subscribe to updates
document.addEventListener('DOMContentLoaded', () => {
  loadTrackList();

  // Subscribe to real-time vote updates
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
