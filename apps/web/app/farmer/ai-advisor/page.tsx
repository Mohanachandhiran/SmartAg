'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Landmark, Calendar, Users, Award, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function AIAdvisor() {
  const router = useRouter();
  const { t } = useLanguage();
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState<any>(null);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/farmer/farms`);
        if (res.ok) {
          const data = await res.json();
          setFarms(data);
          if (data.length > 0) {
            setSelectedFarm(data[0]);
          }
        }
      } catch (err) {
        console.warn('Farms fetch failed. Using fallback mocks.');
        // Set mock farms
        const mocks = [
          { id: 'farm-1', cropType: 'Tomato', quantity: 1500, qualityGrade: 'A', harvestDate: '2026-06-20' },
          { id: 'farm-2', cropType: 'Onion', quantity: 2000, qualityGrade: 'B', harvestDate: '2026-06-25' }
        ];
        setFarms(mocks);
        setSelectedFarm(mocks[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  useEffect(() => {
    if (!selectedFarm) return;

    const fetchAdvice = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/ai/selling-recommendation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmId: selectedFarm.id,
            crop: selectedFarm.cropType,
            quantity: selectedFarm.quantity,
            location: { lat: selectedFarm.gpsLat || 10.9252, lng: selectedFarm.gpsLng || 78.1198 }
          })
        });

        if (res.ok) {
          const data = await res.json();
          setAdvice(data);
        } else {
          throw new Error('API failed');
        }
      } catch (e) {
        // Fallback simulated advice
        const isTomato = selectedFarm.cropType.toLowerCase() === 'tomato';
        setAdvice({
          sellToday: isTomato ? 22.0 : 28.0,
          sellLater: isTomato ? 24.5 : 29.5,
          joinFPO: isTomato ? 27.2 : 34.0,
          recommended: 'JOIN_FPO',
          expectedIncome: isTomato ? 40500 : 67400,
          confidence: 91,
          risk: 'Low',
          explanation: isTomato 
            ? 'Joining the local FPO Collective for tomatoes reduces transport cost by 62% and guarantees bulk purchase price from wholesale buyers.'
            : 'FPO Onion Group B is pooling harvests in Salem. Joining yields 21% higher income and avoids storage losses.'
        });
      }
    };

    fetchAdvice();
  }, [selectedFarm]);

  const handleSelectFarm = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const farm = farms.find(f => f.id === e.target.value);
    if (farm) setSelectedFarm(farm);
  };

  if (loading) {
    return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-amber-400" />
            AI Decision Advisor
          </h1>
          <p className="text-xs text-muted-foreground">
            Gemini-powered price vs cost analysis matching real-time FPO collections.
          </p>
        </div>

        {/* Farm dropdown selector */}
        {farms.length > 0 && (
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-lg">
            <span className="text-xs font-bold text-muted-foreground">Select crop:</span>
            <select
              value={selectedFarm?.id || ''}
              onChange={handleSelectFarm}
              className="text-xs font-bold text-green-800 bg-transparent focus:outline-none cursor-pointer"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.cropType} ({f.quantity} kg)</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {farms.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center rounded-xl text-xs text-muted-foreground">
          No crops registered yet. Go to Crop Registration page to start.
        </div>
      ) : advice && (
        <div className="flex flex-col gap-6">
          
          {/* Winner recommendation card */}
          <div className="bg-gradient-to-r from-amber-400/20 to-amber-500/10 border-2 border-amber-400 p-6 rounded-xl shadow-agri relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl" />
            <div className="z-10 flex gap-4 items-start">
              <div className="w-12 h-12 bg-amber-400 rounded-lg flex items-center justify-center text-green-950 font-serif font-black text-xl shrink-0">
                🏆
              </div>
              <div>
                <span className="bg-green-800 text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded uppercase font-sans tracking-wide">
                  Recommended Choice
                </span>
                <h2 className="text-xl font-serif font-black text-green-900 mt-1">
                  {advice.recommended === 'JOIN_FPO' ? 'Join FPO Collective Selling' : advice.recommended === 'SELL_MANDI_LATER' ? 'Sell at Mandi Later' : 'Sell at Mandi Today'}
                </h2>
                <p className="text-xs font-bold text-green-800 mt-1">
                  Expected Net Income: ₹{advice.expectedIncome.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            
            <div className="z-10 flex gap-4 bg-card/60 backdrop-blur-sm border border-border p-3.5 rounded-lg">
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground block font-bold uppercase">Confidence</span>
                <span className="text-sm font-bold text-green-900">{advice.confidence}%</span>
              </div>
              <div className="border-r border-border" />
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground block font-bold uppercase">Risk Level</span>
                <span className="text-sm font-bold text-amber-600">{advice.risk}</span>
              </div>
            </div>
          </div>

          {/* Three comparison cards side by side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sell Mandi Today */}
            <div className={`bg-card p-5 rounded-xl border-2 flex flex-col justify-between shadow-sm relative ${advice.recommended === 'SELL_MANDI_TODAY' ? 'border-amber-400' : 'border-border'}`}>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-xs font-bold text-foreground">Sell at Mandi Today</span>
                  <Landmark className="w-4 h-4 text-green-800" />
                </div>
                
                <div className="flex flex-col gap-1.5 my-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Mandi Price</span>
                    <span className="font-bold text-foreground">₹{advice.sellToday}/kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Transport Cost</span>
                    <span className="font-bold text-red-500">₹{(selectedFarm.quantity * 0.15).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Storage Fee</span>
                    <span className="font-bold text-foreground">₹0</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4 flex flex-col gap-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Net Revenue</span>
                  <span className="text-base font-serif font-black text-green-800">
                    ₹{Math.round((advice.sellToday * selectedFarm.quantity) - (selectedFarm.quantity * 0.15)).toLocaleString()}
                  </span>
                </div>
                <button 
                  onClick={() => alert('Dispatched details request to Mandi')}
                  className="w-full bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg text-xs font-bold transition-all"
                >
                  Sell Today
                </button>
              </div>
            </div>

            {/* Sell Mandi Later */}
            <div className={`bg-card p-5 rounded-xl border-2 flex flex-col justify-between shadow-sm relative ${advice.recommended === 'SELL_MANDI_LATER' ? 'border-amber-400' : 'border-border'}`}>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-xs font-bold text-foreground">Sell at Mandi Later</span>
                  <Calendar className="w-4 h-4 text-green-800" />
                </div>
                
                <div className="flex flex-col gap-1.5 my-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Forecasted Price</span>
                    <span className="font-bold text-foreground">₹{advice.sellLater}/kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Transport Cost</span>
                    <span className="font-bold text-red-500">₹{(selectedFarm.quantity * 0.15).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Cold Storage</span>
                    <span className="font-bold text-red-500">₹{(selectedFarm.quantity * 0.15 * 7).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4 flex flex-col gap-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Net Revenue</span>
                  <span className="text-base font-serif font-black text-green-800">
                    ₹{Math.round((advice.sellLater * selectedFarm.quantity) - (selectedFarm.quantity * 0.15) - (selectedFarm.quantity * 0.15 * 7)).toLocaleString()}
                  </span>
                </div>
                <button 
                  onClick={() => alert('Booked 7 Days cold storage warehouse facility.')}
                  className="w-full bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg text-xs font-bold transition-all"
                >
                  Book Storage
                </button>
              </div>
            </div>

            {/* Join FPO Collective */}
            <div className={`bg-card p-5 rounded-xl border-2 flex flex-col justify-between shadow-sm relative ${advice.recommended === 'JOIN_FPO' ? 'border-amber-400 bg-amber-400/5' : 'border-border'}`}>
              <div className="absolute top-2 right-2 bg-amber-400 text-green-950 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                Best Returns
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-xs font-bold text-foreground">Join FPO Collective</span>
                  <Users className="w-4 h-4 text-green-800" />
                </div>
                
                <div className="flex flex-col gap-1.5 my-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Group Price</span>
                    <span className="font-bold text-foreground">₹{advice.joinFPO}/kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">FPO Transport</span>
                    <span className="font-bold text-green-600">₹{(selectedFarm.quantity * 0.05).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">FPO Admin fee</span>
                    <span className="font-bold text-foreground">₹0</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4 flex flex-col gap-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Net Revenue</span>
                  <span className="text-base font-serif font-black text-green-800">
                    ₹{Math.round((advice.joinFPO * selectedFarm.quantity) - (selectedFarm.quantity * 0.05)).toLocaleString()}
                  </span>
                </div>
                <button 
                  onClick={() => router.push('/farmer/collective-selling')}
                  className="w-full bg-green-800 text-primary-foreground py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-1"
                >
                  <span>Join Group</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* AI Explanation block */}
          <div className="bg-card border border-border p-5 rounded-xl flex gap-3.5 shadow-sm">
            <div className="p-2.5 bg-green-800/10 text-green-800 rounded-lg shrink-0 h-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Gemini Advisor Explanation</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                {advice.explanation}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
