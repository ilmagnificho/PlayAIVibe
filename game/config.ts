import Phaser from 'phaser';

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

// Note Mechanics
export const NOTE_FALL_TIME_MS = 1500; // Time from top to hit line (milliseconds) - Defines speed effectively
export const HIT_LINE_Y = 700;
export const SPAWN_Y = -50;

// Lanes (Centered)
export const LANE_WIDTH = 80;
export const LANE_START_X = (GAME_WIDTH - (LANE_WIDTH * 4)) / 2 + (LANE_WIDTH / 2);

// PlayAivibe Brand Colors
export const COLORS = {
  // Lanes 0 and 3 (Outer): Vivid Purple
  LANE_0: 0x8B5CF6, 
  LANE_3: 0x8B5CF6,
  
  // Lanes 1 and 2 (Inner): Cyan
  LANE_1: 0x06B6D4, 
  LANE_2: 0x06B6D4,
  
  HIT_LINE: 0xffffff,
  BACKGROUND: 0x050505, // Very dark grey/black
  
  // UI Text Colors
  TEXT_PERFECT: 0x06B6D4, // Cyan
  TEXT_GOOD: 0x8B5CF6,    // Purple
  TEXT_MISS: 0xFF4444
};

// Input Keys
export const INPUT_KEYS = ['D', 'F', 'J', 'K'];

export const createPhaserConfig = (parent: string, scene: any): Phaser.Types.Core.GameConfig => {
  return {
    type: Phaser.AUTO,
    parent: parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#050505',
    scene: scene,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    audio: {
        disableWebAudio: false
    }
  };
};