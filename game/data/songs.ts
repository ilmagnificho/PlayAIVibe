import { BeatmapNote } from '../../types';

// Twinkle Twinkle Little Star Melody & Chart
// Melody: C C G G A A G (Hold) -> F F E E D D C (Hold)
export const TWINKLE_BEATMAP: BeatmapNote[] = [
  // "Twin-kle Twin-kle" (C C G G)
  { time: 0.0, lane: 0, type: 'short' }, // C
  { time: 0.5, lane: 0, type: 'short' }, // C
  { time: 1.0, lane: 3, type: 'short' }, // G
  { time: 1.5, lane: 3, type: 'short' }, // G
  
  // "Lit-tle Star" (A A G)
  { time: 2.0, lane: 1, type: 'short' }, // A (Visual mapping: Inner Lane)
  { time: 2.5, lane: 1, type: 'short' }, // A
  { time: 3.0, lane: 3, type: 'long', duration: 1.0 }, // G (Hold)

  // "How I won-der" (F F E E)
  { time: 4.5, lane: 2, type: 'short' }, // F
  { time: 5.0, lane: 2, type: 'short' }, // F
  { time: 5.5, lane: 1, type: 'short' }, // E
  { time: 6.0, lane: 1, type: 'short' }, // E

  // "What you are" (D D C)
  { time: 6.5, lane: 0, type: 'short' }, // D
  { time: 7.0, lane: 0, type: 'short' }, // D
  { time: 7.5, lane: 0, type: 'long', duration: 1.0 }, // C (Hold)

  // (Repeat 2nd Section similar to "Up above the world so high")
  // "Up a-bove the" (G G F F)
  { time: 9.0, lane: 3, type: 'short' }, 
  { time: 9.5, lane: 3, type: 'short' },
  { time: 10.0, lane: 2, type: 'short' },
  { time: 10.5, lane: 2, type: 'short' },
  // "World so high" (E E D)
  { time: 11.0, lane: 1, type: 'short' },
  { time: 11.5, lane: 1, type: 'short' },
  { time: 12.0, lane: 0, type: 'short' }, // D (Short)

  // "Like a dia-mond" (G G F F)
  { time: 13.5, lane: 3, type: 'short' }, 
  { time: 14.0, lane: 3, type: 'short' },
  { time: 14.5, lane: 2, type: 'short' },
  { time: 15.0, lane: 2, type: 'short' },
  // "In the sky" (E E D)
  { time: 15.5, lane: 1, type: 'short' },
  { time: 16.0, lane: 1, type: 'short' },
  { time: 16.5, lane: 0, type: 'long', duration: 1.0 },
];

export const TWINKLE_MELODY_MAP: { [key: number]: number } = {
  // C4
  0.0: 261.63, 0.5: 261.63, 7.5: 261.63,
  // D4
  6.5: 293.66, 7.0: 293.66, 12.0: 293.66, 16.5: 293.66,
  // E4
  5.5: 329.63, 6.0: 329.63, 11.0: 329.63, 11.5: 329.63, 15.5: 329.63, 16.0: 329.63,
  // F4
  4.5: 349.23, 5.0: 349.23, 10.0: 349.23, 10.5: 349.23, 14.5: 349.23, 15.0: 349.23,
  // G4
  1.0: 392.00, 1.5: 392.00, 3.0: 392.00, 9.0: 392.00, 9.5: 392.00, 13.5: 392.00, 14.0: 392.00,
  // A4
  2.0: 440.00, 2.5: 440.00
};