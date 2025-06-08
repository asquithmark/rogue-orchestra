// script-index.js - Final Polished Version

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Supabase credentials not found.");
}
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function refreshScore(songId) {
  try {
    const { count: ups } = await supabase.from('votes').select('*', { head: true, count: 'exact' }).eq('song_id', songId).eq('vote', 'up');
    const { count: downs } = await supabase.from('votes').select('*', { head: true, count: 'exact' }).eq('song_id', songId).eq('vote', 'down');
    const score = (ups || 0) - (downs || 0);
    const scoreElement = document.querySelector(`.track-score[data-song-id="${songId}"]`);
    if (scoreElement) {
      scoreElement.textContent = score;
    }
  } catch (error) {
    console.error(`Error fetching score for song ${songId}:`, error);
  }
}

async function loadTrackList() {
  try {
    const response = await fetch('./songs.json');
    if (!response.ok) throw new Error(`Failed to load songs.json: ${response.status}`);
    const songs = await response.json();
    const trackList = document.getElementById('trackList');
    
    if (!trackList) return;

    trackList.innerHTML = ''; 

    songs.forEach((song, index) => {
      const li = document.createElement('li');
      li.classList.add('track-item');
      li.style.setProperty('--delay', `${index * 0.07}s`);

      const a = document.createElement('a');
      a.href = `./song/song.html?id=${song.id}`;

      const titleSpan = document.createElement('span');
      titleSpan.textContent = song.title;

      const scoreSpan = document.createElement('span');
      scoreSpan.classList.add('track-score');
      scoreSpan.setAttribute('data-song-id', song.id);
      scoreSpan.textContent = '...'; 

      a.appendChild(titleSpan);
      a.appendChild(scoreSpan);
      li.appendChild(a);
      trackList.appendChild(li);

      refreshScore(song.id);
    });

  } catch (error) {
    console.error('Error loading initial track list:', error);
  }
}

function subscribeToVotes() {
  supabase
    .channel('public:votes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, (payload) => {
        const songId = payload.new?.song_id || payload.old?.song_id;
        if (songId) {
          refreshScore(songId);
        }
      }
    )
    .subscribe();
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleAlbumDescription = document.getElementById('toggleAlbumDescription');
  const albumDescription = document.getElementById('albumDescription');

  if(toggleAlbumDescription && albumDescription){
      toggleAlbumDescription.addEventListener('click', () => {
          albumDescription.classList.toggle('collapsed');
          toggleAlbumDescription.textContent = albumDescription.classList.contains('collapsed') ? 'show more' : 'show less';
      });
  }

  loadTrackList();
  subscribeToVotes();
});
