// script-index.js (in root, next to index.html)

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// fetch and display the score for a given song ID
async function refreshScore(songId) {
  // count up-votes
  const { count: ups, error: errUp } = await supabase
    .from('votes')
    .select('*', { head: true, count: 'exact' })
    .eq('song_id', songId)
    .eq('vote', 'up');

  if (errUp) {
    console.error('Error fetching up-votes:', errUp);
    return;
  }

  // count down-votes
  const { count: downs, error: errDown } = await supabase
    .from('votes')
    .select('*', { head: true, count: 'exact' })
    .eq('song_id', songId)
    .eq('vote', 'down');

  if (errDown) {
    console.error('Error fetching down-votes:', errDown);
    return;
  }

  // find the <span> that shows this song’s score
  const span = document.querySelector(`[data-score="${songId}"]`);
  if (span) {
    span.textContent = ups - downs;
  }
}

// on page load, refresh every song’s score
document.addEventListener('DOMContentLoaded', () => {
  // find all score spans: in index.html, each song entry needs something like
  // <span class="track-score" data-score="42">0</span>
  const spans = document.querySelectorAll('[data-score]');
  spans.forEach((span) => {
    const songId = parseInt(span.dataset.score, 10);
    if (!isNaN(songId)) {
      refreshScore(songId);
    }
  });
});
