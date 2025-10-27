import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';
import MiniPlayerBar from '../components/MiniPlayerBar.jsx';
import { getDominantColor } from '../utils/colorFromArtwork.js';

export default function AlbumPage() {
  const navigate = useNavigate();
  const { tracks, playTrackByIndex, shufflePlay, currentTrackIndex } = usePlayer();
  const heroArtwork = tracks[0]?.artwork;

  const { gradient } = useMemo(() => getDominantColor(heroArtwork), [heroArtwork]);

  const handlePlayAll = () => {
    if (!tracks.length) return;
    playTrackByIndex(0);
    navigate(`/track/${tracks[0].id}`);
  };

  const handleShuffle = () => {
    if (!tracks.length) return;
    const randomIndex = shufflePlay();
    const nextTrack = tracks[randomIndex];
    if (nextTrack) {
      navigate(`/track/${nextTrack.id}`);
    }
  };

  const handleSelectTrack = (index) => {
    playTrackByIndex(index);
    const chosen = tracks[index];
    if (chosen) {
      navigate(`/track/${chosen.id}`);
    }
  };

  return (
    <div className="relative flex flex-1 flex-col pb-24">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: gradient, filter: 'brightness(1.05)' }}
        aria-hidden="true"
      />
      <header className="flex flex-col items-center text-center text-slate-900 transition dark:text-slate-100">
        <div className="relative mt-8 aspect-square w-64 max-w-[70vw] overflow-hidden rounded-[40px] shadow-glass-lg">
          {heroArtwork ? (
            <img src={heroArtwork} alt="Album artwork" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/10 text-lg font-semibold">
              add your artwork
            </div>
          )}
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.4em] text-slate-600 dark:text-slate-300">the rogue orchestra</p>
        <h1 className="mt-2 text-3xl font-semibold text-glow-light dark:text-glow-dark">unreleased demos</h1>
        <div className="mt-6 flex w-full max-w-sm items-center justify-center gap-3">
          <button
            type="button"
            onClick={handlePlayAll}
            className="glass-surface glass-border-light dark:glass-border-dark flex flex-1 items-center justify-center gap-2 rounded-full border bg-white/30 py-3 text-base font-semibold text-slate-900 shadow-glass-md transition hover:-translate-y-0.5 hover:shadow-glass-lg dark:bg-white/10 dark:text-white"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-slate-900 dark:bg-white/20 dark:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M8 5v14l10-7-10-7z" />
              </svg>
            </span>
            Play
          </button>
          <button
            type="button"
            onClick={handleShuffle}
            className="glass-surface glass-border-light dark:glass-border-dark flex flex-1 items-center justify-center gap-2 rounded-full border bg-white/20 py-3 text-base font-semibold text-slate-900 shadow-glass-md transition hover:-translate-y-0.5 hover:shadow-glass-lg dark:bg-white/10 dark:text-white"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-slate-900 dark:bg-white/20 dark:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M4 4h2.5a6.5 6.5 0 0 1 5.2 2.6l1.6 2.14A4.5 4.5 0 0 0 17.5 10H20v2h-2.5a6.5 6.5 0 0 1-5.2-2.6L10.7 7.26A4.5 4.5 0 0 0 6.5 6H4V4zm0 10h2.5a4.5 4.5 0 0 1 3.6 1.8l1.6 2.14A6.5 6.5 0 0 0 17.5 20H20v-2h-2.5a4.5 4.5 0 0 1-3.6-1.8l-1.6-2.14A6.5 6.5 0 0 0 6.5 12H4v2zm15-7h2v4h-2V7zm0 8h2v4h-2v-4z" />
              </svg>
            </span>
            Shuffle
          </button>
        </div>
      </header>
      <section className="mt-10 space-y-3">
        {tracks.map((track, index) => (
          <button
            key={track.id}
            type="button"
            onClick={() => handleSelectTrack(index)}
            className="glass-surface glass-border-light dark:glass-border-dark flex w-full items-center justify-between rounded-3xl border bg-white/15 px-4 py-3 text-left text-slate-900 transition hover:-translate-y-0.5 hover:shadow-glass-md dark:bg-white/5 dark:text-slate-100"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-sm font-semibold text-slate-900 dark:bg-white/20 dark:text-white">
                {index + 1}
              </span>
              <div className="flex flex-col">
                <span className="text-lg font-semibold leading-tight text-glow-light dark:text-glow-dark">
                  {track.title}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {track.credits || 'add credits here'}
                </span>
              </div>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 text-slate-900 transition dark:bg-white/10 dark:text-white">
              {currentTrackIndex === index ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M5 5h3v14H5zm5 0h3v14h-3zm5 0h4v14h-4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M8 5v14l9-7-9-7z" />
                </svg>
              )}
            </span>
          </button>
        ))}
      </section>
      <MiniPlayerBar />
    </div>
  );
}
