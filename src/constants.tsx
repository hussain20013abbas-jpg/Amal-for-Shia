
import { Dua, Amal, Reciter, TasbihPreset, ShiaResource, HijriEvent, Hadith, ShiaKnowledge } from './types';

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
  },
  {
    id: 'ar.minshawi',
    name: 'Minshawi',
    fullName: 'Mohamed Siddiq al-Minshawi',
    slug: 'mohamed_siddiq_al_minshawi',
    country: 'EG',
    bio: 'One of the most famous reciters of the Quran, known for his emotional and spiritual style.'
  },
  {
    id: 'ar.husary',
    name: 'Husary',
    fullName: 'Mahmoud Khalil Al-Husary',
    slug: 'mahmoud_khalil_al_husary',
    country: 'EG',
    bio: 'A master of Tajweed, his recitation is considered the standard for learning Quranic pronunciation.'
  },
  {
    id: 'ar.rifai',
    name: 'Hani Ar-Rifai',
    fullName: 'Hani Ar-Rifai',
    slug: 'hani_ar_rifai',
    country: 'SA',
    bio: 'Known for his unique and weeping style of recitation that touches the hearts of many.'
  },
  {
    id: 'ar.shatri',
    name: 'Abu Bakr al-Shatri',
    fullName: 'Abu Bakr al-Shatri',
    slug: 'abu_bakr_al_shatri',
    country: 'SA',
    bio: 'A popular Saudi Qari known for his rhythmic and melodic recitation.'
  }
];

export const DIVINE_PEARLS = [
  { 
    id: 'p1', 
    source: 'Nahj al-Balagha', 
    text: 'الْبُخْلُ عَارٌ، وَالْجُبْنُ مَنْقَصَةٌ، وَالْفَقْرُ يُخْرِسُ الْفَطِينَ عَنْ حُجَّتِهِ', 
    translation: 'Avarice is disgrace; cowardice is a defect; poverty silences the tongue of a wise man from arguing his case.'
  }
];

