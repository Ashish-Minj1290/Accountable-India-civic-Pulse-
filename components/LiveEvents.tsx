
import React, { useState, useMemo, useEffect } from 'react';
import { LiveEvent } from '../types';
import { Language, translations } from '../translations';
import { fetchLiveEventsAndProjects } from '../services/geminiService';

interface LiveEventsProps {
  language: Language;
}

const MOCK_EVENTS: LiveEvent[] = [
  {
    id: 'e1',
    title: 'Parliament Session: Real-time Update',
    category: 'Parliament Session',
    description: 'Initial data being synced from live sources. Please refresh to get latest highlights.',
    status: 'Live',
    date: new Date().toLocaleDateString(),
    time: 'Loading...',
    views: 0,
    highlights: ['Fetching live highlights...']
  }
];

const LiveEvents: React.FC<LiveEventsProps> = ({ language }) => {
  const t = translations[language] || translations['en'];
  const [activeTab, setActiveTab] = useState<string>('Live');
  const [lastSync, setLastSync] = useState<number>(() => {
    const saved = localStorage.getItem('accountable_live_sync_time');
    return saved ? parseInt(saved) : 0;
  });

  const [events, setEvents] = useState<LiveEvent[]>(() => {
    const saved = localStorage.getItem('accountable_live_events');
    return saved ? JSON.parse(saved) : MOCK_EVENTS;
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('accountable_live_events', JSON.stringify(events));
    localStorage.setItem('accountable_live_sync_time', lastSync.toString());
  }, [events, lastSync]);

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      const result = await fetchLiveEventsAndProjects();
      if (result.data && result.data.length > 0) {
        setEvents(result.data);
        setSources(result.sources);
        setLastSync(Date.now());
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync if data is older than 30 minutes
  useEffect(() => {
    const THIRTY_MINUTES = 30 * 60 * 1000;
    if (Date.now() - lastSync > THIRTY_MINUTES) {
      handleSyncData();
    }
  }, []);

  const stats = useMemo(() => ({
    Live: events.filter(e => e.status === 'Live').length,
    Upcoming: events.filter(e => e.status === 'Upcoming').length,
    Ongoing: events.filter(e => e.status === 'Ongoing').length
  }), [events]);

  const filteredEvents = useMemo(() => 
    events.filter(e => e.status === activeTab),
  [activeTab, events]);

  const timeAgo = useMemo(() => {
    if (!lastSync) return 'Never';
    const diff = Math.floor((Date.now() - lastSync) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  }, [lastSync, isSyncing]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-3 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 mb-2">
           <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
           AI-Powered Governance Intelligence
        </div>
        <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">{t.liveEventCoverage}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl mx-auto">
          Synchronized real-time status of India's parliamentary sessions, political summits, and mega infrastructure projects.
        </p>
        
        <div className="flex flex-col items-center gap-4 mt-8">
          <button 
            onClick={handleSyncData}
            disabled={isSyncing}
            className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30 flex items-center gap-3 disabled:opacity-50 active:scale-95 group"
          >
            <div className={`w-6 h-6 flex items-center justify-center ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </div>
            {isSyncing ? 'Accessing Grounding Data...' : 'Sync Real-time Events'}
          </button>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Last Updated: <span className="text-indigo-600 dark:text-indigo-400">{timeAgo}</span>
          </p>
        </div>
      </div>

      {/* Navigation & Summary Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Live', id: 'Live', color: 'rose', icon: <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" /> },
          { label: 'Upcoming', id: 'Upcoming', color: 'blue', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { label: 'Ongoing Projects', id: 'Ongoing', color: 'indigo', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`p-8 rounded-[2.5rem] text-center space-y-2 border transition-all duration-300 relative overflow-hidden group ${
              activeTab === tab.id 
                ? `bg-${tab.color}-50 dark:bg-${tab.color}-900/20 border-${tab.color}-200 dark:border-${tab.color}-800 shadow-inner` 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1'
            }`}
          >
            <div className={`flex items-center justify-center gap-3 text-${tab.color}-500 mb-1`}>
              {tab.icon}
              <span className={`text-5xl font-black tracking-tighter ${activeTab === tab.id ? 'scale-110 transition-transform' : ''}`}>
                {stats[tab.id as keyof typeof stats]}
              </span>
            </div>
            <p className={`text-[11px] font-black uppercase tracking-widest ${activeTab === tab.id ? `text-${tab.color}-600 dark:text-${tab.color}-400` : 'text-slate-400'}`}>
              {tab.label}
            </p>
            {activeTab === tab.id && (
              <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-${tab.color}-500`} />
            )}
          </button>
        ))}
      </div>

      {sources.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-950/40 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
           <div className="flex items-center justify-between">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grounding Citations & Map Pins</span>
             <span className="text-[10px] font-bold text-indigo-500 uppercase">Verified Sources</span>
           </div>
           <div className="flex flex-wrap gap-3">
             {sources.map((source, i) => (
               <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:shadow-lg hover:border-indigo-300 transition flex items-center gap-2 group">
                 <svg className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                 {source.title.length > 45 ? source.title.substring(0, 45) + '...' : source.title}
               </a>
             ))}
           </div>
        </div>
      )}

      {/* Event Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-bottom-8 transition-all duration-500 hover:shadow-2xl group relative border-t-8 border-t-transparent hover:border-t-indigo-500">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                    event.status === 'Live' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 
                    event.status === 'Upcoming' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 
                    'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  }`}>
                    {event.status === 'Live' && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                    {event.status}
                  </span>
                  <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 rounded-full uppercase tracking-widest">
                    {event.category}
                  </span>
                </div>
                {event.views > 0 && (
                  <div className="flex items-center gap-2 text-slate-400 font-black text-[11px] uppercase tracking-wider">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    {event.views.toLocaleString()} Citizen Interest
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-indigo-600 transition-colors">
                  {event.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed font-medium">
                  {event.description}
                </p>
                
                <div className="flex flex-wrap gap-8 text-slate-400 font-black text-[11px] uppercase tracking-widest pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-slate-900 dark:text-slate-200">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-slate-900 dark:text-slate-200">{event.time}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5 pt-8 bg-slate-50/50 dark:bg-slate-800/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">AI</div>
                  <h3 className="text-[11px] font-black text-slate-900 dark:text-indigo-400 uppercase tracking-[0.25em]">Live Developments</h3>
                </div>
                <div className="space-y-4">
                  {event.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex gap-4 items-start group/h">
                       <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 shrink-0 group-hover/h:scale-150 transition-transform" />
                       <span className="text-sm text-slate-700 dark:text-slate-300 font-bold leading-relaxed">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="px-10 py-6 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center group-hover:bg-indigo-600 transition-all cursor-pointer">
               <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-100">Access Deep Analysis</span>
               <div className="flex items-center gap-2 text-indigo-600 group-hover:text-white">
                 <span className="text-[10px] font-black">REAL-TIME</span>
                 <svg className="w-5 h-5 group-hover:translate-x-2 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7M5 12h16" /></svg>
               </div>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-24 text-center bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-500">
             <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8 shadow-inner">
               <span className="text-7xl animate-pulse">📡</span>
             </div>
             <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">No {activeTab} Records Found</h3>
             <p className="text-slate-500 dark:text-slate-400 font-bold max-w-lg mx-auto text-lg leading-relaxed">
               Grounding engine is standing by. Click "Sync Real-time Events" to fetch verified live data for {activeTab} from across the country.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveEvents;
