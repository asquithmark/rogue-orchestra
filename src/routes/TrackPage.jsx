import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GlassPanel from '../components/GlassPanel.jsx';
import Scrubber from '../components/Scrubber.jsx';
import TransportControls from '../components/TransportControls.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { getDominantColor } from '../utils/colorFromArtwork.js';

export default function TrackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tracks, playTrackByIndex, currentTrackIndex, currentTrack } = usePlayer();

  const requestedTrackIndex = tracks.findIndex((track) => track.id === id);

  useEffect(() => {
    if (requestedTrackIndex !== -1 && requestedTrackIndex !== currentTrackIndex) {
      playTrackByIndex(requestedTrackIndex);
    }
  }, [requestedTrackIndex, currentTrackIndex, playTrackByIndex]);

  const activeTrack = requestedTrackIndex !== -1 ? tracks[requestedTrackIndex] : currentTrack;
  const artwork = activeTrack?.artwork;
  const credits = activeTrack?.credits || 'add credits here.';

  const { gradient } = useMemo(() => getDominantColor(artwork), [artwork]);

  if (!activeTrack) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center text-slate-900 dark:text-slate-100">
        <p className="text-lg">Choose a song from the album page to start listening.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="glass-surface glass-border-light dark:glass-border-dark rounded-full border bg-white/30 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-glass-md dark:bg-white/10 dark:text-white"
        >
          go to album
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col pb-10">
      <div className="absolute inset-0 -z-10" style={{ background: gradient }} aria-hidden="true" />
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="glass-surface glass-border-light dark:glass-border-dark absolute left-0 top-0 z-10 mt-2 flex h-11 w-11 items-center justify-center rounded-full border bg-white/30 text-slate-900 transition hover:-translate-y-0.5 hover:shadow-glass-md dark:bg-white/10 dark:text-white"
        aria-label="Back to previous page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="flex flex-1 flex-col items-center pt-10 text-slate-900 transition dark:text-slate-100">
        <div className="relative mt-4 aspect-square w-72 max-w-[80vw] overflow-hidden rounded-[44px] shadow-glass-lg">
          <img src={artwork} alt={`${activeTrack.title} artwork`} className="h-full w-full object-cover" />
        </div>
        <GlassPanel className="mt-8 w-full max-w-[480px]">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-600 dark:text-slate-300">the rogue orchestra</p>
              <h2 className="mt-2 text-3xl font-semibold text-glow-light dark:text-glow-dark">{activeTrack.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{credits}</p>
            </div>
            <Scrubber />
            <TransportControls />
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
