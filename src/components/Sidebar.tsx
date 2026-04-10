
import React from 'react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onAdminClick: () => void;
  onFeedbackClick: () => void;
  isLocked: boolean;
  isAuthenticated: boolean;
  userProfile: UserProfile;
  onProfileClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed, 
  onAdminClick, 
  onFeedbackClick,
  isLocked,
  isAuthenticated,
  userProfile,
  onProfileClick
}) => {
  const menuItems = [
    { id: 'home', icon: 'fa-mosque', label: 'Sanctuary' },
    { id: 'prayer-times', icon: 'fa-clock', label: 'Prayer Times' },
    { id: 'salat-guide', icon: 'fa-person-praying', label: 'Salat Guide' },
    { id: 'prayer-tracker', icon: 'fa-calendar-check', label: 'Prayer Tracker' },
    { id: 'quran', icon: 'fa-book-open', label: 'Holy Quran' },
    { id: 'profile', icon: 'fa-user', label: 'My Profile' },
    { id: 'bookmarks', icon: 'fa-bookmark', label: 'Bookmarks' },
    { id: 'duas', icon: 'fa-hands-holding', label: 'Duas & Ziyarat' },
    { id: 'ramadan', icon: 'fa-moon', label: 'Ramadan Amaal' },
    { id: 'amals', icon: 'fa-gem', label: 'Sacred Amaal' },
    { id: 'sacred-collection', icon: 'fa-scroll', label: 'Sacred Collection' },
    { id: 'tasbih', icon: 'fa-fingerprint', label: 'Tasbih' },
    { id: 'qibla', icon: 'fa-compass', label: 'Qibla Finder' },
    { id: 'ask', icon: 'fa-wand-sparkles', label: 'AI Guidance' },
    { id: 'voice-guidance', icon: 'fa-microphone-lines', label: 'Voice Guidance' },
    { id: 'knowledge', icon: 'fa-kaaba', label: 'Shia Knowledge' },
    { id: 'multimedia', icon: 'fa-play-circle', label: 'Multimedia' },
    { id: 'quiz', icon: 'fa-brain', label: 'Knowledge Quiz' },
    { id: 'forum', icon: 'fa-comments', label: 'Community Forum' },
    { id: 'settings', icon: 'fa-cog', label: 'Settings' },
    { id: 'legacy', icon: 'fa-scroll', label: 'Our Legacy' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#022c22] border-t border-white/5 z-[100] flex justify-around items-center px-2 py-4 overflow-x-auto scrollbar-hide">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-all min-w-[64px] ${
              activeTab === item.id ? 'text-[#d4af37]' : 'text-white/30'
            }`}
          >
            <i className={`fas ${item.icon} text-lg`}></i>
            <span className="text-[6px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
        <button
          onClick={onProfileClick}
          className={`flex flex-col items-center gap-1 transition-all min-w-[64px] ${
            isAuthenticated ? 'text-[#d4af37]' : 'text-white/30'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[8px] border border-white/10 overflow-hidden">
            {userProfile.avatar.startsWith('http') ? (
              <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              userProfile.avatar
            )}
          </div>
          <span className="text-[6px] font-black uppercase tracking-tighter">Profile</span>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden md:flex ${isCollapsed ? 'w-20' : 'w-72'} bg-[#022c22] text-white min-h-screen flex-col border-r border-white/5 transition-all duration-500 relative z-50`}>
        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#d4af37] rounded-full flex items-center justify-center text-[#022c22] shadow-lg z-50 hover:scale-110 transition-transform hidden md:flex"
        >
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-[10px]`}></i>
        </button>

        <div className={`p-8 border-b border-white/5 flex flex-col ${isCollapsed ? 'items-center' : 'items-start'} gap-4`}>
          <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#aa771c] rounded-2xl flex items-center justify-center shadow-2xl shrink-0">
            <i className="fas fa-star-and-crescent text-2xl text-[#022c22]"></i>
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-4">
               <h1 className="font-black text-[11px] leading-tight uppercase tracking-[0.2em] luxury-text">Syed Muhammad Tahir</h1>
               <span className="block text-[8px] text-white/30 mt-1 font-bold uppercase tracking-widest italic">Ibne Syed Muhammad Mehdi</span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 mt-10 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-4 rounded-2xl transition-all group relative ${
                activeTab === item.id ? 'bg-white/5 border border-white/10 shadow-lg' : 'hover:bg-white/[0.02]'
              }`}
            >
              <i className={`fas ${item.icon} w-6 text-center text-lg transition-colors ${activeTab === item.id ? 'text-[#d4af37]' : 'text-white/20 group-hover:text-white'}`}></i>
              {!isCollapsed && (
                <span className={`ml-4 text-[10px] font-black tracking-[0.2em] uppercase transition-all ${activeTab === item.id ? 'text-white' : 'text-white/30 group-hover:text-white'}`}>
                  {item.label}
                </span>
              )}
              
              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-[#d4af37] text-[#022c22] text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] whitespace-nowrap shadow-xl">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-8 border-transparent border-r-[#d4af37]"></div>
                </div>
              )}

              {activeTab === item.id && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_10px_#d4af37] animate-in zoom-in duration-300"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-4">
          <button 
            onClick={onProfileClick}
            className={`w-full flex items-center p-4 rounded-2xl transition-all group relative ${
              isAuthenticated ? 'bg-[#d4af37]/10 border border-[#d4af37]/20' : 'hover:bg-white/5'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs border border-white/10 overflow-hidden shrink-0">
              {userProfile.avatar.startsWith('http') ? (
                <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                userProfile.avatar
              )}
            </div>
            {!isCollapsed && (
              <div className="ml-4 flex-1 text-left overflow-hidden">
                <p className="text-[8px] font-black uppercase tracking-widest truncate">{userProfile.name}</p>
                <p className={`text-[6px] font-bold uppercase tracking-tighter ${isAuthenticated ? 'text-[#d4af37]' : 'text-white/20'}`}>
                  {isAuthenticated ? 'Connected' : 'Guest Mode'}
                </p>
              </div>
            )}
            {isAuthenticated && !isCollapsed && (
              <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse"></div>
            )}

            {/* Tooltip when collapsed */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-[#d4af37] text-[#022c22] text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] whitespace-nowrap shadow-xl">
                Profile
                <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-8 border-transparent border-r-[#d4af37]"></div>
              </div>
            )}
          </button>

          <button onClick={onAdminClick} className={`w-full flex items-center p-4 rounded-2xl hover:bg-white/5 transition-all group relative ${isLocked ? 'text-white/10' : 'text-[#d4af37]'}`}>
            <i className={`fas ${isLocked ? 'fa-lock' : 'fa-unlock'} text-lg w-6 text-center`}></i>
            {!isCollapsed && <span className="ml-4 text-[8px] font-black uppercase tracking-widest">Guardian</span>}
            
            {/* Tooltip when collapsed */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-[#d4af37] text-[#022c22] text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] whitespace-nowrap shadow-xl">
                Guardian
                <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-8 border-transparent border-r-[#d4af37]"></div>
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
