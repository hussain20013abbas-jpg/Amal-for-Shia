
export interface Dua {
  id: string;
  title: string;
  category: string;
  arabic: string;
  translation: string;
  urduDescription?: string;
  transliteration?: string;
  benefits?: string;
  audio?: string;
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
  transliteration?: string;
}

export interface Amal {
  id: string;
  title: string;
  description: string;
  steps: string[];
  reward?: string;
  urduDescription?: string;
}

export interface MasailCategory {
  title: string;
  rulings: {
    question: string;
    answer: string;
  }[];
}

export interface Scholar {
  name: string;
  title: string;
  keyWisdom: string;
}

export interface MonthInfo {
  name: string;
  significance: string;
  recommendedAmals: string[];
  detailedAmals: string[];
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

export interface PlaylistItem {
  type: 'dua' | 'ziyarat';
  id: string;
}

export interface Playlist {
  id: string;
  name: string;
  items: PlaylistItem[];
  timestamp: number;
}

export interface Reminder {
  id: string;
  title: string;
  time: string; // HH:mm format
  day?: string; // Optional: specific day for weekly Amaal
  active: boolean;
}

export interface Reciter {
  id: string; // API identifier for ayah-by-ayah
  name: string;
  fullName: string;
  slug: string; // for full surah downloads
  bio?: string;
  country?: string;
}

export interface NamazLogEntry {
  date: string; // ISO format YYYY-MM-DD
  count: number; // 0-5
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
