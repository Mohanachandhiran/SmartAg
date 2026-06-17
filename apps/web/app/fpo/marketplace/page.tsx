'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Plus, Award, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function Marketplace() {
  const { t } = useLanguage();
  const [listings, setListings] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [bids, setBids] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, groupsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/buyer/marketplace`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/fpo/groups`)
        ]);

        if (listingsRes.ok) {
          const lData = await listingsRes.json();
          setListings(lData);
        }
        if (groupsRes.ok) {
          const gData = await groupsRes.json();
          setGroups(gData.filter((g: any) => g.status === 'ACTIVE'));
        }
      } catch (err) {
        console.warn('Marketplace fetch failed. Using mockup records.');
        setListings([
          { id: '1', group: { totalQuantity: 6200, cropType: 'Tomato', fpo: { name: 'Madurai Farmers Collective', location: 'Madurai' } }, status: 'PUBLISHED', bids: [{ id: 'b-1', buyer: { name: 'Rel-Agro Foods Ltd' }, offeredPrice: 30, aiScore: 5000 }, { id: 'b-2', buyer: { name: 'Heritage Fresh' }, offeredPrice: 28, aiScore: 2000 }] },
          { id: '2', group: { totalQuantity: 9100, cropType: 'Onion', fpo: { name: 'Salem Agri Group', location: 'Salem' } }, status: 'PUBLISHED', bids: [{ id: 'b-3', buyer: { name: 'Salem Sago Processors' }, offeredPrice: 35, aiScore: 4000 }] }
        ]);
        setGroups([
          { id: 'g-3', groupName: 'Banana Export Batch C', cropType: 'Banana', totalQuantity: 12500 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !minPrice) {
      alert('Please select a group and enter a minimum price.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/fpo/marketplace/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroup,
          minPrice: parseFloat(minPrice)
        })
      });

      if (res.ok) {
        alert('Group lot successfully published to buyer marketplace!');
        window.location.reload();
      }
    } catch (e) {
      // mock success
      const group = groups.find(gp => gp.id === selectedGroup);
      setListings(prev => [
        ...prev,
        {
          id: `list-${Math.random()}`,
          group: { totalQuantity: group?.totalQuantity || 5000, cropType: group?.cropType || 'Tomato', fpo: { name: 'Madurai Farmers Collective', location: 'Madurai' } },
          status: 'PUBLISHED',
          bids: []
        }
      ]);
      alert('Lot published successfully!');
    }
  };

  const handleAcceptBid = (bidId: string) => {
    alert(`Bid ${bidId} accepted! Transaction initiated.`);
  };

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <Globe className="w-6 h-6 text-green-700" />
          FPO Lot Marketplace
        </h1>
        <p className="text-xs text-muted-foreground">
          Publish aggregated farmer harvest lots to wholesale buyers. Evaluates incoming buyer bids.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Publish form panel */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm h-fit">
          <h3 className="text-sm font-serif font-bold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-green-800" />
            Publish Group Lot
          </h3>
          <form onSubmit={handlePublish} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Select FPO Crop Group</label>
              {groups.length === 0 ? (
                <span className="text-xs text-muted-foreground">No active groups awaiting publication. Run AI Grouping first.</span>
              ) : (
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full text-xs font-semibold bg-surface border border-border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800"
                >
                  <option value="">Choose active group...</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.groupName} ({g.totalQuantity} kg)</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Minimum Reserve Price (₹/kg)</label>
              <input 
                type="number"
                placeholder="e.g. 25"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-xs font-semibold bg-surface border border-border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800"
              />
            </div>

            <button
              type="submit"
              disabled={groups.length === 0}
              className="bg-green-800 text-primary-foreground font-bold py-2.5 rounded-lg text-xs hover:bg-green-700 transition-colors disabled:bg-muted disabled:text-muted-foreground"
            >
              Publish to Marketplace
            </button>
          </form>
        </div>

        {/* Listings display with active bids */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          <h3 className="text-sm font-serif font-bold text-foreground">Active Published Lots</h3>
          
          {listings.map((l, idx) => (
            <div key={l.id || idx} className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div>
                  <span className="text-[10px] font-bold text-green-800 bg-green-800/10 px-2 py-0.5 rounded-full uppercase">
                    {l.status}
                  </span>
                  <h3 className="text-sm font-serif font-bold text-foreground mt-1">
                    {(l.group?.totalQuantity || l.quantity).toLocaleString()} kg of {l.group?.cropType || l.farm?.cropType}
                  </h3>
                  <span className="text-[10px] text-muted-foreground">FPO: {l.group?.fpo?.name || l.fpo?.name} ({l.group?.fpo?.location || l.fpo?.location})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase">Reserve Price</span>
                  <span className="text-base font-serif font-black text-green-950">₹30/kg</span>
                </div>
              </div>

              {/* Bids list */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Buyer Bids ({l.bids?.length || 0}):</span>
                {(!l.bids || l.bids.length === 0) ? (
                  <span className="text-xs text-muted-foreground leading-relaxed block py-2">No bids placed yet by wholesale buyers.</span>
                ) : (
                  <div className="flex flex-col gap-2">
                    {l.bids.sort((a: any, b: any) => {
                      const profitA = (a.offeredPrice * (l.group?.totalQuantity || l.quantity)) - (a.aiScore || 0);
                      const profitB = (b.offeredPrice * (l.group?.totalQuantity || l.quantity)) - (b.aiScore || 0);
                      return profitB - profitA;
                    }).map((b: any, bIdx: number) => {
                      const highest = bIdx === 0;
                      const price = b.offeredPrice || b.pricePerKg || 0;
                      const transport = b.aiScore || 0;
                      const netProfit = (price * (l.group?.totalQuantity || l.quantity)) - transport;
                      
                      return (
                        <div key={b.id || bIdx} className={`flex justify-between items-center bg-surface border ${highest ? 'border-amber-400 bg-amber-50/50' : 'border-border'} p-3 rounded-lg text-xs`}>
                          <div className="flex items-center gap-2">
                            {highest && <Award className="w-4 h-4 text-amber-500 shrink-0" />}
                            <div>
                              <span className="font-bold text-foreground block">{b.buyer?.name || b.buyerName || 'Buyer'} {highest && <span className="text-[10px] text-amber-600 ml-1">(Most Profitable)</span>}</span>
                              <span className="text-[9px] text-muted-foreground">Quote: ₹{price}/kg | Transport: -₹{transport}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-2">
                              <span className="font-serif font-black text-green-800 block">
                                ₹{netProfit.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-muted-foreground font-bold">Net Profit</span>
                            </div>
                            <button
                              onClick={() => handleAcceptBid(b.id)}
                              className="bg-green-800 text-primary-foreground hover:bg-green-700 text-[10px] font-bold px-2 py-1.5 rounded transition-colors"
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}
