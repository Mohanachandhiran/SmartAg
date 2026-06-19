'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Languages, User, ShieldAlert, ArrowRight, Sun, Moon, LogOut } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useTheme } from 'next-themes';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Avoid hydration mismatch and fetch user role
  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('smartag_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        setUserName(user.name);
      } catch (e) {}
    }
  }, []);



  // Fetch real-time alerts from local mock / api
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://smartag-api-1siv.onrender.com/api'}/market/alerts`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        // Mock fallback notifications
        setNotifications([
          { id: '1', alertType: 'Heavy Rain Alert', message: 'Heavy rain forecasted for Madurai region.', severity: 'High' },
          { id: '2', alertType: 'Price Spike', message: 'Tomato prices went up 15% in Coimbatore Mandi.', severity: 'Medium' }
        ]);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md shadow-agri flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
        <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center text-amber-400 font-bold text-lg shadow-sm">
          🌾
        </div>
        <span className="font-serif font-bold text-xl text-green-800 tracking-wide">
          SmartAg <span className="text-amber-500 font-sans text-sm font-semibold">Collective</span>
        </span>
      </div>

      {/* Toolbar Controls */}
      <div className="flex items-center gap-3">
        {/* Market Explorer Link */}
        <button
          onClick={() => router.push('/market-explorer')}
          className="h-8 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md px-3 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          📈 Market Explorer
        </button>



        {/* Language Selection */}
        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)} 
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors relative"
            title="Change Language"
          >
            <Languages className="w-4 h-4 text-green-800" />
          </button>
          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-lg shadow-agri overflow-hidden z-50">
              <button 
                onClick={() => { setLanguage('ta'); setShowLangMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors ${language === 'ta' ? 'text-amber-500' : 'text-foreground'}`}
              >
                தமிழ்
              </button>
              <button 
                onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors ${language === 'en' ? 'text-amber-500' : 'text-foreground'}`}
              >
                English
              </button>
              <button 
                onClick={() => { setLanguage('hi'); setShowLangMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors ${language === 'hi' ? 'text-amber-500' : 'text-foreground'}`}
              >
                हिंदी
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors relative overflow-hidden"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-sunrise drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            ) : (
              <Moon className="w-4 h-4 text-green-800 animate-moonrise" />
            )}
          </button>
        )}

        {/* Notifications Center */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-green-800" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
              <div className="bg-green-800 text-primary-foreground px-4 py-2 text-xs font-bold font-serif flex items-center justify-between">
                <span>Alerts Feed</span>
                <span className="bg-amber-400 text-green-900 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold">
                  {notifications.length} Active
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                    No warnings or price alerts active.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 border-b border-border hover:bg-muted/50 transition-colors flex gap-2">
                      <ShieldAlert className={`w-4 h-4 shrink-0 ${n.severity === 'High' ? 'text-red-500' : 'text-amber-400'}`} />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-foreground">{n.alertType}</span>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        {pathname !== '/' && (
          mounted && userName && userRole ? (
            <div className="flex items-center gap-3 ml-2 border-l border-border pl-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm shadow-sm" title="Profile">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-col hidden sm:flex">
                  <span className="text-xs font-bold text-foreground">{userName}</span>
                  <span className="text-[10px] text-muted-foreground capitalize">{userRole.toLowerCase()}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('smartag_user');
                  localStorage.removeItem('smartag_token');
                  router.push('/');
                }}
                className="p-1.5 rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors relative"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2 border-l border-border pl-3">
              <button
                onClick={() => router.push('/')}
                className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md px-3 py-1.5 flex items-center transition-colors cursor-pointer"
              >
                Login
              </button>
            </div>
          )
        )}
      </div>
    </header>
  );
}