export const ZIYARATS: Dua[] = [
  {
    id: 'ashura',
    title: 'Ziarat Ashura',
    category: 'Karbala',
    arabic: 'اَلسَّلامُ عَلَيْكَ يا اَبا عَبْدِ اللهِ، اَلسَّلامُ عَلَيْكَ يَا بْنَ رَسُولِ اللهِ، اَلسَّلامُ عَلَيْكَ يَا بْنَ اَميرِ الْمُؤْمِنينَ وَابْنَ سَيِّدِ الْوَصِيّينَ، اَلسَّلامُ عَلَيْكَ يَا بْنَ فاطِمَةَ سَيِّدَةِ نِساءِ الْعالَمينَ، اَلسَّلامُ عَلَيْكَ يا ثارَ اللهِ وَابْنَ ثارِهِ وَالْوِتْرَ الْمَوْتُورَ، اَلسَّلامُ عَلَيْكَ وَعَلَى الْاَرْواحِ الَّتي حَلَّتْ بِفِنائِكَ عَلَيْكُمْ مِنّي جَميعاً سَلامُ اللهِ اَبَداً ما بَقيتُ وَبَقِيَ اللَّيْلُ وَالنَّهارُ، يا اَبا عَبْدِ اللهِ لَقَدْ عَظُمَتِ الرَّزِيَّةُ وَجَلَّتْ وَعَظُمَتِ الْمُصيبَةُ بِكَ عَلَيْنا وَعَلى جَميعِ اَهْلِ الْاِسْلامِ وَجَلَّتْ وَعَظُمَتْ مُصيبَتُكَ فِي السَّماواتِ عَلى جَميعِ اَهْلِ السَّماواتِ، فَلَعَنَ اللهُ اُمَّةً اَسَّسَتْ اَساسَ الظُّلْمِ وَالْجَوْرِ عَلَيْكُمْ اَهْلَ الْبَيْتِ، وَلَعَنَ اللهُ اُمَّةً دَفَعَتْكُمْ وَاَزالَتْكُمْ عَنْ مَراتِبِكُمُ الَّتي رَتَّبَكُمُ اللهُ فيها، وَلَعَنَ اللهُ اُمَّةً قَتَلَتْكُمْ وَلَعَنَ اللهُ الْمُمَهِّدينَ لَهُمْ بِالَّتمْكينِ مِنْ قِتالِكُمْ، بَرِئْتُ اِلَى اللهِ وَاِلَيْكُمْ مِنْهُمْ وَمنْ اَشْياعِهِمْ وَاَتْباعِهِمْ وَاَوْلِيائِهِم، يا اَبا عَبْدِ اللهِ اِنّي سِلْمٌ لِمَنْ سالَمَكُمْ وَحَرْبٌ لِمَنْ حارَبَكُمْ اِلى يَوْمِ الْقِيامَةِ، وَلَعَنَ اللهُ آلَ زِياد وَآلَ مَرْوانَ، وَلَعَنَ اللهُ بَني اُمَيَّةَ قاطِبَةً، وَلَعَنَ اللهُ ابْنَ مَرْجانَةَ، وَلَعَنَ اللهُ عُمَرَ بْنَ سَعْد، وَلَعَنَ اللهُ شِمْراً، وَلَعَنَ اللهُ اُمَّةً اَسْرَجَتْ وَاَلْجَمَتْ وَتَنَقَّبَتْ لِقِتالِكَ، بِاَبي اَنْتَ وَاُمّي لَقَدْ عَظُمَ مُصابي بِكَ فَاَسْأَلُ اللهَ الَّذي اَكْرَمَ مَقامَكَ وَاَكْرَمَني بِكَ اَنْ يَرْزُقَني طَلَبَ ثارِكَ مَعَ اِمام مَنْصُور مِنْ اَهْلِ بَيْتِ مُحَمَّد صَلَّى اللهُ عَلَيْهِ وَآلِهِ، اَللّهُمَّ اجْعَلْني عِنْدَكَ وَجيهاً بِالْحُسَيْنِ عَلَيْهِ السَّلامُ فِي الدُّنْيا وَالْآخِرَةِ، يا اَبا عَبْدِ اللهِ اِنّي اَتَقَرَّبُ اِلى اللهِ وَ اِلى رَسُولِهِ وَاِلى اَميرِ الْمُؤْمِنينَ وَاِلى فاطِمَةَ وَاِلَى الْحَسَنِ وَاِلَيْكَ بِمُوالاتِكَ وَبِالْبَراءَةِ مِمَّنْ اَسَسَّ اَساسَ ذلِكَ وَبَنى عَلَيْهِ بُنْيانَهُ وَجَرى فِي ظُلْمِهِ وَجَوْرِهِ عَلَيْكُمْ وَعلى اَشْياعِكُمْ، بَرِئْتُ اِلَى اللهِ وَاِلَيْكُمْ مِنْهُمْ وَاَتَقَرَّبُ اِلَى اللهِ ثُمَّ اِلَيْكُمْ بِمُوالاتِكُمْ وَمُوالاةِ وَلِيِّكُمْ وَبِالْبَراءَةِ مِنْ اَعْدائِكُمْ وَ النّاصِبينَ لَكُمُ الْحَرْبَ وَبِالْبَراءَةِ مِنْ اَشْياعِهِمْ وَاَتْباعِهِمْ، اِنّي سِلْمٌ لِمَنْ سالَمَكُمْ وَحَرْبٌ لِمَنْ حارَبَكُمْ وَوَلِيٌّ لِمَنْ والากُمْ وَعَدُوٌّ لِمَنْ عاداكُمْ فَاَسْأَلُ اللهَ الَّذي اَكرمَني بِمَعْرِفَتِكُمْ وَمَعْرِفَةِ اَوْلِيائِكُمْ وَرَزَقَنِي الْبَراءَةَ مِنْ اَعْدائِكُمْ اَنْ يَجْعَلَني مَعَكُمْ فِي الدُّنْيا وَالْآخِرَةِ وَاَنْ يُثَبِّتَ لي عِنْدَكُمْ قَدَمَ صِدْق فِي الدُّنْيا وَالْآخِرَةِ وَاَسْأَلُهُ اَنْ يُبَلِّغَنِي الْمَقامَ الْمَحْمُودَ لَكُمْ عند اللهِ وَ اَنْ يَرْزُقَني طَلَبَ ثاري مَعَ اِمام هُدىً ظاهِر ناطِق بِالْحَقِّ مِنْكُمْ وَاَسْأَلُ اللهَ بِحقِّكُمْ وَبِالشَّأْنِ الَّذي لَكُمْ عِنْدَهُ اَنْ يُعْطِيَني بِمُصابي بِكُمْ اَفْضَلَ ما يُعْطي مُصاباً بِمُصيبَتِهِ مُصيبَةً ما اَعْظَمَها وَاَعْظَمَ رَزِيَّتَها فِي الْاِسْلامِ وَفي جَميعِ السَّماواتِ وَالْاَرْضِ اَللّهُمَّ اجْعَلْني فِي مَقامي هذا مِمَّنْ تَنالُهُ مِنْكَ صَلَواتٌ وَرَحْمَةٌ وَمَغْفِرَةٌ، اَللّهُمَّ اجْعَل مَحْيايَ مَحْيا مُحَمَّد وَآلِ مُحَمَّد وَمَماتي مَماتَ مُحَمَّد وَآلِ مُحَمَّد.',
    translation: 'Peace be upon you, O Abu Abdillah, peace be upon you, O son of the Messenger of Allah, peace be upon you, O son of the Commander of the Faithful and the son of the master of the successors...',
    transliteration: 'As-salaamu alaika yaa Abaa Abdillah, As-salaamu alaika yabna Rasoolillah, As-salaamu alaika yabna Ameeril Mo\'mineen...',
    urduTranslation: 'سلام ہو آپ پر اے ابا عبداللہ، سلام ہو آپ پر اے رسول خدا کے فرزند، سلام ہو آپ پر اے امیر المومنین اور سید الوصیین کے فرزند...',
    urduTransliteration: 'As-salaamu alaika yaa Abaa Abdillah, As-salaamu alaika yabna Rasoolillah, As-salaamu alaika yabna Ameeril Mo\'mineen...',
    audio: 'https://www.duas.org/audio/Ziarat_Ashura.mp3',
    historicalContext: 'A salutation to the Master of Martyrs, Imam Hussain (as), typically recited on the 10th of Muharram and frequently thereafter to renew the pledge of allegiance.',
    biography: 'Imam Hussain (as) is the second grandson of Prophet Muhammad (saws) and the third Imam. His sacrifice in Karbala stands as the ultimate victory of truth over falsehood.',
    tafsir: 'Ziyarat Ashura is not merely a salutation; it is a declaration of loyalty (Tawalla) and dissociation (Tabarra). The repetitive curses in the Ziyarat signify a profound rejection of oppression and those who established the foundations of injustice against the Ahlulbayt (as). It serves as a spiritual compass, aligning the believer with the values of Karbala—sacrifice, justice, and unwavering faith.'
  },
  {
    id: 'hujjat',
    title: 'Dua-e-Faraj (Imam Zamana)',
    category: 'Imam Mahdi (atfs)',
    arabic: 'اِلـهي عَظُمَ الْبَلاءُ، وَبَرِحَ الْخَفاءُ، وَانْكَشَفَ الْغِطاءُ، وَانْقَطَعَ الرَّجاءُ، وَضاقَتِ الاَْرْضُ، وَمُنِعَتِ السَّماءُ، وَاَنْتَ الْمُسْتَعانُ، وَاِلَيْكَ الْمُشْتَكى، وَعَلَيْكَ الْمُعَوَّلُ فِي الشِدَّةِ وَالرَّخاءِ، اَللّـهُمَّ صَلِّ عَلى مُحَمَّد وَآلِ مُحَمَّد، اُولِي الاَْمْرِ الَّذينَ فَرَضْتَ عَلَيْنا طاعَتَهُمْ، وَعَرَّفْتَنا بِذلِكَ مَنْزِلَتَهُمْ، فَفَرِّجْ عَنا بِحقِّهِمْ فَرَجاً عاجِلاً قَريباً كَلَمْحِ الْبَصَرِ اَوْ هُوَ اَقْرَبُ، يا مُحَمَّدُ يا عَلِيُّ يا عَلِيُّ يا مُحَمَّدُ اِكْفِياني فَاِنَّكُما كافِيانِ، وَانْصُراني فَاِنَّكُما ناصِرانِ، يا مَوْلانا يا صاحِبَ الزَّمانِ، الْغَوْثَ الْغَوْثَ الْغَوْثَ، اَدْرِكْني اَدْرِكْني اَدْرِكْني، السّاعَةَ السّاعَةَ السّاعَةَ، الْعَجَلَ الْعَجَلَ الْعَجَلَ، يا اَرْحَمَ الرّاحِمينَ، بِحقِّ مُحَمَّد وَآلِهِ الطّاهِرينَ.',
    translation: 'O my God, the calamity has escalated, the hidden has been revealed, the veil has been lifted, the hope has been cut off, the earth has become narrow...',
    transliteration: 'Ilahi azumal balaa-o wa barihal khafaa-o wa kashafal ghitaa-o wan qata\'ar rajaa-o wa dhaaqatil ardhu wa moni\'atis samaa-o...',
    urduTranslation: 'اے میرے معبود! مصیبت بڑھ گئی ہے، اور پوشیدہ ظاہر ہو گیا ہے، اور پردہ اٹھ گیا ہے، اور امید ٹوٹ گئی ہے...',
    urduTransliteration: 'Ilahi azumal balaa-o wa barihal khafaa-o wa kashafal ghitaa-o wan qata\'ar rajaa-o...',
    audio: 'https://www.duas.org/audio/Dua_Faraj.mp3',
    historicalContext: 'Recited to seek the expedited reappearance of the 12th Imam during times of hardship and occultation.',
    biography: 'Imam Muhammad al-Mahdi (atfs) is the son of Imam Hasan al-Askari (as). He is currently in the Great Occultation and will return to fill the world with justice.'
  },
  {
    id: 'fatima',
    title: 'Ziyarat Lady Fatima (sa)',
    category: 'Madina',
    arabic: 'يَا مُمْتَحَنَةُ امْتَحَنَكِ اللَّهُ الَّذِي خَلَقَكِ قَبْلَ أَنْ يَخْلُقَكِ فَوَجَدَكِ لِمَا امْتَحَنَكِ صَابِرَةً وَ زَعَمْنَا أَنَّا لَكِ أَوْلِيَاءُ وَ مُصَدِّقُونَ وَ صَابِرُونَ لِكُلِّ مَا أَتَانَا بِهِ أَبُوكِ صَلَّى اللَّهُ عَلَيْهِ وَ آلِهِ وَ أَتَى بِهِ وَصِيُّهُ فَإِنَّا نَسْأَلُكِ إِنْ كُنَّا صَدَّقْنَاكِ إِلا أَلْحَقْتِنَا بِتَصْدِيقِنَا لَهُمَا لِنُبَشِّرَ أَنْفُسَنَا بِأَنَّا قَدْ طَهُرْنَا بِوِلايَتِكِ.',
    translation: 'O you who were tested, Allah who created you tested you before He created you, and He found you patient in the test...',
    transliteration: 'Ya mumtahanatu imtahanakillahu alladhi khalaqaki qabla an yakhluqaki fawajadaki limamtahanaki saabirah...',
    urduTranslation: 'اے وہ جس کا امتحان لیا گیا، اللہ نے جس نے تجھے پیدا کیا، تجھے پیدا کرنے سے پہلے تیرا امتحان لیا، اور تجھے اس امتحان میں صبر کرنے والی پایا...',
    audio: 'https://www.duas.org/audio/Ziyarat_Syeda_Fatima.mp3',
    historicalContext: 'A profound salutation to the Mistress of the Women of the Worlds, often recited on her birth or martyrdom anniversaries.',
    biography: 'Fatima az-Zahra (sa) is the daughter of the Prophet (saws), wife of Imam Ali (as), and mother of Imams Hasan and Hussain (as).'
  },
  {
    id: 'waritha',
    title: 'Ziyarat Waritha',
    category: 'Karbala',
    arabic: 'اَلسَّلامُ عَلَيْكَ يا وارِثَ آدَمَ صَفْوَةِ اللهِ، اَلسَّلامُ عَلَيْكَ يا وارِثَ نُوح نَبِيِّ اللهِ، اَلسَّلامُ عَلَيْكَ يا وارِثَ اِبْراهيمَ خَليلِ اللهِ، اَلسَّلامُ عَلَيْكَ يا وارِثَ مُوسى كَليمِ اللهِ، اَلسَّلامُ عَلَيْكَ يا وارِثَ عيسى رُوحِ اللهِ، اَلسَّلامُ عَلَيْكَ يا وارِثَ مُحَمَّد حَبيبِ اللهِ، اَلسَّلامُ عَلَيْكَ يا وارِثَ اَميرِ الْمُؤْمِنينَ عَلَيْهِ السَّلامُ، اَلسَّلامُ عَلَيْكَ يَا بْنَ مُحَمَّد الْمُصْطَفى، اَلسَّلامُ عَلَيْكَ يَا بْنَ عَلِيٍّ الْمُرْتَضى، اَلسَّلامُ عَلَيْكَ يَا بْنَ فاطِمَةَ الزَّهْراءِ، اَلسَّلامُ عَلَيْكَ يَا بْنَ خَديجَةَ الْكُبْراءِ، اَلسَّلامُ عَلَيْكَ يا ثارَ اللهِ وَابْنَ ثارِهِ وَالْوِتْرَ الْمَوْتُورَ، اَشْهَدُ اَنَّكَ قَدْ اَقَمْتَ الصَّلاةَ وَآتَيْتَ الزَّكاةَ وَاَمَرْتَ بِالْمَعْرُوفِ وَنَهَيْتَ عَنِ الْمُنْكَرِ وَاَطَعْتَ اللهَ وَرَسُولَهُ حَتّى اَتاكَ الْيَقينُ.',
    translation: 'Peace be upon you, O inheritor of Adam, the chosen of Allah. Peace be upon you, O inheritor of Noah, the prophet of Allah, Peace be upon you, O inheritor of Abraham, the friend of Allah...',
    urduTranslation: 'سلام ہو آپ پر اے وارث آدم، اللہ کے برگزیدہ۔ سلام ہو آپ پر اے وارث نوح، اللہ کے نبی۔ سلام ہو آپ پر اے وارث ابراہیم، اللہ کے خلیل...',
    transliteration: `As-salaamo alaika yaa waaritha Aadam-a-sifwatillah
As-salaamo alaika yaa waaritha Noohin nabiyillah
As-salaamo alaika yaa waaritha Ibrahim-a-khaleelillah
As-salaamo alaika yaa waaritha Moosa kaleemillah
As-salaamo alaika yaa waaritha Iss-a-roohillah
As-salaamo alaika yaa waaritha Mohammadin Habeebillah
As-salaamo alaika yaa waaritha Ameeril Mo'meneen-a-waleeyillah
As-salaamo alaika yabna Mohammad-e-nil Mustafa
As-salaamo alaika yabna Ali-ye-nil Murtuza
As-salaamo alaika yabna Faat-e-mat-uz Zahra
As-salaamo alaika yabna Khatija-tul-Qubra
As-salaamo alaika yaa tharal-laahe wabna tharehi wal witral mautoor
Ash-hado annaka qad akamtas swalaata wa aataitaz zakaata wa amarta bil maaruf wa nahaita anil munkar
Wa ata' tal-laaha wa Rasoolahoo hatta atakal yaqeen
Fa-la'nal-laaho ummatan qatalatka
Fa-la'nal-laaho ummatan zala mat ka
Wa la'nal-laaho ummatan same'at be zha-leka fara-zeyat beh
Yaa maulaaya yaa Abaa Abdillah
Ash-hado annaka kunta nooran fil ashlaabish shaam-e khate
wal ar-haamil motah'harate
lam tonaj-jiskal jaaheliyato be-anjaa sehaa
wa-lam tulbis ka min mud-laheem-maate theya behaa
Wa ash hado an-naka min duaaaaaa-e-mid-deen wa ar-kaanil mo'meneen
Wa ash hado an-nakal Imaamul bar-rut-taqi-yur-razi-yul-zaki-yul haadi-yul Mahdiyo
Wa ash-hado an-nal a'im-mate min wuldeka kalematut taqwa
wa a'laamul hoda
wal urwatul wusqaa
wal-hujjato alaa ahlid-duniyaa
wa ush hedul-laaha
wa malaaaaa-e-katahoo
wa ambeyaaaaaa-a-hoo
wa rosolahoo
Anni bekum mo'menun
wa be-eya-bekum mukenoon be sharaaye deeni
wa khawateem-e amali
wa qalbi le-qalbekum silmun
wa amri le amrekum
mut-tabe-un salwaatullahe alaikum
wa-alaa ar-waah-e-kum
wa alaa aj-saa-dekum
wa alaa aj-saa-mekum
wa alaa sha-he-dekum
wa alaa gaaaaaaa-e-bekum
wa alaa zaah-e-rekum
wa alaa baa-te-nekum.`,
    audio: 'https://www.duas.org/audio/Ziyarat_Waritha.mp3',
    historicalContext: 'A beautiful salutation to Imam Hussain (as) that traces the lineage of divine leadership from Adam (as) through the major prophets to the Ahlulbayt (as). It is highly recommended to be recited when visiting the shrine of Imam Hussain (as).',
    biography: 'Imam Hussain (as) is the inheritor of the knowledge and virtues of all the previous prophets, representing the continuation of the divine message.'
  }
];

