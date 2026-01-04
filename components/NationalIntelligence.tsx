
import React, { useState, useEffect } from 'react';
// Fixed: Language type is exported from translations, not types
import { NationalIntel } from '../types';
import { Language, translations } from '../translations';
import { fetchNationalIntelligence } from '../services/geminiService';

interface NationalIntelligenceProps {
  language: Language;
}

const NationalIntelligence: React.FC<NationalIntelligenceProps> = ({ language }) => {
  const t = translations[language];
  const [data, setData] = useState<NationalIntel | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const result = await fetchNationalIntelligence();
    setData(result.data);
    setSources(result.sources);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-6">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center space-y-2">
          <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">Synchronizing National Intel</p>
          <p className="text-sm text-slate-400 font-bold">Accessing Grounded Government Data via Gemini 3...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4">Intelligence Feed Unavailable</h3>
        <button onClick={fetchData} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">Retry Sync</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">State of the Nation</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Grounded real-time analysis of the Central Government of India.</p>
        </div>
        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest text-indigo-600 hover:shadow-lg transition active:scale-95 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh Feed
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Schemes & Decisions */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600">🇮🇳</span>
              National Schemes & Progress
            </h2>
            <div className="space-y-6">
              {data.schemes.map((s, i) => (
                <div key={i} className="group p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 transition duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{s.title}</h3>
                    <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-50/50">{s.status}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{s.impact}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600">📜</span>
              Ministry Policy Decisions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.decisions.map((d, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl space-y-3">
                  <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{d.ministry}</div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">{d.decision}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Infrastructure, Parliament & Impact */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-indigo-500/20 space-y-8">
            <h2 className="text-xl font-black flex items-center gap-3">
              <span className="p-2 bg-white/20 rounded-xl">🏗️</span>
              Infrastructure Pulse
            </h2>
            <div className="space-y-8">
              {data.infrastructure.map((inf, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black">{inf.project}</span>
                    <span className="text-xs font-bold opacity-80">{inf.progress}%</span>
                  </div>
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-1000" style={{ width: `${inf.progress}%` }} />
                  </div>
                  <p className="text-[11px] font-medium opacity-90 leading-relaxed italic">{inf.details}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
               <span className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-xl text-rose-600">🏛️</span>
               Parliamentary Watch
            </h2>
            <div className="space-y-6">
              {data.parliament.map((p, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter w-16 pt-1">{p.date}</div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-black text-slate-800 dark:text-white group-hover:text-rose-500 transition-colors leading-tight">{p.event}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 dark:bg-black p-10 rounded-[2.5rem] text-white space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Nationwide Civic Impact</h2>
            <p className="text-lg font-bold leading-relaxed">{data.impact.summary}</p>
            <div className="space-y-3 pt-4 border-t border-slate-800">
              {data.impact.highlights.map((h, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2" />
                  <span className="text-xs font-bold text-slate-400">{h}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Sources Grounding */}
      {sources.length > 0 && (
        <div className="p-10 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Verified Verification Sources</h3>
          <div className="flex flex-wrap gap-3">
            {sources.map((s, i) => (
              <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:shadow-lg transition flex items-center gap-2 group">
                <svg className="w-3 h-3 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                {s.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalIntelligence;
