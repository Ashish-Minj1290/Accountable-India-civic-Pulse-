
import React, { useState, useEffect, useMemo } from 'react';
import { ElectionIntelligence, ElectionRecord, ElectionTrend } from '../types';
import { Language, translations } from '../translations';
import { fetchElectionIntelligence } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface ElectionUpdatesProps {
  language: Language;
}

const ElectionUpdates: React.FC<ElectionUpdatesProps> = ({ language }) => {
  const t = translations[language];
  const [data, setData] = useState<ElectionIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Ongoing' | 'Past'>('Ongoing');
  const [sources, setSources] = useState<any[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await fetchElectionIntelligence();
      setData(result.data);
      setSources(result.sources);
    } catch (err) {
      console.error("Election sync failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10 * 60 * 1000); // Auto-sync every 10 mins
    return () => clearInterval(interval);
  }, []);

  const filteredRecords = useMemo(() => 
    data?.records.filter(r => r.status === activeTab) || [],
  [data, activeTab]);

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-6">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">Election Grounding Engaged</p>
          <p className="text-sm text-slate-400 font-bold">Scanning Election Commission data and real-time news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 dark:border-orange-800">
             <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
             Live Electoral Pulse
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Election Watch India</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Real-time trends, results, and upcoming schedules from across the nation.</p>
        </div>
        <button 
          onClick={fetchData} 
          disabled={isLoading}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-transparent rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white transition active:scale-95 shadow-xl disabled:opacity-50"
        >
          {isLoading ? 'SYNCING...' : 'REFRESH DATA'}
        </button>
      </div>

      {/* Visual Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Sentiment & Projection Index</h2>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full uppercase">Realtime Trends</span>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.trends} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="party" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                <Bar name="Sentiment %" dataKey="currentSentiment" fill="#f97316" radius={[8, 8, 0, 0]} barSize={40} />
                <Bar name="Projected Seats" dataKey="predictedSeats" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">Party Standing Comparison</h2>
          <div className="h-[350px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.trends}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="predictedSeats"
                  nameKey="party"
                  label
                >
                  {data?.trends.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#f97316', '#10b981', '#ef4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {data?.trends.slice(0, 4).map((t, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-white dark:border-slate-800 text-center">
                <div className="text-xl font-black text-slate-900 dark:text-white">{t.party}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Projection: {t.predictedSeats} seats</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Tabs for Election Status */}
      <div className="space-y-8">
        <div className="flex justify-center">
          <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[1.5rem] flex gap-2 border border-slate-200 dark:border-slate-800 shadow-inner">
            {(['Upcoming', 'Ongoing', 'Past'] as const).map(status => (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`px-12 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  activeTab === status 
                    ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-md ring-1 ring-slate-200 dark:ring-slate-700' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredRecords.map(record => (
            <div key={record.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-10 space-y-8 hover:shadow-2xl transition-all duration-500 group relative">
               <div className="flex justify-between items-start">
                 <div className="space-y-1">
                   <div className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{record.type}</div>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">{record.title}</h3>
                   <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {record.location}
                   </div>
                 </div>
                 <div className="px-5 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center shadow-sm">
                    <div className="text-xl font-black text-slate-900 dark:text-white leading-none">{record.date.split('/')[0]}</div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{record.date.split('/')[1]} {record.date.split('/')[2]}</div>
                 </div>
               </div>

               <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed font-medium">{record.description}</p>

               {record.results && record.results.length > 0 && (
                 <div className="space-y-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Electoral Result Snapshot</h4>
                    <div className="space-y-4">
                      {record.results.map((r, idx) => (
                        <div key={idx} className="space-y-1.5">
                           <div className="flex justify-between items-end text-xs font-black">
                             <span className="text-slate-900 dark:text-white">{r.party}</span>
                             <span className="text-slate-400">{r.seats}/{r.totalSeats} seats</span>
                           </div>
                           <div className="h-2 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(r.seats/r.totalSeats)*100}%`, backgroundColor: r.color }} />
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
               )}

               <div className="pt-8 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                  <button className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-1">
                    Deep Audit
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7M5 12h16" /></svg>
                  </button>
               </div>
            </div>
          ))}

          {filteredRecords.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
               <div className="text-7xl mb-6">🗳️</div>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white">No records synced for {activeTab}</h3>
               <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm mx-auto mt-2">The system is standing by. We synchronize data every 10 minutes from verified EC records.</p>
            </div>
          )}
        </div>
      </div>

      {/* Grounding Sources */}
      {sources.length > 0 && (
        <div className="bg-orange-50/50 dark:bg-orange-950/20 p-10 rounded-[3rem] border border-orange-100 dark:border-orange-900/30 space-y-6">
           <h3 className="text-[10px] font-black text-orange-600/60 dark:text-orange-400 uppercase tracking-[0.4em]">Electoral Verification Sources</h3>
           <div className="flex flex-wrap gap-3">
             {sources.map((s, i) => (
               <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-xl text-[10px] font-black text-orange-700 dark:text-orange-400 hover:shadow-xl hover:border-orange-400 transition flex items-center gap-2 group">
                 <svg className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                 {s.title}
               </a>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default ElectionUpdates;