export const DUA_CATEGORIES = [
  { id: 'All', name: 'All Supplications', icon: 'fa-hands-praying' },
  { id: 'Popular', name: 'Popular Duas', icon: 'fa-star' },
  { id: 'Ziyarats', name: 'Ziyarats', icon: 'fa-kaaba' },
  { id: 'Daily', name: 'Daily Duas', icon: 'fa-calendar-day' },
  { id: 'Weekly', name: 'Weekly Duas', icon: 'fa-calendar-week' },
  { id: 'Ramadan', name: 'Ramadan Duas', icon: 'fa-moon' },
  { id: 'Protection', name: 'Protection & Healing', icon: 'fa-shield-halved' },
  { id: 'Hardships', name: 'Relief from Hardships', icon: 'fa-cloud-sun' },
  { id: 'Sahifa', name: 'Sahifa Sajjadiya', icon: 'fa-book-open' }
];

export const POPULAR_DUAS: Dua[] = [
  {
    id: 'kumail',
    title: 'Dua Kumayl',
    category: 'Weekly',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ...',
    translation: 'O Allah, I ask You by Your mercy...',
    transliteration: 'Allahumma inni as\'aluka bi-rahmatika...',
    urduTranslation: 'اے اللہ! میں تجھ سے تیری اس رحمت کے واسطے سے سوال کرتا ہوں جو ہر چیز پر محیط ہے...',
    urduTransliteration: 'Allahumma inni as\'aluka bi-rahmatikal lati wasi\'at kulla shay...',
    audio: 'https://www.duas.org/audio/Dua_Kumayl.mp3',
    historicalContext: 'Taught by Imam Ali (as) to his companion Kumayl ibn Ziyad. It is recommended for every Thursday night.',
    biography: 'Imam Ali (as) is the first Imam, the successor of the Prophet (saws), and the gateway to the city of knowledge.',
    tafsir: 'Dua Kumayl is a masterpiece of spiritual intimacy and repentance. It explores the depths of human fragility and the infinite expanse of Divine Mercy. The prayer begins by invoking Allah\'s mercy that encompasses all things, setting a tone of hope. It guides the soul through a process of self-reflection, acknowledging sins while simultaneously affirming the absolute belief in Allah\'s forgiveness. The phrase "O He whose Name is a remedy and whose remembrance is a cure" encapsulates the healing power of this supplication.'
  },
  {
    id: 'ahad',
    title: 'Dua Ahad',
    category: 'Daily',
    arabic: 'اَللَّهُمَّ رَبَّ النُّورِ الْعَظيمِ...',
    translation: 'O Allah, Lord of the Great Light...',
    transliteration: 'Allahumma rabba an-nuri al-azim...',
    urduTranslation: 'اے اللہ! اے نور عظیم کے پروردگار...',
    urduTransliteration: 'Allahumma rabba an-noorul azeem...',
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
    category: 'Weekly',
    arabic: 'اَلْحَمْدُ للهِ رَبِّ الْعالَمينَ وَصَلَّى اللهُ عَلى سَيِّدِنا مُحَمَّد نَبِيِّهِ وَآلِهِ وَسَلَّمَ تَسْليماً...',
    translation: 'Praise be to Allah, the Lord of the worlds...',
    urduTranslation: 'تمام تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے...',
    transliteration: 'Alhamdu lillahi rabbil alamin...',
    audio: 'https://www.duas.org/audio/Dua_Nudbah.mp3',
    historicalContext: 'The "Lamentation" prayer, recited on Friday mornings to express longing for Imam Mahdi (atfs).',
  },
  {
    id: 'mashlool',
    title: 'Dua Mashlool',
    category: 'Protection',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِاسْمِكَ بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ يَا ذَا الْجَلالِ وَالإِكْرَامِ...',
    translation: 'O Allah, I beseech You by Your Name, in the Name of Allah, the All-beneficent, the All-merciful...',
    urduTranslation: 'اے اللہ! میں تجھ سے تیرے نام کے واسطے سے سوال کرتا ہوں، اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے...',
    audio: 'https://www.duas.org/audio/Dua_Mashlool.mp3',
    benefits: 'Known as the "Supplication of the Youth Struck by Sin," it is recited for healing and relief from severe distress.',
    historicalContext: 'Taught by Imam Ali (as) to a young man who was paralyzed due to his father\'s curse.'
  },
  {
    id: 'yastasheer',
    title: 'Dua Yastasheer',
    category: 'Hardships',
    arabic: 'الْحَمْدُ للهِ الَّذِي لا إِلَهَ إِلا هُوَ الْمَلِكُ الْحَقُّ الْمُبِينُ...',
    translation: 'Praise be to Allah, there is no god but He, the King, the Truth, the Manifest...',
    urduTranslation: 'تمام تعریفیں اللہ کے لیے ہیں جس کے سوا کوئی معبود نہیں، جو بادشاہ، حق اور ظاہر کرنے والا ہے...',
    audio: 'https://www.duas.org/audio/Dua_Yastasheer.mp3',
    benefits: 'Recited for the fulfillment of desires and protection from enemies.',
    historicalContext: 'Taught by the Holy Prophet (saws) to Imam Ali (as).'
  },
  {
    id: 'mujeer',
    title: 'Dua Mujeer',
    category: 'Ramadan',
    arabic: 'سُبْحَانَكَ يَا اللَّهُ تَعَالَيْتَ يَا رَحْمَانُ أَجِرْنَا مِنَ النَّارِ يَا مُجِيرُ...',
    translation: 'Glory be to You, O Allah! Exalted be You, O Beneficent! Deliver us from the Fire, O Granter of Refuge!',
    urduTranslation: 'پاک ہے تیری ذات اے اللہ! بلند ہے تیری شان اے رحمان! ہمیں آگ سے بچا لے اے پناہ دینے والے!',
    audio: 'https://www.duas.org/audio/Dua_Mujeer.mp3',
    historicalContext: 'Brought by Archangel Gabriel to the Prophet (saws) while he was praying in Maqam Ibrahim. Recited on the 13th, 14th, and 15th of Ramadan.'
  },
  {
    id: 'sabah',
    title: 'Dua Sabah',
    category: 'Daily',
    arabic: 'اللَّهُمَّ يَا مَنْ دَلَعَ لِسَانَ الصَّبَاحِ بِنُطْقِ تَبَلُّجِهِ...',
    translation: 'O Allah, O He who extended the tongue of morning in the speech of its dawning...',
    urduTranslation: 'اے اللہ! اے وہ جس نے صبح کی زبان کو اس کے روشن ہونے کی گویائی کے ساتھ دراز کیا...',
    audio: 'https://www.duas.org/audio/Dua_Sabah.mp3',
    historicalContext: 'A morning supplication written by Imam Ali (as), famous for its eloquent Arabic and profound philosophical meanings.'
  },
  {
    id: 'parents',
    title: 'Dua for Parents',
    category: 'Sahifa',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ عَبْدِكَ وَرَسُولِكَ وَأَهْلِ بَيْتِهِ الطَّاهِرِينَ...',
    translation: 'O Allah, bless Muhammad, Your slave and Your messenger, and his household, the pure...',
    urduTranslation: 'اے اللہ! محمد پر درود بھیج جو تیرے بندے اور تیرے رسول ہیں اور ان کے پاکیزہ اہل بیت پر...',
    audio: 'https://www.duas.org/audio/Sahifa_Dua_24.mp3',
    historicalContext: 'The 24th supplication from Sahifa Sajjadiya of Imam Zayn al-Abidin (as).'
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
    steps: [
      {
        text: 'Recite Ziyarat of Holy Prophet (sawa)',
        reference: {
          text: 'Whoever visits me after my death, it is as if he visited me during my life.',
          arabic: 'مَنْ زَارَنِي بَعْدَ مَوْتِي كَانَ كَمَنْ زَارَنِي فِي حَيَاتِي',
          source: 'Bihar al-Anwar',
          audio: 'https://www.duas.org/audio/Ziyarat_Prophet.mp3'
        }
      },
      {
        text: 'Recite Surah al-Fath',
        reference: {
          text: 'Indeed, We have granted you a clear triumph.',
          arabic: 'إِنَّا فَتَحْنَا لَكَ فَتْحًا مُبِينًا',
          source: 'Quran 48:1',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/048001.mp3',
          translation: 'Verily We have granted thee a manifest Victory.'
        }
      },
      {
        text: '100x: Ya Rabb al-Alameen',
        reference: {
          text: 'Praise be to Allah, Lord of the worlds.',
          arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
          source: 'Quran 1:2',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/001002.mp3'
        }
      }
    ],
  },
  'Sunday': {
    id: 'sun',
    title: 'Sunday Amaal',
    description: 'Dedicated to Imam Ali (as) and Bibi Fatima (sa).',
    steps: [
      {
        text: 'Recite Ziyarat of Imam Ali (as)',
        reference: {
          text: 'I am the city of knowledge and Ali is its gate.',
          arabic: 'أَنَا مَدِينَةُ الْعِلْمِ وَعَلِيٌّ بَابُهَا',
          source: 'Prophet Muhammad (saws)',
          audio: 'https://www.duas.org/audio/Ziyarat_Imam_Ali.mp3'
        }
      },
      {
        text: 'Recite Ziyarat of Sayyida Fatima (sa)',
        reference: {
          text: 'Fatima is a part of me; whoever angers her angers me.',
          arabic: 'فَاطِمَةُ بَضْعَةٌ مِنِّي فَمَنْ أَغْضَبَهَا أَغْضَبَنِي',
          source: 'Prophet Muhammad (saws)',
          audio: 'https://www.duas.org/audio/Ziyarat_Syeda_Fatima.mp3'
        }
      },
      {
        text: '100x: Ya Dhal Jalali wal Ikram',
        reference: {
          text: 'And there will remain the Face of your Lord, Owner of Majesty and Honor.',
          arabic: 'وَيَبْقَىٰ وَجْهُ رَبِّكَ ذُو الْجَلَالِ وَالْإِكْرَامِ',
          source: 'Quran 55:27',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/055027.mp3'
        }
      }
    ],
  },
  'Monday': {
    id: 'mon',
    title: 'Monday Amaal',
    description: 'Dedicated to Imam Hasan (as) and Imam Hussain (as).',
    steps: [
      {
        text: 'Ziyarat of Imam Hasan (as)',
        reference: {
          text: 'These two sons of mine are Imams, whether they stand up or sit down.',
          arabic: 'هذانِ ابنايَ إمامانِ قاما أو قَعَدا',
          source: 'Prophet Muhammad (saws)',
          audio: 'https://www.duas.org/audio/Ziyarat_Imam_Hasan.mp3'
        }
      },
      {
        text: 'Ziyarat of Imam Hussain (as)',
        reference: {
          text: 'Hussain is from me and I am from Hussain.',
          arabic: 'حُسَيْنٌ مِنِّي وَأَنَا مِنْ حُسَيْنٍ',
          source: 'Prophet Muhammad (saws)',
          audio: 'https://www.duas.org/audio/Ziyarat_Imam_Hussain.mp3'
        }
      },
      {
        text: '100x: Ya Qadhiyal Hajat',
        reference: {
          text: 'And your Lord says, "Call upon Me; I will respond to you."',
          arabic: 'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ',
          source: 'Quran 40:60',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/040060.mp3'
        }
      }
    ],
  },
  'Tuesday': {
    id: 'tue',
    title: 'Tuesday Amaal',
    description: 'Dedicated to Imam Sajjad (as), Baqir (as), and Sadiq (as).',
    steps: [
      {
        text: 'Ziyarat of the Three Imams',
        reference: {
          text: 'Allah only intends to remove from you the impurity [of sin], O people of the [Prophet\'s] household, and to purify you with [extensive] purification.',
          arabic: 'إِنَّمَا يُرِيدُ اللَّهُ لِيُذْهِبَ عَنكُمُ الرِّجْسَ أَهْلَ الْبَيْتِ وَيُطَهِّرَكُمْ تَطْهِيرًا',
          source: 'Quran 33:33',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/033033.mp3'
        }
      },
      {
        text: 'Dua Tawassul',
        reference: {
          text: 'O you who have believed, fear Allah and seek the means [of nearness] to Him.',
          arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَابْتَغُوا إِلَيْهِ الْوَسِيلَةَ',
          source: 'Quran 5:35',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/005035.mp3'
        }
      },
      {
        text: '100x: Ya Arhamar Rahimeen',
        reference: {
          text: 'But Allah is the best guardian, and He is the most merciful of the merciful.',
          arabic: 'فَاللَّهُ خَيْرٌ حَافِظًا ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ',
          source: 'Quran 12:64',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/012064.mp3'
        }
      }
    ],
  },
  'Wednesday': {
    id: 'wed',
    title: 'Wednesday Amaal',
    description: 'Dedicated to Imam Kadhim (as), Reza (as), Jawad (as), and Hadi (as).',
    steps: [
      {
        text: 'Ziyarat of the Four Imams',
        reference: {
          text: 'Say, [O Muhammad], "I do not ask you for this message any payment [only] that you love my kindred."',
          arabic: 'قُل لَّا أَسْأَلُكُمْ عَلَيْهِ أَجْرًا إِلَّا الْمَوَدَّةَ فِي الْقُرْبَىٰ',
          source: 'Quran 42:23',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/042023.mp3'
        }
      },
      {
        text: '100x: Ya Hayyu Ya Qayyum',
        reference: {
          text: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence.',
          arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
          source: 'Quran 2:255',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/002255.mp3'
        }
      }
    ],
  },
  'Thursday': {
    id: 'thu',
    title: 'Thursday Amaal',
    description: 'Dedicated to Imam Hassan al-Askari (as).',
    steps: [
      {
        text: 'Recite Dua Kumayl at night',
        reference: {
          text: 'And when My servants ask you, [O Muhammad], concerning Me - indeed I am near.',
          arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ',
          source: 'Quran 2:186',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/002186.mp3'
        }
      },
      {
        text: 'Ziyarat of Imam Askari (as)',
        reference: {
          text: 'The scholars are the inheritors of the Prophets.',
          arabic: 'الْعُلَمَاءُ وَرَثَةُ الْأَنْبِيَاءِ',
          source: 'Prophet Muhammad (saws)',
          audio: 'https://www.duas.org/audio/Ziyarat_Imam_Askari.mp3'
        }
      },
      {
        text: '100x: La Ilaha Illallah al-Malikul Haqqul Mubeen',
        reference: {
          text: 'So exalted be Allah, the Sovereign, the Truth; there is no deity except Him, Lord of the Noble Throne.',
          arabic: 'فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ ۖ لَا إِلَٰهَ إِلَّا هُوَ رَبُّ الْعَرْشِ الْكَرِيمِ',
          source: 'Quran 23:116',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/023116.mp3'
        }
      }
    ],
  },
  'Friday': {
    id: 'fri',
    title: 'Friday Amaal',
    description: 'Master of Days, dedicated to Imam Mahdi (atfs).',
    steps: [
      {
        text: 'Ghusl-e-Jummah',
        reference: {
          text: 'Indeed, Allah loves those who are constantly repentant and loves those who purify themselves.',
          arabic: 'إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ',
          source: 'Quran 2:222',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/002222.mp3'
        }
      },
      {
        text: 'Dua Nudbah',
        reference: {
          text: 'And We wanted to confer favor upon those who were oppressed in the land and make them leaders and make them inheritors.',
          arabic: 'وَنُرِيدُ أَن نَّمُنَّ عَلَى الَّذِينَ اسْتُضْعِفُوا فِي الْأَرْضِ وَنَجْعَلَهُمْ أَئِمَّةً وَنَجْعَلَهُمُ الْوَارِثِينَ',
          source: 'Quran 28:5',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/028005.mp3'
        }
      },
      {
        text: 'Ziyarat of Imam Mahdi (atfs)',
        reference: {
          text: 'The best worship is waiting for the relief (reappearance).',
          arabic: 'أَفْضَلُ الْعِبَادَةِ انْتِظَارُ الْفَرَجِ',
          source: 'Prophet Muhammad (saws)',
          audio: 'https://www.duas.org/audio/Ziyarat_Imam_Mahdi.mp3'
        }
      },
      {
        text: '100x: Allahumma Salle Ala Muhammadin wa Aali Muhammad',
        reference: {
          text: 'Indeed, Allah and His angels bless the Prophet. O you who have believed, ask [Allah to confer] blessing upon him and ask [Allah to grant him] peace.',
          arabic: 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا',
          source: 'Quran 33:56',
          audio: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_128kbps/033056.mp3'
        }
      }
    ],
  }
};

