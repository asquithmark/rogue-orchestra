document.addEventListener('DOMContentLoaded', () => {
  const trackListContainer = document.getElementById('trackList');
  const introPopup = document.getElementById('introPopup');
  const continueToSongBtn = document.getElementById('continueToSongBtn');
  const albumDesc = document.getElementById('albumDescription');
  const toggleAlbumDesc = document.getElementById('toggleAlbumDescription');
  let pendingSongUrl = '';

  fetch('songs.json')
    .then(r => r.json())
    .then(data => {
      data.forEach((song, index) => {
        const link = document.createElement('a');
        link.href = `song.html?song=${index}`;
        link.textContent = song.title;
        link.className = 'track-link';
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
        trackListContainer.appendChild(link);
      });
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
});
