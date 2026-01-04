
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PoliticalLeader } from '../types';
import { Language, translations } from '../translations';
import LeaderProfile from './LeaderProfile';
import { discoverLeaderProfile, discoverBatchLeaders } from '../services/geminiService';

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export const INDIAN_PARTIES = [
  "Bharatiya Janata Party (BJP)", "Indian National Congress (INC)", "Aam Aadmi Party (AAP)", "All India Trinamool Congress (TMC)", "Bahujan Samaj Party (BSP)", "Communist Party of India (Marxist)", "Communist Party of India", "National People's Party", "Samajwadi Party", "Dravida Munnetra Kazhagam (DMK)", "All India Anna Dravida Munnetra Kazhagam (AIADMK)", "Shiv Sena", "Nationalist Congress Party (NCP)", "Rashtriya Janata Dal (RJD)", "Janata Dal (United)", "Telugu Desam Party (TDP)", "Yuvajana Sramika Rythu Congress Party (YSRCP)", "Bharat Rashtra Samithi (BRS)", "Biju Janata Dal (BJD)", "Shiromani Akali Dal", "Jharkhand Mukti Morcha (JMM)", "All India United Democratic Front", "Mizo National Front", "Nationalist Democratic Progressive Party", "Sikkim Krantikari Morcha", "Asom Gana Parishad"
];

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
  { id: '5', name: 'Priya Sharma', role: 'MP', party: 'Bharatiya Janata Party (BJP)', constituency: 'Delhi East', state: 'Delhi', rating: 4.5, ratingCount: 412, attendance: 92, bills: 12, debates: 34, questions: 89, sinceYear: 2019 },
  { id: '6', name: 'Vikram Singh', role: 'MLA', party: 'Bharatiya Janata Party (BJP)', constituency: 'Jaipur Central', state: 'Rajasthan', rating: 4.3, ratingCount: 189, attendance: 89, bills: 4, debates: 28, questions: 72, sinceYear: 2021 },
];

interface LeadersProps {
  language: Language;
}

