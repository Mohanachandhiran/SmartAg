'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Scale, BarChart3, AlertTriangle, BellRing, MapPin, Brain, FileSpreadsheet 
} from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function GovernmentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const userStr = localStorage.getItem('smartag_user');
    if (!userStr) {
      router.push('/auth/login?role=government');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'GOVERNMENT') {
        router.push('/'); // Redirect unauthorized
      }
    } catch (e) {
      router.push('/auth/login?role=government');
    }
  }, [router]);

  const menuItems = [
    { name: t('government.menu.command'), path: '/government/command-center', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: t('government.menu.supply'), path: '/government/supply-index', icon: <Scale className="w-4 h-4" /> },
    { name: t('government.menu.market'), path: '/government/market-intelligence', icon: <BarChart3 className="w-4 h-4" /> },
    { name: t('government.menu.risk'), path: '/government/risk-monitoring', icon: <AlertTriangle className="w-4 h-4" /> },
    { name: t('government.menu.earlyWarning'), path: '/government/early-warning', icon: <BellRing className="w-4 h-4" /> },
    { name: t('government.menu.fpoAnalytics'), path: '/government/fpo-analytics', icon: <MapPin className="w-4 h-4" /> },
    { name: t('government.menu.policy'), path: '/government/policy-insights', icon: <Brain className="w-4 h-4" /> },
    { name: t('government.menu.reports'), path: '/government/reports', icon: <FileSpreadsheet className="w-4 h-4" /> }
  ];

  return (
    <div className="flex flex-1 flex-col md:flex-row min-h-screen" style={{ '--current-heading': 'var(--font-ibm-plex)' } as React.CSSProperties}>
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 py-6 px-4 flex flex-col justify-between shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="px-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {t('government.title')}
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
