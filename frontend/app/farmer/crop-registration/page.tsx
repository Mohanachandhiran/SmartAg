'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation, Calendar, ShoppingBag, Sprout, BrainCircuit } from 'lucide-react';
import { getCropEmoji } from '@/lib/cropEmoji';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function CropRegistration() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    cropType: 'Tomato',
    quantity: '',
    qualityGrade: 'A',
    harvestDate: '',
    gpsLat: 10.9252,
    gpsLng: 78.1198
  });
  
  const [loading, setLoading] = useState(false);
  const [recResult, setRecResult] = useState<any>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);

  // List of major Indian crops (50+ crops requirement)
  const indianCrops = [
    'Tomato', 'Onion', 'Banana', 'Rice', 'Turmeric', 'Chilli', 'Coconut', 
    'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Potato', 'Groundnut', 'Mustard', 
    'Garlic', 'Ginger', 'Coriander', 'Cumin', 'Black Pepper', 'Cardamom', 'Clove', 
    'Mango', 'Papaya', 'Grapes', 'Pomegranate', 'Guava', 'Cashewnut', 'Tea', 'Coffee', 
    'Jowar', 'Bajra', 'Ragi', 'Barley', 'Gram', 'Tur (Arhar)', 'Urad', 'Moong', 'Masur', 
    'Soyabean', 'Sunflower', 'Sesamum', 'Castor seed', 'Rubber', 'Tobacco', 'Jute', 
    'Apple', 'Orange', 'Lemon', 'Watermelon', 'Pineapple', 'Lady Finger', 'Cabbage', 
    'Cauliflower', 'Brinjal', 'Spinach'
  ];

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm(prev => ({
            ...prev,
            gpsLat: parseFloat(pos.coords.latitude.toFixed(6)),
            gpsLng: parseFloat(pos.coords.longitude.toFixed(6))
          }));
        },
        () => {
          // Fallback coords
          alert('GPS access denied. Using default Madurai coordinates.');
        }
      );
    } else {
      alert('Geolocation not supported by this browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.quantity || !form.harvestDate) {
      alert('Please fill out all fields.');
      return;
    }

    setLoading(true);
    setRecResult(null);
    setRequestId(null);
    try {
      const token = localStorage.getItem('smartag_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://smartag-api-1siv.onrender.com/api'}/farmer/crops`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          cropType: form.cropType,
          quantity: parseFloat(form.quantity),
          qualityGrade: form.qualityGrade,
          harvestDate: form.harvestDate,
          location: 'Madurai'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRecResult(data.recommendation);
        setRequestId(data.request?.id);
      } else {
        const data = await res.json();
        alert(data.error || 'Registration failed.');
      }
    } catch (e) {
      console.error(e);
      alert('Registration failed due to network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision: string) => {
    if (!requestId) return;
    setDecisionLoading(true);
    try {
      const token = localStorage.getItem('smartag_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://smartag-api-1siv.onrender.com/api'}/farmer/crops/${requestId}/decision`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ decision })
      });
      if (res.ok) {
        alert('Action Confirmed! Workflow updated.');
        router.push('/farmer/dashboard');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDecisionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-serif font-black text-green-900">
          Register Crop Harvest
        </h1>
        <p className="text-xs text-muted-foreground">
          Enter harvest quantity and dates to query prices and generate customized AI selling recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form panel */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Crop selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Crop Type</label>
              <select
                value={form.cropType}
                onChange={(e) => setForm(prev => ({ ...prev, cropType: e.target.value }))}
                className="w-full text-xs font-semibold bg-surface border border-border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800"
              >
                {indianCrops.map((c) => (
                  <option key={c} value={c} className="bg-background text-foreground">{getCropEmoji(c)} {c}</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Expected Quantity (kg)</label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={form.quantity}
                onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full text-xs font-semibold bg-surface border border-border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800"
              />
            </div>

            {/* Quality Grade */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Quality Grade</label>
              <div className="flex gap-2">
                {['A', 'B', 'C'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, qualityGrade: g }))}
                    className={`flex-1 py-2 text-xs font-bold border rounded-lg transition-colors ${form.qualityGrade === g ? 'bg-green-800 border-green-800 text-primary-foreground' : 'bg-surface border-border text-foreground hover:bg-muted'}`}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Harvest Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Expected Harvest Date</label>
              <input
                type="date"
                value={form.harvestDate}
                onChange={(e) => setForm(prev => ({ ...prev, harvestDate: e.target.value }))}
                className="w-full text-xs font-semibold bg-surface border border-border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800 text-foreground"
              />
            </div>

            {/* GPS coordinates */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Farm Coordinates</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`Lat: ${form.gpsLat}, Lng: ${form.gpsLng}`}
                  className="flex-1 text-xs font-semibold bg-muted border border-border p-2.5 rounded-lg text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  className="bg-green-800 text-primary-foreground px-3.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  title="Detect GPS Location"
                >
                  <Navigation className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-amber-400 hover:bg-amber-500 text-green-950 font-bold py-3 rounded-lg text-xs transition-colors mt-2"
            >
              {loading ? 'Processing Crop...' : 'Register Crop Harvest'}
            </button>
          </form>
        </div>

        {/* AI advisor recommendations display panel */}
        <div className="flex flex-col justify-start">
          {recResult ? (
            <div className="bg-card border border-amber-400/40 p-6 rounded-xl shadow-sm flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl" />
              
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <BrainCircuit className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-serif font-black text-foreground">Instant AI Assessment</h3>
                  <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider font-sans">
                    Confidence: {recResult.confidence}% • Risk: {recResult.risk}
                  </span>
                </div>
              </div>

              {/* Action columns comparison */}
              <div className="flex flex-col gap-3">
                
                {/* Winner Card */}
                <div className={`p-4.5 rounded-lg border-2 ${recResult.recommended === 'JOIN_FPO' ? 'border-amber-400 bg-amber-400/5' : 'border-border'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-foreground">Join FPO Group</span>
                    <span className="text-xs font-sans tabnum font-black text-green-800">₹{recResult.joinFPO}/kg</span>
                  </div>
                  <button disabled={decisionLoading} onClick={() => handleDecision('JOIN_COLLECTIVE')} className="w-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold py-1.5 text-[10px] rounded mb-1">
                    Select Collective Selling
                  </button>
                  <p className="text-[9px] text-muted-foreground mt-1">FPO offers transport discount, grading bonus.</p>
                </div>

                {/* Mandi options */}
                <div className={`p-4.5 rounded-lg border ${recResult.recommended === 'SELL_MANDI_LATER' ? 'border-amber-400 bg-amber-400/5' : 'border-border'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-foreground">Sell at Mandi Later</span>
                    <span className="text-xs font-sans tabnum font-black text-green-800">₹{recResult.sellLater}/kg</span>
                  </div>
                  <button disabled={decisionLoading} onClick={() => handleDecision('SELL_LATER')} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-1.5 text-[10px] rounded mb-1">
                    Select Scheduled Sale
                  </button>
                  <p className="text-[9px] text-muted-foreground mt-1">Requires cold storage fee (₹0.15/kg/day).</p>
                </div>

                <div className={`p-4.5 rounded-lg border ${recResult.recommended === 'SELL_MANDI_TODAY' ? 'border-amber-400 bg-amber-400/5' : 'border-border'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-foreground">Sell at Mandi Today</span>
                    <span className="text-xs font-sans tabnum font-black text-green-800">₹{recResult.sellToday}/kg</span>
                  </div>
                  <button disabled={decisionLoading} onClick={() => handleDecision('SELL_TODAY')} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-1.5 text-[10px] rounded mb-1">
                    Sell Immediately
                  </button>
                  <p className="text-[9px] text-muted-foreground mt-1">Mandi commission + transport fee applicable.</p>
                </div>

              </div>

              {/* Plain explanation */}
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-[11px] text-foreground leading-relaxed">
                  {recResult.explanation}
                </p>
              </div>

              <button
                onClick={() => router.push('/farmer/ai-advisor')}
                className="w-full bg-green-800 text-primary-foreground font-bold py-2 rounded-lg text-xs hover:bg-green-700 transition-colors"
              >
                Open Full AI Advisor comparison
              </button>
            </div>
          ) : (
            <div className="bg-card border border-border p-8 rounded-xl text-center flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <BrainCircuit className="w-10 h-10 text-muted-foreground/40" />
              <div>
                <h3 className="text-sm font-serif font-bold text-foreground">Awaiting registration</h3>
                <p className="text-[11px] leading-relaxed max-w-xs mx-auto mt-1">
                  Once you register a crop harvest, our Python AI pricing and routing engines will instantly calculate the best actions for you.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
