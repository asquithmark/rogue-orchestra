import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
    scoreEl.dataset.score = idx;
    row.append(link, scoreEl);
    trackListContainer.appendChild(row);

    refreshScore(idx);
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
  async function submitVote(songId, vote) {
    const { error } = await supabase
      .from('votes')
      .insert({ song_id: songId, vote });
    if (error) { console.error(error); return; }
    await refreshScore(songId);
  }

  async function refreshScore(songId) {
    const { count: ups } = await supabase
      .from('votes')
      .select('*', { head: true, count: 'exact' })
      .eq('song_id', songId)
      .eq('vote', 'up');

    const { count: downs } = await supabase
      .from('votes')
      .select('*', { head: true, count: 'exact' })
      .eq('song_id', songId)
      .eq('vote', 'down');

    document.querySelector(`[data-score="${songId}"]`).textContent = ups - downs;
  }

  supabase.channel('votes')
    .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        payload => refreshScore(payload.new.song_id))
    .subscribe();
});
