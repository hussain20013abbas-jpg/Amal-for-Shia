import React from 'react';
import { SHIA_HADITHS, HADITH_CATEGORIES } from '../constants';

interface HadithLibraryProps {
  hadithSearch: string;
  setHadithSearch: (val: string) => void;
  hadithCategory: string;
  setHadithCategory: (val: string) => void;
  savedHadiths: string[];
  toggleSavedHadith: (id: string) => void;
  dailyHadith: any;
}

export const HadithLibrary: React.FC<HadithLibraryProps> = ({
  hadithSearch,
  setHadithSearch,
  hadithCategory,
  setHadithCategory,
  savedHadiths,
  toggleSavedHadith,
  dailyHadith
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
      <div className="lg:col-span-1 space-y-8">
        <div className="glass-card p-8 rounded-[3rem] border-2 border-white/5 space-y-8">
          <div>
            <h3 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-6 border-b border-[#d4af37]/20 pb-4">Seek Wisdom</h3>
            <div className="relative group">
              <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#d4af37] transition-colors"></i>
              <input 
                type="text" 
                placeholder="Search Traditions..." 
                value={hadithSearch}
                onChange={(e) => setHadithSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-xs font-black uppercase outline-none focus:border-[#d4af37]/40 transition-all text-white"
              />
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-6 border-b border-[#d4af37]/20 pb-4">Categories</h3>
            <div className="grid grid-cols-1 gap-3">
              {HADITH_CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setHadithCategory(cat.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all border ${hadithCategory === cat.id ? 'bg-[#d4af37] border-[#d4af37] text-[#011a14]' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'}`}
                >
                  <i className={`fas ${cat.icon} w-6 text-center`}></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {savedHadiths.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em] mb-6 border-b border-[#d4af37]/20 pb-4">Personal List</h3>
              <button 
                onClick={() => setHadithCategory('Bookmarked')}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all border ${hadithCategory === 'Bookmarked' ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'}`}
              >
                <i className="fas fa-bookmark w-6 text-center"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Saved ({savedHadiths.length})</span>
              </button>
            </div>
          )}
        </div>

        <div className="glass-card p-10 rounded-[3rem] border-2 border-[#d4af37]/30 bg-[#d4af37]/5 space-y-6">
          <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest block text-center">Daily Featured Wisdom</span>
          <p className="text-sm font-serif italic text-white/80 leading-relaxed text-center">"{dailyHadith.translation}"</p>
          <span className="text-[9px] font-black luxury-text uppercase tracking-widest block text-center">— {dailyHadith.author}</span>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-10">
        <div className="grid grid-cols-1 gap-8 max-h-[1200px] overflow-y-auto pr-4 custom-scrollbar">
          {SHIA_HADITHS.filter(h => {
            const matchesSearch = h.translation.toLowerCase().includes(hadithSearch.toLowerCase()) || (h.arabic && h.arabic.includes(hadithSearch)) || h.author.toLowerCase().includes(hadithSearch.toLowerCase());
            const matchesCat = hadithCategory === 'All' || h.category === hadithCategory || (hadithCategory === 'Bookmarked' && savedHadiths.includes(h.id));
            return matchesSearch && matchesCat;
          }).length > 0 ? SHIA_HADITHS.filter(h => {
             const matchesSearch = h.translation.toLowerCase().includes(hadithSearch.toLowerCase()) || (h.arabic && h.arabic.includes(hadithSearch)) || h.author.toLowerCase().includes(hadithSearch.toLowerCase());
             const matchesCat = hadithCategory === 'All' || h.category === hadithCategory || (hadithCategory === 'Bookmarked' && savedHadiths.includes(h.id));
             return matchesSearch && matchesCat;
          }).map(h => (
            <div key={h.id} className="glass-card p-12 rounded-[4rem] border-2 border-white/5 hover:border-[#d4af37]/30 transition-all group relative overflow-hidden flex flex-col gap-10">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <i className="fas fa-quote-right text-[12rem]"></i>
              </div>
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                  <span className="px-4 py-2 rounded-full bg-[#d4af37]/10 text-[#d4af37] text-[8px] font-black uppercase tracking-[0.2em] border border-[#d4af37]/20">{h.category || 'Tradition'}</span>
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">{h.source}</span>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      const text = `*Shia Hub Wisdom*\n\n"${h.translation}"\n\n— ${h.author} (${h.source})`;
                      navigator.clipboard.writeText(text);
                      alert('Hadith copied to clipboard.');
                    }}
                    className="w-12 h-12 rounded-2xl bg-white/5 text-white/20 hover:text-[#d4af37] border border-white/10 flex items-center justify-center transition-all"
                  >
                    <i className="fas fa-share-nodes text-lg"></i>
                  </button>
                  <button 
                    onClick={() => toggleSavedHadith(h.id)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${savedHadiths.includes(h.id) ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-white/5 text-white/20 hover:text-red-500 border border-white/10'}`}
                  >
                    <i className={`${savedHadiths.includes(h.id) ? 'fas' : 'far'} fa-bookmark text-lg`}></i>
                  </button>
                </div>
              </div>
              <div className="space-y-10 relative z-10 text-center md:text-left">
                <p className="quran-text text-4xl md:text-5xl leading-[2] text-white/95">{h.arabic}</p>
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent"></div>
                <p className="text-xl md:text-2xl font-serif italic text-white/70 leading-relaxed font-medium">"{h.translation}"</p>
                <div className="flex flex-col gap-2">
                  <span className="text-[12px] font-black luxury-text uppercase tracking-widest">— {h.author}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center">
              <i className="fas fa-book-open-reader text-6xl text-white/5 mb-8"></i>
              <p className="text-white/20 font-black uppercase tracking-widest">No traditions found in this collection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
