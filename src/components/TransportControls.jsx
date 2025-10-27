import { usePlayer } from '../context/PlayerContext.jsx';

export default function TransportControls({ layout = 'default' }) {
  const { togglePlayPause, playNext, playPrev, isPlaying } = usePlayer();
  const sizeClass = layout === 'compact' ? 'h-12 w-12' : 'h-14 w-14';

  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      <button
        type="button"
        aria-label="Play previous track"
        onClick={playPrev}
        className={`glass-surface glass-border-light dark:glass-border-dark flex ${sizeClass} items-center justify-center rounded-full border bg-white/10 text-slate-900 transition hover:scale-105 dark:bg-white/10 dark:text-white`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M6 5v14h2V13l8 6V5l-8 6V5z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={isPlaying ? 'Pause track' : 'Play track'}
        onClick={togglePlayPause}
        className={`glass-surface glass-border-light dark:glass-border-dark flex ${layout === 'compact' ? 'h-14 w-14' : 'h-16 w-16'} items-center justify-center rounded-full border bg-white/20 text-slate-900 transition hover:scale-105 dark:bg-white/10 dark:text-white`}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
            <rect x="7" y="5" width="4" height="14" rx="1" />
            <rect x="13" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
            <path d="M8 5v14l10-7-10-7z" />
          </svg>
        )}
      </button>
      <button
        type="button"
        aria-label="Play next track"
        onClick={playNext}
        className={`glass-surface glass-border-light dark:glass-border-dark flex ${sizeClass} items-center justify-center rounded-full border bg-white/10 text-slate-900 transition hover:scale-105 dark:bg-white/10 dark:text-white`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M18 5v14h-2V13l-8 6V5l8 6V5z" />
        </svg>
      </button>
    </div>
  );
}
