
import React, { useState } from 'react';
import { ThemePreference } from '../App';
import { User } from '../types';
import { Language, translations } from '../translations';

interface SettingsProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  onNavigate?: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

type SettingsTab = 'Appearance' | 'Profile' | 'Account';

const Settings: React.FC<SettingsProps> = ({ 
  user, onUpdateUser, themePreference, setThemePreference, onNavigate, language, setLanguage 
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Appearance');
  const t = translations[language];

  const languages: { id: Language; name: string; native: string }[] = [
    { id: 'en', name: 'English', native: 'English' },
    { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { id: 'bn', name: 'Bengali', native: 'বাংলা' },
    { id: 'mr', name: 'Marathi', native: 'मराठी' },
    { id: 'te', name: 'Telugu', native: 'తెలుగు' },
    { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { id: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { id: 'ur', name: 'Urdu', native: 'اردو' },
    { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { id: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { id: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Appearance':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.theme}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setThemePreference('light')}
                  className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all ${
                    themePreference === 'light'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${themePreference === 'light' ? 'text-blue-500' : 'text-slate-400'}`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                  </div>
                  <span className={`font-bold ${themePreference === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{t.light}</span>
                  <span className="text-xs text-slate-400 mt-1">{t.dayMode}</span>
                </button>

                <button
                  onClick={() => setThemePreference('dark')}
                  className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all ${
                    themePreference === 'dark'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${themePreference === 'dark' ? 'text-blue-500' : 'text-slate-400'}`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <span className={`font-bold ${themePreference === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{t.dark}</span>
                  <span className="text-xs text-slate-400 mt-1">{t.nightMode}</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.language}</h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{t.selectLanguage}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                      language === lang.id
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-lg font-black">{lang.native}</span>
                    <span className="text-[10px] uppercase font-bold opacity-60">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'Profile':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <svg className="w-6 h-6 text-slate-800 dark:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t.personalInfo}</h3>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 via-emerald-500 to-green-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {user.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900 dark:text-white">{user.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>

            <div className="mb-8">
              <button 
                onClick={() => onNavigate?.('profile')}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
              >
                <span className="text-sm font-bold text-slate-900 dark:text-white">{t.viewEditProfile}</span>
                <svg className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#f0f7ff] dark:bg-blue-900/20 p-6 rounded-xl text-center space-y-1">
                <div className="text-3xl font-black text-[#2563eb]">{user.credits}</div>
                <div className="text-sm font-medium text-[#64748b] dark:text-slate-400">{t.points}</div>
              </div>
              <div className="bg-[#f0fdf4] dark:bg-emerald-900/20 p-6 rounded-xl text-center space-y-1">
                <div className="text-3xl font-black text-[#16a34a]">1</div>
                <div className="text-sm font-medium text-[#64748b] dark:text-slate-400">{t.level}</div>
              </div>
              <div className="bg-[#faf5ff] dark:bg-purple-900/20 p-6 rounded-xl text-center space-y-1">
                <div className="text-3xl font-black text-[#9333ea]">0</div>
                <div className="text-sm font-medium text-[#64748b] dark:text-slate-400">{t.badges}</div>
              </div>
            </div>
          </div>
        );
      case 'Account':
        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t.account} Security</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Account verification and password settings coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{t.settings}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Manage your account preferences and settings</p>
      </header>

      <div className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl flex items-center gap-1 mb-10 w-full sm:w-fit border border-slate-200 dark:border-slate-800">
        {(['Appearance', 'Profile', 'Account'] as SettingsTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 sm:px-12 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'Appearance' ? t.appearance : tab === 'Profile' ? t.profile : t.account}
          </button>
        ))}
      </div>

      <main>
        {renderTabContent()}
      </main>
    </div>
  );
};

export default Settings;
