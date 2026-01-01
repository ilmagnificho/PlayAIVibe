// Data Contract for Beatmaps
export interface BeatmapNote {
  time: number;       // Time in seconds when the note should be hit
  lane: 0 | 1 | 2 | 3; // Lane index (0-3 for 4 keys)
  type: 'short' | 'long';
  duration?: number;  // Duration for long notes in seconds
}

export interface GameConfig {
  noteSpeed: number;  // Pixels per second (fallback calculation)
  approachTime: number; // Time in seconds for note to travel from spawn to hit line
  hitWindow: {
    perfect: number;
    good: number;
    bad: number;
  };
}

export interface ScoreData {
  score: number;
  combo: number;
  perfect: number;
  good: number;
  miss: number;
}