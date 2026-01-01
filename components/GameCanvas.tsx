import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createPhaserConfig } from '../game/config';
import RhythmScene from '../game/scenes/RhythmScene';

interface GameCanvasProps {
  onScoreUpdate: (score: number, combo: number) => void;
  onGameEnd: () => void;
  isGameActive: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onScoreUpdate, onGameEnd, isGameActive }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<RhythmScene | null>(null);

  useEffect(() => {
    // Ensure we don't create multiple instances (React 18 Strict Mode double-invokation)
    if (gameRef.current) return;

    // Initialize Scene
    const scene = new RhythmScene();
    sceneRef.current = scene;

    // Initialize Game
    const config = createPhaserConfig('game-container', scene);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Pass React callbacks to Scene via registry or direct init
    game.events.once('ready', () => {
        if (sceneRef.current) {
            sceneRef.current.init({ onScoreUpdate });
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
        sceneRef.current = null;
      }
    };
  }, [onScoreUpdate]);

  // Watch for Active State Change to start game
  useEffect(() => {
    if (isGameActive && sceneRef.current) {
        console.log("React requesting Game Start...");
        sceneRef.current.startSession();
        
        // Ensure focus stays on game when starting
        if (containerRef.current) containerRef.current.focus();
    }
  }, [isGameActive]);

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