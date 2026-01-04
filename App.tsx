
import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import WelcomePage from './components/WelcomePage';
import { User } from './types';
import { Language } from './translations';
import { api } from './services/backend';

export type ThemePreference = 'light' | 'dark' | 'auto';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [view, setView] = useState<'auth' | 'welcome' | 'dashboard'>('auth');
  
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('themePreference') as ThemePreference;
    return saved || 'auto';
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'en';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Standard auth subscription (now LocalStorage-based)
    const unsubscribe = api.auth.subscribeToAuth((userData) => {
      if (userData) {
        setUser(userData);
        setView(prev => prev === 'auth' ? 'welcome' : prev);
      } else {
        setUser(null);
        setView('auth');
      }
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const calculateTheme = useCallback(() => {
    if (themePreference === 'dark') return true;
    if (themePreference === 'light') return false;
    const hour = new Date().getHours();
    return hour < 6 || hour >= 18;
  }, [themePreference]);

  useEffect(() => {
    const updateTheme = () => {
      const shouldBeDark = calculateTheme();
      setIsDarkMode(shouldBeDark);
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    updateTheme();
    localStorage.setItem('themePreference', themePreference);
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, [themePreference, calculateTheme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setView('welcome');
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
    setView('auth');
  };

  const handleStartDashboard = () => {
    setView('dashboard');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6">
           <img 
             src="https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_India.svg" 
             className="w-16 h-10 object-cover rounded shadow-md animate-pulse" 
             alt="Logo" 
           />
           <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user || view === 'auth') {
    return <Login onLogin={handleLogin} />;
  }

  if (view === 'welcome') {
    return <WelcomePage user={user} onContinue={handleStartDashboard} language={language} />;
  }

  return (
    <DashboardLayout 
      user={user} 
      onLogout={handleLogout} 
      onUpdateUser={handleUpdateUser}
      isDarkMode={isDarkMode} 
      themePreference={themePreference}
      setThemePreference={setThemePreference}
      language={language}
      setLanguage={setLanguage}
    />
  );
};

export default App;
