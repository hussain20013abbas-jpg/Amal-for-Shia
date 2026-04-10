
import React, { useState, useMemo } from 'react';
import { Hadith, Dua } from '../types';
import { SHIA_HADITHS, ZIYARATS, POPULAR_DUAS, DAILY_DUAS, RAMADAN_COMMON_DUAS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

const SacredCollection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hadith' | 'dua'>('hadith');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const allDuas = useMemo(() => [
    ...ZIYARATS,
    ...POPULAR_DUAS,
    ...DAILY_DUAS,
    ...RAMADAN_COMMON_DUAS
  ], []);

  const categories = useMemo(() => {
    if (activeTab === 'hadith') {
      const tags = new Set<string>(['All']);
      SHIA_HADITHS.forEach(h => h.tags?.forEach(t => tags.add(t)));
      return Array.from(tags);
    } else {
      const cats = new Set<string>(['All']);
      allDuas.forEach(d => cats.add(d.category));
      return Array.from(cats);
    }
  }, [activeTab, allDuas]);

  const filteredHadiths = useMemo(() => {
    return SHIA_HADITHS.filter(h => {
      const matchesSearch = h.translation.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            h.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            h.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || h.tags?.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const filteredDuas = useMemo(() => {
    return allDuas.filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            d.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, allDuas]);

  return (
    <div className="min-h-screen bg-[#022c22] p-4 md:p-8 pb-32 md:pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-6xl font-black luxury-text uppercase tracking-[0.2em] mb-4">Sacred Collection</h2>
          <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] italic">Authentic Hadith & Duas from Shia Sources</p>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full md:w-auto">
            <button
              onClick={() => { setActiveTab('hadith'); setSelectedCategory('All'); }}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'hadith' ? 'bg-[#d4af37] text-[#022c22]' : 'text-white/40 hover:text-white'}`}
            >
              Hadith
            </button>
            <button
              onClick={() => { setActiveTab('dua'); setSelectedCategory('All'); }}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dua' ? 'bg-[#d4af37] text-[#022c22]' : 'text-white/40 hover:text-white'}`}
            >
              Duas
            </button>
          </div>

          <div className="relative w-full md:w-96">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37] text-sm"></i>
            <input
              type="text"
              placeholder={`Search ${activeTab === 'hadith' ? 'Hadith' : 'Duas'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-white/20"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-6 mb-8 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                selectedCategory === cat 
                ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' 
                : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {activeTab === 'hadith' ? (
              filteredHadiths.map((hadith) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={hadith.id}
                  className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#d4af37]/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <i className="fas fa-quote-right text-[#d4af37]/10 text-4xl group-hover:text-[#d4af37]/20 transition-colors"></i>
                  </div>
                  <div className="mb-6">
                    <p className="text-2xl md:text-3xl text-right font-arabic leading-relaxed text-[#d4af37] mb-6" dir="rtl">
                      {hadith.arabic}
                    </p>
                    <p className="text-white/80 text-sm leading-relaxed italic mb-6">
                      "{hadith.translation}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">{hadith.author}</p>
                      <p className="text-[8px] font-bold uppercase tracking-tighter text-white/30">{hadith.source}</p>
                    </div>
                    <div className="flex gap-2">
                      {hadith.tags?.map(tag => (
                        <span key={tag} className="text-[6px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md text-white/40">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              filteredDuas.map((dua) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={dua.id}
                  className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#d4af37]/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] rounded-full border border-[#d4af37]/20">
                      {dua.category}
                    </span>
                    <i className="fas fa-hands-holding text-[#d4af37]/20 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-[0.2em] text-white mb-4">{dua.title}</h3>
                  <p className="text-white/60 text-xs leading-relaxed line-clamp-3 mb-6">
                    {dua.translation}
                  </p>
                  <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/40 hover:bg-[#d4af37] hover:text-[#022c22] hover:border-[#d4af37] transition-all">
                    View Full Dua
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {((activeTab === 'hadith' && filteredHadiths.length === 0) || (activeTab === 'dua' && filteredDuas.length === 0)) && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <i className="fas fa-search text-white/10 text-5xl mb-6"></i>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">No results found for your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SacredCollection;
