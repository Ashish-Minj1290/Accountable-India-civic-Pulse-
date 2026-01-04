
import React, { useState } from 'react';
import { User } from '../types';
import Sidebar from './Sidebar';
import Header from './Header';
import Chatbot from './Chatbot';
import Profile from './Profile';
import Charity from './Charity';
import Leaderboard from './Leaderboard';
import CivicComplaints from './CivicComplaints';
import DashboardHome from './DashboardHome';
import Settings from './Settings';
import Forum from './Forum';
import Leaders from './Leaders';
import Campaigns from './Campaigns';
import Polls from './Polls';
import CompareLeaders from './CompareLeaders';
import LiveEvents from './LiveEvents';
import PromiseTracker from './PromiseTracker';
import Chatrooms from './Chatrooms';
import LeaderLegalWatch from './LeaderLegalWatch';
import ElectionUpdates from './ElectionUpdates';
import { ThemePreference } from '../App';
import { Language } from '../translations';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (updatedUser: User) => void;
  isDarkMode: boolean;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, onLogout, onUpdateUser, isDarkMode, themePreference, setThemePreference, language, setLanguage
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch(activeTab) {
      case 'profile': return (
        <Profile 
          user={user} 
          onUpdateUser={onUpdateUser} 
          isDarkMode={isDarkMode} 
          setThemePreference={setThemePreference} 
          language={language}
        />
      );
      case 'charity': return <Charity />;
      case 'leaderboard': return <Leaderboard user={user} language={language} />;
      case 'complaints': return <CivicComplaints language={language} />;
      case 'forums': return <Forum user={user} language={language} />;
      case 'leaders': return <Leaders language={language} />;
      case 'legal': return <LeaderLegalWatch language={language} />;
      case 'promises': return <PromiseTracker language={language} />;
      case 'campaigns': return <Campaigns user={user} onUpdateUser={onUpdateUser} language={language} />;
      case 'polls': return <Polls user={user} onUpdateUser={onUpdateUser} language={language} />;
      case 'compare': return <CompareLeaders language={language} />;
      case 'events': return <LiveEvents language={language} />;
      case 'election': return <ElectionUpdates language={language} />;
      case 'chatrooms': return <Chatrooms language={language} />;
      case 'settings': return (
        <Settings 
          user={user} 
          onUpdateUser={onUpdateUser} 
          themePreference={themePreference} 
          setThemePreference={setThemePreference}
          onNavigate={(tab) => setActiveTab(tab)}
          language={language}
          setLanguage={setLanguage}
        />
      );
      case 'home':
      default:
        return <DashboardHome language={language} user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fcfcfc] dark:bg-slate-950 overflow-hidden font-inter selection:bg-orange-500/20 selection:text-orange-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} 
        onClose={() => setIsSidebarOpen(false)}
        language={language}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          user={user} 
          onLogout={onLogout} 
          onProfileClick={() => setActiveTab('profile')}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          themePreference={themePreference}
          setThemePreference={setThemePreference}
          language={language}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 xl:p-12 scroll-smooth scrollbar-hide">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {renderContent()}
          </div>
        </main>
      </div>

      <Chatbot user={user} language={language} />
    </div>
  );
};

export default DashboardLayout;
