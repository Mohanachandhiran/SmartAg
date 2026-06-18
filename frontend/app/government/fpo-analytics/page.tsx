'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Trophy } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

const MapComponent = dynamic(() => import('@/components/maps/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[320px] bg-muted rounded-xl animate-pulse flex items-center justify-center text-xs">Loading State Geographic Command layers...</div>
});

export default function FpoAnalytics() {
  const { t } = useLanguage();
  const [fpos, setFpos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFpoAnalytics = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/government/fpo-analytics`);
        if (res.ok) {
          const data = await res.json();
          setFpos(data);
        }
      } catch (err) {
        setFpos([
          { id: '1', name: 'Madurai Farmers Collective', district: 'Madurai', activeFarmers: 124, revenue: 320000, cropMovement: 45 },
          { id: '2', name: 'Salem Agri Group', district: 'Salem', activeFarmers: 89, revenue: 215000, cropMovement: 32 },
          { id: '3', name: 'Coimbatore Growers Union', district: 'Coimbatore', activeFarmers: 154, revenue: 412000, cropMovement: 58 },
          { id: '4', name: 'Dindigul Crop Collective', district: 'Dindigul', activeFarmers: 67, revenue: 145000, cropMovement: 22 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchFpoAnalytics();
  }, []);

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-green-700" />
          Statewide FPO Performance Analytics
        </h1>
        <p className="text-xs text-muted-foreground">
          Track logistics volume, active farmer count, and transaction values across registered regional FPOs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map view */}
        <div className="lg:col-span-2 h-[320px]">
          <MapComponent />
        </div>

        {/* FPO KPI Leaderboard summary */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-serif font-bold text-foreground pb-2 border-b border-border flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500 animate-pulse" />
              Top FPO Performance Leader
            </h3>
            
            <div className="bg-surface border border-border p-4.5 rounded-lg text-xs mt-4">
              <span className="font-bold text-foreground block">Coimbatore Growers Union</span>
              <span className="text-[10px] text-muted-foreground">Coimbatore Region</span>
              
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/60">
                <div>
                  <span className="text-[9px] text-muted-foreground block">Revenue</span>
                  <span className="font-sans tabnum font-black text-green-800">₹4.12 Lakhs</span>
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground block">Active members</span>
                  <span className="font-bold text-foreground">154 Farmers</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert('Dispatched administrative credit reward allocation to CGU FPO')}
            className="w-full bg-green-800 text-primary-foreground py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors mt-6"
          >
            Allocate Performance Subsidy
          </button>
        </div>

      </div>

      {/* Analytics Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[9px] uppercase font-bold text-muted-foreground">
                <th className="p-3">FPO Name</th>
                <th className="p-3">District</th>
                <th className="p-3">Active Farmers</th>
                <th className="p-3">Total Sales Revenue</th>
                <th className="p-3 text-right">Crop Transacted (Tonnes)</th>
              </tr>
            </thead>
            <tbody>
              {fpos.map((fpo, idx) => (
                <tr key={fpo.id || idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-bold text-foreground">{fpo.name}</td>
                  <td className="p-3 text-muted-foreground font-semibold">{fpo.district}</td>
                  <td className="p-3 font-semibold text-foreground">{fpo.activeFarmers}</td>
                  <td className="p-3 font-sans tabnum font-black text-green-950">₹{fpo.revenue.toLocaleString()}</td>
                  <td className="p-3 text-green-600 font-bold text-right">{fpo.cropMovement} Tonnes</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
