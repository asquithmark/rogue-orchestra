// script-index.js - Corrected and More Robust Version

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// This function now only handles the visual score update.
function updateScore(songId, ups, downs) {
  const score = (ups || 0) - (downs || 0);
  const scoreElement = document.querySelector(`.track-score[data-song-id="${songId}"]`);
  if (scoreElement) {
    scoreElement.textContent = score;
  }
}

// This function now ONLY loads the track titles and links.
// It is no longer dependent on the database connection.
async function loadTrackList() {
  try {
    const response = await fetch('./songs.json');
    if (!response.ok) {
      throw new Error(`Failed to load songs.json: ${response.statusText}`);
    }
    const songs = await response.json();
    const trackList = document.getElementById('trackList');

    if (!trackList) return;

    trackList.innerHTML = ''; // Clear existing list

    songs.forEach((song, index) => {
      const li = document.createElement('li');
      li.classList.add('track-item');
      // Set a CSS variable for the animation delay
      li.style.setProperty('--delay', `${index * 0.07}s`);

      const a = document.createElement('a');
      a.href = `./song/song.html?id=${song.id}`;

      const titleSpan = document.createElement('span');
      titleSpan.textContent = song.title;

      // The score now starts as a placeholder.
      const scoreSpan = document.createElement('span');
      scoreSpan.classList.add('track-score');
      scoreSpan.setAttribute('data-song-id', song.id);
      scoreSpan.textContent = '...'; 

      a.appendChild(titleSpan);
      a.appendChild(scoreSpan);
      li.appendChild(a);
      trackList.appendChild(li);
    });

    // Return the loaded songs so we can fetch scores for them later.
    return songs;

  } catch (error) {
    console.error('Error loading initial track list:', error);
    const trackList = document.getElementById('trackList');
    if (trackList) {
        trackList.innerHTML = '<p style="text-align: center; color: var(--text-color-muted);">Could not load tracklist.</p>';
    }
  }
}

// This function initializes the database connection and fetches all scores.
async function initializeDatabase(songs) {
  if (!songs || songs.length === 0) return;

  // Gracefully handle missing credentials.
  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('<')) {
      console.error("Supabase credentials not found or are invalid. Scores will not be loaded.");
      document.querySelectorAll('.track-score').forEach(el => el.textContent = '-');
      return;
  }

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Fetch initial scores for all songs at once.
  const { data: votes, error } = await supabase.from('votes').select('song_id, vote');

  if (error) {
      console.error("Error fetching votes:", error);
      return;
  }

  // Process votes and update the UI
  const scores = {};
  votes.forEach(v => {
      if (!scores[v.song_id]) scores[v.song_id] = { ups: 0, downs: 0 };
      if (v.vote === 'up') scores[v.song_id].ups++;
      if (v.vote === 'down') scores[v.song_id].downs++;
  });

  songs.forEach(song => {
      const songScore = scores[song.id] || { ups: 0, downs: 0 };
      updateScore(song.id, songScore.ups, songScore.downs);
  });

  // Subscribe to real-time updates.
  supabase
    .channel('public:votes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, (payload) => {
        const songId = payload.new?.song_id || payload.old?.song_id;
        if (songId) {
            // Refetch scores for the specific song that was changed
            supabase.from('votes').select('vote').eq('song_id', songId).then(({ data, error }) => {
                if (error) return;
                const ups = data.filter(v => v.vote === 'up').length;
                const downs = data.filter(v => v.vote === 'down').length;
                updateScore(songId, ups, downs);
            });
        }
      }
    )
    .subscribe();
}


// --- Main Execution ---
document.addEventListener('DOMContentLoaded', async () => {
  // Toggle for the album description
  const toggleAlbumDescription = document.getElementById('toggleAlbumDescription');
  const albumDescription = document.getElementById('albumDescription');

  if (toggleAlbumDescription && albumDescription) {
      toggleAlbumDescription.addEventListener('click', () => {
          albumDescription.classList.toggle('collapsed');
          toggleAlbumDescription.textContent = albumDescription.classList.contains('collapsed') ? 'show more' : 'show less';
      });
  }

  // Step 1: Immediately load the visual tracklist.
  const songs = await loadTrackList();
  
  // Step 2: After the tracklist is visible, connect to the database.
  initializeDatabase(songs);
});
