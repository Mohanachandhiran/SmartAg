'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Plus, Award, ArrowUpRight, CheckCircle2, TrendingUp, Users, Sprout, Building, ShieldCheck, MapPin, Truck, AlertTriangle, ArrowRight, CircleDot } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function FpoLotMarketplace() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  
  // Dashboard Metrics
  const metrics = {
    totalLots: 12,
    activeBuyers: 45,
    highestBidToday: 32.5,
    revenueGenerated: 2450000,
    avgProfitIncrease: 23,
    successfulTx: 104
  };

  // Mock Groups for Dropdown
  const groups = [
    { id: 'TOM-TN-001', crop: 'Tomato', farmers: 15, quantity: 12500, location: 'Krishnagiri', grade: 'A', harvestDate: '2026-06-20' },
    { id: 'ONI-TN-002', crop: 'Onion', farmers: 22, quantity: 18000, location: 'Erode', grade: 'A+', harvestDate: '2026-06-22' },
    { id: 'RIC-TN-003', crop: 'Paddy', farmers: 35, quantity: 45000, location: 'Thanjavur', grade: 'Premium', harvestDate: '2026-06-25' },
  ];

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  
  // Published Lots State
  const [publishedLots, setPublishedLots] = useState<any[]>([
    {
      lotId: 'LOT-TOM-001',
      crop: 'Tomato',
      quantity: 12500,
      reservePrice: 25,
      closingDate: '2026-06-19',
      status: 'OPEN',
      bids: [
        {
          id: 'b-1',
          buyerName: 'ABC Retail Chain',
          price: 31,
          distance: 45,
          transportCost: 0.8,
          confidence: 94,
          reason: 'Highest net profit and lowest logistics risk.',
          isRecommended: true
        },
        {
          id: 'b-2',
          buyerName: 'Fresh Farms Exporters',
          price: 29,
          distance: 120,
          transportCost: 1.5,
          confidence: 82,
          reason: 'Good price but higher transport overhead.',
          isRecommended: false
        },
        {
          id: 'b-3',
          buyerName: 'Local Mandi Wholesaler',
          price: 26,
          distance: 12,
          transportCost: 0.2,
          confidence: 76,
          reason: 'Very low risk but profit margin is below market average.',
          isRecommended: false
        }
      ]
    }
  ]);

  // Workflow State
  const [acceptedLotId, setAcceptedLotId] = useState<string | null>(null);
  const [workflowStep, setWorkflowStep] = useState(0);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !minPrice) return;

    const group = groups.find(g => g.id === selectedGroupId);
    if (!group) return;

    const newLot = {
      lotId: `LOT-${group.id.split('-')[0]}-${Math.floor(Math.random() * 1000)}`,
      crop: group.crop,
      quantity: group.quantity,
      reservePrice: parseFloat(minPrice),
      closingDate: group.harvestDate,
      status: 'OPEN',
      bids: []
    };

    setPublishedLots([newLot, ...publishedLots]);
    setSelectedGroupId('');
    setMinPrice('');
    alert(`Published lot ${newLot.lotId} to marketplace. Notifying eligible buyers.`);
  };

  const handleAcceptBid = (lotId: string, bid: any) => {
    if(confirm(`Are you sure you want to accept ${bid.buyerName}'s bid for ₹${bid.price}/kg?`)) {
      setPublishedLots(prev => prev.map(l => l.lotId === lotId ? { ...l, status: 'SOLD' } : l));
      setAcceptedLotId(lotId);
      setWorkflowStep(1); // Start workflow
    }
  };

  const handleRejectBid = (lotId: string, bidId: string) => {
    setPublishedLots(prev => prev.map(l => {
      if (l.lotId === lotId) {
        return { ...l, bids: l.bids.filter((b: any) => b.id !== bidId) };
      }
      return l;
    }));
  };

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <Globe className="w-6 h-6 text-green-700" />
          FPO Lot Marketplace
        </h1>
        <p className="text-xs text-muted-foreground">
          Publish AI-grouped farmer lots to wholesale buyers, processors, exporters, and retailers.
        </p>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-card border border-border p-3 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Total Lots Published</span>
          <span className="text-lg font-serif font-black text-foreground">{metrics.totalLots}</span>
        </div>
        <div className="bg-card border border-border p-3 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Active Buyers</span>
          <span className="text-lg font-serif font-black text-blue-700">{metrics.activeBuyers}</span>
        </div>
        <div className="bg-card border border-border p-3 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Highest Bid Today</span>
          <span className="text-lg font-sans tabnum font-black text-green-700">₹{metrics.highestBidToday}/kg</span>
        </div>
        <div className="bg-card border border-border p-3 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Revenue Generated</span>
          <span className="text-lg font-sans tabnum font-black text-amber-600">₹{(metrics.revenueGenerated/100000).toFixed(1)}L</span>
        </div>
        <div className="bg-card border border-border p-3 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Avg Profit Increase</span>
          <span className="text-lg font-sans tabnum font-black text-green-700">+{metrics.avgProfitIncrease}%</span>
        </div>
        <div className="bg-card border border-border p-3 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Successful Tx</span>
          <span className="text-lg font-serif font-black text-foreground">{metrics.successfulTx}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Publish Form */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-surface border border-border p-5 rounded-xl shadow-sm">
            <h3 className="text-sm font-serif font-bold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-800" />
              Publish New Lot
            </h3>
            
            <form onSubmit={handlePublish} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Select FPO Crop Group</label>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                  {groups.map(g => (
                    <div 
                      key={g.id}
                      onClick={() => setSelectedGroupId(g.id)}
                      className={`cursor-pointer p-3 rounded-lg border text-xs transition-colors ${selectedGroupId === g.id ? 'border-green-600 bg-green-50 shadow-sm' : 'border-border bg-card hover:border-green-300'}`}
                    >
                      <div className="flex justify-between font-bold text-foreground mb-1">
                        <span>{g.id}</span>
                        <span className="text-green-800">{g.crop}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                        <div>Farmers: <span className="font-bold text-foreground">{g.farmers}</span></div>
                        <div>Quantity: <span className="font-bold text-foreground font-sans tabnum">{g.quantity.toLocaleString()} kg</span></div>
                        <div>Location: <span className="font-bold text-foreground">{g.location}</span></div>
                        <div>Grade: <span className="font-bold text-foreground">{g.grade}</span></div>
                      </div>
                      <div className="mt-1 text-[10px] text-amber-600 font-bold">
                        Harvest: {g.harvestDate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Minimum Reserve Price (₹/kg)</label>
                <input 
                  type="number"
                  placeholder="e.g. 25"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full text-sm font-semibold bg-card border border-border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!selectedGroupId || !minPrice}
                className="mt-2 bg-green-800 text-primary-foreground font-bold py-3 rounded-lg text-xs hover:bg-green-700 transition-colors disabled:bg-muted disabled:text-muted-foreground flex justify-center items-center gap-2"
              >
                Publish to Marketplace <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Lots & Recommendations */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Post-Acceptance Workflow Banner (Conditional) */}
          {acceptedLotId && (
            <div className="bg-green-950 text-white rounded-xl p-5 shadow-agri relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-800 rounded-full blur-3xl opacity-30" />
              <div className="relative z-10">
                <h3 className="text-lg font-serif font-black flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  Transaction Initiated for {acceptedLotId}
                </h3>
                
                {/* Stepper */}
                <div className="flex items-center justify-between mt-6 text-xs font-bold text-green-300/60 relative">
                  <div className="absolute left-6 right-6 top-3 h-0.5 bg-green-800 -z-10" />
                  
                  {[
                    { label: 'Payment Escrow', icon: Building },
                    { label: 'Pickup Scheduling', icon: ShieldCheck },
                    { label: 'Logistics Tracking', icon: Truck },
                    { label: 'Delivery Confirmation', icon: MapPin },
                    { label: 'Farmer Settlement', icon: CheckCircle2 }
                  ].map((step, idx) => (
                    <div key={idx} className={`flex flex-col items-center gap-2 ${idx <= workflowStep ? 'text-amber-400' : ''}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${idx <= workflowStep ? 'bg-amber-400 text-green-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'bg-green-900 text-green-600'}`}>
                        {idx < workflowStep ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className="w-16 text-center leading-tight text-[9px]">{step.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => setWorkflowStep(prev => Math.min(prev + 1, 4))}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-lg transition-colors border border-white/20"
                  >
                    Simulate Next Step
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Active Listings List */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-serif font-bold text-foreground">Active Published Lots</h3>
            
            {publishedLots.map((lot) => (
              <div key={lot.lotId} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                
                {/* Lot Header */}
                <div className="p-4 border-b border-border bg-surface flex flex-wrap gap-4 justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${lot.status === 'OPEN' ? 'bg-amber-400/20 text-amber-600 border border-amber-400/40' : 'bg-green-800/10 text-green-800 border border-green-800/20'}`}>
                        {lot.status === 'OPEN' ? '🟢 Open for Bidding' : '✓ Sold & Closed'}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{lot.lotId}</span>
                    </div>
                    <h4 className="text-lg font-serif font-black text-foreground">
                      {lot.crop} <span className="text-muted-foreground font-sans text-sm font-medium ml-1">({(lot.quantity).toLocaleString()} kg)</span>
                    </h4>
                    <span className="text-xs text-muted-foreground mt-1 block">Closing Date: {lot.closingDate}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-right">
                    <div>
                      <span className="text-[9px] text-muted-foreground font-bold uppercase block">Reserve Price</span>
                      <span className="text-sm font-sans tabnum font-black text-foreground">₹{lot.reservePrice}/kg</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground font-bold uppercase block">Highest Bid</span>
                      <span className="text-sm font-sans tabnum font-black text-green-700">
                        {lot.bids.length > 0 ? `₹${Math.max(...lot.bids.map((b: any) => b.price))}/kg` : 'No bids'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground font-bold uppercase block">Total Buyers</span>
                      <span className="text-sm font-sans tabnum font-black text-foreground">{lot.bids.length}</span>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation Section */}
                {lot.status === 'OPEN' && lot.bids.length > 0 && (
                  <div className="p-4 bg-amber-50/30 border-b border-border">
                    <h5 className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" /> AI Buyer Recommendation Engine
                    </h5>
                    
                    {/* Top Recommended Buyer Card */}
                    {lot.bids.filter((b: any) => b.isRecommended).map((bid: any) => (
                      <div key={bid.id} className="bg-white border-2 border-amber-400 rounded-lg p-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-amber-400 text-green-950 text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                          🏆 Best Profit Score
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div>
                            <h6 className="text-sm font-black text-foreground">{bid.buyerName}</h6>
                            <p className="text-xs text-muted-foreground mt-0.5">{bid.reason}</p>
                            
                            <div className="flex flex-wrap gap-4 mt-3">
                              <div className="bg-surface px-2 py-1.5 rounded border border-border">
                                <span className="text-[9px] text-muted-foreground block uppercase">Bid Price</span>
                                <span className="text-xs font-sans tabnum font-bold text-green-800">₹{bid.price}/kg</span>
                              </div>
                              <div className="bg-surface px-2 py-1.5 rounded border border-border">
                                <span className="text-[9px] text-muted-foreground block uppercase">Transport Cost</span>
                                <span className="text-xs font-sans tabnum font-bold text-red-600">-₹{bid.transportCost}/kg</span>
                              </div>
                              <div className="bg-surface px-2 py-1.5 rounded border border-border">
                                <span className="text-[9px] text-muted-foreground block uppercase">Distance</span>
                                <span className="text-xs font-sans tabnum font-bold text-foreground">{bid.distance} km</span>
                              </div>
                              <div className="bg-green-50 px-2 py-1.5 rounded border border-green-200">
                                <span className="text-[9px] text-green-800 block uppercase">Expected Farmer Profit</span>
                                <span className="text-sm font-sans tabnum font-black text-green-700">₹{(bid.price - bid.transportCost).toFixed(1)}/kg</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col justify-between items-end min-w-[120px]">
                            <div className="text-right">
                              <span className="text-[10px] text-amber-600 font-bold uppercase block">AI Confidence</span>
                              <span className="text-xl font-black text-amber-500">{bid.confidence}%</span>
                            </div>
                            <div className="flex gap-2 w-full mt-3">
                              <button onClick={() => handleAcceptBid(lot.lotId, bid)} className="flex-1 bg-green-800 text-white text-xs font-bold py-2 rounded shadow hover:bg-green-700 transition-colors">
                                Accept Bid
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Other Bids */}
                {lot.status === 'OPEN' && lot.bids.length > 1 && (
                  <div className="p-4">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Other Active Bids</h5>
                    <div className="flex flex-col gap-2">
                      {lot.bids.filter((b: any) => !b.isRecommended).map((bid: any) => (
                        <div key={bid.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface border border-border p-3 rounded-lg text-xs gap-3">
                          <div className="flex-1">
                            <span className="font-bold text-foreground">{bid.buyerName}</span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">{bid.distance} km • Transport Est: ₹{bid.transportCost}/kg</span>
                          </div>
                          
                          <div className="text-right">
                            <span className="font-sans tabnum font-black text-green-800 block text-sm">₹{bid.price}/kg</span>
                            <span className="text-[9px] text-muted-foreground uppercase">Offered Price</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button className="bg-muted hover:bg-border text-foreground px-3 py-1.5 rounded font-semibold transition-colors">
                              Negotiate
                            </button>
                            <button onClick={() => handleRejectBid(lot.lotId, bid.id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded font-semibold transition-colors">
                              Reject
                            </button>
                            <button onClick={() => handleAcceptBid(lot.lotId, bid)} className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1.5 rounded font-bold transition-colors">
                              Accept
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {lot.status === 'OPEN' && (
                   <div className="p-3 bg-muted/30 border-t border-border flex justify-end">
                     <button className="text-[10px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50">
                       <AlertTriangle className="w-3 h-3" /> Close Auction Early
                     </button>
                   </div>
                )}
              </div>
            ))}
            
            {publishedLots.length === 0 && (
              <div className="bg-surface border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
                <Globe className="w-8 h-8 mx-auto text-border mb-3" />
                <p className="text-sm font-semibold">No active lots published.</p>
                <p className="text-xs mt-1">Select a group from the left and publish to start receiving bids.</p>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}
