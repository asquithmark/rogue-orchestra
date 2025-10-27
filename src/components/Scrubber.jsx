import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function Scrubber() {
  const { duration, currentTime, seekTo } = usePlayer();
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);

  const handlePositionFromEvent = useCallback((event) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(Math.max(ratio, 0), 1);
  }, []);

  const beginDrag = useCallback(
    (event) => {
      event.preventDefault();
      const ratio = handlePositionFromEvent(event);
      setIsDragging(true);
      setDragPosition(ratio);
    },
    [handlePositionFromEvent]
  );

  const continueDrag = useCallback(
    (event) => {
      if (!isDragging) return;
      event.preventDefault();
      const ratio = handlePositionFromEvent(event);
      setDragPosition(ratio);
    },
    [handlePositionFromEvent, isDragging]
  );

  const endDrag = useCallback(
    (event) => {
      if (!isDragging) return;
      event.preventDefault();
      const ratio = handlePositionFromEvent(event);
      setIsDragging(false);
      setDragPosition(ratio);
      seekTo(ratio * duration);
    },
    [duration, handlePositionFromEvent, isDragging, seekTo]
  );

  useEffect(() => {
    if (!isDragging) return undefined;

    const handlePointerMove = (event) => continueDrag(event);
    const handlePointerUp = (event) => endDrag(event);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [continueDrag, endDrag, isDragging]);

  const progress = useMemo(() => {
    const safeDuration = duration || 1;
    const baseProgress = currentTime / safeDuration;
    if (isDragging) {
      return dragPosition;
    }
    return Math.min(Math.max(baseProgress, 0), 1);
  }, [currentTime, duration, dragPosition, isDragging]);

  return (
    <div className="mt-8 flex flex-col gap-3">
      <div className="flex justify-between text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
        <span>{formatTime(progress * duration)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration || 0}
        aria-valuenow={progress * (duration || 0)}
        tabIndex={0}
        onPointerDown={beginDrag}
        onTouchStart={beginDrag}
        onTouchMove={continueDrag}
        onTouchEnd={endDrag}
        className="glass-surface glass-border-light dark:glass-border-dark relative h-14 w-full overflow-hidden rounded-[26px] border bg-white/10 shadow-glass-sm dark:bg-white/10"
      >
        <div className="absolute inset-0 opacity-60">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 20">
            <path
              d="M0 10 Q5 6 10 10 T20 10 T30 10 T40 10 T50 10 T60 10 T70 10 T80 10 T90 10 T100 10"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div
          className="absolute inset-y-0 left-0 rounded-[26px] bg-gradient-to-r from-white/70 via-white/50 to-transparent dark:from-slate-100/60 dark:via-slate-100/30"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-6 w-6 -translate-y-1/2 translate-x-[-50%] rounded-full border border-white/60 bg-white shadow-lg transition dark:border-white/40 dark:bg-slate-200"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
