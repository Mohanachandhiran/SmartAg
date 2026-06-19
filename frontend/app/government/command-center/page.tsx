'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Landmark, ShieldAlert, Award, TrendingUp, AlertTriangle, CloudLightning, Activity, BarChart2, ShieldCheck, PieChart, Info, Map as MapIcon, Box, ShoppingCart, Scale } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

const MapComponent = dynamic(() => import('@/components/maps/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[380px] bg-muted rounded-xl animate-pulse flex items-center justify-center text-xs">Loading State Geographic Command layers...</div>
});

export default function CommandCenter() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  // MOCK DATA GENERATED FROM MASTER DATA FLOW (Farmer + FPO + Buyer -> Government)
  
  // 1. Supply Stability Index (SSI) = Supply / Demand x 100
  const ssiData = [
    { crop: 'Tomato', supply: 125000, demand: 180000, ssi: 69, status: 'Shortage', trend: 'down' },
    { crop: 'Onion', supply: 85000, demand: 75000, ssi: 113, status: 'Surplus', trend: 'up' },
    { crop: 'Paddy', supply: 450000, demand: 460000, ssi: 98, status: 'Stable', trend: 'flat' },
    { crop: 'Maize', supply: 32000, demand: 55000, ssi: 58, status: 'Critical Shortage', trend: 'down' },
  ];

  // 2. Early Warning Alerts
  const alerts = [
    { id: 1, type: 'Tomato Shortage', district: 'Dindigul', severity: 'Critical', message: 'Supply dropping below 70% of demand due to recent heatwave impacting harvest.', time: '2 hours ago' },
    { id: 2, type: 'Onion Price Surge', district: 'Salem', severity: 'High', message: 'Mandi prices up 22% in 48 hours. FPO groups withholding stock.', time: '4 hours ago' },
    { id: 3, type: 'Flood Impact', district: 'Madurai', severity: 'High', message: 'Heavy rainfall affecting 15 active farmer groups. Logistics rerouting advised.', time: 'Yesterday' },
  ];

  // 3. FPO Analytics Overview
  const fpoAnalytics = {
    topFpo: 'Madurai Farmers Collective',
    totalRevenue: '₹4.2 Crores',
    coverage: '12 Districts',
    farmerParticipation: 8450,
  };

  // 4. Policy Insights & Interventions
  const interventions = [
    { id: 1, action: 'Price Support', target: 'Onions', reason: 'Prevent hoarding. SSI > 110 indicating surplus masking as shortage via FPO storage.', aiConfidence: 91 },
    { id: 2, action: 'Emergency Procurement', target: 'Tomatoes', reason: 'SSI critical (69%). Initiate NAFED emergency procurement in Krishnagiri hub.', aiConfidence: 96 },
    { id: 3, action: 'Transport Support', target: 'Madurai Region', reason: 'Flood alerts triggered. Provide subsidized logistics to clear harvested Paddy.', aiConfidence: 84 },
  ];

  useEffect(() => {
    // Simulate loading data aggregation from master flow
    setTimeout(() => {
      setLoading(false);
    }, 600);
  }, []);

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <h1 className="text-3xl font-serif font-black text-slate-900 flex items-center gap-3">
          <Landmark className="w-8 h-8 text-blue-800" />
          Government Command Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor food security, supply stability, price trends, and critical risk alerts across Tamil Nadu.
        </p>
      </div>

      {/* Critical Early Warning Ticker */}
      <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-3 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 animate-pulse" />
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 animate-bounce" />
        <div className="flex-1 whitespace-nowrap overflow-hidden">
          <div className="animate-[marquee_20s_linear_infinite] flex gap-12 text-xs font-bold text-red-900">
            {alerts.map(a => (
              <span key={a.id}>🚨 {a.type} ({a.district}): {a.message}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Map & Analytics (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Map Component */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-blue-800" />
                Tamil Nadu Crop Movement & Risk Map
              </h3>
              <div className="flex gap-2">
                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">High Risk Regions</span>
                <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">Stable Regions</span>
              </div>
            </div>
            <div className="h-[380px] w-full rounded-lg overflow-hidden border border-border">
              <MapComponent />
            </div>
          </div>

          {/* Supply Stability Index (SSI) */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-800" />
                Supply Stability Index (SSI)
              </h3>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                <Info className="w-3 h-3" /> Formula: (Supply / Demand) × 100
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {ssiData.map((data, idx) => (
                <div key={idx} className={`border rounded-lg p-3 flex flex-col gap-2 ${
                  data.ssi < 75 ? 'bg-red-50/50 border-red-200' : 
                  data.ssi > 110 ? 'bg-amber-50/50 border-amber-200' : 'bg-green-50/50 border-green-200'
                }`}>
                  <span className="font-bold text-foreground text-sm flex justify-between items-center">
                    {data.crop}
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
                      data.ssi < 75 ? 'bg-red-100 text-red-700' : 
                      data.ssi > 110 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>{data.status}</span>
                  </span>
                  
                  <div className="flex items-end justify-between mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">SSI Score</span>
                      <span className={`text-2xl font-black font-sans tabnum ${
                        data.ssi < 75 ? 'text-red-600' : data.ssi > 110 ? 'text-amber-600' : 'text-green-600'
                      }`}>{data.ssi}%</span>
                    </div>
                    <div className="flex flex-col text-right text-[9px] text-muted-foreground font-mono">
                      <span>S: {(data.supply/1000).toFixed(1)}k T</span>
                      <span>D: {(data.demand/1000).toFixed(1)}k T</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FPO Analytics & Market Intelligence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
                <BarChart2 className="w-4 h-4 text-blue-800" />
                FPO Aggregation Analytics
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center mt-2">
                <div className="bg-surface p-3 rounded border border-border">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Total Coverage</span>
                  <span className="text-lg font-black text-foreground">{fpoAnalytics.coverage}</span>
                </div>
                <div className="bg-surface p-3 rounded border border-border">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Farmer Participation</span>
                  <span className="text-lg font-black text-green-700">{fpoAnalytics.farmerParticipation.toLocaleString()}</span>
                </div>
                <div className="bg-surface p-3 rounded border border-border col-span-2">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Top Performing FPO</span>
                  <span className="text-sm font-black text-blue-800">{fpoAnalytics.topFpo}</span>
                  <span className="text-xs text-muted-foreground block mt-0.5">Generated {fpoAnalytics.totalRevenue}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
                <Activity className="w-4 h-4 text-blue-800" />
                Market Intelligence
              </h3>
              <div className="flex flex-col gap-3 mt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground">Overall Price Trend</span>
                  <span className="text-red-600 font-bold flex items-center gap-1">+4.2% <TrendingUp className="w-3 h-3" /></span>
                </div>
                <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 w-[65%] h-full" />
                </div>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="font-bold text-muted-foreground">Statewide Demand Index</span>
                  <span className="text-amber-600 font-bold flex items-center gap-1">Elevated</span>
                </div>
                <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 w-[82%] h-full" />
                </div>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="font-bold text-muted-foreground">Crop Movement Velocity</span>
                  <span className="text-green-600 font-bold flex items-center gap-1">Optimal</span>
                </div>
                <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 w-[45%] h-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Early Warnings & Interventions (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Early Warning Alerts List */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-serif font-bold text-red-700 flex items-center gap-2 pb-2 border-b border-border">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Early Warning Alerts
            </h3>
            <div className="flex flex-col gap-3">
              {alerts.map(alert => (
                <div key={alert.id} className="bg-surface border-l-2 border-red-500 p-3 rounded shadow-sm text-xs flex flex-col gap-1.5">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-foreground">{alert.type}</span>
                    <span className="text-[9px] text-muted-foreground font-mono">{alert.time}</span>
                  </div>
                  <span className="text-[10px] font-bold text-red-700 bg-red-50 w-fit px-1.5 rounded">{alert.district} District</span>
                  <p className="text-muted-foreground mt-1 leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Insights & AI Interventions */}
          <div className="bg-blue-900 border border-blue-800 p-5 rounded-xl shadow-sm flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Award className="w-32 h-32 text-blue-100" />
            </div>
            <h3 className="text-sm font-serif font-black text-white flex items-center gap-2 pb-2 border-b border-blue-800 relative z-10">
              <CloudLightning className="w-4 h-4 text-amber-400" />
              AI Policy Insights & Intervention
            </h3>
            
            <div className="flex flex-col gap-4 relative z-10">
              {interventions.map(action => (
                <div key={action.id} className="bg-white/10 border border-white/20 p-3 rounded-lg flex flex-col gap-2 backdrop-blur-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">{action.action}</span>
                    <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded font-bold font-mono">
                      {action.aiConfidence}% Match
                    </span>
                  </div>
                  <span className="text-xs text-blue-100 font-bold">Target: {action.target}</span>
                  <p className="text-[10px] text-blue-200 leading-relaxed">
                    <span className="font-bold text-white">Reason:</span> {action.reason}
                  </p>
                  <button className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-1.5 rounded transition-colors shadow">
                    Approve Intervention Action
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
