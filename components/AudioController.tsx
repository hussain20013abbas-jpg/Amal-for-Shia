import React, { useState } from 'react';
import { Dua, Ayah, Surah } from '../types';

interface AudioControllerProps {
  isOpen: boolean;
  onClose: () => void;
  activeDua: Dua | null;
  playingAyah: Ayah | null;
  selectedSurah: Surah | null;
  progress: number;
  duration: number;
  isPaused: boolean;
  isLooping: boolean;
  onToggleLoop: () => void;
  isAutoPlayEnabled: boolean;
  onToggleAutoPlay: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePlayback: () => void;
  onSkipNext: () => void;
  onSkipPrev: () => void;
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onDownload: () => void;
  sleepTimer: number | null;
  onSetSleepTimer: (minutes: number | null) => void;
}

const AudioController: React.FC<AudioControllerProps> = ({
  isOpen, onClose, activeDua, playingAyah, selectedSurah,
  progress, duration, isPaused, isLooping, onToggleLoop,
  isAutoPlayEnabled, onToggleAutoPlay,
  onSeek, onTogglePlayback, onSkipNext, onSkipPrev,
  volume, onVolumeChange, speed, onSpeedChange, onDownload,
  sleepTimer, onSetSleepTimer
}) => {
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const title = activeDua ? activeDua.title : (selectedSurah ? `${selectedSurah.englishName}` : "Recitation");
  const subtitle = activeDua ? activeDua.category : (playingAyah ? `Ayah ${playingAyah.numberInSurah}` : "Full Surah");

  const [showTimers, setShowTimers] = useState(false);

  return (
    <div className={`fixed inset-0 z-[600] bg-[#011a14]/98 backdrop-blur-3xl flex flex-col transition-all duration-500 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-to-br from-[#d4af37]/10 via-[#011a14] to-[#d4af37]/5 animate-pulse"></div>
      </div>

      <header className="p-8 flex justify-between items-center relative z-10">
         <button onClick={onClose} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all">
            <i className="fas fa-chevron-down text-lg"></i>
         </button>
         <div className="text-center">
            <h2 className="luxury-text text-lg font-black uppercase tracking-[0.3em]">Now Resonating</h2>
            <p className="text-[8px] font-black text-white/20 uppercase mt-1 tracking-widest italic">Syed Muhammad Tahir Archive</p>
         </div>
         <button onClick={onDownload} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#d4af37] transition-all">
            <i className="fas fa-cloud-arrow-down text-lg"></i>
         </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 md:p-24 relative z-10">
         
         {/* Visualizer Placeholder */}
         <div className="w-64 h-64 md:w-96 md:h-96 rounded-[3rem] bg-white/5 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex items-center justify-center relative group mb-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 to-transparent"></div>
            <i className="fas fa-kaaba text-8xl md:text-[10rem] text-[#d4af37]/10 group-hover:scale-110 transition-transform duration-1000"></i>
            {!isPaused && (
              <div className="absolute inset-0 flex items-center justify-center gap-1">
                 {[1,2,3,4,5,4,3,2,1].map((h, i) => (
                   <div 
                    key={i} 
                    className="w-1 bg-[#d4af37]/40 rounded-full animate-pulse" 
                    style={{ height: `${h * 15}%`, animationDelay: `${i * 0.1}s`, animationDuration: '0.8s' }}
                   />
                 ))}
              </div>
            )}
         </div>

         <div className="text-center mb-12 w-full max-w-2xl">
            <h3 className="text-2xl md:text-5xl font-black luxury-text uppercase tracking-tight mb-4">{title}</h3>
            <p className="text-xs md:text-lg font-bold text-[#d4af37] uppercase tracking-[0.4em]">{subtitle}</p>
         </div>

         {/* Progress Section */}
         <div className="w-full max-w-3xl mb-12">
            <div className="flex justify-between items-end mb-4 px-2">
               <span className="text-[10px] md:text-sm font-black text-[#d4af37] tabular-nums">{formatTime(progress)}</span>
               <span className="text-[10px] md:text-sm font-black text-white/20 tabular-nums">{formatTime(duration)}</span>
            </div>
            <div className="relative group">
               <input 
                  type="range" 
                  min="0" 
                  max={duration || 100} 
                  value={progress}
                  onChange={onSeek}
                  className="w-full h-2 md:h-3 cursor-pointer"
               />
               <div 
                 className="absolute top-0 left-0 h-2 md:h-3 bg-[#d4af37] rounded-full pointer-events-none shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all" 
                 style={{ width: `${(progress / (duration || 1)) * 100}%` }}
               />
            </div>
         </div>

         {/* Main Controls */}
         <div className="flex items-center gap-10 md:gap-20 mb-16">
            <button onClick={onSkipPrev} className="text-3xl md:text-4xl text-white/30 hover:text-[#d4af37] transition-all hover:scale-125">
               <i className="fas fa-backward-step"></i>
            </button>
            <button 
              onClick={onTogglePlayback}
              className="w-24 h-24 md:w-32 md:h-32 bg-[#d4af37] text-[#011a14] rounded-full flex items-center justify-center text-4xl md:text-5xl shadow-[0_30px_60px_rgba(212,175,55,0.3)] hover:scale-110 active:scale-95 transition-all"
            >
               <i className={`fas ${isPaused ? 'fa-play pl-2' : 'fa-pause'}`}></i>
            </button>
            <button onClick={onSkipNext} className="text-3xl md:text-4xl text-white/30 hover:text-[#d4af37] transition-all hover:scale-125">
               <i className="fas fa-forward-step"></i>
            </button>
         </div>

         {/* Sub-Controls */}
         <div className="grid grid-cols-3 md:grid-cols-5 gap-6 md:gap-12 w-full max-w-4xl">
            <div className="flex flex-col items-center gap-3">
               <button 
                onClick={onToggleLoop} 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isLooping ? 'bg-[#d4af37] text-[#011a14] border-[#d4af37]' : 'bg-white/5 border-white/5 text-white/20'}`}
               >
                  <i className="fas fa-arrows-rotate"></i>
               </button>
               <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Loop</span>
            </div>

            <div className="flex flex-col items-center gap-3 relative">
               <button 
                onClick={onToggleAutoPlay} 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isAutoPlayEnabled ? 'bg-[#d4af37] text-[#011a14] border-[#d4af37]' : 'bg-white/5 border-white/5 text-white/20'}`}
               >
                  <i className="fas fa-play-circle"></i>
               </button>
               <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Continuous</span>
            </div>

            <div className="flex flex-col items-center gap-3">
               <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 h-12">
                  {[0.5, 1, 1.5, 2].map(s => (
                    <button 
                      key={s} 
                      onClick={() => onSpeedChange(s)}
                      className={`w-8 h-8 rounded-lg text-[8px] font-black transition-all ${speed === s ? 'bg-[#d4af37] text-[#011a14]' : 'text-white/20 hover:text-white'}`}
                    >
                       {s}x
                    </button>
                  ))}
               </div>
               <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Speed</span>
            </div>

            <div className="hidden md:flex flex-col items-center gap-3 flex-1 px-8">
               <div className="w-full flex items-center gap-4 h-12">
                  <i className="fas fa-volume-low text-white/20"></i>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.01" 
                    value={volume} 
                    onChange={onVolumeChange}
                    className="flex-1 h-1.5 accent-[#d4af37]"
                  />
                  <i className="fas fa-volume-high text-white/20"></i>
               </div>
               <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Volume</span>
            </div>

            <div className="hidden md:flex flex-col items-center gap-3 relative">
               <button 
                onClick={() => setShowTimers(!showTimers)} 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${sleepTimer !== null ? 'bg-[#d4af37] text-[#011a14] border-[#d4af37]' : 'bg-white/5 border-white/5 text-white/20'}`}
               >
                  <i className="fas fa-moon"></i>
               </button>
               <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Sleep</span>
               
               {showTimers && (
                 <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 glass-card p-2 rounded-xl border-[#d4af37]/30 flex flex-col gap-1 min-w-[100px] animate-in slide-in-from-bottom-2">
                    {[15, 30, 60, null].map(m => (
                      <button 
                        key={m === null ? 'off' : m} 
                        onClick={() => { onSetSleepTimer(m); setShowTimers(false); }}
                        className="p-2 rounded-lg text-[8px] font-black uppercase hover:bg-white/5 text-white/60 hover:text-white"
                      >
                         {m === null ? 'Off' : `${m}m`}
                      </button>
                    ))}
                 </div>
               )}
            </div>
         </div>
      </main>

      <footer className="p-12 text-center relative z-10 border-t border-white/5">
         <p className="text-[8px] text-white/10 font-black uppercase tracking-[0.8em]">Dedicated to the Legacy of Syed Muhammad Tahir Ibne Syed Muhammad Mehdi</p>
      </footer>
    </div>
  );
};

export default AudioController;