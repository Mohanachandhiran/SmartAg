'use client';

import React, { useState, useEffect } from 'react';
import { Brain, ShieldAlert, Sparkles, Plus, Clock } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function PolicyInsights() {
  const { t } = useLanguage();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicyBrief = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://smartag-api-1siv.onrender.com/api'}/government/policy-insights`);
        if (res.ok) {
          const data = await res.json();
          setInsights(data);
        }
      } catch (err) {
        setInsights({
          brief: `### Weekly state Policy Brief

**1. Tomato Price Stabilization:** Due to heavy rain forecasts in Madurai, a supply disruption is anticipated over the next week. Pre-emptive sourcing from Oddanchatram FPOs is recommended to cover Chennai market deficit.

**2. Onion Shortage Mitigation:** Salem region reports a 15% drop in onion arrivals. FPOs should be encouraged to utilize storage warehouses instead of immediate mandi sales. Priority tag: High Intervention.`,
          interventions: [
            { id: 1, action: 'Transport subsidy release for Dindigul FPO', priority: 'High', status: 'Approved', date: '2026-06-12' },
            { id: 2, action: 'Storage credit facility for Salem Onion farmers', priority: 'Medium', status: 'In Progress', date: '2026-06-14' },
            { id: 3, action: 'Mandi price floor adjustment for Tomatoes', priority: 'High', status: 'Completed', date: '2026-06-10' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPolicyBrief();
  }, []);

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <Brain className="w-6 h-6 text-amber-500 animate-pulse" />
          AI Policy Insights brief
        </h1>
        <p className="text-xs text-muted-foreground">
          Review Gemini-powered policy recommendations and track administrative state interventions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gemini Policy Brief container */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-xl shadow-sm relative overflow-hidden flex flex-col gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl" />
          
          <div className="flex items-center gap-1.5 border-b border-border pb-2 z-10">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-serif font-bold text-foreground">Weekly State Brief</h3>
          </div>

          <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line z-10">
            {insights?.brief}
          </div>
        </div>

        {/* Action Interventions list */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-serif font-bold text-foreground pb-2 border-b border-border flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-green-800" />
            Interventions Log
          </h3>

          <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
            {insights?.interventions?.map((item: any, idx: number) => (
              <div key={item.id || idx} className="bg-surface border border-border p-3.5 rounded-lg text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-foreground truncate max-w-[130px]">{item.action}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${item.priority === 'High' ? 'bg-red-500 text-white' : 'bg-amber-400 text-green-900'}`}>
                    {item.priority}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                  <span>Status: {item.status}</span>
                  <span>Date: {item.date}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => alert('Adding new policy intervention agenda item.')}
            className="w-full bg-green-800 text-primary-foreground py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors mt-2"
          >
            Create Intervention agenda
          </button>
        </div>

      </div>

    </div>
  );
}
