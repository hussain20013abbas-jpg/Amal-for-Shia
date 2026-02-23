
import { Dua, Amal, Reciter, TasbihPreset, ShiaResource, HijriEvent } from './types';

export const RECITERS: Reciter[] = [
  { 
    id: 'ar.alafasy', 
    name: 'Alafasy', 
    fullName: 'Mishary Rashid Alafasy', 
    slug: 'mishary_rashid_alafasy',
    country: 'KW',
    bio: 'Renowned Kuwaiti Qari known for his soulful and clear recitation.'
  },
  { 
    id: 'ar.abdulsamad', 
    name: 'Abdul Basit', 
    fullName: 'Abdul Basit Abdus Samad', 
    slug: 'abdul_basit_murattal',
    country: 'EG',
    bio: 'The "Golden Throat," legendary Egyptian Qari whose voice echoed across the world.'
  },
  {
    id: 'ar.parhizgar',
    name: 'Parhizgar',
    fullName: 'Shahriar Parhizgar',
    slug: 'shahriar_parhizgar',
    country: 'IR',
    bio: 'Prominent Iranian Qari famous for his precise and rhythmic Tartil.'
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
    audio: 'https://www.duas.org/audio/Ziarat_Ashura.mp3',
    historicalContext: 'A salutation to the Master of Martyrs, Imam Hussain (as), typically recited on the 10th of Muharram and frequently thereafter to renew the pledge of allegiance.',
    biography: 'Imam Hussain (as) is the second grandson of Prophet Muhammad (saws) and the third Imam. His sacrifice in Karbala stands as the ultimate victory of truth over falsehood.'
  },
  {
    id: 'hujjat',
    title: 'Dua-e-Faraj (Imam Zamana)',
    category: 'Imam Mahdi (atfs)',
    arabic: 'اِلـهي عَظُمَ الْبَلاءُ، وَبَرِحَ الْخَفاءُ، وَانْكَشَفَ الْغِطاءُ...',
    translation: 'O my God, the calamity has escalated...',
    audio: 'https://www.duas.org/audio/Dua_Faraj.mp3',
    historicalContext: 'Recited to seek the expedited reappearance of the 12th Imam during times of hardship and occultation.',
    biography: 'Imam Muhammad al-Mahdi (atfs) is the son of Imam Hasan al-Askari (as). He is currently in the Great Occultation and will return to fill the world with justice.'
  },
  {
    id: 'fatima',
    title: 'Ziyarat Lady Fatima (sa)',
    category: 'Madina',
    arabic: 'يَا مُمْتَحَنَةُ امْتَحَنَكِ اللَّهُ الَّذِي خَلَقَكِ قَبْلَ أَنْ يَخْلُقَكِ...',
    translation: 'O you who were tested, Allah who created you tested you...',
    audio: 'https://www.duas.org/audio/Ziyarat_Syeda_Fatima.mp3',
    historicalContext: 'A profound salutation to the Mistress of the Women of the Worlds, often recited on her birth or martyrdom anniversaries.',
    biography: 'Fatima az-Zahra (sa) is the daughter of the Prophet (saws), wife of Imam Ali (as), and mother of Imams Hasan and Hussain (as).'
  }
];

