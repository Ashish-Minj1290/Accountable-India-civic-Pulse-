
import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/backend';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      if (isRegistering) {
        response = await api.auth.signup({ name: userName, email, password });
      } else {
        response = await api.auth.login(email, password);
      }

      if (response.success && response.data) {
        onLogin(response.data);
      } else {
        setError(response.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected system error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'Google') => {
    setSocialLoading(provider);
    setError(null);
    
    try {
      const response = await api.auth.socialLogin(provider);
      if (response.success && response.data) {
        onLogin(response.data);
      } else {
        setError(response.error || `${provider} authentication failed.`);
      }
    } catch (err) {
      setError('Social authentication could not be completed.');
    } finally {
      setSocialLoading(null);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    setUserName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950 p-4 sm:p-6 selection:bg-indigo-100 overflow-hidden relative">
      {/* Background Aesthetic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-[500px] z-10">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.08)] dark:shadow-none border border-white dark:border-slate-800 p-10 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-18 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl shadow-2xl shadow-indigo-500/40 mb-2 transform hover:rotate-3 transition-transform cursor-pointer overflow-hidden ring-4 ring-white dark:ring-slate-800">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_India.svg" className="w-full h-full object-cover scale-125" alt="India" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {isRegistering ? 'Start Your Journey' : 'Welcome Back'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-base">
              {isRegistering 
                ? 'Join Accountable India to lead change.' 
                : 'Enter your secure credentials to continue.'}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40 p-5 rounded-2xl flex items-center gap-4 animate-in zoom-in duration-300">
              <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <p className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-6">
            {isRegistering && (
              <div className="space-y-2 group">
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-2">Full Legal Name</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  <input
                    type="text"
                    required
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl focus:bg-white dark:focus:bg-slate-800 focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none font-bold text-slate-900 dark:text-white text-lg placeholder-slate-400"
                    placeholder="e.g. Rahul Sharma"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2 group">
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-2">Email Identity</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                <input
                  type="email"
                  required
                  className="w-full pl-16 pr-6 py-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl focus:bg-white dark:focus:bg-slate-800 focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none font-bold text-slate-900 dark:text-white text-lg placeholder-slate-400"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-2">Security Key</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-16 pr-16 py-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl focus:bg-white dark:focus:bg-slate-800 focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none font-bold text-slate-900 dark:text-white text-lg placeholder-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-all p-2 rounded-2xl bg-slate-100/50 dark:bg-slate-700/50"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {!isRegistering && (
              <div className="flex items-center justify-between px-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-500/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                    {rememberMe && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                    <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                  </div>
                  <span className="text-sm font-black text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">Remember device</span>
                </label>
                <button type="button" className="text-sm font-black text-indigo-600 hover:text-indigo-700 transition tracking-wide">Recover Key?</button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !!socialLoading}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-black rounded-[1.5rem] shadow-2xl shadow-indigo-500/40 transition-all transform hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-4 mt-8 uppercase tracking-[0.2em] text-sm ring-8 ring-transparent focus:ring-indigo-500/10"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center gap-3">
                  {isRegistering ? 'Initialize Citizen Account' : 'Authenticate Securely'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </span>
              )}
            </button>
          </form>

          <div className="relative py-4 flex items-center gap-6">
            <div className="flex-1 border-t-2 border-slate-100 dark:border-slate-800"></div>
            <span className="text-xs font-black uppercase text-slate-300 dark:text-slate-600 tracking-[0.4em]">One-Tap Access</span>
            <div className="flex-1 border-t-2 border-slate-100 dark:border-slate-800"></div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              disabled={!!socialLoading || isLoading}
              onClick={() => handleSocialLogin('Google')}
              className={`w-full max-w-[280px] h-14 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl border-2 border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-lg shadow-black/5 ${socialLoading === 'Google' ? 'animate-pulse' : ''}`}
            >
              {socialLoading === 'Google' ? (
                <div className="w-5 h-5 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-[0.15em]">Login with Google</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={toggleMode}
              className="group text-base font-black text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {isRegistering ? 'Returning citizen?' : "New to the platform?"} 
              <span className="ml-2 text-indigo-600 dark:text-indigo-400 group-hover:underline underline-offset-8 decoration-4">
                {isRegistering ? 'Sign In Now' : 'Create Identity'}
              </span>
            </button>
          </div>
        </div>
        
        <div className="mt-12 text-center px-12">
          <p className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-[0.3em] leading-relaxed opacity-60">
            Accountable India Intelligence • Tier-4 Secure Infrastructure • 256-Bit Citizen Protocol
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
