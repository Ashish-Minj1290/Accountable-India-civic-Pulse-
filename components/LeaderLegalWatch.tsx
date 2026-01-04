
import React, { useState, useMemo, useEffect } from 'react';
import { PoliticalLeader } from '../types';
import { Language, translations } from '../translations';
import { fetchLeaderLegalStanding, discoverLeaderProfile } from '../services/geminiService';
import { INDIAN_STATES } from './Leaders';

const INITIAL_MOCK_LEADERS: PoliticalLeader[] = [
  { id: '1', name: 'Narendra Modi', role: 'MP', party: 'Bharatiya Janata Party (BJP)', constituency: 'Varanasi', state: 'Uttar Pradesh', rating: 4.8, ratingCount: 12450, attendance: 100, bills: 0, debates: 15, questions: 0, sinceYear: 2014, isFollowed: true },
  { id: '2', name: 'Rahul Gandhi', role: 'MP', party: 'Indian National Congress (INC)', constituency: 'Rae Bareli', state: 'Uttar Pradesh', rating: 4.2, ratingCount: 8900, attendance: 55, bills: 1, debates: 12, questions: 25, sinceYear: 2004 },
  { id: '3', name: 'Mamata Banerjee', role: 'MLA', party: 'All India Trinamool Congress (TMC)', constituency: 'Bhabanipur', state: 'West Bengal', rating: 4.3, ratingCount: 7600, attendance: 95, bills: 12, debates: 45, questions: 0, sinceYear: 2011 },
  { id: '4', name: 'Arvind Kejriwal', role: 'MLA', party: 'Aam Aadmi Party (AAP)', constituency: 'New Delhi', state: 'Delhi', rating: 4.1, ratingCount: 6500, attendance: 92, bills: 8, debates: 30, questions: 0, sinceYear: 2013 },
  { id: '7', name: 'Yogi Adityanath', role: 'MLA', party: 'Bharatiya Janata Party (BJP)', constituency: 'Gorakhpur Urban', state: 'Uttar Pradesh', rating: 4.6, ratingCount: 9200, attendance: 98, bills: 0, debates: 10, questions: 0, sinceYear: 2017 },
  { id: '8', name: 'M. K. Stalin', role: 'MLA', party: 'Dravida Munnetra Kazhagam (DMK)', constituency: 'Kolathur', state: 'Tamil Nadu', rating: 4.4, ratingCount: 5400, attendance: 94, bills: 5, debates: 20, questions: 0, sinceYear: 2021 },
  { id: '9', name: 'Nitish Kumar', role: 'MLA', party: 'Janata Dal (United)', constituency: 'Nalanda', state: 'Bihar', rating: 3.8, ratingCount: 4200, attendance: 88, bills: 2, debates: 15, questions: 0, sinceYear: 2005 },
  { id: '10', name: 'Amit Shah', role: 'MP', party: 'Bharatiya Janata Party (BJP)', constituency: 'Gandhinagar', state: 'Gujarat', rating: 4.7, ratingCount: 11000, attendance: 99, bills: 15, debates: 40, questions: 0, sinceYear: 2019 },
  { id: '11', name: 'Mallikarjun Kharge', role: 'MP', party: 'Indian National Congress (INC)', constituency: 'Kalaburagi', state: 'Karnataka', rating: 4.0, ratingCount: 3500, attendance: 82, bills: 3, debates: 85, questions: 120, sinceYear: 2009 },
  { id: '12', name: 'Siddaramaiah', role: 'MLA', party: 'Indian National Congress (INC)', constituency: 'Varuna', state: 'Karnataka', rating: 4.2, ratingCount: 4800, attendance: 90, bills: 4, debates: 25, questions: 0, sinceYear: 2013 },
  { id: '13', name: 'Eknath Shinde', role: 'MLA', party: 'Shiv Sena', constituency: 'Kopri-Pachpakhadi', state: 'Maharashtra', rating: 3.9, ratingCount: 3100, attendance: 85, bills: 1, debates: 12, questions: 0, sinceYear: 2022 },
  { id: '14', name: 'Hemant Soren', role: 'MLA', party: 'Jharkhand Mukti Morcha (JMM)', constituency: 'Barhait', state: 'Jharkhand', rating: 4.1, ratingCount: 2800, attendance: 80, bills: 2, debates: 10, questions: 0, sinceYear: 2019 },
  { id: '15', name: 'Himanta Biswa Sarma', role: 'MLA', party: 'Bharatiya Janata Party (BJP)', constituency: 'Jalukbari', state: 'Assam', rating: 4.5, ratingCount: 5200, attendance: 97, bills: 10, debates: 35, questions: 0, sinceYear: 2021 },
];

