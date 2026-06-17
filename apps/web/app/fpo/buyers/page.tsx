'use client';

import React, { useState } from 'react';
import { HeartHandshake, Award, ShieldAlert, Star } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function Buyers() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'directory' | 'ai-rec'>('directory');

  const buyers = [
    { name: 'Rel-Agro Foods Ltd', trust: 4.8, location: 'Chennai', history: '12,400 kg procured', risk: 'Low', bid: 32 },
    { name: 'Heritage Fresh Procurement', trust: 4.5, location: 'Coimbatore', history: '9,100 kg procured', risk: 'Low', bid: 31 },
    { name: 'Salem Sago Processors', trust: 3.9, location: 'Salem', history: '4,500 kg procured', risk: 'Medium', bid: 35 },
    { name: 'Annapoorna Caterers', trust: 4.1, location: 'Madurai', history: '2,200 kg procured', risk: 'Medium', bid: 29 }
  ];

  // AI buyer recommendation scoring matrix comparison
  const aiRecommendations = {
    best: 'Salem Sago Processors',
    netRevenue: 204500,
    confidence: 89,
    explanation: 'Salem Sago Processors offers the highest bid (₹35/kg). Although transport cost is higher and trust score is lower, it maximizes net revenue by ₹14,000 compared to Rel-Agro.',
    candidates: [
      { name: 'Salem Sago Processors', bid: 35, transport: 1800, net: 204500, risk: 'Medium', score: 89 },
      { name: 'Rel-Agro Foods Ltd', bid: 32, transport: 2400, net: 190800, risk: 'Low', score: 86 },
      { name: 'Heritage Fresh', bid: 31, transport: 900, net: 188000, risk: 'Low', score: 82 }
    ]
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 text-green-700" />
          Buyer Directory & Recommendations
        </h1>
        <p className="text-xs text-muted-foreground">
          View trusted wholesale merchants or use the AI procurement recommender to pick the optimal contract bids.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6">
        <button 
          onClick={() => setActiveTab('directory')}
          className={`pb-2 text-xs font-bold transition-all relative ${activeTab === 'directory' ? 'text-green-800 font-black' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {activeTab === 'directory' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-800" />}
          Wholesale Directory
        </button>
        <button 
          onClick={() => setActiveTab('ai-rec')}
          className={`pb-2 text-xs font-bold transition-all relative ${activeTab === 'ai-rec' ? 'text-green-800 font-black' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {activeTab === 'ai-rec' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-800" />}
          AI Buyer Match Score
        </button>
      </div>

      {/* Tab grids */}
      {activeTab === 'directory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buyers.map((b, idx) => (
            <div key={idx} className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start border-b border-border pb-3 mb-3">
                <div>
                  <h3 className="text-sm font-serif font-bold text-foreground">{b.name}</h3>
                  <span className="text-[10px] text-muted-foreground uppercase">{b.location} Base</span>
                </div>
                
                {/* Rating stars */}
                <div className="flex items-center text-amber-400 gap-1 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs font-bold text-green-950">{b.trust}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Historical volume:</span>
                  <span className="font-bold text-foreground">{b.history}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Default risk level:</span>
                  <span className="font-bold text-foreground">{b.risk}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Winner buyer card */}
          <div className="bg-gradient-to-r from-amber-400/20 to-amber-500/10 border-2 border-amber-400 p-6 rounded-xl shadow-agri flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-amber-400 rounded-lg flex items-center justify-center text-green-950 font-serif font-black text-xl shrink-0">
                🤖
              </div>
              <div>
                <span className="bg-green-800 text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                  Top Recommended Buyer
                </span>
                <h2 className="text-xl font-serif font-black text-green-900 mt-1">{aiRecommendations.best}</h2>
                <p className="text-xs font-bold text-green-800 mt-1">
                  Expected Net Lot Revenue: ₹{aiRecommendations.netRevenue.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 bg-card/65 border border-border p-3.5 rounded-lg text-center">
              <div>
                <span className="text-[10px] text-muted-foreground block font-bold uppercase">Confidence</span>
                <span className="text-sm font-bold text-green-900">{aiRecommendations.confidence}%</span>
              </div>
            </div>
          </div>

          {/* AI Explanation details */}
          <div className="bg-card border border-border p-4.5 rounded-xl text-xs text-muted-foreground">
            <p className="leading-relaxed">{aiRecommendations.explanation}</p>
          </div>

          {/* Side by side candidates comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiRecommendations.candidates.map((c, idx) => (
              <div key={idx} className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-border mb-3">
                    <span className="text-xs font-bold text-foreground">{c.name}</span>
                    <span className="text-[10px] bg-green-800/10 text-green-800 px-1.5 py-0.5 rounded font-bold uppercase">Rank {idx+1}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 my-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bid price:</span>
                      <span className="font-bold text-foreground">₹{c.bid}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transport:</span>
                      <span className="font-bold text-red-500">-₹{c.transport}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Risk:</span>
                      <span className="font-bold text-foreground">{c.risk}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mt-4 flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Net Revenue</span>
                  <span className="text-base font-serif font-black text-green-800">₹{c.net.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
