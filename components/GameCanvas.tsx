import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createPhaserConfig } from '../game/config';
import RhythmScene from '../game/scenes/RhythmScene';

interface GameCanvasProps {
  onScoreUpdate: (score: number, combo: number) => void;
  onGameEnd: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onScoreUpdate, onGameEnd }) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Ensure we don't create multiple instances (React 18 Strict Mode double-invokation)
    if (gameRef.current) return;

    // Initialize Scene
    const scene = new RhythmScene();

    // Initialize Game
    const config = createPhaserConfig('game-container', scene);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Pass React callbacks to Scene via registry or direct init
    // Note: We need to wait for scene to be ready or pass data via Scene.start
    // Since RhythmScene is the default scene, we use registry or event emitters.
    // However, for this MVP, we can access the scene after boot or pass via init in a custom flow.
    // Simplest way for MVP integration:
    game.events.once('ready', () => {
        // Find the running scene
        const runningScene = game.scene.getScene('RhythmScene') as RhythmScene;
        if (runningScene) {
            runningScene.init({ onScoreUpdate });
        }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onScoreUpdate]);

  return <div id="game-container" className="rounded-lg overflow-hidden shadow-2xl" />;
};

export default GameCanvas;