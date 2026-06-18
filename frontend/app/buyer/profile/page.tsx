'use client';

import React from 'react';
import { User, Star, CheckCircle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function BuyerProfile() {
  const { t } = useLanguage();

  const trustScore = 4.8;
  const ratingComponents = [
    { name: 'Payment Speed', score: '98%', status: 'Excellent' },
    { name: 'Dispute Rate', score: '0.2%', status: 'Excellent' },
    { name: 'Fulfill Volume', score: '124 tonnes', status: 'Very High' }
  ];

  const fpoReviews = [
    { fpo: 'Madurai Farmers Collective', rating: 5, comment: 'Timely payments, cooperative logistics coordination. Highly trusted partner.' },
    { fpo: 'Salem Agri Group', rating: 4, comment: 'Fair bidding. Minor delays in truck allocation, resolved swiftly.' }
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <User className="w-6 h-6 text-green-700" />
          Buyer Merchant Profile
        </h1>
        <p className="text-xs text-muted-foreground">
          Monitor your FPO trust ratings index and review evaluation metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Trust Index Card */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm text-center flex flex-col items-center justify-center relative overflow-hidden">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-2">
            Merchant Trust Index
          </span>
          <div className="text-4xl font-serif font-black text-green-900 flex items-center justify-center gap-1.5">
            <span>{trustScore}</span>
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-[10px] text-green-600 font-bold uppercase tracking-wide block mt-3">
            Elite Premium Merchant
          </span>
        </div>

        {/* Scoring components */}
        <div className="md:col-span-2 bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Evaluation Breakdown</h3>
          <div className="flex flex-col gap-2.5">
            {ratingComponents.map((rc, idx) => (
              <div key={idx} className="flex justify-between items-center bg-surface p-3 rounded-lg text-xs">
                <span className="text-muted-foreground font-medium">{rc.name}</span>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-foreground">{rc.score}</span>
                  <span className="bg-green-800/10 text-green-800 text-[9px] px-1.5 py-0.5 rounded uppercase">{rc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Reviews feed */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4 mt-2">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider pb-2 border-b border-border">FPO Partner Reviews</h3>
        
        <div className="flex flex-col gap-4">
          {fpoReviews.map((r, idx) => (
            <div key={idx} className="flex flex-col gap-1.5 text-xs border-b border-border/40 pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">{r.fpo}</span>
                
                {/* Rating stars */}
                <div className="flex text-amber-400">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground italic leading-relaxed">"{r.comment}"</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
