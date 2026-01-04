
import React, { useState, useEffect } from 'react';
import { PoliticalPromise, User, Insight, NationalIntel, StateIntel } from '../types';
import { Language, translations } from '../translations';
import { getDashboardInsights, findNearbyCivicServices, fetchNationalIntelligence, fetchStateIntelligence } from '../services/geminiService';
import { INDIAN_STATES } from './Leaders';

interface DashboardHomeProps {
  language: Language;
  user: User;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ language, user }) => {
  const [scope, setScope] = useState<'Centre' | 'State'>('Centre');
  const [promises, setPromises] = useState<PoliticalPromise[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [nationalIntel, setNationalIntel] = useState<NationalIntel | null>(null);
  const [stateIntel, setStateIntel] = useState<StateIntel | null>(null);
  const [selectedState, setSelectedState] = useState<string>(user.state || 'Delhi');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  
  const [isInsightsLoading, setIsInsightsLoading] = useState(true);
  const [isNationalLoading, setIsNationalLoading] = useState(true);
  const [isStateLoading, setIsStateLoading] = useState(false);
  
  const [nearbyServices, setNearbyServices] = useState<{name: string, link: string}[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const saved = localStorage.getItem('nexus_complaints');
    if (saved) {
      setPromises(JSON.parse(saved));
    }

    const fetchInitialData = async () => {
      setIsInsightsLoading(true);
      setIsNationalLoading(true);
      
      const [insightData, nationalData] = await Promise.all([
        getDashboardInsights(user.name),
        fetchNationalIntelligence()
      ]);
      
      setInsights(insightData);
      setNationalIntel(nationalData.data);
      
      setIsInsightsLoading(false);
      setIsNationalLoading(false);
    };

    fetchInitialData();
  }, [user.name]);

  useEffect(() => {
    if (scope === 'State') {
      fetchStateData();
    }
  }, [scope, selectedState]);

  const fetchStateData = async () => {
    setIsStateLoading(true);
    const result = await fetchStateIntelligence(selectedState);
    setStateIntel(result.data);
    setIsStateLoading(false);
  };

  const handleFetchServices = () => {
    if (!navigator.geolocation) return;
    setIsServicesLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const data = await findNearbyCivicServices(pos.coords.latitude, pos.coords.longitude);
      setNearbyServices(data);
      setIsServicesLoading(false);
    }, () => setIsServicesLoading(false));
  };

  const stats = {
    total: promises.length,
    completed: promises.filter(p => p.status === 'Resolved' || p.status === 'Completed').length,
    inProgress: promises.filter(p => p.status === 'Processing' || p.status === 'Active').length,
    delayed: promises.filter(p => p.status === 'Delayed').length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
               {t.developIndia}
             </h1>
             <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-full flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Resilient Engine v2.0</span>
             </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            {t.trackAccountability}
          </p>
        </div>
        
        {/* Scope Toggles */}
        <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl flex gap-1 shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
          <button 
            onClick={() => setScope('Centre')}
            className={`px-8 py-2.5 rounded-xl font-black text-sm transition flex items-center gap-2 ${scope === 'Centre' ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
            {t.centre}
          </button>
          <button 
            onClick={() => setScope('State')}
            className={`px-8 py-2.5 rounded-xl font-black text-sm transition flex items-center gap-2 ${scope === 'State' ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {t.stateUt}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* AI Insights Segment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 bg-indigo-600 text-[10px] font-black text-white rounded uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Personalized AI
              </div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Citizen Insights</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isInsightsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse h-32" />
                ))
              ) : (
                insights.map((insight, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                    <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                       <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                       {insight.topic}
                    </h4>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                      {insight.summary}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* National / State Intelligence Integration (Center Section) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`px-2 py-0.5 ${scope === 'Centre' ? 'bg-emerald-600' : 'bg-orange-600'} text-[10px] font-black text-white rounded uppercase tracking-widest`}>
                  {scope === 'Centre' ? 'National Pulse' : 'State Pulse'}
                </div>
                {scope === 'State' && (
                  <div className="relative">
                    <button 
                      onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                      className="bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      {selectedState}
                      <svg className={`w-3 h-3 transition-transform ${isStateDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    
                    {isStateDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsStateDropdownOpen(false)} />
                        <div className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-40 py-2 scrollbar-hide animate-in fade-in slide-in-from-top-2 duration-200">
                          {INDIAN_STATES.map(state => (
                            <button
                              key={state}
                              onClick={() => {
                                setSelectedState(state);
                                setIsStateDropdownOpen(false);
                              }}
                              className={`w-full text-left px-5 py-2.5 text-[11px] font-black uppercase tracking-widest hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors ${selectedState === state ? 'text-orange-600 bg-orange-50/50 dark:bg-orange-900/10' : 'text-slate-600 dark:text-slate-400'}`}
                            >
                              {state}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {scope === 'Centre' ? "Today's Central Updates" : "Grounded State Intelligence"}
                </h2>
              </div>
              <div className={`text-[10px] font-black ${scope === 'Centre' ? 'text-emerald-600' : 'text-orange-600'} uppercase tracking-widest flex items-center gap-1`}>
                 <div className={`w-1.5 h-1.5 ${scope === 'Centre' ? 'bg-emerald-500' : 'bg-orange-500'} rounded-full animate-pulse`} />
                 Accountability Feed
              </div>
            </div>

            {/* Loading State for Pulse */}
            {(scope === 'Centre' ? isNationalLoading : isStateLoading) ? (
               <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 border border-slate-100 dark:border-slate-800 space-y-6 animate-pulse">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                  <div className="space-y-3">
                    <div className="h-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl" />
                    <div className="h-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl" />
                  </div>
               </div>
            ) : scope === 'Centre' && nationalIntel ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-4 duration-500">
                {/* National Schemes Section */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                   <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                     <span className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">🇮🇳</span>
                     Key Schemes
                   </h3>
                   <div className="space-y-4">
                      {nationalIntel.schemes.slice(0, 3).map((s, i) => (
                        <div key={i} className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-indigo-100 transition">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[150px]">{s.title}</span>
                              <span className="text-[8px] font-black uppercase text-indigo-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full">{s.status}</span>
                           </div>
                           <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold line-clamp-2">{s.impact}</p>
                        </div>
                      ))}
                   </div>
                </div>

                {/* National Infra Pulse */}
                <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 text-white space-y-6">
                   <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">🏗️</span>
                     Central Projects
                   </h3>
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                            <span className="text-indigo-400">{nationalIntel.infrastructure[0]?.project}</span>
                            <span>{nationalIntel.infrastructure[0]?.progress}%</span>
                         </div>
                         <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${nationalIntel.infrastructure[0]?.progress}%` }} />
                         </div>
                         <p className="text-xs font-bold text-slate-300 leading-tight">{nationalIntel.infrastructure[0]?.details}</p>
                      </div>
                      <div className="pt-4 border-t border-white/5 space-y-2">
                         <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Latest from Sansad</div>
                         <h4 className="text-sm font-black leading-tight">{nationalIntel.parliament[0]?.event}</h4>
                         <p className="text-[10px] text-slate-400 font-medium">{nationalIntel.parliament[0]?.description}</p>
                      </div>
                   </div>
                </div>
              </div>
            ) : scope === 'State' && stateIntel ? (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Point 1: Current State Government Initiatives */}
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                     <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                       <span className="p-1.5 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600">🏛️</span>
                       State Initiatives
                     </h3>
                     <div className="space-y-4">
                        {stateIntel.initiatives.map((s, i) => (
                          <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-orange-100 transition group">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">{s.title}</span>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${s.status.toLowerCase().includes('progress') ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{s.status}</span>
                             </div>
                             <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{s.citizenImpact}</p>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Point 2: CM & Key Dept Performance (Accountability Score) */}
                  <div className="bg-orange-600 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl shadow-orange-500/20 flex flex-col justify-between">
                     <div className="space-y-6">
                        <h3 className="text-sm font-black text-orange-100 uppercase tracking-widest flex items-center gap-2">
                          <span className="p-1.5 bg-white/20 rounded-lg">📊</span>
                          Departmental Performance
                        </h3>
                        <div className="space-y-4">
                           <div className="flex justify-between items-end">
                              <div>
                                 <span className="text-2xl font-black leading-none">{stateIntel.performance.department}</span>
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-1">Primary Oversight</p>
                              </div>
                              <div className="text-right">
                                 <span className="text-3xl font-black">{stateIntel.performance.score}%</span>
                                 <p className="text-[8px] font-black uppercase tracking-widest opacity-70">Citizen Score</p>
                              </div>
                           </div>
                           <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white transition-all duration-1000" style={{ width: `${stateIntel.performance.score}%` }} />
                           </div>
                           <p className="text-xs font-bold text-orange-50 italic leading-relaxed">"{stateIntel.performance.summary}"</p>
                        </div>
                     </div>
                     <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest">Status: {stateIntel.performance.status}</span>
                        <div className="px-3 py-1 bg-white text-orange-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Verified by AI</div>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Point 3: Ongoing Infrastructure & Urban Development */}
                  <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 text-white space-y-6 border border-slate-800">
                     <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                       <span className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">🏗️</span>
                       Infrastructure Projects
                     </h3>
                     <div className="space-y-6">
                        {stateIntel.infrastructure.map((inf, i) => (
                          <div key={i} className="space-y-2">
                             <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-300">{inf.project}</span>
                                <span className={inf.progress < 50 ? 'text-rose-400' : 'text-emerald-400'}>{inf.progress}%</span>
                             </div>
                             <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full ${inf.progress < 50 ? 'bg-rose-500' : 'bg-emerald-500'} transition-all`} style={{ width: `${inf.progress}%` }} />
                             </div>
                             <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-[9px] font-bold text-slate-400 italic">Impact: {inf.impact}</span>
                                {inf.delayReason && (
                                   <span className="text-[8px] font-black uppercase bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded flex items-center gap-1">
                                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1-1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                      {inf.delayReason}
                                   </span>
                                )}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Point 4: Law & Order and Public Safety Overview */}
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                     <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                       <span className="p-1.5 bg-rose-50 dark:bg-rose-900/30 rounded-lg text-rose-600">🛡️</span>
                       Safety & Public Order
                     </h3>
                     <div className="space-y-4">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border-l-4 border-rose-500">
                           {stateIntel.safety.overview}
                        </p>
                        <div className="space-y-2">
                           <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">Live Intelligence Alerts</span>
                           {stateIntel.safety.alerts.map((alert, i) => (
                             <div key={i} className="flex gap-3 items-start group">
                                <div className="w-1 h-1 bg-rose-500 rounded-full mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{alert}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                </div>

                {/* Point 5: Local Civic Issues Affecting Citizens (Themed Grid) */}
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Critical Local Issues
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning Municipal Data</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stateIntel.localIssues.map((issue, idx) => (
                      <div key={idx} className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm group hover:border-orange-200 transition-all hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${
                            issue.urgency.toLowerCase() === 'high' ? 'bg-rose-50 text-rose-600' : 
                            issue.urgency.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {issue.urgency} Urgency
                          </span>
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest group-hover:text-orange-400 transition-colors">Ward: {issue.ward}</span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight mb-2">{issue.issue}</h4>
                        <button className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-4 flex items-center gap-1 hover:underline">
                           Report Similar Issue
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7M5 12h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.total}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.completed}</p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.completed}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.inProgress}</p>
              <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.inProgress}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.delayed}</p>
              <h3 className="text-3xl font-black text-orange-600 dark:text-orange-400">{stats.delayed}</h3>
            </div>
          </div>

          {/* Promises Tracking Placeholder (Always visible but themed by scope) */}
          <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm min-h-[300px] flex flex-col items-center justify-center p-12 text-center transition-all ${scope === 'State' && !stateIntel ? 'opacity-50 grayscale' : ''}`}>
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg className={`w-10 h-10 ${scope === 'Centre' ? 'text-indigo-300' : 'text-orange-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{t.noPromisesFound}</h3>
            <p className="text-slate-400 dark:text-slate-500 font-bold max-w-sm">{t.adjustFilters}</p>
          </div>
        </div>

        {/* Right Sidebar Intelligence */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                 <svg className={`w-5 h-5 ${scope === 'Centre' ? 'text-indigo-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 Nearby Civic Hub
               </h3>
               {!nearbyServices.length && (
                 <button 
                   onClick={handleFetchServices}
                   disabled={isServicesLoading}
                   className={`text-[10px] font-black ${scope === 'Centre' ? 'text-indigo-600' : 'text-orange-600'} uppercase tracking-widest hover:underline disabled:opacity-50`}
                 >
                   {isServicesLoading ? 'Searching...' : 'Detect Nearby'}
                 </button>
               )}
            </div>

            {isServicesLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800 rounded-xl" />)}
              </div>
            ) : nearbyServices.length > 0 ? (
              <div className="space-y-3">
                {nearbyServices.map((service, i) => (
                  <a 
                    key={i} 
                    href={service.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group transition-all border border-transparent ${scope === 'Centre' ? 'hover:bg-indigo-600 hover:border-indigo-400' : 'hover:bg-orange-600 hover:border-orange-400'}`}
                  >
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-white truncate max-w-[200px]">
                      {service.name}
                    </span>
                    <svg className="w-4 h-4 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                ))}
                <button onClick={() => setNearbyServices([])} className="w-full text-center text-[10px] font-black text-slate-400 uppercase mt-2 hover:text-indigo-600">Clear</button>
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem]">
                 <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                   Find the nearest government hospital, municipal office, or police station using AI Mapping.
                 </p>
              </div>
            )}
          </div>

          {/* Scope-specific Summary Card */}
          {scope === 'Centre' ? (
             !isNationalLoading && nationalIntel && (
                <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/20 p-8 space-y-4 animate-in fade-in">
                  <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Nationwide Impact</h3>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">"{nationalIntel.impact.summary}"</p>
                  <div className="space-y-2 pt-2">
                     {nationalIntel.impact.highlights.slice(0, 2).map((h, i) => (
                       <div key={i} className="flex gap-2 items-start">
                         <div className="w-1 h-1 bg-indigo-400 rounded-full mt-2" />
                         <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">{h}</span>
                       </div>
                     ))}
                  </div>
                </div>
             )
          ) : (
             !isStateLoading && stateIntel && (
                <div className="bg-orange-50 dark:bg-orange-900/10 rounded-[2rem] border border-orange-100 dark:border-orange-900/20 p-8 space-y-4 animate-in fade-in">
                  <h3 className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">State Mandate Summary</h3>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">Focusing on {selectedState} specific governance and civic accountability targets for 2025.</p>
                  <div className="flex items-center gap-3 pt-2">
                     <div className="flex-1 h-1 bg-orange-100 dark:bg-orange-900/40 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 w-2/3" />
                     </div>
                     <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">67% Target Compliance</span>
                  </div>
                </div>
             )
          )}

          <div className={`rounded-[2rem] p-8 text-white space-y-4 shadow-xl transition-colors duration-500 ${scope === 'Centre' ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-orange-600 shadow-orange-500/20'}`}>
            <h3 className="text-xl font-black tracking-tight">Need Assistance?</h3>
            <p className="text-white text-sm font-medium leading-relaxed opacity-90">
              Speak with our AI Assistant to find specific government resolutions or verify civic data for {scope === 'Centre' ? 'India' : selectedState}.
            </p>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
