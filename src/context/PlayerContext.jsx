import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import tracks from '../data/tracks.js';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(typeof Audio !== 'undefined' ? new Audio() : null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audio = audioRef.current;

  const playTrackByIndex = useCallback((index) => {
    if (index < 0 || index >= tracks.length) return;
    setCurrentTrackIndex(index);
  }, []);

  const playNext = useCallback(() => {
    setCurrentTrackIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % tracks.length;
    });
  }, []);

  const playPrev = useCallback(() => {
    setCurrentTrackIndex((prev) => {
      if (prev === null) return tracks.length - 1;
      return (prev - 1 + tracks.length) % tracks.length;
    });
  }, []);

  const seekTo = useCallback(
    (seconds) => {
      if (!audio || Number.isNaN(seconds)) return;
      audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || seconds));
      setCurrentTime(audio.currentTime);
    },
    [audio]
  );

  const togglePlayPause = useCallback(() => {
    if (!audio) return;
    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => console.warn('Playback prevented by the browser:', error));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [audio]);

  const shufflePlay = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * tracks.length);
    playTrackByIndex(randomIndex);
    return randomIndex;
  }, [playTrackByIndex]);

  useEffect(() => {
    if (!audio) return undefined;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audio, playNext]);

  useEffect(() => {
    if (!audio || currentTrackIndex === null) return;
    const track = tracks[currentTrackIndex];
    if (!track) return;

    audio.src = track.src;
    audio.load();

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.warn('Playback was prevented by the browser until user interaction.', error);
        setIsPlaying(false);
      }
    };

    playAudio();
    setCurrentTime(0);

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: 'the rogue orchestra',
          album: 'unreleased demos',
          artwork: [
            { src: track.artwork, sizes: '256x256', type: 'image/jpeg' },
            { src: track.artwork, sizes: '512x512', type: 'image/jpeg' }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
        navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
        navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
        navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
        if ('setActionHandler' in navigator.mediaSession) {
          navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.fastSeek && 'fastSeek' in audio) {
              audio.fastSeek(details.seekTime);
            } else if (typeof details.seekTime === 'number') {
              seekTo(details.seekTime);
            }
          });
        }
      } catch (error) {
        console.warn('Media Session API is unavailable or restricted.', error);
      }
    }
  }, [audio, currentTrackIndex, playNext, playPrev, seekTo, togglePlayPause]);

  const value = useMemo(
    () => ({
      tracks,
      currentTrackIndex,
      currentTrack: currentTrackIndex !== null ? tracks[currentTrackIndex] : null,
      isPlaying,
      currentTime,
      duration,
      playTrackByIndex,
      togglePlayPause,
      seekTo,
      playNext,
      playPrev,
      shufflePlay
    }),
    [currentTrackIndex, currentTime, duration, isPlaying, playNext, playPrev, playTrackByIndex, shufflePlay, togglePlayPause]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
