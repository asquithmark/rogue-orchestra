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
      audio.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    })
    .catch(err => console.error('songs.json fetch failed', err));

  /* -------- helpers -------- */
  function formatTime(t) {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  async function updateVoteCounts(songId) {
    if (!window.supabaseClient) {
      voteCounts.textContent = '';
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

      voteCounts.textContent = `👍 ${up || 0}  👎 ${down || 0}`;
    } catch (err) {
      console.error('vote count fetch failed', err);
      voteCounts.textContent = '';
    }
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
    updateVoteCounts(i);

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
      audio.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      audio.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  });

  prevBtn.addEventListener('click', () => {
    if (!songsData.length) return;
    index = (index - 1 + songsData.length) % songsData.length;
    loadSong(index);
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  });

  nextBtn.addEventListener('click', () => {
    if (!songsData.length) return;
    index = (index + 1) % songsData.length;
    loadSong(index);
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
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
      if (!window.supabaseClient) return;
      try {
        await supabaseClient.from('votes').insert({ song_id: songId, vote: btn.dataset.vote });
        updateVoteCounts(songId);
      } catch (err) {
        console.error('vote insert failed', err);
      }
    });
  });
});