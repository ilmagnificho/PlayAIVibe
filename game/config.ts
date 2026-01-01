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

// Colors
export const COLORS = {
  LANE_0: 0xff4081, // Pink
  LANE_1: 0x00e5ff, // Cyan
  LANE_2: 0x00e5ff, // Cyan
  LANE_3: 0xff4081, // Pink
  HIT_LINE: 0xffffff,
  BACKGROUND: 0x000000
};

// Input Keys
export const INPUT_KEYS = ['D', 'F', 'J', 'K'];

export const createPhaserConfig = (parent: string, scene: any): Phaser.Types.Core.GameConfig => {
  return {
    type: Phaser.AUTO,
    parent: parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#0a0a0a',
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