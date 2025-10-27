// Placeholder helper that returns a fallback gradient inspired by Apple Music.
// Replace the fallback implementation with a real dominant colour extraction when you are ready.
export function getDominantColor(artworkSrc) {
  if (!artworkSrc) {
    return {
      gradient:
        'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.45), rgba(17, 24, 39, 0.92))',
      baseColor: '#6366f1'
    };
  }

  // Future improvement: draw the artwork to an offscreen canvas and calculate the average pixel colour here.
  return {
    gradient:
      'radial-gradient(circle at top, rgba(244, 114, 182, 0.45), rgba(15, 23, 42, 0.95))',
    baseColor: '#f472b6'
  };
}
