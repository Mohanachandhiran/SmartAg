'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie } from 'recharts';
import { BarChart3, TrendingUp, Users, Sprout } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function FpoAnalytics() {
  const { t } = useLanguage();

  // Mock revenue by month (Recharts Bar)
  const monthlyRevenue = [
    { month: 'Jan', revenue: 120000 },
    { month: 'Feb', revenue: 154000 },
    { month: 'Mar', revenue: 210000 },
    { month: 'Apr', revenue: 180000 },
    { month: 'May', revenue: 275000 },
    { month: 'Jun', revenue: 340000 }
  ];

  // Mock farmer participation trend (Recharts Line)
  const participationData = [
    { month: 'Jan', farmers: 45 },
    { month: 'Feb', farmers: 60 },
    { month: 'Mar', farmers: 85 },
    { month: 'Apr', farmers: 110 },
    { month: 'May', farmers: 135 },
    { month: 'Jun', farmers: 145 }
  ];

  // Mock crop volume distribution (Recharts Pie/Donut)
  const cropDistribution = [
    { name: 'Tomato', value: 45000, color: '#1A4D2E' },
    { name: 'Onion', value: 38000, color: '#2D7A4F' },
    { name: 'Banana', value: 25000, color: '#F5A623' },
    { name: 'Rice', value: 18000, color: '#EADBC8' }
  ];

  const topCrops = [
    { crop: 'Tomato', volume: '45,000 kg', revenue: '₹1,224,000', growth: '+22%' },
    { crop: 'Onion', volume: '38,000 kg', revenue: '₹1,064,000', growth: '+15%' },
    { crop: 'Banana', volume: '25,000 kg', revenue: '₹875,000', growth: '+8%' },
    { crop: 'Turmeric', volume: '12,000 kg', revenue: '₹1,320,000', growth: '+18%' }
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-green-700" />
          FPO Collective Analytics
        </h1>
        <p className="text-xs text-muted-foreground">
          Analyze monthly revenue progress, farmer engagement trends, and crop volume distributions.
        </p>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Monthly Revenue Chart */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Monthly Sales Revenue (Rs.)</span>
            <TrendingUp className="w-4 h-4 text-green-800" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="#5C5A56" />
                <YAxis tick={{ fontSize: 9 }} stroke="#5C5A56" />
                <Tooltip contentStyle={{ fontSize: '10px' }} />
                <Bar dataKey="revenue" fill="#1A4D2E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Farmer participation trend */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Active Farmer Participation</span>
            <Users className="w-4 h-4 text-green-800" />
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={participationData}>
                <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="#5C5A56" />
                <YAxis tick={{ fontSize: 9 }} stroke="#5C5A56" />
                <Tooltip contentStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="farmers" stroke="#2D7A4F" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Lower Row: Crop volume pie and top crops list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Donut chart for crop distribution */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between text-center items-center">
          <div className="text-left w-full mb-3">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Crop Volume Distribution</span>
          </div>
          
          <div className="h-36 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cropDistribution.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '9px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex gap-2 flex-wrap justify-center mt-2">
            {cropDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1 text-[9px] font-bold">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top crops table */}
        <div className="md:col-span-2 bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="mb-3">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Top Performing Crops</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[9px] uppercase font-bold text-muted-foreground">
                  <th className="p-2.5">Crop</th>
                  <th className="p-2.5">Volume Pooled</th>
                  <th className="p-2.5">Gross Revenue</th>
                  <th className="p-2.5 text-right">Growth Rate</th>
                </tr>
              </thead>
              <tbody>
                {topCrops.map((tc, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-2.5 font-bold text-foreground">{tc.crop}</td>
                    <td className="p-2.5 text-muted-foreground font-semibold">{tc.volume}</td>
                    <td className="p-2.5 font-serif font-black text-green-950">{tc.revenue}</td>
                    <td className="p-2.5 text-green-600 font-bold text-right">{tc.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
