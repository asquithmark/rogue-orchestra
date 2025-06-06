document.addEventListener('DOMContentLoaded', () => {
  const trackListContainer = document.getElementById('trackList');
  const introPopup = document.getElementById('introPopup');
  const continueToSongBtn = document.getElementById('continueToSongBtn');
  const albumDesc = document.getElementById('albumDescription');
  const toggleAlbumDesc = document.getElementById('toggleAlbumDescription');
  let pendingSongUrl = '';

  fetch('songs.json')
    .then(r => r.json())
    .then(async data => {
      for (const [index, song] of data.entries()) {
        const row = document.createElement('div');
        row.className = 'track-row';

        const link = document.createElement('a');
        link.href = `song.html?song=${index}`;
        link.textContent = song.title;
        link.className = 'track-button';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          if (!localStorage.getItem('introShown')) {
            pendingSongUrl = link.href;
            introPopup.style.display = 'flex';
            localStorage.setItem('introShown', 'true');
          } else {
            window.location.href = link.href;
          }
        });

        const scoreEl = document.createElement('span');
        scoreEl.className = 'track-score';
        row.appendChild(link);
        row.appendChild(scoreEl);
        trackListContainer.appendChild(row);

        updateScore(index, scoreEl);
      }
    });

  continueToSongBtn.addEventListener('click', () => {
    if (pendingSongUrl) {
      window.location.href = pendingSongUrl;
    }
  });

  introPopup.addEventListener('click', (e) => {
    if (e.target === introPopup) {
      introPopup.style.display = 'none';
      pendingSongUrl = '';
    }
  });

  if (toggleAlbumDesc) {
    toggleAlbumDesc.addEventListener('click', () => {
      albumDesc.classList.toggle('collapsed');
      toggleAlbumDesc.textContent = albumDesc.classList.contains('collapsed') ? 'show more' : 'show less';
    });
  }

  async function updateScore(id, el) {
    if (!window.supabaseClient) {
      el.textContent = '';
      return;
    }
    try {
      const { count: up } = await supabaseClient
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .eq('song_id', id)
        .eq('vote', 'up');

      const { count: down } = await supabaseClient
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .eq('song_id', id)
        .eq('vote', 'down');

      const score = (up || 0) - (down || 0);
      el.textContent = score > 0 ? `+${score}` : `${score}`;
    } catch {
      el.textContent = '';
    }
  }
});
