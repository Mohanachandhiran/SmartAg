'use client';

import React, { useState, useEffect } from 'react';
import { Scale, ArrowUp, ArrowDown, MoveRight } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function SupplyIndex() {
  const { t } = useLanguage();
  const [indices, setIndices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://smartag-api-1siv.onrender.com/api'}/government/supply-index`);
        if (res.ok) {
          const data = await res.json();
          setIndices(data);
        }
      } catch (err) {
        setIndices([
          { district: 'Madurai', score: 85, trend: 'up', tomato: 90, coconut: 80 },
          { district: 'Salem', score: 72, trend: 'down', onion: 60, turmeric: 84 },
          { district: 'Coimbatore', score: 92, trend: 'stable', banana: 95, rice: 89 },
          { district: 'Dindigul', score: 68, trend: 'down', chilli: 55, tomato: 81 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchIndices();
  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <Scale className="w-6 h-6 text-green-700" />
          Supply Stability Index
        </h1>
        <p className="text-xs text-muted-foreground">
          Monitor supply volumes security metrics computed from local crop registration forecasts and mandi arrivals.
        </p>
      </div>

      {/* Index Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[9px] uppercase font-bold text-muted-foreground">
                <th className="p-3">District</th>
                <th className="p-3">Security Score (0-100)</th>
                <th className="p-3">Trend</th>
                <th className="p-3">Key Crop Stability</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {indices.map((idx, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-bold text-foreground">{idx.district}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-black text-green-900">{idx.score}</span>
                      <div className="w-24 bg-muted h-2 rounded-full overflow-hidden">
                        <div className="bg-green-800 h-full" style={{ width: `${idx.score}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    {idx.trend === 'up' ? (
                      <span className="text-green-600 font-bold flex items-center gap-0.5">
                        <ArrowUp className="w-3.5 h-3.5" /> Upward
                      </span>
                    ) : idx.trend === 'down' ? (
                      <span className="text-red-500 font-bold flex items-center gap-0.5">
                        <ArrowDown className="w-3.5 h-3.5" /> Shortage risk
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-bold flex items-center gap-0.5">
                        <MoveRight className="w-3.5 h-3.5" /> Stable
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    Tomato: {idx.tomato || 80}%, Onion: {idx.onion || 70}%
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => alert(`Drilling down detailed crop data sheets for ${idx.district}`)}
                      className="bg-green-800 text-primary-foreground hover:bg-green-700 px-3 py-1.5 rounded text-[10px] font-bold transition-colors ml-auto"
                    >
                      Detail breakdown
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