const Leaders: React.FC<LeadersProps> = ({ language }) => {
  const t = translations[language];
  const [leaders, setLeaders] = useState<PoliticalLeader[]>(() => {
    const saved = localStorage.getItem('accountable_leaders');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_LEADERS;
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [partyFilter, setPartyFilter] = useState('All Parties');
  const [stateFilter, setStateFilter] = useState('All States');
  const [sortOption, setSortOption] = useState('Highest Rated');
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [noMoreFound, setNoMoreFound] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);

  const [newLeaderForm, setNewLeaderForm] = useState({
    name: '',
    role: 'MP' as 'MP' | 'MLA',
    party: INDIAN_PARTIES[0],
    constituency: '',
    state: INDIAN_STATES[0],
    sinceYear: 2024
  });
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    localStorage.setItem('accountable_leaders', JSON.stringify(leaders));
  }, [leaders]);

  const filteredLeaders = useMemo(() => {
    let result = leaders.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           l.constituency.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesParty = partyFilter === 'All Parties' || l.party === partyFilter;
      const matchesState = stateFilter === 'All States' || l.state === stateFilter;
      return matchesSearch && matchesParty && matchesState;
    });

    if (sortOption === 'Highest Rated') {
      result = result.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'Lowest Rated') {
      result = result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [searchQuery, partyFilter, stateFilter, sortOption, leaders]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.length > 3 && filteredLeaders.length === 0) {
      debounceRef.current = setTimeout(() => {
        handleDiscover();
      }, 1500);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, filteredLeaders.length]);

  const handleDiscover = async () => {
    if (!searchQuery.trim() || isDiscovering) return;
    setIsDiscovering(true);
    try {
      const profile = await discoverLeaderProfile(searchQuery);
      if (profile) {
        const exists = leaders.some(l => l.name.toLowerCase() === profile.name.toLowerCase());
        if (!exists) {
          const newLeader: PoliticalLeader = {
            id: Math.random().toString(36).substr(2, 9),
            ...profile,
            rating: 3.0,
            ratingCount: 0,
            isFollowed: false,
            attendance: Math.floor(Math.random() * 40) + 60,
            bills: Math.floor(Math.random() * 10),
            debates: Math.floor(Math.random() * 20),
            questions: Math.floor(Math.random() * 50),
          };
          setLeaders(prev => [newLeader, ...prev]);
        }
      }
    } catch (err) {
      console.error("Discovery error:", err);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleLoadMore = async () => {
    if (isBatchLoading || noMoreFound) return;
    setIsBatchLoading(true);
    const currentNames = leaders.map(l => l.name);
    const newBatch = await discoverBatchLeaders(currentNames);
    
    if (newBatch && newBatch.length > 0) {
      const formattedBatch: PoliticalLeader[] = newBatch.map(l => ({
        id: Math.random().toString(36).substr(2, 9),
        ...l,
        rating: 3.0 + Math.random() * 2,
        ratingCount: Math.floor(Math.random() * 100),
        attendance: Math.floor(Math.random() * 30) + 70,
        bills: Math.floor(Math.random() * 5),
        debates: Math.floor(Math.random() * 15),
        questions: Math.floor(Math.random() * 40),
      }));
      setLeaders(prev => [...prev, ...formattedBatch]);
    } else {
      setNoMoreFound(true);
    }
    setIsBatchLoading(false);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const newLeader: PoliticalLeader = {
      id: Math.random().toString(36).substr(2, 9),
      ...newLeaderForm,
      rating: 3.0,
      ratingCount: 0,
      attendance: 0,
      bills: 0,
      debates: 0,
      questions: 0,
    };
    setLeaders(prev => [newLeader, ...prev]);
    setShowAddModal(false);
    setNewLeaderForm({ name: '', role: 'MP', party: INDIAN_PARTIES[0], constituency: '', state: INDIAN_STATES[0], sinceYear: 2024 });
  };

  const parties = useMemo(() => ['All Parties', ...INDIAN_PARTIES], []);
  const states = useMemo(() => ['All States', ...INDIAN_STATES], []);

  if (selectedLeaderId && leaders.find(l => l.id === selectedLeaderId)) {
    const leader = leaders.find(l => l.id === selectedLeaderId)!;
    return <LeaderProfile 
      leader={leader} 
      onBack={() => setSelectedLeaderId(null)} 
      language={language}
      onUpdateRating={(id, newRating) => {
        setLeaders(prev => prev.map(l => {
          if (l.id === id) {
            const newCount = l.ratingCount + 1;
            const avgRating = ((l.rating * l.ratingCount) + newRating) / newCount;
            return { ...l, rating: Number(avgRating.toFixed(1)), ratingCount: newCount };
          }
          return l;
        }));
      }}
      onToggleFollow={(id) => {
        setLeaders(prev => prev.map(l => l.id === id ? { ...l, isFollowed: !l.isFollowed } : l));
      }}
    />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
            {t.leadersDirectory}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            {t.leadersSubtitle}
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          Add New Representative
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder={t.searchLeaders} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm dark:text-white"
          />
          {isDiscovering && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
               <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">AI SEARCH</span>
            </div>
          )}
        </div>

        {/* Refined Party Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { setIsPartyDropdownOpen(!isPartyDropdownOpen); setIsStateDropdownOpen(false); }}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left text-sm dark:text-white font-medium flex items-center justify-between transition"
          >
            <span className="truncate">{partyFilter === 'All Parties' ? t.allParties : partyFilter}</span>
            <svg className={`w-3 h-3 transition-transform ${isPartyDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {isPartyDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsPartyDropdownOpen(false)} />
              <div className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-40 py-1 scrollbar-hide">
                {parties.map(p => (
                  <button key={p} onClick={() => { setPartyFilter(p); setIsPartyDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${partyFilter === p ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    {p === 'All Parties' ? t.allParties : p}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Refined State Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { setIsStateDropdownOpen(!isStateDropdownOpen); setIsPartyDropdownOpen(false); }}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left text-sm dark:text-white font-medium flex items-center justify-between transition"
          >
            <span className="truncate">{stateFilter === 'All States' ? t.allStates : stateFilter}</span>
            <svg className={`w-3 h-3 transition-transform ${isStateDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {isStateDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsStateDropdownOpen(false)} />
              <div className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-40 py-1 scrollbar-hide">
                {states.map(s => (
                  <button key={s} onClick={() => { setStateFilter(s); setIsStateDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${stateFilter === s ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    {s === 'All States' ? t.allStates : s}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <select 
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm dark:text-white font-medium appearance-none"
        >
          <option value="Highest Rated">{t.highestRated}</option>
          <option value="Lowest Rated">{t.lowestRated}</option>
        </select>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm font-bold text-slate-500">
          {t.showing} <span className="text-slate-900 dark:text-white font-black">{filteredLeaders.length}</span> {t.leaders.toLowerCase()}
        </p>
        <button 
          onClick={() => { setSearchQuery(''); setPartyFilter('All Parties'); setStateFilter('All States'); }}
          className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
        >
          {t.resetFilters}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeaders.map(leader => (
          <div 
            key={leader.id} 
            onClick={() => setSelectedLeaderId(leader.id)}
            className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
          >
            <div className="p-6 space-y-4 flex-1">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {leader.name}
                    {leader.isFollowed && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" title="Following" />
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-[10px] font-black text-blue-600 dark:text-blue-400 rounded-md uppercase tracking-wider">{leader.role}</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 rounded-md uppercase tracking-wider">{leader.party}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-amber-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{leader.rating}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{leader.ratingCount} {t.ratings}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {leader.constituency}, {leader.state}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400">{leader.attendance}%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.attendance}</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{leader.bills}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.billsIntroduced}</div>
                </div>
              </div>
            </div>

            <div className="w-full py-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between px-6 bg-slate-50/30 dark:bg-slate-800/30 group-hover:bg-indigo-600 transition-colors">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 group-hover:text-white uppercase tracking-widest">Click to view audit</span>
              <svg className="w-4 h-4 text-indigo-600 group-hover:text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7M5 12h16" /></svg>
            </div>
          </div>
        ))}
      </div>

      {/* Find More Section */}
      <div className="pt-12 pb-20 flex flex-col items-center gap-6">
        {noMoreFound ? (
          <div className="bg-slate-50 dark:bg-slate-900/50 px-10 py-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center">
             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No more representatives to explore</p>
             <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">You have synchronized the entire directory</p>
          </div>
        ) : (
          <button 
            onClick={handleLoadMore}
            disabled={isBatchLoading}
            className="group relative px-12 py-5 bg-white dark:bg-slate-900 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black rounded-3xl hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-xl shadow-indigo-500/10 disabled:opacity-50 flex items-center gap-4 overflow-hidden active:scale-95"
          >
            {isBatchLoading ? (
              <>
                <div className="w-5 h-5 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <span className="uppercase tracking-[0.2em] text-xs">Accessing Election Data...</span>
              </>
            ) : (
              <>
                <span className="uppercase tracking-[0.2em] text-xs">Discover More Representatives</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </>
            )}
          </button>
        )}
        <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">Accountable India AI Directory Service</p>
      </div>

      {/* Add Leader Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Register New Leader</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleAddManual} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
                    <input required placeholder="Enter full name" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" value={newLeaderForm.name} onChange={e => setNewLeaderForm({...newLeaderForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Role</label>
                    <select className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" value={newLeaderForm.role} onChange={e => setNewLeaderForm({...newLeaderForm, role: e.target.value as 'MP' | 'MLA'})}>
                      <option value="MP">MP (Member of Parliament)</option>
                      <option value="MLA">MLA (Member of Legislative Assembly)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Political Party</label>
                    <select className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" value={newLeaderForm.party} onChange={e => setNewLeaderForm({...newLeaderForm, party: e.target.value})}>
                      {INDIAN_PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Constituency</label>
                    <input required placeholder="Enter constituency" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" value={newLeaderForm.constituency} onChange={e => setNewLeaderForm({...newLeaderForm, constituency: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">State / UT</label>
                    <select className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" value={newLeaderForm.state} onChange={e => setNewLeaderForm({...newLeaderForm, state: e.target.value})}>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Serving Since (Year)</label>
                    <input type="number" required placeholder="2024" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" value={newLeaderForm.sinceYear} onChange={e => setNewLeaderForm({...newLeaderForm, sinceYear: parseInt(e.target.value)})} />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/20 active:scale-[0.98]">
                  Register Representative Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaders;
