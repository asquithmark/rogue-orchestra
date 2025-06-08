// script-index.js

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// Ensure Supabase credentials are loaded
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Supabase credentials not found. Make sure config.js is present and correct.");
  // You might want to display an error message to the user in the UI
  const trackList = document.getElementById('trackList');
  if(trackList) {
    trackList.innerHTML = '<li><p style="color: red;">Error: Application is not configured correctly. Please contact the administrator.</p></li>';
  }
}

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

      // The <a> tag acts as the container for the title and score.
      const a = document.createElement('a');
      a.href = `./song/song.html?id=${song.id}`;
      // Note: The .track-button styles are applied via other classes in style.css
      // We will rely on the existing .track-item a selector.

      // Title span
      const titleSpan = document.createElement('span');
      titleSpan.textContent = song.title;

      // Score span
      const scoreSpan = document.createElement('span');
      scoreSpan.classList.add('track-score');
      scoreSpan.setAttribute('data-score', song.id);
      scoreSpan.textContent = '0'; // Default score

      // Append title and score directly to the link
      a.appendChild(titleSpan);
      a.appendChild(scoreSpan);
      
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
