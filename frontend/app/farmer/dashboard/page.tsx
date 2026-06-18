'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sprout, IndianRupee, CloudSunRain, AlertTriangle, ArrowUpRight, Plus, Eye, TrendingUp, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLanguage } from '@/components/shared/LanguageContext';
import CropImage from '@/components/shared/CropImage';

export default function FarmerDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [crops, setCrops] = useState<any[]>([]);

  // Simulated animated crop stage selector
  const [activeStage, setActiveStage] = useState(1); // 0: Planted, 1: Growing, 2: Ready, 3: Harvested
  const stages = ['Planted', 'Growing', 'Ready for Harvest', 'Harvested'];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('smartag_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/farmer/dashboard`, {
          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
        
        // Fetch real weather using Madurai default coords
        const wRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/weather?lat=9.9252&lng=78.1198`);
        if (wRes.ok) {
          const wJson = await wRes.json();
          setWeatherData(wJson);
        }

        // Fetch crop registrations
        const cRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/farmer/crops`, {
          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        });
        if (cRes.ok) {
          setCrops(await cRes.json());
        }
      } catch (err) {
        console.warn('Dashboard fetch error, using local mock data.');
        setData({
          farmerName: 'Anbu Selvan',
          expectedIncome: 48500,
          activeRequests: 2,
          weatherAlert: {
            alertType: 'Heavy Rain Warning',
            message: 'Heavy rain expected in Salem/Madurai region. Delay pesticide sprays.',
            severity: 'High'
          },
          marketAlert: {
            title: 'Mandi Price Spike',
            message: '🍅 Tomato prices skyrocketed by 15% in Coimbatore Mandi today.'
          },
          recentTransactions: [
            { id: 'tx-1', amount: 15400, status: 'COMPLETED', createdAt: '2026-06-12T10:00:00Z' },
            { id: 'tx-2', amount: 32000, status: 'PENDING', createdAt: '2026-06-15T14:30:00Z' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground font-sans">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Banner message */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-green-800 text-primary-foreground p-6 rounded-xl shadow-agri relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-700 rounded-full blur-2xl opacity-50" />
        <div className="z-10">
          <h2 className="text-2xl font-serif font-black text-white tracking-tight mb-1">
            {t('farmer.dashboard.greeting')} {data?.farmerName || 'Farmer'}!
          </h2>
          <p className="text-xs text-green-200">
            Welcome to SmartAg. Your crop profiles are optimized and synced.
          </p>
        </div>
        <button 
          onClick={() => router.push('/farmer/crop-registration')}
          className="z-10 bg-amber-400 text-green-950 px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-500 transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>{t('farmer.dashboard.registerCrop')}</span>
        </button>
      </div>

      {/* AI recommendation bar */}
      <div className="bg-amber-400/10 border border-amber-400/40 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-green-950 font-bold shrink-0">
            💡
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block font-sans">AI recommendation Today</span>
            <p className="text-xs font-bold text-foreground">
              Best action today: Join FPO collective group for 🍅 Tomatoes — 23% higher expected net income.
            </p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/farmer/ai-advisor')}
          className="bg-amber-400 hover:bg-amber-500 text-green-900 text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
        >
          View Advice
        </button>
      </div>

      {/* Main Grid: Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: KPI cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Expected Income */}
          <div className="bg-card p-5 rounded-xl border border-border flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-muted-foreground font-semibold">{t('farmer.dashboard.expectedIncome')}</span>
                <h3 className="text-2xl font-serif font-black text-green-800 mt-2">
                  ₹{(data?.expectedIncome || 0).toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="p-2.5 bg-green-800/10 text-green-800 rounded-lg">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-green-600 font-semibold mt-4 block">
              +15% compared to local Mandi average price
            </span>
          </div>

          {/* Active Requests */}
          <div className="bg-card p-5 rounded-xl border border-border flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-muted-foreground font-semibold">{t('farmer.dashboard.activeRequests')}</span>
                <h3 className="text-2xl font-serif font-black text-green-800 mt-2">
                  {data?.activeRequests || 0} Crops
                </h3>
              </div>
              <div className="p-2.5 bg-green-800/10 text-green-800 rounded-lg">
                <Sprout className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold mt-4 block">
              Registered in current agricultural season
            </span>
          </div>

          {/* Weather Alert */}
          <div className="bg-card p-5 rounded-xl border border-border flex flex-col justify-between shadow-sm col-span-1 sm:col-span-2">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-lg shrink-0">
                <CloudSunRain className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-semibold">Local Weather Forecast (Madurai)</span>
                {weatherData ? (
                  <div className="mt-1">
                    <span className={`text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-sans uppercase ${weatherData.riskScore === 'High' ? 'bg-red-500' : weatherData.riskScore === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`}>
                      {weatherData.riskScore} Risk
                    </span>
                    <p className="text-xs text-foreground font-bold mt-2">
                      {weatherData.temperature}°C, {weatherData.humidity}% Humidity
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      Rainfall expectation: {weatherData.rainfall}mm. Wind speed: {weatherData.windSpeed} km/h.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">Loading local telemetry...</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Crop Health Ring (Pulse element) */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col items-center justify-between text-center relative overflow-hidden">
          
          <div className="w-full text-left">
            <h3 className="text-sm font-serif font-bold text-foreground">Crop Health Ring</h3>
            <p className="text-[11px] text-muted-foreground">Live cultivation stage progress tracker</p>
          </div>

          {/* Animated SVG Donut */}
          <div className="relative w-44 h-44 my-4 flex items-center justify-center">
            
            {/* Pulsing ring indicator if action needed */}
            <div className="absolute w-36 h-36 rounded-full border-4 border-amber-400 animate-ping opacity-25" />
            
            <svg className="w-full h-full transform -rotate-90">
              {/* Gray base circle */}
              <circle 
                cx="88" 
                cy="88" 
                r="64" 
                stroke="#EADBC8" 
                strokeWidth="10" 
                fill="transparent" 
              />
              {/* Highlight active stage circle */}
              <motion.circle 
                cx="88" 
                cy="88" 
                r="64" 
                stroke="#1A4D2E" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray="402"
                strokeDashoffset={402 - (402 * ((activeStage + 1) * 25)) / 100}
                strokeLinecap="round"
                transition={{ duration: 1 }}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center">
              <CropImage cropName="Tomato" size={32} />
              <span className="text-[11px] font-bold text-green-950 font-serif">🍅 Tomato</span>
              <span className="text-[9px] bg-amber-400 text-green-950 px-1.5 py-0.5 rounded-full font-bold mt-1 uppercase tracking-wider">
                {stages[activeStage]}
              </span>
            </div>
          </div>

          {/* Stage controls toggles */}
          <div className="flex gap-1 bg-muted p-1 rounded-lg w-full justify-between">
            {stages.map((s, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveStage(idx)}
                className={`text-[9px] font-bold px-2 py-1 rounded transition-all ${activeStage === idx ? 'bg-green-800 text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Stage {idx+1}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Crop Registrations Table */}
      <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <h3 className="text-sm font-serif font-bold text-foreground">Your Crop Registrations</h3>
          <span className="text-[10px] text-green-800 font-bold cursor-pointer hover:underline" onClick={() => router.push('/farmer/crop-registration')}>
            + New
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {crops.length > 0 ? crops.map((crop: any, idx: number) => (
            <div key={crop.id || idx} className="flex justify-between items-center bg-surface p-3 rounded-lg text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <CropImage cropName={crop.cropType} size={14} /> {crop.cropType}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Grade {crop.qualityGrade} • Harvest: {new Date(crop.harvestDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-serif font-black text-green-800">
                  {crop.quantity} kg
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${crop.status === 'WAITING_FOR_FPO' ? 'bg-amber-400/15 text-amber-500' : 'bg-green-800/10 text-green-800'}`}>
                  {crop.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          )) : (
            <div className="text-xs text-muted-foreground text-center py-4">No crop registrations found. Register your first harvest!</div>
          )}
        </div>
      </div>

      {/* Lower Section: Transactions & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Transactions Feed */}
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
            <h3 className="text-sm font-serif font-bold text-foreground">Recent Payments & Sales</h3>
            <span className="text-[10px] text-green-800 font-bold flex items-center gap-0.5 cursor-pointer hover:underline" onClick={() => router.push('/farmer/payments')}>
              All <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {data?.recentTransactions?.map((tx: any, idx: number) => (
              <div key={tx.id || idx} className="flex justify-between items-center bg-surface p-3 rounded-lg text-xs">
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">🍅 Tomato Collective Lot</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${tx.status === 'COMPLETED' ? 'bg-green-800/10 text-green-800' : 'bg-amber-400/15 text-amber-500'}`}>
                    {tx.status}
                  </span>
                  <span className="font-serif font-black text-green-800">
                    ₹{tx.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-serif font-bold text-foreground">Quick Action Shortcuts</h3>
          <div className="grid grid-cols-2 gap-3 h-full">
            <button 
              onClick={() => router.push('/farmer/crop-registration')}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:border-green-800 hover:bg-green-800/5 transition-colors gap-2 text-center"
            >
              <Sprout className="w-6 h-6 text-green-800" />
              <span className="text-xs font-bold text-foreground">Register Harvest</span>
            </button>
            <button 
              onClick={() => router.push('/farmer/market-intelligence')}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:border-green-800 hover:bg-green-800/5 transition-colors gap-2 text-center"
            >
              <TrendingUp className="w-6 h-6 text-green-800" />
              <span className="text-xs font-bold text-foreground">Mandi Prices</span>
            </button>
            <button 
              onClick={() => router.push('/farmer/collective-selling')}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:border-green-800 hover:bg-green-800/5 transition-colors gap-2 text-center"
            >
              <Sprout className="w-6 h-6 text-amber-500" />
              <span className="text-xs font-bold text-foreground">Join FPO Group</span>
            </button>
            <button 
              onClick={() => router.push('/farmer/voice-assistant')}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:border-green-800 hover:bg-green-800/5 transition-colors gap-2 text-center"
            >
              <CloudSunRain className="w-6 h-6 text-green-800" />
              <span className="text-xs font-bold text-foreground">Voice Assistant</span>
            </button>
          </div>
        </div>

      </div>

      {/* AI Profit Simulator Banner */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 p-6 rounded-xl border border-green-700 shadow-agri mb-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-400 rounded-full blur-3xl opacity-20" />
        <div className="z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 border border-amber-400/30">
            <Calculator className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-black text-white flex items-center gap-2">
              AI Profit Simulator <span className="text-[10px] bg-amber-400 text-green-950 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">New</span>
            </h3>
            <p className="text-xs text-green-200 mt-1 max-w-md leading-relaxed">
              Calculate your highest profit path. Compare current Mandi prices, 5-day forecasts, and FPO collective selling returns.
            </p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/farmer/profit-simulator')}
          className="z-10 bg-amber-400 hover:bg-amber-500 text-green-950 font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl text-sm whitespace-nowrap flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          Run Simulation
        </button>
      </div>

      {/* 7-Day Price Forecast Graph */}
      <div className="bg-card p-5 rounded-xl border border-border shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-800" /> 
            7-Day Expected Mandi Price Forecast
          </h3>
          <span className="text-[10px] text-muted-foreground font-bold">
            {crops.length > 0 ? crops[0].cropType : 'Tomato'}
          </span>
        </div>
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={[
                { day: 'Today', price: crops.length > 0 && crops[0].cropType === 'Onion' ? 28 : 22 },
                { day: 'Day 2', price: crops.length > 0 && crops[0].cropType === 'Onion' ? 29.5 : 23.1 },
                { day: 'Day 3', price: crops.length > 0 && crops[0].cropType === 'Onion' ? 28.2 : 24.5 },
                { day: 'Day 4', price: crops.length > 0 && crops[0].cropType === 'Onion' ? 30.1 : 23.8 },
                { day: 'Day 5', price: crops.length > 0 && crops[0].cropType === 'Onion' ? 31.5 : 25.2 },
                { day: 'Day 6', price: crops.length > 0 && crops[0].cropType === 'Onion' ? 32.0 : 25.8 },
                { day: 'Day 7', price: crops.length > 0 && crops[0].cropType === 'Onion' ? 34.5 : 27.0 }
              ]} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
              <XAxis 
                dataKey="day" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} 
                dy={10}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} 
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  borderColor: 'var(--border)',
                  color: 'var(--card-foreground)',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                name="Price (₹/kg)"
                stroke="#1A4D2E" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2, fill: 'var(--card)' }}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
