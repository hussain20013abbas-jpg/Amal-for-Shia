import React from 'react';
const AdminPortal: React.FC<{onClose: () => void, isUnlocked: boolean, onUnlock: () => void, onLock: () => void}> = ({onClose}) => (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
    <div className="bg-[#022c22] p-8 rounded-lg border border-[#d4af37]">
      <h2 className="text-white">Admin Portal</h2>
      <button onClick={onClose} className="text-[#d4af37]">Close</button>
    </div>
  </div>
);
export default AdminPortal;
