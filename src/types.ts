
export interface Dua {
  id: string;
  title: string;
  category: string;
  arabic: string;
  translation: string;
  urduTranslation?: string;
  urduDescription?: string;
  transliteration?: string;
  benefits?: string;
  audio?: string;
  historicalContext?: string;
  biography?: string;
  tafsir?: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  audio?: string;
  translation?: string;
  urduTranslation?: string;
  transliteration?: string;
}

export interface AmalStep {
  text: string;
  reference?: {
    text: string;
    arabic?: string;
    source?: string;
    audio?: string;
    translation?: string;
  };
}

export interface Amal {
  id: string;
  title: string;
  description: string;
  steps: (string | AmalStep)[];
  reward?: string;
  urduDescription?: string;
}

export interface Reciter {
  id: string;
  name: string;
  fullName: string;
  slug: string;
  bio?: string;
  country?: string;
}

export interface QadhaState {
  Fajr: number;
  Dhuhr: number;
  Asr: number;
  Maghrib: number;
  Isha: number;
}

export interface TasbihPreset {
  id: string;
  name: string;
  label: string;
  max: number;
  isCustom?: boolean;
}

export interface SavedAyah {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  translation: string;
  note: string;
  timestamp: number;
}

export interface DailyNamazStats {
  Fajr: boolean;
  Dhuhr: boolean;
  Asr: boolean;
  Maghrib: boolean;
  Isha: boolean;
}

export interface PrayerHistory {
  [date: string]: DailyNamazStats;
}

export interface Reminder {
  id: string;
  prayerName: string;
  offsetMinutes: number; // e.g., -15 for 15 mins before, 0 for at time, 15 for 15 mins after
  enabled: boolean;
  soundUrl?: string;
  label?: string;
}

export interface HijriEvent {
  day: number;
  month: number;
  title: string;
  description: string;
  type: 'martyrdom' | 'birth' | 'event';
}

export interface ShiaResource {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string;
}

export interface MediaItem {
  id: string;
  type: 'audio' | 'video';
  title: string;
  speaker: string;
  url: string;
  duration: string;
  thumbnail?: string;
  category: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar: string; // Emoji or URL
  role: 'user' | 'moderator' | 'admin';
  joinedDate: string;
}

export interface ForumReply {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string; // Added content body
  author: string;
  authorAvatar?: string;
  replies: number; // Keep for display count, or derive from repliesList
  repliesList: ForumReply[]; // Added detailed replies
  views: number;
  lastActive: string;
  category: string;
  upvotes: number;
  downvotes: number;
  isPinned?: boolean;
}

export interface RamadanDay {
  day: number;
  dua: Dua;
  amaal: string[];
}

export interface Hadith {
  id: string;
  arabic: string;
  translation: string;
  source: string;
  author: string;
  tags?: string[];
}

export interface ShiaKnowledge {
  id: string;
  title: string;
  category: 'Theology' | 'Figures' | 'History' | 'Practices';
  content: string;
  arabic?: string;
  translation?: string;
  image?: string;
  subsections?: { title: string; content: string }[];
}
