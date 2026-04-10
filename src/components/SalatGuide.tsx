import React, { useState } from 'react';

interface SalatStep {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  description: string;
  image?: string;
}

const SALAT_STEPS: SalatStep[] = [
  {
    id: 'niyyah',
    title: 'Niyyah (Intention)',
    arabic: 'أُصَلِّي صَلَاةَ (الصبح/الظهر/العصر/المغرب/العشاء) قُرْبَةً إِلَى اللَّهِ تَعَالَى',
    transliteration: 'Usalli salata (al-Fajr/Dhuhr/Asr/Maghrib/Isha) qurbatan ilallah ta\'ala',
    translation: 'I offer the (Fajr/Dhuhr/Asr/Maghrib/Isha) prayer seeking proximity to Allah, the Exalted.',
    description: 'Stand facing the Qibla. Make a firm intention in your heart for the specific prayer you are about to perform. It is not necessary to say it aloud.'
  },
  {
    id: 'takbirat-ul-ihram',
    title: 'Takbirat-ul-Ihram',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    description: 'Raise your hands to your ears and say "Allahu Akbar". This act starts the prayer and makes all acts contrary to prayer forbidden (haram).'
  },
  {
    id: 'qiyam-fatiha',
    title: 'Qiyam (Standing) - Surah Al-Fatiha',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ...',
    transliteration: 'Bismillahir Rahmanir Raheem...',
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful...',
    description: 'While standing, recite Surah Al-Fatiha completely. In the first two Rakats of every prayer, this is obligatory.'
  },
  {
    id: 'qiyam-surah',
    title: 'Qiyam - Second Surah',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ...',
    transliteration: 'Qul huwallahu ahad...',
    translation: 'Say, "He is Allah, [who is] One...',
    description: 'After Surah Al-Fatiha, recite another complete Surah from the Quran (e.g., Surah Al-Ikhlas) in the first two Rakats.'
  },
  {
    id: 'ruku',
    title: 'Ruku (Bowing)',
    arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ',
    transliteration: 'Subhana Rabbiyal \'Adheemi wa bihamdih',
    translation: 'Glory be to my Lord, the Great, and praise belongs to Him',
    description: 'Bow down, resting your hands on your knees. Recite the Dhikr of Ruku once (or three times "Subhanallah"). Then stand up straight again.'
  },
  {
    id: 'sujud',
    title: 'Sujud (Prostration)',
    arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَىٰ وَبِحَمْدِهِ',
    transliteration: 'Subhana Rabbiyal A\'la wa bihamdih',
    translation: 'Glory be to my Lord, the Most High, and praise belongs to Him',
    description: 'Prostrate with seven parts of your body touching the ground: forehead, palms, knees, and big toes. In Shia fiqh, the forehead must rest on earth or something growing from it (Turbah/Mohr). Recite the Dhikr of Sujud once (or three times "Subhanallah").'
  },
  {
    id: 'julus',
    title: 'Julus (Sitting between Sujud)',
    arabic: 'أَسْتَغْفِرُ اللَّهَ رَبِّي وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullaha Rabbi wa atubu ilayh',
    translation: 'I seek forgiveness from Allah, my Lord, and turn to Him in repentance',
    description: 'Sit up from the first Sujud, pause briefly (you may recite the recommended Dhikr), and then go down for the second Sujud.'
  },
  {
    id: 'tashahhud',
    title: 'Tashahhud',
    arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ. اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَآلِ مُحَمَّدٍ',
    transliteration: 'Ashhadu an la ilaha illallahu wahdahu la sharika lah, wa ashhadu anna Muhammadan \'abduhu wa rasuluh. Allahumma salli \'ala Muhammadin wa Aali Muhammad',
    translation: 'I bear witness that there is no god but Allah, He is One, without partner. And I bear witness that Muhammad is His servant and His messenger. O Allah, send blessings upon Muhammad and the progeny of Muhammad.',
    description: 'Sit after the second Sujud of the second Rakat (and the final Rakat) and recite the Tashahhud.'
  },
  {
    id: 'salam',
    title: 'Salam (Salutation)',
    arabic: 'السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ. السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ. السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ',
    transliteration: 'Assalamu \'alayka ayyuhan-Nabiyyu wa rahmatullahi wa barakatuh. Assalamu \'alayna wa \'ala \'ibadillahis-saliheen. Assalamu \'alaykum wa rahmatullahi wa barakatuh',
    translation: 'Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. Peace be upon you all, and the mercy of Allah and His blessings.',
    description: 'Recite the Salam in the final sitting after Tashahhud to conclude the prayer.'
  }
];

const SalatGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>(SALAT_STEPS[0].id);

  return (
    <div className="space-y-12 animate-in fade-in max-w-6xl mx-auto py-10">
      <header className="text-center mb-16">
        <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Salat Guide</h2>
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Step-by-Step Guide for Shia Muslims</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Steps Navigation */}
        <div className="lg:col-span-1 space-y-4">
          {SALAT_STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${
                activeStep === step.id 
                  ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.15)]' 
                  : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                activeStep === step.id ? 'bg-[#d4af37] text-[#011a14]' : 'bg-white/10 text-white/40'
              }`}>
                {index + 1}
              </div>
              <span className="font-black uppercase tracking-widest text-[11px]">{step.title}</span>
            </button>
          ))}
        </div>

        {/* Step Details */}
        <div className="lg:col-span-2">
          {SALAT_STEPS.map((step) => (
            activeStep === step.id && (
              <div key={step.id} className="glass-card p-10 md:p-16 rounded-[3rem] border-2 border-[#d4af37]/20 animate-in slide-in-from-right-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <i className="fas fa-person-praying text-[15rem]"></i>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-black luxury-text uppercase mb-8 tracking-tighter">{step.title}</h3>
                
                <div className="space-y-10 relative z-10">
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                    <p className="quran-text text-4xl md:text-5xl leading-relaxed text-right mb-6 text-white/90">{step.arabic}</p>
                    <p className="text-[12px] font-black text-[#d4af37] uppercase tracking-[0.3em] mb-4">{step.transliteration}</p>
                    <p className="font-serif italic text-xl text-white/70">"{step.translation}"</p>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-4">Instructions</h4>
                    <p className="text-lg text-white/80 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalatGuide;
