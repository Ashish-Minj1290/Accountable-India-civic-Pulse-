
import React, { useState, useEffect } from 'react';
import { PoliticalLeader } from '../types';
import { Language, translations } from '../translations';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { searchLeaderInfo } from '../services/geminiService';

interface LeaderProfileProps {
  leader: PoliticalLeader;
  onBack: () => void;
  language: Language;
  onUpdateRating?: (id: string, rating: number) => void;
  onToggleFollow?: (id: string) => void;
}

const LeaderProfile: React.FC<LeaderProfileProps> = ({ leader, onBack, language, onUpdateRating, onToggleFollow }) => {
  const t = translations[language];
  const [userRating, setUserRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Search Grounding states
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{text: string, sources: any[]} | null>(null);

  // Initial load auto-verify if not searched before
  useEffect(() => {
    if (!searchResult) {
      handleVerifyInfo();
    }
  }, [leader.id]);

  const handleVerifyInfo = async () => {
    setIsSearching(true);
    const result = await searchLeaderInfo(`What are the latest 5 political updates, news highlights, and parliamentary performance notes for ${leader.name} (${leader.party}) from ${leader.state}? Be specific about current events.`);
    setSearchResult(result);
    setIsSearching(false);
  };

  const chartData = [
    { subject: t.attendance, A: leader.attendance, fullMark: 100 },
    { subject: t.debates, A: Math.min((leader.debates / 40) * 100, 100), fullMark: 100 },
    { subject: t.bills, A: Math.min((leader.bills / 15) * 100, 100), fullMark: 100 },
    { subject: t.questions, A: Math.min((leader.questions / 100) * 100, 100), fullMark: 100 },
  ];

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      if (onUpdateRating) {
        onUpdateRating(leader.id, userRating);
      }
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      setUserRating(0);
      setFeedback('');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
      {/* Navigation Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-indigo-600 font-bold transition rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t.back}
        </button>
        
        <div className="flex gap-3">
          <button 
            onClick={() => onToggleFollow?.(leader.id)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg ${
              leader.isFollowed 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-slate-200/50'
            }`}
          >
            {leader.isFollowed ? '✓ Following Representative' : 'Follow Representative'}
          </button>
          <button 
            onClick={handleVerifyInfo}
            disabled={isSearching}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            )}
            Refresh Live Feed
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 md:p-12 space-y-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-xl ring-4 ring-white dark:ring-slate-800">
              {leader.name.charAt(0)}
            </div>
            
            <div className="text-center md:text-left flex-1 space-y-2">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{leader.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-[11px] font-black text-blue-600 dark:text-blue-400 rounded-lg uppercase tracking-wider">{leader.role}</span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-blue-600 dark:text-blue-400 rounded-lg border border-slate-200 dark:border-slate-700">{leader.party}</span>
                <div className="flex items-center gap-2 ml-2">
                  <div className="flex items-center gap-1 text-amber-500 font-black">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span>{leader.rating}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">({leader.ratingCount.toLocaleString()} citizen reviews)</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-400 font-bold text-sm pt-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {leader.constituency}, {leader.state}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {t.since} {leader.sinceYear}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Performance & Charts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Performance Radar */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8">
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3 mb-10">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              {t.parliamentaryPerformance}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name={leader.name}
                      dataKey="A"
                      stroke="#818cf8"
                      fill="#818cf8"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t.attendance, value: `${leader.attendance}%`, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: t.debates, value: leader.debates, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: t.billsIntroduced, value: leader.bills, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: t.questions, value: leader.questions, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} dark:bg-slate-800/50 p-6 rounded-2xl border border-white dark:border-slate-800 shadow-sm`}>
                    <div className={`text-2xl font-black ${stat.color} dark:text-white`}>{stat.value}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Grounded News Feed */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-[2rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                AI Grounded Activity Feed
              </h2>
            </div>
            
            {isSearching ? (
              <div className="space-y-4">
                <div className="h-4 bg-indigo-100 dark:bg-indigo-900/30 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-indigo-100 dark:bg-indigo-900/30 rounded w-1/2 animate-pulse" />
                <div className="h-4 bg-indigo-100 dark:bg-indigo-900/30 rounded w-2/3 animate-pulse" />
              </div>
            ) : searchResult ? (
              <div className="space-y-6">
                <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {searchResult.text}
                </div>
                {searchResult.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-indigo-100 dark:border-indigo-900/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-full mb-1">Citations & Verification</span>
                    {searchResult.sources.slice(0, 3).map((source, i) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:shadow-md transition truncate max-w-[200px]"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {source.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Interaction & Feedback */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8">
            <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              Rate Representative
            </h2>

            {isSuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-2xl text-center space-y-2 animate-in zoom-in">
                <div className="text-4xl">✨</div>
                <p className="text-emerald-700 dark:text-emerald-400 font-black">Rating Submitted!</p>
                <p className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-widest">Updating global index...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRating} className="space-y-4">
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className={`text-3xl transition-all duration-200 transform hover:scale-125 ${userRating >= star ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' : 'text-slate-200 dark:text-slate-800'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Performance Justification</label>
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Briefly state why you're giving this rating..."
                    rows={4}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white resize-none text-sm transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={userRating === 0 || isSubmitting}
                  className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white font-black rounded-2xl hover:opacity-90 transition disabled:opacity-50 active:scale-95 shadow-xl flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Verify & Submit Evaluation'}
                </button>
              </form>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-inner">
            <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Public sentiment Analysis</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Accountability Score</span>
                <span className="text-indigo-600">82%</span>
              </div>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[82%]" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic mt-4">
                "Consistently engages with local ward issues but shows delayed response on major infrastructure bills."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderProfile;