export const DAILY_DUAS: Dua[] = [
  {
    id: 'sat-dua',
    title: 'Saturday Ziyarat',
    category: 'Daily',
    arabic: 'اَلسَّلامُ عَلَيْكَ يا رَسُولَ اللهِ، اَلسَّلامُ عَلَيْكَ يا نَبِيَّ اللهِ...',
    translation: 'Peace be upon you, O Messenger of Allah...',
    urduTranslation: 'سلام ہو آپ پر اے اللہ کے رسول، سلام ہو آپ پر اے اللہ کے نبی...',
    audio: 'https://www.duas.org/audio/Ziyarat_Prophet.mp3'
  },
  {
    id: 'sun-dua',
    title: 'Sunday Ziyarat',
    category: 'Daily',
    arabic: 'اَلسَّلامُ عَلَيْكَ يا اَميرَ الْمُؤْمِنينَ، اَلسَّلامُ عَلَيْكِ يا فاطِمَةُ الزَّهْراءُ...',
    translation: 'Peace be upon you, O Commander of the Faithful...',
    urduTranslation: 'سلام ہو آپ پر اے امیر المومنین، سلام ہو آپ پر اے فاطمہ زہرا...',
    audio: 'https://www.duas.org/audio/Ziyarat_Imam_Ali.mp3'
  },
  {
    id: 'mon-dua',
    title: 'Monday Ziyarat',
    category: 'Daily',
    arabic: 'اَلسَّلامُ عَلَيْكُمَا يا اِمامَيِ الْهُدى، اَلسَّلامُ عَلَيْكُمَا يا اَبَا مُحَمَّد وَيا اَبَا عَبْدِ اللهِ...',
    translation: 'Peace be upon you both, O Imams of guidance...',
    urduTranslation: 'سلام ہو آپ دونوں پر اے ہدایت کے امامو، سلام ہو آپ دونوں پر اے ابا محمد اور اے ابا عبداللہ...',
    audio: 'https://www.duas.org/audio/Ziyarat_Imam_Hasan.mp3'
  },
  {
    id: 'tue-dua',
    title: 'Tuesday Ziyarat',
    category: 'Daily',
    arabic: 'اَلسَّلامُ عَلَيْكُمْ يا خُزّانَ عِلْمِ اللهِ، اَلسَّلامُ عَلَيْكُمْ يا تراجِمَةَ وَحْيِ اللهِ...',
    translation: 'Peace be upon you, O treasurers of the knowledge of Allah...',
    urduTranslation: 'سلام ہو آپ پر اے اللہ کے علم کے خزانچیوں، سلام ہو آپ پر اے اللہ کی وحی کے ترجمانو...',
    audio: 'https://www.duas.org/audio/Ziyarat_Imam_Sajjad.mp3'
  },
  {
    id: 'wed-dua',
    title: 'Wednesday Ziyarat',
    category: 'Daily',
    arabic: 'اَلسَّلامُ عَلَيْكُمْ يا اَوْلِياءَ اللهِ، اَلسَّلامُ عَلَيْكُمْ يا حُجَجَ اللهِ...',
    translation: 'Peace be upon you, O friends of Allah...',
    urduTranslation: 'سلام ہو آپ پر اے اللہ کے دوستو، سلام ہو آپ پر اے اللہ کی حجتوں...',
    audio: 'https://www.duas.org/audio/Ziyarat_Imam_Kadhim.mp3'
  },
  {
    id: 'thu-dua',
    title: 'Thursday Ziyarat',
    category: 'Daily',
    arabic: 'اَلسَّلامُ عَلَيْكَ يا اَبَا مُحَمَّد الْحَسَنَ بْنَ عَلِيٍّ الزَّكِيَّ...',
    translation: 'Peace be upon you, O Abu Muhammad al-Hasan ibn Ali...',
    urduTranslation: 'سلام ہو آپ پر اے ابا محمد حسن بن علی الزکی...',
    audio: 'https://www.duas.org/audio/Ziyarat_Imam_Askari.mp3'
  },
  {
    id: 'fri-dua',
    title: 'Friday Ziyarat',
    category: 'Daily',
    arabic: 'اَلسَّلامُ عَلَيْكَ يا حُجَّةَ اللهِ في اَرْضِهِ، اَلسَّلامُ عَلَيْكَ يا عَيْنَ اللهِ في خَلْقِهِ...',
    translation: 'Peace be upon you, O Hujjat of Allah in His earth...',
    urduTranslation: 'سلام ہو آپ پر اے اللہ کی زمین میں اس کی حجت، سلام ہو آپ پر اے اس کی مخلوق میں اللہ کی آنکھ...',
    audio: 'https://www.duas.org/audio/Ziyarat_Imam_Mahdi.mp3'
  }
];

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
    id: 'mafatih',
    name: 'Mafatih al-Jinan',
    url: 'https://mafatih.net',
    icon: 'fa-key',
    description: 'Online access to the complete Mafatih al-Jinan by Sheikh Abbas Qummi.'
  },
  {
    id: 'al-islam',
    name: 'Al-Islam.org',
    url: 'https://www.al-islam.org',
    icon: 'fa-book',
    description: 'The largest online library of Shia Islamic resources in multiple languages.'
  },
  {
    id: 'duas-org',
    name: 'Duas.org',
    url: 'https://www.duas.org',
    icon: 'fa-hands-praying',
    description: 'Comprehensive collection of Duas, Ziyarats, and Amaal for all occasions.'
  }
];

