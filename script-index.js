document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const songIndex = parseInt(urlParams.get('song'), 10);

  const voteContainer = document.createElement('div');
  voteContainer.className = 'vote-container';

  const voteUp = document.createElement('button');
  voteUp.textContent = '👍';
  voteUp.className = 'vote-btn';
  voteUp.style.marginRight = '8px';
  voteUp.style.padding = '6px 12px';
  voteUp.style.fontSize = '1.2rem';
  voteUp.style.cursor = 'pointer';
  voteUp.style.backgroundColor = '#1a1a1a';
  voteUp.style.color = '#fff';
  voteUp.style.border = '1px solid #444';
  voteUp.style.borderRadius = '4px';
  voteUp.style.transition = 'background 0.3s';
  voteUp.dataset.song = songIndex;
  voteUp.dataset.vote = 'up';

  const voteDown = document.createElement('button');
  voteDown.textContent = '👎';
  voteDown.className = 'vote-btn';
  voteDown.style.marginRight = '8px';
  voteDown.style.padding = '6px 12px';
  voteDown.style.fontSize = '1.2rem';
  voteDown.style.cursor = 'pointer';
  voteDown.style.backgroundColor = '#1a1a1a';
  voteDown.style.color = '#fff';
  voteDown.style.border = '1px solid #444';
  voteDown.style.borderRadius = '4px';
  voteDown.style.transition = 'background 0.3s';
  voteDown.dataset.song = songIndex;
  voteDown.dataset.vote = 'down';

  const voteCounts = document.createElement('span');
  voteCounts.className = 'vote-counts';
  voteCounts.textContent = 'Loading...';
  voteCounts.style.marginLeft = '10px';
  voteCounts.style.fontSize = '1rem';

  voteContainer.appendChild(voteUp);
  voteContainer.appendChild(voteDown);
  voteContainer.appendChild(voteCounts);
  voteContainer.style.display = 'flex';
  voteContainer.style.alignItems = 'center';
  voteContainer.style.margin = '20px 0';
  document.body.appendChild(voteContainer);

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
    } catch (err) {
      voteCounts.textContent = 'Votes unavailable';
    }
  }

  updateVoteCounts(songIndex);

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

  // Apply initial theme
  applyThemeStyles();

  // Observe theme changes
  const observer = new MutationObserver(() => applyThemeStyles());
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
});
