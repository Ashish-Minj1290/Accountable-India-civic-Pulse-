
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PoliticalPromise } from '../types';
import { Language, translations } from '../translations';
import { fetchAndVerifyPromises } from '../services/geminiService';

interface PromiseTrackerProps {
  language: Language;
}

const INITIAL_PROMISES: PoliticalPromise[] = [
  {
    id: 'p1',
    title: 'Street Vendor Welfare Scheme',
    description: 'Provide identity cards and insurance to registered street vendors',
    authority: 'Ministry of Housing and Urban Affairs',
    party: 'BJP',
    date: '20/12/2024',
    targetDate: '31/03/2025',
    status: 'In Progress',
    category: 'Social Welfare',
    scope: 'State',
    progress: 75,
    sourceUrl: 'https://pib.gov.in'
  },
  {
    id: 'p2',
    title: 'Digital Village Connectivity',
    description: 'Extend high-speed broadband to 5,000 remote villages by year end.',
    authority: 'Ministry of Electronics and IT',
    party: 'BJP',
    date: '15/10/2024',
    targetDate: '31/12/2024',
    status: 'Delayed',
    category: 'Infrastructure',
    scope: 'Centre',
    progress: 40,
    sourceUrl: 'https://india.gov.in'
  }
];

const PromiseTracker: React.FC<PromiseTrackerProps> = ({ language }) => {
  const t = translations[language];
  const [promises, setPromises] = useState<PoliticalPromise[]>(() => {
    const saved = localStorage.getItem('accountable_verified_promises_v2');
    return saved ? JSON.parse(saved) : INITIAL_PROMISES;
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncSources, setLastSyncSources] = useState<any[]>([]);
  
  // Use ReturnType<typeof setTimeout> to avoid NodeJS.Timeout error in browser context
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    localStorage.setItem('accountable_verified_promises_v2', JSON.stringify(promises));
  }, [promises]);

  // Auto-fetch logic: Trigger sync automatically when user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.length > 3) {
      debounceRef.current = setTimeout(() => {
        handleAISync();
      }, 2000);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleAISync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await fetchAndVerifyPromises(searchQuery || undefined);
      if (result.promises && result.promises.length > 0) {
        const newPromises = result.promises.map((p: any) => ({
          ...p,
          id: Math.random().toString(36).substr(2, 9)
        }));
        
        const existingTitles = new Set(promises.map(p => p.title.toLowerCase()));
        const uniqueNew = newPromises.filter((np: any) => !existingTitles.has(np.title.toLowerCase()));
        
        setPromises(prev => [...uniqueNew, ...prev]);
        setLastSyncSources(result.sources);
      }
    } catch (err) {
      console.error("Promise Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(promises.map(p => p.category));
    return ['All Categories', ...Array.from(cats)];
  }, [promises]);

  const filteredPromises = useMemo(() => {
    return promises.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.authority.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'All Categories' || p.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, statusFilter, categoryFilter, promises]);

  const stats = useMemo(() => ({
    total: filteredPromises.length,
    completed: filteredPromises.filter(p => p.status === 'Completed' || p.status === 'Resolved').length,
    inProgress: filteredPromises.filter(p => p.status === 'In Progress' || p.status === 'Processing' || p.status === 'Active').length,
    delayed: filteredPromises.filter(p => p.status === 'Delayed').length
  }), [filteredPromises]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800 mb-2">
           <svg className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
           {isSyncing ? 'Auto-fetch Engine Engaged' : 'Live Verification Engine Active'}
        </div>
        <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">{t.promiseTracker}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">AI-synchronized tracking of official manifestos and government notifications.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full relative">
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="e.g., 'Health Policy 2025' or 'UP Infrastructure Promises'..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition font-medium dark:text-white"
          />
        </div>
        <button 
          onClick={handleAISync}
          disabled={isSyncing}
          className="w-full md:w-auto px-10 py-4 bg-slate-900 dark:bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/30 hover:opacity-90 transition flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
        >
          {isSyncing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          )}
          {isSyncing ? 'Auto-verifying...' : 'Verify & Track'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: t.total, val: stats.total, color: 'indigo', icon: '📋' },
          { label: t.completed, val: stats.completed, color: 'emerald', icon: '✅' },
          { label: t.inProgress, val: stats.inProgress, color: 'blue', icon: '⏳' },
          { label: t.delayed, val: stats.delayed, color: 'orange', icon: '⚠️' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className={`text-4xl font-black text-${s.color}-600 dark:text-${s.color}-400`}>{s.val}</h3>
            </div>
            <div className="text-3xl grayscale opacity-50">{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none font-bold appearance-none dark:text-white text-sm"
        >
          <option>{t.allStatus}</option>
          <option value="Completed">Verified Completed</option>
          <option value="In Progress">Processing</option>
          <option value="Active">Active/New</option>
          <option value="Delayed">Delayed/Stalled</option>
        </select>
        <select 
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none font-bold appearance-none dark:text-white text-sm"
        >
          {categories.map(c => <option key={c} value={c}>{c === 'All Categories' ? t.allCategories : c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPromises.map(promise => (
          <div key={promise.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-8 space-y-6 transition-all hover:shadow-2xl hover:-translate-y-1 group border-t-8 border-t-transparent hover:border-t-indigo-500">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                 <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-black text-indigo-600 dark:text-indigo-400 rounded-lg uppercase tracking-wider">{promise.category}</span>
                 <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 rounded-lg uppercase tracking-wider">{promise.scope}</span>
                 {promise.sourceUrl && (
                   <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-[10px] font-black text-emerald-600 dark:text-emerald-400 rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                     <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                     Verified Source
                   </span>
                 )}
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{promise.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">{promise.description}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-3">
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-widest">Authority</span>
                  <span className="text-slate-900 dark:text-white font-black">{promise.authority}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-widest">Party</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">{promise.party}</span>
               </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Implementation Progress</span>
                <span className={`${promise.progress === 100 ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>{promise.progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${
                    promise.status === 'Completed' || promise.progress === 100 ? 'bg-emerald-500' :
                    promise.status === 'Delayed' ? 'bg-orange-500' : 'bg-indigo-600'
                  }`} 
                  style={{ width: `${promise.progress}%` }} 
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    promise.status === 'Completed' ? 'bg-emerald-500' :
                    promise.status === 'Delayed' ? 'bg-orange-500' : 'bg-indigo-500'
                  }`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{promise.status}</span>
               </div>
               <div className="flex items-center gap-4">
                 {promise.sourceUrl && (
                   <a 
                     href={promise.sourceUrl} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest flex items-center gap-1"
                   >
                     Evidence
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                   </a>
                 )}
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Target: <span className="text-slate-900 dark:text-slate-200">{promise.targetDate}</span>
                 </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPromises.length === 0 && !isSyncing && (
        <div className="flex flex-col items-center justify-center p-24 text-center bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in">
           <div className="text-9xl mb-8 opacity-20">🔍</div>
           <h3 className="text-4xl font-black text-slate-800 dark:text-white mb-4">No verified records found</h3>
           <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md mx-auto text-lg leading-relaxed">
             Start typing to engage the AI grounding engine. It will automatically scour live government news and manifestos based on your search.
           </p>
        </div>
      )}
    </div>
  );
};

export default PromiseTracker;