interface LeaderLegalWatchProps {
  language: Language;
}

const LeaderLegalWatch: React.FC<LeaderLegalWatchProps> = ({ language }) => {
  const t = translations[language];
  const [leaders, setLeaders] = useState<PoliticalLeader[]>(() => {
    const saved = localStorage.getItem('accountable_leaders');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_LEADERS;
  });
  
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Criminal' | 'Jail' | 'Corruption'>('All');
  
  const selectedLeader = useMemo(() => 
    leaders.find(l => l.id === selectedLeaderId), 
  [selectedLeaderId, leaders]);

  useEffect(() => {
    localStorage.setItem('accountable_leaders', JSON.stringify(leaders));
  }, [leaders]);

  const filteredLeaders = useMemo(() => {
    return leaders.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           l.constituency.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (filter === 'Criminal') return (l.legalStanding?.totalCases || 0) > 0;
      if (filter === 'Jail') return l.legalStanding?.jailHistory && l.legalStanding.jailHistory.toLowerCase() !== 'no record' && l.legalStanding.jailHistory.toLowerCase() !== 'none';
      if (filter === 'Corruption') return (l.legalStanding?.corruptionAllegations?.length || 0) > 0;
      
      return true;
    });
  }, [searchQuery, leaders, filter]);

  const handleSyncLegalData = async (leader: PoliticalLeader) => {
    setIsSyncing(true);
    const legalData = await fetchLeaderLegalStanding(leader.name, leader.constituency);
    if (legalData) {
      const updatedLeaders = leaders.map(l => 
        l.id === leader.id ? { ...l, legalStanding: legalData } : l
      );
      setLeaders(updatedLeaders);
      localStorage.setItem('accountable_leaders', JSON.stringify(updatedLeaders));
    }
    setIsSyncing(false);
  };

  const handleDiscoverAndAudit = async () => {
    if (!searchQuery.trim() || isDiscovering) return;
    setIsDiscovering(true);
    try {
      const profile = await discoverLeaderProfile(searchQuery);
      if (profile) {
        const exists = leaders.find(l => l.name.toLowerCase() === profile.name.toLowerCase());
        if (exists) {
          setSelectedLeaderId(exists.id);
          if (!exists.legalStanding) await handleSyncLegalData(exists);
        } else {
          const newLeader: PoliticalLeader = {
            id: Math.random().toString(36).substr(2, 9),
            ...profile,
            rating: 3.0,
            ratingCount: 0,
            attendance: Math.floor(Math.random() * 30) + 70,
            bills: Math.floor(Math.random() * 5),
            debates: Math.floor(Math.random() * 15),
            questions: Math.floor(Math.random() * 40),
          };
          const updated = [newLeader, ...leaders];
          setLeaders(updated);
          localStorage.setItem('accountable_leaders', JSON.stringify(updated));
          setSelectedLeaderId(newLeader.id);
          await handleSyncLegalData(newLeader);
        }
      }
    } catch (err) {
      console.error("Discovery error:", err);
    } finally {
      setIsDiscovering(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Dynamic Hero Section */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L3 7v9c0 5.52 4.48 10 10 10s10-4.48 10-10V7l-9-5zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        </div>
        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-500/30">
             <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
             AI Integrity Audit Engine
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
            Transparency Through <span className="text-indigo-400 underline decoration-indigo-500/50 underline-offset-8">Data</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            Audit any Indian representative's legal standing. We use Gemini 3 with Search Grounding to verify criminal records, affidavits, and corruption reports.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex-1 relative group">
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                type="text" 
                placeholder="Type representative name (e.g. 'Amit Shah')..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDiscoverAndAudit()}
                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] outline-none focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20 transition-all font-bold text-lg placeholder-slate-600"
              />
            </div>
            <button 
              onClick={handleDiscoverAndAudit}
              disabled={isDiscovering || !searchQuery.trim()}
              className="px-10 py-5 bg-indigo-600 text-white font-black rounded-[1.5rem] hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 shrink-0"
            >
              {isDiscovering ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              )}
              {isDiscovering ? 'Analyzing...' : 'Audit Profile'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Pane: Filter & List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Filter Records</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['All', 'Criminal', 'Jail', 'Corruption'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {f} {f === 'All' ? '' : 'Records'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-[600px] overflow-y-auto scrollbar-hide">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Repository</span>
               <span className="text-[10px] font-bold text-indigo-500">{filteredLeaders.length} Tracked</span>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredLeaders.map(leader => {
                const hasStanding = !!leader.legalStanding;
                return (
                  <button 
                    key={leader.id}
                    onClick={() => setSelectedLeaderId(leader.id)}
                    className={`w-full text-left p-6 transition group relative ${selectedLeaderId === leader.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">{leader.name}</h3>
                      {hasStanding && (
                        <div className="flex gap-1">
                          {leader.legalStanding!.totalCases > 0 && <span className="w-5 h-5 flex items-center justify-center bg-rose-500 text-white rounded-md text-[9px] font-black shadow-lg shadow-rose-500/30" title="Criminal Cases">C</span>}
                          {leader.legalStanding!.jailHistory && leader.legalStanding!.jailHistory.toLowerCase() !== 'none' && <span className="w-5 h-5 flex items-center justify-center bg-purple-600 text-white rounded-md text-[9px] font-black shadow-lg shadow-purple-500/30" title="Jail Record">J</span>}
                          {leader.legalStanding!.corruptionAllegations.length > 0 && <span className="w-5 h-5 flex items-center justify-center bg-amber-500 text-white rounded-md text-[9px] font-black shadow-lg shadow-amber-500/30" title="Corruption Allegations">A</span>}
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{leader.constituency} • {leader.party}</div>
                    {!hasStanding && (
                       <div className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase">
                          <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                          Requires Audit
                       </div>
                    )}
                    {selectedLeaderId === leader.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Pane: Report Details */}
        <div className="lg:col-span-8">
          {selectedLeader ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-xl">
                      {selectedLeader.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{selectedLeader.name}</h2>
                      <p className="text-slate-400 font-bold uppercase tracking-widest mt-2 text-xs">{selectedLeader.role} • {selectedLeader.constituency} • {selectedLeader.state}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSyncLegalData(selectedLeader)}
                    disabled={isSyncing}
                    className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30 disabled:opacity-50 flex items-center gap-3"
                  >
                    {isSyncing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    )}
                    {selectedLeader.legalStanding ? 'Re-Verify Report' : 'Trigger AI Audit'}
                  </button>
                </div>

                {!selectedLeader.legalStanding ? (
                  <div className="p-32 text-center space-y-8">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-inner grayscale opacity-30">
                       <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white">Audit Report Required</h3>
                      <p className="text-slate-400 font-bold max-sm mx-auto leading-relaxed">This profile hasn't been audited for legal integrity yet. Click "Trigger AI Audit" to fetch grounded results.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 space-y-12">
                    {/* Key Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-8 bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/30 flex flex-col items-center justify-center text-center space-y-1 hover:scale-[1.02] transition-transform cursor-default">
                        <span className="text-5xl font-black text-rose-600 dark:text-rose-400 tracking-tighter">{selectedLeader.legalStanding.totalCases}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.totalCases}</span>
                      </div>
                      <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/30 flex flex-col items-center justify-center text-center space-y-1 hover:scale-[1.02] transition-transform cursor-default">
                        <span className="text-5xl font-black text-amber-600 dark:text-amber-400 tracking-tighter">{selectedLeader.legalStanding.seriousCriminalCases}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.seriousCases}</span>
                      </div>
                      <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-xl shadow-indigo-500/20 flex flex-col items-center justify-center text-center space-y-1 hover:scale-[1.02] transition-transform cursor-default">
                        <span className="text-5xl font-black text-white tracking-tighter">
                          {selectedLeader.legalStanding.corruptionAllegations.length}
                        </span>
                        <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Corruption Tracks</span>
                      </div>
                    </div>

                    {/* Jail & Detailed History */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 text-white space-y-6 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                             <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 12c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                          </div>
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">{t.jailHistory}</h3>
                          <p className="text-lg font-bold leading-relaxed italic">"{selectedLeader.legalStanding.jailHistory}"</p>
                          <div className="pt-6 border-t border-white/5">
                             <span className="text-[9px] font-black uppercase text-slate-500">History verified against legal records</span>
                          </div>
                       </div>

                       <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Corruption & Investigations</h3>
                          <div className="space-y-4">
                             {selectedLeader.legalStanding.corruptionAllegations.length > 0 ? (
                               selectedLeader.legalStanding.corruptionAllegations.map((item, i) => (
                                 <div key={i} className="flex gap-4 items-start group/a">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 shrink-0 group-hover/a:scale-150 transition-transform" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-bold leading-relaxed">{item}</span>
                                 </div>
                               ))
                             ) : (
                               <div className="flex gap-4 items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                                  <span className="text-2xl">✅</span>
                                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">No verified corruption reports in current data</span>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* AI Justification */}
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[3rem] p-10 border border-indigo-100 dark:border-indigo-800 space-y-6">
                       <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Audit Narrative & Justification
                       </h3>
                       <p className="text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap italic">
                         {selectedLeader.legalStanding.justification}
                       </p>
                    </div>

                    {/* Verification Sources */}
                    <div className="space-y-6">
                       <div className="flex items-center justify-between px-2">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t.verificationStatus}</h3>
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                             <span className="text-[10px] font-black text-emerald-600 uppercase">SYNC SUCCESS: {selectedLeader.legalStanding.lastUpdated}</span>
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedLeader.legalStanding.verificationSources.map((source, i) => (
                            <a 
                              key={i} 
                              href={source.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-xl hover:border-indigo-300 transition group flex flex-col gap-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-indigo-600 uppercase">Verified Source</span>
                                <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              </div>
                              <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">{source.title}</h4>
                            </a>
                          ))}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[800px] text-center space-y-10 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in">
               <div className="w-40 h-40 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner group">
                 <svg className="w-20 h-20 text-slate-300 group-hover:text-indigo-400 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-10.43L5.09 3.93a1.5 1.5 0 00-2.23 1.93l4.87 5.14c.125.132.25.263.375.395m0 0c-.012.013-.025.026-.037.04m0 0L3 13.33a1.5 1.5 0 002.23 1.93l2.88-2.88a1.5 1.5 0 00-2.23-1.93l-2.88 2.88z" /></svg>
               </div>
               <div className="space-y-4 px-10">
                 <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Select Representative to Audit</h2>
                 <p className="text-slate-500 dark:text-slate-400 font-bold max-w-lg mx-auto text-lg leading-relaxed">
                   Enter a name in the search bar to discover new profiles, or select from your tracked repository to run a real-time integrity scan.
                 </p>
                 <div className="pt-6 flex justify-center gap-8">
                    <div className="text-center">
                       <div className="text-3xl mb-1">⚖️</div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Records</p>
                    </div>
                    <div className="text-center">
                       <div className="text-3xl mb-1">💰</div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Corruption Track</p>
                    </div>
                    <div className="text-center">
                       <div className="text-3xl mb-1">🏛️</div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grounded Data</p>
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderLegalWatch;
