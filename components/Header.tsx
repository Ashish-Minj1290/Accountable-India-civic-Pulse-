
import React, { useState, useEffect } from 'react';
import { User, CivicNotification } from '../types';
import { ThemePreference } from '../App';
import { Language, translations } from '../translations';
import { fetchCivicNotifications } from '../services/geminiService';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onProfileClick?: () => void;
  toggleSidebar: () => void;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  language: Language;
}

const Header: React.FC<HeaderProps> = ({ 
  user, onLogout, onProfileClick, toggleSidebar, themePreference, setThemePreference, language
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<CivicNotification[]>([]);
  const [isFetchingNotifs, setIsFetchingNotifs] = useState(false);
  const t = translations[language];

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifs = async () => {
    setIsFetchingNotifs(true);
    const data = await fetchCivicNotifications({
      state: user.state,
      mode: 'Centre' // default or dynamic from app state if available
    });
    setNotifications(data);
    setIsFetchingNotifs(false);
  };

  useEffect(() => {
    fetchNotifs();
    // Auto-refresh every 15 minutes
    const interval = setInterval(fetchNotifs, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user.state]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-20 bg-transparent flex items-center justify-between px-8 md:px-12 shrink-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-500 transition border border-transparent hover:border-slate-100 dark:hover:border-slate-700 shadow-sm lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Civic Notifications Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition relative group"
          >
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-in zoom-in">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Civic Intelligence</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Timely & Relevant Notifications</p>
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Clear All</button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                  {isFetchingNotifs && notifications.length === 0 ? (
                    <div className="p-10 text-center space-y-3">
                      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Governance Data...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-10 text-center opacity-50">
                      <p className="text-sm font-bold text-slate-400">No active alerts for your region.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition group relative ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                          <div className="flex gap-4">
                            <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${
                              n.urgency === 'high' ? 'bg-rose-500 animate-pulse' : 
                              n.urgency === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{n.category}</span>
                                <span className="text-[9px] font-bold text-slate-400">{n.timestamp}</span>
                              </div>
                              <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{n.title}</h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{n.message}</p>
                              <div className="pt-2 flex items-center justify-between">
                                <span className="text-[8px] font-bold text-slate-400 italic">Source: {n.source}</span>
                                <button className="text-[8px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition">Action Required</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button onClick={fetchNotifs} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition">Refresh Feed</button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-4 p-2 pl-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition group"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-black text-slate-800 dark:text-white leading-none">{user.name}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{t.verifiedCitizen}</div>
            </div>
            <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover border-2 border-slate-50 dark:border-slate-800 shadow-inner group-hover:scale-105 transition" alt="profile" />
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <button onClick={() => { onProfileClick?.(); setShowProfile(false); }} className="w-full text-left px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">{t.yourProfile}</button>
                <hr className="my-2 border-slate-50 dark:border-slate-800" />
                <button onClick={onLogout} className="w-full text-left px-5 py-3 text-sm font-black text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition">{t.signOut}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
