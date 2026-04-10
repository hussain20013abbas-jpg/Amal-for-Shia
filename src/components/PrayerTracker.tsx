import React, { useState } from 'react';
import { DailyNamazStats, PrayerHistory, QadhaState } from '../types';

interface PrayerTrackerProps {
  prayerHistory: PrayerHistory;
  setPrayerHistory: React.Dispatch<React.SetStateAction<PrayerHistory>>;
  namazStats: DailyNamazStats;
  setNamazStats: React.Dispatch<React.SetStateAction<DailyNamazStats>>;
  qadhaStats: QadhaState;
  setQadhaStats: React.Dispatch<React.SetStateAction<QadhaState>>;
  prayerTimes: any;
  toArabicNumerals: (str: string) => string;
}

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Sunset', 'Maghrib', 'Isha', 'Midnight'];
const TRACKING_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const PrayerTracker: React.FC<PrayerTrackerProps> = ({
  prayerHistory,
  setPrayerHistory,
  namazStats,
  setNamazStats,
  qadhaStats,
  setQadhaStats,
  prayerTimes,
  toArabicNumerals
}) => {
  const [trackerMode, setTrackerMode] = useState<'daily' | 'qadha' | 'stats'>('daily');
  const todayStr = new Date().toLocaleDateString('en-CA');

  const toggleNamaz = (p: string) => {
    setNamazStats(prev => ({ ...prev, [p]: !prev[p as keyof DailyNamazStats] }));
  };

  return (
    <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-6">
      <header className="text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-black luxury-text uppercase mb-6 tracking-tighter">Prayer Tracker</h2>
        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.6em] mb-10">Guard Your Celestial Appointments</p>
        <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent mx-auto"></div>
      </header>

      {/* Mode Selector */}
      <div className="flex justify-center gap-4 mb-12">
        {['daily', 'qadha', 'stats'].map(mode => (
          <button
            key={mode}
            onClick={() => setTrackerMode(mode as any)}
            className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${trackerMode === mode ? 'bg-[#d4af37] text-[#011a14] shadow-xl scale-105' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'}`}
          >
            {mode}
          </button>
        ))}
      </div>

      {trackerMode === 'daily' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Prayer Times Card */}
          <div className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <i className="fas fa-clock text-9xl"></i>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-8 text-[#d4af37]">Today's Timings</h3>
            {prayerTimes ? (
              <div className="space-y-4">
                {PRAYER_NAMES.map(p => (
                  <div key={p} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-sm font-bold uppercase tracking-widest text-white/80">{p}</span>
                    <span className="text-xl font-black text-[#d4af37]">{prayerTimes[p] ? toArabicNumerals(prayerTimes[p]) : '--:--'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-location-dot text-4xl text-white/20 mb-4"></i>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">Enable location to view timings</p>
              </div>
            )}
          </div>

          {/* Daily Tracking Card */}
          <div className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <i className="fas fa-check-double text-9xl"></i>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-8 text-[#d4af37]">Track Prayers</h3>
            <div className="space-y-4">
              {TRACKING_PRAYERS.map(p => (
                <div 
                  key={p} 
                  onClick={() => toggleNamaz(p)}
                  className={`flex justify-between items-center p-6 rounded-2xl cursor-pointer transition-all border-2 ${namazStats[p as keyof DailyNamazStats] ? 'bg-[#d4af37]/10 border-[#d4af37] shadow-lg' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                >
                  <span className={`text-sm font-bold uppercase tracking-widest ${namazStats[p as keyof DailyNamazStats] ? 'text-[#d4af37]' : 'text-white/60'}`}>{p}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${namazStats[p as keyof DailyNamazStats] ? 'bg-[#d4af37] text-[#011a14]' : 'bg-white/10 text-transparent'}`}>
                    <i className="fas fa-check text-xs"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {trackerMode === 'qadha' && (
        <div className="glass-card p-10 rounded-[3rem] border-white/5 max-w-3xl mx-auto">
          <h3 className="text-2xl font-black uppercase tracking-widest mb-8 text-center text-[#d4af37]">Qadha Management</h3>
          <div className="space-y-6">
            {TRACKING_PRAYERS.map(p => (
              <div key={p} className="flex items-center justify-between bg-white/5 p-6 rounded-2xl">
                <span className="text-sm font-bold uppercase tracking-widest text-white/80 w-24">{p}</span>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setQadhaStats(prev => ({ ...prev, [p]: Math.max(0, prev[p as keyof QadhaState] - 1) }))}
                    className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="text-3xl font-black w-16 text-center text-[#d4af37]">{qadhaStats[p as keyof QadhaState]}</span>
                  <button 
                    onClick={() => setQadhaStats(prev => ({ ...prev, [p]: prev[p as keyof QadhaState] + 1 }))}
                    className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {trackerMode === 'stats' && (
        <div className="glass-card p-10 rounded-[3rem] border-white/5 max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-black uppercase tracking-widest mb-8 text-[#d4af37]">7-Day Overview</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 justify-center">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const dStr = d.toLocaleDateString('en-CA');
              const stats = prayerHistory[dStr] || { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
              const completed = Object.values(stats).filter(Boolean).length;
              return (
                <div key={i} className="flex flex-col items-center gap-4 min-w-[60px]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <div className="w-4 h-32 bg-white/5 rounded-full relative overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-[#d4af37] rounded-full transition-all duration-1000"
                      style={{ height: `${(completed / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-white/80">{completed}/5</span>
                </div>
              );
            }).reverse()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayerTracker;
