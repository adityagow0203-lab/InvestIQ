import React, { useState } from 'react';
import { AppView, User } from '../types';

interface AuthProps {
  setView: (view: AppView) => void;
  setUser: (user: User) => void;
}

export const Login: React.FC<AuthProps> = ({ setView, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdminMode) {
        if (email === 'admin' && password === 'admin') {
            setUser({ username: 'SysAdmin', email, isAdmin: true });
            setView(AppView.ADMIN);
        } else {
            setError('Invalid Admin Credentials');
        }
        return;
    }

    // User Login
    if (email && password) {
      setUser({ username: email.split('@')[0], email });
      const hasPortfolio = localStorage.getItem('investiq_portfolio');
      setView(hasPortfolio ? AppView.DASHBOARD : AppView.ONBOARDING);
    } else {
      setError('Please fill in all fields');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      <div className="w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-2xl border border-slate-800">
        
        {/* Toggle Switch */}
        <div className="flex justify-center mb-8">
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex relative">
                <button 
                    onClick={() => setIsAdminMode(false)}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all z-10 ${!isAdminMode ? 'text-white bg-slate-800 shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Investor
                </button>
                <button 
                    onClick={() => setIsAdminMode(true)}
                    className={`px-6 py-2 text-sm font-medium rounded-md transition-all z-10 ${isAdminMode ? 'text-white bg-slate-800 shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Administrator
                </button>
            </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 tracking-tight">InvestIQ</h1>
          <p className="mt-2 text-slate-400 text-sm tracking-wide">
            {isAdminMode ? 'SYSTEM ACCESS PORTAL' : 'PROFESSIONAL PORTFOLIO TRACKING'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
             <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs text-center font-mono">
                {error}
             </div>
          )}
          
          <div className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    {isAdminMode ? 'Admin ID' : 'Email Address'}
                </label>
                <input
                type={isAdminMode ? "text" : "email"}
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono text-sm"
                placeholder={isAdminMode ? "admin" : "name@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Password
                </label>
                <input
                type="password"
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 font-bold text-white rounded shadow-lg transition-all transform active:scale-95 ${isAdminMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-sky-600 hover:bg-sky-500'}`}
          >
            {isAdminMode ? 'ACCESS SYSTEM' : 'ENTER PORTFOLIO'}
          </button>
        </form>

        {!isAdminMode && (
            <div className="mt-6 text-center">
            <button onClick={() => setView(AppView.SIGNUP)} className="text-xs text-slate-500 hover:text-sky-400 transition">
                New User? <span className="underline">Create an account</span>
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

export const Signup: React.FC<AuthProps> = ({ setView, setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password) {
      setUser({ username: name, email });
      setView(AppView.ONBOARDING);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-2xl border border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">InvestIQ</h1>
          <p className="mt-2 text-slate-400 text-sm">Initialize your financial journey</p>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-sky-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-4 font-bold text-white bg-sky-600 rounded hover:bg-sky-500 transition-colors"
          >
            INITIALIZE ACCOUNT
          </button>
        </form>
        <div className="text-center mt-6">
          <button onClick={() => setView(AppView.LOGIN)} className="text-xs text-slate-500 hover:text-white">
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
};