'use client';

import React, { useState } from 'react';
import { CalendarDays, ShoppingBag, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function Procurement() {
  const { t } = useLanguage();
  const [demandQty, setDemandQty] = useState('15000');

  // Simulated supply vs demand comparison by week (Recharts)
  const supplyVsDemand = [
    { week: 'Wk 1', supply: 8400, demand: parseFloat(demandQty) || 10000 },
    { week: 'Wk 2', supply: 12500, demand: parseFloat(demandQty) || 10000 },
    { week: 'Wk 3', supply: 16200, demand: parseFloat(demandQty) || 10000 },
    { week: 'Wk 4', supply: 9400, demand: parseFloat(demandQty) || 10000 }
  ];

  const calendarEvents = [
    { date: '2026-06-20', crop: 'Tomato', qty: '8.4 Tonnes', district: 'Madurai' },
    { date: '2026-06-22', crop: 'Banana', qty: '12.5 Tonnes', district: 'Coimbatore' },
    { date: '2026-06-25', crop: 'Onion', qty: '16.2 Tonnes', district: 'Salem' }
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-green-700" />
          Procurement Supply Forecasting
        </h1>
        <p className="text-xs text-muted-foreground">
          Analyze upcoming crop harvests, specify your volume demand, and forecast supply matching across weeks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Demand config form and chart */}
        <div className="lg:col-span-2 bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <span className="text-[10px] text-muted-foreground font-bold uppercase">Demand Volume Alignment (kg)</span>
              
              {/* Demand input fields */}
              <div className="flex items-center gap-2 border border-border bg-surface px-2.5 py-1 rounded-lg">
                <span className="text-[10px] text-muted-foreground font-bold">Target demand:</span>
                <input 
                  type="number"
                  value={demandQty}
                  onChange={(e) => setDemandQty(e.target.value)}
                  className="text-xs font-bold text-green-800 bg-transparent w-20 focus:outline-none"
                />
              </div>
            </div>

            {/* Recharts comparison bar */}
            <div className="h-44 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplyVsDemand}>
                  <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="#5C5A56" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#5C5A56" />
                  <Tooltip contentStyle={{ fontSize: '10px' }} />
                  <Legend wrapperStyle={{ fontSize: '9px' }} />
                  <Bar dataKey="supply" name="Aggregated Supply (kg)" fill="#1A4D2E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="demand" name="Required Demand (kg)" fill="#F5A623" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Harvest calendar events */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-serif font-bold text-foreground">Aggregated Harvest Calendar</h3>
          
          <div className="flex flex-col gap-3">
            {calendarEvents.map((evt, idx) => (
              <div key={idx} className="bg-surface border border-border p-3.5 rounded-lg text-xs flex gap-3">
                <div className="p-2 bg-green-800/10 text-green-800 rounded-lg shrink-0 h-fit">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-foreground block">{evt.crop} harvest aggregated</span>
                  <span className="text-[10px] text-muted-foreground">{evt.qty} expected in {evt.district} region</span>
                  <span className="text-[9px] text-amber-600 font-bold block mt-1">Est dispatch: {evt.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
