
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AdminPortal from './components/AdminPortal';
import AudioController from './components/AudioController';
import PrayerTracker from './components/PrayerTracker';
import { QiblaCompass } from './components/QiblaCompass';
import { HadithLibrary } from './components/HadithLibrary';
import VoiceGuidance from './components/VoiceGuidance';
import SalatGuide from './components/SalatGuide';
import { 
  POPULAR_DUAS, 
  DAILY_AMALS, 
  ZIYARATS, 
  TASBIH_PRESETS, 
  RECITERS,
  DIVINE_PEARLS,
  SHIA_RESOURCES,
  NOTIFICATION_SOUNDS,
  HIJRI_EVENTS,
  MEDIA_LIBRARY,
  QUIZ_DATA,
  FORUM_TOPICS,
  RAMADAN_DAYS,
  RAMADAN_COMMON_DUAS,
  DAILY_DUAS,
  IFTAR_DUA,
  SEHRI_DUA,
  SHIA_HADITHS,
  SHIA_KNOWLEDGE_BASE,
  DUA_CATEGORIES,
  HADITH_CATEGORIES
} from './constants';
import { Surah, Ayah, Dua, Reciter, QadhaState, TasbihPreset, Amal, PrayerHistory, DailyNamazStats, Reminder, HijriEvent, SavedAyah, MediaItem, QuizQuestion, ForumTopic, RamadanDay, UserProfile, ForumReply, Hadith, ShiaKnowledge } from './types';
import { askGeminiChat, AiConsultationOptions } from './services/geminiService';
import { LiveVoiceChat } from './components/LiveVoiceChat';

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
const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Sunset', 'Maghrib', 'Isha', 'Midnight'];
const SHIA_AZAN_URL = 'https://www.duas.org/audio/Azan_Shia.mp3';

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.substring(1);
    return path || 'home';
  });

  useEffect(() => {
    const path = location.pathname.substring(1) || 'home';
    if (path !== activeTab) {
      setActiveTab(path);
    }
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/${tab === 'home' ? '' : tab}`);
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Forum State
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>(FORUM_TOPICS);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('smt_user_profile');
    return saved ? JSON.parse(saved) : {
      id: 'u_' + Date.now(),
      name: 'Guest User',
      avatar: '👤',
      role: 'user',
      joinedDate: new Date().toLocaleDateString()
    };
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const { user } = await response.json();
        setUserProfile({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: 'user',
          joinedDate: userProfile.joinedDate
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();
      
      const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setUserProfile({
        id: 'u_' + Date.now(),
        name: 'Guest User',
        avatar: '👤',
        role: 'user',
        joinedDate: new Date().toLocaleDateString()
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) return;
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchUser();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [surahSearch, setSurahSearch] = useState('');
  const [quranGlobalSearch, setQuranGlobalSearch] = useState('');
  const [quranSearchResults, setQuranSearchResults] = useState<any[]>([]);
  const [isSearchingQuran, setIsSearchingQuran] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS[0]);
  const [reciterSearch, setReciterSearch] = useState('');
  const [isReciterModalOpen, setIsReciterModalOpen] = useState(false);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [selectedKnowledge, setSelectedKnowledge] = useState<ShiaKnowledge | null>(null);
  const [duaCategory, setDuaCategory] = useState('All');
  const [duaSearch, setDuaSearch] = useState('');
  const [trackerMode, setTrackerMode] = useState<'daily' | 'qadha' | 'stats'>('daily');

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
  const [savedHadiths, setSavedHadiths] = useState<string[]>(() => {
    const saved = localStorage.getItem('smt_saved_hadiths');
    return saved ? JSON.parse(saved) : [];
  });
  const [hadithSearch, setHadithSearch] = useState('');
  const [hadithCategory, setHadithCategory] = useState('All');
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('smt_saved_hadiths', JSON.stringify(savedHadiths));
  }, [savedHadiths]);

  const toggleSavedHadith = (id: string) => {
    setSavedHadiths(prev => prev.includes(id) ? prev.filter(hid => hid !== id) : [...prev, id]);
  };

  const calculateQibla = (lat: number, lng: number) => {
    const KAABA_LAT = 21.4225 * (Math.PI / 180);
    const KAABA_LNG = 39.8262 * (Math.PI / 180);
    const phi = lat * (Math.PI / 180);
    const lambda = lng * (Math.PI / 180);

    const y = Math.sin(KAABA_LNG - lambda);
    const x = Math.cos(phi) * Math.tan(KAABA_LAT) - Math.sin(phi) * Math.cos(KAABA_LNG - lambda);
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    qibla = (qibla + 360) % 360;
    setQiblaDirection(qibla);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        calculateQibla(pos.coords.latitude, pos.coords.longitude);
      });
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // @ts-ignore
      const heading = e.webkitCompassHeading || e.alpha;
      if (heading !== undefined && heading !== null) setDeviceHeading(heading);
    };

    if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

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

  const [savedAyahs, setSavedAyahs] = useState<SavedAyah[]>(() => {
    const saved = localStorage.getItem('smt_saved_ayahs');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedDuas, setSavedDuas] = useState<string[]>(() => {
    const saved = localStorage.getItem('smt_saved_duas');
    return saved ? JSON.parse(saved) : [];
  });

  const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const [selectedAmalDay, setSelectedAmalDay] = useState(currentDay);

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
  const [duaAiExplanation, setDuaAiExplanation] = useState('');
  const [isExplainingDua, setIsExplainingDua] = useState(false);
  const [explainingAyah, setExplainingAyah] = useState<Ayah | null>(null);
  const [ayahExplanation, setAyExplanation] = useState('');
  const [isExplainingAyah, setIsExplainingAyah] = useState(false);

  const activeAmal: Amal = DAILY_AMALS[selectedAmalDay] || DAILY_AMALS['Saturday'];

  // Audio Control
  const [isAudioControllerOpen, setIsAudioControllerOpen] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPaused, setIsAudioPaused] = useState(true);
  const [activePlayingDua, setActivePlayingDua] = useState<Dua | null>(null);
  const [playingAyah, setPlayingAyah] = useState<Ayah | null>(null);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);

  const dailyHadith = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return SHIA_HADITHS[dayOfYear % SHIA_HADITHS.length];
  }, []);
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
  const [calculationMethod, setCalculationMethod] = useState('0'); // 0 = Shia Ithna-Ashari, Leva Institute, Qum, 7 = Institute of Geophysics, University of Tehran
  const [isLocating, setIsLocating] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<{name: string, time: string, remaining: string} | null>(null);

  const toArabicNumerals = (str: string) => {
    return str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  };

  const [isTasbihModalOpen, setIsTasbihModalOpen] = useState(false);
  const [jumpToAyah, setJumpToAyah] = useState<string>('');

  const handleJumpToAyah = () => {
    const ayahNum = parseInt(jumpToAyah);
    if (isNaN(ayahNum) || ayahNum < 1 || !selectedSurah || ayahNum > selectedSurah.numberOfAyahs) {
      alert(`Please enter a valid verse number between 1 and ${selectedSurah?.numberOfAyahs || '...'}`);
      return;
    }
    ayahRefs.current[ayahNum]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setJumpToAyah('');
  };

  const handleQuranGlobalSearch = async () => {
    if (!quranGlobalSearch.trim()) return;
    setIsSearchingQuran(true);
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/search/${quranGlobalSearch}/all/ur.jawadi`);
      const data = await response.json();
      if (data.status === 'OK') {
        setQuranSearchResults(data.data.matches);
      } else {
        setQuranSearchResults([]);
      }
    } catch (e) {
      console.error(e);
      setQuranSearchResults([]);
    } finally {
      setIsSearchingQuran(false);
    }
  };
  const [newTasbihName, setNewTasbihName] = useState('');
  const [newTasbihLabel, setNewTasbihLabel] = useState('');
  const [newTasbihMax, setNewTasbihMax] = useState(100);
  const currentRamadanDay = useMemo(() => {
    if (hijriDate && hijriDate.toLowerCase().includes('ramadan')) {
      const day = parseInt(hijriDate.split(' ')[0]);
      return isNaN(day) ? null : day;
    }
    return null;
  }, [hijriDate]);

  const [selectedRamadanDay, setSelectedRamadanDay] = useState(1);

  useEffect(() => {
    if (currentRamadanDay) {
      setSelectedRamadanDay(currentRamadanDay);
    }
  }, [currentRamadanDay]);
  const [completedAmalSteps, setCompletedAmalSteps] = useState<Record<string, boolean>>({});

  const toggleStepCompletion = (amalId: string, stepIdx: number) => {
    const key = `${amalId}-${stepIdx}`;
    setCompletedAmalSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAddTasbih = () => {
    if (!newTasbihName || !newTasbihLabel) return;
    const newTasbih: TasbihPreset = {
      id: `custom-${Date.now()}`,
      name: newTasbihName,
      label: newTasbihLabel,
      max: newTasbihMax,
      isCustom: true
    };
    setCustomTasbihs([...customTasbihs, newTasbih]);
    setNewTasbihName('');
    setNewTasbihLabel('');
    setNewTasbihMax(100);
    setIsTasbihModalOpen(false);
  };

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [askScholarQuestion, setAskScholarQuestion] = useState('');
  const [askScholarEmail, setAskScholarEmail] = useState('');
  const [isAskScholarModalOpen, setIsAskScholarModalOpen] = useState(false);

  const handleQuizAnswer = (index: number) => {
    setSelectedQuizOption(index);
    if (index === QUIZ_DATA[currentQuizIndex].correctIndex) {
      setQuizScore(prev => prev + 1);
    }
    setTimeout(() => {
      if (currentQuizIndex < QUIZ_DATA.length - 1) {
        setCurrentQuizIndex(prev => prev + 1);
        setSelectedQuizOption(null);
      } else {
        setShowQuizResult(true);
      }
    }, 1500);
  };

  const handleAddTopic = () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;
    const newTopic: ForumTopic = {
      id: `t-${Date.now()}`,
      title: newTopicTitle,
      content: newTopicContent,
      author: userProfile.name,
      authorAvatar: userProfile.avatar,
      replies: 0,
      repliesList: [],
      views: 0,
      lastActive: 'Just now',
      category: 'General',
      upvotes: 0,
      downvotes: 0
    };
    setForumTopics([newTopic, ...forumTopics]);
    setNewTopicTitle('');
    setNewTopicContent('');
    setIsNewTopicModalOpen(false);
  };

  const handleVote = (topicId: string, type: 'up' | 'down') => {
    setForumTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        return {
          ...t,
          upvotes: type === 'up' ? t.upvotes + 1 : t.upvotes,
          downvotes: type === 'down' ? t.downvotes + 1 : t.downvotes
        };
      }
      return t;
    }));
  };

  const handleReply = (topicId: string) => {
    if (!replyContent.trim()) return;
    const newReply: ForumReply = {
      id: 'r_' + Date.now(),
      author: userProfile.name,
      authorAvatar: userProfile.avatar,
      content: replyContent,
      timestamp: 'Just now',
      upvotes: 0,
      downvotes: 0
    };

    setForumTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        const updatedTopic = {
          ...t,
          replies: t.replies + 1,
          repliesList: [...(t.repliesList || []), newReply],
          lastActive: 'Just now'
        };
        if (selectedTopic?.id === topicId) setSelectedTopic(updatedTopic);
        return updatedTopic;
      }
      return t;
    }));
    setReplyContent('');
  };

  const handleDeleteTopic = (topicId: string) => {
    if (confirm('Are you sure you want to delete this topic?')) {
      setForumTopics(prev => prev.filter(t => t.id !== topicId));
      if (selectedTopic?.id === topicId) setSelectedTopic(null);
    }
  };

  const handlePinTopic = (topicId: string) => {
    setForumTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        return { ...t, isPinned: !t.isPinned };
      }
      return t;
    }));
  };

  const handleVoteReply = (topicId: string, replyId: string, type: 'up' | 'down') => {
    setForumTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        const updatedTopic = {
          ...t,
          repliesList: t.repliesList?.map(r => {
            if (r.id === replyId) {
              return {
                ...r,
                upvotes: type === 'up' ? r.upvotes + 1 : r.upvotes,
                downvotes: type === 'down' ? r.downvotes + 1 : r.downvotes
              };
            }
            return r;
          })
        };
        if (selectedTopic?.id === topicId) setSelectedTopic(updatedTopic);
        return updatedTopic;
      }
      return t;
    }));
  };

  const handleUpdateProfile = (name: string, avatar: string) => {
    const updated = { ...userProfile, name, avatar };
    setUserProfile(updated);
    localStorage.setItem('smt_user_profile', JSON.stringify(updated));
    setIsProfileModalOpen(false);
  };

  const handleAskScholarSubmit = () => {
    if (!askScholarQuestion.trim() || !askScholarEmail.trim()) return;
    alert('Your question has been submitted to our panel of scholars. You will receive a response via email.');
    setAskScholarQuestion('');
    setAskScholarEmail('');
    setIsAskScholarModalOpen(false);
  };

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

    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;

    const calculateNextPrayer = () => {
      const now = new Date();
      const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Sunset', 'Maghrib', 'Isha', 'Midnight'];
      let upcoming = null;
      let minDiff = Infinity;

      for (const p of prayers) {
        const timeStr = prayerTimes[p];
        if (!timeStr) continue;
        
        const [h, m] = timeStr.split(':').map(Number);
        const pDate = new Date();
        pDate.setHours(h, m, 0, 0);
        
        let diff = pDate.getTime() - now.getTime();
        
        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          upcoming = { name: p, time: timeStr };
        }
      }

      if (!upcoming) {
        // Next is Fajr tomorrow
        const timeStr = prayerTimes['Fajr'];
        const [h, m] = timeStr.split(':').map(Number);
        const pDate = new Date();
        pDate.setDate(pDate.getDate() + 1);
        pDate.setHours(h, m, 0, 0);
        minDiff = pDate.getTime() - now.getTime();
        upcoming = { name: 'Fajr', time: timeStr };
      }

      const hours = Math.floor(minDiff / (1000 * 60 * 60));
      const minutes = Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((minDiff % (1000 * 60)) / 1000);

      setNextPrayer({
        name: upcoming.name,
        time: upcoming.time,
        remaining: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      });
    };

    const timer = setInterval(calculateNextPrayer, 1000);
    calculateNextPrayer();
    return () => clearInterval(timer);
  }, [prayerTimes]);

  const fetchPrayerTimes = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=${calculationMethod}`);
      const data = await res.json();
      setPrayerTimes(data.data.timings);
      setHijriDate(`${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`);
    } catch (e) { console.error(e); }
  };

  const fetchPrayerTimesByCity = async () => {
    if (!manualLocation.city || !manualLocation.country) return;
    setIsLocating(true);
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${manualLocation.city}&country=${manualLocation.country}&method=${calculationMethod}`);
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

  useEffect(() => {
    if (manualLocation.city && manualLocation.country) {
      fetchPrayerTimesByCity();
    } else if (navigator.geolocation) {
      useGPS();
    }
  }, [calculationMethod]);

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
  useEffect(() => localStorage.setItem('smt_saved_ayahs', JSON.stringify(savedAyahs)), [savedAyahs]);
  useEffect(() => localStorage.setItem('smt_saved_duas', JSON.stringify(savedDuas)), [savedDuas]);

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

  const handleExplainDua = async (dua: Dua) => {
    setIsExplainingDua(true);
    setDuaAiExplanation('');
    try {
      const prompt = `Please provide a brief, insightful explanation and summary of the following Islamic supplication (Dua/Ziyarat):
Title: ${dua.title}
Translation: ${dua.translation}
${dua.historicalContext ? `Historical Context: ${dua.historicalContext}` : ''}
Please explain its significance, key themes, and spiritual benefits.`;
      const { text } = await askGeminiChat(prompt, aiOptions);
      setDuaAiExplanation(text);
    } catch (e) {
      setDuaAiExplanation('Failed to generate explanation.');
    } finally {
      setIsExplainingDua(false);
    }
  };

  const handleExplainAyah = async (ayah: Ayah, surah: Surah) => {
    setExplainingAyah(ayah);
    setIsExplainingAyah(true);
    setAyExplanation('');
    try {
      const prompt = `Please provide a brief, insightful explanation and Tafsir of the following Quranic verse:
Surah: ${surah.englishName} (${surah.number}), Ayah: ${ayah.numberInSurah}
Arabic: ${ayah.text}
Translation: ${ayah.translation}
Please explain its significance, key themes, and lessons based on Shia Tafsir (e.g., Al-Mizan) if possible.`;
      const { text } = await askGeminiChat(prompt, aiOptions);
      setAyExplanation(text);
    } catch (e) {
      setAyExplanation('Failed to generate explanation.');
    } finally {
      setIsExplainingAyah(false);
    }
  };

  const handleSurahSelection = async (s: Surah) => {
    setSelectedSurah(s);
    setLoading(true);
    try {
      const [resAudio, resUrdu, resEnglish, resTrans] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${s.number}/${selectedReciter.id}`),
        fetch(`https://api.alquran.cloud/v1/surah/${s.number}/ur.jawadi`),
        fetch(`https://api.alquran.cloud/v1/surah/${s.number}/en.shakir`),
        fetch(`https://api.alquran.cloud/v1/surah/${s.number}/en.transliteration`)
      ]);
      const dataAudio = await resAudio.json();
      const dataUrdu = await resUrdu.json();
      const dataEnglish = await resEnglish.json();
      const dataTrans = await resTrans.json();

      setAyahs(dataAudio.data.ayahs.map((a: any, i: number) => ({ 
        ...a, 
        translation: dataEnglish.data.ayahs[i].text,
        urduTranslation: dataUrdu.data.ayahs[i].text,
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

  const handleMediaPlayback = (media: MediaItem) => {
    const tempDua: Dua = {
      id: media.id,
      title: media.title,
      category: media.category,
      arabic: '',
      translation: media.speaker,
      audio: media.url,
    };
    handleAudioPlayback(media.url, tempDua);
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
    } else if (selectedSurah && surahs.length > 0) {
      const currentIndex = surahs.findIndex(s => s.number === selectedSurah.number);
      if (currentIndex < surahs.length - 1) {
        const nextSurah = surahs[currentIndex + 1];
        handleSurahSelection(nextSurah);
        handlePlayFullSurah(nextSurah);
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
    } else if (selectedSurah && surahs.length > 0) {
      const currentIndex = surahs.findIndex(s => s.number === selectedSurah.number);
      if (currentIndex > 0) {
        const prevSurah = surahs[currentIndex - 1];
        handleSurahSelection(prevSurah);
        handlePlayFullSurah(prevSurah);
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

  const toggleBookmark = (ayah: Ayah, surah: Surah) => {
    setSavedAyahs(prev => {
      const exists = prev.find(b => b.surahNumber === surah.number && b.ayahNumber === ayah.numberInSurah);
      if (exists) {
        return prev.filter(b => !(b.surahNumber === surah.number && b.ayahNumber === ayah.numberInSurah));
      } else {
        const newBookmark: SavedAyah = {
          surahNumber: surah.number,
          surahName: surah.englishName,
          ayahNumber: ayah.numberInSurah,
          ayahText: ayah.text,
          translation: ayah.translation || '',
          note: '',
          timestamp: Date.now()
        };
        return [...prev, newBookmark];
      }
    });
  };

  const toggleSavedDua = (duaId: string) => {
    setSavedDuas(prev => {
      if (prev.includes(duaId)) return prev.filter(id => id !== duaId);
      return [...prev, duaId];
    });
  };

  const updateBookmarkNote = (surahNumber: number, ayahNumber: number, note: string) => {
    setSavedAyahs(prev => prev.map(b => 
      (b.surahNumber === surahNumber && b.ayahNumber === ayahNumber) ? { ...b, note } : b
    ));
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

  const [bookmarkSearch, setBookmarkSearch] = useState('');

  const filteredBookmarks = useMemo(() => {
    return savedAyahs.filter(b => 
      b.surahName.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
      b.ayahText.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
      b.translation.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
      b.note.toLowerCase().includes(bookmarkSearch.toLowerCase())
    );
  }, [savedAyahs, bookmarkSearch]);

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
    <div className={`flex flex-col md:flex-row h-screen overflow-hidden bg-[#011a14] text-white ${isFullScreen ? 'p-0' : ''}`}>
      {!isFullScreen && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
          onAdminClick={() => setIsAdminPortalOpen(true)} 
          onFeedbackClick={() => {}} 
          isLocked={!isGuardianUnlocked}
          isAuthenticated={isAuthenticated}
          userProfile={userProfile}
          onProfileClick={() => setIsProfileModalOpen(true)}
        />
      )}

      <main className={`flex-1 overflow-y-auto custom-scrollbar pb-32 ${isFullScreen ? 'p-0' : 'p-4 md:p-12'}`}>
        {!isFullScreen && (
          <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
             <div>
                <h1 className="text-2xl font-black luxury-text uppercase tracking-widest leading-tight">Syed Muhammad Tahir</h1>
                <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mt-1 italic">Ibne Syed Muhammad Mehdi Shia Hub</p>
             </div>
             <div className="flex flex-wrap items-center gap-4 md:gap-8 glass-card px-6 py-4 rounded-[2rem] border-white/5 w-full lg:w-auto">
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Syed Muhammad Tahir Shia Hub',
                        text: 'Explore the digital sanctuary of Syed Muhammad Tahir Ibne Syed Muhammad Mehdi.',
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Sanctuary link copied to clipboard.');
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37] hover:text-[#011a14] transition-all shadow-lg"
                  title="Share Sanctuary"
                >
                  <i className="fas fa-share-nodes"></i>
                </button>
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
        )}

        {activeTab === 'home' && (
          <div className="space-y-12 animate-in fade-in duration-700">
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

             {savedAyahs.length > 0 && (
               <section className="animate-in fade-in slide-in-from-left-4 duration-1000">
                  <div className="flex items-center justify-between mb-8 px-4">
                     <h3 className="text-[12px] font-black luxury-text uppercase tracking-[0.4em]">Continue Your Journey</h3>
                     <button onClick={() => handleTabChange('bookmarks')} className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-[#d4af37] transition-colors">View All Bookmarks</button>
                  </div>
                  <div 
                    onClick={() => {
                      const b = savedAyahs.sort((a,b) => b.timestamp - a.timestamp)[0];
                      const surah = surahs.find(s => s.number === b.surahNumber);
                      if (surah) {
                        handleSurahSelection(surah);
                        handleTabChange('quran');
                        setTimeout(() => {
                          ayahRefs.current[b.ayahNumber]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 500);
                      }
                    }}
                    className="glass-card p-10 rounded-[3rem] border-2 border-white/5 hover:border-[#d4af37]/30 bg-gradient-to-r from-white/[0.02] to-transparent flex items-center gap-8 group cursor-pointer transition-all shadow-xl"
                  >
                     <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/20 group-hover:bg-[#d4af37] group-hover:text-[#011a14] transition-all">
                        <i className="fas fa-book-open"></i>
                     </div>
                     <div className="flex-1">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Last Bookmarked: Surah {savedAyahs.sort((a,b) => b.timestamp - a.timestamp)[0].surahName}</span>
                        <p className="text-xl font-black uppercase tracking-tight luxury-text line-clamp-1">Ayah {savedAyahs.sort((a,b) => b.timestamp - a.timestamp)[0].ayahNumber}: {savedAyahs.sort((a,b) => b.timestamp - a.timestamp)[0].ayahText}</p>
                     </div>
                     <i className="fas fa-chevron-right text-white/10 group-hover:text-[#d4af37] transition-all pr-4"></i>
                  </div>
               </section>
             )}

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
                         <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-widest opacity-80">— {DIVINE_PEARLS[0].source}</span>
                      </div>
                      <div onClick={() => handleTabChange('amals')} className="cursor-pointer glass-card p-12 rounded-[3rem] border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between group overflow-hidden relative border-2 hover:bg-emerald-500/10 transition-all shadow-xl">
                         <div className="relative z-10">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 block opacity-80">Sacred Agenda: {currentDay}</span>
                            <h4 className="text-3xl font-black uppercase tracking-widest luxury-text group-hover:scale-105 transition-transform origin-left">{(DAILY_AMALS[currentDay] || DAILY_AMALS['Saturday']).title}</h4>
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

        {activeTab === 'prayer-tracker' && (
          <PrayerTracker 
            prayerHistory={prayerHistory}
            setPrayerHistory={setPrayerHistory}
            namazStats={namazStats}
            setNamazStats={setNamazStats}
            qadhaStats={qadhaStats}
            setQadhaStats={setQadhaStats}
            prayerTimes={prayerTimes}
            toArabicNumerals={toArabicNumerals}
          />
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
                          onClick={() => setIsFullScreen(!isFullScreen)}
                          className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all border ${isFullScreen ? 'bg-[#d4af37] text-[#011a14] border-[#d4af37]' : 'bg-white/5 border-white/10 text-white/40 hover:text-[#d4af37]'}`}
                          title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
                        >
                          <i className={`fas ${isFullScreen ? 'fa-compress' : 'fa-expand'}`}></i>
                        </button>
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
                        <div className="relative w-full lg:w-[25rem] group">
                           <i className="fas fa-search absolute left-8 top-1/2 -translate-y-1/2 text-[#d4af37]/40 text-2xl group-focus-within:text-[#d4af37] transition-colors"></i>
                           <input 
                            type="text" 
                            placeholder="Seek a Surah..." 
                            value={surahSearch} 
                            onChange={(e) => setSurahSearch(e.target.value)} 
                            className="w-full bg-white/5 border-2 border-white/10 rounded-[3rem] py-6 pl-20 pr-10 text-lg font-black uppercase outline-none focus:border-[#d4af37]/50 shadow-2xl transition-all" 
                           />
                        </div>
                        <div className="relative w-full lg:w-[25rem] group">
                           <i className="fas fa-globe absolute left-8 top-1/2 -translate-y-1/2 text-[#d4af37]/40 text-2xl group-focus-within:text-[#d4af37] transition-colors"></i>
                           <input 
                            type="text" 
                            placeholder="Global Verse Search..." 
                            value={quranGlobalSearch} 
                            onChange={(e) => setQuranGlobalSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuranGlobalSearch()}
                            className="w-full bg-white/5 border-2 border-white/10 rounded-[3rem] py-6 pl-20 pr-10 text-lg font-black uppercase outline-none focus:border-[#d4af37]/50 shadow-2xl transition-all" 
                           />
                           <button 
                             onClick={handleQuranGlobalSearch}
                             className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37] hover:text-[#011a14] transition-all"
                           >
                             <i className="fas fa-arrow-right"></i>
                           </button>
                        </div>
                     </div>
                  </header>

                  {isSearchingQuran && (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                      <div className="w-20 h-20 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin mb-6 shadow-[0_0_50px_rgba(212,175,55,0.2)]"></div>
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#d4af37]">Traversing the Divine Verses...</p>
                    </div>
                  )}

                  {quranSearchResults.length > 0 && !isSearchingQuran && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-top-6 duration-700">
                      <div className="flex justify-between items-center border-b border-white/5 pb-8">
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center shadow-lg border border-[#d4af37]/20">
                               <i className="fas fa-book-open text-xl"></i>
                            </div>
                            <div>
                               <h3 className="text-3xl font-black uppercase tracking-widest luxury-text">Search Library</h3>
                               <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-1">{quranSearchResults.length} verses found matching your quest</p>
                            </div>
                         </div>
                        <button 
                          onClick={() => setQuranSearchResults([])}
                          className="px-8 py-4 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all bg-white/5"
                        >Clear Results</button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-8">
                        {quranSearchResults.map((result, idx) => (
                          <div 
                            key={idx}
                            className="glass-card p-10 md:p-14 rounded-[4rem] border-2 border-white/5 hover:border-[#d4af37]/30 transition-all group scale-box hover:shadow-[0_50px_100px_rgba(0,0,0,0.6)] relative overflow-hidden"
                          >
                            <div className="absolute top-0 left-0 w-2 h-full bg-[#d4af37]/0 group-hover:bg-[#d4af37] transition-all"></div>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                              <div className="flex-1 space-y-10">
                                <div className="flex items-center gap-6">
                                  <div className="flex flex-col items-center justify-center">
                                    <span className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center font-black text-sm border border-[#d4af37]/20 shadow-lg group-hover:bg-[#d4af37] group-hover:text-[#011a14] transition-all duration-500">
                                      {result.surah?.number}:{result.numberInSurah}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="text-2xl font-black uppercase tracking-tighter text-white/60 group-hover:text-white transition-colors duration-500">
                                      {result.surah?.englishName} 
                                      <span className="text-[11px] font-black text-[#d4af37] ml-4 opacity-40 group-hover:opacity-100 uppercase tracking-widest transition-all">({result.surah?.name})</span>
                                    </h4>
                                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] mt-1 italic">{result.surah?.englishNameTranslation}</p>
                                  </div>
                                </div>
                                <p className="quran-text text-5xl md:text-6xl text-right leading-[2] luxury-text-glow group-hover:scale-[1.02] transition-transform duration-700">
                                  {result.text}
                                </p>
                                <p className="text-xl md:text-2xl text-white/70 font-serif italic border-l-4 border-[#d4af37]/20 pl-8 leading-relaxed py-2 group-hover:text-white transition-colors duration-500">
                                  {result.translation}
                                </p>
                              </div>
                              <button 
                                onClick={() => {
                                  if (result.surah) {
                                    const s = surahs.find(surah => surah.number === result.surah.number);
                                    if (s) {
                                      handleSurahSelection(s);
                                      setJumpToAyah(result.numberInSurah.toString());
                                      setTimeout(() => {
                                        const el = document.getElementById(`ayah-${result.numberInSurah}`);
                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        else handleJumpToAyah();
                                      }, 1500);
                                    }
                                  }
                                }}
                                className="w-full md:w-auto px-12 py-6 rounded-[2rem] bg-[#d4af37] text-[#011a14] text-[11px] font-black uppercase tracking-[0.3em] hover:scale-110 transition-all shadow-[0_30px_60px_rgba(212,175,55,0.3)] active:scale-95"
                              >
                                Go to Verse
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                     
                     {/* Surah Selector */}
                     <div className="relative group">
                        <select 
                          onChange={(e) => {
                            const s = surahs.find(surah => surah.number === parseInt(e.target.value));
                            if (s) handleSurahSelection(s);
                          }}
                          value={selectedSurah.number}
                          className="bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 text-[11px] font-black uppercase tracking-widest text-[#d4af37] outline-none hover:border-[#d4af37]/30 transition-all appearance-none cursor-pointer"
                        >
                          {surahs.map(s => (
                            <option key={s.number} value={s.number} className="bg-[#011a14] text-white">
                              {s.number}. {s.englishName}
                            </option>
                          ))}
                        </select>
                        <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-[#d4af37]/40 pointer-events-none text-[10px]"></i>
                     </div>

                     
                     {/* Verse Navigation */}
                     <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-[1.5rem] px-4 py-2">
                        <input 
                          type="number" 
                          placeholder="Verse #" 
                          value={jumpToAyah}
                          onChange={(e) => setJumpToAyah(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleJumpToAyah()}
                          className="w-20 bg-transparent border-none outline-none text-white text-xs font-black uppercase tracking-widest text-center"
                        />
                        <button 
                          onClick={handleJumpToAyah}
                          className="w-8 h-8 rounded-lg bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37] hover:text-[#011a14] transition-all"
                        >
                          <i className="fas fa-arrow-right text-[10px]"></i>
                        </button>
                     </div>
                    <div className="flex flex-wrap justify-center gap-4">
                      <button 
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all border ${isFullScreen ? 'bg-[#d4af37] text-[#011a14] border-[#d4af37]' : 'bg-white/5 border-white/10 text-white/40 hover:text-[#d4af37]'}`}
                        title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
                      >
                        <i className={`fas ${isFullScreen ? 'fa-compress' : 'fa-expand'}`}></i>
                      </button>
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
                         <div className="flex flex-col gap-8 mb-12 items-center">
                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center text-sm md:text-lg font-black shrink-0 border-2 shadow-2xl transition-all duration-700 ${playingAyah?.number === a.number ? 'bg-[#d4af37] text-[#011a14] border-[#d4af37] rotate-[360deg]' : 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20'}`}>{a.numberInSurah}</div>
                            <p className={`quran-text text-5xl md:text-7xl lg:text-8xl text-center leading-[2.5] flex-1 transition-all duration-700 drop-shadow-md w-full py-4 ${playingAyah?.number === a.number ? 'text-white scale-[1.02]' : 'text-white/90'}`}>{a.text}</p>
                         </div>
                         <div className="space-y-10 pl-8 md:pl-16 border-l-4 border-[#d4af37]/20">
                            <div className="flex flex-col gap-4">
                               <p className={`text-[12px] md:text-sm font-black uppercase tracking-[0.4em] transition-colors duration-700 ${playingAyah?.number === a.number ? 'text-[#d4af37]' : 'text-white/20'}`}>{a.transliteration}</p>
                               <div className="h-0.5 w-16 bg-[#d4af37]/20"></div>
                            </div>
                            <p className={`font-serif italic text-2xl md:text-4xl lg:text-5xl leading-relaxed transition-all duration-700 ${playingAyah?.number === a.number ? 'text-white/95' : 'text-white/60'}`}>"{a.translation}"</p>
                            {a.urduTranslation && (
                               <p className={`font-arabic text-2xl md:text-4xl lg:text-5xl leading-relaxed text-right transition-all duration-700 ${playingAyah?.number === a.number ? 'text-white/95' : 'text-white/60'}`} dir="rtl">"{a.urduTranslation}"</p>
                            )}
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
                            <button 
                              onClick={() => toggleBookmark(a, selectedSurah!)} 
                              className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl border-4 ${savedAyahs.some(b => b.surahNumber === selectedSurah!.number && b.ayahNumber === a.numberInSurah) ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]' : 'bg-white/5 text-white/20 hover:bg-white/10 border-white/5'}`}
                            >
                               <i className={`${savedAyahs.some(b => b.surahNumber === selectedSurah!.number && b.ayahNumber === a.numberInSurah) ? 'fas' : 'far'} fa-bookmark text-2xl md:text-3xl`}></i>
                            </button>
                            <button 
                              onClick={() => handleExplainAyah(a, selectedSurah!)} 
                              className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl border-4 bg-white/5 text-[#d4af37] hover:bg-[#d4af37] hover:text-[#011a14] border-white/5 hover:border-[#d4af37]"
                              title="AI Tafsir"
                            >
                               <i className="fas fa-robot text-2xl md:text-3xl"></i>
                            </button>
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

        {activeTab === 'profile' && (
          <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-10">
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
              <div className="text-center md:text-left">
                <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">My Profile</h2>
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Your Spiritual Journey</p>
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="px-8 py-4 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d4af37] hover:text-[#011a14] transition-all shadow-lg"
              >
                Edit Profile
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="glass-card p-10 rounded-[3rem] border-white/5 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <i className="fas fa-book-open text-9xl"></i>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-widest mb-4 text-[#d4af37]">Reading Progress</h3>
                <p className="text-5xl font-black text-white mb-2">{downloadedSurahs.length}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">Surahs Downloaded</p>
              </div>
              
              <div className="glass-card p-10 rounded-[3rem] border-white/5 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <i className="fas fa-bookmark text-9xl"></i>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-widest mb-4 text-[#d4af37]">Bookmarks</h3>
                <p className="text-5xl font-black text-white mb-2">{savedAyahs.length}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">Saved Verses</p>
                <button onClick={() => handleTabChange('bookmarks')} className="mt-6 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">View All</button>
              </div>

              <div className="glass-card p-10 rounded-[3rem] border-white/5 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <i className="fas fa-hands-holding text-9xl"></i>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-widest mb-4 text-[#d4af37]">Saved Duas</h3>
                <p className="text-5xl font-black text-white mb-2">{savedDuas.length}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">Favorite Supplications</p>
              </div>

              <div className="glass-card p-10 rounded-[3rem] border-white/5 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <i className="fas fa-fingerprint text-9xl"></i>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-widest mb-4 text-[#d4af37]">Tasbih Count</h3>
                <p className="text-5xl font-black text-white mb-2">{tasbihCount}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">Total Dhikr</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookmarks' && (
           <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-10">
              <header className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
                 <div className="text-center md:text-left">
                    <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Sacred Bookmarks</h2>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Your preserved verses of guidance</p>
                 </div>
                 {savedAyahs.length > 0 && (
                   <button 
                    onClick={() => {
                      if(confirm("Are you sure you want to clear all sacred bookmarks?")) {
                        setSavedAyahs([]);
                      }
                    }}
                    className="px-8 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg"
                   >
                     Clear Sanctuary
                   </button>
                 )}
              </header>

              {savedAyahs.length > 0 && (
                <div className="relative mb-12 group">
                  <i className="fas fa-search absolute left-8 top-1/2 -translate-y-1/2 text-[#d4af37]/40 text-xl group-focus-within:text-[#d4af37] transition-colors"></i>
                  <input 
                    type="text" 
                    placeholder="Search your sacred reflections..." 
                    value={bookmarkSearch} 
                    onChange={(e) => setBookmarkSearch(e.target.value)} 
                    className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] py-5 pl-20 pr-10 text-lg font-black uppercase outline-none focus:border-[#d4af37]/50 shadow-2xl transition-all" 
                  />
                </div>
              )}

              {savedAyahs.length === 0 ? (
                <div className="glass-card p-20 rounded-[4rem] text-center border-white/5">
                   <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-white/10">
                      <i className="fas fa-bookmark text-4xl"></i>
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-widest text-white/40 mb-4">No Bookmarks Found</h3>
                   <p className="text-white/20 font-medium italic">"Read in the name of your Lord who created..." — Begin your journey in the Holy Quran section.</p>
                   <button onClick={() => handleTabChange('quran')} className="mt-10 px-10 py-4 bg-[#d4af37] text-[#011a14] rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Explore Quran</button>
                </div>
              ) : filteredBookmarks.length === 0 ? (
                <div className="glass-card p-20 rounded-[4rem] text-center border-white/5">
                   <h3 className="text-xl font-black uppercase tracking-widest text-white/40">No matching reflections found</h3>
                   <button onClick={() => setBookmarkSearch('')} className="mt-6 text-[#d4af37] text-[10px] font-black uppercase tracking-widest hover:underline">Clear Search</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-12">
                   {filteredBookmarks.sort((a, b) => b.timestamp - a.timestamp).map((b, idx) => (
                      <div key={idx} className="glass-card p-10 md:p-16 rounded-[4rem] border-2 border-white/5 hover:border-[#d4af37]/30 transition-all group relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
                         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <i className="fas fa-bookmark text-8xl text-[#d4af37]"></i>
                         </div>
                         <div className="flex flex-col lg:flex-row justify-between items-start gap-12 relative z-10">
                            <div className="flex-1 space-y-10">
                               <div className="flex items-center gap-6">
                                  <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/20 font-black text-xs">
                                    {b.surahNumber}
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest">Surah {b.surahName}</span>
                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Ayah {b.ayahNumber}</p>
                                  </div>
                                  <div className="ml-auto text-[8px] font-bold text-white/10 uppercase tracking-widest">
                                    {new Date(b.timestamp).toLocaleDateString()}
                                  </div>
                               </div>
                               
                               <div className="space-y-8">
                                 <p className="quran-text text-5xl md:text-6xl text-right leading-loose text-white/95 drop-shadow-lg">{b.ayahText}</p>
                                 <div className="h-px w-24 bg-[#d4af37]/20 ml-auto"></div>
                                 <p className="font-serif italic text-2xl md:text-3xl text-white/60 leading-relaxed border-l-2 border-[#d4af37]/20 pl-8">"{b.translation}"</p>
                               </div>

                               <div className="pt-10 border-t border-white/5">
                                  <label className="text-[9px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-4 block opacity-60">Personal Reflection</label>
                                  <textarea 
                                    value={b.note}
                                    onChange={(e) => updateBookmarkNote(b.surahNumber, b.ayahNumber, e.target.value)}
                                    placeholder="Add your spiritual notes or reflections here..."
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm md:text-base text-white/80 italic font-serif outline-none focus:border-[#d4af37]/40 transition-all min-h-[120px] resize-none"
                                  />
                               </div>
                            </div>
                            
                            <div className="flex flex-row lg:flex-col gap-4 shrink-0 w-full lg:w-auto">
                               <button 
                                 onClick={() => {
                                   const surah = surahs.find(s => s.number === b.surahNumber);
                                   if (surah) {
                                     handleSurahSelection(surah);
                                     handleTabChange('quran');
                                     // Scroll to ayah after a short delay to allow rendering
                                     setTimeout(() => {
                                       ayahRefs.current[b.ayahNumber]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                     }, 500);
                                   }
                                 }}
                                 className="flex-1 lg:w-20 lg:h-20 rounded-3xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37] hover:text-[#011a14] transition-all border border-[#d4af37]/20 py-4 lg:py-0"
                                 title="View in Quran"
                               >
                                  <i className="fas fa-eye text-xl"></i>
                               </button>
                               <button 
                                 onClick={() => {
                                   const text = `*Sacred Bookmark from Shia Hub*\n\nSurah ${b.surahName}, Ayah ${b.ayahNumber}\n\nArabic:\n${b.ayahText}\n\nTranslation:\n${b.translation}\n\nReflection:\n${b.note || 'No notes added.'}`;
                                   navigator.clipboard.writeText(text);
                                   alert('Bookmark details copied to clipboard.');
                                 }}
                                 className="flex-1 lg:w-20 lg:h-20 rounded-3xl bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all border border-white/10 py-4 lg:py-0"
                                 title="Share Bookmark"
                               >
                                  <i className="fas fa-share-nodes text-xl"></i>
                               </button>
                               <button 
                                 onClick={() => {
                                   if(confirm("Remove this verse from your bookmarks?")) {
                                     setSavedAyahs(prev => prev.filter(item => !(item.surahNumber === b.surahNumber && item.ayahNumber === b.ayahNumber)));
                                   }
                                 }}
                                 className="flex-1 lg:w-20 lg:h-20 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20 py-4 lg:py-0"
                                 title="Remove Bookmark"
                               >
                                  <i className="fas fa-trash-can text-xl"></i>
                               </button>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              )}

              <div className="mt-20">
                 <header className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
                    <div className="text-center md:text-left">
                       <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Saved Duas</h2>
                       <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Your favorite supplications</p>
                    </div>
                 </header>

                 {savedDuas.length === 0 ? (
                   <div className="glass-card p-20 rounded-[4rem] text-center border-white/5">
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-white/10">
                         <i className="fas fa-hands-holding text-4xl"></i>
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-widest text-white/40 mb-4">No Saved Duas</h3>
                      <p className="text-white/20 font-medium italic">Explore the Duas & Ziyarats section to save your favorites.</p>
                      <button onClick={() => handleTabChange('duas')} className="mt-10 px-10 py-4 bg-[#d4af37] text-[#011a14] rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Explore Duas</button>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[...POPULAR_DUAS, ...ZIYARATS, ...RAMADAN_COMMON_DUAS, ...DAILY_DUAS]
                         .filter(dua => savedDuas.includes(dua.id))
                         .map((dua, idx) => (
                         <div key={idx} className="glass-card p-8 rounded-[3rem] border-white/5 hover:border-[#d4af37]/30 transition-all group relative overflow-hidden cursor-pointer" onClick={() => { setSelectedDua(dua); handleTabChange('duas'); }}>
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                               <i className="fas fa-hands-holding text-6xl text-[#d4af37]"></i>
                            </div>
                            <div className="relative z-10">
                               <span className="text-[9px] font-black text-[#d4af37] uppercase tracking-widest block mb-4">{dua.category}</span>
                               <h3 className="text-2xl font-black luxury-text uppercase mb-2 tracking-tighter">{dua.title}</h3>
                               <p className="text-xs text-white/40 font-medium line-clamp-2">{dua.historicalContext || dua.benefits}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); toggleSavedDua(dua.id); }} className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-20">
                               <i className="fas fa-trash-can text-sm"></i>
                            </button>
                         </div>
                      ))}
                   </div>
                 )}
              </div>
           </div>
        )}

        {activeTab === 'ramadan' && (
          <div className="space-y-12 animate-in fade-in py-6">
             <header className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Ramadan al-Mubarak</h2>
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">The Month of Allah</p>
                {currentRamadanDay && (
                  <div className="mt-8 inline-block px-10 py-4 rounded-full bg-[#d4af37]/10 border-2 border-[#d4af37]/30">
                    <span className="text-xl font-black luxury-text uppercase tracking-widest">Day {currentRamadanDay} of Ramadan</span>
                  </div>
                )}
             </header>

             {!currentRamadanDay && (
               <div className="glass-card p-12 rounded-[3rem] border-2 border-white/5 text-center max-w-2xl mx-auto mb-16">
                 <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
                   <i className="fas fa-moon text-3xl text-white/20"></i>
                 </div>
                 <h3 className="text-2xl font-black luxury-text uppercase mb-4">Ramadan is not current</h3>
                 <p className="text-white/40 text-sm font-medium leading-relaxed">The sacred month of Ramadan is not active according to your current Hijri date ({hijriDate}). However, you can still explore the daily schedule and supplications below.</p>
               </div>
             )}

             <section className="space-y-8">
                <h3 className="text-2xl font-black luxury-text uppercase tracking-widest border-b border-white/10 pb-4">Daily Schedule</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Sehri Card */}
                   <div className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden group hover:border-[#d4af37]/30 transition-all">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                         <i className="fas fa-sun text-[8rem]"></i>
                      </div>
                      <div className="flex items-center justify-between mb-8">
                         <div>
                            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-1 block">Pre-Dawn Meal</span>
                            <h4 className="text-3xl font-black luxury-text uppercase">Sehri</h4>
                         </div>
                         <div className="text-right">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 block">Ends At</span>
                            <span className="text-2xl font-mono text-white">{prayerTimes ? prayerTimes.Fajr : '--:--'}</span>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <p className="quran-text text-4xl md:text-5xl leading-[2] text-center text-white drop-shadow-lg">{SEHRI_DUA.arabic}</p>
                         <p className="text-sm font-serif italic text-white/60 text-center">"{SEHRI_DUA.translation}"</p>
                         <div className="flex justify-center">
                            <button onClick={() => handleAudioPlayback(SEHRI_DUA.audio || '', SEHRI_DUA)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-[#d4af37] hover:text-[#011a14] transition-all text-[10px] font-black uppercase tracking-widest text-white/40">
                               <i className="fas fa-play"></i> Play Dua
                            </button>
                         </div>
                      </div>
                   </div>

                   {/* Iftar Card */}
                   <div className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden group hover:border-[#d4af37]/30 transition-all">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                         <i className="fas fa-moon text-[8rem]"></i>
                      </div>
                      <div className="flex items-center justify-between mb-8">
                         <div>
                            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-1 block">Breaking Fast</span>
                            <h4 className="text-3xl font-black luxury-text uppercase">Iftar</h4>
                         </div>
                         <div className="text-right">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 block">Time</span>
                            <span className="text-2xl font-mono text-white">{prayerTimes ? prayerTimes.Maghrib : '--:--'}</span>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <p className="quran-text text-4xl md:text-5xl leading-[2] text-center text-white drop-shadow-lg">{IFTAR_DUA.arabic}</p>
                         <p className="text-sm font-serif italic text-white/60 text-center">"{IFTAR_DUA.translation}"</p>
                         <div className="flex justify-center">
                            <button onClick={() => handleAudioPlayback(IFTAR_DUA.audio || '', IFTAR_DUA)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-[#d4af37] hover:text-[#011a14] transition-all text-[10px] font-black uppercase tracking-widest text-white/40">
                               <i className="fas fa-play"></i> Play Dua
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             </section>

             <section className="space-y-8">
                <h3 className="text-2xl font-black luxury-text uppercase tracking-widest border-b border-white/10 pb-4">Common Supplications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {RAMADAN_COMMON_DUAS.map(dua => (
                      <div key={dua.id} className="glass-card p-8 rounded-[2rem] border-white/5 hover:border-[#d4af37]/30 transition-all group cursor-pointer" onClick={() => setSelectedDua(dua)}>
                         <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-2 block">{dua.category}</span>
                         <h4 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-white transition-colors">{dua.title}</h4>
                         <div className="flex items-center justify-between mt-6">
                            <button onClick={(e) => { e.stopPropagation(); handleAudioPlayback(dua.audio || '', dua); }} className="w-10 h-10 rounded-full bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37] hover:text-[#011a14] transition-all">
                               <i className="fas fa-play text-xs"></i>
                            </button>
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Read & Listen</span>
                         </div>
                      </div>
                   ))}
                </div>
             </section>

             <section className="space-y-8">
                <h3 className="text-2xl font-black luxury-text uppercase tracking-widest border-b border-white/10 pb-4">Sacred Ziyarats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {ZIYARATS.map(ziyarat => (
                      <div key={ziyarat.id} className="glass-card p-8 rounded-[2rem] border-white/5 hover:border-[#d4af37]/30 transition-all group cursor-pointer" onClick={() => setSelectedDua(ziyarat)}>
                         <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-2 block">{ziyarat.category}</span>
                         <h4 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-white transition-colors">{ziyarat.title}</h4>
                         <div className="flex items-center justify-between mt-6">
                            <button onClick={(e) => { e.stopPropagation(); handleAudioPlayback(ziyarat.audio || '', ziyarat); }} className="w-10 h-10 rounded-full bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37] hover:text-[#011a14] transition-all">
                               <i className={`fas ${activePlayingDua?.id === ziyarat.id && !isAudioPaused ? 'fa-pause' : 'fa-play'} text-xs`}></i>
                            </button>
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Read & Listen</span>
                         </div>
                      </div>
                   ))}
                </div>
             </section>

             <section className="space-y-8 pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-6">
                   <div>
                      <h3 className="text-2xl font-black luxury-text uppercase tracking-widest">Daily Amaal</h3>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Select a day to view specific supplications and actions</p>
                   </div>
                   <div className="flex flex-wrap gap-2 max-w-md justify-end">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                         <button 
                           key={day}
                           onClick={() => setSelectedRamadanDay(day)}
                           className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] font-black transition-all ${
                              selectedRamadanDay === day 
                                ? 'bg-[#d4af37] border-[#d4af37] text-[#011a14] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                                : 'border-white/10 text-white/40 hover:bg-white/5 hover:border-white/20'
                           }`}
                         >
                            {day}
                         </button>
                      ))}
                   </div>
                </div>

                {(() => {
                   const dayData = RAMADAN_DAYS.find(d => d.day === selectedRamadanDay);
                   if (!dayData) return (
                      <div className="glass-card p-12 rounded-[3rem] text-center border-white/5">
                         <p className="text-white/20 font-black uppercase tracking-widest">Content for Day {selectedRamadanDay} coming soon...</p>
                      </div>
                   );

                   return (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         <div className="lg:col-span-2 glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                               <i className="fas fa-moon text-[10rem]"></i>
                            </div>
                            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-6 block">Supplication for Day {selectedRamadanDay}</span>
                            <p className="quran-text text-5xl md:text-6xl leading-[2.5] text-center mb-12 block w-full drop-shadow-lg">{dayData.dua.arabic}</p>
                            <p className="text-lg font-serif italic text-white/70 leading-relaxed mb-8 text-center">"{dayData.dua.translation}"</p>
                            <div className="flex justify-center">
                               <button onClick={() => handleAudioPlayback(dayData.dua.audio || '', dayData.dua)} className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37] hover:text-[#011a14] transition-all font-black text-[10px] uppercase tracking-widest">
                                  <i className="fas fa-play"></i> Listen
                               </button>
                            </div>
                         </div>

                         <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-[#d4af37]/5">
                            <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-6">Recommended Actions</h4>
                            <ul className="space-y-4">
                               {dayData.amaal.map((action, idx) => (
                                  <li key={idx} className="flex items-start gap-4">
                                     <div className="w-6 h-6 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
                                        <i className="fas fa-check text-[10px]"></i>
                                     </div>
                                     <span className="text-sm font-medium text-white/80">{action}</span>
                                  </li>
                               ))}
                            </ul>
                         </div>
                      </div>
                   );
                })()}
             </section>
          </div>
        )}

        {activeTab === 'amals' && (
           <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-10">
              <header className="text-center mb-16">
                 <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Sacred Amaal</h2>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Daily spiritual practices of the faithful</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div className="lg:col-span-1 space-y-8">
                    <div className="glass-card p-10 rounded-[3rem] border-2 border-emerald-500/30 bg-emerald-500/5">
                       <div className="flex items-center gap-6 mb-8">
                          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                             <i className="fas fa-calendar-day text-2xl"></i>
                          </div>
                          <div>
                             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Celestial Cycle</span>
                             <h3 className="text-2xl font-black luxury-text uppercase">{selectedAmalDay}</h3>
                          </div>
                       </div>
                       <p className="text-white/60 text-sm font-medium italic leading-relaxed mb-8">
                          Each day of the week is dedicated to specific members of the Ahlulbayt (as). Engaging in these practices strengthens our spiritual bond.
                       </p>
                       <div className="space-y-4">
                          {Object.keys(DAILY_AMALS).map(day => (
                             <button 
                               key={day} 
                               onClick={() => setSelectedAmalDay(day)}
                               className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedAmalDay === day ? 'bg-emerald-500/20 border-emerald-500/40 text-white' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/10'}`}
                             >
                                <div className="flex items-center gap-4">
                                   <span className="text-[11px] font-black uppercase tracking-widest">{day}</span>
                                   {currentDay === day && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">(Today)</span>}
                                </div>
                                {selectedAmalDay === day && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="lg:col-span-2 space-y-12">
                    <div className="glass-card p-12 md:p-16 rounded-[4rem] border-2 border-[#d4af37]/30 bg-gradient-to-br from-[#d4af37]/10 to-transparent relative overflow-hidden shadow-2xl">
                       <div className="absolute top-0 right-0 p-16 opacity-[0.03]">
                          <i className="fas fa-gem text-[15rem]"></i>
                       </div>
                       <header className="mb-12 relative z-10">
                          <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.5em] mb-4 block">Prescribed Practice</span>
                          <h3 className="text-4xl md:text-5xl font-black luxury-text uppercase tracking-tighter mb-6">{activeAmal.title}</h3>
                          <p className="text-white/60 text-xl font-serif italic leading-relaxed">{activeAmal.description}</p>
                       </header>

                       <div className="space-y-8 relative z-10">
                          <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-8">Steps of Devotion</h4>
                          {activeAmal.steps.map((step, idx) => {
                             const isDetailed = typeof step !== 'string';
                             const stepText = isDetailed ? (step as any).text : (step as string);
                             const reference = isDetailed ? (step as any).reference : null;
                             const isCompleted = completedAmalSteps[`${activeAmal.id}-${idx}`];

                             return (
                                <div key={idx} className={`space-y-6 group transition-all duration-500 ${isCompleted ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                                   <div className="flex items-start gap-8">
                                      <button 
                                        onClick={() => toggleStepCompletion(activeAmal.id, idx)}
                                        className={`w-12 h-12 rounded-xl border flex items-center justify-center text-[12px] font-black shrink-0 transition-all ${
                                          isCompleted 
                                            ? 'bg-emerald-500 border-emerald-500 text-[#011a14]' 
                                            : 'bg-white/5 border-white/10 text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-[#011a14]'
                                        }`}
                                      >
                                         {isCompleted ? <i className="fas fa-check"></i> : idx + 1}
                                      </button>
                                      <p className={`text-xl md:text-2xl font-medium leading-relaxed pt-2 transition-all ${isCompleted ? 'text-white/40 line-through decoration-[#d4af37]/30' : 'text-white/80 group-hover:text-white'}`}>{stepText}</p>
                                   </div>
                                   
                                   {reference && (
                                      <div className="ml-20 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6 animate-in slide-in-from-left-4">
                                         <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-4 flex-1">
                                               <span className="text-[9px] font-black text-[#d4af37] uppercase tracking-widest block">{reference.source}</span>
                                               {reference.arabic && (
                                                  <p className="quran-text text-3xl text-white/90 leading-relaxed">{reference.arabic}</p>
                                               )}
                                               <p className="text-lg text-white/50 italic leading-relaxed">"{reference.text}"</p>
                                               {reference.translation && (
                                                  <p className="text-sm text-white/30 font-medium">{reference.translation}</p>
                                               )}
                                            </div>
                                            {reference.audio && (
                                               <button 
                                                 onClick={() => handleAudioPlayback(reference.audio!, { id: `step-${idx}`, title: stepText, category: 'Amal Reference' } as any)}
                                                 className="w-12 h-12 rounded-full bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37] hover:text-[#011a14] transition-all shrink-0"
                                               >
                                                  <i className={`fas ${activePlayingDua?.id === `step-${idx}` && !isAudioPaused ? 'fa-pause' : 'fa-play'} text-xs`}></i>
                                               </button>
                                            )}
                                         </div>
                                      </div>
                                   )}
                                </div>
                             );
                          })}
                       </div>

                       <div className="mt-16 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <i className="fas fa-check-circle"></i>
                             </div>
                             <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Recommended for spiritual elevation</span>
                          </div>
                          <button onClick={() => handleTabChange('duas')} className="px-10 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">View Related Duas</button>
                       </div>
                    </div>

                    <div className="glass-card p-12 rounded-[3rem] border-2 border-white/5 bg-white/[0.02]">
                       <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-8 text-center">General Recommendations</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5">
                             <i className="fas fa-moon text-[#d4af37] mb-6 text-xl"></i>
                             <h5 className="text-[12px] font-black uppercase tracking-widest mb-4">Nightly Reflection</h5>
                             <p className="text-sm text-white/40 leading-relaxed italic">"Account for your deeds before you are held to account." — Imam Ali (as)</p>
                          </div>
                          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5">
                             <i className="fas fa-sun text-[#d4af37] mb-6 text-xl"></i>
                             <h5 className="text-[12px] font-black uppercase tracking-widest mb-4">Morning Gratitude</h5>
                             <p className="text-sm text-white/40 leading-relaxed italic">Begin every day with Salawat and a pledge of allegiance to the Imam of our Time (atfs).</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'tasbih' && (
           <div className="space-y-12 animate-in fade-in flex flex-col items-center justify-center min-h-[70vh]">
              <header className="text-center max-w-3xl mx-auto mb-16">
                 <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Sacred counting</h2>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">Digital beads of devotion</p>
              </header>
              <div className="flex gap-4 mb-20 overflow-x-auto pb-4 max-w-full custom-scrollbar scrollbar-hide items-center">
                 {[...TASBIH_PRESETS, ...customTasbihs].map(p => (
                   <button key={p.id} onClick={() => { setActiveTasbih(p); setTasbihCount(0); }} className={`px-10 py-5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap shadow-xl ${activeTasbih.id === p.id ? 'bg-[#d4af37] text-[#011a14] border-[#d4af37] scale-110' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>{p.name}</button>
                 ))}
                 <button 
                   onClick={() => setIsTasbihModalOpen(true)}
                   className="px-8 py-5 rounded-[1.5rem] bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 text-[12px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-[#011a14] transition-all whitespace-nowrap flex items-center gap-2"
                 >
                   <i className="fas fa-plus"></i> New Zikr
                 </button>
              </div>
              
              <div className="text-center mb-8 animate-in fade-in">
                 <p className="text-2xl font-serif italic text-white/80 mb-2">"{activeTasbih.label}"</p>
                 <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest">Target: {activeTasbih.max}</p>
              </div>

              <div onClick={() => setTasbihCount(prev => prev < activeTasbih.max ? prev + 1 : prev)} className={`w-80 h-80 md:w-96 md:h-96 rounded-full border-8 flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all bg-gradient-to-br from-[#d4af37]/10 via-transparent to-[#d4af37]/5 shadow-[0_0_150px_rgba(212,175,55,0.15)] group relative overflow-hidden ${tasbihCount >= activeTasbih.max ? 'border-emerald-500/50 shadow-[0_0_150px_rgba(16,185,129,0.2)]' : 'border-[#d4af37]/20'}`}>
                 <div className={`absolute inset-0 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity ${tasbihCount >= activeTasbih.max ? 'bg-emerald-500/10' : 'bg-[#d4af37]/5'}`}></div>
                 {tasbihCount >= activeTasbih.max ? (
                   <div className="animate-in zoom-in duration-500 flex flex-col items-center">
                     <i className="fas fa-check-circle text-6xl text-emerald-500 mb-4"></i>
                     <span className="text-2xl font-black text-emerald-500 uppercase tracking-widest">Completed</span>
                   </div>
                 ) : (
                   <>
                     <span className="text-8xl md:text-9xl font-black luxury-text tabular-nums relative z-10">{tasbihCount}</span>
                     <span className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.6em] mt-8 opacity-40 group-hover:opacity-100 transition-all relative z-10 animate-pulse">Invoke Allah</span>
                   </>
                 )}
              </div>
              <button onClick={() => setTasbihCount(0)} className="mt-20 px-12 py-4 rounded-full border-2 border-white/5 text-[12px] font-black text-white/20 uppercase tracking-[0.6em] hover:text-red-500 hover:border-red-500/30 transition-all shadow-xl">Reset beads</button>
           </div>
        )}

        {isTasbihModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#011a14] border-2 border-[#d4af37]/30 p-10 rounded-[3rem] w-full max-w-lg relative shadow-2xl">
              <button onClick={() => setIsTasbihModalOpen(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                <i className="fas fa-times text-2xl"></i>
              </button>
              <h3 className="text-3xl font-black luxury-text uppercase mb-8 tracking-tight">Create Custom Zikr</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-3 block">Zikr Name</label>
                  <input 
                    type="text" 
                    value={newTasbihName}
                    onChange={(e) => setNewTasbihName(e.target.value)}
                    placeholder="e.g. Salawat for Shifa"
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#d4af37]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-3 block">Recitation Phrase</label>
                  <input 
                    type="text" 
                    value={newTasbihLabel}
                    onChange={(e) => setNewTasbihLabel(e.target.value)}
                    placeholder="e.g. Allahumma Salle Ala..."
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#d4af37]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-3 block">Target Count</label>
                  <input 
                    type="number" 
                    value={newTasbihMax}
                    onChange={(e) => setNewTasbihMax(parseInt(e.target.value))}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#d4af37]/50 transition-all"
                  />
                </div>
                <button 
                  onClick={handleAddTasbih}
                  disabled={!newTasbihName || !newTasbihLabel}
                  className="w-full bg-[#d4af37] text-[#011a14] py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 mt-4"
                >
                  Save Zikr Preset
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qibla' && (
          <div className="py-20 text-center animate-in fade-in">
            <i className="fas fa-compass text-6xl text-[#d4af37] mb-8 animate-pulse"></i>
            <h2 className="text-3xl font-black luxury-text mb-4 uppercase">Qibla Direction</h2>
            <p className="text-white/40 font-black uppercase tracking-widest">Integrating Precision Alignment...</p>
          </div>
        )}

        {activeTab === 'sacred-collection' && (
          <div className="py-20 text-center animate-in fade-in">
            <i className="fas fa-book-journal-whills text-6xl text-[#d4af37] mb-8 animate-bounce"></i>
            <h2 className="text-3xl font-black luxury-text mb-4 uppercase">Hadith Treasury</h2>
            <p className="text-white/40 font-black uppercase tracking-widest">Unveiling Curated Traditions...</p>
          </div>
        )}

        {activeTab === 'voice-guidance' && (
          <VoiceGuidance />
        )}

        {activeTab === 'salat-guide' && (
          <SalatGuide />
        )}

        {activeTab === 'prayer-times' && (
           <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-10">
              <header className="text-center mb-16">
                 <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Prayer Times</h2>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Jafari (Shia) Calculation Method</p>
                 <div className="mt-8 flex justify-center">
                    <QiblaCompass deviceHeading={deviceHeading} qiblaDirection={qiblaDirection} />
                 </div>
              </header>

              {nextPrayer && (
                <div className="glass-card p-10 rounded-[3rem] border-2 border-[#d4af37]/30 bg-[#d4af37]/5 text-center mb-12 animate-in fade-in slide-in-from-top-4 max-w-2xl mx-auto shadow-[0_0_100px_rgba(212,175,55,0.1)]">
                   <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-4 block">Next Prayer: {nextPrayer.name}</span>
                   <h3 className="text-6xl md:text-8xl font-black luxury-text tabular-nums mb-4 tracking-tight">{nextPrayer.remaining}</h3>
                   <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Time Remaining</p>
                </div>
              )}

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
                          <div>
                             <label className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3 block">Calculation Method</label>
                             <select 
                                value={calculationMethod} 
                                onChange={(e) => setCalculationMethod(e.target.value)}
                                className="w-full bg-[#011a14] border-2 border-white/5 rounded-2xl p-4 text-[12px] font-black outline-none focus:border-[#d4af37]/30 transition-all text-white"
                             >
                                <option value="0">Shia Ithna-Ashari, Leva Institute, Qum</option>
                                <option value="7">Institute of Geophysics, University of Tehran</option>
                                <option value="2">Islamic Society of North America (ISNA)</option>
                                <option value="3">Muslim World League (MWL)</option>
                                <option value="4">Umm Al-Qura University, Makkah</option>
                                <option value="5">Egyptian General Authority of Survey</option>
                             </select>
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
                                <span className="text-4xl font-black luxury-text block">{prayerTimes[name]}</span>
                                <span className="text-2xl font-serif text-[#d4af37] opacity-60 mt-2 block">{toArabicNumerals(prayerTimes[name])}</span>
                             </div>
                             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10 group-hover:text-[#d4af37] transition-all">
                                <i className={`fas ${
                                  name === 'Fajr' ? 'fa-sun-haze' : 
                                  name === 'Sunrise' ? 'fa-sunrise' : 
                                  name === 'Dhuhr' ? 'fa-sun' : 
                                  name === 'Asr' ? 'fa-cloud-sun' : 
                                  name === 'Sunset' ? 'fa-sun-dust' : 
                                  name === 'Maghrib' ? 'fa-sunset' : 
                                  name === 'Isha' ? 'fa-moon-stars' : 
                                  'fa-moon'
                                } text-2xl`}></i>
                             </div>
                          </div>
                       )) : (
                          <div className="col-span-full py-20 text-center">
                             <p className="text-white/20 font-black uppercase tracking-widest">Awaiting celestial alignment...</p>
                          </div>
                       )}
                    </div>
                    {prayerTimes && (
                       <div className="glass-card p-10 rounded-[3rem] border-2 border-[#d4af37]/20 bg-[#d4af37]/5 flex flex-col md:flex-row justify-between items-center gap-8">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
                                <i className="fas fa-mosque text-2xl"></i>
                             </div>
                             <div>
                                <h4 className="text-xl font-black luxury-text uppercase">Shia Azan</h4>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Listen to the sacred call to prayer</p>
                             </div>
                          </div>
                          <button 
                             onClick={() => handleAudioPlayback(SHIA_AZAN_URL, { title: 'Shia Azan', category: 'Call to Prayer' } as any)}
                             className="px-8 py-4 rounded-2xl bg-[#d4af37] text-[#011a14] font-black text-[12px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                          >
                             <i className="fas fa-play mr-2"></i> Play Azan
                          </button>
                       </div>
                    )}
                    {prayerTimes && (
                       <div className="glass-card p-10 rounded-[3rem] border-2 border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                          <div className="text-center md:text-left">
                             <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block">Imsak (Start of Fast)</span>
                             <span className="text-3xl font-black text-white block">{prayerTimes.Imsak}</span>
                             <span className="text-lg font-serif text-[#d4af37] opacity-60 block mt-1">{toArabicNumerals(prayerTimes.Imsak)}</span>
                          </div>
                          <div className="h-12 w-px bg-white/5 hidden md:block"></div>
                          <div className="text-center md:text-left">
                             <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block">Sunrise</span>
                             <span className="text-3xl font-black text-white block">{prayerTimes.Sunrise}</span>
                             <span className="text-lg font-serif text-[#d4af37] opacity-60 block mt-1">{toArabicNumerals(prayerTimes.Sunrise)}</span>
                          </div>
                          <div className="h-12 w-px bg-white/5 hidden md:block"></div>
                          <div className="text-center md:text-left">
                             <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2 block">Midnight</span>
                             <span className="text-3xl font-black text-white block">{prayerTimes.Midnight}</span>
                             <span className="text-lg font-serif text-[#d4af37] opacity-60 block mt-1">{toArabicNumerals(prayerTimes.Midnight)}</span>
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

                    <div className="glass-card p-12 md:p-20 rounded-[4rem] border-2 border-[#d4af37]/20 relative overflow-hidden shadow-2xl">
                       <div className="absolute top-0 right-0 p-20 opacity-[0.02]">
                          <i className="fas fa-hands-holding text-[20rem]"></i>
                       </div>
                       
                       <header className="text-center mb-20 relative z-10">
                          <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.5em] mb-6 block">{selectedDua.category}</span>
                          <h3 className="text-5xl md:text-7xl font-black luxury-text uppercase mb-8 tracking-tighter leading-tight">{selectedDua.title}</h3>
                          <div className="flex justify-center gap-8">
                             <button onClick={() => toggleSavedDua(selectedDua.id)} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${savedDuas.includes(selectedDua.id) ? 'bg-[#d4af37]/10 border-2 border-[#d4af37] text-[#d4af37]' : 'bg-white/5 border border-white/10 text-[#d4af37] hover:bg-[#d4af37] hover:text-[#011a14]'}`}>
                                <i className={`${savedDuas.includes(selectedDua.id) ? 'fas' : 'far'} fa-bookmark text-2xl`}></i>
                             </button>
                             <button onClick={() => handleAudioPlayback(selectedDua.audio || '', selectedDua)} className="w-20 h-20 rounded-full bg-[#d4af37] text-[#011a14] flex items-center justify-center shadow-2xl hover:scale-110 transition-all">
                                <i className={`fas ${activePlayingDua?.id === selectedDua.id && !isAudioPaused ? 'fa-pause' : 'fa-play'} text-2xl pl-1`}></i>
                             </button>
                             <button 
                                onClick={() => shareDua(selectedDua)}
                                className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37] hover:text-[#011a14] transition-all"
                             >
                                <i className="fas fa-share-nodes text-2xl"></i>
                             </button>
                             <button 
                                onClick={() => handleExplainDua(selectedDua)}
                                className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37] hover:text-[#011a14] transition-all"
                                title="AI Explanation"
                             >
                                <i className="fas fa-robot text-2xl"></i>
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
                                <p className="text-xl md:text-2xl font-black text-white/40 uppercase tracking-widest leading-relaxed whitespace-pre-line">{selectedDua.transliteration || 'Syncing transliteration...'}</p>
                             </div>
                             <div>
                                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-6">English Translation</h4>
                                <p className="text-2xl md:text-3xl font-serif italic text-white/80 leading-relaxed whitespace-pre-line">"{selectedDua.translation}"</p>
                             </div>
                             {selectedDua.urduTranslation && (
                               <div>
                                  <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-6">Urdu Translation</h4>
                                  <p className="font-arabic text-2xl md:text-3xl text-white/80 leading-relaxed whitespace-pre-line" dir="rtl">"{selectedDua.urduTranslation}"</p>
                               </div>
                             )}
                             {selectedDua.benefits && (
                                <div>
                                   <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-6">Benefits & Rewards</h4>
                                   <p className="text-xl text-white/60 leading-relaxed italic">"{selectedDua.benefits}"</p>
                                </div>
                             )}
                          </div>

                          {isExplainingDua && (
                             <div className="pt-12 border-t border-white/5 text-center">
                                <div className="w-8 h-8 rounded-full border-4 border-[#d4af37]/10 border-t-[#d4af37] animate-spin mx-auto mb-4"></div>
                                <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest">Consulting AI Scholar...</p>
                             </div>
                          )}

                          {duaAiExplanation && !isExplainingDua && (
                             <div className="pt-12 border-t border-white/5">
                                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                                  <i className="fas fa-robot"></i> AI Explanation & Summary
                                </h4>
                                <div className="bg-white/[0.02] border border-[#d4af37]/20 p-8 md:p-12 rounded-[2rem]">
                                   <p className="text-xl text-white/80 leading-[1.8] font-serif whitespace-pre-wrap">
                                      {duaAiExplanation}
                                   </p>
                                </div>
                             </div>
                          )}

                          {selectedDua.historicalContext && (
                             <div className="pt-12 border-t border-white/5">
                                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6">Historical Context</h4>
                                <p className="text-lg text-white/40 leading-relaxed">{selectedDua.historicalContext}</p>
                             </div>
                          )}

                          {selectedDua.tafsir && (
                             <div className="pt-12 border-t border-white/5">
                                <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-6">Full Tafsir & Commentary</h4>
                                <div className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[2rem]">
                                   <p className="text-xl text-white/60 leading-[1.8] font-serif italic">
                                      {selectedDua.tafsir}
                                   </p>
                                </div>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="space-y-16">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
                       {DUA_CATEGORIES.map(cat => (
                          <button 
                             key={cat.id}
                             onClick={() => setDuaCategory(cat.id)}
                             className={`p-6 rounded-[2rem] text-center transition-all border-2 flex flex-col items-center gap-4 group ${
                                duaCategory === cat.id 
                                ? 'bg-[#d4af37] text-[#011a14] border-[#d4af37] shadow-[0_20px_50px_rgba(212,175,55,0.3)]' 
                                : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:bg-white/[0.08]'
                             }`}
                          >
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${duaCategory === cat.id ? 'bg-[#011a14] text-[#d4af37]' : 'bg-white/5 text-white/20 group-hover:text-[#d4af37]'}`}>
                                <i className={`fas ${cat.icon} text-xl`}></i>
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{cat.name}</span>
                          </button>
                       ))}
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-6xl mx-auto">
                       <div className="relative w-full">
                          <i className="fas fa-search absolute left-8 top-1/2 -translate-y-1/2 text-white/20"></i>
                          <input 
                             type="text"
                             value={duaSearch}
                             onChange={(e) => setDuaSearch(e.target.value)}
                             placeholder="Search by title, translation, or keywords..."
                             className="w-full bg-white/5 border-2 border-white/10 rounded-full py-6 pl-16 pr-8 text-[14px] font-black outline-none focus:border-[#d4af37]/30 transition-all shadow-xl"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
                       {[...POPULAR_DUAS, ...ZIYARATS, ...RAMADAN_COMMON_DUAS, ...DAILY_DUAS]
                          .filter(dua => {
                             const matchesSearch = dua.title.toLowerCase().includes(duaSearch.toLowerCase()) || 
                                                   dua.translation.toLowerCase().includes(duaSearch.toLowerCase()) ||
                                                   (dua.benefits && dua.benefits.toLowerCase().includes(duaSearch.toLowerCase()));
                             const matchesCategory = duaCategory === 'All' || 
                                                     (duaCategory === 'Popular' && POPULAR_DUAS.some(d => d.id === dua.id)) ||
                                                     (duaCategory === 'Ziyarats' && ZIYARATS.some(d => d.id === dua.id)) ||
                                                     (duaCategory === 'Weekly' && dua.category === 'Weekly') ||
                                                     (duaCategory === 'Daily' && dua.category === 'Daily') ||
                                                     (duaCategory === 'Ramadan' && dua.category === 'Ramadan') ||
                                                     (duaCategory === 'Protection' && dua.category === 'Protection') ||
                                                     (duaCategory === 'Hardships' && dua.category === 'Hardships') ||
                                                     (duaCategory === 'Sahifa' && dua.category === 'Sahifa');
                             return matchesSearch && matchesCategory;
                          })
                          .map(dua => (
                             <button key={dua.id} onClick={() => setSelectedDua(dua)} className="glass-card p-12 rounded-[4rem] text-left border-white/5 hover:border-[#d4af37]/40 transition-all group relative overflow-hidden flex flex-col h-[480px] border-2 shadow-2xl hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                                <div className="absolute -top-10 -right-10 p-16 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
                                  <i className="fas fa-hands-holding text-[15rem]"></i>
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                   <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.4em] opacity-80">{dua.category}</span>
                                   <div className="h-px w-8 bg-[#d4af37]/20"></div>
                                </div>
                                <h3 className="text-3xl font-black uppercase tracking-tight mb-8 leading-tight group-hover:luxury-text transition-all">{dua.title}</h3>
                                <p className="text-white/40 text-base md:text-lg font-medium italic line-clamp-4 mb-12 flex-1 leading-relaxed">"{dua.translation}"</p>
                                <div className="mt-auto flex justify-between items-center w-full relative z-10">
                                   <div className="flex gap-3 items-center">
                                      <div className="w-16 h-16 rounded-[1.5rem] bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center group-hover:bg-[#d4af37] group-hover:text-[#011a14] transition-all shadow-xl group-hover:scale-110">
                                        <i className="fas fa-play text-xl pl-1"></i>
                                      </div>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); toggleSavedDua(dua.id); }}
                                        className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-all ${savedDuas.includes(dua.id) ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 'bg-white/5 border-white/10 text-white/20 hover:text-[#d4af37]'}`}
                                      >
                                        <i className={`${savedDuas.includes(dua.id) ? 'fas' : 'far'} fa-bookmark text-sm`}></i>
                                      </button>
                                   </div>
                                   <div className="flex gap-4">
                                     <div className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-white transition-colors">Listen Supplication</div>
                                   </div>
                                </div>
                             </button>
                          ))
                       }
                    </div>
                 </div>
              )}
           </div>
        )}

         {activeTab === 'hadith' && (
           <div className="space-y-12 animate-in fade-in max-w-4xl mx-auto py-10">
              <header className="text-center mb-16">
                 <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Hadith Library</h2>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Sacred Traditions of the Ahlulbayt (as)</p>
              </header>

              <div className="glass-card p-12 md:p-20 rounded-[4rem] border-2 border-[#d4af37]/20 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-20 opacity-[0.02]">
                    <i className="fas fa-quote-right text-[20rem]"></i>
                 </div>
                 
                 <div className="relative z-10 space-y-16">
                    <div className="text-center">
                       <p className="quran-text text-5xl md:text-7xl leading-[2.5] text-white/95 mb-12 drop-shadow-lg">{dailyHadith.arabic}</p>
                       <div className="h-px w-48 bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent mx-auto"></div>
                    </div>

                    <div className="space-y-10">
                       <p className="text-2xl md:text-4xl font-serif italic text-white/80 leading-relaxed text-center">"{dailyHadith.translation}"</p>
                       
                       <div className="flex flex-col items-center gap-4 pt-10 border-t border-white/5">
                          <span className="text-xl font-black luxury-text uppercase tracking-widest">— {dailyHadith.author}</span>
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{dailyHadith.source}</span>
                       </div>
                    </div>

                    {dailyHadith.tags && (
                       <div className="flex flex-wrap justify-center gap-3">
                          {dailyHadith.tags.map(tag => (
                             <span key={tag} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">{tag}</span>
                          ))}
                       </div>
                    )}

                    <div className="flex justify-center pt-10">
                       <button 
                         onClick={() => {
                           const text = `*Daily Hadith from Shia Hub*\n\n"${dailyHadith.translation}"\n\n— ${dailyHadith.author} (${dailyHadith.source})`;
                           navigator.clipboard.writeText(text);
                           alert('Hadith copied to clipboard.');
                         }}
                         className="px-10 py-4 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#d4af37] hover:text-[#011a14] transition-all shadow-xl"
                       >
                          <i className="fas fa-share-nodes mr-2"></i> Share Wisdom
                       </button>
                    </div>
                 </div>
              </div>
           </div>
         )}

         {activeTab === 'knowledge' && (
          <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-10">
            <header className="text-center mb-16">
              <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Shia Knowledge</h2>
              <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Theological Foundations & Sacred History</p>
            </header>

            {selectedKnowledge ? (
              <div className="animate-in zoom-in slide-in-from-bottom-10">
                <button onClick={() => setSelectedKnowledge(null)} className="mb-12 flex items-center gap-4 text-white/20 hover:text-[#d4af37] transition-all group">
                  <div className="w-12 h-12 rounded-full border-2 border-white/5 flex items-center justify-center group-hover:border-[#d4af37]/30">
                    <i className="fas fa-arrow-left"></i>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Return to Knowledge Base</span>
                </button>

                <div className="glass-card p-12 md:p-20 rounded-[4rem] border-2 border-[#d4af37]/20 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-20 opacity-[0.02]">
                    <i className="fas fa-kaaba text-[20rem]"></i>
                  </div>
                  
                  <header className="mb-16 relative z-10">
                    <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.5em] mb-4 block">{selectedKnowledge.category}</span>
                    <h3 className="text-4xl md:text-6xl font-black luxury-text uppercase mb-8 tracking-tighter">{selectedKnowledge.title}</h3>
                    <div className="h-1 w-32 bg-[#d4af37]/20"></div>
                  </header>

                  <div className="space-y-12 relative z-10">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-serif italic whitespace-pre-line">
                        {selectedKnowledge.content}
                      </p>
                    </div>

                    {selectedKnowledge.subsections && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-white/5">
                        {selectedKnowledge.subsections.map((sub, idx) => (
                          <div key={idx} className="glass-card p-10 rounded-[3rem] border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
                            <h4 className="text-xl font-black luxury-text uppercase mb-4">{sub.title}</h4>
                            <p className="text-white/50 text-sm leading-relaxed italic">"{sub.content}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {['Theology', 'Practices', 'Figures', 'History'].map(category => (
                  <div key={category} className="space-y-8">
                    <h3 className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.4em] border-b border-[#d4af37]/20 pb-4 ml-4">{category}</h3>
                    <div className="space-y-6">
                      {SHIA_KNOWLEDGE_BASE.filter(k => k.category === category).map(item => (
                        <button 
                          key={item.id} 
                          onClick={() => setSelectedKnowledge(item)}
                          className="w-full glass-card p-10 rounded-[3rem] text-left border-white/5 hover:border-[#d4af37]/40 transition-all group relative overflow-hidden border-2 shadow-xl"
                        >
                          <div className="absolute -top-6 -right-6 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <i className="fas fa-book-open text-8xl"></i>
                          </div>
                          <h4 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:luxury-text transition-all">{item.title}</h4>
                          <p className="text-white/30 text-xs font-medium italic line-clamp-2 leading-relaxed">"{item.content}"</p>
                          <div className="mt-8 flex items-center gap-3 text-[9px] font-black text-[#d4af37] uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-all">
                            Deep Dive <i className="fas fa-arrow-right-long transition-transform group-hover:translate-x-2"></i>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-12 animate-in fade-in max-w-4xl mx-auto py-10">
            <header className="text-center mb-16">
              <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Sanctuary Settings</h2>
              <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Personalize your spiritual experience</p>
            </header>

            <div className="space-y-12">
              <section className="glass-card p-12 rounded-[4rem] border-2 border-white/5">
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/20">
                    <i className="fas fa-bell text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black luxury-text uppercase tracking-tight">Prayer Notifications</h3>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Manage Azan and reminder alerts</p>
                  </div>
                  <div className="ml-auto">
                    <button 
                      onClick={requestNotificationPermission}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${notificationsEnabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse'}`}
                    >
                      {notificationsEnabled ? 'Notifications Active' : 'Enable System Alerts'}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {reminders.map(reminder => (
                    <div key={reminder.id} className="glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-white/10 transition-all">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${reminder.enabled ? 'bg-[#d4af37] text-[#011a14]' : 'bg-white/5 text-white/20'}`}>
                          <i className={`fas ${reminder.enabled ? 'fa-bell' : 'fa-bell-slash'}`}></i>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest block mb-1">{reminder.prayerName}</span>
                          <h4 className="text-lg font-black uppercase tracking-tight text-white/80 group-hover:text-white transition-colors">{reminder.label}</h4>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-2 border border-white/5">
                          <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-4">Sound</label>
                          <select 
                            value={reminder.soundUrl || ''}
                            onChange={(e) => {
                              const newReminders = reminders.map(r => r.id === reminder.id ? { ...r, soundUrl: e.target.value } : r);
                              setReminders(newReminders);
                              if (e.target.value) {
                                const audio = new Audio(e.target.value);
                                audio.play().catch(console.error);
                              }
                            }}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-[#d4af37] outline-none px-4 py-2 cursor-pointer"
                          >
                            <option value="" className="bg-[#011a14]">No Sound</option>
                            {NOTIFICATION_SOUNDS.map(s => (
                              <option key={s.id} value={s.url} className="bg-[#011a14]">{s.name}</option>
                            ))}
                          </select>
                        </div>

                        <button 
                          onClick={() => {
                            const newReminders = reminders.map(r => r.id === reminder.id ? { ...r, enabled: !r.enabled } : r);
                            setReminders(newReminders);
                          }}
                          className={`w-16 h-8 rounded-full transition-all relative ${reminder.enabled ? 'bg-[#d4af37]' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all ${reminder.enabled ? 'right-1' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

               <section className="glass-card p-12 rounded-[4rem] border-2 border-white/5">
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/20">
                    <i className="fas fa-flask text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black luxury-text uppercase tracking-tight">Environmental Variables</h3>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Configure and host your own spiritual hub</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20">
                     <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fas fa-info-circle"></i> Developer Note
                     </h4>
                     <p className="text-xs text-white/40 leading-relaxed italic">
                        "To host this app on your own domain, ensure you have set the `GEMINI_API_KEY` in your environment. This key powers the AI Scholar features. You can also override other settings via the repository's `.env` file."
                     </p>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">GEMINI_API_KEY</span>
                        <span className="text-[9px] px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full font-black uppercase">Active & Secured</span>
                     </div>
                     <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">PUBLIC_URL</span>
                        <span className="text-[9px] text-white/20 font-mono tracking-tighter truncate max-w-[200px]">{window.location.origin}</span>
                     </div>
                  </div>

                  <div className="pt-6">
                     <button 
                        onClick={() => {
                           const exportData = {
                              profile: userProfile,
                              savedDuas,
                              savedHadiths,
                              customTasbihs
                           };
                           const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                           const url = URL.createObjectURL(blob);
                           const a = document.createElement('a');
                           a.href = url;
                           a.download = 'shia-hub-export.json';
                           a.click();
                        }}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#d4af37] hover:bg-[#d4af37]/10 transition-all"
                     >
                        <i className="fas fa-download mr-2"></i> Export My Data for New Hosting
                     </button>
                  </div>
                </div>
              </section>

              <section className="glass-card p-12 rounded-[4rem] border-2 border-white/5">
                <div className="flex flex-col md:flex-row gap-6">
                  <button 
                    onClick={() => setIsAdminPortalOpen(true)}
                    className="flex-1 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-left group hover:border-[#d4af37]/30 transition-all"
                  >
                    <i className="fas fa-lock-open text-[#d4af37] mb-4 text-xl group-hover:scale-110 transition-transform block"></i>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Admin Portal</span>
                    <p className="text-sm font-medium text-white/20 italic">"Access the inner sanctum of management."</p>
                  </button>
                  <button 
                    onClick={() => {
                      sessionStorage.removeItem('guardian_unlocked');
                      setIsGuardianUnlocked(false);
                      alert('Guardian lock re-engaged.');
                    }}
                    className="flex-1 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-left group hover:border-red-500/30 transition-all"
                  >
                    <i className="fas fa-user-lock text-red-500 mb-4 text-xl group-hover:scale-110 transition-transform block"></i>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Lock Sanctuary</span>
                    <p className="text-sm font-medium text-white/20 italic">"Secure the application from unauthorized access."</p>
                  </button>
                </div>
              </section>
            </div>
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
                          <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-white/5 border-2 border-white/10 rounded-full text-[10px] font-black text-[#d4af37] uppercase hover:bg-[#d4af37] hover:text-[#011a14] transition-all shadow-lg">
                            {source.title || 'Verified Source'} <i className="fas fa-external-link-alt text-[8px] ml-2"></i>
                          </a> 
                        ))}
                     </div>
                   )}
                </div>
              )}

              <LiveVoiceChat school={aiOptions.school} scholar={aiOptions.scholar} />
           </div>
        )}

        {activeTab === 'multimedia' && (
          <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-6">
            <header className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-black luxury-text uppercase mb-6 tracking-tighter">Multimedia Library</h2>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.6em] mb-10">Lectures, Recitations & Insights</p>
            </header>

            <div className="space-y-12">
              <section>
                <h3 className="text-2xl font-black luxury-text uppercase mb-8 tracking-widest border-b border-white/10 pb-4">Quranic Recitations</h3>
                <div onClick={() => handleTabChange('quran')} className="glass-card p-8 rounded-[2rem] border-white/5 hover:border-[#d4af37]/30 transition-all group flex items-center gap-6 cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-[#011a14] transition-all shrink-0">
                    <i className="fas fa-book-open text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-1 block">Divine Revelation</span>
                    <h4 className="text-xl font-bold text-white mb-2">Listen to the Holy Quran</h4>
                    <p className="text-white/40 text-xs uppercase tracking-wider">Explore the full library of recitations by world-renowned Qaris.</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center text-white/20 group-hover:border-[#d4af37] group-hover:text-[#d4af37] transition-all">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-black luxury-text uppercase mb-8 tracking-widest border-b border-white/10 pb-4">Audio Lectures</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {MEDIA_LIBRARY.filter(m => m.type === 'audio').map(media => (
                    <div key={media.id} className="glass-card p-8 rounded-[2rem] border-white/5 hover:border-[#d4af37]/30 transition-all group flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-[#011a14] transition-all shrink-0">
                        <i className="fas fa-headphones text-2xl"></i>
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-1 block">{media.category}</span>
                        <h4 className="text-xl font-bold text-white mb-2 line-clamp-1">{media.title}</h4>
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-4">{media.speaker}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-white/30">{media.duration}</span>
                          <button onClick={() => handleMediaPlayback(media)} className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] hover:underline flex items-center gap-2">
                            Play Now <i className="fas fa-play"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-black luxury-text uppercase mb-8 tracking-widest border-b border-white/10 pb-4">Video Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {MEDIA_LIBRARY.filter(m => m.type === 'video').map(media => (
                    <div key={media.id} className="glass-card rounded-[2rem] border-white/5 overflow-hidden group hover:border-[#d4af37]/30 transition-all">
                      <div className="relative aspect-video bg-black">
                        <img src={media.thumbnail} alt={media.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div onClick={() => handleMediaPlayback(media)} className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white border-2 border-white/20 group-hover:scale-110 transition-transform cursor-pointer">
                            <i className="fas fa-play text-2xl ml-1"></i>
                          </div>
                        </div>
                        <span className="absolute bottom-4 right-4 bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded-md">{media.duration}</span>
                      </div>
                      <div className="p-6">
                        <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-2 block">{media.category}</span>
                        <h4 className="text-lg font-bold text-white mb-2 line-clamp-2">{media.title}</h4>
                        <p className="text-white/40 text-xs uppercase tracking-wider">{media.speaker}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="space-y-12 animate-in fade-in max-w-4xl mx-auto py-10 min-h-[60vh] flex flex-col justify-center">
            {!showQuizResult ? (
              <>
                <header className="text-center mb-12">
                  <h2 className="text-4xl font-black luxury-text uppercase mb-4 tracking-tighter">Knowledge Challenge</h2>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.6em]">Test your understanding of Shia Beliefs</p>
                </header>
                <div className="glass-card p-12 rounded-[3rem] border-2 border-[#d4af37]/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-2 bg-[#d4af37]" style={{ width: `${((currentQuizIndex + 1) / QUIZ_DATA.length) * 100}%` }}></div>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-6 block">Question {currentQuizIndex + 1} of {QUIZ_DATA.length}</span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-relaxed">{QUIZ_DATA[currentQuizIndex].question}</h3>
                  <div className="space-y-4">
                    {QUIZ_DATA[currentQuizIndex].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(idx)}
                        disabled={selectedQuizOption !== null}
                        className={`w-full p-6 rounded-2xl text-left transition-all border-2 flex justify-between items-center ${
                          selectedQuizOption === idx 
                            ? idx === QUIZ_DATA[currentQuizIndex].correctIndex 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                              : 'bg-red-500/20 border-red-500 text-red-500'
                            : selectedQuizOption !== null && idx === QUIZ_DATA[currentQuizIndex].correctIndex
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-white/80'
                        }`}
                      >
                        <span className="text-sm font-bold uppercase tracking-wider">{option}</span>
                        {selectedQuizOption === idx && (
                          <i className={`fas ${idx === QUIZ_DATA[currentQuizIndex].correctIndex ? 'fa-check' : 'fa-times'}`}></i>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedQuizOption !== null && (
                    <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in">
                      <p className="text-sm text-white/60 italic"><strong className="text-[#d4af37] not-italic uppercase text-[10px] tracking-widest mr-2">Explanation:</strong> {QUIZ_DATA[currentQuizIndex].explanation}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center animate-in zoom-in duration-500">
                <div className="w-32 h-32 rounded-full bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-8 border-2 border-[#d4af37]/30">
                  <i className="fas fa-trophy text-5xl text-[#d4af37]"></i>
                </div>
                <h2 className="text-4xl font-black luxury-text uppercase mb-4">Quiz Completed</h2>
                <p className="text-white/40 text-lg mb-8">You scored <span className="text-[#d4af37] font-bold">{quizScore}</span> out of {QUIZ_DATA.length}</p>
                <button 
                  onClick={() => { setCurrentQuizIndex(0); setQuizScore(0); setShowQuizResult(false); setSelectedQuizOption(null); }}
                  className="px-10 py-4 bg-[#d4af37] text-[#011a14] rounded-full text-[12px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Retake Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'forum' && (
          <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-6">
            <header className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12 border-b border-white/10 pb-8">
              <div>
                <h2 className="text-5xl font-black luxury-text uppercase mb-4 tracking-tighter">Community Forum</h2>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.6em]">Discuss, Learn, and Connect</p>
              </div>
              <div className="flex gap-4 flex-wrap justify-end">
                <button onClick={() => setIsProfileModalOpen(true)} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                  <span className="text-lg">{userProfile.avatar}</span> My Profile
                </button>
                <button onClick={() => setIsAskScholarModalOpen(true)} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                  <i className="fas fa-user-graduate text-[#d4af37]"></i> Ask a Scholar
                </button>
                <button onClick={() => setIsNewTopicModalOpen(true)} className="px-6 py-3 bg-[#d4af37] text-[#011a14] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#aa771c] transition-all flex items-center gap-2">
                  <i className="fas fa-plus"></i> New Topic
                </button>
              </div>
            </header>

            {!selectedTopic ? (
              <div className="space-y-4">
                {forumTopics.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map(topic => (
                  <div key={topic.id} onClick={() => setSelectedTopic(topic)} className={`glass-card p-6 rounded-[2rem] border-white/5 hover:border-[#d4af37]/30 transition-all group flex items-center justify-between cursor-pointer ${topic.isPinned ? 'bg-[#d4af37]/5 border-[#d4af37]/20' : ''}`}>
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 font-black text-lg uppercase border border-white/10">
                        {topic.authorAvatar || topic.author[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {topic.isPinned && <i className="fas fa-thumbtack text-[#d4af37] text-xs rotate-45"></i>}
                          <h4 className="text-lg font-bold text-white group-hover:text-[#d4af37] transition-colors">{topic.title}</h4>
                        </div>
                        <p className="text-white/40 text-xs line-clamp-1 mb-2">{topic.content}</p>
                        <div className="flex items-center gap-4 text-[10px] font-mono text-white/30 uppercase">
                          <span><i className="fas fa-user mr-1"></i> {topic.author}</span>
                          <span><i className="fas fa-clock mr-1"></i> {topic.lastActive}</span>
                          <span className="bg-white/5 px-2 py-0.5 rounded">{topic.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-white/20">
                      <div className="text-center">
                        <span className="block text-lg font-black text-[#d4af37]">{topic.upvotes - topic.downvotes}</span>
                        <span className="text-[8px] uppercase tracking-widest">Score</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-lg font-black text-white/40">{topic.replies}</span>
                        <span className="text-[8px] uppercase tracking-widest">Replies</span>
                      </div>
                      <i className="fas fa-chevron-right ml-4 group-hover:translate-x-1 transition-transform"></i>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-10">
                <button onClick={() => setSelectedTopic(null)} className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                  <i className="fas fa-arrow-left"></i> Back to Forum
                </button>

                <div className="glass-card p-10 rounded-[3rem] border-white/5 mb-8 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-2xl border border-white/10">
                        {selectedTopic.authorAvatar || selectedTopic.author[0]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white mb-1">{selectedTopic.title}</h3>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-white/30 uppercase">
                          <span>Posted by {selectedTopic.author}</span>
                          <span>•</span>
                          <span>{selectedTopic.lastActive}</span>
                        </div>
                      </div>
                    </div>
                    {!isGuardianUnlocked && (
                      <div className="flex gap-2">
                        <button onClick={() => handlePinTopic(selectedTopic.id)} className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${selectedTopic.isPinned ? 'bg-[#d4af37] text-[#011a14] border-[#d4af37]' : 'bg-white/5 text-white/20 border-white/10 hover:text-white'}`}>
                          <i className="fas fa-thumbtack"></i>
                        </button>
                        <button onClick={() => handleDeleteTopic(selectedTopic.id)} className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="prose prose-invert max-w-none mb-10">
                    <p className="text-lg text-white/80 leading-relaxed">{selectedTopic.content}</p>
                  </div>

                  <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                    <button onClick={() => handleVote(selectedTopic.id, 'up')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all text-white/40 text-xs font-black uppercase tracking-widest">
                      <i className="fas fa-arrow-up"></i> {selectedTopic.upvotes}
                    </button>
                    <button onClick={() => handleVote(selectedTopic.id, 'down')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all text-white/40 text-xs font-black uppercase tracking-widest">
                      <i className="fas fa-arrow-down"></i> {selectedTopic.downvotes}
                    </button>
                  </div>
                </div>

                <div className="space-y-6 mb-12">
                  <h4 className="text-xl font-black luxury-text uppercase tracking-widest mb-6">Replies ({selectedTopic.replies})</h4>
                  {selectedTopic.repliesList?.map(reply => (
                    <div key={reply.id} className="glass-card p-8 rounded-[2rem] border-white/5 ml-8 relative">
                      <div className="absolute top-8 -left-4 w-4 h-px bg-white/10"></div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg border border-white/10">
                            {reply.authorAvatar || reply.author[0]}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white block">{reply.author}</span>
                            <span className="text-[10px] text-white/30 uppercase tracking-wider">{reply.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-white/70 leading-relaxed mb-6">{reply.content}</p>
                      <div className="flex items-center gap-4">
                        <button onClick={() => handleVoteReply(selectedTopic.id, reply.id, 'up')} className="text-white/20 hover:text-emerald-500 transition-colors text-xs flex items-center gap-1">
                          <i className="fas fa-arrow-up"></i> {reply.upvotes}
                        </button>
                        <button onClick={() => handleVoteReply(selectedTopic.id, reply.id, 'down')} className="text-white/20 hover:text-red-500 transition-colors text-xs flex items-center gap-1">
                          <i className="fas fa-arrow-down"></i> {reply.downvotes}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glass-card p-8 rounded-[2rem] border-white/5">
                  <h4 className="text-sm font-black text-[#d4af37] uppercase tracking-widest mb-4">Post a Reply</h4>
                  <textarea 
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#d4af37]/30 transition-all min-h-[120px] resize-none mb-4"
                  />
                  <div className="flex justify-end">
                    <button onClick={() => handleReply(selectedTopic.id)} className="px-8 py-3 bg-[#d4af37] text-[#011a14] rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {isNewTopicModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#011a14] border-2 border-[#d4af37]/30 p-10 rounded-[3rem] w-full max-w-lg relative shadow-2xl">
              <button onClick={() => setIsNewTopicModalOpen(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                <i className="fas fa-times text-2xl"></i>
              </button>
              <h3 className="text-2xl font-black luxury-text uppercase mb-8 tracking-tight">Start New Discussion</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-3 block">Topic Title</label>
                  <input 
                    type="text" 
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#d4af37]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-3 block">Content</label>
                  <textarea 
                    value={newTopicContent}
                    onChange={(e) => setNewTopicContent(e.target.value)}
                    placeholder="Elaborate on your topic..."
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#d4af37]/50 transition-all min-h-[120px] resize-none"
                  />
                </div>
                <button 
                  onClick={handleAddTopic}
                  className="w-full bg-[#d4af37] text-[#011a14] py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all mt-4"
                >
                  Post Topic
                </button>
              </div>
            </div>
          </div>
        )}

        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#011a14] border-2 border-[#d4af37]/30 p-10 rounded-[3rem] w-full max-w-lg relative shadow-2xl">
              <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                <i className="fas fa-times text-2xl"></i>
              </button>
              <h3 className="text-2xl font-black luxury-text uppercase mb-8 tracking-tight">My Profile</h3>
              <div className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-4xl border-2 border-[#d4af37]/30">
                    {userProfile.avatar}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-3 block">Display Name</label>
                  <input 
                    type="text" 
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#d4af37]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-3 block">Avatar (Emoji or URL)</label>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-2xl border-2 border-white/10">
                      {userProfile.avatar.startsWith('http') ? (
                        <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                      ) : (
                        userProfile.avatar
                      )}
                    </div>
                    <input 
                      type="text" 
                      value={userProfile.avatar}
                      onChange={(e) => setUserProfile({ ...userProfile, avatar: e.target.value })}
                      className="flex-1 bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#d4af37]/50 transition-all text-center"
                      placeholder="Emoji or Image URL"
                    />
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-[#d4af37]/20">
                      <div className="w-10 h-10 rounded-full bg-[#d4af37] flex items-center justify-center text-[#011a14]">
                        <i className="fab fa-google"></i>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest">Connected via Google</p>
                        <p className="text-white/60 text-sm truncate">{userProfile.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                    >
                      Disconnect Account
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-white/10">
                    <button 
                      onClick={handleConnect}
                      className="w-full bg-white text-[#011a14] py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3"
                    >
                      <i className="fab fa-google"></i>
                      Connect with Google
                    </button>
                    <p className="text-[10px] text-white/40 text-center mt-4 uppercase tracking-widest">Sync your progress across devices</p>
                  </div>
                )}

                <button 
                  onClick={() => handleUpdateProfile(userProfile.name, userProfile.avatar)}
                  className="w-full bg-[#d4af37] text-[#011a14] py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all mt-4"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {isAskScholarModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#011a14] border-2 border-[#d4af37]/30 p-10 rounded-[3rem] w-full max-w-lg relative shadow-2xl">
              <button onClick={() => setIsAskScholarModalOpen(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                <i className="fas fa-times text-2xl"></i>
              </button>
              <h3 className="text-2xl font-black luxury-text uppercase mb-2 tracking-tight">Ask a Scholar</h3>
              <p className="text-white/40 text-xs mb-8">Submit your theological or jurisprudential questions to our panel.</p>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-3 block">Your Question</label>
                  <textarea 
                    value={askScholarQuestion}
                    onChange={(e) => setAskScholarQuestion(e.target.value)}
                    placeholder="Type your question here..."
                    rows={4}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#d4af37]/50 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest mb-3 block">Email for Response</label>
                  <input 
                    type="email" 
                    value={askScholarEmail}
                    onChange={(e) => setAskScholarEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#d4af37]/50 transition-all"
                  />
                </div>
                <button 
                  onClick={handleAskScholarSubmit}
                  className="w-full bg-[#d4af37] text-[#011a14] py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all mt-4"
                >
                  Submit Question
                </button>
              </div>
            </div>
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
                 <button onClick={() => toggleSavedDua(selectedDua.id)} className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all shadow-xl bg-[#011a14]/50 ${savedDuas.includes(selectedDua.id) ? 'border-[#d4af37] text-[#d4af37]' : 'border-white/10 text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/40'}`}><i className={`${savedDuas.includes(selectedDua.id) ? 'fas' : 'far'} fa-bookmark text-xl`}></i></button>
                 <button onClick={() => shareDua(selectedDua)} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/10 flex items-center justify-center text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all shadow-xl bg-[#011a14]/50"><i className="fas fa-share-nodes text-xl"></i></button>
                 <button onClick={() => handleExplainDua(selectedDua)} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/10 flex items-center justify-center text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all shadow-xl bg-[#011a14]/50" title="AI Explanation"><i className="fas fa-robot text-xl"></i></button>
                 <button onClick={() => handleAudioPlayback(selectedDua.audio || '', selectedDua)} className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#d4af37] text-[#011a14] flex items-center justify-center shadow-[0_30px_60px_rgba(212,175,55,0.3)] hover:scale-110 transition-all"><i className="fas fa-play text-2xl md:text-3xl pl-2"></i></button>
              </div>
           </header>
           <div className="flex-1 px-4 md:px-20 lg:px-40 space-y-24 max-w-7xl mx-auto w-full pb-64">
              <div className="text-center">
                <p className="quran-text text-6xl md:text-8xl lg:text-9xl leading-[2.5] text-white/95 drop-shadow-2xl selection:bg-[#d4af37] selection:text-[#011a14]">{selectedDua.arabic}</p>
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent my-24"></div>
                {selectedDua.transliteration && (
                  <p className="text-2xl md:text-4xl font-black text-white/30 uppercase tracking-[0.3em] leading-relaxed max-w-6xl mx-auto mb-16 whitespace-pre-line">{selectedDua.transliteration}</p>
                )}
                <p className="font-serif italic text-3xl md:text-5xl lg:text-6xl text-center text-white/50 leading-relaxed max-w-6xl mx-auto drop-shadow-lg selection:bg-white/10 whitespace-pre-line mb-16">"{selectedDua.translation}"</p>
                {selectedDua.urduTranslation && (
                  <p className="font-arabic text-3xl md:text-5xl lg:text-6xl text-center text-white/50 leading-relaxed max-w-6xl mx-auto drop-shadow-lg selection:bg-white/10 whitespace-pre-line" dir="rtl">"{selectedDua.urduTranslation}"</p>
                )}
              </div>

              {(selectedDua.historicalContext || selectedDua.biography || duaAiExplanation || isExplainingDua) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-24 border-t-2 border-white/5">
                  {isExplainingDua && (
                    <div className="glass-card p-14 rounded-[4rem] border-[#d4af37]/20 border-2 bg-gradient-to-br from-[#d4af37]/5 to-transparent shadow-2xl flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full border-4 border-[#d4af37]/10 border-t-[#d4af37] animate-spin mb-6"></div>
                      <p className="text-[12px] font-black text-[#d4af37] uppercase tracking-widest">Consulting AI Scholar...</p>
                    </div>
                  )}
                  {duaAiExplanation && !isExplainingDua && (
                    <div className="glass-card p-14 rounded-[4rem] border-[#d4af37]/40 border-2 bg-gradient-to-br from-[#d4af37]/10 to-transparent shadow-2xl lg:col-span-2">
                      <h4 className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.5em] mb-10 border-b border-[#d4af37]/20 pb-6 flex items-center gap-3">
                        <i className="fas fa-robot"></i> AI Explanation & Summary
                      </h4>
                      <p className="text-white/90 text-lg md:text-xl leading-relaxed font-serif whitespace-pre-wrap">{duaAiExplanation}</p>
                    </div>
                  )}
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

      {explainingAyah && (
        <div className="fixed inset-0 z-[1000] bg-[#011a14]/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="max-w-3xl w-full glass-card p-12 md:p-20 rounded-[4rem] border-[#d4af37]/40 border-4 relative overflow-hidden shadow-[0_100px_200px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
            <button onClick={() => setExplainingAyah(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
              <i className="fas fa-times text-2xl"></i>
            </button>
            <h3 className="luxury-text text-3xl md:text-4xl font-black uppercase mb-8 text-center tracking-tighter flex items-center justify-center gap-4">
              <i className="fas fa-robot text-[#d4af37]"></i> AI Tafsir
            </h3>
            
            <div className="space-y-8 mb-10">
              <div className="text-center">
                <p className="quran-text text-4xl md:text-5xl leading-relaxed text-white/90 mb-4">{explainingAyah.text}</p>
                <p className="font-serif italic text-xl text-white/60">"{explainingAyah.translation}"</p>
              </div>
            </div>

            {isExplainingAyah ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full border-4 border-[#d4af37]/10 border-t-[#d4af37] animate-spin mb-6"></div>
                <p className="text-[12px] font-black text-[#d4af37] uppercase tracking-widest animate-pulse">Consulting Scholars...</p>
              </div>
            ) : (
              <div className="bg-white/5 border-2 border-white/10 rounded-[2.5rem] p-8 md:p-12">
                <p className="text-lg md:text-xl text-white/80 leading-relaxed font-serif whitespace-pre-wrap">{ayahExplanation}</p>
              </div>
            )}
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
