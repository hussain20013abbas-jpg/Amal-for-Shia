import React from 'react';

interface QiblaCompassProps {
  deviceHeading: number | null;
  qiblaDirection: number | null;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ deviceHeading, qiblaDirection }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative w-56 h-56 rounded-full border-4 border-white/5 flex items-center justify-center bg-white/[0.02] shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
        <div 
          className="absolute w-full h-full rounded-full transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${deviceHeading !== null ? -deviceHeading : 0}deg)` }}
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/20 text-[10px] font-black">N</div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-[10px] font-black">S</div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-black">W</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-black">E</div>
        </div>
        <div 
          className="w-40 h-40 rounded-full border-2 border-[#d4af37]/20 flex items-center justify-center transition-transform duration-700 ease-in-out"
          style={{ transform: `rotate(${qiblaDirection !== null ? qiblaDirection : 0}deg)` }}
        >
          <div className="w-1.5 h-32 bg-gradient-to-t from-transparent via-[#d4af37] to-[#d4af37] absolute top-4 rounded-full shadow-[0_0_30px_rgba(212,175,55,0.6)]"></div>
          <i className="fas fa-kaaba text-5xl luxury-text-glow drop-shadow-2xl"></i>
        </div>
      </div>
      <div className="text-center">
        <span className="text-4xl font-black luxury-text block tracking-tighter">{qiblaDirection !== null ? Math.round(qiblaDirection) : '--'}°</span>
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2 block">Orientation to Sacred House</span>
      </div>
    </div>
  );
};
