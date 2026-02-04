
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onAdminClick: () => void;
  onFeedbackClick: () => void;
  isLocked: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed, 
  onAdminClick, 
  onFeedbackClick,
  isLocked 
}) => {
  const menuItems = [
    { id: 'home', icon: 'fa-mosque', label: 'Sanctuary' },
    { id: 'quran', icon: 'fa-book-open', label: 'Holy Quran' },
    { id: 'tasbih', icon: 'fa-fingerprint', label: 'Tasbih' },
    { id: 'duas', icon: 'fa-hands-holding', label: 'Duas & Ziyarat' },
    { id: 'amals', icon: 'fa-gem', label: 'Sacred Amaal' },
    { id: 'ask', icon: 'fa-wand-sparkles', label: 'AI Hub' },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#022c22] border-t border-white/5 z-[100] flex justify-around items-center px-2 py-4 overflow-x-auto scrollbar-hide">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-all min-w-[60px] ${
              activeTab === item.id ? 'text-[#d4af37]' : 'text-white/30'
            }`}
          >
            <i className={`fas ${item.icon} text-lg`}></i>
            <span className="text-[6px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </div>

      <div className={`hidden md:flex ${isCollapsed ? 'w-20' : 'w-72'} bg-[#022c22] text-white min-h-screen flex-col border-r border-white/5 transition-all duration-500 relative z-50`}>
        <div className={`p-8 border-b border-white/5 flex flex-col ${isCollapsed ? 'items-center' : 'items-start'} gap-4`}>
          <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#aa771c] rounded-2xl flex items-center justify-center shadow-2xl">
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
              <i className={`fas ${item.icon} w-6 text-center text-lg ${activeTab === item.id ? 'text-[#d4af37]' : 'text-white/20 group-hover:text-white'}`}></i>
              {!isCollapsed && (
                <span className={`ml-4 text-[10px] font-black tracking-[0.2em] uppercase transition-all ${activeTab === item.id ? 'text-white' : 'text-white/30 group-hover:text-white'}`}>
                  {item.label}
                </span>
              )}
              {activeTab === item.id && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_10px_#d4af37]"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-4">
          <button className="w-full flex items-center p-4 rounded-2xl hover:bg-white/5 transition-all text-white/30 hover:text-white group">
            <i className="fas fa-comment-dots text-lg"></i>
            {!isCollapsed && <span className="ml-4 text-[8px] font-black uppercase tracking-widest">Feedback</span>}
          </button>
          <button onClick={onAdminClick} className={`w-full flex items-center p-4 rounded-2xl hover:bg-white/5 transition-all group ${isLocked ? 'text-white/10' : 'text-[#d4af37]'}`}>
            <i className={`fas ${isLocked ? 'fa-lock' : 'fa-unlock'} text-lg`}></i>
            {!isCollapsed && <span className="ml-4 text-[8px] font-black uppercase tracking-widest">Guardian</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
