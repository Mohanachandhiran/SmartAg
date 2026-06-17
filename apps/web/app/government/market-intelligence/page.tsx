'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function GovernmentMarketIntel() {
  const { t } = useLanguage();

  // Price forecast actual vs predicted curves data (Recharts)
  const priceCurve = [
    { day: 'Day 1', actual: 22.0, predicted: 22.2 },
    { day: 'Day 3', actual: 23.5, predicted: 23.8 },
    { day: 'Day 5', actual: 24.1, predicted: 24.6 },
    { day: 'Day 7', actual: 26.0, predicted: 25.8 }
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-green-700" />
          Statewide Crop Market Intelligence
        </h1>
        <p className="text-xs text-muted-foreground">
          Track Statewide actual mandi arrivals prices compared with Gemini AI forecast models.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Forecast curve chart */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">🍅 Tomato Price Forecast curve (Rs./kg)</span>
            <TrendingUp className="w-4 h-4 text-green-800" />
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceCurve}>
                <XAxis dataKey="day" stroke="#5C5A56" tick={{ fontSize: 9 }} />
                <YAxis stroke="#5C5A56" tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ fontSize: '10px' }} />
                <Legend wrapperStyle={{ fontSize: '9px' }} />
                <Line type="monotone" dataKey="actual" name="Actual Mandi price" stroke="#1A4D2E" strokeWidth={2.5} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="predicted" name="AI Predicted price" stroke="#F5A623" strokeWidth={2} strokeDasharray="5, 5" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
