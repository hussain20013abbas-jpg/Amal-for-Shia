
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import AdminPortal from './components/AdminPortal';
import AudioController from './components/AudioController';
import { 
  POPULAR_DUAS, 
  DAILY_AMALS, 
  ZIYARATS, 
  TASBIH_PRESETS, 
  RECITERS,
  DIVINE_PEARLS,
  SHIA_RESOURCES,
  NOTIFICATION_SOUNDS,
  HIJRI_EVENTS
} from './constants';
import { Surah, Ayah, Dua, Reciter, QadhaState, TasbihPreset, Amal, PrayerHistory, DailyNamazStats, Reminder, HijriEvent } from './types';
import { askGeminiChat, AiConsultationOptions } from './services/geminiService';

const SCHOOLS = ['Ja\'fari (Twelve Imams)', 'Zaydi', 'Ismaili', 'Sufi-Shia Perspective'];
const SCHOLARS = [
  'General Shia Consensus',
  'Ayatollah Ali al-Sistani',
  'Ayatollah Ali Khamenei',
  'Shahid Mutahhari',
  'Allamah Tabatabai (Al-Mizan)',
  'Imam Khomeini',
  'Syed Muhammad Baqir al-Sadr'
];

type DownloadStatus = 'idle' | 'pending' | 'downloading' | 'completed' | 'failed';
const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [surahSearch, setSurahSearch] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS[0]);
  const [reciterSearch, setReciterSearch] = useState('');
  const [isReciterModalOpen, setIsReciterModalOpen] = useState(false);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [trackerMode, setTrackerMode] = useState<'daily' | 'qadha' | 'stats'>('daily');

  // Grounding State for Home
  const [homeUpdate, setHomeUpdate] = useState<string>('');
  const [homeSources, setHomeSources] = useState<any[]>([]);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Persistence: Prayer History
  const [prayerHistory, setPrayerHistory] = useState<PrayerHistory>(() => {
    const saved = localStorage.getItem('smt_prayer_history');
    return saved ? JSON.parse(saved) : {};
  });

  const todayStr = new Date().toLocaleDateString('en-CA');
  
  const [namazStats, setNamazStats] = useState<DailyNamazStats>(() => {
    const saved = localStorage.getItem('smt_prayer_history');
    if (saved) {
      const history = JSON.parse(saved);
      if (history[todayStr]) return history[todayStr];
    }
    return { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
  });

  const [qadhaStats, setQadhaStats] = useState<QadhaState>(() => {
    const saved = localStorage.getItem('qadhaStats');
    return saved ? JSON.parse(saved) : { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [tasbihCount, setTasbihCount] = useState(() => {
    const saved = localStorage.getItem('smt_tasbih_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [customTasbihs, setCustomTasbihs] = useState<TasbihPreset[]>(() => {
    const saved = localStorage.getItem('smt_custom_tasbihs');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTasbih, setActiveTasbih] = useState<TasbihPreset>(TASBIH_PRESETS[0]);

  const [downloadedSurahs, setDownloadedSurahs] = useState<number[]>(() => {
    const saved = localStorage.getItem('smt_downloaded_surahs');
    return saved ? JSON.parse(saved) : [];
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('smt_reminders');
    return saved ? JSON.parse(saved) : [
      { id: 'fajr-on', prayerName: 'Fajr', offsetMinutes: 0, enabled: true, label: 'Fajr Prayer' },
      { id: 'dhuhr-on', prayerName: 'Dhuhr', offsetMinutes: 0, enabled: true, label: 'Dhuhr Prayer' },
      { id: 'asr-on', prayerName: 'Asr', offsetMinutes: 0, enabled: true, label: 'Asr Prayer' },
      { id: 'maghrib-on', prayerName: 'Maghrib', offsetMinutes: 0, enabled: true, label: 'Maghrib Prayer' },
      { id: 'isha-on', prayerName: 'Isha', offsetMinutes: 0, enabled: true, label: 'Isha Prayer' }
    ];
  });

  const [aiOptions, setAiOptions] = useState<AiConsultationOptions>({
    school: SCHOOLS[0],
    scholar: SCHOLARS[0],
    depth: 'scholarly'
  });
  const [isReviewingAiQuery, setIsReviewingAiQuery] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatResponse, setAiChatResponse] = useState('');
  const [aiSources, setAiSources] = useState<any[]>([]);
  const [aiChatLoading, setAiChatLoading] = useState(false);

  const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const todaysAmal: Amal = DAILY_AMALS[currentDay] || DAILY_AMALS['Saturday'];

  // Audio Control
  const [isAudioControllerOpen, setIsAudioControllerOpen] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPaused, setIsAudioPaused] = useState(true);
  const [activePlayingDua, setActivePlayingDua] = useState<Dua | null>(null);
  const [playingAyah, setPlayingAyah] = useState<Ayah | null>(null);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [downloadingSurahNumber, setDownloadingSurahNumber] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle');

  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isGuardianUnlocked, setIsGuardianUnlocked] = useState(() => sessionStorage.getItem('guardian_unlocked') === 'true');

  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [hijriDate, setHijriDate] = useState('Divine Sync...');
  const [currentTime, setCurrentTime] = useState('');
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [manualLocation, setManualLocation] = useState({ city: '', country: '' });
  const [isLocating, setIsLocating] = useState(false);

  const filteredSurahs = useMemo(() => {
    return surahs.filter(s => 
      s.englishName.toLowerCase().includes(surahSearch.toLowerCase()) ||
      s.name.includes(surahSearch) ||
      s.number.toString().includes(surahSearch)
    );
  }, [surahs, surahSearch]);

  const filteredReciters = useMemo(() => {
    return RECITERS.filter(r => 
      r.fullName.toLowerCase().includes(reciterSearch.toLowerCase()) ||
      r.name.toLowerCase().includes(reciterSearch.toLowerCase())
    );
  }, [reciterSearch]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

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
        try {
          const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=1`);
          const data = await res.json();
          setPrayerTimes(data.data.timings);
          setHijriDate(`${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`);
        } catch (e) { console.error(e); }
      });
    }

    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const fetchPrayerTimes = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=1`);
      const data = await res.json();
      setPrayerTimes(data.data.timings);
      setHijriDate(`${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`);
    } catch (e) { console.error(e); }
  };

  const fetchPrayerTimesByCity = async () => {
    if (!manualLocation.city || !manualLocation.country) return;
    setIsLocating(true);
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${manualLocation.city}&country=${manualLocation.country}&method=1`);
      const data = await res.json();
      setPrayerTimes(data.data.timings);
      setHijriDate(`${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`);
    } catch (e) { console.error(e); } finally { setIsLocating(false); }
  };

  const useGPS = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
      }, () => setIsLocating(false));
    }
  };

  // Fetch Home News via Grounding
  useEffect(() => {
    if (activeTab === 'home' && !homeUpdate) {
      fetchSpiritualUpdate();
    }
  }, [activeTab]);

  const fetchSpiritualUpdate = async () => {
    setUpdateLoading(true);
    try {
      const { text, sources } = await askGeminiChat(
        "Search for and summarize 1-2 major current news events or upcoming significant spiritual dates in the Shia world today. Be concise and accurate.",
        { school: 'Ja\'fari (Twelve Imams)', scholar: 'General Consensus', depth: 'simple' }
      );
      setHomeUpdate(text);
      setHomeSources(sources);
    } catch (e) {
      console.error(e);
      setHomeUpdate("The spiritual hub is currently syncing with global data.");
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    if (!prayerTimes || !notificationsEnabled) return;
    const interval = setInterval(() => {
      const now = new Date();
      const currentHhMm = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      reminders.forEach(reminder => {
        if (!reminder.enabled) return;
        
        const prayerTimeStr = prayerTimes[reminder.prayerName];
        if (!prayerTimeStr) return;

        // Calculate reminder time
        const [hours, minutes] = prayerTimeStr.split(':').map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0, 0);
        
        const reminderDate = new Date(prayerDate.getTime() + reminder.offsetMinutes * 60000);
        const reminderHhMm = reminderDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        if (reminderHhMm === currentHhMm) {
          const lastNotifiedKey = `notified_${reminder.id}_${new Date().toDateString()}`;
          const lastNotified = localStorage.getItem(lastNotifiedKey);
          
          if (lastNotified !== currentHhMm) {
            new Notification(reminder.label || `Reminder for ${reminder.prayerName}`, {
              body: reminder.offsetMinutes === 0 
                ? `The celestial clock calls for ${reminder.prayerName} Salat. Dedicate this moment to Allah.` 
                : `${Math.abs(reminder.offsetMinutes)} minutes ${reminder.offsetMinutes < 0 ? 'before' : 'after'} ${reminder.prayerName}.`,
              icon: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png'
            });

            if (reminder.soundUrl) {
              const audio = new Audio(reminder.soundUrl);
              audio.play().catch(e => console.error("Audio playback failed", e));
            }

            localStorage.setItem(lastNotifiedKey, currentHhMm);
          }
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [prayerTimes, notificationsEnabled, reminders]);

  useEffect(() => {
    localStorage.setItem('qadhaStats', JSON.stringify(qadhaStats));
  }, [qadhaStats]);

  useEffect(() => {
    const newHistory = { ...prayerHistory, [todayStr]: namazStats };
    setPrayerHistory(newHistory);
    localStorage.setItem('smt_prayer_history', JSON.stringify(newHistory));
  }, [namazStats]);

  useEffect(() => localStorage.setItem('smt_tasbih_count', tasbihCount.toString()), [tasbihCount]);
  useEffect(() => localStorage.setItem('smt_custom_tasbihs', JSON.stringify(customTasbihs)), [customTasbihs]);
  useEffect(() => localStorage.setItem('smt_downloaded_surahs', JSON.stringify(downloadedSurahs)), [downloadedSurahs]);
  useEffect(() => localStorage.setItem('smt_reminders', JSON.stringify(reminders)), [reminders]);

  useEffect(() => {
    if (selectedSurah) {
      handleSurahSelection(selectedSurah);
      if (playingAyah && audioRef.current) {
        audioRef.current.pause();
        setIsAudioPaused(true);
        setPlayingAyah(null);
      }
    }
  }, [selectedReciter]);

  const toggleNamaz = (p: string) => {
    setNamazStats(prev => ({ ...prev, [p]: !prev[p as keyof DailyNamazStats] }));
  };

  const handleAiChat = async () => {
    if (!aiChatInput.trim()) return;
    setIsReviewingAiQuery(false);
    setAiChatLoading(true);
    setAiChatResponse('');
    try {
      const { text, sources } = await askGeminiChat(aiChatInput, aiOptions);
      setAiChatResponse(text);
      setAiSources(sources);
    } catch (e) { 
      setAiChatResponse('Consultation failed. The divine sync was interrupted.'); 
      setAiSources([]);
    } finally { 
      setAiChatLoading(false); 
    }
  };

  const handleSurahSelection = async (s: Surah) => {
    setSelectedSurah(s);
    setLoading(true);
    try {
      const [resAudio, resUrdu, resTrans] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${s.number}/${selectedReciter.id}`),
        fetch(`https://api.alquran.cloud/v1/surah/${s.number}/ur.jalandhry`),
        fetch(`https://api.alquran.cloud/v1/surah/${s.number}/en.transliteration`)
      ]);
      const dataAudio = await resAudio.json();
      const dataUrdu = await resUrdu.json();
      const dataTrans = await resTrans.json();

      setAyahs(dataAudio.data.ayahs.map((a: any, i: number) => ({ 
        ...a, 
        translation: dataUrdu.data.ayahs[i].text,
        transliteration: dataTrans.data.ayahs[i].text
      })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

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

    audioRef.current.onended = () => {
      if (isLooping) {
        audioRef.current?.play();
      } else if (isAutoPlayEnabled && ayah) {
        handleSkipNext();
      } else {
        setIsAudioPaused(true);
      }
    };

    if (ayah) {
      setTimeout(() => {
        ayahRefs.current[ayah.numberInSurah]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const handlePlayFullSurah = (s: Surah) => {
    const url = `https://cdn.islamic.network/quran/audio-surah/128/${selectedReciter.id}/${s.number}.mp3`;
    handleAudioPlayback(url, undefined, undefined);
  };

  const handleSkipNext = () => {
    if (playingAyah && ayahs.length > 0) {
      const currentIndex = ayahs.findIndex(a => a.number === playingAyah.number);
      if (currentIndex < ayahs.length - 1) {
        const nextAyah = ayahs[currentIndex + 1];
        handleAudioPlayback(nextAyah.audio || '', undefined, nextAyah);
      }
    }
  };

  const handleSkipPrev = () => {
    if (playingAyah && ayahs.length > 0) {
      const currentIndex = ayahs.findIndex(a => a.number === playingAyah.number);
      if (currentIndex > 0) {
        const prevAyah = ayahs[currentIndex - 1];
        handleAudioPlayback(prevAyah.audio || '', undefined, prevAyah);
      }
    }
  };

  const downloadSurah = async (s: Surah) => {
    if (downloadingSurahNumber !== null) return;
    setDownloadingSurahNumber(s.number);
    setDownloadStatus('pending');
    setDownloadProgress(0);
    
    try {
      const url = `https://cdn.islamic.network/quran/audio-surah/128/${selectedReciter.id}/${s.number}.mp3`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Connection Error");
      
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      setDownloadStatus('downloading');
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream Error");

      const chunks = [];
      while(true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (total) setDownloadProgress(Math.round((loaded / total) * 100));
        else setDownloadProgress(p => Math.min(p + 5, 99));
      }

      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${s.englishName}_${selectedReciter.name}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadedSurahs(prev => [...new Set([...prev, s.number])]);
      setDownloadStatus('completed');
      setTimeout(() => { setDownloadingSurahNumber(null); setDownloadStatus('idle'); }, 2000);
    } catch (e) {
      setDownloadStatus('failed');
      setTimeout(() => { setDownloadingSurahNumber(null); setDownloadStatus('idle'); }, 5000);
    }
  };

  const shareDua = async (dua: Dua) => {
    const text = `*${dua.title}*\n\nArabic:\n${dua.arabic}\n\nTranslation:\n${dua.translation}\n\nDedicated to the legacy of Syed Muhammad Tahir Hub.`;
    
    // Fix: Validate URL before using Sharing API to avoid Invalid URL errors
    const currentUrl = window.location.href;
    const isValidUrl = currentUrl.startsWith('http');
    
    if (navigator.share) {
      try {
        const shareData: ShareData = { title: dua.title, text: text };
        if (isValidUrl) shareData.url = currentUrl;
        await navigator.share(shareData);
      } catch (e) { 
        console.error('Sharing failed', e);
        // Fallback to clipboard if share fails
        navigator.clipboard.writeText(text);
        alert('Content copied to clipboard.');
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Content copied to clipboard for sharing.');
    }
  };

  const statsSummary = useMemo(() => {
    const dates = Object.keys(prayerHistory).sort().reverse().slice(0, 30);
    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toLocaleDateString('en-CA');
      const day = prayerHistory[dateStr] || { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: Object.values(day).filter(Boolean).length
      };
    });
    return { dates, weeklyData };
  }, [prayerHistory]);

  const prayersDoneToday = Object.values(namazStats).filter(Boolean).length;

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#011a14] text-white">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        onAdminClick={() => setIsAdminPortalOpen(true)} 
        onFeedbackClick={() => {}} 
        isLocked={!isGuardianUnlocked} 
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar pb-32">
        <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
           <div>
              <h1 className="text-2xl font-black luxury-text uppercase tracking-widest leading-tight">Syed Muhammad Tahir</h1>
              <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mt-1 italic">Ibne Syed Muhammad Mehdi Shia Hub</p>
           </div>
           <div className="flex flex-wrap items-center gap-4 md:gap-8 glass-card px-6 py-4 rounded-[2rem] border-white/5 w-full lg:w-auto">
              {!notificationsEnabled && (
                <button 
                  onClick={requestNotificationPermission}
                  className="bg-[#d4af37]/10 text-[#d4af37] px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest animate-pulse border border-[#d4af37]/20"
                >
                  Enable Azan Notifications
                </button>
              )}
              <div className="text-right ml-auto">
                <p className="text-xl md:text-2xl font-black luxury-text uppercase tabular-nums tracking-widest">{currentTime}</p>
                <p className="text-[9px] md:text-[10px] font-black text-[#d4af37] uppercase tracking-[0.2em]">{hijriDate}</p>
              </div>
           </div>
        </header>

        {activeTab === 'home' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             {/* Home Bulletin with Grounding Data */}
             <section className="glass-card p-10 rounded-[3rem] border-2 border-emerald-500/30 bg-emerald-500/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <i className="fas fa-newspaper text-8xl text-emerald-500"></i>
                </div>
                <div className="flex items-center gap-6 mb-6">
                   <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                      <i className="fas fa-satellite-dish animate-pulse"></i>
                   </div>
                   <h2 className="text-[12px] font-black luxury-text uppercase tracking-[0.4em]">Sacred Bulletin (Real-time)</h2>
                </div>
                {updateLoading ? (
                   <div className="space-y-4">
                      <div className="h-4 w-3/4 bg-white/5 rounded-full animate-pulse"></div>
                      <div className="h-4 w-1/2 bg-white/5 rounded-full animate-pulse"></div>
                   </div>
                ) : (
                   <div className="animate-in fade-in slide-in-from-bottom-2">
                      <p className="text-white/80 text-lg font-serif italic leading-relaxed mb-6">
                        {homeUpdate || "Observing the celestial alignment..."}
                      </p>
                      {homeSources.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                           {homeSources.map((s, idx) => (
                             <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-500 uppercase hover:bg-emerald-500 hover:text-white transition-all">
                               {s.title || "Report"} <i className="fas fa-external-link-alt ml-1"></i>
                             </a>
                           ))}
                        </div>
                      )}
                   </div>
                )}
             </section>

             <section className="glass-card p-10 rounded-[3rem] border-2 border-[#d4af37]/40 bg-gradient-to-br from-[#d4af37]/10 to-transparent flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group shadow-2xl">
                <div className="w-20 h-20 bg-[#d4af37] rounded-[2.5rem] flex items-center justify-center shadow-lg shrink-0 animate-float">
                  <i className="fas fa-hand-holding-heart text-[#011a14] text-3xl"></i>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-black luxury-text uppercase tracking-widest mb-3">Recite Surah al-Fatiha</h2>
                  <p className="text-white/80 text-sm font-medium leading-[1.8] italic">
                    "Please recite a <strong>Surah al-Fatiha</strong> for the noble soul of <strong>Syed Muhammad Tahir Ibne Syed Muhammad Mehdi</strong>. May Allah elevate his station and grant him proximity to the Ahlulbayt (as) in Paradise."
                  </p>
                </div>
             </section>

             <section className="bg-gradient-to-br from-[#022c22] to-[#011a14] rounded-[4rem] p-6 md:p-12 lg:p-16 border border-white/10 relative overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="glass-card p-10 rounded-[3rem] border-white/10 text-left overflow-hidden relative border-2">
                      <header className="mb-10 flex justify-between items-center relative z-10">
                         <div>
                            <h3 className="text-[14px] font-black luxury-text uppercase tracking-widest">Celestial Clock</h3>
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">Spiritual Alignment Tracker</p>
                         </div>
                         <div className="flex gap-2">
                           {['daily', 'qadha', 'stats'].map(m => (
                             <button 
                                key={m} 
                                onClick={() => setTrackerMode(m as any)} 
                                className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all border ${trackerMode === m ? 'bg-[#d4af37] text-[#011a14] border-[#d4af37]' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}
                             >
                               {m}
                             </button>
                           ))}
                         </div>
                      </header>
                      
                      <div className="relative z-10 min-h-[400px]">
                        {trackerMode === 'daily' && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                             <div className="flex items-center gap-8 bg-white/5 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                                <div className="w-20 h-20 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                                   <svg className="absolute inset-0 w-full h-full -rotate-90">
                                      <circle cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                      <circle 
                                         cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="4" 
                                         strokeDasharray={213.6} strokeDashoffset={213.6 - (prayersDoneToday / 5) * 213.6} 
                                         className="text-[#d4af37] transition-all duration-1000" 
                                      />
                                   </svg>
                                   <span className="text-lg font-black luxury-text">{prayersDoneToday}/5</span>
                                </div>
                                <div>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Daily Adherence</p>
                                   <p className="text-[8px] font-bold text-emerald-500 uppercase mt-1 tracking-widest">{prayersDoneToday === 5 ? 'Celestial Harmony Achieved' : `${5 - prayersDoneToday} Steps to Perfection`}</p>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 gap-4">
                               {PRAYER_NAMES.map(p => (
                                 <button 
                                   key={p} 
                                   onClick={() => toggleNamaz(p)}
                                   className={`w-full p-6 rounded-[2rem] flex justify-between items-center transition-all group border-2 ${namazStats[p as keyof DailyNamazStats] ? 'bg-[#d4af37]/10 border-[#d4af37]/40 shadow-[0_0_30px_rgba(212,175,55,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                 >
                                    <div className="flex items-center gap-6">
                                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${namazStats[p as keyof DailyNamazStats] ? 'bg-[#d4af37] text-[#011a14] shadow-[0_0_20px_rgba(212,175,55,0.4)] rotate-[360deg]' : 'bg-white/10 text-white/20'}`}>
                                          <i className={`fas ${namazStats[p as keyof DailyNamazStats] ? 'fa-check-double' : 'fa-circle'} text-sm`}></i>
                                       </div>
                                       <div className="text-left">
                                          <span className={`text-[14px] font-black uppercase tracking-widest transition-colors ${namazStats[p as keyof DailyNamazStats] ? 'luxury-text' : 'text-white/40 group-hover:text-white'}`}>{p}</span>
                                          <p className="text-[9px] font-bold text-white/10 uppercase mt-0.5 tracking-tighter">Azan: {prayerTimes?.[p] || '--:--'}</p>
                                       </div>
                                    </div>
                                    {namazStats[p as keyof DailyNamazStats] && (
                                      <div className="flex flex-col items-end animate-in fade-in slide-in-from-left-2">
                                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Alhamdulillah</span>
                                        <span className="text-[6px] text-white/20 uppercase mt-0.5">Prayer Recorded</span>
                                      </div>
                                    )}
                                 </button>
                               ))}
                             </div>
                          </div>
                        )}

                        {trackerMode === 'qadha' && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                             <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem] text-center mb-6">
                                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-3 opacity-60">Spiritual Debts (Qadha)</h4>
                                <p className="text-6xl font-black luxury-text tabular-nums">{(Object.values(qadhaStats) as number[]).reduce((a, b) => a + b, 0)}</p>
                                <p className="text-[8px] font-bold text-white/20 uppercase mt-4 tracking-[0.6em]">Awaiting Fulfillment</p>
                             </div>

                             {PRAYER_NAMES.map(p => (
                               <div key={p} className="glass-card p-6 rounded-[2rem] flex justify-between items-center border-white/5 group hover:border-white/10 transition-all">
                                  <span className="text-[12px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{p}</span>
                                  <div className="flex items-center gap-6">
                                     <button 
                                      onClick={() => setQadhaStats(prev => ({ ...prev, [p]: Math.max(0, prev[p as keyof QadhaState] - 1) }))} 
                                      className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                     >
                                        <i className="fas fa-minus"></i>
                                     </button>
                                     <span className="font-black text-2xl tabular-nums min-w-[40px] text-center luxury-text">{qadhaStats[p as keyof QadhaState]}</span>
                                     <button 
                                      onClick={() => setQadhaStats(prev => ({ ...prev, [p]: prev[p as keyof QadhaState] + 1 }))} 
                                      className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                                     >
                                        <i className="fas fa-plus"></i>
                                     </button>
                                  </div>
                               </div>
                             ))}
                          </div>
                        )}

                        {trackerMode === 'stats' && (
                          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 py-4">
                             <div className="flex items-end justify-between h-40 px-6 bg-white/[0.02] rounded-[2rem] p-8 border border-white/5 shadow-inner">
                                {statsSummary.weeklyData.map((d, i) => (
                                  <div key={i} className="flex flex-col items-center gap-4 group flex-1">
                                     <div className="relative w-10 flex flex-col items-center justify-end h-28">
                                       <div 
                                         className="w-full rounded-t-xl bg-gradient-to-t from-[#d4af37]/40 to-[#d4af37] transition-all duration-1000 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                                         style={{ height: `${Math.max(8, (d.count / 5) * 100)}%` }}
                                       />
                                       <span className="absolute -top-6 text-[10px] font-black luxury-text opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">{d.count}</span>
                                     </div>
                                     <span className="text-[10px] font-black text-white/20 uppercase group-hover:text-white transition-colors">{d.label}</span>
                                  </div>
                                ))}
                             </div>
                             <div className="grid grid-cols-6 gap-3 p-8 bg-white/[0.02] rounded-[3rem] border border-white/5 relative overflow-hidden">
                                {Array.from({ length: 30 }).map((_, i) => {
                                   const date = new Date();
                                   date.setDate(date.getDate() - (29 - i));
                                   const dateStr = date.toLocaleDateString('en-CA');
                                   const day = prayerHistory[dateStr];
                                   const count = day ? Object.values(day).filter(Boolean).length : 0;
                                   return (
                                     <div 
                                       key={i} 
                                       title={`${dateStr}: ${count}/5`}
                                       className={`aspect-square rounded-full flex items-center justify-center border transition-all duration-700 hover:scale-125 hover:z-10 cursor-help ${count > 0 ? 'bg-[#d4af37] border-[#d4af37]' : 'bg-white/5 border-white/5'}`}
                                       style={{ opacity: count === 0 ? 0.1 : 0.3 + (count / 5) * 0.7 }}
                                     />
                                   );
                                })}
                             </div>
                             <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.5em] font-black">Monthly Adherence Heatmap</p>
                          </div>
                        )}
                      </div>
                   </div>

                   <div className="space-y-12 flex flex-col">
                      <div className="glass-card p-12 rounded-[3rem] bg-gradient-to-br from-[#d4af37]/15 text-left border-[#d4af37]/20 relative overflow-hidden border-2 flex-1 flex flex-col justify-center min-h-[350px] shadow-2xl">
                         <h3 className="text-[10px] font-black text-[#d4af37] uppercase mb-10 tracking-[0.6em] opacity-80">Celestial Revelation</h3>
                         <p className="quran-text text-4xl md:text-5xl leading-relaxed mb-10 italic luxury-text relative z-10 drop-shadow-lg text-right">{DIVINE_PEARLS[0].text}</p>
                         <p className="text-white/70 font-serif italic text-xl md:text-2xl mb-12 leading-relaxed relative z-10 border-l-2 border-[#d4af37]/20 pl-8">"{DIVINE_PEARLS[0].translation}"</p>
                         <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-widest opacity-80">— {DIVINE_PEARLS[0].author}</span>
                      </div>
                      <div onClick={() => setActiveTab('amals')} className="cursor-pointer glass-card p-12 rounded-[3rem] border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between group overflow-hidden relative border-2 hover:bg-emerald-500/10 transition-all shadow-xl">
                         <div className="relative z-10">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 block opacity-80">Sacred Agenda: {currentDay}</span>
                            <h4 className="text-3xl font-black uppercase tracking-widest luxury-text group-hover:scale-105 transition-transform origin-left">{todaysAmal.title}</h4>
                         </div>
                         <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all text-emerald-500">
                           <i className="fas fa-arrow-right text-xl"></i>
                         </div>
                      </div>
                   </div>
                </div>
             </section>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-6">
            <header className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-black luxury-text uppercase mb-6 tracking-tighter">Global Hubs</h2>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.6em] mb-10">Trusted Shia Knowledge Network</p>
              <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent mx-auto"></div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {SHIA_RESOURCES.map(res => (
                <a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" className="glass-card p-12 rounded-[3rem] border-white/5 hover:border-[#d4af37]/40 transition-all group border-2 flex flex-col h-full shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                    <i className={`fas ${res.icon} text-[10rem]`}></i>
                  </div>
                  <div className="w-20 h-20 rounded-[1.5rem] bg-[#d4af37]/10 flex items-center justify-center mb-10 border border-[#d4af37]/20 group-hover:bg-[#d4af37] group-hover:text-[#011a14] transition-all shadow-lg">
                    <i className={`fas ${res.icon} text-3xl`}></i>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-wider mb-6 luxury-text">{res.name}</h3>
                  <p className="text-white/40 text-sm md:text-base font-medium leading-relaxed flex-1 mb-10 italic">"{res.description}"</p>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#d4af37] opacity-60 group-hover:opacity-100 transition-all">
                    Explore Sanctuary <i className="fas fa-arrow-right-long transition-transform group-hover:translate-x-2"></i>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'quran' && (
           <div className="space-y-10 animate-in fade-in">
             {!selectedSurah ? (
               <div className="space-y-12 py-6">
                 <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                    <div>
                      <h2 className="text-6xl font-black luxury-text uppercase tracking-tighter">Holy Quran</h2>
                      <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Divine Verses of Guidance</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto">
                       <button 
                         onClick={() => setIsReciterModalOpen(true)}
                         className="flex items-center gap-4 bg-white/5 border-2 border-white/10 rounded-[2rem] px-8 py-4 hover:border-[#d4af37]/40 transition-all group"
                       >
                          <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-[#011a14] transition-all">
                             <i className="fas fa-microphone"></i>
                          </div>
                          <div className="text-left">
                             <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block">Selected Reciter</span>
                             <span className="text-[11px] font-black uppercase tracking-widest text-white group-hover:text-[#d4af37] transition-colors">{selectedReciter.name}</span>
                          </div>
                       </button>
                       <div className="relative w-full lg:w-[30rem] group">
                          <i className="fas fa-search absolute left-8 top-1/2 -translate-y-1/2 text-[#d4af37]/40 text-2xl group-focus-within:text-[#d4af37] transition-colors"></i>
                          <input 
                           type="text" 
                           placeholder="Seek a Surah..." 
                           value={surahSearch} 
                           onChange={(e) => setSurahSearch(e.target.value)} 
                           className="w-full bg-white/5 border-2 border-white/10 rounded-[3rem] py-6 pl-20 pr-10 text-lg font-black uppercase outline-none focus:border-[#d4af37]/50 shadow-2xl transition-all" 
                          />
                       </div>
                    </div>
                 </header>

                 {/* Featured Surah Yaseen */}
                 {!surahSearch && (
                   <section className="animate-in fade-in slide-in-from-top-4 duration-1000">
                      <div 
                        className="glass-card p-12 rounded-[4rem] border-4 border-[#d4af37]/30 bg-gradient-to-r from-[#d4af37]/10 to-transparent flex flex-col md:flex-row items-center gap-12 group transition-all shadow-[0_50px_100px_rgba(0,0,0,0.6)]"
                      >
                         <div className="w-24 h-24 md:w-32 md:h-32 bg-[#d4af37] rounded-[2.5rem] flex items-center justify-center text-[#011a14] shadow-2xl group-hover:scale-110 transition-transform">
                            <i className="fas fa-heart text-4xl md:text-5xl animate-pulse"></i>
                         </div>
                         <div className="text-center md:text-left flex-1">
                            <span className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.6em] mb-3 block">Heart of the Quran</span>
                            <h3 
                              onClick={() => {
                                const yaseen = surahs.find(s => s.number === 36);
                                if (yaseen) handleSurahSelection(yaseen);
                              }}
                              className="text-4xl md:text-6xl font-black luxury-text uppercase mb-4 tracking-tighter cursor-pointer hover:underline"
                            >
                              Surah Yaseen (36)
                            </h3>
                            <p className="text-white/40 text-sm md:text-lg font-medium italic">"Everything has a heart, and the heart of the Quran is Yaseen. Whoever recites it, Allah writes for them the reward of reciting the entire Quran ten times." — Prophetic Tradition</p>
                            <div className="flex gap-4 mt-8">
                               <button onClick={() => { const s = surahs.find(s => s.number === 36); if(s) handlePlayFullSurah(s); }} className="px-6 py-3 rounded-xl bg-[#d4af37] text-[#011a14] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 transition-transform"><i className="fas fa-play"></i> Listen</button>
                               <button onClick={() => { const s = surahs.find(s => s.number === 36); if(s) downloadSurah(s); }} className="px-6 py-3 rounded-xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-white/20 transition-all"><i className="fas fa-download"></i> Save</button>
                            </div>
                         </div>
                         <div className="quran-text text-7xl md:text-8xl text-white/5 opacity-50 group-hover:opacity-100 transition-opacity">يس</div>
                      </div>
                   </section>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   {filteredSurahs.map(s => (
                     <div key={s.number} className="w-full glass-card p-10 rounded-[3.5rem] text-left hover:border-[#d4af37]/40 transition-all relative overflow-hidden flex flex-col justify-between h-80 border-2 group hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                        <div className="relative z-10">
                          <span className="text-[12px] font-black text-[#d4af37] opacity-60 tracking-[0.3em]">SURAH № {s.number}</span>
                          <h5 
                            onClick={() => handleSurahSelection(s)} 
                            className="text-2xl font-black uppercase tracking-tight mt-2 group-hover:luxury-text transition-all cursor-pointer"
                          >
                            {s.englishName}
                          </h5>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1 italic">{s.englishNameTranslation}</p>
                        </div>
                        <span className="quran-text text-7xl text-white/5 block text-right absolute bottom-8 right-8 transition-all group-hover:scale-110 group-hover:opacity-20">{s.name}</span>
                        
                        <div className="mt-auto relative z-10 flex items-center justify-between">
                           <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{s.numberOfAyahs} Verses</span>
                           <div className="flex gap-2">
                              <button onClick={() => handlePlayFullSurah(s)} className="w-10 h-10 rounded-full bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37] hover:text-[#011a14] transition-all"><i className="fas fa-play text-[10px]"></i></button>
                              <button onClick={() => downloadSurah(s)} className="w-10 h-10 rounded-full bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all"><i className="fas fa-download text-[10px]"></i></button>
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             ) : (
               <div className="space-y-16 animate-in slide-in-from-bottom-6">
                   <div className="flex flex-col md:flex-row justify-between items-center sticky top-0 z-30 bg-[#011a14]/90 backdrop-blur-2xl py-6 border-b border-white/5 gap-6">
                    <button onClick={() => setSelectedSurah(null)} className="bg-white/5 px-10 py-5 rounded-[2rem] text-[#d4af37] uppercase font-black text-[12px] flex items-center gap-6 hover:bg-white/10 tracking-widest border border-white/10 shadow-xl transition-all"><i className="fas fa-arrow-left"></i> Celestial Library</button>
                    <div className="flex flex-wrap justify-center gap-4">
                      <button 
                        onClick={() => setIsReciterModalOpen(true)}
                        className="bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 text-[11px] font-black uppercase tracking-widest text-white/70 hover:border-[#d4af37]/30 transition-all flex items-center gap-4"
                      >
                         <i className="fas fa-microphone text-[#d4af37]"></i>
                         {selectedReciter.fullName}
                      </button>
                      <button onClick={() => handlePlayFullSurah(selectedSurah)} className="bg-[#d4af37] text-[#011a14] px-10 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest flex items-center gap-4 shadow-xl hover:scale-105 transition-transform"><i className="fas fa-play"></i> Listen Full</button>
                      <button onClick={() => downloadSurah(selectedSurah)} className={`px-10 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest border transition-all flex items-center gap-4 ${downloadingSurahNumber === selectedSurah.number ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]' : 'bg-white/5 text-white/40 hover:text-white border-white/10'}`}>
                        {downloadingSurahNumber === selectedSurah.number ? <><i className="fas fa-spinner animate-spin"></i> {downloadProgress}%</> : <><i className="fas fa-download"></i> Download Surah</>}
                      </button>
                    </div>
                  </div>
                  <div className="glass-card p-24 md:p-32 rounded-[5rem] text-center border-[#d4af37]/30 relative overflow-hidden shadow-2xl border-4 bg-gradient-to-br from-[#d4af37]/10 to-transparent">
                     <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <i className="fas fa-star-and-crescent text-[30rem] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
                     </div>
                     <h2 className="text-7xl md:text-9xl font-black luxury-text mb-8 tracking-tighter drop-shadow-2xl">{selectedSurah.englishName}</h2>
                     <p className="text-5xl md:text-7xl quran-text text-[#d4af37] mb-10 drop-shadow-xl">{selectedSurah.name}</p>
                     <div className="h-1 w-48 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto"></div>
                  </div>
                  <div className="space-y-12 max-w-6xl mx-auto pb-48">
                    {ayahs.map(a => (
                      <div 
                        key={a.number} 
                        ref={el => ayahRefs.current[a.numberInSurah] = el}
                        className={`glass-card p-10 md:p-16 rounded-[4rem] relative group transition-all duration-700 shadow-2xl border-2 ${playingAyah?.number === a.number ? 'active-ayah-card bg-[#d4af37]/10 scale-[1.03]' : 'border-white/5 hover:border-white/20'}`}
                      >
                         <div className="flex flex-col lg:flex-row-reverse justify-between items-start gap-12 lg:gap-20 mb-16">
                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center text-sm md:text-lg font-black shrink-0 border-2 shadow-2xl transition-all duration-700 ${playingAyah?.number === a.number ? 'bg-[#d4af37] text-[#011a14] border-[#d4af37] rotate-[360deg]' : 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20'}`}>{a.numberInSurah}</div>
                            <p className={`quran-text text-5xl md:text-7xl lg:text-8xl text-right leading-loose flex-1 transition-all duration-700 drop-shadow-md w-full ${playingAyah?.number === a.number ? 'text-white scale-[1.02]' : 'text-white/90'}`}>{a.text}</p>
                         </div>
                         <div className="space-y-10 pl-8 md:pl-16 border-l-4 border-[#d4af37]/20">
                            <div className="flex flex-col gap-4">
                               <p className={`text-[12px] md:text-sm font-black uppercase tracking-[0.4em] transition-colors duration-700 ${playingAyah?.number === a.number ? 'text-[#d4af37]' : 'text-white/20'}`}>{a.transliteration}</p>
                               <div className="h-0.5 w-16 bg-[#d4af37]/20"></div>
                            </div>
                            <p className={`font-serif italic text-2xl md:text-4xl lg:text-5xl leading-relaxed transition-all duration-700 ${playingAyah?.number === a.number ? 'text-white/95' : 'text-white/60'}`}>"{a.translation}"</p>
                         </div>
                         <div className="mt-20 flex justify-end items-center gap-10">
                            {playingAyah?.number === a.number && (
                               <div className="flex items-center gap-4 animate-in fade-in zoom-in slide-in-from-right-4">
                                  <div className="flex gap-1 items-end h-4">
                                     {[1,2,3,2,1,2,3,1].map((h, i) => (
                                        <div key={i} className="w-1 bg-[#d4af37] rounded-full animate-bounce" style={{ height: `${h * 25}%`, animationDelay: `${i * 0.1}s` }}></div>
                                     ))}
                                  </div>
                                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d4af37]">Voice of Revelation</span>
                               </div>
                            )}
                            <button onClick={() => handleAudioPlayback(a.audio || '', undefined, a)} className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl border-4 ${playingAyah?.number === a.number && !isAudioPaused ? 'bg-[#d4af37] text-[#011a14] border-[#d4af37] scale-110' : 'bg-white/5 text-white/20 hover:bg-[#d4af37] hover:text-[#011a14] border-white/5 hover:border-[#d4af37] hover:scale-110'}`}>
                               <i className={`fas ${playingAyah?.number === a.number && !isAudioPaused ? 'fa-pause' : 'fa-play'} text-2xl md:text-3xl ${playingAyah?.number === a.number && !isAudioPaused ? '' : 'pl-1'}`}></i>
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
             )}
           </div>
        )}

        {activeTab === 'tasbih' && (
           <div className="space-y-12 animate-in fade-in flex flex-col items-center justify-center min-h-[70vh]">
              <header className="text-center max-w-3xl mx-auto mb-16">
                 <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Sacred counting</h2>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">Digital beads of devotion</p>
              </header>
              <div className="flex gap-4 mb-20 overflow-x-auto pb-4 max-w-full custom-scrollbar scrollbar-hide">
                 {[...TASBIH_PRESETS, ...customTasbihs].map(p => (
                   <button key={p.id} onClick={() => { setActiveTasbih(p); setTasbihCount(0); }} className={`px-10 py-5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap shadow-xl ${activeTasbih.id === p.id ? 'bg-[#d4af37] text-[#011a14] border-[#d4af37] scale-110' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>{p.name}</button>
                 ))}
              </div>
              <div onClick={() => setTasbihCount(prev => prev + 1)} className="w-80 h-80 md:w-96 md:h-96 rounded-full border-8 border-[#d4af37]/20 flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all bg-gradient-to-br from-[#d4af37]/10 via-transparent to-[#d4af37]/5 shadow-[0_0_150px_rgba(212,175,55,0.15)] group relative overflow-hidden">
                 <div className="absolute inset-0 bg-[#d4af37]/5 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <span className="text-8xl md:text-9xl font-black luxury-text tabular-nums relative z-10">{tasbihCount}</span>
                 <span className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.6em] mt-8 opacity-40 group-hover:opacity-100 transition-all relative z-10 animate-pulse">Invoke Allah</span>
              </div>
              <button onClick={() => setTasbihCount(0)} className="mt-20 px-12 py-4 rounded-full border-2 border-white/5 text-[12px] font-black text-white/20 uppercase tracking-[0.6em] hover:text-red-500 hover:border-red-500/30 transition-all shadow-xl">Reset beads</button>
           </div>
        )}

        {activeTab === 'prayer-times' && (
           <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-10">
              <header className="text-center mb-16">
                 <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Prayer Times</h2>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Jafari (Shia) Calculation Method</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div className="lg:col-span-1 space-y-8">
                    <div className="glass-card p-10 rounded-[3rem] border-2 border-white/5">
                       <h3 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-8">Location Settings</h3>
                       <div className="space-y-6">
                          <div>
                             <label className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3 block">City</label>
                             <input 
                                type="text" 
                                value={manualLocation.city} 
                                onChange={(e) => setManualLocation({...manualLocation, city: e.target.value})}
                                placeholder="e.g. London"
                                className="w-full bg-[#011a14] border-2 border-white/5 rounded-2xl p-4 text-[12px] font-black outline-none focus:border-[#d4af37]/30 transition-all"
                             />
                          </div>
                          <div>
                             <label className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3 block">Country</label>
                             <input 
                                type="text" 
                                value={manualLocation.country} 
                                onChange={(e) => setManualLocation({...manualLocation, country: e.target.value})}
                                placeholder="e.g. UK"
                                className="w-full bg-[#011a14] border-2 border-white/5 rounded-2xl p-4 text-[12px] font-black outline-none focus:border-[#d4af37]/30 transition-all"
                             />
                          </div>
                          <button 
                             onClick={fetchPrayerTimesByCity}
                             disabled={isLocating}
                             className="w-full bg-[#d4af37]/10 text-[#d4af37] border-2 border-[#d4af37]/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d4af37] hover:text-[#011a14] transition-all disabled:opacity-50"
                          >
                             {isLocating ? 'Syncing...' : 'Update Location'}
                          </button>
                          <div className="flex items-center gap-4 py-4">
                             <div className="h-px flex-1 bg-white/5"></div>
                             <span className="text-[8px] font-black text-white/10 uppercase">OR</span>
                             <div className="h-px flex-1 bg-white/5"></div>
                          </div>
                          <button 
                             onClick={useGPS}
                             disabled={isLocating}
                             className="w-full bg-white/5 text-white/40 border-2 border-white/10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                          >
                             <i className="fas fa-location-crosshairs mr-2"></i> Use My GPS
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {prayerTimes ? PRAYER_NAMES.map(name => (
                          <div key={name} className="glass-card p-10 rounded-[3rem] border-2 border-white/5 flex justify-between items-center group hover:border-[#d4af37]/30 transition-all">
                             <div>
                                <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-2 block">{name}</span>
                                <span className="text-4xl font-black luxury-text">{prayerTimes[name]}</span>
                             </div>
                             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10 group-hover:text-[#d4af37] transition-all">
                                <i className={`fas ${name === 'Fajr' ? 'fa-sun-haze' : name === 'Dhuhr' ? 'fa-sun' : name === 'Asr' ? 'fa-cloud-sun' : name === 'Maghrib' ? 'fa-sunset' : 'fa-moon'} text-2xl`}></i>
                             </div>
                          </div>
                       )) : (
                          <div className="col-span-full py-20 text-center">
                             <p className="text-white/20 font-black uppercase tracking-widest">Awaiting celestial alignment...</p>
                          </div>
                       )}
                    </div>
                    {prayerTimes && (
                       <div className="glass-card p-10 rounded-[3rem] border-2 border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                          <div className="text-center md:text-left">
                             <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block">Imsak (Start of Fast)</span>
                             <span className="text-3xl font-black text-white">{prayerTimes.Imsak}</span>
                          </div>
                          <div className="h-12 w-px bg-white/5 hidden md:block"></div>
                          <div className="text-center md:text-left">
                             <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block">Sunrise</span>
                             <span className="text-3xl font-black text-white">{prayerTimes.Sunrise}</span>
                          </div>
                          <div className="h-12 w-px bg-white/5 hidden md:block"></div>
                          <div className="text-center md:text-left">
                             <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block">Midnight</span>
                             <span className="text-3xl font-black text-white">{prayerTimes.Midnight}</span>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'calendar' && (
           <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-10">
              <header className="text-center mb-16">
                 <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Hijri Calendar</h2>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Sacred Timeline of the Ahlulbayt (as)</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div className="lg:col-span-1 space-y-8">
                    <div className="glass-card p-10 rounded-[3rem] border-2 border-[#d4af37]/30 bg-[#d4af37]/5 text-center">
                       <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-4 block">Today's Hijri Date</span>
                       <h3 className="text-4xl font-black luxury-text mb-4">{hijriDate}</h3>
                       <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>

                    <div className="glass-card p-10 rounded-[3rem] border-2 border-white/5">
                       <h3 className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-8">Calendar Legend</h3>
                       <div className="space-y-6">
                          <div className="flex items-center gap-4">
                             <div className="w-4 h-4 rounded-full bg-red-500/50 border border-red-500"></div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Martyrdom / Sorrow</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="w-4 h-4 rounded-full bg-emerald-500/50 border border-emerald-500"></div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Birth / Joy</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="w-4 h-4 rounded-full bg-[#d4af37]/50 border border-[#d4af37]"></div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Significant Event</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-10 rounded-[3rem] border-2 border-white/5">
                       <h3 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-10">Upcoming Observances</h3>
                       <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                          {HIJRI_EVENTS.map((event, idx) => (
                             <div key={idx} className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex gap-8 items-center group hover:bg-white/[0.08] transition-all">
                                <div className={`w-20 h-20 rounded-[1.5rem] flex flex-col items-center justify-center shrink-0 border-2 ${event.type === 'martyrdom' ? 'border-red-500/30 bg-red-500/10 text-red-500' : event.type === 'birth' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' : 'border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]'}`}>
                                   <span className="text-2xl font-black">{event.day}</span>
                                   <span className="text-[8px] font-black uppercase">Day</span>
                                </div>
                                <div className="flex-1">
                                   <h4 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-white transition-colors">{event.title}</h4>
                                   <p className="text-white/40 text-sm font-medium leading-relaxed">{event.description}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'duas' && (
           <div className="space-y-12 animate-in fade-in py-6">
              <header className="text-center max-w-3xl mx-auto mb-16">
                 <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Duas & Ziyarats</h2>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Sacred Supplications of the Household (as)</p>
              </header>

              {selectedDua ? (
                 <div className="animate-in zoom-in slide-in-from-bottom-10 max-w-5xl mx-auto">
                    <button onClick={() => setSelectedDua(null)} className="mb-12 flex items-center gap-4 text-white/20 hover:text-[#d4af37] transition-all group">
                       <div className="w-12 h-12 rounded-full border-2 border-white/5 flex items-center justify-center group-hover:border-[#d4af37]/30">
                          <i className="fas fa-arrow-left"></i>
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-widest">Return to Collection</span>
                    </button>

                    <div className="glass-card p-12 md:p-20 rounded-[4rem] border-2 border-[#d4af37]/20 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-20 opacity-[0.02]">
                          <i className="fas fa-hands-holding text-[20rem]"></i>
                       </div>
                       
                       <header className="text-center mb-20 relative z-10">
                          <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.5em] mb-6 block">{selectedDua.category}</span>
                          <h3 className="text-5xl md:text-7xl font-black luxury-text uppercase mb-8 tracking-tighter leading-tight">{selectedDua.title}</h3>
                          <div className="flex justify-center gap-8">
                             <button onClick={() => handleAudioPlayback(selectedDua.audio || '', selectedDua)} className="w-20 h-20 rounded-full bg-[#d4af37] text-[#011a14] flex items-center justify-center shadow-2xl hover:scale-110 transition-all">
                                <i className={`fas ${activePlayingDua?.id === selectedDua.id && !isAudioPaused ? 'fa-pause' : 'fa-play'} text-2xl pl-1`}></i>
                             </button>
                          </div>
                       </header>

                       <div className="space-y-20 relative z-10">
                          <div className="text-center">
                             <p className="quran-text text-5xl md:text-7xl leading-[2.5] text-white/95 mb-12">{selectedDua.arabic}</p>
                             <div className="h-px w-48 bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent mx-auto"></div>
                          </div>

                          <div className="space-y-12">
                             <div>
                                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-6">Transliteration</h4>
                                <p className="text-xl md:text-2xl font-black text-white/40 uppercase tracking-widest leading-relaxed">{selectedDua.transliteration || 'Syncing transliteration...'}</p>
                             </div>
                             <div>
                                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-6">English Translation</h4>
                                <p className="text-2xl md:text-3xl font-serif italic text-white/80 leading-relaxed">"{selectedDua.translation}"</p>
                             </div>
                          </div>

                          {selectedDua.historicalContext && (
                             <div className="pt-12 border-t border-white/5">
                                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6">Historical Context</h4>
                                <p className="text-lg text-white/40 leading-relaxed">{selectedDua.historicalContext}</p>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
                    {[...POPULAR_DUAS, ...ZIYARATS].map(dua => (
                      <button key={dua.id} onClick={() => setSelectedDua(dua)} className="glass-card p-12 rounded-[4rem] text-left border-white/5 hover:border-[#d4af37]/40 transition-all group relative overflow-hidden flex flex-col h-[450px] border-2 shadow-2xl hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                         <div className="absolute -top-10 -right-10 p-16 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
                           <i className="fas fa-hands-holding text-[15rem]"></i>
                         </div>
                         <span className="text-[11px] font-black text-[#d4af37] uppercase mb-6 block tracking-[0.4em] opacity-80">{dua.category}</span>
                         <h3 className="text-3xl font-black uppercase tracking-tight mb-8 leading-tight group-hover:luxury-text transition-all">{dua.title}</h3>
                         <p className="text-white/40 text-base md:text-lg font-medium italic line-clamp-4 mb-12 flex-1 leading-relaxed">"{dua.translation}"</p>
                         <div className="mt-auto flex justify-between items-center w-full relative z-10">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-[#011a14] transition-all shadow-xl group-hover:scale-110">
                              <i className="fas fa-play text-xl pl-1"></i>
                            </div>
                            <div className="flex gap-4">
                              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-white transition-colors">Listen Now</div>
                            </div>
                         </div>
                      </button>
                    ))}
                 </div>
              )}
           </div>
        )}

        {activeTab === 'reminders' && (
           <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-10">
              <header className="text-center mb-16">
                 <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Prayer Reminders</h2>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Customize your spiritual alerts</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reminders.map(reminder => (
                  <div key={reminder.id} className="glass-card p-10 rounded-[3rem] border-2 border-white/5 hover:border-[#d4af37]/30 transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-2 block">{reminder.prayerName}</span>
                        <input 
                          type="text"
                          value={reminder.label}
                          onChange={(e) => {
                            const newReminders = reminders.map(r => r.id === reminder.id ? { ...r, label: e.target.value } : r);
                            setReminders(newReminders);
                          }}
                          className="bg-transparent text-2xl font-black uppercase tracking-tight outline-none focus:text-[#d4af37] transition-colors w-full"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const newReminders = reminders.map(r => r.id === reminder.id ? { ...r, enabled: !r.enabled } : r);
                          setReminders(newReminders);
                        }}
                        className={`w-14 h-8 rounded-full transition-all relative shrink-0 ${reminder.enabled ? 'bg-[#d4af37]' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${reminder.enabled ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3 block">Prayer Link</label>
                        <select 
                          value={reminder.prayerName} 
                          onChange={(e) => {
                            const newReminders = reminders.map(r => r.id === reminder.id ? { ...r, prayerName: e.target.value } : r);
                            setReminders(newReminders);
                          }}
                          className="w-full bg-[#011a14] border-2 border-white/5 rounded-2xl p-3 text-[11px] font-black outline-none focus:border-[#d4af37]/30 transition-all cursor-pointer"
                        >
                          {PRAYER_NAMES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3 block">Schedule Offset</label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" 
                            min="-60" 
                            max="60" 
                            step="5"
                            value={reminder.offsetMinutes}
                            onChange={(e) => {
                              const newReminders = reminders.map(r => r.id === reminder.id ? { ...r, offsetMinutes: parseInt(e.target.value) } : r);
                              setReminders(newReminders);
                            }}
                            className="flex-1"
                          />
                          <span className="text-[12px] font-black text-white min-w-[60px] text-right">
                            {reminder.offsetMinutes === 0 ? 'At time' : `${Math.abs(reminder.offsetMinutes)}m ${reminder.offsetMinutes < 0 ? 'before' : 'after'}`}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3 block">Notification Sound</label>
                        <select 
                          value={reminder.soundUrl || ''} 
                          onChange={(e) => {
                            const newReminders = reminders.map(r => r.id === reminder.id ? { ...r, soundUrl: e.target.value } : r);
                            setReminders(newReminders);
                          }}
                          className="w-full bg-[#011a14] border-2 border-white/5 rounded-2xl p-3 text-[11px] font-black outline-none focus:border-[#d4af37]/30 transition-all cursor-pointer"
                        >
                          <option value="">System Default</option>
                          {NOTIFICATION_SOUNDS.map(s => <option key={s.id} value={s.url}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                       <button 
                        onClick={() => {
                          if (reminder.soundUrl) {
                            const audio = new Audio(reminder.soundUrl);
                            audio.play();
                          }
                        }}
                        className="p-3 text-white/20 hover:text-[#d4af37] transition-colors"
                        title="Test Sound"
                       >
                         <i className="fas fa-volume-up"></i>
                       </button>
                       <button 
                        onClick={() => {
                          const newReminders = reminders.filter(r => r.id !== reminder.id);
                          setReminders(newReminders);
                        }}
                        className="p-3 text-white/10 hover:text-red-500 transition-colors"
                       >
                         <i className="fas fa-trash-alt"></i>
                       </button>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => {
                    const id = `custom-${Date.now()}`;
                    setReminders([...reminders, { id, prayerName: 'Fajr', offsetMinutes: 0, enabled: true, label: 'Custom Reminder' }]);
                  }}
                  className="glass-card p-10 rounded-[3rem] border-2 border-dashed border-white/10 hover:border-[#d4af37]/30 transition-all flex flex-col items-center justify-center gap-4 group min-h-[300px]"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-[#011a14] transition-all">
                    <i className="fas fa-plus text-2xl"></i>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">Add Custom Alert</span>
                </button>
              </div>
           </div>
        )}

        {activeTab === 'ask' && (
           <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-10">
              <header className="text-center mb-16">
                 <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">AI Guidance</h2>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Scholarly Consultation Engine</p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                 <div className="glass-card p-8 rounded-[2rem] border-white/10 border-2">
                    <label className="text-[10px] font-black text-[#d4af37] uppercase mb-3 block tracking-widest">School of Thought</label>
                    <select value={aiOptions.school} onChange={(e) => setAiOptions({...aiOptions, school: e.target.value})} className="w-full bg-[#011a14] border-2 border-white/5 rounded-2xl p-4 text-[12px] font-black outline-none focus:border-[#d4af37]/30 transition-all cursor-pointer">
                       {SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                 <div className="glass-card p-8 rounded-[2rem] border-white/10 border-2">
                    <label className="text-[10px] font-black text-[#d4af37] uppercase mb-3 block tracking-widest">Selected Marja'</label>
                    <select value={aiOptions.scholar} onChange={(e) => setAiOptions({...aiOptions, scholar: e.target.value})} className="w-full bg-[#011a14] border-2 border-white/5 rounded-2xl p-4 text-[12px] font-black outline-none focus:border-[#d4af37]/30 transition-all cursor-pointer">
                       {SCHOLARS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                 <div className="glass-card p-8 rounded-[2rem] border-white/10 border-2">
                    <label className="text-[10px] font-black text-[#d4af37] uppercase mb-3 block tracking-widest">Consultation Depth</label>
                    <select value={aiOptions.depth} onChange={(e) => setAiOptions({...aiOptions, depth: e.target.value as any})} className="w-full bg-[#011a14] border-2 border-white/5 rounded-2xl p-4 text-[12px] font-black outline-none focus:border-[#d4af37]/30 transition-all cursor-pointer">
                       {['simple', 'scholarly', 'mystical'].map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                    </select>
                 </div>
              </div>
              <div className="relative mb-16">
                 <textarea 
                  value={aiChatInput} 
                  onChange={(e) => setAiChatInput(e.target.value)} 
                  placeholder="Inquire about Fiqh, History, or Theology..." 
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[3rem] p-12 text-2xl md:text-3xl min-h-[300px] resize-none outline-none focus:border-[#d4af37]/50 shadow-inner transition-all font-serif" 
                 />
                 <button 
                  onClick={() => setIsReviewingAiQuery(true)} 
                  disabled={aiChatLoading || !aiChatInput.trim()} 
                  className="absolute bottom-10 right-10 bg-[#d4af37] text-[#011a14] px-16 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
                 >
                    Seek Guidance
                 </button>
              </div>

              {aiChatResponse && !aiChatLoading && (
                <div className="space-y-12 animate-in slide-in-from-bottom-10 py-10">
                   <div className="glass-card p-16 rounded-[4rem] border-[#d4af37]/30 border-4 bg-[#d4af37]/5 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
                      <p className="text-2xl md:text-3xl leading-relaxed font-serif italic text-white/95 whitespace-pre-wrap selection:bg-[#d4af37] selection:text-[#011a14]">{aiChatResponse}</p>
                   </div>
                   {aiSources.length > 0 && (
                     <div className="p-8 flex flex-wrap gap-6 justify-center">
                        <span className="w-full text-center text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mb-4">Verified Sources</span>
                        {aiSources.map((source, idx) => ( 
                          <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-white/5 border-2 border-white/10 rounded-full text-[10px] font-black text-[#d4af37] uppercase hover:bg-[#d4af37] hover:text-[#011a14] transition-all shadow-lg">
                            {source.title || 'Verified Source'} <i className="fas fa-external-link-alt text-[8px] ml-2"></i>
                          </a> 
                        ))}
                     </div>
                   )}
                </div>
              )}
           </div>
        )}

        {activeTab === 'legacy' && (
           <div className="space-y-16 animate-in fade-in max-w-5xl mx-auto pb-24 py-10">
              <header className="text-center">
                 <h2 className="text-5xl md:text-7xl font-black luxury-text uppercase mb-6 tracking-tighter">Our Legacy</h2>
                 <p className="text-white/30 text-[10px] md:text-sm font-black uppercase tracking-[0.6em] mb-12">The Syed Muhammad Tahir Shia Hub</p>
                 <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto"></div>
              </header>

              <section className="glass-card p-12 rounded-[4rem] border-[#d4af37]/20 border-2 relative overflow-hidden bg-gradient-to-br from-[#022c22] to-transparent">
                 <div className="absolute top-0 right-0 p-12 opacity-5">
                    <i className="fas fa-scroll text-[15rem] text-[#d4af37]"></i>
                 </div>
                 <div className="relative z-10">
                    <h3 className="text-2xl font-black luxury-text uppercase tracking-widest mb-8 border-b border-white/5 pb-4">The Mission</h3>
                    <p className="text-xl md:text-2xl leading-relaxed font-serif italic text-white/90 mb-10">
                      "To provide a digital sanctuary where the timeless wisdom of the Ahlulbayt (as) converges with the forefront of modern technology, ensuring that spiritual enlightenment remains a continuous opportunity for every soul."
                    </p>
                 </div>
              </section>

              <section className="space-y-12">
                 <div className="text-center">
                    <h3 className="text-3xl font-black luxury-text uppercase tracking-widest mb-4">Dedicated To</h3>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">A Tribute of Perpetual Charity (Sadaqah Jariyah)</p>
                 </div>

                 <div className="glass-card p-12 rounded-[4rem] border-white/5 border-2 text-center bg-white/[0.02]">
                    <h4 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-[#d4af37]">Syed Muhammad Tahir</h4>
                    <p className="text-[10px] md:text-sm font-black text-white/20 uppercase tracking-[0.8em] mb-10">Ibne Syed Muhammad Mehdi</p>
                    
                    <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-3xl mx-auto italic font-serif">
                      This application is established as a digital legacy to honor the life and commitment of Syed Muhammad Tahir. A servant of the faith who cherished the teachings of the Ma'sumeen (as).
                    </p>
                 </div>
              </section>

              <footer className="text-center pt-12">
                 <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-4">May Allah elevate his station in Paradise</p>
                 <p className="quran-text text-3xl text-white/20">اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ</p>
              </footer>
           </div>
        )}
      </main>

      {isAdminPortalOpen && (
        <AdminPortal onClose={() => setIsAdminPortalOpen(false)} isUnlocked={isGuardianUnlocked} onUnlock={() => { setIsGuardianUnlocked(true); sessionStorage.setItem('guardian_unlocked', 'true'); }} onLock={() => { setIsGuardianUnlocked(false); sessionStorage.setItem('guardian_unlocked', 'false'); }} />
      )}

      {selectedDua && (
        <div className="fixed inset-0 z-[500] bg-[#011a14]/98 backdrop-blur-3xl flex flex-col p-6 md:p-12 animate-in slide-in-from-bottom-20 duration-500 overflow-y-auto custom-scrollbar">
           <header className="flex justify-between items-center mb-20 max-w-7xl mx-auto w-full shrink-0 sticky top-0 bg-transparent py-4 z-50">
              <button onClick={() => setSelectedDua(null)} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/10 flex items-center justify-center text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all shadow-xl bg-[#011a14]/50"><i className="fas fa-chevron-down text-2xl"></i></button>
              <div className="text-center">
                <h2 className="luxury-text font-black text-4xl md:text-7xl uppercase tracking-tighter mb-2 drop-shadow-2xl">{selectedDua.title}</h2>
                <p className="text-[11px] md:text-[14px] font-black text-[#d4af37] uppercase tracking-[0.6em] opacity-80">{selectedDua.category}</p>
              </div>
              <div className="flex gap-4 md:gap-8">
                 <button onClick={() => shareDua(selectedDua)} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/10 flex items-center justify-center text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all shadow-xl bg-[#011a14]/50"><i className="fas fa-share-nodes text-xl"></i></button>
                 <button onClick={() => handleAudioPlayback(selectedDua.audio || '', selectedDua)} className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#d4af37] text-[#011a14] flex items-center justify-center shadow-[0_30px_60px_rgba(212,175,55,0.3)] hover:scale-110 transition-all"><i className="fas fa-play text-2xl md:text-3xl pl-2"></i></button>
              </div>
           </header>
           <div className="flex-1 px-4 md:px-20 lg:px-40 space-y-24 max-w-7xl mx-auto w-full pb-64">
              <div className="text-center">
                <p className="quran-text text-6xl md:text-8xl lg:text-9xl leading-[2.5] text-white/95 drop-shadow-2xl selection:bg-[#d4af37] selection:text-[#011a14]">{selectedDua.arabic}</p>
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent my-24"></div>
                <p className="font-serif italic text-3xl md:text-5xl lg:text-6xl text-center text-white/50 leading-relaxed max-w-6xl mx-auto drop-shadow-lg selection:bg-white/10">"{selectedDua.translation}"</p>
              </div>

              {(selectedDua.historicalContext || selectedDua.biography) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-24 border-t-2 border-white/5">
                  {selectedDua.historicalContext && (
                    <div className="glass-card p-14 rounded-[4rem] border-[#d4af37]/20 border-2 bg-gradient-to-br from-[#d4af37]/5 to-transparent shadow-2xl">
                      <h4 className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.5em] mb-10 border-b border-white/5 pb-6">Sacred Narrative</h4>
                      <p className="text-white/70 text-lg md:text-xl leading-relaxed italic font-serif">"{selectedDua.historicalContext}"</p>
                    </div>
                  )}
                  {selectedDua.biography && (
                    <div className="glass-card p-14 rounded-[4rem] border-[#d4af37]/20 border-2 bg-gradient-to-br from-[#d4af37]/5 to-transparent shadow-2xl">
                      <h4 className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.5em] mb-10 border-b border-white/5 pb-6">Celestial Legacy</h4>
                      <p className="text-white/70 text-lg md:text-xl leading-relaxed italic font-serif">"{selectedDua.biography}"</p>
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>
      )}

      {isReviewingAiQuery && (
        <div className="fixed inset-0 z-[1000] bg-[#011a14]/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="max-w-3xl w-full glass-card p-12 md:p-20 rounded-[4rem] border-[#d4af37]/40 border-4 relative overflow-hidden shadow-[0_100px_200px_rgba(0,0,0,0.8)]">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
            <h3 className="luxury-text text-4xl md:text-5xl font-black uppercase mb-12 text-center tracking-tighter">Scholarly Review</h3>
            
            <div className="space-y-12 mb-16">
              <div className="p-10 rounded-[2.5rem] bg-white/5 border-2 border-white/10 shadow-inner">
                <span className="text-[12px] font-black text-[#d4af37] uppercase tracking-widest block mb-4">Your Inquiry</span>
                <p className="text-xl md:text-2xl font-serif italic text-white/90 leading-relaxed">"{aiChatInput}"</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <button onClick={() => setIsReviewingAiQuery(false)} className="flex-1 py-6 border-2 border-white/10 rounded-[1.5rem] text-[12px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/60">Revise Question</button>
              <button onClick={handleAiChat} className="flex-1 py-6 bg-[#d4af37] text-[#011a14] rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.2em] shadow-[0_30px_60px_rgba(212,175,55,0.3)] hover:scale-105 transition-all">Submit to Scholars</button>
            </div>
          </div>
        </div>
      )}

       {aiChatLoading && (
        <div className="fixed inset-0 z-[1000] bg-[#011a14]/90 backdrop-blur-3xl flex flex-col items-center justify-center p-20">
           <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-8 border-[#d4af37]/10 border-t-[#d4af37] animate-spin mb-12 shadow-[0_0_100px_rgba(212,175,55,0.2)]"></div>
           <h3 className="luxury-text text-3xl font-black uppercase tracking-widest animate-pulse">Consulting the Archives</h3>
           <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.6em] mt-6 opacity-60">Synthesizing Scholarly Rulings...</p>
        </div>
      )}

      {isReciterModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-[#011a14]/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
           <div className="max-w-4xl w-full glass-card p-10 md:p-16 rounded-[4rem] border-[#d4af37]/40 border-4 relative overflow-hidden shadow-[0_100px_200px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
              
              <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
                 <div className="text-center md:text-left">
                    <h3 className="luxury-text text-4xl font-black uppercase tracking-tighter">Voices of Revelation</h3>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mt-2">Select a Qari for your journey</p>
                 </div>
                 <div className="relative w-full md:w-80 group">
                    <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-[#d4af37]/40 text-lg group-focus-within:text-[#d4af37] transition-colors"></i>
                    <input 
                      type="text" 
                      placeholder="Search Qari..." 
                      value={reciterSearch}
                      onChange={(e) => setReciterSearch(e.target.value)}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-full py-4 pl-14 pr-6 text-sm font-black uppercase outline-none focus:border-[#d4af37]/50 transition-all"
                    />
                 </div>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-6">
                 {filteredReciters.map(r => (
                    <button 
                      key={r.id} 
                      onClick={() => { setSelectedReciter(r); setIsReciterModalOpen(false); }}
                      className={`w-full p-8 rounded-[2.5rem] border-2 transition-all flex items-center gap-8 group relative overflow-hidden ${selectedReciter.id === r.id ? 'bg-[#d4af37]/10 border-[#d4af37] shadow-xl' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.08]'}`}
                    >
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all ${selectedReciter.id === r.id ? 'bg-[#d4af37] text-[#011a14]' : 'bg-white/5 text-white/20 group-hover:text-white'}`}>
                          <i className="fas fa-microphone-lines text-xl"></i>
                       </div>
                       <div className="text-left flex-1">
                          <h4 className={`text-xl font-black uppercase tracking-tight transition-colors ${selectedReciter.id === r.id ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>{r.fullName}</h4>
                          <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest mt-1">{r.bio || 'Renowned Qari'}</p>
                       </div>
                       {selectedReciter.id === r.id && (
                          <div className="w-10 h-10 rounded-full bg-[#d4af37] text-[#011a14] flex items-center justify-center shadow-lg animate-in zoom-in">
                             <i className="fas fa-check text-sm"></i>
                          </div>
                       )}
                    </button>
                 ))}
                 {filteredReciters.length === 0 && (
                    <div className="py-20 text-center">
                       <p className="text-white/20 font-black uppercase tracking-widest">No Qari found in the archives</p>
                    </div>
                 )}
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex justify-center">
                 <button onClick={() => setIsReciterModalOpen(false)} className="px-12 py-4 border-2 border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white hover:border-white/30 transition-all">Close Archives</button>
              </div>
           </div>
        </div>
      )}

      <AudioController 
        isOpen={isAudioControllerOpen} 
        onClose={() => setIsAudioControllerOpen(false)} 
        activeDua={activePlayingDua} 
        playingAyah={playingAyah} 
        selectedSurah={selectedSurah} 
        progress={audioProgress} 
        duration={audioDuration} 
        isPaused={isAudioPaused} 
        isLooping={isLooping} 
        onToggleLoop={() => setIsLooping(!isLooping)} 
        isAutoPlayEnabled={isAutoPlayEnabled} 
        onToggleAutoPlay={() => setIsAutoPlayEnabled(!isAutoPlayEnabled)} 
        onSeek={(e) => { const t = parseFloat(e.target.value); if(audioRef.current) audioRef.current.currentTime = t; setAudioProgress(t); }} 
        onTogglePlayback={() => { if(audioRef.current?.paused) audioRef.current.play(); else audioRef.current?.pause(); setIsAudioPaused(!isAudioPaused); }} 
        onSkipNext={handleSkipNext} 
        onSkipPrev={handleSkipPrev} 
        volume={1} 
        onVolumeChange={() => {}} 
        speed={1} 
        onSpeedChange={(s) => { if(audioRef.current) audioRef.current.playbackRate = s; }} 
        onDownload={() => { if(selectedSurah) downloadSurah(selectedSurah); }} 
        sleepTimer={null} 
        onSetSleepTimer={() => {}} 
      />
    </div>
  );
};

export default App;