export const POPULAR_DUAS: Dua[] = [
  {
    id: 'kumail',
    title: 'Dua Kumayl',
    category: 'Weekly',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ...',
    translation: 'O Allah, I ask You by Your mercy...',
    transliteration: 'Allahumma inni as\'aluka bi-rahmatika...',
    audio: 'https://www.duas.org/audio/Dua_Kumayl.mp3',
    historicalContext: 'Taught by Imam Ali (as) to his companion Kumayl ibn Ziyad. It is recommended for every Thursday night.',
    biography: 'Imam Ali (as) is the first Imam, the successor of the Prophet (saws), and the gateway to the city of knowledge.'
  },
  {
    id: 'ahad',
    title: 'Dua Ahad',
    category: 'Daily',
    arabic: 'اَللَّهُمَّ رَبَّ النُّورِ الْعَظيمِ...',
    translation: 'O Allah, Lord of the Great Light...',
    transliteration: 'Allahumma rabba an-nuri al-azim...',
    audio: 'https://www.duas.org/audio/Dua_Ahad.mp3',
    historicalContext: 'Recited for 40 mornings to be counted among the helpers of the Imam of our Time.',
  },
  {
    id: 'tawassul',
    title: 'Dua Tawassul',
    category: 'Daily',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ وَأَتَوَجَّهُ إِلَيْكَ بِنَبِيِّكَ نَبِيِّ الرَّحْمَةِ...',
    translation: 'O Allah, I ask You and turn to You through Your Prophet...',
    transliteration: 'Allahumma inni as\'aluka wa atawajjahu...',
    audio: 'https://www.duas.org/audio/Dua_Tawassul.mp3',
    historicalContext: 'A prayer of intercession through the 14 Infallibles (as).',
  },
  {
    id: 'nudbah',
    title: 'Dua Nudbah',
    category: 'Friday',
    arabic: 'اَلْحَمْدُ للهِ رَبِّ الْعالَمينَ وَصَلَّى اللهُ عَلى سَيِّدِنا مُحَمَّد نَبِيِّهِ وَآلِهِ وَسَلَّمَ تَسْليماً...',
    translation: 'Praise be to Allah, the Lord of the worlds...',
    transliteration: 'Alhamdu lillahi rabbil alamin...',
    audio: 'https://www.duas.org/audio/Dua_Nudbah.mp3',
    historicalContext: 'The "Lamentation" prayer, recited on Friday mornings to express longing for Imam Mahdi (atfs).',
  }
];

export const HIJRI_EVENTS: HijriEvent[] = [
  { day: 10, month: 1, title: 'Ashura', description: 'Martyrdom of Imam Hussain (as) and his companions in Karbala.', type: 'martyrdom' },
  { day: 20, month: 2, title: 'Arbaeen', description: '40th day after the martyrdom of Imam Hussain (as).', type: 'event' },
  { day: 17, month: 3, title: 'Milad-un-Nabi', description: 'Birth of Prophet Muhammad (saws) and Imam Sadiq (as).', type: 'birth' },
  { day: 13, month: 7, title: 'Wiladat Imam Ali (as)', description: 'Birth of the Commander of the Faithful in the Kaaba.', type: 'birth' },
  { day: 15, month: 8, title: 'Wiladat Imam Mahdi (atfs)', description: 'Birth of the 12th Imam, the Savior of Humanity.', type: 'birth' },
  { day: 18, month: 12, title: 'Eid al-Ghadir', description: 'The day the Prophet (saws) declared Imam Ali (as) as his successor.', type: 'event' },
  { day: 21, month: 9, title: 'Martyrdom of Imam Ali (as)', description: 'The Commander of the Faithful was struck in the Mihrab of Kufa.', type: 'martyrdom' },
  { day: 15, month: 3, title: 'Wiladat Imam Hasan (as)', description: 'Birth of the second Imam.', type: 'birth' },
];

export const DAILY_AMALS: Record<string, Amal> = {
  'Saturday': {
    id: 'sat',
    title: 'Saturday Amaal',
    description: 'Dedicated to the Holy Prophet (sawa).',
    steps: ['Recite Ziyarat of Holy Prophet (sawa)', 'Recite Surah al-Fath', '100x: Ya Rabb al-Alameen'],
  },
  'Sunday': {
    id: 'sun',
    title: 'Sunday Amaal',
    description: 'Dedicated to Imam Ali (as) and Bibi Fatima (sa).',
    steps: ['Recite Ziyarat of Imam Ali (as)', 'Recite Ziyarat of Sayyida Fatima (sa)', '100x: Ya Dhal Jalali wal Ikram'],
  },
  'Monday': {
    id: 'mon',
    title: 'Monday Amaal',
    description: 'Dedicated to Imam Hasan (as) and Imam Hussain (as).',
    steps: ['Ziyarat of Imam Hasan (as)', 'Ziyarat of Imam Hussain (as)', '100x: Ya Qadhiyal Hajat'],
  },
  'Tuesday': {
    id: 'tue',
    title: 'Tuesday Amaal',
    description: 'Dedicated to Imam Sajjad (as), Baqir (as), and Sadiq (as).',
    steps: ['Ziyarat of the Three Imams', 'Dua Tawassul', '100x: Ya Arhamar Rahimeen'],
  },
  'Wednesday': {
    id: 'wed',
    title: 'Wednesday Amaal',
    description: 'Dedicated to Imam Kadhim (as), Reza (as), Jawad (as), and Hadi (as).',
    steps: ['Ziyarat of the Four Imams', '100x: Ya Hayyu Ya Qayyum'],
  },
  'Thursday': {
    id: 'thu',
    title: 'Thursday Amaal',
    description: 'Dedicated to Imam Hassan al-Askari (as).',
    steps: ['Recite Dua Kumayl at night', 'Ziyarat of Imam Askari (as)', '100x: La Ilaha Illallah al-Malikul Haqqul Mubeen'],
  },
  'Friday': {
    id: 'fri',
    title: 'Friday Amaal',
    description: 'Master of Days, dedicated to Imam Mahdi (atfs).',
    steps: ['Ghusl-e-Jummah', 'Dua Nudbah', 'Ziyarat of Imam Mahdi (atfs)', '100x: Allahumma Salle Ala Muhammadin wa Aali Muhammad'],
  }
};

