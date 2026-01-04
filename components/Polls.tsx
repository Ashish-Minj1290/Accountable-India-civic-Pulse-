
import React, { useState, useEffect } from 'react';
import { User, Poll } from '../types';
import { Language, translations } from '../translations';

interface PollsProps {
  user: User;
  onUpdateUser: (user: User) => void;
  language: Language;
}

const INITIAL_POLLS: Poll[] = [
  {
    id: 'p1',
    question: 'What should be the top priority for infrastructure development?',
    category: 'National Issue',
    totalVotes: 4231,
    endsOn: '28/02/2025',
    options: [
      { id: 'o1', label: 'Roads and highways', votes: 1248 },
      { id: 'o2', label: 'Public transport', votes: 892 },
      { id: 'o3', label: 'Water supply and sanitation', votes: 1635 },
      { id: 'o4', label: 'Internet connectivity', votes: 456 }
    ]
  },
  {
    id: 'p2',
    question: 'How satisfied are you with the current healthcare system?',
    category: 'Policy Feedback',
    totalVotes: 2023,
    endsOn: '15/02/2025',
    options: [
      { id: 'h1', label: 'Very satisfied', votes: 450 },
      { id: 'h2', label: 'Somewhat satisfied', votes: 820 },
      { id: 'h3', label: 'Neutral', votes: 403 },
      { id: 'h4', label: 'Dissatisfied', votes: 350 }
    ]
  }
];

const Polls: React.FC<PollsProps> = ({ user, onUpdateUser, language }) => {
  const t = translations[language];
  const [polls, setPolls] = useState<Poll[]>(() => {
    const saved = localStorage.getItem('accountable_polls');
    return saved ? JSON.parse(saved) : INITIAL_POLLS;
  });

  useEffect(() => {
    localStorage.setItem('accountable_polls', JSON.stringify(polls));
  }, [polls]);

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(prevPolls => prevPolls.map(poll => {
      if (poll.id === pollId && !poll.votedOptionId) {
        // Update user stats
        onUpdateUser({
          ...user,
          credits: user.credits + 10,
          impactScore: {
            ...user.impactScore,
            daily: user.impactScore.daily + 1
          }
        });

        const updatedOptions = poll.options.map(opt => 
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );

        return {
          ...poll,
          totalVotes: poll.totalVotes + 1,
          votedOptionId: optionId,
          options: updatedOptions
        };
      }
      return poll;
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{t.citizenPolls}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{t.pollsSubtitle}</p>
      </div>

      <div className="space-y-8">
        {polls.map((poll) => (
          <div key={poll.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 transition-all hover:shadow-md">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{poll.question}</h2>
                  <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[10px] font-black text-blue-600 dark:text-blue-400 rounded-full uppercase tracking-wider">
                    {poll.category}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  {poll.totalVotes.toLocaleString()}
                </div>
              </div>

              <div className="space-y-4">
                {poll.options.map((option) => {
                  const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
                  const isVoted = poll.votedOptionId === option.id;

                  return (
                    <div key={option.id} className="relative">
                      {poll.votedOptionId ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-end text-sm font-bold">
                            <span className="text-slate-800 dark:text-white">{option.label}</span>
                            <span className="text-slate-500 dark:text-slate-400">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ease-out ${isVoted ? 'bg-indigo-600' : 'bg-slate-900 dark:bg-slate-700'}`} 
                              style={{ width: `${percentage}%` }} 
                            />
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {option.votes.toLocaleString()} {t.votes}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVote(poll.id, option.id)}
                          className="w-full text-left p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 transition-all font-bold text-slate-700 dark:text-slate-300 flex justify-between items-center group"
                        >
                          {option.label}
                          <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-600 group-hover:border-indigo-500 transition-colors" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {poll.votedOptionId && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-black">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {t.votedMsg}
                </div>
              )}

              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t.endsOn}: {poll.endsOn}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Polls;
