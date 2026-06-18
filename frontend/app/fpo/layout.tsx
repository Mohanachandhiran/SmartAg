'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Inbox, Merge, ListCollapse, Globe, HeartHandshake, Truck, BarChart3 
} from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function FpoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const userStr = localStorage.getItem('smartag_user');
    if (!userStr) {
      router.push('/auth/login?role=fpo');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'FPO') {
        router.push('/'); // Redirect unauthorized
      }
    } catch (e) {
      router.push('/auth/login?role=fpo');
    }
  }, [router]);

  const menuItems = [
    { name: t('common.dashboard'), path: '/fpo/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: t('fpo.menu.requests'), path: '/fpo/farmer-requests', icon: <Inbox className="w-4 h-4" /> },
    { name: t('fpo.menu.grouping'), path: '/fpo/ai-grouping', icon: <Merge className="w-4 h-4" /> },
    { name: t('fpo.menu.management'), path: '/fpo/group-management', icon: <ListCollapse className="w-4 h-4" /> },
    { name: t('fpo.menu.marketplace'), path: '/fpo/marketplace', icon: <Globe className="w-4 h-4" /> },
    { name: t('fpo.menu.buyers'), path: '/fpo/buyers', icon: <HeartHandshake className="w-4 h-4" /> },
    { name: t('fpo.menu.logistics'), path: '/fpo/logistics', icon: <Truck className="w-4 h-4" /> },
    { name: t('fpo.menu.analytics'), path: '/fpo/analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-1 flex-col md:flex-row min-h-screen" style={{ '--current-heading': 'var(--font-inter)', '--current-body': 'var(--font-inter)' } as React.CSSProperties}>
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 py-6 px-4 flex flex-col justify-between shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="px-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {t('fpo.title')}
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
