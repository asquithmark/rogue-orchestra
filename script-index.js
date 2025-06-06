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

    /* voting UI */
    const voteContainer = document.createElement('div');
    voteContainer.className = 'vote-container';

    const voteUp   = document.createElement('button');
    voteUp.textContent   = '👍';
    voteUp.className     = 'vote-btn';
    voteUp.dataset.song  = idx;
    voteUp.dataset.vote  = 'up';

    const voteDown = document.createElement('button');
    voteDown.textContent  = '👎';
    voteDown.className    = 'vote-btn';
    voteDown.dataset.song = idx;
    voteDown.dataset.vote = 'down';

    const voteCounts = document.createElement('span');
    voteCounts.className = 'vote-counts';

    voteContainer.append(voteUp, voteDown, voteCounts);
    row.append(link, voteContainer);
    trackListContainer.appendChild(row);

    updateVoteCounts(idx, voteCounts);

    [voteUp, voteDown].forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!window.supabaseClient) return;
        try {
          await supabaseClient.from('votes').insert({ song_id: idx, vote: btn.dataset.vote });
          updateVoteCounts(idx, voteCounts);
        } catch (err) {
          console.error('Vote insert failed', err);
        }
      });
    });
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
  async function updateVoteCounts(songId, el) {
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

      el.textContent = `👍 ${up || 0}  👎 ${down || 0}`;
    } catch (err) {
      console.error('Failed to fetch vote counts', err);
      el.textContent = 'Votes unavailable';
    }
  }
});