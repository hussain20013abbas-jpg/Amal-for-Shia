
import React, { useState, useEffect } from 'react';

interface AdminPortalProps {
  onClose: () => void;
  isUnlocked: boolean;
  onUnlock: (pin: string) => void;
  onLock: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ onClose, isUnlocked, onUnlock, onLock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '786110') { // Default sacred guardian pin
      onUnlock(pin);
      setError(false);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#011a14]/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
      <div className="max-w-md w-full glass-card p-8 md:p-12 rounded-[2.5rem] border-[#d4af37]/30 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50"></div>
        
        <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-[#d4af37] transition-colors">
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="mb-8">
          <div className="w-20 h-20 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#d4af37]/20">
            <i className={`fas ${isUnlocked ? 'fa-unlock-alt' : 'fa-shield-halved'} text-3xl text-[#d4af37]`}></i>
          </div>
          <h2 className="luxury-text text-2xl font-black uppercase tracking-widest">Guardian Portal</h2>
          <p className="text-[8px] font-black text-[#d4af37] uppercase tracking-[0.4em] mt-2">Administrative Authority Only</p>
        </div>

        {!isUnlocked ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter leading-relaxed">
              To modify the legacy of <br/>Syed Muhammad Tahir, enter the Guardian Key.
            </p>
            <div className="relative">
              <input 
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} p-4 rounded-xl text-center text-2xl tracking-[1em] outline-none focus:border-[#d4af37]/50 transition-all font-black`}
              />
              {error && <p className="text-red-500 text-[8px] font-black uppercase mt-2 animate-bounce">Access Denied: Invalid Key</p>}
            </div>
            <button 
              type="submit"
              className="w-full bg-[#d4af37] text-[#011a14] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Authenticate
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#d4af37]/10 p-4 rounded-xl border border-[#d4af37]/20">
              <p className="text-[#d4af37] text-[10px] font-black uppercase">System Unlocked</p>
              <p className="text-white/60 text-[8px] mt-1 font-bold">Modifications are now permitted for this session.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 text-left flex items-center justify-between group">
                <span className="text-[10px] font-black uppercase tracking-widest">Reset Sawab Log</span>
                <i className="fas fa-trash-can text-red-500/40 group-hover:text-red-500"></i>
              </button>
              <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 text-left flex items-center justify-between group">
                <span className="text-[10px] font-black uppercase tracking-widest">Update Prayer Times</span>
                <i className="fas fa-clock text-[#d4af37]"></i>
              </button>
              <button onClick={onLock} className="w-full border border-red-500/20 text-red-500 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest mt-4">
                Revoke Authority
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-[6px] text-white/20 font-black uppercase tracking-[0.5em]">SMT HUB SECURITY V2.0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
