
import React, { useState, useMemo } from 'react';
import { PoliticalLeader } from '../types';
import { Language, translations } from '../translations';
import { INDIAN_STATES } from './Leaders';

interface LeaderLeaderboardProps {
  leaders: PoliticalLeader[];
  language: Language;
  onSelectLeader: (id: string) => void;
}

type TabType = 'Overall' | 'Attendance' | 'Performance' | 'Ratings';

const LeaderLeaderboard: React.FC<LeaderLeaderboardProps> = ({ leaders, language, onSelectLeader }) => {
  const t = translations[language];
  const [selectedState, setSelectedState] = useState('All States');
  const [activeTab, setActiveTab] = useState<TabType>('Overall');

  const states = useMemo(() => ['All States', ...INDIAN_STATES], []);

  const sortedLeaders = useMemo(() => {
    let list = [...leaders];
    
    if (selectedState !== 'All States') {
      list = list.filter(l => l.state === selectedState);
    }

    return list.map(l => {
      let sortValue = 0;
      if (activeTab === 'Overall') {
        const parliamentary = (l.bills * 5 + l.debates * 1.5 + l.questions / 2) / 1.2;
        sortValue = Math.round((l.attendance * 0.3) + (parliamentary * 0.3) + (l.rating * 20 * 0.4));
      } else if (activeTab === 'Attendance') {
        sortValue = l.attendance;
      } else if (activeTab === 'Performance') {
        sortValue = Math.round((l.bills * 5 + l.debates * 2 + l.questions) / 2.5);
      } else if (activeTab === 'Ratings') {
        sortValue = l.rating;
      }
      return { ...l, sortValue };
    }).sort((a, b) => b.sortValue - a.sortValue);
  }, [leaders, selectedState, activeTab]);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <div className="text-amber-500 text-3xl">🏆</div>;
    if (rank === 1) return <div className="text-slate-300 text-3xl">🥈</div>;
    if (rank === 2) return <div className="text-orange-300 text-3xl">🥉</div>;
    return <div className="text-slate-300 font-black text-xl tracking-tighter">#{rank + 1}</div>;
  };

  const renderScore = (leader: any) => {
    if (activeTab === 'Ratings') {
      return (
        <div className="flex items-center gap-1 text-amber-500">
          <span className="text-2xl">★</span>
          <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{leader.rating.toFixed(1)}</span>
        </div>
      );
    }
    if (activeTab === 'Attendance') {
      return (
        <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
          {leader.attendance}%
        </div>
      );
    }
    return (
      <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
        {leader.sortValue}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Title & Subtitle */}
      <div className="text-center space-y-2 mb-12">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t.leaderLeaderboards}</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
          {t.leaderLeaderboardSubtitle}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 px-8 py-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <label className="text-sm font-bold text-slate-500 whitespace-nowrap">{t.filterByState}</label>
        <div className="relative w-full md:w-64">
           <select 
             value={selectedState}
             onChange={(e) => setSelectedState(e.target.value)}
             className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition text-sm dark:text-white font-medium appearance-none"
           >
             {states.map(s => <option key={s} value={s}>{s === 'All States' ? t.allStates : s}</option>)}
           </select>
           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
           </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="flex justify-center py-4">
        <div className="bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-2xl flex gap-1 border border-slate-100 dark:border-slate-800 shadow-inner w-full max-w-xl">
          {(['Overall', 'Attendance', 'Performance', 'Ratings'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all duration-300 ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              <div className="mb-0.5">
                {tab === 'Overall' && <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" /></svg>}
                {tab === 'Attendance' && <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>}
                {tab === 'Performance' && <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
                {tab === 'Ratings' && <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider">{t[tab.toLowerCase() as keyof typeof t] || tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Leader List Container */}
      <div className="max-w-4xl mx-auto space-y-1">
        {sortedLeaders.map((leader, index) => {
          const isTop3 = index < 3;
          return (
            <div 
              key={leader.id} 
              onClick={() => onSelectLeader(leader.id)}
              className={`
                flex items-center justify-between px-8 py-7 rounded-xl transition-all duration-300 hover:shadow-lg hover:z-10 group cursor-pointer
                ${isTop3 
                  ? 'bg-amber-50/40 dark:bg-amber-900/10 border-none' 
                  : 'bg-white dark:bg-slate-900 border-none'
                }
                mb-2
              `}
            >
              <div className="flex items-center gap-10">
                <div className="w-12 flex justify-center shrink-0">
                  {getRankIcon(index)}
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{leader.name}</h4>
                  <div className="text-xs font-bold text-slate-400 group-hover:text-slate-500 transition">{leader.constituency}, {leader.state}</div>
                  <div className="flex gap-2 pt-2">
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-[9px] font-black text-blue-600 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-800 uppercase tracking-widest">{leader.party}</span>
                    <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-[9px] font-black text-slate-500 dark:text-slate-400 rounded-md border border-slate-100 dark:border-slate-800 uppercase tracking-widest">{leader.role}</span>
                  </div>
                </div>
              </div>

              {renderScore(leader)}
            </div>
          );
        })}

        {sortedLeaders.length === 0 && (
           <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
             <div className="text-4xl mb-4 opacity-20">📍</div>
             <h3 className="text-xl font-black text-slate-800 dark:text-white">No data available for this selection</h3>
             <p className="text-slate-400 font-bold text-sm">Try adjusting your filters.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default LeaderLeaderboard;
