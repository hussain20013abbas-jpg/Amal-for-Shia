
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import AdminPortal from './components/AdminPortal';
import AudioController from './components/AudioController';
import { 
  POPULAR_DUAS, 
  SPECIAL_AMALS, 
  ZIYARATS, 
  TASBIH_PRESETS, 
  RECITERS,
  DIVINE_PEARLS
} from './constants';
import { Surah, Ayah, Dua, Reciter, NamazLogEntry, QadhaState, TasbihPreset } from './types';
import { askGeminiChat } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS[0]);
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [trackerMode, setTrackerMode] = useState<'daily' | 'qadha'>('daily');

  // Audio Control
  const [isAudioControllerOpen, setIsAudioControllerOpen] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPaused, setIsAudioPaused] = useState(true);
  const [activePlayingDua, setActivePlayingDua] = useState<Dua | null>(null);
  const [playingAyah, setPlayingAyah] = useState<Ayah | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Download State
  const [downloadingSurahNumber, setDownloadingSurahNumber] = useState<number | null>(null);

  // Tasbih Management
  const [customTasbihs, setCustomTasbihs] = useState<TasbihPreset[]>(() => {
    const saved = localStorage.getItem('customTasbihs');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedTasbih, setSelectedTasbih] = useState<TasbihPreset>(TASBIH_PRESETS[0]);
  const [tasbihCount, setTasbihCount] = useState(0);
  const [showTasbihForm, setShowTasbihForm] = useState(false);
  const [editingTasbih, setEditingTasbih] = useState<TasbihPreset | null>(null);
  const [newTasbih, setNewTasbih] = useState({ name: '', max: 100 });

  // Persistence: Namaz
  const [namazStats, setNamazStats] = useState(() => {
    const saved = localStorage.getItem('namazStats');
    const today = new Date().toLocaleDateString('en-CA');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed.data;
    }
    return { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
  });

  const [qadhaStats, setQadhaStats] = useState<QadhaState>(() => {
    const saved = localStorage.getItem('qadhaStats');
    return saved ? JSON.parse(saved) : { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
  });

  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isGuardianUnlocked, setIsGuardianUnlocked] = useState(() => sessionStorage.getItem('guardian_unlocked') === 'true');

  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [hijriDate, setHijriDate] = useState('Divine Sync...');
  const [currentTime, setCurrentTime] = useState('');
  const [prayerTimes, setPrayerTimes] = useState<any>(null);

  // AI Chat
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatResponse, setAiChatResponse] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await res.json();
        setSurahs(data.data);
      } catch (e) { console.error(e); }
    };
    fetchSurahs();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=1`);
        const data = await res.json();
        setPrayerTimes(data.data.timings);
        setHijriDate(`${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`);
      });
    }
  }, []);

  useEffect(() => localStorage.setItem('customTasbihs', JSON.stringify(customTasbihs)), [customTasbihs]);
  useEffect(() => localStorage.setItem('qadhaStats', JSON.stringify(qadhaStats)), [qadhaStats]);
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA');
    localStorage.setItem('namazStats', JSON.stringify({ date: today, data: namazStats }));
  }, [namazStats]);

  const handleAudioPlayback = (url: string, dua?: Dua, ayah?: Ayah) => {
    if (!audioRef.current) audioRef.current = new Audio(url);
    else audioRef.current.src = url;
    
    setActivePlayingDua(dua || null);
    setPlayingAyah(ayah || null);
    audioRef.current.play();
    setIsAudioPaused(false);
    setIsAudioControllerOpen(true);

    audioRef.current.ontimeupdate = () => {
      setAudioProgress(audioRef.current?.currentTime || 0);
      setAudioDuration(audioRef.current?.duration || 0);
    };
    audioRef.current.onended = () => setIsAudioPaused(true);
  };

  const handleSurahSelection = async (s: Surah) => {
    setSelectedSurah(s);
    setLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${s.number}/${selectedReciter.id}`);
      const data = await res.json();
      const resUrdu = await fetch(`https://api.alquran.cloud/v1/surah/${s.number}/ur.jalandhry`);
      const dataUrdu = await resUrdu.json();
      setAyahs(data.data.ayahs.map((a: any, i: number) => ({ ...a, translation: dataUrdu.data.ayahs[i].text })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  /**
   * Robust Download Mechanism
   * Fetches the file as a blob, handles errors, and provides feedback
   */
  const downloadSurah = async (s: Surah) => {
    if (downloadingSurahNumber !== null) return;
    
    setDownloadingSurahNumber(s.number);
    try {
      const url = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${s.number}.mp3`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Connection to Celestial Repository failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${s.number}_${s.englishName}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object to free memory
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Celestial Download Failed:", e);
      alert("Celestial Download Failed. Please check your connection to the Divine source.");
    } finally {
      setDownloadingSurahNumber(null);
    }
  };

  const addOrUpdateTasbih = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTasbih) {
      setCustomTasbihs(prev => prev.map(t => t.id === editingTasbih.id ? { ...t, name: newTasbih.name, max: newTasbih.max } : t));
    } else {
      setCustomTasbihs(prev => [...prev, { id: `custom-${Date.now()}`, name: newTasbih.name, label: 'Custom', max: newTasbih.max, isCustom: true }]);
    }
    setNewTasbih({ name: '', max: 100 });
    setEditingTasbih(null);
    setShowTasbihForm(false);
  };

  const moveTasbih = (id: string, dir: 'up' | 'down') => {
    const index = customTasbihs.findIndex(t => t.id === id);
    if (index === -1) return;
    const newPresets = [...customTasbihs];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newPresets.length) return;
    [newPresets[index], newPresets[target]] = [newPresets[target], newPresets[index]];
    setCustomTasbihs(newPresets);
  };

  const allTasbihs = useMemo(() => [...TASBIH_PRESETS, ...customTasbihs], [customTasbihs]);

  const handleAiChat = async () => {
    if (!aiChatInput.trim()) return;
    setAiChatLoading(true);
    try {
      const res = await askGeminiChat(aiChatInput);
      setAiChatResponse(res || '');
    } catch (e) { setAiChatResponse('Consultation failed.'); } finally { setAiChatLoading(false); }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#011a14] text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} onAdminClick={() => setIsAdminPortalOpen(true)} onFeedbackClick={() => {}} isLocked={!isGuardianUnlocked} />

      <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar pb-32">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <h1 className="text-xl font-black luxury-text uppercase tracking-widest">Syed Muhammad Tahir Ibne Syed Muhammad Mehdi</h1>
              <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mt-1 italic">Shia Islamic Sanctuary Hub</p>
           </div>
           <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-lg font-black uppercase tracking-widest">{currentTime}</p>
                <p className="text-[8px] font-black text-[#d4af37] uppercase tracking-widest">{hijriDate}</p>
              </div>
           </div>
        </header>

        {activeTab === 'home' && (
          <div className="space-y-10 animate-in fade-in duration-700">
             <section className="bg-gradient-to-br from-[#022c22] to-[#011a14] rounded-[3rem] p-10 md:p-20 text-center border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5 pointer-events-none"></div>
                <h2 className="text-4xl md:text-7xl font-black luxury-text uppercase mb-6 leading-tight">Divine Knowledge</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                   <div className="glass-card p-10 rounded-[2.5rem] border-white/10 text-left">
                      <h3 className="text-xs font-black text-[#d4af37] uppercase mb-6 tracking-widest">Namaz Tracker</h3>
                      <div className="flex gap-4 mb-6">
                        {['daily', 'qadha'].map(m => (
                          <button key={m} onClick={() => setTrackerMode(m as any)} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${trackerMode === m ? 'bg-[#d4af37] text-[#011a14]' : 'bg-white/5'}`}>{m}</button>
                        ))}
                      </div>
                      {trackerMode === 'daily' ? (
                        <div className="space-y-3">
                           {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(p => (
                             <button key={p} onClick={() => setNamazStats((prev: any) => ({ ...prev, [p]: !prev[p] }))} className={`w-full p-5 rounded-2xl flex justify-between items-center transition-all ${namazStats[p] ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5 opacity-50'}`}>
                                <span className="text-[10px] font-black uppercase">{p}</span>
                                <span className="text-[10px] tabular-nums">{prayerTimes?.[p] || '--:--'}</span>
                             </button>
                           ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                           {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(p => (
                             <div key={p} className="w-full p-5 rounded-2xl bg-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase">{p}</span>
                                <div className="flex items-center gap-3">
                                   <button onClick={() => setQadhaStats(prev => ({ ...prev, [p]: Math.max(0, prev[p as keyof QadhaState] - 1) }))} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500">-</button>
                                   <span className="font-black w-4 text-center text-xs">{qadhaStats[p as keyof QadhaState]}</span>
                                   <button onClick={() => setQadhaStats(prev => ({ ...prev, [p]: prev[p as keyof QadhaState] + 1 }))} className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500">+</button>
                                </div>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                   <div className="glass-card p-10 rounded-[2.5rem] bg-gradient-to-br from-[#d4af37]/10 text-left flex flex-col justify-center">
                      <h3 className="text-xs font-black text-[#d4af37] uppercase mb-4">Daily Wisdom</h3>
                      <p className="quran-text text-3xl leading-relaxed mb-4">{DIVINE_PEARLS[0].text}</p>
                      <p className="text-white/40 font-serif italic text-xs">"{DIVINE_PEARLS[0].translation}"</p>
                      <span className="mt-6 text-[10px] font-black text-[#d4af37] uppercase">{DIVINE_PEARLS[0].author}</span>
                   </div>
                </div>
             </section>
          </div>
        )}

        {activeTab === 'tasbih' && (
          <div className="space-y-10 animate-in fade-in">
             <header className="flex justify-between items-center">
                <h2 className="text-3xl font-black luxury-text uppercase">Tasbih</h2>
                <button onClick={() => { setEditingTasbih(null); setNewTasbih({ name: '', max: 100 }); setShowTasbihForm(true); }} className="bg-[#d4af37]/10 text-[#d4af37] px-6 py-2 rounded-xl text-[10px] font-black uppercase border border-[#d4af37]/20">+ New Preset</button>
             </header>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 glass-card p-12 rounded-[3rem] flex flex-col items-center justify-center">
                   <p className="text-xs font-black text-[#d4af37] uppercase mb-12 tracking-[0.3em]">{selectedTasbih.name}</p>
                   <div onClick={() => setTasbihCount(c => (c < selectedTasbih.max ? c + 1 : 1))} className="w-72 h-72 md:w-96 md:h-96 rounded-full border-8 border-[#d4af37]/20 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-white/[0.02] relative group">
                      <div className="absolute inset-0 bg-[#d4af37]/5 opacity-0 group-active:opacity-100 rounded-full transition-opacity"></div>
                      <span className="text-9xl font-black tabular-nums">{tasbihCount}</span>
                      <p className="text-[10px] opacity-20 uppercase font-black tracking-widest mt-4">Goal: {selectedTasbih.max}</p>
                   </div>
                   <button onClick={() => setTasbihCount(0)} className="mt-12 text-white/20 uppercase font-black text-[10px] hover:text-red-500 transition-colors">Reset</button>
                </div>
                <div className="space-y-4">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Saved Presets</h3>
                   <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                     {allTasbihs.map(t => (
                       <div key={t.id} className="group relative">
                          <button onClick={() => { setSelectedTasbih(t); setTasbihCount(0); }} className={`w-full p-5 rounded-2xl border text-left transition-all ${selectedTasbih.id === t.id ? 'bg-[#d4af37]/10 border-[#d4af37]/30' : 'bg-white/5 border-white/5'}`}>
                             <div className="flex justify-between items-center">
                                <span className="font-black uppercase text-[10px]">{t.name}</span>
                                <span className="text-[10px] opacity-40 font-bold">{t.max}</span>
                             </div>
                          </button>
                          {t.isCustom && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                               <button onClick={(e) => { e.stopPropagation(); moveTasbih(t.id, 'up'); }} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px]"><i className="fas fa-arrow-up"></i></button>
                               <button onClick={(e) => { e.stopPropagation(); moveTasbih(t.id, 'down'); }} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px]"><i className="fas fa-arrow-down"></i></button>
                               <button onClick={(e) => { e.stopPropagation(); setEditingTasbih(t); setNewTasbih({ name: t.name, max: t.max }); setShowTasbihForm(true); }} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] text-[#d4af37]"><i className="fas fa-edit"></i></button>
                               <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete?')) setCustomTasbihs(prev => prev.filter(p => p.id !== t.id)); }} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] text-red-500"><i className="fas fa-trash"></i></button>
                            </div>
                          )}
                       </div>
                     ))}
                   </div>
                </div>
             </div>
             {showTasbihForm && (
               <div className="fixed inset-0 z-[1000] bg-[#011a14]/95 backdrop-blur-xl flex items-center justify-center p-6">
                  <div className="glass-card p-10 rounded-[2.5rem] border-[#d4af37]/20 w-full max-w-md">
                     <h3 className="text-xl font-black luxury-text mb-8">{editingTasbih ? 'Edit Tasbih' : 'New Tasbih'}</h3>
                     <form onSubmit={addOrUpdateTasbih} className="space-y-6">
                        <div>
                           <label className="text-[10px] font-black uppercase text-[#d4af37] block mb-2">Preset Name</label>
                           <input value={newTasbih.name} onChange={e => setNewTasbih(p => ({ ...p, name: e.target.value }))} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm" required placeholder="e.g. Salawat" />
                        </div>
                        <div>
                           <label className="text-[10px] font-black uppercase text-[#d4af37] block mb-2">Target Count</label>
                           <input type="number" value={newTasbih.max} onChange={e => setNewTasbih(p => ({ ...p, max: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm" required min="1" />
                        </div>
                        <div className="flex gap-4 pt-4">
                           <button type="button" onClick={() => setShowTasbihForm(false)} className="flex-1 text-white/30 uppercase font-black text-xs">Cancel</button>
                           <button type="submit" className="flex-1 bg-[#d4af37] text-[#011a14] py-4 rounded-xl font-black uppercase text-xs">Save</button>
                        </div>
                     </form>
                  </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'quran' && (
           <div className="space-y-10 animate-in fade-in">
             {!selectedSurah ? (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                 {surahs.map(s => (
                   <button key={s.number} onClick={() => handleSurahSelection(s)} className="glass-card p-8 rounded-2xl text-left hover:border-[#d4af37]/40 transition-all group">
                      <span className="text-[10px] font-black text-[#d4af37] mb-2 block">№ {s.number}</span>
                      <h5 className="text-[12px] font-black uppercase">{s.englishName}</h5>
                      <span className="quran-text text-xl text-white/10 group-hover:text-[#d4af37] block text-right mt-4">{s.name}</span>
                   </button>
                 ))}
               </div>
             ) : (
               <div className="space-y-8">
                  <div className="flex justify-between items-center">
                     <button onClick={() => setSelectedSurah(null)} className="text-[#d4af37] uppercase font-black text-[10px] flex items-center gap-2 hover:opacity-70 transition-opacity"><i className="fas fa-arrow-left"></i> Back</button>
                     <div className="flex gap-3">
                        <button onClick={() => handleAudioPlayback(`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${selectedSurah.number}.mp3`)} className="glass-card px-4 py-2 rounded-xl text-[10px] font-black uppercase text-[#d4af37] flex items-center gap-2 hover:bg-white/5"><i className="fas fa-play"></i> Full Surah</button>
                        <button 
                          disabled={downloadingSurahNumber !== null}
                          onClick={() => downloadSurah(selectedSurah)} 
                          className={`w-10 h-10 rounded-xl border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] hover:bg-white/5 transition-all ${downloadingSurahNumber === selectedSurah.number ? 'animate-pulse opacity-50' : ''}`}
                        >
                           <i className={`fas ${downloadingSurahNumber === selectedSurah.number ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                        </button>
                     </div>
                  </div>
                  <div className="glass-card p-12 rounded-[3rem] text-center border-[#d4af37]/10">
                     <h2 className="text-4xl font-black luxury-text mb-4">{selectedSurah.englishName}</h2>
                     <p className="text-2xl quran-text text-[#d4af37]">{selectedSurah.name}</p>
                  </div>
                  {loading ? <p className="text-center py-20 text-white/20 animate-pulse">Syncing verses...</p> : (
                    <div className="space-y-6">
                      {ayahs.map(a => (
                        <div key={a.number} className="glass-card p-10 rounded-[3rem] border-white/5 relative group hover:border-[#d4af37]/20 transition-all">
                           <div className="flex justify-between items-start gap-10 mb-8">
                              <span className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[10px] font-black text-[#d4af37]">{a.numberInSurah}</span>
                              <p className="quran-text text-4xl text-right leading-relaxed flex-1">{a.text}</p>
                           </div>
                           <p className="text-white/60 font-serif italic border-l-2 border-[#d4af37]/20 pl-6 mb-4">{a.translation}</p>
                           <button onClick={() => handleAudioPlayback(a.audio || '', undefined, a)} className="absolute bottom-6 right-10 w-10 h-10 rounded-full bg-[#d4af37]/10 text-[#d4af37] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><i className="fas fa-play"></i></button>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
             )}
           </div>
        )}

        {(activeTab === 'duas' || activeTab === 'ziyarat') && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
              {(activeTab === 'duas' ? POPULAR_DUAS : ZIYARATS).map(d => (
                 <button key={d.id} onClick={() => setSelectedDua(d)} className="glass-card p-10 rounded-[2rem] border-white/5 text-left flex justify-between items-center group hover:border-[#d4af37]/30 transition-all">
                    <div>
                       <h4 className="text-sm font-black uppercase tracking-widest mb-1">{d.title}</h4>
                       <p className="text-[10px] text-white/30 italic uppercase">{d.category}</p>
                    </div>
                    <i className="fas fa-chevron-right text-[#d4af37] opacity-0 group-hover:opacity-100 transition-all"></i>
                 </button>
              ))}
           </div>
        )}

        {selectedDua && (
           <div className="fixed inset-0 z-[600] bg-[#011a14]/98 backdrop-blur-3xl overflow-y-auto p-12 animate-in slide-in-from-bottom-10">
              <div className="max-w-4xl mx-auto">
                 <button onClick={() => setSelectedDua(null)} className="text-[#d4af37] font-black uppercase text-[10px] mb-12 flex items-center gap-2 hover:opacity-70 transition-opacity"><i className="fas fa-times"></i> Exit</button>
                 <div className="text-center">
                    <h2 className="text-5xl font-black luxury-text uppercase mb-12">{selectedDua.title}</h2>
                    <p className="quran-text text-6xl leading-[2.5] text-white mb-20">{selectedDua.arabic}</p>
                    <div className="bg-white/5 p-10 rounded-[2.5rem] text-left border border-white/10">
                       <p className="text-[#d4af37] font-black uppercase text-[10px] mb-4">Translation</p>
                       <p className="text-lg font-serif italic text-white/70 leading-relaxed">{selectedDua.translation}</p>
                    </div>
                    {selectedDua.audio && (
                      <button onClick={() => handleAudioPlayback(selectedDua.audio!, selectedDua)} className="mt-12 bg-[#d4af37] text-[#011a14] px-16 py-6 rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Play Recitation</button>
                    )}
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'amals' && (
           <div className="space-y-8 animate-in fade-in">
              <h2 className="text-2xl font-black luxury-text uppercase">Sacred Amaal</h2>
              <div className="grid grid-cols-1 gap-6">
                {SPECIAL_AMALS.map(a => (
                  <div key={a.id} className="glass-card p-10 rounded-[2.5rem] border-white/10">
                     <h4 className="text-lg font-black uppercase text-[#d4af37] mb-4">{a.title}</h4>
                     <p className="text-white/40 mb-8 font-serif italic text-sm">{a.description}</p>
                     <div className="space-y-4">
                        {a.steps.map((s, i) => (
                          <div key={i} className="flex gap-4 items-start">
                             <span className="w-8 h-8 rounded-lg bg-[#d4af37]/10 flex items-center justify-center text-[10px] font-black text-[#d4af37] shrink-0 border border-[#d4af37]/10">{i+1}</span>
                             <p className="text-sm text-white/70">{s}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                ))}
              </div>
           </div>
        )}

        {activeTab === 'ask' && (
           <div className="space-y-8 animate-in fade-in">
              <div className="glass-card p-10 rounded-[2.5rem] border-[#d4af37]/10">
                 <h3 className="text-xl font-black luxury-text uppercase mb-6">Ask the Scholar (AI)</h3>
                 <div className="flex gap-4">
                    <input value={aiChatInput} onChange={e => setAiChatInput(e.target.value)} placeholder="Ask about Fiqh, History, or Spirituality..." className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl text-sm" />
                    <button onClick={handleAiChat} disabled={aiChatLoading} className="bg-[#d4af37] text-[#011a14] px-8 py-4 rounded-xl font-black uppercase text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-50">{aiChatLoading ? 'Thinking...' : 'Ask'}</button>
                 </div>
                 {aiChatResponse && (
                    <div className="mt-8 bg-white/5 p-8 rounded-2xl border border-white/5"><p className="text-white/80 whitespace-pre-wrap font-serif leading-relaxed text-lg">{aiChatResponse}</p></div>
                 )}
              </div>
           </div>
        )}
      </main>

      <AudioController isOpen={isAudioControllerOpen} onClose={() => setIsAudioControllerOpen(false)} activeDua={activePlayingDua} playingAyah={playingAyah} selectedSurah={selectedSurah} progress={audioProgress} duration={audioDuration} isPaused={isAudioPaused} isLooping={false} onToggleLoop={() => {}} isAutoPlayEnabled={false} onToggleAutoPlay={() => {}} onSeek={(e) => { 
        const t = parseFloat(e.target.value); 
        if(audioRef.current) audioRef.current.currentTime = t;
        setAudioProgress(t);
      }} onTogglePlayback={() => { 
        if(audioRef.current?.paused) audioRef.current.play(); else audioRef.current?.pause(); 
        setIsAudioPaused(!isAudioPaused); 
      }} onSkipNext={() => {}} onSkipPrev={() => {}} volume={1} onVolumeChange={() => {}} speed={1} onSpeedChange={() => {}} onDownload={() => {
        if (selectedSurah) downloadSurah(selectedSurah);
      }} sleepTimer={null} onSetSleepTimer={() => {}} />
    </div>
  );
};

export default App;
