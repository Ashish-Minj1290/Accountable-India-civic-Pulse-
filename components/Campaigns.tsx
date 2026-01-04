
import React, { useState, useEffect, useMemo } from 'react';
import { User, Campaign } from '../types';
import { Language, translations } from '../translations';

interface CampaignsProps {
  user: User;
  onUpdateUser: (user: User) => void;
  language: Language;
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    title: 'bcxb',
    category: 'Education',
    description: 'gfdbfd',
    goal: 'cxbffbf',
    signatures: 0,
    signatureGoal: 999,
    startedBy: 'Kuldeep Negi',
    date: '27/12/2025'
  },
  {
    id: 'c2',
    title: 'bcxb',
    category: 'Education',
    description: 'gfdbfd',
    goal: 'cxbffbf',
    signatures: 1,
    signatureGoal: 999,
    startedBy: 'Kuldeep Negi',
    date: '27/12/2025'
  }
];

const Campaigns: React.FC<CampaignsProps> = ({ user, onUpdateUser, language }) => {
  const t = translations[language];
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('accountable_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    category: 'General',
    description: '',
    goal: '',
    signatureGoal: 1000
  });

  useEffect(() => {
    localStorage.setItem('accountable_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const stats = useMemo(() => {
    return {
      active: campaigns.length,
      totalSignatures: campaigns.reduce((acc, c) => acc + c.signatures, 0) + 25184, // Base from image + dynamic
      yourSignatures: campaigns.filter(c => c.isSignedByUser).length + 1 // Base from image
    };
  }, [campaigns]);

  const handleSign = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId && !c.isSignedByUser) {
        // Award points
        onUpdateUser({
          ...user,
          credits: user.credits + 5,
          impactScore: {
            ...user.impactScore,
            daily: user.impactScore.daily + 1
          }
        });
        return { ...c, signatures: c.signatures + 1, isSignedByUser: true };
      }
      return c;
    }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const campaign: Campaign = {
      id: Math.random().toString(36).substr(2, 9),
      ...newCampaign,
      signatures: 0,
      startedBy: user.name,
      date: new Date().toLocaleDateString('en-GB'),
    };
    setCampaigns([campaign, ...campaigns]);
    setShowCreateForm(false);
    setNewCampaign({ title: '', category: 'General', description: '', goal: '', signatureGoal: 1000 });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{t.citizenCampaigns}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{t.campaignsSubtitle}</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.active}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.activeCampaigns}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalSignatures}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.totalSignatures}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.yourSignatures}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.yourSignatures}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => setShowCreateForm(true)}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition flex items-center gap-2 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          {t.startACampaign}
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{t.startACampaign}</h3>
                <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <input required placeholder="Campaign Title" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={newCampaign.title} onChange={e => setNewCampaign({...newCampaign, title: e.target.value})} />
                <input required placeholder="Category (e.g., Education)" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={newCampaign.category} onChange={e => setNewCampaign({...newCampaign, category: e.target.value})} />
                <textarea required placeholder="Description" rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none" value={newCampaign.description} onChange={e => setNewCampaign({...newCampaign, description: e.target.value})} />
                <input required placeholder="Campaign Goal" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={newCampaign.goal} onChange={e => setNewCampaign({...newCampaign, goal: e.target.value})} />
                <input required type="number" placeholder="Signature Goal" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={newCampaign.signatureGoal} onChange={e => setNewCampaign({...newCampaign, signatureGoal: parseInt(e.target.value)})} />
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition shadow-xl">{t.save}</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="space-y-6">
        {campaigns.map(campaign => {
          const progressPercent = Math.min((campaign.signatures / campaign.signatureGoal) * 100, 100);
          return (
            <div key={campaign.id} className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition duration-300">
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">{campaign.title}</h2>
                    <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[10px] font-black text-blue-600 dark:text-blue-400 rounded-full uppercase tracking-wider">{campaign.category}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-blue-600">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3.005 3.005 0 013.75-2.906z" /></svg>
                       <span className="text-xl font-black">{campaign.signatures}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">signatures</span>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{campaign.description}</p>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                   <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t.campaignGoal}</p>
                     <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{campaign.goal}</p>
                   </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">{t.progress}</span>
                    <span className="text-slate-600 dark:text-slate-300">{Math.round(progressPercent)}% ({campaign.signatureGoal} {t.goalReached})</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-1000 ease-out" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-50 dark:border-slate-800">
                  <span>{t.startedBy} <span className="text-slate-900 dark:text-slate-200">{campaign.startedBy}</span></span>
                  <span>{campaign.date}</span>
                </div>
              </div>

              <button 
                onClick={() => handleSign(campaign.id)}
                disabled={campaign.isSignedByUser}
                className={`w-full py-4 font-black transition text-sm flex items-center justify-center gap-2 ${
                  campaign.isSignedByUser 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 cursor-default' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]'
                }`}
              >
                {campaign.isSignedByUser ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    {t.alreadySigned}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    {t.signThisCampaign}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Campaigns;