export const SHIA_KNOWLEDGE_BASE: ShiaKnowledge[] = [
  {
    id: 'usul-al-din',
    title: 'Usul al-Din (Roots of Religion)',
    category: 'Theology',
    content: 'The five fundamental principles of Shia Islam that every believer must understand and accept through reason.',
    subsections: [
      { title: 'Tawhid (Monotheism)', content: 'The absolute oneness of Allah. He is unique, without partner, and beyond human comprehension.' },
      { title: 'Adl (Justice)', content: 'The belief that Allah is inherently Just. He does not oppress and rewards or punishes based on human actions.' },
      { title: 'Nubuwwah (Prophethood)', content: 'The belief in the 124,000 prophets sent by Allah, ending with Prophet Muhammad (saws).' },
      { title: 'Imamah (Leadership)', content: 'The belief in the divinely appointed leaders (Imams) after the Prophet (saws) to guide humanity.' },
      { title: 'Ma\'ad (Resurrection)', content: 'The belief in the Day of Judgment, where every soul will be held accountable for its deeds.' }
    ]
  },
  {
    id: 'furu-al-din',
    title: 'Furu al-Din (Branches of Religion)',
    category: 'Practices',
    content: 'The ten essential practices of Shia Islam that govern the daily life and social responsibilities of a Muslim.',
    subsections: [
      { title: 'Salat (Prayer)', content: 'The five daily obligatory prayers.' },
      { title: 'Sawm (Fasting)', content: 'Fasting during the holy month of Ramadan.' },
      { title: 'Zakat (Almsgiving)', content: 'A specific tax on certain types of wealth to help the needy.' },
      { title: 'Khums (The Fifth)', content: 'A 20% tax on annual surplus income, divided between the descendants of the Prophet and the needy.' },
      { title: 'Hajj (Pilgrimage)', content: 'The pilgrimage to the Kaaba in Makkah, obligatory once in a lifetime for those who are able.' },
      { title: 'Jihad (Struggle)', content: 'The struggle in the way of Allah, both internally (Greater Jihad) and externally (Lesser Jihad).' },
      { title: 'Amr bil Ma\'ruf (Enjoining Good)', content: 'Encouraging others to do good deeds.' },
      { title: 'Nahi anil Munkar (Forbidding Evil)', content: 'Discouraging others from committing sins.' },
      { title: 'Tawalla (Love for Ahlulbayt)', content: 'Loving and following the Prophet and his purified household.' },
      { title: 'Tabarra (Dissociation from Enemies)', content: 'Dissociating from the enemies of the Prophet and his household.' }
    ]
  },
  {
    id: 'the-14-infallibles',
    title: 'The 14 Infallibles (Ma\'sumeen)',
    category: 'Figures',
    content: 'The Prophet Muhammad (saws), his daughter Lady Fatima (sa), and the Twelve Imams (as) who are divinely protected from sin and error.',
    subsections: [
      { 
        title: 'Prophet Muhammad (saws)', 
        content: 'The final messenger of Allah and the seal of the prophets. Born in Makkah in 570 AD, he received the first revelation at age 40. His life is the ultimate model of morality and justice. He established the foundation of Islam and designated his successor at Ghadir Khumm.' 
      },
      { 
        title: 'Lady Fatima az-Zahra (sa)', 
        content: 'The daughter of the Prophet and the leader of the women of paradise. She is the link between prophethood and imamate. Her sermons, especially the Fadak sermon, are masterpieces of eloquence and defense of truth.' 
      },
      { 
        title: 'Imam Ali ibn Abi Talib (as)', 
        content: 'The first Imam and the Commander of the Faithful. Born inside the Kaaba, he was the first to accept Islam. Known for his unmatched bravery, wisdom, and justice. His teachings are preserved in Nahj al-Balagha.' 
      },
      { 
        title: 'Imam Hasan ibn Ali (as)', 
        content: 'The second Imam, known for his patience and the peace treaty with Muawiya which preserved the blood of Muslims and exposed the true nature of the Umayyad rule.' 
      },
      { 
        title: 'Imam Hussain ibn Ali (as)', 
        content: 'The third Imam and the Master of Martyrs. His stand in Karbala against the tyrant Yazid saved Islam from distortion. His sacrifice is remembered annually as a symbol of resistance against oppression.' 
      },
      { 
        title: 'Imam Ali ibn al-Hussain (as)', 
        content: 'The fourth Imam, known as Zayn al-Abidin. He preserved the message of Karbala through prayers and supplications, collected in Sahifa Sajjadiya.' 
      },
      { 
        title: 'Imam Muhammad ibn Ali (as)', 
        content: 'The fifth Imam, al-Baqir. He established the foundations of Shia jurisprudence and opened the doors of knowledge during a period of political transition.' 
      },
      { 
        title: 'Imam Ja\'far ibn Muhammad (as)', 
        content: 'The sixth Imam, as-Sadiq. He founded the Ja\'fari school of law and taught thousands of students in various sciences, including Jabir ibn Hayyan.' 
      },
      { 
        title: 'Imam Musa ibn Ja\'far (as)', 
        content: 'The seventh Imam, al-Kadhim. He spent many years in prison for his resistance against the Abbasid caliphs, known for his extreme patience and restraint of anger.' 
      },
      { 
        title: 'Imam Ali ibn Musa (as)', 
        content: 'The eighth Imam, ar-Reza. He was forced to move to Khorasan as the heir apparent but used the opportunity to spread the teachings of Ahlulbayt across the eastern Islamic world.' 
      },
      { 
        title: 'Imam Muhammad ibn Ali (as)', 
        content: 'The ninth Imam, al-Jawad. He became Imam at a young age, demonstrating divine knowledge through debates with the most learned scholars of his time.' 
      },
      { 
        title: 'Imam Ali ibn Muhammad (as)', 
        content: 'The tenth Imam, al-Hadi. He guided the community during a time of intense surveillance and established the network of representatives (Wikala).' 
      },
      { 
        title: 'Imam Hasan ibn Ali (as)', 
        content: 'The eleventh Imam, al-Askari. He lived mostly under house arrest in Samarra, preparing the community for the occultation of his son.' 
      },
      { 
        title: 'Imam Muhammad ibn al-Hasan (atfs)', 
        content: 'The twelfth Imam, the Mahdi. He is the living Hujjah (Proof) of Allah, currently in occultation. He will reappear to establish a global government of justice and peace.' 
      }
    ]
  },
  {
    id: 'significant-companions',
    title: 'Significant Companions',
    category: 'Figures',
    content: 'Companions of the Prophet (saws) and the Imams (as) who remained steadfast on the path of truth and the Wilayah of Ahlulbayt.',
    subsections: [
      { 
        title: 'Salman al-Farsi', 
        content: 'The seeker of truth who traveled from Persia to find the Prophet. The Prophet said of him: "Salman is from us, the Ahlulbayt." He was known for his immense knowledge and piety.' 
      },
      { 
        title: 'Abu Dharr al-Ghifari', 
        content: 'The truthful companion who never feared the blame of anyone in speaking the truth. He was exiled for his outspoken criticism of the corruption in the Umayyad administration.' 
      },
      { 
        title: 'Miqdad ibn Aswad', 
        content: 'One of the four pillars of the early Shia community, known for his unwavering loyalty to Imam Ali (as) after the Prophet\'s passing.' 
      },
      { 
        title: 'Ammar ibn Yasir', 
        content: 'The son of the first martyrs of Islam. The Prophet predicted he would be killed by a "rebellious group." He was martyred in Siffin fighting alongside Imam Ali (as).' 
      },
      { 
        title: 'Malik al-Ashtar', 
        content: 'The loyal commander of Imam Ali (as)\'s army. Imam Ali said of him: "Malik was to me as I was to the Messenger of Allah."' 
      },
      {
        title: 'Kumayl ibn Ziyad',
        content: 'A loyal confidant of Imam Ali (as) and a repository of his deeper spiritual secrets. He is famously known for the supplication (Dua Kumayl) taught to him by the Imam. He was martyred for his devotion to the Ahlulbayt.'
      },
      {
        title: 'Jabir ibn Abdullah al-Ansari',
        content: 'A dedicated companion of the Prophet (saws) who lived long enough to meet Imam al-Baqir (as) and convey the Prophet\'s greetings to him. He was also the first pilgrim to visit Imam Hussain (as) in Karbala after the martyrdom.'
      },
      {
        title: 'Bilal al-Habashi',
        content: 'The loyal muezzin of the Prophet who refused to recite the Adhan for anyone else after the Prophet\'s passing, except upon the request of Lady Fatima (sa). He remained steadfast in his devotion to the Prophet\'s true successors.'
      }
    ]
  },
  {
    id: 'historical-events',
    title: 'Significant Historical Events',
    category: 'History',
    content: 'Key moments in Islamic history that shaped the Shia identity and the preservation of the true message of Islam.',
    subsections: [
      { title: 'Ghadir Khumm', content: 'The event where the Prophet (saws) officially designated Imam Ali (as) as his successor.' },
      { title: 'The Tragedy of Karbala', content: 'The martyrdom of Imam Hussain (as) and his companions, which stands as the ultimate sacrifice for justice.' },
      { title: 'The Event of Mubahala', content: 'The spiritual challenge between the Prophet and the Christians of Najran, where the Ahlulbayt were highlighted.' },
      { title: 'The Treaty of Hudaybiyyah', content: 'A pivotal peace treaty that paved the way for the conquest of Makkah.' },
      { title: 'The Occultation of Imam Mahdi', content: 'The period starting from 260 AH where the 12th Imam remains hidden from public view but continues to guide the believers.' }
    ]
  }
];

