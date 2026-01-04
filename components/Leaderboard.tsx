
import React, { useState, useMemo, useEffect } from 'react';
import { User, LeaderboardUser, PoliticalLeader } from '../types';
import { Language, translations } from '../translations';
import LeaderLeaderboard from './LeaderLeaderboard';
import LeaderProfile from './LeaderProfile';

interface LeaderboardProps {
  user: User;
  language: Language;
}

const DAILY_MOCK: LeaderboardUser[] = [
  { id: 'l1', name: 'Sophia Chen', avatar: 'https://i.pravatar.cc/150?u=l1', score: 45, rank: 1 },
  { id: 'l2', name: 'Marco Rossi', avatar: 'https://i.pravatar.cc/150?u=l2', score: 42, rank: 2 },
  { id: 'l3', name: 'Yuki Tanaka', avatar: 'https://i.pravatar.cc/150?u=l3', score: 38, rank: 3 },
  { id: 'l4', name: 'Amara Diop', avatar: 'https://i.pravatar.cc/150?u=l4', score: 35, rank: 4 },
  { id: 'l5', name: 'Liam Wilson', avatar: 'https://i.pravatar.cc/150?u=l5', score: 30, rank: 5 },
  { id: 'l6', name: 'Elena Gomez', avatar: 'https://i.pravatar.cc/150?u=l6', score: 28, rank: 6 },
  { id: 'l7', name: 'Dev Patel', avatar: 'https://i.pravatar.cc/150?u=l7', score: 25, rank: 7 },
  { id: 'l8', name: 'Emma Brown', avatar: 'https://i.pravatar.cc/150?u=l8', score: 22, rank: 8 },
  { id: 'l9', name: 'Noah Miller', avatar: 'https://i.pravatar.cc/150?u=l9', score: 20, rank: 9 },
  { id: 'l10', name: 'Olivia Davis', avatar: 'https://i.pravatar.cc/150?u=l10', score: 18, rank: 10 },
];

const WEEKLY_MOCK: LeaderboardUser[] = [
  { id: 'w1', name: 'Dev Patel', avatar: 'https://i.pravatar.cc/150?u=l7', score: 245, rank: 1 },
  { id: 'w2', name: 'Sophia Chen', avatar: 'https://i.pravatar.cc/150?u=l1', score: 230, rank: 2 },
  { id: 'w3', name: 'Amara Diop', avatar: 'https://i.pravatar.cc/150?u=l4', score: 215, rank: 3 },
  { id: 'w4', name: 'Liam Wilson', avatar: 'https://i.pravatar.cc/150?u=l5', score: 190, rank: 4 },
  { id: 'w5', name: 'Elena Gomez', avatar: 'https://i.pravatar.cc/150?u=l6', score: 175, rank: 5 },
  { id: 'w6', name: 'Noah Miller', avatar: 'https://i.pravatar.cc/150?u=l9', score: 160, rank: 6 },
  { id: 'w7', name: 'Olivia Davis', avatar: 'https://i.pravatar.cc/150?u=l10', score: 155, rank: 7 },
  { id: 'w8', name: 'Yuki Tanaka', avatar: 'https://i.pravatar.cc/150?u=l3', score: 140, rank: 8 },
  { id: 'w9', name: 'Emma Brown', avatar: 'https://i.pravatar.cc/150?u=l8', score: 130, rank: 9 },
  { id: 'w10', name: 'Marco Rossi', avatar: 'https://i.pravatar.cc/150?u=l2', score: 120, rank: 10 },
];

