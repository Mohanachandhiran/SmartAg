'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, IndianRupee, Download, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function Payments() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all');

  // Recharts mock monthly revenues data
  const revenueData = [
    { month: 'Jan', revenue: 15400 },
    { month: 'Feb', revenue: 23000 },
    { month: 'Mar', revenue: 19500 },
    { month: 'Apr', revenue: 32000 },
    { month: 'May', revenue: 41200 },
    { month: 'Jun', revenue: 48500 }
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://smartag-api-1siv.onrender.com/api'}/farmer/payments`);
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (err) {
        console.warn('Transactions loading failed. Loading seeded records.');
        setTransactions([
          { id: 'tx-1', cropType: 'Tomato', buyer: 'Heritage Fresh Procurement', amount: 32000, status: 'COMPLETED', date: '2026-06-12' },
          { id: 'tx-2', cropType: 'Onion', buyer: 'Madurai Veg Wholesalers', amount: 16500, status: 'PENDING', date: '2026-06-15' },
          { id: 'tx-3', cropType: 'Banana', buyer: 'Rel-Agro Foods Ltd', amount: 48200, status: 'COMPLETED', date: '2026-05-28' },
          { id: 'tx-4', cropType: 'Rice', buyer: 'ITC Agri Business', amount: 75000, status: 'COMPLETED', date: '2026-05-10' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'completed') return tx.status.toLowerCase() === 'completed';
    if (activeTab === 'pending') return tx.status.toLowerCase() === 'pending';
    return true;
  });

  const totalEarnings = transactions
    .filter(tx => tx.status.toLowerCase() === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-green-700" />
          Payments & Earnings
        </h1>
        <p className="text-xs text-muted-foreground">
          Track transaction statuses, invoice receipts, and review monthly aggregated farm crop revenues.
        </p>
      </div>

      {/* Grid: Stats and Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Earnings Card */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-800/10 rounded-full blur-xl animate-pulse" />
          <div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
              Total Earnings (Completed)
            </span>
            <h2 className="text-3xl font-serif font-black text-green-800 mt-2">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </h2>
          </div>
          
          <div className="flex gap-2 items-center text-[10px] font-bold text-green-600 mt-6 bg-green-800/5 p-2 rounded-lg">
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>Highest earnings recorded this agricultural season</span>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="md:col-span-2 bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2 block">
            Monthly Farm Revenues (Rs.)
          </span>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="#5C5A56" />
                <YAxis width={30} tick={{ fontSize: 9 }} stroke="#5C5A56" />
                <Tooltip contentStyle={{ fontSize: '10px' }} />
                <Bar dataKey="revenue" fill="#1A4D2E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Transactions Table tab list */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mt-4">
        
        {/* Header Tab toggles */}
        <div className="p-4 bg-muted/30 border-b border-border flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex gap-4">
            {['all', 'completed', 'pending'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-xs font-bold capitalize transition-colors ${activeTab === tab ? 'text-green-800 underline underline-offset-4' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <span className="text-[10px] font-bold text-muted-foreground">Showing {filteredTransactions.length} transactions</span>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[9px] uppercase font-bold text-muted-foreground">
                <th className="p-3">Date</th>
                <th className="p-3">Crop lot</th>
                <th className="p-3">Procured By</th>
                <th className="p-3">Amount Paid</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, idx) => (
                <tr key={tx.id || idx} className="border-b border-border text-xs hover:bg-muted/50 transition-colors">
                  <td className="p-3 text-muted-foreground font-semibold">
                    {new Date(tx.date || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="p-3 font-bold text-foreground">{tx.cropType}</td>
                  <td className="p-3 font-medium text-foreground">{tx.buyer || 'FPO Collection'}</td>
                  <td className="p-3 font-sans tabnum font-black text-green-950">₹{tx.amount.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${tx.status.toLowerCase() === 'completed' ? 'bg-green-800/10 text-green-800 border border-green-800/20' : 'bg-amber-400/15 text-amber-500 border border-amber-400/20'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => alert(`Downloading PDF Invoice for ${tx.id || idx}`)}
                      className="p-1 rounded hover:bg-muted text-green-800"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
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