export const MEDIA_LIBRARY: import('./types').MediaItem[] = [
  {
    id: 'lec1',
    type: 'audio',
    title: 'The Philosophy of Ashura',
    speaker: 'Sayed Ammar Nakshawani',
    url: 'https://cdn.islamic.network/lectures/ashura_philosophy.mp3',
    duration: '45:20',
    category: 'History'
  },
  {
    id: 'lec2',
    type: 'audio',
    title: 'Understanding Wilayat',
    speaker: 'Sheikh Hamza Sodagar',
    url: 'https://cdn.islamic.network/lectures/wilayat.mp3',
    duration: '52:15',
    category: 'Theology'
  },
  {
    id: 'vid1',
    type: 'video',
    title: 'Who are the Twelve Imams?',
    speaker: 'Ahlulbayt TV',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '12:30',
    category: 'Beliefs'
  }
];

export const QUIZ_DATA: import('./types').QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Who is the first Imam in Shia Islam?',
    options: ['Imam Hasan (as)', 'Imam Hussain (as)', 'Imam Ali (as)', 'Imam Sajjad (as)'],
    correctIndex: 2,
    explanation: 'Imam Ali (as) was declared the successor of the Prophet (saws) at Ghadir Khumm.'
  },
  {
    id: 'q2',
    question: 'Which event marks the martyrdom of Imam Hussain (as)?',
    options: ['Eid al-Fitr', 'Ashura', 'Arbaeen', 'Ghadir'],
    correctIndex: 1,
    explanation: 'Ashura (10th of Muharram) is the day Imam Hussain (as) was martyred in Karbala.'
  },
  {
    id: 'q3',
    question: 'What is the name of the 12th Imam?',
    options: ['Imam Mahdi (atfs)', 'Imam Reza (as)', 'Imam Baqir (as)', 'Imam Hadi (as)'],
    correctIndex: 0,
    explanation: 'Imam Mahdi (atfs) is the 12th Imam who is currently in occultation.'
  }
];

