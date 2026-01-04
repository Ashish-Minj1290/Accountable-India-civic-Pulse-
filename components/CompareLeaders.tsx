
import React, { useState, useMemo, useEffect } from 'react';
import { PoliticalLeader } from '../types';
import { Language, translations } from '../translations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { compareLeadersAI, discoverLeaderProfile } from '../services/geminiService';

interface CompareLeadersProps {
  language: Language;
}

const INITIAL_MOCK_LEADERS: PoliticalLeader[] = [
  { id: '1', name: 'Narendra Modi', role: 'MP', party: 'Bharatiya Janata Party (BJP)', constituency: 'Varanasi', state: 'Uttar Pradesh', rating: 4.8, ratingCount: 12450, attendance: 100, bills: 0, debates: 15, questions: 0, sinceYear: 2014 },
  { id: '2', name: 'Rahul Gandhi', role: 'MP', party: 'Indian National Congress (INC)', constituency: 'Rae Bareli', state: 'Uttar Pradesh', rating: 4.2, ratingCount: 8900, attendance: 55, bills: 1, debates: 12, questions: 25, sinceYear: 2004 },
  { id: '3', name: 'Mamata Banerjee', role: 'MLA', party: 'All India Trinamool Congress (TMC)', constituency: 'Bhabanipur', state: 'West Bengal', rating: 4.3, ratingCount: 7600, attendance: 95, bills: 12, debates: 45, questions: 0, sinceYear: 2011 },
  { id: '4', name: 'Arvind Kejriwal', role: 'MLA', party: 'Aam Aadmi Party (AAP)', constituency: 'New Delhi', state: 'Delhi', rating: 4.1, ratingCount: 6500, attendance: 92, bills: 8, debates: 30, questions: 0, sinceYear: 2013 },
  { id: '5', name: 'Priya Sharma', role: 'MP', party: 'Bharatiya Janata Party (BJP)', constituency: 'Delhi East', state: 'Delhi', rating: 4.5, ratingCount: 412, attendance: 92, bills: 12, debates: 34, questions: 89, sinceYear: 2019 },
];

