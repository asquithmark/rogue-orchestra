import { Routes, Route, useLocation } from 'react-router-dom';
import AlbumPage from './routes/AlbumPage.jsx';
import TrackPage from './routes/TrackPage.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { usePlayer } from './context/PlayerContext.jsx';
import { useEffect } from 'react';
import { getDominantColor } from './utils/colorFromArtwork.js';

export default function App() {
  const location = useLocation();
  const { currentTrack, tracks } = usePlayer();

  useEffect(() => {
    const artwork = currentTrack?.artwork || tracks[0]?.artwork;
    const { gradient } = getDominantColor(artwork);
    document.body.style.setProperty('--app-background-gradient', gradient);
  }, [currentTrack, tracks]);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.45),_rgba(17,24,39,0.95))] dark:bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.9),_rgba(2,6,23,0.96))] transition-colors duration-500">
      <div className="relative mx-auto flex min-h-screen max-w-screen-sm flex-col px-4 pb-6 pt-6 sm:px-6">
        <ThemeToggle />
        <Routes location={location}>
          <Route path="/" element={<AlbumPage />} />
          <Route path="/track/:id" element={<TrackPage />} />
        </Routes>
      </div>
    </div>
  );
}