const Leaderboard: React.FC<LeaderboardProps> = ({ user, language }) => {
  const t = translations[language];
  const [boardType, setBoardType] = useState<'citizen' | 'leader'>('leader');
  const [mode, setMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);
  
  // Dynamic state for leaders synchronized with the main repository
  const [politicalLeaders, setPoliticalLeaders] = useState<PoliticalLeader[]>([]);

  useEffect(() => {
    // Load latest leaders from shared storage
    const loadLeaders = () => {
      const saved = localStorage.getItem('accountable_leaders');
      if (saved) {
        setPoliticalLeaders(JSON.parse(saved));
      }
    };

    loadLeaders();
    // Listen for storage changes if multiple tabs are open (optional but good practice)
    window.addEventListener('storage', loadLeaders);
    return () => window.removeEventListener('storage', loadLeaders);
  }, []);

  const citizenData = mode === 'daily' ? DAILY_MOCK : WEEKLY_MOCK;
  const topThreeCitizens = citizenData.slice(0, 3);
  const restCitizens = citizenData.slice(3);

  const selectedLeader = useMemo(() => 
    politicalLeaders.find(l => l.id === selectedLeaderId),
  [selectedLeaderId, politicalLeaders]);

  if (selectedLeaderId && selectedLeader) {
    return (
      <LeaderProfile 
        leader={selectedLeader} 
        onBack={() => setSelectedLeaderId(null)} 
        language={language} 
        onUpdateRating={(id, newRating) => {
          setPoliticalLeaders(prev => {
            const updated = prev.map(l => {
              if (l.id === id) {
                const newCount = l.ratingCount + 1;
                const avgRating = ((l.rating * l.ratingCount) + newRating) / newCount;
                return { ...l, rating: Number(avgRating.toFixed(1)), ratingCount: newCount };
              }
              return l;
            });
            localStorage.setItem('accountable_leaders', JSON.stringify(updated));
            return updated;
          });
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* Primary Global Switch */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-200/50 dark:bg-slate-800 p-1 rounded-2xl flex gap-1 shadow-inner border border-slate-200/20">
          <button 
            onClick={() => { setBoardType('leader'); setSelectedLeaderId(null); }}
            className={`px-10 py-3 rounded-xl font-black text-sm transition-all duration-300 flex items-center gap-2 ${boardType === 'leader' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            {t.politicalLeaders}
          </button>
          <button 
            onClick={() => { setBoardType('citizen'); setSelectedLeaderId(null); }}
            className={`px-10 py-3 rounded-xl font-black text-sm transition-all duration-300 flex items-center gap-2 ${boardType === 'citizen' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            {t.citizenImpact}
          </button>
        </div>
      </div>

      {boardType === 'leader' ? (
        <LeaderLeaderboard 
          leaders={politicalLeaders} 
          language={language} 
          onSelectLeader={(id) => setSelectedLeaderId(id)}
        />
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Hall of Fame Banner */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden text-white">
            <h2 className="text-3xl font-extrabold mb-4 flex items-center gap-3 relative z-10">
               <span className="p-2 bg-white/20 rounded-lg">🏆</span>
               {t.hallOfFame}
            </h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-2xl font-medium relative z-10">
              {t.heroDescription}
            </p>
            <div className="flex flex-wrap gap-2 relative z-10">
              {WEEKLY_MOCK.map((hero) => (
                <div key={hero.id} className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition cursor-default">
                  <img src={hero.avatar} className="w-6 h-6 rounded-full border border-white/30" alt={hero.name} />
                  <span className="text-xs font-bold uppercase tracking-wider">{hero.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-1 shadow-inner">
              <button 
                onClick={() => setMode('daily')}
                className={`px-8 py-2.5 rounded-xl font-bold text-sm transition ${mode === 'daily' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {t.dailyImpact}
              </button>
              <button 
                onClick={() => setMode('weekly')}
                className={`px-8 py-2.5 rounded-xl font-bold text-sm transition ${mode === 'weekly' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {t.weeklyChampions}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto px-4">
            {topThreeCitizens.map((hero, idx) => {
              const rankPos = idx === 0 ? 1 : idx === 1 ? 2 : 3;
              return (
                <div key={hero.id} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 flex flex-col items-center justify-center relative shadow-xl hover:-translate-y-2 transition duration-500 ${idx === 0 ? 'h-80 border-amber-300 dark:border-amber-700/50 order-1 md:order-2' : idx === 1 ? 'h-64 order-2 md:order-1' : 'h-56 order-3 md:order-3'}`}>
                  <img src={hero.avatar} className={`rounded-full border-4 shadow-lg ${idx === 0 ? 'w-24 h-24 border-amber-400' : 'w-20 h-20 border-slate-300'}`} alt="" />
                  <h4 className="font-bold text-slate-800 dark:text-white mb-1 mt-4">{hero.name}</h4>
                  <p className="text-indigo-500 font-bold text-xl">{hero.score}</p>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{t.points}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-3xl mx-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
               <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.contributors}</span>
               <span className="text-xs font-medium text-indigo-500">{t.updatedEvery}</span>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {restCitizens.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition duration-300">
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center font-bold text-slate-400">#{item.rank}</span>
                    <img src={item.avatar} className="w-10 h-10 rounded-xl" alt="" />
                    <span className="font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                  </div>
                  <div className="font-black text-slate-900 dark:text-white">{item.score}</div>
                </div>
              ))}
              <div className="p-5 bg-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="w-8 text-center font-black">#24</span>
                  <img src={user.avatar} className="w-12 h-12 rounded-2xl border-2 border-white/30" alt="" />
                  <span className="font-black text-lg">You</span>
                </div>
                <div className="text-right">
                  <div className="font-black text-2xl">{mode === 'daily' ? user.impactScore.daily : user.impactScore.weekly}</div>
                  <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">{t.yourPoints}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
