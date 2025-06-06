document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  let index = parseInt(params.get('song')) || 0;

  const titleEl = document.getElementById('songTitle');
  const descEl = document.getElementById('songDescription');
  const audio = document.getElementById('audioPlayer');
  audio.autoplay = true;
  const introEl = document.getElementById("songIntro");
  const container = document.querySelector(".container");
  const toggle = document.getElementById('toggleDescription');
  const backLink = document.getElementById('backLink');

  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressBar = document.getElementById('progressBar');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');

  let songsData = [];

  fetch('songs.json')
    .then(r => r.json())
    .then(songs => {
      songsData = songs;
      loadSong(index);
      audio.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    });

  function loadSong(i) {
    const song = songsData[i];
    if (!song) return;
    titleEl.textContent = song.title;
    const match = song.description.match(/^<em>(.*?)<\/em><br>?/);
    if (match) {
      introEl.innerHTML = match[1];
      introEl.style.display = "block";
      descEl.innerHTML = song.description.replace(match[0], "");
    } else {
      introEl.style.display = "none";
      descEl.innerHTML = song.description;
    }
    audio.src = `assets/${song.audioFile}`;
    progressBar.value = 0;
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';
    container.classList.remove('pop-in');
    void container.offsetWidth;
    container.classList.add('pop-in');
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: 'the rogue orchestra',
        album: 'the rogue orchestra',
        artwork: [
          { src: 'assets/album.gif', sizes: '512x512', type: 'image/gif' }
        ]
      });
    }
  }


  function formatTime(t) {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

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
    if (songsData.length === 0) return;
    index = (index - 1 + songsData.length) % songsData.length;
    loadSong(index);
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      prevBtn.click();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      nextBtn.click();
    });
  }

  nextBtn.addEventListener('click', () => {
    if (songsData.length === 0) return;
    index = (index + 1) % songsData.length;
    loadSong(index);
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
  });

  progressBar.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  });

  toggle.addEventListener('click', () => {
    descEl.classList.toggle('collapsed');
    toggle.textContent = descEl.classList.contains('collapsed') ? 'show more' : 'show less';
  });

  backLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'index.html';
  });

  // VOTING SETUP
  const voteContainer = document.createElement('div');
  voteContainer.className = 'vote-container';
  voteContainer.style.display = 'flex';
  voteContainer.style.alignItems = 'center';
  voteContainer.style.justifyContent = 'center';
  voteContainer.style.margin = '24px 0';

  const voteUp = document.createElement('button');
  voteUp.textContent = '👍';
  voteUp.className = 'vote-btn';
  voteUp.dataset.song = index;
  voteUp.dataset.vote = 'up';
  voteUp.style.marginRight = '8px';
  voteUp.style.padding = '6px 12px';
  voteUp.style.fontSize = '1.2rem';
  voteUp.style.cursor = 'pointer';
  voteUp.style.borderRadius = '4px';
  voteUp.style.transition = 'background 0.3s';

  const voteDown = document.createElement('button');
  voteDown.textContent = '👎';
  voteDown.className = 'vote-btn';
  voteDown.dataset.song = index;
  voteDown.dataset.vote = 'down';
  voteDown.style.marginRight = '8px';
  voteDown.style.padding = '6px 12px';
  voteDown.style.fontSize = '1.2rem';
  voteDown.style.cursor = 'pointer';
  voteDown.style.borderRadius = '4px';
  voteDown.style.transition = 'background 0.3s';

  const voteCounts = document.createElement('span');
  voteCounts.className = 'vote-counts';
  voteCounts.textContent = 'Loading...';
  voteCounts.style.marginLeft = '10px';
  voteCounts.style.fontSize = '1rem';

  voteContainer.appendChild(voteUp);
  voteContainer.appendChild(voteDown);
  voteContainer.appendChild(voteCounts);
  audio.parentNode.insertBefore(voteContainer, audio.nextSibling);

  function applyThemeStyles() {
    const isDark = document.body.classList.contains('dark-theme');
    const bgColor = isDark ? '#1a1a1a' : '#eee';
    const hoverBg = isDark ? '#333' : '#ddd';
    const textColor = isDark ? '#fff' : '#000';
    const borderColor = isDark ? '#444' : '#bbb';
    const countColor = isDark ? '#ccc' : '#333';

    [voteUp, voteDown].forEach(btn => {
      btn.style.backgroundColor = bgColor;
      btn.style.color = textColor;
      btn.style.border = `1px solid ${borderColor}`;
      btn.onmouseenter = () => btn.style.backgroundColor = hoverBg;
      btn.onmouseleave = () => btn.style.backgroundColor = bgColor;
    });
    voteCounts.style.color = countColor;
  }

  applyThemeStyles();
  const observer = new MutationObserver(() => applyThemeStyles());
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  async function updateVoteCounts(songId) {
    try {
      const upRes = await fetch(`${SUPABASE_URL}/rest/v1/votes?select=vote&song_id=eq.${songId}&vote=eq.up&count=exact`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'count=exact'
        }
      });
      const downRes = await fetch(`${SUPABASE_URL}/rest/v1/votes?select=vote&song_id=eq.${songId}&vote=eq.down&count=exact`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'count=exact'
        }
      });
      const upCount = upRes.headers.get('content-range')?.split('/')[1] || '0';
      const downCount = downRes.headers.get('content-range')?.split('/')[1] || '0';
      voteCounts.textContent = `👍 ${upCount}  👎 ${downCount}`;
    } catch {
      voteCounts.textContent = 'Votes unavailable';
    }
  }

  updateVoteCounts(index);

  [voteUp, voteDown].forEach(button => {
    button.addEventListener('click', async () => {
      const songId = parseInt(button.dataset.song);
      const vote = button.dataset.vote;

      await fetch(`${SUPABASE_URL}/rest/v1/votes`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          song_id: songId,
          vote: vote
        })
      });

      updateVoteCounts(songId);
    });
  });
});