export const FORUM_TOPICS: import('./types').ForumTopic[] = [
  {
    id: 't1',
    title: 'Significance of Ziyarat Ashura',
    content: 'Can someone explain the deeper meanings behind the curses and blessings in Ziyarat Ashura? I have been reciting it daily but want to understand the context better.',
    author: 'Ali_Reza',
    authorAvatar: '🦁',
    replies: 15,
    repliesList: [
      {
        id: 'r1',
        author: 'Sheikh_Hassan',
        authorAvatar: '👳‍♂️',
        content: 'The curses are a dissociation from the enemies of God, which is as important as associating with His friends (Tawalla and Tabarra).',
        timestamp: '2 hours ago',
        upvotes: 12,
        downvotes: 0
      }
    ],
    views: 342,
    lastActive: '2 hours ago',
    category: 'Rituals',
    upvotes: 45,
    downvotes: 2,
    isPinned: true
  },
  {
    id: 't2',
    title: 'Understanding the Concept of Taqiyya',
    content: 'Is Taqiyya just about hiding one\'s faith, or is there a strategic aspect to it for the protection of the community?',
    author: 'Fatima_Z',
    authorAvatar: '🧕',
    replies: 8,
    repliesList: [],
    views: 156,
    lastActive: '1 day ago',
    category: 'Jurisprudence',
    upvotes: 28,
    downvotes: 1
  },
  {
    id: 't3',
    title: 'Recommended Books for Beginners',
    content: 'I am new to Shia Islam. What are the top 5 books you would recommend for a comprehensive understanding of the beliefs?',
    author: 'Hassan110',
    authorAvatar: '📚',
    replies: 24,
    repliesList: [],
    views: 890,
    lastActive: '3 days ago',
    category: 'General',
    upvotes: 156,
    downvotes: 3
  }
];

export const IFTAR_DUA: Dua = {
  id: 'iftar',
  title: 'Dua for Iftar',
  category: 'Ramadan',
  arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ وَعَلَيْكَ تَوَكَّلْتُ',
  translation: 'O Allah, for You I have fasted, and with Your provision I have broken my fast, and in You I have put my trust.',
  audio: 'https://www.duas.org/audio/Dua_Iftar.mp3'
};

export const SEHRI_DUA: Dua = {
  id: 'sehri',
  title: 'Dua for Sehri',
  category: 'Ramadan',
  arabic: 'يَا مَفْزَعِي عِنْدَ كُرْبَتِي وَيَا غَوْثِي عِنْدَ شِدَّتِي',
  translation: 'O my Refuge in my trouble, and O my Helper in my hardship...',
  audio: 'https://www.duas.org/audio/Dua_Sehri.mp3'
};

export const RAMADAN_COMMON_DUAS: Dua[] = [
  {
    id: 'sahar',
    title: 'Dua-e-Sahar',
    category: 'Ramadan',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ بَهَائِكَ بِأَبْهَاهُ وَكُلُّ بَهَائِكَ بَهِيٌّ...',
    translation: 'O Allah, I ask You by Your brilliance in its utmost splendor...',
    urduTranslation: 'اے اللہ! میں تجھ سے تیری چمک کے واسطے سے سوال کرتا ہوں جو اس کی انتہائی شان میں ہے...',
    audio: 'https://www.duas.org/audio/Dua_Sahar.mp3',
    historicalContext: 'Recited at dawn (Sahar) during the month of Ramadan, attributed to Imam Muhammad al-Baqir (as).'
  },
  {
    id: 'iftitah',
    title: 'Dua-e-Iftitah',
    category: 'Ramadan',
    arabic: 'اللَّهُمَّ إِنِّي أَفْتَتِحُ الثَّنَاءَ بِحَمْدِكَ...',
    translation: 'O Allah, I begin the glorification with Your praise...',
    urduTranslation: 'اے اللہ! میں تیری حمد کے ساتھ تیری ثناء کا آغاز کرتا ہوں...',
    audio: 'https://www.duas.org/audio/Dua_Iftitah.mp3',
    historicalContext: 'Recommended to be recited every night of Ramadan. It teaches us about the greatness of Allah and the importance of praying for the 12th Imam (atfs).',
    tafsir: 'Dua al-Iftitah is a comprehensive theological and social manifesto. It begins with the praise of Allah, establishing the Creator-creature relationship. It then transitions into a profound prayer for the establishment of a "Noble State" (Dawlatun Kareemah) under the leadership of the 12th Imam (atfs). This section highlights the social aspirations of a believer—dignity for Islam, humiliation for hypocrisy, and the implementation of justice. It is a prayer that balances personal spirituality with communal responsibility.'
  },
  {
    id: 'jawshan',
    title: 'Dua Jawshan Kabeer',
    category: 'Ramadan',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِاسْمِكَ يَا اللَّهُ يَا رَحْمَانُ...',
    translation: 'O Allah, I ask You by Your Name, O Allah, O Beneficent...',
    audio: 'https://www.duas.org/audio/Jawshan_Kabeer.mp3',
    historicalContext: 'Contains 1000 names of Allah, recited especially on the Nights of Qadr (Laylatul Qadr).'
  },
  {
    id: 'tawassul',
    title: 'Dua Tawassul',
    category: 'Popular',
    arabic: 'اَللّهُمَّ اِنّى اَسْئَلُكَ وَاَتَوَجَّهُ اِلَيْكَ بِنَبِيِّكَ نَبِيِّ الرَّحْمَةِ مُحَمَّد صَلَّى اللهُ عَلَيْهِ وَآلِهِ...',
    translation: 'O Allah, I beseech You and turn my face towards You through Your Prophet, the Prophet of Mercy, Muhammad...',
    urduTranslation: 'اے اللہ! میں تجھ سے سوال کرتا ہوں اور تیری طرف متوجہ ہوتا ہوں تیرے نبی، نبی رحمت محمد (ص) کے واسطے سے...',
    urduTransliteration: 'Allahumma inni as\'aluka wa atawajjahu ilaika bi nabiyyina...',
    audio: 'https://www.duas.org/audio/Dua_Tawassul.mp3',
    historicalContext: 'The Prayer of Intercession. It is recited to seek the intercession of the 14 Infallibles in the presence of Allah.'
  },
  {
    id: 'mashlool',
    title: 'Dua Mashlool',
    category: 'Hardships',
    arabic: 'اَللّهُمَّ اِنّى اَسْئَلُكَ بِاسْمِكَ بِسْمِ اللهِ الرَّحْمنِ الرَّحيمِ يا ذَا الْجَلالِ وَالْاِكْرامِ...',
    translation: 'O Allah, I ask You by Your Name, in the Name of Allah, the Beneficent, the Merciful, O Lord of Majesty and Honor...',
    urduTranslation: 'اے اللہ! میں تجھ سے تیرے نام کے واسطے سے سوال کرتا ہوں، اللہ کے نام سے جو کہ بہت مہربان اور نہایت رحم کرنے والا ہے، اے جلال اور اکرام والے...',
    urduTransliteration: 'Allahumma inni as\'aluka bismika, bismillahir rahmanir rahim...',
    audio: 'https://www.duas.org/audio/Dua_Mashlool.mp3',
    historicalContext: 'Known as "The Supplication of the Youth Struck by Paralysis." Imam Ali (as) taught this to a youth whose father had cursed him, leading to his recovery. It contains the Great Names of Allah.'
  },
  {
    id: 'sahifa-parents',
    title: 'Dua for Parents',
    category: 'Sahifa',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّد عَبْدِكَ وَرَسُولِكَ، وَأَهْلِ بَيْتِهِ الطَّاهِرِينَ...',
    translation: 'O Allah, bless Muhammad, Thy slave and Thy messenger, and his household, the pure...',
    urduTranslation: 'اے اللہ! محمد (ص) پر رحمت نازل فرما جو تیرے بندے اور تیرے رسول ہیں، اور ان کے پاکیزہ اہل بیت (ع) پر...',
    audio: 'https://www.duas.org/audio/Sahifa_24.mp3',
    historicalContext: 'From Sahifa Sajjadiya (The Psalms of Islam). A beautiful prayer teaching us how to treat and pray for our parents.'
  }
];

