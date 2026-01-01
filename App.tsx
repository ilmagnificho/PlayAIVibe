import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import { Sparkles, Music, Upload, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  const handleGameStart = () => {
    setIsPlaying(true);
  };

  const handleGameEnd = () => {
    setIsPlaying(false);
  };

  const handleUpdateScore = (points: number, currentCombo: number) => {
    setScore(points);
    setCombo(currentCombo);
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-neutral-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Music className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            NeonFlow
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-neutral-400 uppercase tracking-wider">Score</span>
            <span className="text-2xl font-mono font-bold text-white leading-none">
              {score.toLocaleString().padStart(7, '0')}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-neutral-400 uppercase tracking-wider">Combo</span>
            <span className={`text-2xl font-mono font-bold leading-none ${combo > 10 ? 'text-purple-400' : 'text-neutral-500'}`}>
              x{combo}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black">
        
        {/* Game Container */}
        <div className="relative z-0 w-full h-full flex items-center justify-center p-4">
           <GameCanvas 
             onScoreUpdate={handleUpdateScore} 
             onGameEnd={handleGameEnd}
           />
        </div>

        {/* UI Overlay / Controls (Side Panel - Simplified for MVP) */}
        {!isPlaying && (
          <div className="absolute top-4 left-4 z-10 w-64 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
             <h2 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Dev Controls
             </h2>
             <p className="text-xs text-neutral-500 mb-4">
               The game attempts to load 'song.mp3' and 'beatmap.json' from public/. If missing, it generates a demo beatmap.
             </p>
             <div className="flex gap-2">
                <button className="flex-1 bg-white/5 hover:bg-white/10 transition py-2 rounded text-xs border border-white/10">
                  <Upload className="w-3 h-3 inline mr-1" /> Import Suno
                </button>
                <button className="flex-1 bg-white/5 hover:bg-white/10 transition py-2 rounded text-xs border border-white/10">
                  <Settings className="w-3 h-3 inline mr-1" /> Config
                </button>
             </div>
          </div>
        )}
      </main>
      
      {/* Footer Instructions */}
      <footer className="h-10 border-t border-white/10 bg-neutral-900 flex items-center justify-center text-xs text-neutral-500 gap-8">
        <span className="flex items-center gap-1"><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-white/10 text-neutral-300">D</kbd> Lane 1</span>
        <span className="flex items-center gap-1"><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-white/10 text-neutral-300">F</kbd> Lane 2</span>
        <span className="flex items-center gap-1"><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-white/10 text-neutral-300">J</kbd> Lane 3</span>
        <span className="flex items-center gap-1"><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-white/10 text-neutral-300">K</kbd> Lane 4</span>
      </footer>
    </div>
  );
};

export default App;