
import React, { useEffect } from 'react';
import { User } from '../types';
import { Language, translations } from '../translations';

interface WelcomePageProps {
  user: User;
  onContinue: () => void;
  language: Language;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ user, onContinue, language }) => {
  const t = translations[language];
  useEffect(() => {
    const timer = setTimeout(onContinue, 5000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
      
      <div className="relative z-10 max-w-2xl w-full px-6 text-center animate-in fade-in zoom-in duration-700">
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-30 animate-ping"></div>
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-32 h-32 rounded-full border-4 border-indigo-500/30 relative z-10 mx-auto shadow-2xl"
          />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          {t.welcome}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user.name.split(' ')[0]}</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-md mx-auto leading-relaxed">
          {t.placeholderMsg}
        </p>
        
        <button
          onClick={onContinue}
          className="group relative px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <span className="flex items-center gap-2">
            {t.launchDashboard}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
