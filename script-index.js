// script-index.js - Corrected and More Robust Version


// Attempt to load Supabase credentials dynamically. If config.js is missing
// the tracklist will still load, but scores will be disabled.
let SUPABASE_URL;
let SUPABASE_KEY;
async function loadCredentials() {
  try {
    const config = await import('./config.js');
    SUPABASE_URL = config.SUPABASE_URL;
    SUPABASE_KEY = config.SUPABASE_KEY;
  } catch (err) {
    console.warn('config.js not found - scores will not be loaded');
  }
}

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
      a.classList.add('glass');

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

  // Load credentials only when needed so the tracklist works without config.js
  if (SUPABASE_URL === undefined) {
      await loadCredentials();
  }

  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('<')) {
      console.warn('Supabase credentials missing or invalid. Scores will be skipped.');
      document.querySelectorAll('.track-score').forEach(el => el.textContent = '-');
      return;
  }

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      console.warn('Supabase library not loaded. Scores will be skipped.');
      document.querySelectorAll('.track-score').forEach(el => el.textContent = '-');
      return;
  }

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  async function fetchScore(songId) {
    const { data, error } = await supabase
      .from('votes')
      .select('vote')
      .eq('song_id', songId);
    if (error) throw error;
    const ups = data.filter(v => v.vote === 'up').length;
    const downs = data.filter(v => v.vote === 'down').length;
    return { ups, downs };
  }

  // Fetch initial scores for each song individually. Selecting the whole table
  // can fail with row-level security, so we query per song instead.
  for (const song of songs) {
    try {
      const { ups, downs } = await fetchScore(song.id);
      updateScore(song.id, ups, downs);
    } catch (err) {
      console.error('Error fetching score for song', song.id, err);
      const scoreEl = document.querySelector(`.track-score[data-song-id="${song.id}"]`);
      if (scoreEl) scoreEl.textContent = '-';
    }
  }

  // Subscribe to real-time updates.
  supabase
    .channel('public:votes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, async (payload) => {
        const songId = payload.new?.song_id || payload.old?.song_id;
        if (songId) {
            try {
                const { ups, downs } = await fetchScore(songId);
                updateScore(songId, ups, downs);
            } catch (_) {}
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
