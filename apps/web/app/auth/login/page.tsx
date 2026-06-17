'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sprout, Users, ShoppingBag, Landmark, ArrowRight, Lock, User, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'farmer';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getRoleInfo = () => {
    switch(role) {
      case 'fpo': return { title: 'FPO Portal Login', icon: <Users className="w-12 h-12 text-amber-500" />, color: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-800', next: '/fpo/dashboard' };
      case 'buyer': return { title: 'Buyer Marketplace Login', icon: <ShoppingBag className="w-12 h-12 text-blue-500" />, color: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800', next: '/buyer/dashboard' };
      case 'government': return { title: 'Gov Command Center Login', icon: <Landmark className="w-12 h-12 text-purple-500" />, color: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-800', next: '/government/command-center' };
      case 'farmer':
      default:
        return { title: 'Farmer Portal Login', icon: <Sprout className="w-12 h-12 text-emerald-700" />, color: 'border-emerald-800', bg: 'bg-emerald-50', text: 'text-emerald-800', next: '/farmer/dashboard' };
    }
  };

  const info = getRoleInfo();

  const [isRegister, setIsRegister] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both your name and password.');
      return;
    }

    setLoading(true);
    
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? { name: username, password, role: role.toUpperCase() } : { name: username, password };
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isRegister) {
        // If registered successfully, auto-login by calling login
        const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: username, password })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error || 'Login after registration failed');
        localStorage.setItem('smartag_token', loginData.token);
        localStorage.setItem('smartag_user', JSON.stringify(loginData.user));
      } else {
        localStorage.setItem('smartag_token', data.token);
        localStorage.setItem('smartag_user', JSON.stringify(data.user));
      }
      
      router.push(info.next);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[#F5F7FB] p-6">
      <div className={`w-full max-w-md bg-white border-t-4 ${info.color} rounded-2xl shadow-xl p-8`}>
        <div className="flex flex-col items-center text-center mb-8">
          <div className={`p-4 rounded-full ${info.bg} mb-4`}>
            {info.icon}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{info.title}</h1>
          <p className="text-xs text-slate-500 mt-2">
            Secure access to your personal SmartAg dashboard.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Registered Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`mt-2 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg shadow-md transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
               <>{isRegister ? 'Create Account' : 'Login Securely'} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <button onClick={() => router.push('/')} className="hover:text-slate-800 transition-colors">
            &larr; Back to Platform
          </button>
          <button onClick={() => setIsRegister(!isRegister)} className="hover:text-slate-800 transition-colors">
            {isRegister ? 'Already have an account? Login' : 'Create an Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-500">Loading auth module...</div>}>
      <LoginForm />
    </Suspense>
  );
}