export const SHIA_HADITHS: Hadith[] = [
  {
    id: 'h1',
    arabic: 'مَنْ عَرَفَ نَفْسَهُ فَقَدْ عَرَفَ رَبَّهُ',
    translation: 'He who knows himself knows his Lord.',
    source: 'Ghurar al-Hikam',
    author: 'Imam Ali (as)',
    tags: ['Knowledge', 'Spirituality'],
    category: 'Gnosis'
  },
  {
    id: 'h2',
    arabic: 'إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ',
    translation: 'I was only sent to perfect noble character.',
    source: 'Bihar al-Anwar',
    author: 'Prophet Muhammad (saws)',
    tags: ['Ethics', 'Character'],
    category: 'Ethics'
  },
  {
    id: 'h3',
    arabic: 'الْعِلْمُ كَنْزٌ عَظِيمٌ لَا يَفْنَى',
    translation: 'Knowledge is a great treasure that never perishes.',
    source: 'Nahj al-Balagha',
    author: 'Imam Ali (as)',
    tags: ['Knowledge', 'Wisdom'],
    category: 'Knowledge'
  },
  {
    id: 'h4',
    arabic: 'الصَّبْرُ مِنَ الْإِيمَانِ كَالرَّأْسِ مِنَ الْجَسَدِ',
    translation: 'Patience is to faith what the head is to the body.',
    source: 'Al-Kafi',
    author: 'Imam as-Sadiq (as)',
    tags: ['Patience', 'Faith'],
    category: 'Faith'
  },
  {
    id: 'h5',
    arabic: 'أَفْضَلُ الْعِبَادَةِ بَعْدَ الْمَعْرِفَةِ انْتِظَارُ الْفَرَجِ',
    translation: 'The best worship after knowledge is waiting for the relief (reappearance of Imam Mahdi).',
    source: 'Tuhaf al-Uqul',
    author: 'Imam al-Kadhim (as)',
    tags: ['Worship', 'Imam Mahdi'],
    category: 'Wait for Relief'
  },
  {
    id: 'h6',
    arabic: 'كُونُوا دُعَاةً لِلنَّاسِ بِغَيْرِ أَلْسِنَتِكُمْ',
    translation: 'Invite people [to the Truth] with other than your tongues (i.e., through your actions).',
    source: 'Al-Kafi',
    author: 'Imam as-Sadiq (as)',
    tags: ['Action', 'Dawah'],
    category: 'Ethics'
  },
  {
    id: 'h7',
    arabic: 'مَنْ كَانَ لَهُ مَعَ اللَّهِ وَقْتٌ فَلَا يَشْغَلُهُ بِغَيْرِهِ',
    translation: 'He who has a time with Allah should not occupy it with anything else.',
    source: 'Jami al-Akhbar',
    author: 'Imam Ali (as)',
    tags: ['Prayer', 'Focus'],
    category: 'Worship'
  },
  {
    id: 'h8',
    arabic: 'إِنَّ الْحُسَيْنَ مِصْبَاحُ الْهُدَى وَ سَفِينَةُ النَّجَاةِ',
    translation: 'Indeed, Hussain is the Torch of Guidance and the Ark of Salvation.',
    source: 'Uyun Akhbar al-Reza',
    author: 'Prophet Muhammad (saws)',
    tags: ['Imam Hussain', 'Guidance'],
    category: 'Ahlulbayt'
  },
  {
    id: 'h9',
    arabic: 'أَنَا مَدِينَةُ الْعِلْمِ وَعَلِيٌّ بَابُهَا',
    translation: 'I am the City of Knowledge and Ali is its Gate.',
    source: 'Mustadrak al-Hakim',
    author: 'Prophet Muhammad (saws)',
    tags: ['Imam Ali', 'Knowledge'],
    category: 'Knowledge'
  },
  {
    id: 'h10',
    arabic: 'فَاطِمَةُ بَضْعَةٌ مِنِّي فَمَنْ آذَاهَا فَقَدْ آذَانِي',
    translation: 'Fatima is a part of me; whoever hurts her, hurts me.',
    source: 'Bihar al-Anwar',
    author: 'Prophet Muhammad (saws)',
    tags: ['Lady Fatima', 'Love'],
    category: 'Ahlulbayt'
  }
];

export const HADITH_CATEGORIES = [
  { id: 'All', name: 'All Wisdom', icon: 'fa-mosque' },
  { id: 'Knowledge', name: 'Knowledge', icon: 'fa-book' },
  { id: 'Ethics', name: 'Ethics', icon: 'fa-heart' },
  { id: 'Faith', name: 'Faith', icon: 'fa-shield-halved' },
  { id: 'Ahlulbayt', name: 'Ahlulbayt', icon: 'fa-hand-praying' },
  { id: 'Worship', name: 'Worship', icon: 'fa-star-and-crescent' },
  { id: 'Social', name: 'Social Justice', icon: 'fa-scale-balanced' }
];
export const RAMADAN_DAYS: import('./types').RamadanDay[] = [
  {
    day: 1,
    dua: {
      id: 'ramadan-day-1',
      title: 'Dua for Day 1',
      category: 'Ramadan Daily',
      arabic: 'اللَّهُمَّ اجْعَلْ صِيَامِي فِيهِ صِيَامَ الصَّائِمِينَ وَ قِيَامِي فِيهِ قِيَامَ الْقَائِمِينَ...',
      translation: 'O Allah, make my fast in it the fast of those who fast sincerely...',
      audio: 'https://www.duas.org/audio/Ramadan_Day_1.mp3'
    },
    amaal: ['Ghusl', 'Recite Dua-e-Iftitah', 'Recite 2 Rakats Namaz']
  },
  {
    day: 2,
    dua: {
      id: 'ramadan-day-2',
      title: 'Dua for Day 2',
      category: 'Ramadan Daily',
      arabic: 'اللَّهُمَّ قَرِّبْنِي فِيهِ إِلَى مَرْضَاتِكَ وَ جَنِّبْنِي فِيهِ مِنْ سَخَطِكَ وَ نَقِمَاتِكَ...',
      translation: 'O Allah, bring me closer in it to Your pleasure and keep me away in it from Your anger...',
      audio: 'https://www.duas.org/audio/Ramadan_Day_2.mp3'
    },
    amaal: ['Recite Dua-e-Sahar', 'Give Sadaqah']
  },
  ...Array.from({ length: 28 }, (_, i) => ({
    day: i + 3,
    dua: {
      id: `ramadan-day-${i + 3}`,
      title: `Dua for Day ${i + 3}`,
      category: 'Ramadan Daily',
      arabic: 'Arabic text coming soon...',
      translation: 'Translation coming soon...',
      audio: ''
    },
    amaal: ['Daily Prayers', 'Quran Recitation', 'Sadaqah']
  }))
];
