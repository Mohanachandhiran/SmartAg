'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Scale, BarChart3, AlertTriangle, BellRing, MapPin, Brain, FileSpreadsheet 
} from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function GovernmentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const menuItems = [
    { name: 'Command Center', path: '/government/command-center', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Supply Stability Index', path: '/government/supply-index', icon: <Scale className="w-4 h-4" /> },
    { name: 'Market Intel', path: '/government/market-intelligence', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Risk Monitoring', path: '/government/risk-monitoring', icon: <AlertTriangle className="w-4 h-4" /> },
    { name: 'Early Warning alerts', path: '/government/early-warning', icon: <BellRing className="w-4 h-4" /> },
    { name: 'FPO Analytics', path: '/government/fpo-analytics', icon: <MapPin className="w-4 h-4" /> },
    { name: 'Policy Insights', path: '/government/policy-insights', icon: <Brain className="w-4 h-4" /> },
    { name: 'Intervention Reports', path: '/government/reports', icon: <FileSpreadsheet className="w-4 h-4" /> }
  ];

  return (
    <div className="flex flex-1 flex-col md:flex-row min-h-screen">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 py-6 px-4 flex flex-col justify-between shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="px-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-sans">
              State Monitor Panel
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
      <div className="flex-1 bg-surface p-4 sm:p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
