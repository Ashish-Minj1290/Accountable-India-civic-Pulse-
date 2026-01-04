
import React, { useState, useEffect } from 'react';
import { CharityNGO } from '../types';
import { GoogleGenAI } from "@google/genai";

const NGOS: CharityNGO[] = [
  {
    id: '1',
    name: 'Ocean Guardians',
    category: 'Environment',
    description: 'Protecting marine life and cleaning up oceanic plastic through innovative filtration systems.',
    logo: '🌊',
    website: '#'
  },
  {
    id: '2',
    name: 'Future Scholars',
    category: 'Education',
    description: 'Providing scholarships and digital tools for underprivileged children in rural areas.',
    logo: '📚',
    website: '#'
  },
  {
    id: '3',
    name: 'Global Health Bridge',
    category: 'Health',
    description: 'Ensuring essential medicines and medical care reach the most remote communities.',
    logo: '🏥',
    website: '#'
  },
  {
    id: '4',
    name: 'Urban Hope Relief',
    category: 'Poverty',
    description: 'Fighting food insecurity in metropolitan areas through sustainable community kitchens.',
    logo: '🍲',
    website: '#'
  }
];

const Charity: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [dailyQuote, setDailyQuote] = useState<string>("Small acts, when multiplied by millions of people, can transform the world.");
  const [selectedNGO, setSelectedNGO] = useState<CharityNGO | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('10');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Generate a beautiful, short inspirational quote about charity and social service (under 15 words). Just return the quote text.",
        });
        if (response.text) {
          setDailyQuote(response.text.replace(/"/g, ''));
        }
      } catch (e) {
        console.error("Quote fetch error", e);
      }
    };
    fetchQuote();
  }, []);

  const filteredNGOs = activeCategory === 'All' 
    ? NGOS 
    : NGOS.filter(ngo => ngo.category === activeCategory);

  const handleDonate = (ngo: CharityNGO) => {
    setSelectedNGO(ngo);
    setShowPayment(true);
    setPaymentStatus('idle');
  };

  const processPayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 90% success rate
      setPaymentStatus(isSuccess ? 'success' : 'error');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Quote Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 md:p-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            Daily Inspiration
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 italic leading-tight">
            "{dailyQuote}"
          </h2>
          <p className="text-emerald-100 text-sm md:text-base opacity-80">
            Every contribution matters. Join our mission to empower communities and preserve our planet.
          </p>
        </div>
      </div>

      {/* Categories and Filtering */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Partner Organizations</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Find a cause that resonates with you.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['All', 'Environment', 'Education', 'Health', 'Poverty'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* NGO Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredNGOs.map(ngo => (
          <div key={ngo.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              {ngo.logo}
            </div>
            <div className="mb-2">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{ngo.category}</span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{ngo.name}</h4>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1 line-clamp-3">
              {ngo.description}
            </p>
            <button 
              onClick={() => handleDonate(ngo)}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95"
            >
              Donate Now
            </button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPayment && selectedNGO && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowPayment(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-200 dark:border-slate-800">
            
            {/* Modal Content */}
            {paymentStatus === 'success' ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Thank You!</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  Your contribution of ${paymentAmount} to <strong>{selectedNGO.name}</strong> was successful. We've sent a receipt to your email.
                </p>
                <button 
                  onClick={() => setShowPayment(false)}
                  className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-2xl"
                >
                  Close
                </button>
              </div>
            ) : paymentStatus === 'error' ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                  !
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Failed</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  We encountered an issue processing your transaction. Please try again after sometime.
                </p>
                <button 
                  onClick={() => setPaymentStatus('idle')}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedNGO.logo}</span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Donate to {selectedNGO.name}</h3>
                      <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-widest">{selectedNGO.category}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPayment(false)} className="text-slate-400 hover:text-slate-600 transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  {/* Amount Selection */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Select Amount</label>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {['10', '50', '100'].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setPaymentAmount(amt)}
                          className={`py-3 rounded-xl font-bold transition border-2 ${
                            paymentAmount === amt 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                       <input 
                          type="number"
                          placeholder="Other amount"
                          className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
                          onChange={(e) => setPaymentAmount(e.target.value)}
                       />
                    </div>
                  </div>

                  {/* Payment Method Details (Simulated) */}
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Card Details</label>
                        <input 
                           type="text"
                           placeholder="0000 0000 0000 0000"
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input 
                           type="text"
                           placeholder="MM/YY"
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
                        />
                        <input 
                           type="text"
                           placeholder="CVV"
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
                        />
                     </div>
                  </div>

                  <button 
                    onClick={processPayment}
                    disabled={paymentStatus === 'processing'}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
                  >
                    {paymentStatus === 'processing' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Pay ${paymentAmount} Securely</span>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
                    🔒 Secured encrypted payment gateway
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Charity;
