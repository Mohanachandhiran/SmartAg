'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Merge, Globe, CreditCard, ArrowRight, Hourglass } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function FpoDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logisticsWeather, setLogisticsWeather] = useState<any>(null);

  // Weekly Revenue mock data
  const chartData = [
    { week: 'Wk 1', revenue: 75000 },
    { week: 'Wk 2', revenue: 124000 },
    { week: 'Wk 3', revenue: 98000 },
    { week: 'Wk 4', revenue: 151000 }
  ];

  useEffect(() => {
    const fetchFpoDashboard = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/fpo/dashboard`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }

        // Fetch logistics weather
        try {
          const wRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/weather?lat=9.9252&lng=78.1198`);
          if (wRes.ok) {
            setLogisticsWeather(await wRes.json());
          }
        } catch (e) {}
      } catch (err) {
        console.warn('FPO Dashboard fetch failed. Using mock datasets.');
        setData({
          stats: {
            totalFarmers: 145,
            activeGroups: 3,
            expectedRevenue: 275000,
            pendingBids: 4,
            completedTx: 12
          },
          activityFeed: {
            requests: [
              { id: '1', farmerName: 'Anbu Selvan', crop: 'Tomato', quantity: 1500, grade: 'A' },
              { id: '2', farmerName: 'Ravi Chandran', crop: 'Onion', quantity: 2000, grade: 'B' }
            ],
            bids: [
              { id: 'bid-1', pricePerKg: 30, quantity: 6200, buyer: { name: 'Rel-Agro Foods' }, listing: { cropType: 'Tomato' } },
              { id: 'bid-2', pricePerKg: 35, quantity: 9100, buyer: { name: 'Heritage Fresh' }, listing: { cropType: 'Onion' } }
            ]
          }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchFpoDashboard();
  }, []);

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-green-800 text-primary-foreground p-6 rounded-xl shadow-agri relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-700 rounded-full blur-2xl opacity-50" />
        <div className="z-10">
          <h2 className="text-xl font-serif font-black mb-1">
            FPO Collective Coordinator Panel
          </h2>
          <p className="text-xs text-green-200">
            Pool harvests geographically, optimize routes, and orchestrate trade directly with wholesale merchants.
          </p>
        </div>
      </div>

      {/* Logistics Weather Warning */}
      {logisticsWeather && (
        <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm ${logisticsWeather.riskScore === 'High' ? 'bg-red-50 border border-red-200' : logisticsWeather.riskScore === 'Medium' ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="shrink-0">
            {logisticsWeather.riskScore === 'High' ? <Hourglass className="w-6 h-6 text-red-500" /> : <Hourglass className="w-6 h-6 text-green-600" />}
          </div>
          <div>
            <h4 className={`text-xs font-bold ${logisticsWeather.riskScore === 'High' ? 'text-red-700' : 'text-green-800'}`}>
              Logistics & Routing Weather Risk: {logisticsWeather.riskScore}
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Forecasted Rainfall: {logisticsWeather.rainfall}mm, Temp: {logisticsWeather.temperature}°C. 
              {logisticsWeather.riskScore === 'High' ? ' Delay dispatch or deploy covered trucks to avoid spoilage in transit.' : ' Clear routes. Dispatch safe.'}
            </p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Total Farmers */}
        <div className="bg-card border border-border p-4.5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Total Farmers</span>
          <h3 className="text-xl font-serif font-black text-green-800 mt-2">{data?.stats?.totalFarmers || 0}</h3>
        </div>

        {/* Active Groups */}
        <div className="bg-card border border-border p-4.5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Active Groups</span>
          <h3 className="text-xl font-serif font-black text-green-800 mt-2">{data?.stats?.activeGroups || 0}</h3>
        </div>

        {/* Expected Revenue */}
        <div className="bg-card border border-border p-4.5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Expected Revenue</span>
          <h3 className="text-xl font-serif font-black text-green-800 mt-2">
            ₹{(data?.stats?.expectedRevenue || 0).toLocaleString()}
          </h3>
        </div>

        {/* Pending Bids */}
        <div className="bg-card border border-border p-4.5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Pending Bids</span>
          <h3 className="text-xl font-serif font-black text-green-800 mt-2">{data?.stats?.pendingBids || 0}</h3>
        </div>

        {/* Completed Transactions */}
        <div className="bg-card border border-border p-4.5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Completed Tx</span>
          <h3 className="text-xl font-serif font-black text-green-800 mt-2">{data?.stats?.completedTx || 0}</h3>
        </div>

      </div>

      {/* Grid: Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Revenue trend */}
        <div className="lg:col-span-2 bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground">Weekly Revenue Trend (Rs.)</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Pooled crop lots sales volume</p>
          </div>
          <div className="h-44 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="#5C5A56" />
                <YAxis tick={{ fontSize: 9 }} stroke="#5C5A56" />
                <Tooltip contentStyle={{ fontSize: '10px' }} />
                <Bar dataKey="revenue" fill="#1A4D2E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions panel */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-serif font-bold text-foreground pb-2 border-b border-border">Quick actions</h3>
          <div className="flex flex-col gap-2.5">
            <button 
              onClick={() => router.push('/fpo/ai-grouping')}
              className="w-full bg-green-800 text-primary-foreground py-2.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Merge className="w-4 h-4" />
              <span>Run AI Grouping Engine</span>
            </button>
            <button 
              onClick={() => router.push('/fpo/marketplace')}
              className="w-full bg-muted hover:bg-muted/80 text-foreground py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Globe className="w-4 h-4 text-green-800" />
              <span>Publish Crop Lot</span>
            </button>
          </div>
        </div>

      </div>

      {/* Activity Feed Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Incoming Farmer Harvest Requests */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-border mb-4">
            <h3 className="text-sm font-serif font-bold text-foreground">Incoming Harvest Registrations</h3>
            <span className="text-[10px] text-green-800 font-bold flex items-center gap-0.5 cursor-pointer hover:underline" onClick={() => router.push('/fpo/farmer-requests')}>
              View all <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {data?.activityFeed?.requests?.map((req: any, idx: number) => (
              <div key={req.id || idx} className="flex justify-between items-center bg-surface p-3 rounded-lg text-xs">
                <div>
                  <span className="font-bold text-foreground block">{req.farmerName}</span>
                  <span className="text-[9px] text-muted-foreground uppercase">{req.crop} • Grade {req.grade}</span>
                </div>
                <div className="text-right">
                  <span className="font-serif font-black text-green-800 block">{req.quantity} kg</span>
                  <span className="text-[9px] bg-amber-400/20 text-amber-600 px-1 py-0.5 rounded font-bold uppercase">
                    Awaiting grouping
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Bids */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-border mb-4">
            <h3 className="text-sm font-serif font-bold text-foreground">Active Buyer Bids</h3>
            <span className="text-[10px] text-green-800 font-bold flex items-center gap-0.5 cursor-pointer hover:underline" onClick={() => router.push('/fpo/marketplace')}>
              View marketplace <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {data?.activityFeed?.bids?.map((bid: any, idx: number) => (
              <div key={bid.id || idx} className="flex justify-between items-center bg-surface p-3 rounded-lg text-xs">
                <div>
                  <span className="font-bold text-foreground block">{bid.buyer?.name || 'Buyer'}</span>
                  <span className="text-[9px] text-muted-foreground uppercase">Lot: {bid.quantity} kg • {bid.listing?.cropType}</span>
                </div>
                <div className="text-right">
                  <span className="font-sans tabnum font-black text-green-800 block">₹{bid.pricePerKg}/kg</span>
                  <span className="text-[9px] text-muted-foreground">Total: ₹{(bid.pricePerKg * bid.quantity).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
