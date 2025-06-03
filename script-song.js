document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const index = parseInt(params.get('song')) || 0;
  const titleEl = document.getElementById('songTitle');
  const descEl = document.getElementById('songDescription');
  const audio = document.getElementById('audioPlayer');
  const toggle = document.getElementById('toggleDescription');
  const backLink = document.getElementById('backLink');

  fetch('songs.json')
    .then(r => r.json())
    .then(songs => {
      const song = songs[index];
      if (!song) return;
      titleEl.textContent = song.title;
      descEl.innerHTML = song.description;
      audio.src = `assets/${song.audioFile}`;
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
