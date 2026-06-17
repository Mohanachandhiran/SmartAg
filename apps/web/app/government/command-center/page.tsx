'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Landmark, Scale, ShieldAlert, Award, TrendingUp, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

const MapComponent = dynamic(() => import('@/components/maps/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[340px] bg-muted rounded-xl animate-pulse flex items-center justify-center text-xs">Loading State Geographic Command layers...</div>
});

export default function CommandCenter() {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommandCenter = async () => {
      let weatherAlerts: any[] = [];
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/government/command-center`);
        let govData = null;
        if (res.ok) {
          govData = await res.json();
        }
        
        // Fetch real weather risk for Central Hub (Madurai)
        try {
          const wRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/weather?lat=9.9252&lng=78.1198`);
          if (wRes.ok) {
            const wJson = await wRes.json();
            if (wJson.riskScore === 'High') {
              weatherAlerts.push({
                id: 'w-1', district: 'Madurai Region', alertType: 'Severe Weather Warning',
                message: `Critical weather risk. Rainfall: ${wJson.rainfall}mm, Temp: ${wJson.temperature}°C. Extreme supply chain disruption likely.`,
                severity: 'High'
              });
            } else if (wJson.riskScore === 'Medium') {
              weatherAlerts.push({
                id: 'w-1', district: 'Madurai Region', alertType: 'Moderate Weather Risk',
                message: `Elevated weather risk. Rainfall: ${wJson.rainfall}mm. Advise farmers against immediate harvest.`,
                severity: 'Medium'
              });
            }
          }
        } catch (e) {}

        if (govData) {
          govData.liveAlerts = [...weatherAlerts, ...(govData.liveAlerts || [])];
          setData(govData);
        }
      } catch (err) {
        console.warn('Command Center fetching failed. Using mocks.');
        setData({
          kpis: {
            districtsMonitored: 38,
            activeFPOs: 5,
            totalFarmers: 145,
            cropMovementTonnes: 154
          },
          districtsData: [
            { district: 'Madurai', supplyVolume: 12400, priceStability: 88, riskLevel: 'Low', crop: 'Tomato' },
            { district: 'Salem', supplyVolume: 8900, priceStability: 75, riskLevel: 'Medium', crop: 'Onion' },
            { district: 'Coimbatore', supplyVolume: 15100, priceStability: 91, riskLevel: 'Low', crop: 'Banana' },
            { district: 'Dindigul', supplyVolume: 6700, priceStability: 62, riskLevel: 'High', crop: 'Chilli' }
          ],
          liveAlerts: [
            ...weatherAlerts,
            { id: '2', district: 'Dindigul', alertType: 'Price Crash Warning', message: 'Tomato oversupply forecasted.', severity: 'High' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCommandCenter();
  }, []);

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      
      {/* Header alert ticker */}
      {data?.liveAlerts?.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/40 p-3 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 animate-bounce" />
          <div className="overflow-hidden whitespace-nowrap w-full">
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block">Live Early Warning alert:</span>
            <p className="text-xs font-semibold text-foreground truncate">
              {data.liveAlerts[0].district}: {data.liveAlerts[0].message}
            </p>
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Districts Monitored */}
        <div className="bg-card border border-border p-4.5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Districts Monitored</span>
          <h3 className="text-2xl font-serif font-black text-green-800 mt-1">{data?.kpis?.districtsMonitored || 38}</h3>
        </div>

        {/* Active FPOs */}
        <div className="bg-card border border-border p-4.5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Active FPOs</span>
          <h3 className="text-2xl font-serif font-black text-green-800 mt-1">{data?.kpis?.activeFPOs || 0} FPOs</h3>
        </div>

        {/* Total Farmers */}
        <div className="bg-card border border-border p-4.5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Active Farmers</span>
          <h3 className="text-2xl font-serif font-black text-green-800 mt-1">{data?.kpis?.totalFarmers || 0} Farmers</h3>
        </div>

        {/* Crop Movement Volume */}
        <div className="bg-card border border-border p-4.5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Crop Movement</span>
          <h3 className="text-2xl font-serif font-black text-green-800 mt-1">{data?.kpis?.cropMovementTonnes || 0} Tonnes</h3>
        </div>

      </div>

      {/* Grid: Map and District Choropleth table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map component */}
        <div className="lg:col-span-2 h-[340px]">
          <MapComponent />
        </div>

        {/* District list summary */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-serif font-bold text-foreground pb-2 border-b border-border">
            District Crop Security indices
          </h3>
          <div className="flex flex-col gap-3 mt-4 overflow-y-auto max-h-60">
            {data?.districtsData?.map((d: any, idx: number) => {
              const highRisk = d.riskLevel === 'High';
              return (
                <div key={idx} className="flex justify-between items-center bg-surface p-3 rounded-lg text-xs">
                  <div>
                    <span className="font-bold text-foreground block">{d.district}</span>
                    <span className="text-[9px] text-muted-foreground font-semibold">Primary crop: {d.crop}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${highRisk ? 'bg-red-500/10 text-red-500' : 'bg-green-800/10 text-green-800'}`}>
                      {d.riskLevel} Risk
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-1">Stability: {d.priceStability}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
