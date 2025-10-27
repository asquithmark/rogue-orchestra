import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function MiniPlayerBar() {
  const navigate = useNavigate();
  const { currentTrack, togglePlayPause, playNext, isPlaying } = usePlayer();

  if (!currentTrack || !isPlaying) {
    return null;
  }

  const handleOpenTrack = () => {
    navigate(`/track/${currentTrack.id}`);
  };

  return (
    <div className="pointer-events-auto">
      <div className="glass-surface glass-border-light dark:glass-border-dark fixed bottom-6 left-1/2 z-20 flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-4 rounded-full border bg-glass-light/90 px-4 py-2 shadow-glass-md backdrop-blur-2xl transition dark:bg-glass-dark/80 dark:shadow-glass-lg">
        <button
          type="button"
          onClick={handleOpenTrack}
          className="flex flex-1 items-center gap-3 text-left text-sm text-slate-900 dark:text-slate-100"
        >
          <span className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl">
            <img
              src={currentTrack.artwork}
              alt="Current track artwork"
              className="h-full w-full object-cover"
            />
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-base font-semibold leading-tight text-glow-light dark:text-glow-dark">
              {currentTrack.title}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300">the rogue orchestra</span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={isPlaying ? 'Pause playback' : 'Resume playback'}
            onClick={togglePlayPause}
            className="glass-surface glass-border-light dark:glass-border-dark flex h-12 w-12 items-center justify-center rounded-full border bg-white/10 text-slate-900 shadow-inner transition hover:scale-105 dark:bg-white/10 dark:text-white"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M8 5.5v13l9-6.5-9-6.5z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            aria-label="Skip to next track"
            onClick={playNext}
            className="glass-surface glass-border-light dark:glass-border-dark flex h-12 w-12 items-center justify-center rounded-full border bg-white/10 text-slate-900 shadow-inner transition hover:scale-105 dark:bg-white/10 dark:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M5 5.5v13l7-5v5h2v-13h-2v5l-7-5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
