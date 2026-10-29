import React, { useEffect, useState } from 'react';
import { Sparkles, Brain, ArrowRight } from 'lucide-react';

const Splash = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        onFinish();
      }, 500); // 500ms fade transition
    }, 2000); // 2 seconds display

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50/50 to-teal-50/40 transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient ripples */}
      <div className="relative flex items-center justify-center">
        {/* Animated outer waves */}
        <div className="absolute w-64 h-64 rounded-full border-2 border-sky-300/50 animate-wave-ripple" />
        <div className="absolute w-48 h-48 rounded-full border border-teal-400/40 animate-pulse-ring" />
        
        {/* Center Logo Container */}
        <div className="relative z-10 w-32 h-32 rounded-3xl bg-white shadow-2xl shadow-sky-500/15 border border-sky-100 p-2.5 flex items-center justify-center transform transition-transform hover:scale-105 duration-300">
          <img
            src="/logo_icon.png"
            alt="Inventra AI Logo"
            className="w-full h-full object-contain rounded-2xl drop-shadow-xs"
          />
        </div>
      </div>

      {/* Brand Title and Tagline */}
      <div className="mt-8 text-center px-4">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-2">
          Inventra <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500">AI</span>
        </h1>
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-sky-600" />
          <p className="text-[11px] sm:text-xs font-bold tracking-widest uppercase">
            <span className="text-sky-700">Retail Demand Prediction</span>{' '}
            <span className="text-emerald-600">&amp; Inventory Optimization</span>
          </p>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-emerald-600" />
        </div>
      </div>

      {/* Subtle loader bar */}
      <div className="mt-8 w-44 h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 rounded-full w-full animate-[progress_1.8s_ease-in-out]" />
      </div>
    </div>
  );
};

export default Splash;
