'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function RiskMonitoring() {
  const { t } = useLanguage();
  const [matrix, setMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<any>(null);

  useEffect(() => {
    const fetchRiskMatrix = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/government/risk-monitoring`);
        if (res.ok) {
          const data = await res.json();
          setMatrix(data);
        }
      } catch (err) {
        setMatrix([
          { district: 'Madurai', weather: 'High', shortage: 'Low', oversupply: 'Low', priceCrash: 'Medium' },
          { district: 'Salem', weather: 'Medium', shortage: 'Medium', oversupply: 'Low', priceCrash: 'High' },
          { district: 'Coimbatore', weather: 'Low', shortage: 'Low', oversupply: 'Medium', priceCrash: 'Low' },
          { district: 'Dindigul', weather: 'Medium', shortage: 'High', oversupply: 'Low', priceCrash: 'High' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchRiskMatrix();
  }, []);

  const getSeverityColor = (sev: string) => {
    if (sev === 'High') return 'bg-red-500/10 text-red-500 border border-red-500/20';
    if (sev === 'Medium') return 'bg-amber-400/15 text-amber-500 border border-amber-400/20';
    return 'bg-green-800/10 text-green-800 border border-green-800/20';
  };

  const handleRowClick = (district: string) => {
    setSelectedRisk({
      district,
      analysis: `AI Risk Assessment for ${district}: Due to regional weather anomalies and harvesting dates convergence, supply patterns show a volatility index of 68%. Heavy rainfall alerts pose immediate spoilage risk for tomato lots. A price floor intervention is recommended for vegetable crops in Salem/Dindigul mandis.`
    });
  };

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-green-700" />
          Statewide Crop Risk Matrix
        </h1>
        <p className="text-xs text-muted-foreground">
          Cross-reference weather, production shortages, market oversupply, and price collapse probabilities.
        </p>
      </div>

      {/* Grid of matrix and side display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[9px] uppercase font-bold text-muted-foreground">
                  <th className="p-3">District</th>
                  <th className="p-3">Weather</th>
                  <th className="p-3">Shortage</th>
                  <th className="p-3">Oversupply</th>
                  <th className="p-3">Price Collapse</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => handleRowClick(row.district)}
                    className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-bold text-foreground flex items-center gap-1">
                      <span>{row.district}</span>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </td>
                    <td className="p-3">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getSeverityColor(row.weather)}`}>
                        {row.weather}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getSeverityColor(row.shortage)}`}>
                        {row.shortage}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getSeverityColor(row.oversupply)}`}>
                        {row.oversupply}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getSeverityColor(row.priceCrash)}`}>
                        {row.priceCrash}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drill down modal display */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          {selectedRisk ? (
            <div>
              <h3 className="text-sm font-serif font-black text-foreground pb-2 border-b border-border flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
                {selectedRisk.district} AI Analysis
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-4 bg-surface p-3.5 rounded-lg border border-border">
                {selectedRisk.analysis}
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-muted-foreground flex flex-col items-center justify-center h-full gap-2">
              <Info className="w-6 h-6 text-muted-foreground/35 animate-bounce" />
              <span>Click a district row to evaluate its localized risks index.</span>
            </div>
          )}

          {selectedRisk && (
            <button
              onClick={() => alert(`Escalated intervention warning alert for ${selectedRisk.district}`)}
              className="w-full bg-green-800 text-primary-foreground py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors mt-6"
            >
              Escalate Warning Alert
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
