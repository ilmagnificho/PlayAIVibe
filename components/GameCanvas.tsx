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
  const containerRef = useRef<HTMLDivElement>(null);

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
    game.events.once('ready', () => {
        const runningScene = game.scene.getScene('RhythmScene') as RhythmScene;
        if (runningScene) {
            runningScene.init({ onScoreUpdate });
        }
        // Focus the container automatically when game is ready so keyboard works immediately
        if (containerRef.current) {
            containerRef.current.focus();
        }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onScoreUpdate]);

  // Handle click to refocus (fixes lost focus if user clicks outside)
  const handleFocus = () => {
    if (containerRef.current) {
        containerRef.current.focus();
    }
  };

  return (
    <div 
        id="game-container" 
        ref={containerRef}
        tabIndex={0} // Make div focusable for key events
        onClick={handleFocus}
        className="w-full h-full rounded-lg overflow-hidden shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all flex items-center justify-center bg-black" 
    />
  );
};

export default GameCanvas;