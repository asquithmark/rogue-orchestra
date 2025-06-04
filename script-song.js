document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  let index = parseInt(params.get('song')) || 0;

  const titleEl = document.getElementById('songTitle');
  const descEl = document.getElementById('songDescription');
  const audio = document.getElementById('audioPlayer');
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
    });

  function loadSong(i) {
    const song = songsData[i];
    if (!song) return;
    titleEl.textContent = song.title;
    descEl.innerHTML = song.description;
    audio.src = `assets/${song.audioFile}`;
    progressBar.value = 0;
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';
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
});
