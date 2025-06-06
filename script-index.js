document.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('trackList');
  const songs = await fetch('songs.json').then(r => r.json());

  songs.forEach((song, idx) => {
    const row = document.createElement('div');
    row.className = 'track-row';

    const link = document.createElement('a');
    link.href = `song.html?song=${idx}`;
    link.textContent = song.title;
    link.className = 'track-button';

    const voteContainer = document.createElement('div');
    voteContainer.className = 'vote-container';

    const voteUp = document.createElement('button');
    voteUp.textContent = '👍';
    voteUp.className = 'vote-btn';
    voteUp.dataset.song = idx;
    voteUp.dataset.vote = 'up';

    const voteDown = document.createElement('button');
    voteDown.textContent = '👎';
    voteDown.className = 'vote-btn';
    voteDown.dataset.song = idx;
    voteDown.dataset.vote = 'down';

    const voteCounts = document.createElement('span');
    voteCounts.className = 'vote-counts';

    voteContainer.append(voteUp, voteDown, voteCounts);
    row.append(link, voteContainer);
    list.appendChild(row);

    updateVoteCounts(idx, voteCounts);

    [voteUp, voteDown].forEach(btn => {
      btn.addEventListener('click', async () => {
        await supabaseClient.from('votes').insert({ song_id: idx, vote: btn.dataset.vote });
        updateVoteCounts(idx, voteCounts);
      });
    });
  });

  async function updateVoteCounts(songId, el) {
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

      el.textContent = `👍 ${up || 0}  👎 ${down || 0}`;
    } catch {
      el.textContent = 'Votes unavailable';
    }
  }
});
