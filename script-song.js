import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  /* -------- URL & DOM refs -------- */
  const params          = new URLSearchParams(window.location.search);
  let   index           = parseInt(params.get('song'), 10) || 0;

  const titleEl         = document.getElementById('songTitle');
  const descEl          = document.getElementById('songDescription');
  const introEl         = document.getElementById('songIntro');
  const container       = document.querySelector('.container');
  const toggle          = document.getElementById('toggleDescription');
  const backLink        = document.getElementById('backLink');

  const audio           = document.getElementById('audioPlayer');
  audio.autoplay        = true;

  const playPauseBtn    = document.getElementById('playPauseBtn');
  const prevBtn         = document.getElementById('prevBtn');
  const nextBtn         = document.getElementById('nextBtn');
  const progressBar     = document.getElementById('progressBar');
  const currentTimeEl   = document.getElementById('currentTime');
  const durationEl      = document.getElementById('duration');

  /* -------- voting UI -------- */
  const voteContainer   = document.getElementById('voteSection');
  voteContainer.className = 'vote-container';

  const voteUp   = document.createElement('button');
  voteUp.innerHTML     = '<i class="fa-regular fa-thumbs-up"></i>';
  voteUp.className     = 'vote-btn';
  voteUp.dataset.vote  = 'up';

  const voteDown = document.createElement('button');
  voteDown.innerHTML   = '<i class="fa-regular fa-thumbs-down"></i>';
  voteDown.className   = 'vote-btn';
  voteDown.dataset.vote= 'down';

  const voteCounts     = document.createElement('span');
  voteCounts.className = 'vote-counts';

  voteContainer.append(voteUp, voteDown, voteCounts);

  /* -------- data load -------- */
  let songsData = [];

  fetch('songs.json')
    .then(r => r.json())
    .then(songs => {
      songsData = songs;
      loadSong(index);
      tryPlay();
    })
    .catch(err => console.error('songs.json fetch failed', err));

  /* -------- helpers -------- */
  function formatTime(t) {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function tryPlay() {
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      }).catch(() => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      });
    } else {
      playPauseBtn.innerHTML = audio.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    }
  }

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

  function loadSong(i) {
    const song = songsData[i];
    if (!song) return;

    /* metadata & text */
    titleEl.textContent = song.title;

    const match = song.description.match(/^<em>(.*?)<\/em><br>?/);
    if (match) {
      introEl.innerHTML    = match[1];
      introEl.style.display= 'block';
      descEl.innerHTML     = song.description.replace(match[0], '');
    } else {
      introEl.style.display= 'none';
      descEl.innerHTML     = song.description;
    }

    /* audio */
    audio.src                 = `assets/${song.audioFile}`;
    progressBar.value         = 0;
    currentTimeEl.textContent = '0:00';
    durationEl.textContent    = '0:00';

    /* animation reset */
    container.classList.remove('pop-in');
    void container.offsetWidth;
    container.classList.add('pop-in');

    /* voting */
    voteUp.dataset.song   = i;
    voteDown.dataset.song = i;
    voteCounts.dataset.score = i;
    refreshScore(i);

    /* Media Session */
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title   : song.title,
        artist  : 'the rogue orchestra',
        album   : 'the rogue orchestra',
        artwork : [{ src: 'assets/album.gif', sizes: '512x512', type: 'image/gif' }]
      });
    }
  }

  /* -------- player controls -------- */
  playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
      tryPlay();
    } else {
      audio.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  });

  prevBtn.addEventListener('click', () => {
    if (!songsData.length) return;
    index = (index - 1 + songsData.length) % songsData.length;
    loadSong(index);
    tryPlay();
  });

  nextBtn.addEventListener('click', () => {
    if (!songsData.length) return;
    index = (index + 1) % songsData.length;
    loadSong(index);
    tryPlay();
  });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('previoustrack', () => prevBtn.click());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextBtn.click());
  }

  /* -------- progress bar -------- */
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    progressBar.value         = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent    = formatTime(audio.duration);
  });

  progressBar.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  });

  /* -------- autoplay next song -------- */
  audio.addEventListener('ended', () => {
    if (!songsData.length) return;
    if (index < songsData.length - 1) {
      index += 1;
      loadSong(index);
      tryPlay();
    } else {
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  });

  /* -------- description toggle & back link -------- */
  toggle.addEventListener('click', () => {
    descEl.classList.toggle('collapsed');
    toggle.textContent = descEl.classList.contains('collapsed') ? 'show more' : 'show less';
  });

  backLink.addEventListener('click', e => {
    e.preventDefault();
    window.location.href = 'index.html';
  });

  /* -------- voting handlers -------- */
  [voteUp, voteDown].forEach(btn => {
    btn.addEventListener('click', async () => {
      const songId = parseInt(btn.dataset.song, 10);
      await submitVote(songId, btn.dataset.vote);
    });
  });

  supabase.channel('votes')
    .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        payload => refreshScore(payload.new.song_id))
    .subscribe();
});
