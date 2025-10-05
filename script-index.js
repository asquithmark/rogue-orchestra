// script-index.js - Offline-first tracklist loader

async function loadTrackList() {
  try {
    const response = await fetch('./songs.json');
    if (!response.ok) {
      throw new Error(`Failed to load songs.json: ${response.statusText}`);
    }

    const songs = await response.json();
    const trackList = document.getElementById('trackList');
    if (!trackList) return;

    trackList.innerHTML = '';

    songs.forEach((song, index) => {
      const li = document.createElement('li');
      li.classList.add('track-item');
      li.style.setProperty('--delay', `${index * 0.07}s`);

      const link = document.createElement('a');
      link.href = `./song/song.html?id=${song.id}`;
      link.classList.add('glass');
      link.textContent = song.title;

      li.appendChild(link);
      trackList.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading track list:', error);
    const trackList = document.getElementById('trackList');
    if (trackList) {
      trackList.innerHTML = '<p style="text-align: center; color: var(--text-color-muted);">Could not load tracklist.</p>';
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const toggleAlbumDescription = document.getElementById('toggleAlbumDescription');
  const albumDescription = document.getElementById('albumDescription');

  if (toggleAlbumDescription && albumDescription) {
    toggleAlbumDescription.addEventListener('click', () => {
      albumDescription.classList.toggle('collapsed');
      const isCollapsed = albumDescription.classList.contains('collapsed');
      toggleAlbumDescription.textContent = isCollapsed ? 'show more' : 'show less';
    });
  }

  await loadTrackList();
});
