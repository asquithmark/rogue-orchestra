document.addEventListener('DOMContentLoaded', async () => {
  const trackListContainer = document.getElementById('trackList');
  const introPopup        = document.getElementById('introPopup');
  const continueToSongBtn = document.getElementById('continueToSongBtn');
  const albumDesc         = document.getElementById('albumDescription');
  const toggleAlbumDesc   = document.getElementById('toggleAlbumDescription');
  let pendingSongUrl      = '';

  /* ---------- load song list ---------- */
  let songs = [];
  try {
    songs = await fetch('songs.json').then(r => r.json());
  } catch (err) {
    console.error('Could not load songs.json', err);
    return;
  }

  songs.forEach((song, idx) => {
    const row  = document.createElement('div');
    row.className = 'track-row';

    /* song link */
    const link = document.createElement('a');
    link.href        = `song.html?song=${idx}`;
    link.textContent = song.title;
    link.className   = 'track-button';

    link.addEventListener('click', e => {
      e.preventDefault();
      if (!localStorage.getItem('introShown')) {
        pendingSongUrl        = link.href;
        introPopup.style.display = 'flex';
        localStorage.setItem('introShown', 'true');
      } else {
        window.location.href = link.href;
      }
    });

    /* vote score */
    const scoreEl = document.createElement('span');
    scoreEl.className = 'track-score';
    row.append(link, scoreEl);
    trackListContainer.appendChild(row);

    updateScore(idx, scoreEl);
  });

  /* ---------- intro popup handlers ---------- */
  if (continueToSongBtn) {
    continueToSongBtn.addEventListener('click', () => {
      if (pendingSongUrl) window.location.href = pendingSongUrl;
    });
  }

  if (introPopup) {
    introPopup.addEventListener('click', e => {
      if (e.target === introPopup) {
        introPopup.style.display = 'none';
        pendingSongUrl = '';
      }
    });
  }

  /* ---------- album description toggle ---------- */
  if (toggleAlbumDesc && albumDesc) {
    toggleAlbumDesc.addEventListener('click', () => {
      albumDesc.classList.toggle('collapsed');
      toggleAlbumDesc.textContent = albumDesc.classList.contains('collapsed') ? 'show more' : 'show less';
    });
  }

  /* ---------- helpers ---------- */
  async function updateScore(songId, el) {
    if (!window.supabaseClient) {
      el.textContent = '';
      return;
    }
    try {
      const { count: up } = await supabaseClient
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .eq('song_id', songId)
        .eq('vote', 'up');

      const { count: down } = await supabaseClient
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .eq('song_id', songId)
        .eq('vote', 'down');

      const score = (up || 0) - (down || 0);
      el.textContent = `${score >= 0 ? '+' : ''}${score}`;
    } catch (err) {
      console.error('Failed to fetch vote counts', err);
      el.textContent = 'Votes unavailable';
    }
  }
});
