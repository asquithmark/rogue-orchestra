// script-song.js (in song/ folder, next to song.html)

import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// submit a vote (either 'up' or 'down') for this song
async function submitVote(songId, vote) {
  const { error } = await supabase
    .from('votes')
    .insert({ song_id: songId, vote });

  if (error) {
    console.error('Insert error:', error);
    return;
  }

  // once the vote is saved, refresh the displayed score
  await refreshScore(songId);
}

// fetch and display this song’s current score
async function refreshScore(songId) {
  const { count: ups, error: errUp } = await supabase
    .from('votes')
    .select('*', { head: true, count: 'exact' })
    .eq('song_id', songId)
    .eq('vote', 'up');

  if (errUp) {
    console.error('Error fetching up-votes:', errUp);
    return;
  }

  const { count: downs, error: errDown } = await supabase
    .from('votes')
    .select('*', { head: true, count: 'exact' })
    .eq('song_id', songId)
    .eq('vote', 'down');

  if (errDown) {
    console.error('Error fetching down-votes:', errDown);
    return;
  }

  // find the <span> with data-score for this page
  const scoreSpan = document.querySelector('[data-score]');
  if (scoreSpan) {
    scoreSpan.textContent = ups - downs;
  }
}

// on page load, wire up the buttons and fetch the initial score
document.addEventListener('DOMContentLoaded', () => {
  // The song ID must be embedded in the HTML, for example:
  // <div id="song-container" data-song-id="42">…</div>
  const container = document.querySelector('#song-container');
  const songId = parseInt(container.dataset.songId, 10);

  // first, display the current score
  if (!isNaN(songId)) {
    refreshScore(songId);
  }

  // attach click listeners to up/down buttons:
  // in your song.html, you need:
  // <button class="vote" data-vote="up"  data-song-id="42">👍</button>
  // <button class="vote" data-vote="down" data-song-id="42">👎</button>
  document.querySelectorAll('.vote').forEach((btn) => {
    btn.addEventListener('click', () => {
      const voteType = btn.dataset.vote; // 'up' or 'down'
      submitVote(songId, voteType);
    });
  });
});