export const TASBIH_PRESETS: TasbihPreset[] = [
  { id: 'zahra', name: 'Tasbih e Fatima (sa)', label: '34x Allahu Akbar, 33x Alhamdulillah, 33x SubhanAllah', max: 100 },
  { id: 'salawat', name: 'Salawat', label: '100x Allahumma Salle Ala Muhammad...', max: 100 },
  { id: 'istighfar', name: 'Istighfar', label: '100x Astaghfirullah', max: 100 }
];

export const NOTIFICATION_SOUNDS = [
  { id: 'soft_chime', name: 'Soft Chime', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { id: 'adhan_fajr', name: 'Adhan (Fajr)', url: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
  { id: 'adhan_makkah', name: 'Adhan (Makkah)', url: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
  { id: 'spiritual_bell', name: 'Spiritual Bell', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
];

export const SHIA_RESOURCES: ShiaResource[] = [
  {
    id: 'al-islam',
    name: 'Al-Islam.org',
    url: 'https://www.al-islam.org',
    icon: 'fa-book-quran',
    description: 'The largest digital library of Shia Islamic resources, books, and articles.'
  },
  {
    id: 'duas-org',
    name: 'Duas.org',
    url: 'https://www.duas.org',
    icon: 'fa-hand-holding-heart',
    description: 'Comprehensive collection of supplications, ziayrats, and amaals with audio.'
  },
  {
    id: 'sistani-org',
    name: 'Sistani.org',
    url: 'https://www.sistani.org',
    icon: 'fa-shield-halved',
    description: 'Official portal of Grand Ayatollah Ali al-Sistani for Fiqh and rulings.'
  },
  {
    id: 'shiapen',
    name: 'ShiaPen',
    url: 'https://www.shiapen.com',
    icon: 'fa-pen-nib',
    description: 'Analytical research answering theological questions from a Shia perspective.'
  },
  {
    id: 'shia-toolkit',
    name: 'Shia Toolkit',
    url: 'https://shiatoolkit.com',
    icon: 'fa-toolbox',
    description: 'A multi-purpose app providing Duas, Namaz times, and Islamic calendar.'
  },
  {
    id: 'thaqalayn',
    name: 'Thaqalayn.net',
    url: 'https://thaqalayn.net',
    icon: 'fa-database',
    description: 'Extensive database of authentic Shia Hadith from major primary collections.'
  },
  {
    id: 'ahlulbayt-tv',
    name: 'Ahlulbayt TV',
    url: 'https://ahlulbayt.tv',
    icon: 'fa-tv',
    description: 'International satellite channel dedicated to the teachings of the Ahlulbayt.'
  },
  {
    id: 'mafatih',
    name: 'Mafatih al-Jinan',
    url: 'https://mafatih.net',
    icon: 'fa-key',
    description: 'Online access to the complete Mafatih al-Jinan by Sheikh Abbas Qummi.'
  },
  {
    id: 'karbala-app',
    name: 'Karbala App',
    url: 'https://karbala.app',
    icon: 'fa-location-dot',
    description: 'Interactive map and history of the events of Ashura and the shrine of Imam Hussain.'
  }
];
