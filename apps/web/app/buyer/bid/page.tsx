'use client';

import React, { useState } from 'react';
import { Landmark, ArrowUpRight, Flame, Hourglass } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function BuyerBids() {
  const { t } = useLanguage();
  
  // Seeded mock buyer bids
  const [bids, setBids] = useState([
    { id: 'b-1', cropType: 'Tomato', fpoName: 'Madurai Farmers Collective', quantity: 6200, myBid: 32, maxBid: 32, status: 'ACTIVE', rank: 1 },
    { id: 'b-2', cropType: 'Onion', fpoName: 'Salem Agri Group', quantity: 9100, myBid: 28, maxBid: 35, status: 'ACTIVE', rank: 3 }
  ]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <Landmark className="w-6 h-6 text-green-700" />
          Active Procurement Bids
        </h1>
        <p className="text-xs text-muted-foreground">
          Track real-time bid positions and rankings for published regional FPO crop lots.
        </p>
      </div>

      {/* Grid of bids */}
      <div className="flex flex-col gap-4">
        {bids.map((b) => (
          <div key={b.id} className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border pb-3 mb-4">
              <div>
                <span className="text-[9px] font-bold text-amber-600 bg-amber-400/10 px-2 py-0.5 rounded uppercase">
                  Rank {b.rank} of 4 Bidders
                </span>
                <h3 className="text-sm font-serif font-bold text-foreground mt-1">
                  {b.quantity.toLocaleString()} kg of {b.cropType}
                </h3>
                <span className="text-[10px] text-muted-foreground">FPO: {b.fpoName}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block font-bold uppercase">Total Bid Amount</span>
                <span className="text-sm font-serif font-black text-green-800">
                  ₹{(b.myBid * b.quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Live progress stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">My Bid Rate</span>
                <span className="font-bold text-foreground">₹{b.myBid}/kg</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Highest Bid</span>
                <span className="font-bold text-green-800">₹{b.maxBid}/kg</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Auction status</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Hourglass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Open bidding</span>
                </span>
              </div>
              <div className="flex items-center justify-end sm:justify-start">
                {b.rank === 1 ? (
                  <span className="bg-green-800 text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    🏆 Highest Bidder
                  </span>
                ) : (
                  <button
                    onClick={() => alert(`Bid increased to ₹${b.maxBid + 1}/kg.`)}
                    className="bg-amber-400 hover:bg-amber-500 text-green-950 font-bold px-3 py-1.5 rounded text-[10px] transition-colors"
                  >
                    Increase Bid
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
