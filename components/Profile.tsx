
import React, { useState } from 'react';
import { User } from '../types';
import { Language, translations } from '../translations';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  isDarkMode?: boolean;
  setThemePreference?: (pref: 'light' | 'dark' | 'auto') => void;
  language: Language;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, isDarkMode, setThemePreference, language }) => {
  const t = translations[language];
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({
    name: user.name,
    email: user.email,
    constituency: user.constituency || '',
    state: user.state || ''
  });

  const [weights, setWeights] = useState({
    attendance: 25,
    debates: 25,
    bills: 25,
    promise: 25
  });

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdateUser({
      ...user,
      name: editedUser.name || user.name,
      email: editedUser.email || user.email,
      constituency: editedUser.constituency,
      state: editedUser.state
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* 1. Profile Header Card */}
      <div className="bg-blue-600 rounded-xl p-8 text-white flex items-center gap-6 shadow-lg shadow-blue-500/20">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 shrink-0 overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="space-y-2">
          {isEditing ? (
            <input 
              type="text" 
              value={editedUser.name}
              onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-2xl font-bold outline-none focus:ring-2 focus:ring-white/30"
            />
          ) : (
            <h1 className="text-3xl font-bold">{user.name}</h1>
          )}
          
          {isEditing ? (
            <input 
              type="email" 
              value={editedUser.email}
              onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
              className="block w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-white/30"
            />
          ) : (
            <p className="text-blue-100 opacity-90 text-sm">{user.email}</p>
          )}

          <div className="flex gap-2 mt-2">
            <span className="bg-white/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">{t.level} 1</span>
            <span className="bg-white/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">{user.credits} {t.points}</span>
          </div>
        </div>
      </div>

      {/* 2. Progress Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t.yourProgress}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl text-center">
             <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.badges}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl text-center">
             <div className="text-2xl font-bold text-green-600 dark:text-green-400">{user.credits}</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.totalPoints}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl text-center">
             <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">1</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.currentLevel}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl text-center">
             <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.following}</div>
          </div>
        </div>
      </div>

      {/* 3. Personal Information */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t.personalInfo}</h2>
          </div>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="text-xs font-bold text-white bg-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-700 transition"
          >
            {isEditing ? t.save : t.edit}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">{t.constituency}</label>
            {isEditing ? (
              <input type="text" value={editedUser.constituency} onChange={e => setEditedUser({...editedUser, constituency: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg dark:text-white" />
            ) : (
              <p className="text-sm font-medium dark:text-slate-200">{user.constituency || t.notSet}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">{t.state}</label>
            {isEditing ? (
              <input type="text" value={editedUser.state} onChange={e => setEditedUser({...editedUser, state: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg dark:text-white" />
            ) : (
              <p className="text-sm font-medium dark:text-slate-200">{user.state || t.notSet}</p>
            )}
          </div>
        </div>
      </div>

      {/* 5. Weights */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t.dashboardPrefs}</h2>
        <div className="space-y-8 mt-6">
          {[
            { id: 'attendance', label: t.attendance, value: weights.attendance },
            { id: 'debates', label: t.debates, value: weights.debates },
            { id: 'bills', label: t.bills, value: weights.bills },
            { id: 'promise', label: t.promise, value: weights.promise },
          ].map((item) => (
            <div key={item.id} className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                <span className="text-blue-600">{item.value}%</span>
              </div>
              <input type="range" min="0" max="100" value={item.value} onChange={(e) => handleWeightChange(item.id as any, parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