const CompareLeaders: React.FC<CompareLeadersProps> = ({ language }) => {
  const t = translations[language];
  const [leaders, setLeaders] = useState<PoliticalLeader[]>(() => {
    const saved = localStorage.getItem('accountable_leaders');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_LEADERS;
  });

  const [leader1Id, setLeader1Id] = useState<string>(leaders[0].id);
  const [leader2Id, setLeader2Id] = useState<string>(leaders[1].id);
  
  // Search state for discovery
  const [searchQuery, setSearchQuery] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  
  // AI Comparison state
  const [isComparingAI, setIsComparingAI] = useState(false);
  const [aiComparison, setAiComparison] = useState<{text: string, sources: any[]} | null>(null);

  const leader1 = useMemo(() => leaders.find(l => l.id === leader1Id) || leaders[0], [leader1Id, leaders]);
  const leader2 = useMemo(() => leaders.find(l => l.id === leader2Id) || leaders[1], [leader2Id, leaders]);

  const chartData = [
    { name: t.attendance, leader1: leader1.attendance, leader2: leader2.attendance },
    { name: t.debates, leader1: leader1.debates, leader2: leader2.debates },
    { name: t.billsIntroduced, leader1: leader1.bills, leader2: leader2.bills },
    { name: t.questions, leader1: leader1.questions, leader2: leader2.questions },
  ];

  const handleAICompare = async () => {
    setIsComparingAI(true);
    const result = await compareLeadersAI(`${leader1.name} (${leader1.party})`, `${leader2.name} (${leader2.party})`);
    setAiComparison(result);
    setIsComparingAI(false);
  };

  const handleDiscoverNew = async () => {
    if (!searchQuery.trim()) return;
    setIsDiscovering(true);
    const profile = await discoverLeaderProfile(searchQuery);
    if (profile) {
      const newLeader: PoliticalLeader = {
        id: Math.random().toString(36).substr(2, 9),
        ...profile,
        rating: 3.0,
        ratingCount: 0
      };
      setLeaders(prev => [newLeader, ...prev]);
      setSearchQuery('');
    }
    setIsDiscovering(false);
  };

  const MetricRow = ({ label, val1, val2, suffix = '', icon }: any) => {
    const isVal1Better = val1 > val2;
    const isVal2Better = val2 > val1;
    
    return (
      <div className="grid grid-cols-12 gap-4 items-center py-2">
        <div className="col-span-4">
          <div className={`w-full py-4 px-6 rounded-2xl text-center font-black text-2xl transition-all duration-300 ${isVal1Better ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
            {val1}{suffix}
          </div>
        </div>
        <div className="col-span-4 text-center">
          <div className="flex items-center justify-center gap-1.5">
            {icon && <span className="text-slate-400">{icon}</span>}
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
          </div>
        </div>
        <div className="col-span-4">
          <div className={`w-full py-4 px-6 rounded-2xl text-center font-black text-2xl transition-all duration-300 ${isVal2Better ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
            {val2}{suffix}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{t.compareLeaders}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Real-time parliamentary comparison of any Indian representative</p>
      </div>

      {/* Dynamic Search & Add Area */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Select First Leader</label>
            <select 
              value={leader1Id}
              onChange={(e) => setLeader1Id(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition font-bold dark:text-white appearance-none"
            >
              {leaders.map(l => <option key={l.id} value={l.id}>{l.name} ({l.party})</option>)}
            </select>
          </div>
          
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7M5 12h16" /></svg>
          </div>

          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Select Second Leader</label>
            <select 
              value={leader2Id}
              onChange={(e) => setLeader2Id(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition font-bold dark:text-white appearance-none"
            >
              {leaders.map(l => <option key={l.id} value={l.id}>{l.name} ({l.party})</option>)}
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md group">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text"
              placeholder="Search & add any Indian politician to compare..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchQuery && (
              <button 
                onClick={handleDiscoverNew}
                disabled={isDiscovering}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg disabled:opacity-50"
              >
                {isDiscovering ? '...' : 'Verify & Add'}
              </button>
            )}
          </div>
          
          <button 
            onClick={handleAICompare}
            disabled={isComparingAI}
            className="px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-50 hover:text-white transition flex items-center gap-3 active:scale-95 shadow-xl disabled:opacity-50"
          >
            {isComparingAI ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            )}
            Run Real-time AI Analysis
          </button>
        </div>
      </div>

      {/* AI Comparison Results Section */}
      {aiComparison && (
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-[2.5rem] p-10 space-y-8 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Deep Intelligence Battle Report
              </h2>
              <button onClick={() => setAiComparison(null)} className="text-indigo-400 hover:text-indigo-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
           </div>
           
           <div className="text-slate-700 dark:text-slate-300 text-base leading-relaxed whitespace-pre-wrap font-medium bg-white/60 dark:bg-black/20 p-8 rounded-3xl border border-white/40">
             {aiComparison.text}
           </div>

           {aiComparison.sources.length > 0 && (
             <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Verified Sources & Citations</span>
                <div className="flex flex-wrap gap-3">
                   {aiComparison.sources.map((source, i) => (
                     <a 
                       key={i} 
                       href={source.uri} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:shadow-lg transition flex items-center gap-2"
                     >
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                       {source.title.length > 40 ? source.title.substring(0, 40) + '...' : source.title}
                     </a>
                   ))}
                </div>
             </div>
           )}
        </div>
      )}

      {/* Visual Charts & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
            Metric Discrepancy
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                <Bar name={leader1.name} dataKey="leader1" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                <Bar name={leader2.name} dataKey="leader2" fill="#d946ef" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 flex flex-col justify-center">
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm text-center mb-6">Parliamentary Scorecard</h3>
          <div className="space-y-2">
            <MetricRow label={t.attendancePercentage} val1={leader1.attendance} val2={leader2.attendance} suffix="%" />
            <MetricRow label={t.debates} val1={leader1.debates} val2={leader2.debates} />
            <MetricRow label={t.billsIntroduced} val1={leader1.bills} val2={leader2.bills} />
            <MetricRow label={t.questionsAsked} val1={leader1.questions} val2={leader2.questions} />
            <MetricRow 
              label="Citizen Rating" 
              val1={leader1.rating} 
              val2={leader2.rating} 
              icon={<svg className="w-3.5 h-3.5 fill-current text-amber-500" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareLeaders;
