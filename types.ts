
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
  historicalContext?: string;
  biography?: string;
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
