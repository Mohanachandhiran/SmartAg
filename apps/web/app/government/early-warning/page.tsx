'use client';

import React, { useState } from 'react';
import { BellRing, ShieldCheck, MailWarning } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function EarlyWarning() {
  const { t } = useLanguage();
  
  const [alerts, setAlerts] = useState([
    { id: '1', type: 'Price Crash', district: 'Madurai', severity: 'High', message: '🍅 Tomato supply influx projected to cause a 20% price crash.', status: 'Pending' },
    { id: '2', type: 'Weather Disruption', district: 'Salem', severity: 'High', message: 'Flash flood alert near River Cauvery basins. Harvest activities restricted.', status: 'Pending' },
    { id: '3', type: 'Oversupply', district: 'Dindigul', severity: 'Medium', message: 'Oversupply of local chilli lots at Oddanchatram mandi.', status: 'Escalated' }
  ]);

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Acknowledged' } : a));
    alert(`Alert acknowledged.`);
  };

  const handleEscalate = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Escalated' } : a));
    alert(`Alert escalated to district crop monitors.`);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <BellRing className="w-6 h-6 text-green-700" />
          Early Warning Alert Desk
        </h1>
        <p className="text-xs text-muted-foreground">
          Monitor incoming crop alerts and trigger state emergency intervention guidelines.
        </p>
      </div>

      {/* Alert Feed */}
      <div className="flex flex-col gap-4">
        {alerts.map((a) => (
          <div key={a.id} className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            <div className="flex gap-3.5 items-start">
              <div className={`p-2.5 rounded-lg shrink-0 ${a.severity === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-amber-400/15 text-amber-500'}`}>
                <MailWarning className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm">{a.type} Warning</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${a.severity === 'High' ? 'bg-red-500 text-white' : 'bg-amber-400 text-green-900'}`}>
                    {a.severity}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mt-0.5">{a.district} District</span>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-lg">{a.message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
              {a.status === 'Pending' ? (
                <>
                  <button 
                    onClick={() => handleAcknowledge(a.id)}
                    className="border border-border text-foreground hover:bg-muted text-[10px] font-bold px-3 py-2 rounded-lg transition-colors"
                  >
                    Acknowledge
                  </button>
                  <button 
                    onClick={() => handleEscalate(a.id)}
                    className="bg-green-800 text-primary-foreground hover:bg-green-700 text-[10px] font-bold px-3 py-2 rounded-lg transition-colors"
                  >
                    Escalate
                  </button>
                </>
              ) : (
                <span className="bg-green-800/10 text-green-800 text-[10px] font-bold px-3 py-2 rounded-lg border border-green-800/20 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-green-800" />
                  {a.status}
                </span>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
