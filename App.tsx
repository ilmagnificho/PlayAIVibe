import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import { Sparkles, Music, Upload, Settings, Play } from 'lucide-react';

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

  const handleNotImplemented = () => {
    alert("This feature is coming soon in the next update!");
  };

  return (
    <div className="flex flex-col h-screen bg-brand-dark text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/80 backdrop-blur-md z-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/10 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-white to-brand-cyan bg-clip-text text-transparent leading-none">
              PlayAivibe
            </h1>
            <span className="text-[10px] text-brand-cyan uppercase tracking-[0.2em] font-medium opacity-80">
              Feel the AI
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Score</span>
            <span className="text-2xl font-mono font-bold text-white leading-none tracking-widest text-shadow-glow">
              {score.toLocaleString().padStart(7, '0')}
            </span>
          </div>
          <div className="flex flex-col items-end w-20">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Combo</span>
            <span className={`text-2xl font-mono font-bold leading-none transition-colors duration-100 ${combo > 10 ? 'text-brand-cyan' : 'text-neutral-600'}`}>
              x{combo}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex items-center justify-center bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#050505_100%)]">
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl" />
        </div>

        {/* Game Container */}
        <div className="relative z-0 w-full h-full flex items-center justify-center p-4">
           <GameCanvas 
             onScoreUpdate={handleUpdateScore} 
             onGameEnd={handleGameEnd}
             isGameActive={isPlaying}
           />
        </div>

        {/* UI Overlay / Controls - Centered */}
        {!isPlaying && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
             {/* Modal container with pointer-events-auto to allow clicks */}
             <div className="w-72 p-5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-auto">
                 <div className="flex items-center gap-2 mb-4">
                   <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                     <Sparkles className="w-4 h-4 text-yellow-400" />
                   </div>
                   <h2 className="text-sm font-bold text-white tracking-wide">Ready to Vibe?</h2>
                 </div>
                 
                 <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                   Welcome to <span className="text-brand-purple font-bold">PlayAivibe</span>. 
                   The system is attempting to load <code className="bg-white/10 px-1 py-0.5 rounded text-white">sample-map.json</code>.
                   If missing, AI will generate a demo pattern.
                 </p>
                 
                 <div className="space-y-3">
                    <button 
                      onClick={handleGameStart}
                      className="w-full group bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-indigo-500 hover:to-brand-purple transition-all duration-300 py-3 rounded-xl text-sm font-bold shadow-[0_4px_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" /> Start Session
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleNotImplemented}
                        className="flex items-center justify-center bg-white/5 hover:bg-white/10 transition py-2.5 rounded-lg text-xs font-medium border border-white/5 hover:border-white/20 cursor-pointer active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5 mr-2 text-brand-cyan" /> Upload MP3
                      </button>
                      <button 
                        onClick={handleNotImplemented}
                        className="flex items-center justify-center bg-white/5 hover:bg-white/10 transition py-2.5 rounded-lg text-xs font-medium border border-white/5 hover:border-white/20 cursor-pointer active:scale-95"
                      >
                        <Settings className="w-3.5 h-3.5 mr-2 text-neutral-400" /> Config
                      </button>
                    </div>
                 </div>
             </div>
          </div>
        )}
      </main>
      
      {/* Footer Instructions */}
      <footer className="h-12 border-t border-white/5 bg-black/90 flex items-center justify-center text-xs text-neutral-500 gap-10 relative z-10">
        <span className="flex items-center gap-2">
           <kbd className="w-6 h-6 flex items-center justify-center bg-neutral-900 border border-white/10 rounded text-brand-purple font-bold shadow-inner">D</kbd> 
        </span>
        <span className="flex items-center gap-2">
           <kbd className="w-6 h-6 flex items-center justify-center bg-neutral-900 border border-white/10 rounded text-brand-cyan font-bold shadow-inner">F</kbd> 
        </span>
        
        <span className="opacity-20">|</span>
        
        <span className="flex items-center gap-2">
           <kbd className="w-6 h-6 flex items-center justify-center bg-neutral-900 border border-white/10 rounded text-brand-cyan font-bold shadow-inner">J</kbd> 
        </span>
        <span className="flex items-center gap-2">
           <kbd className="w-6 h-6 flex items-center justify-center bg-neutral-900 border border-white/10 rounded text-brand-purple font-bold shadow-inner">K</kbd> 
        </span>
      </footer>
    </div>
  );
};

export default App;