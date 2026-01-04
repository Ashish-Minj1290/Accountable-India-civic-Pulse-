
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CivicComplaint, ComplaintStatus, PriorityLevel } from '../types';
import { Language, translations } from '../translations';
import { searchPlaceOnMaps } from '../services/geminiService';

interface CivicComplaintsProps {
  language: Language;
}

const CATEGORIES = [
  'Roads', 
  'Electricity', 
  'Water', 
  'Sanitation', 
  'Safety', 
  'Public Transport', 
  'Health',
  'Waste Management',
  'Street Lighting',
  'Noise Pollution',
  'Traffic & Parking',
  'Illegal Encroachment',
  'Animal Welfare',
  'Parks & Playgrounds'
];

const PRIORITIES: PriorityLevel[] = ['Low', 'Medium', 'High'];
const STATUSES: ComplaintStatus[] = ['Active', 'Processing', 'Resolved', 'In Progress'];

const CivicComplaints: React.FC<CivicComplaintsProps> = ({ language }) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [complaints, setComplaints] = useState<CivicComplaint[]>(() => {
    const saved = localStorage.getItem('nexus_complaints_v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState<Partial<CivicComplaint>>({
    title: '',
    category: CATEGORIES[0],
    description: '',
    location: '',
    constituency: '',
    state: '',
    priority: 'Medium',
    photo: '',
    googleMapsLink: ''
  });

  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  // Fix: Move 'filters' state declaration above its first usage in useMemo to prevent block-scoped variable error
  const [filters, setFilters] = useState({
    category: 'All Categories',
    status: 'All Status'
  });
  
  useEffect(() => {
    localStorage.setItem('nexus_complaints_v3', JSON.stringify(complaints));
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchCat = filters.category === 'All Categories' || c.category === filters.category;
      const matchStatus = filters.status === 'All Status' || c.status === filters.status;
      return matchCat && matchStatus;
    });
  }, [complaints, filters]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Unified Auto-detect feature:
   * 1. Get GPS coordinates
   * 2. Use Gemini 2.5 Flash Maps Grounding to find the nearest landmark or address
   * 3. Attach the specific Google Maps URI to the report
   */
  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsAutoDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Pass coordinates to Gemini for grounding
          const query = `Find nearest specific address and civic landmark for location ${latitude}, ${longitude}`;
          const result = await searchPlaceOnMaps(query, latitude, longitude);
          
          if (result.mapsLinks.length > 0) {
            const topMatch = result.mapsLinks[0];
            setFormData(prev => ({ 
              ...prev, 
              location: topMatch.title || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              googleMapsLink: topMatch.uri 
            }));
          } else {
            setFormData(prev => ({ 
              ...prev, 
              location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
            }));
          }
        } catch (err) {
          console.error("AI Mapping error:", err);
          setFormData(prev => ({ 
            ...prev, 
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
          }));
        } finally {
          setIsAutoDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Please check browser permissions.");
        setIsAutoDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    const newComplaint: CivicComplaint = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title || '',
      category: formData.category || CATEGORIES[0],
      description: formData.description || '',
      location: formData.location || '',
      constituency: formData.constituency || '',
      state: formData.state || '',
      priority: formData.priority || 'Medium',
      photo: formData.photo,
      googleMapsLink: formData.googleMapsLink,
      date: new Date().toLocaleDateString(),
      status: 'Active'
    };

    setComplaints([newComplaint, ...complaints]);
    // Reset form
    setFormData({
      title: '',
      category: CATEGORIES[0],
      description: '',
      location: '',
      constituency: '',
      state: '',
      priority: 'Medium',
      photo: '',
      googleMapsLink: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-[#1e293b] dark:text-white tracking-tight leading-tight">
          {t.reportTitle}
        </h1>
        <p className="text-[#64748b] dark:text-slate-400 font-medium text-lg">
          {t.reportSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden sticky top-8">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <h2 className="font-bold text-[#1e293b] dark:text-white">Smart Reporter</h2>
               </div>
               {isAutoDetecting && (
                 <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 animate-pulse">
                   AI MAPPING...
                 </div>
               )}
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#475569] dark:text-slate-400">Issue Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white transition"
                  placeholder={t.briefDescription}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#475569] dark:text-slate-400">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white appearance-none cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#475569] dark:text-slate-400">Detailed Description</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white resize-none transition"
                  placeholder={t.provideDetails}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-400">Location</label>
                  <button 
                    type="button"
                    onClick={handleAutoDetect}
                    disabled={isAutoDetecting}
                    className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 transition-all ${
                      isAutoDetecting 
                        ? 'bg-slate-50 border-slate-100 text-slate-300' 
                        : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
                    }`}
                  >
                    <svg className={`w-3.5 h-3.5 ${isAutoDetecting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {isAutoDetecting ? 'Mapping...' : 'Auto-detect Location'}
                  </button>
                </div>
                <input 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white transition"
                  placeholder="Address or Landmark"
                />
                
                {formData.googleMapsLink && (
                  <div className="flex items-center justify-between mt-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg animate-in slide-in-from-top-1">
                    <div className="flex items-center gap-2">
                       <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                       <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Google Pin Attached</span>
                    </div>
                    <a href={formData.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-indigo-600 hover:underline">View Map</a>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-400">Constituency</label>
                  <input 
                    value={formData.constituency}
                    onChange={e => setFormData({...formData, constituency: e.target.value})}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white transition"
                    placeholder={t.yourConstituency}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#475569] dark:text-slate-400">State</label>
                  <input 
                    value={formData.state}
                    onChange={e => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white transition"
                    placeholder={t.yourState}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#475569] dark:text-slate-400">Priority Level</label>
                <select 
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value as PriorityLevel})}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white appearance-none cursor-pointer"
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#475569] dark:text-slate-400">Evidence Image</label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-800/50 transition relative overflow-hidden"
                >
                  {formData.photo ? (
                    <div className="w-full h-32 relative">
                      <img src={formData.photo} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <span className="text-white text-[10px] font-black uppercase">Change Photo</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-xs font-bold text-slate-500">Add Evidence</span>
                    </>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isAutoDetecting}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition active:scale-[0.98] shadow-lg shadow-indigo-500/20 disabled:opacity-70 uppercase tracking-widest text-xs"
              >
                {t.reportIssueBtn}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
             <div className="flex-1">
               <select 
                 value={filters.category}
                 onChange={e => setFilters({...filters, category: e.target.value})}
                 className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs font-bold text-[#475569] dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
               >
                 <option>All Categories</option>
                 {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
             <div className="flex-1">
               <select 
                 value={filters.status}
                 onChange={e => setFilters({...filters, status: e.target.value})}
                 className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs font-bold text-[#475569] dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
               >
                 <option>All Status</option>
                 {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px]">
            {filteredComplaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border-2 border-slate-100 dark:border-slate-700">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-[#1e293b] dark:text-white mb-2">{t.noIssuesFound}</h3>
                <p className="text-slate-400 dark:text-slate-500 font-medium text-sm max-w-xs">{t.beFirstToReport}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredComplaints.map(complaint => (
                  <div key={complaint.id} className="p-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition group animate-in slide-in-from-right-2 duration-300">
                    <div className="flex justify-between items-start mb-3">
                       <div className="space-y-1">
                          <h4 className="text-xl font-black text-[#1e293b] dark:text-white group-hover:text-indigo-600 transition-colors">{complaint.title}</h4>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className="px-3 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-[9px] font-black text-indigo-600 dark:text-indigo-400 rounded-md uppercase tracking-wider">{complaint.category}</span>
                            <span className={`px-3 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                              complaint.priority === 'High' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                              complaint.priority === 'Medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>Priority: {complaint.priority}</span>
                          </div>
                       </div>
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                       }`}>
                         {complaint.status}
                       </span>
                    </div>

                    <p className="text-[#64748b] dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
                      {complaint.description}
                    </p>

                    <div className="flex flex-wrap gap-4 mb-6">
                      {complaint.photo && (
                        <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 max-w-[200px]">
                          <img src={complaint.photo} alt="Report attachment" className="w-full h-auto object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-50 dark:border-slate-800 items-start">
                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                          <p className="text-xs font-bold text-[#1e293b] dark:text-slate-200 truncate">{complaint.location}</p>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maps</span>
                          {complaint.googleMapsLink ? (
                            <a 
                              href={complaint.googleMapsLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                              View on Google Maps
                            </a>
                          ) : (
                            <p className="text-xs font-bold text-slate-300 dark:text-slate-600 italic">No link</p>
                          )}
                       </div>
                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Constituency</span>
                          <p className="text-xs font-bold text-[#1e293b] dark:text-slate-200 truncate">{complaint.constituency}, {complaint.state}</p>
                       </div>
                       <div className="space-y-1 hidden md:block text-right">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported On</span>
                          <p className="text-xs font-bold text-[#1e293b] dark:text-slate-200">{complaint.date}</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicComplaints;
