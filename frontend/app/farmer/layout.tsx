'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Sprout, BrainCircuit, TrendingUp, Users, Map, Mic, CreditCard, CloudRain, Calculator, Activity
} from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const userStr = localStorage.getItem('smartag_user');
    if (!userStr) {
      router.push('/auth/login?role=farmer');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'FARMER') {
        router.push('/'); // Redirect unauthorized
      }
    } catch (e) {
      router.push('/auth/login?role=farmer');
    }
  }, [router]);

  const menuItems = [
    { name: t('common.dashboard'), path: '/farmer/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: t('farmer.registration.title'), path: '/farmer/crop-registration', icon: <Sprout className="w-4 h-4" /> },
    { name: t('farmer.aiAdvisor.title'), path: '/farmer/ai-advisor', icon: <BrainCircuit className="w-4 h-4" /> },
    { name: t('farmer.menu.simulator'), path: '/farmer/profit-simulator', icon: <Calculator className="w-4 h-4" /> },
    { name: t('farmer.menu.mandi'), path: '/farmer/market-intelligence', icon: <TrendingUp className="w-4 h-4" /> },
    { name: t('farmer.menu.weather'), path: '/farmer/weather', icon: <CloudRain className="w-4 h-4" /> },
    { name: t('farmer.collective.title'), path: '/farmer/collective-selling', icon: <Users className="w-4 h-4" /> },
    { name: t('farmer.voice.title'), path: '/farmer/voice-assistant', icon: <Mic className="w-4 h-4" /> },
    { name: t('farmer.menu.scanner'), path: '/farmer/crop-scanner', icon: <Activity className="w-4 h-4" /> },
    { name: t('farmer.menu.payments'), path: '/farmer/payments', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-1 flex-col md:flex-row min-h-screen" style={{ '--current-body': 'var(--font-noto-sans)' } as React.CSSProperties}>
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 py-6 px-4 flex flex-col justify-between shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="px-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-sans">
              {t('farmer.dashboard.title')}
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const active = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${active ? 'bg-green-800 text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main page content */}
      <div className="flex-1 bg-transparent p-4 sm:p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
