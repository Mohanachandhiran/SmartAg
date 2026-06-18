'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Landmark, Award, ArrowRight, Truck } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function BuyerDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyerDashboard = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/buyer/dashboard`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.warn('Buyer dashboard data fetching failed. Using mocks.');
        setData({
          stats: {
            availableLots: 8,
            activeBids: 2,
            wonAuctions: 4,
            totalPurchased: 15400
          },
          bidsFeed: [
            { id: '1', pricePerKg: 32, quantity: 6200, status: 'ACTIVE', listing: { cropType: 'Tomato', fpo: { name: 'Madurai Farmers Collective' } } },
            { id: '2', pricePerKg: 28, quantity: 9100, status: 'REJECTED', listing: { cropType: 'Onion', fpo: { name: 'Salem Agri Group' } } }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBuyerDashboard();
  }, []);

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-green-800 text-primary-foreground p-6 rounded-xl shadow-agri relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-700 rounded-full blur-2xl opacity-50" />
        <div className="z-10">
          <h2 className="text-xl font-serif font-black mb-1">
            Merchant Procurement Dashboard
          </h2>
          <p className="text-xs text-green-200">
            Secure premium direct aggregated crop lots from FPOs across Tamil Nadu.
          </p>
        </div>
        <button 
          onClick={() => router.push('/buyer/marketplace')}
          className="z-10 bg-amber-400 text-green-950 px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-500 transition-colors flex items-center gap-1.5"
        >
          <span>Procure Crops</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Available Lots */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Available Lots</span>
          <h3 className="text-2xl font-serif font-black text-green-800 mt-2">{data?.stats?.availableLots || 0} Lots</h3>
        </div>

        {/* Active Bids */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Active Bids</span>
          <h3 className="text-2xl font-serif font-black text-green-800 mt-2">{data?.stats?.activeBids || 0} Bids</h3>
        </div>

        {/* Won Auctions */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Won Lots</span>
          <h3 className="text-2xl font-serif font-black text-green-800 mt-2">{data?.stats?.wonAuctions || 0} Lots</h3>
        </div>

        {/* Total Purchased */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Total Procured</span>
          <h3 className="text-2xl font-serif font-black text-green-800 mt-2">
            {(data?.stats?.totalPurchased || 0).toLocaleString()} kg
          </h3>
        </div>

      </div>

      {/* Lower layout: Bids list and pickup route */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bids listing feed */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-border mb-4">
            <h3 className="text-sm font-serif font-bold text-foreground">My Bid Submissions</h3>
            <span 
              onClick={() => router.push('/buyer/bid')}
              className="text-[10px] text-green-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              All Bids <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {data?.bidsFeed?.map((b: any, idx: number) => (
              <div key={b.id || idx} className="flex justify-between items-center bg-surface p-3.5 rounded-lg text-xs">
                <div>
                  <span className="font-bold text-foreground block">{b.listing?.cropType} Lot</span>
                  <span className="text-[9px] text-muted-foreground">FPO: {b.listing?.fpo?.name}</span>
                </div>
                
                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="font-sans tabnum font-black text-green-800 block">₹{b.pricePerKg}/kg</span>
                    <span className="text-[9px] text-muted-foreground">Volume: {b.quantity} kg</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${b.status === 'ACTIVE' ? 'bg-amber-400/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Procurement scheduling updates */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-serif font-bold text-foreground pb-2 border-b border-border">Upcoming Procurement Logistics</h3>
            <div className="flex flex-col gap-3 mt-4 text-xs">
              <div className="bg-surface p-3 rounded-lg flex items-center gap-3">
                <Truck className="w-5 h-5 text-green-800 shrink-0" />
                <div>
                  <span className="font-bold text-foreground block">Tomato lot shipment arriving</span>
                  <span className="text-[9px] text-muted-foreground">ETA: Thursday, June 22 • Salem collector route</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => router.push('/buyer/procurement')}
            className="w-full bg-green-800 text-primary-foreground py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors mt-6"
          >
            Open Procurement Calendar
          </button>
        </div>

      </div>

    </div>
  );
}
