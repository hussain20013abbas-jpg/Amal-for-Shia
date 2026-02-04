
import { Dua, Amal, MonthInfo, MasailCategory, Scholar, Reciter, TasbihPreset } from './types';

export const RECITERS: Reciter[] = [
  { 
    id: 'ar.alafasy', 
    name: 'Alafasy', 
    fullName: 'Mishary Rashid Alafasy', 
    slug: 'mishary_rashid_alafasy',
    country: 'KW',
    bio: 'Renowned for his melodious and emotional recitations. An icon of modern Quranic tajweed.'
  },
  { 
    id: 'ar.abdulsamad', 
    name: 'Abdul Basit', 
    fullName: 'Abdul Basit Abdus Samad', 
    slug: 'abdul_basit_murattal',
    country: 'EG',
    bio: 'One of the greatest Quranic reciters of all time, famous for his powerful breath and golden voice.'
  }
];

export const DIVINE_PEARLS = [
  { 
    id: 'p1', 
    source: 'Nahj al-Balagha', 
    text: 'الْبُخْلُ عَارٌ، وَالْجُبْنُ مَنْقَصَةٌ، وَالْفَقْرُ يُخْرِسُ الْفَطِينَ عَنْ حُجَّتِهِ', 
    translation: 'Avarice is disgrace; cowardice is a defect; poverty softens the sharp tongue from arguing its case.', 
    author: 'Imam Ali (as)' 
  }
];

export const ZIYARATS: Dua[] = [
  {
    id: 'ashura',
    title: 'Ziarat Ashura',
    category: 'Karbala',
    arabic: 'اَلسَّلامُ عَلَيْكَ يا اَبا عَبْدِ اللهِ، اَلسَّلامُ عَلَيْكَ يَا بْنَ رَسُولِ اللهِ...',
    translation: 'Peace be upon you, O Abu Abdillah...',
    benefits: 'The most powerful means of seeking proximity to Allah through Imam Hussain (as).',
    audio: 'https://www.duas.org/audio/Ziarat_Ashura.mp3'
  },
  {
    id: 'fatima',
    title: 'Ziyarat Fatima Zahra (sa)',
    category: 'Medina',
    arabic: 'يَا مُمْتَحَنَةُ امْتَحَنَكِ اللهُ الَّذي خَلَقَكِ قَبْلَ اَنْ يَخْلُقَكِ...',
    translation: 'O tested one! Allah, who created you before He created you, tested you...',
    benefits: 'Intercession of the Leader of the Women of Paradise.',
    audio: 'https://www.duas.org/audio/Ziarat_Sayyida_Fatima.mp3'
  },
  {
    id: 'zainab',
    title: 'Ziyarat Zainab (sa)',
    category: 'Damascus',
    arabic: 'اَلسَّلامُ عَلَيْكِ يا بِنْتَ سَيِّدِ الْاَنْبِياءِ، اَلسَّلامُ عَلَيْكِ يا بِنْتَ صاحِبِ الْحَوْضِ...',
    translation: 'Peace be upon you, O daughter of the Master of Prophets...',
    benefits: 'Honor for the Heroine of Karbala.',
    audio: 'https://www.duas.org/audio/Ziyarat_Sayyida_Zaynab.mp3'
  },
  {
    id: 'warisa',
    title: 'Ziarat Warisa',
    category: 'Karbala',
    arabic: 'اَلسَّلامُ عَلَيْكَ يا وارِثَ آدَمَ صَفْوَةِ اللهِ...',
    translation: 'Peace be upon you, O inheritor of Adam...',
    audio: 'https://www.duas.org/audio/Ziarat_Warisa.mp3'
  }
];

export const POPULAR_DUAS: Dua[] = [
  {
    id: 'kumail',
    title: 'Dua Kumayl',
    category: 'Spiritual',
    arabic: 'اللَّهُمَّ إِنِّي أَSأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ...',
    translation: 'O Allah, I ask You by Your mercy...',
    audio: 'https://www.duas.org/audio/Dua_Kumayl.mp3'
  },
  {
    id: 'ahad',
    title: 'Dua Ahad',
    category: 'Imam Mahdi (atfs)',
    arabic: 'اَللَّهُمَّ رَبَّ النُّورِ الْعَظيمِ، وَرَبَّ الْكُرْسِيِّ الرَّفيعِ...',
    translation: 'O Allah, Lord of the Great Light...',
    audio: 'https://www.duas.org/audio/Dua_Ahad.mp3'
  },
  {
    id: 'tawassul',
    title: 'Dua Tawassul',
    category: 'Intercession',
    arabic: 'اللَّهُمَّ إِنِّي أَSأَلُكَ وَأَتَوَجَّهُ إِلَيْكَ بِنَبِيِّكَ...',
    translation: 'O Allah, I ask You and turn towards You by Your Prophet...',
    audio: 'https://www.duas.org/audio/Dua_Tawassul.mp3'
  }
];

export const SPECIAL_AMALS: Amal[] = [
  {
    id: 'ghafila',
    title: 'Namaz-e-Ghafila',
    description: 'Specific 2-rakat prayer between Maghrib and Isha.',
    steps: ['1st Rakat: Hamd + Yunus: 87', '2nd Rakat: Hamd + Anam: 59', 'Special Qunoot Dua'],
    reward: 'Immediate attention to your hajat.'
  },
  {
    id: 'jummah',
    title: 'Friday Amaal',
    description: 'Recommended acts for the best of days.',
    steps: ['Ghusl-e-Jummah', 'Recite Surah Kahf', 'Salawat (100x)', 'Dua Nudbah'],
  }
];

export const TASBIH_PRESETS: TasbihPreset[] = [
  { id: 'zahra', name: 'Zahra\'s Tasbih', label: 'Fatima (sa)', max: 100 },
  { id: 'salawat', name: 'Salawat', label: 'Prophetic Blessing', max: 100 },
  { id: 'mahdi', name: 'Ya Mahdi', label: 'Al-Ajal', max: 313 }
];
