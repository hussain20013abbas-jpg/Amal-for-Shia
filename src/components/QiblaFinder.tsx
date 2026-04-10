import React, { useState, useEffect } from 'react';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const QiblaFinder: React.FC = () => {
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);

  useEffect(() => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setNeedsPermission(true);
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const qibla = calculateQibla(latitude, longitude);
        setQiblaDirection(qibla);
        setLoading(false);
      },
      (err) => {
        setError(`Failed to get location: ${err.message}`);
        setLoading(false);
      }
    );

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading = 0;
      if ((event as any).webkitCompassHeading !== undefined) {
        // iOS
        heading = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android
        heading = 360 - event.alpha;
      }
      setCompassHeading(heading);
    };

    if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const handleRequestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setNeedsPermission(false);
          const handleOrientation = (event: DeviceOrientationEvent) => {
            let heading = 0;
            if ((event as any).webkitCompassHeading !== undefined) {
              heading = (event as any).webkitCompassHeading;
            } else if (event.alpha !== null) {
              heading = 360 - event.alpha;
            }
            setCompassHeading(heading);
          };
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setError("Permission to access device orientation was denied.");
        }
      } catch (err) {
        setError("Error requesting device orientation permission.");
      }
    }
  };

  const calculateQibla = (lat: number, lng: number) => {
    const φ1 = lat * (Math.PI / 180);
    const φ2 = KAABA_LAT * (Math.PI / 180);
    const Δλ = (KAABA_LNG - lng) * (Math.PI / 180);

    const y = Math.sin(Δλ);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    return (qibla + 360) % 360;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="w-16 h-16 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin"></div>
        <p className="text-[#d4af37] font-black uppercase tracking-widest animate-pulse">Locating Sacred Direction...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-10 rounded-[3rem] border-2 border-red-500/20 bg-red-500/5 text-center max-w-md mx-auto">
        <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-6"></i>
        <p className="text-white/80 font-medium mb-4">{error}</p>
        <p className="text-white/40 text-xs">Please ensure location services are enabled and permissions are granted.</p>
      </div>
    );
  }

  const relativeQibla = qiblaDirection !== null ? (qiblaDirection - compassHeading + 360) % 360 : 0;

  return (
    <div className="space-y-12 animate-in fade-in max-w-4xl mx-auto py-10">
      <header className="text-center mb-16">
        <h2 className="text-6xl font-black luxury-text uppercase mb-4 tracking-tighter">Qibla Finder</h2>
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em]">Aligning with the House of Allah</p>
      </header>

      <div className="flex flex-col items-center justify-center space-y-12">
        {needsPermission && (
          <div className="glass-card p-8 rounded-3xl border-2 border-[#d4af37]/30 bg-[#d4af37]/5 text-center max-w-md mx-auto animate-in zoom-in">
            <i className="fas fa-mobile-screen text-4xl text-[#d4af37] mb-6"></i>
            <h3 className="text-xl font-black luxury-text uppercase mb-4 tracking-widest">Compass Permission</h3>
            <p className="text-white/60 text-xs mb-8 leading-relaxed">iOS requires explicit permission to access the device's compass for accurate Qibla orientation.</p>
            <button 
              onClick={handleRequestPermission}
              className="w-full bg-[#d4af37] text-[#022c22] py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              Grant Compass Access
            </button>
          </div>
        )}

        <div className="relative w-80 h-80 md:w-96 md:h-96">
          {/* Compass Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-white/5 shadow-2xl"></div>
          <div className="absolute inset-4 rounded-full border-2 border-[#d4af37]/10"></div>
          
          {/* Compass Markings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full relative" style={{ transform: `rotate(${-compassHeading}deg)`, transition: 'transform 0.1s ease-out' }}>
              <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[#d4af37] font-black text-xl">N</span>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 font-black text-xl">S</span>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-black text-xl">W</span>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-black text-xl">E</span>
            </div>
          </div>

          {/* Qibla Indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-full h-full relative flex items-center justify-center"
              style={{ transform: `rotate(${relativeQibla}deg)`, transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <div className="absolute top-0 flex flex-col items-center">
                <div className="w-1 h-32 bg-gradient-to-t from-[#d4af37] to-transparent rounded-full shadow-[0_0_20px_#d4af37]"></div>
                <div className="w-12 h-12 bg-[#d4af37] rounded-xl flex items-center justify-center shadow-lg -mt-6 rotate-45 border-2 border-[#022c22]">
                  <i className="fas fa-kaaba text-[#022c22] -rotate-45 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Center Point */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-[#d4af37] rounded-full shadow-[0_0_15px_#d4af37] border-2 border-[#022c22]"></div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] border-white/5 bg-white/[0.02] text-center space-y-4 max-w-sm w-full">
          <div className="flex justify-between items-center px-4">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Qibla Angle</span>
            <span className="text-xl font-black text-[#d4af37] tabular-nums">{Math.round(qiblaDirection || 0)}°</span>
          </div>
          <div className="h-px bg-white/5 w-full"></div>
          <div className="flex justify-between items-center px-4">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Your Heading</span>
            <span className="text-xl font-black text-white/80 tabular-nums">{Math.round(compassHeading)}°</span>
          </div>
          
          <div className="pt-6">
            <p className="text-[9px] font-black text-[#d4af37] uppercase tracking-[0.3em] animate-pulse">
              {Math.abs(relativeQibla) < 5 ? "Perfectly Aligned" : "Rotate device to align"}
            </p>
          </div>
        </div>

        <div className="text-center max-w-md px-6">
          <p className="text-white/30 text-[10px] font-medium leading-relaxed uppercase tracking-widest">
            Hold your device flat and away from magnetic interference for the most accurate reading.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QiblaFinder;
