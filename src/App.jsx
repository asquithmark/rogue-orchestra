import { useEffect, useMemo, useRef, useState } from 'react';
import tracks from './data/tracks.js';

const resolveAssetUrl = (path) => {
  if (!path) return '';
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return new URL(normalized, import.meta.env.BASE_URL).toString();
};

export default function App() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(tracks.length ? 0 : null);
  const audioRef = useRef(null);
  const resolvedTracks = useMemo(
    () =>
      tracks.map((track) => ({
        ...track,
        resolvedSrc: resolveAssetUrl(track.src),
        resolvedArtwork: resolveAssetUrl(track.artwork)
      })),
    []
  );

  useEffect(() => {
    if (currentTrackIndex === null) return;
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const track = resolvedTracks[currentTrackIndex];
    if (!track) return;

    if (audioElement.src !== track.resolvedSrc) {
      audioElement.src = track.resolvedSrc;
    }
  }, [currentTrackIndex, resolvedTracks]);

  const handlePlayTrack = (index) => {
    if (index === currentTrackIndex) {
      audioRef.current?.play().catch(() => {});
      return;
    }

    setCurrentTrackIndex(index);

    requestAnimationFrame(() => {
      audioRef.current?.play().catch(() => {});
    });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-10 sm:px-8">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Rogue Orchestra</h1>
        <p className="text-base text-slate-600">
          A simple list of tracks you can play right in your browser.
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium text-slate-800">Now playing</h2>
          {currentTrackIndex === null ? (
            <p className="mt-4 text-sm text-slate-500">Add songs to start listening.</p>
          ) : (
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-base font-medium text-slate-900">{resolvedTracks[currentTrackIndex].title}</p>
                {resolvedTracks[currentTrackIndex].credits ? (
                  <p className="text-sm text-slate-500">{resolvedTracks[currentTrackIndex].credits}</p>
                ) : null}
              </div>
              <audio ref={audioRef} className="w-full" controls preload="metadata">
                {currentTrackIndex !== null ? (
                  <source src={resolvedTracks[currentTrackIndex].resolvedSrc} type="audio/mpeg" />
                ) : null}
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium text-slate-800">Tracks</h2>
          {resolvedTracks.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">There are no tracks yet. Update src/data/tracks.js with your music.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {resolvedTracks.map((track, index) => {
                const isActive = index === currentTrackIndex;
                return (
                  <li
                    key={track.id || track.title}
                    className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-base font-medium text-slate-900">{track.title}</p>
                      {track.credits ? <p className="text-sm text-slate-500">{track.credits}</p> : null}
                    </div>
                    <div className="flex items-center gap-3">
                      {isActive ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Playing</span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handlePlayTrack(index)}
                        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        {isActive ? 'Play again' : 'Play'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
