'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, TrendingUp, CloudSunRain, MapPin, Scale, Truck, CheckCircle2, 
  BarChart3, Sparkles, Building2, Store, ArrowRight
} from 'lucide-react';
import CropImage from '@/components/shared/CropImage';

export default function ProfitSimulator() {
  const [crop, setCrop] = useState('Tomato');
  const [quantity, setQuantity] = useState<number | ''>(2);
  const [location, setLocation] = useState('Madurai, Tamil Nadu');
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSimulate = () => {
    if (!quantity) return;
    setSimulating(true);
    setResults(null);
    
    // Simulate API delay and processing
    setTimeout(() => {
      setSimulating(false);
      // Example result based on user request
      // Sell Today: ₹28,000
      // Sell After 5 Days: ₹34,000
      // Sell Through FPO: ₹37,500
      setResults({
        crop,
        quantity,
        location,
        today: {
          price: 28000,
          details: 'Direct Mandi Sale',
          deductions: 'High transport & market fees'
        },
        later: {
          price: 34000,
          details: 'Forecasted 5-day spike',
          deductions: 'Moderate weather risk (Rain)'
        },
        fpo: {
          price: 37500,
          details: 'Collective FPO Selling',
          deductions: 'Subsidized transport, zero agent fees'
        },
        recommendation: 'fpo'
      });
    }, 2500);
  };

  const crops = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Rice'];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-950 to-green-900 rounded-2xl p-8 relative overflow-hidden shadow-xl border border-green-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-green-500 rounded-full blur-[80px] opacity-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 flex items-center justify-center border border-amber-400/30 backdrop-blur-md shadow-inner">
              <Calculator className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-black text-white tracking-tight flex items-center gap-3">
                AI Profit Simulator <Sparkles className="w-5 h-5 text-amber-400" />
              </h1>
              <p className="text-green-200 mt-2 text-sm max-w-lg leading-relaxed">
                Make data-driven decisions. Our AI analyzes Mandi prices, 5-day forecasts, transport costs, and weather risks to recommend your highest profit path.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-serif font-bold text-foreground mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-700" /> Simulation Parameters
            </h2>

            <div className="flex flex-col gap-5">
              {/* Crop Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Crop</label>
                <div className="grid grid-cols-3 gap-2">
                  {crops.slice(0, 3).map(c => (
                    <button
                      key={c}
                      onClick={() => setCrop(c)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${crop === c ? 'border-green-700 bg-green-900/5 text-green-900 shadow-sm' : 'border-border bg-surface text-muted-foreground hover:bg-muted'}`}
                    >
                      <CropImage cropName={c} size={24} />
                      <span className="text-[10px] font-bold mt-2">{c}</span>
                    </button>
                  ))}
                </div>
                <select 
                  className="mt-2 w-full bg-surface border border-border rounded-xl p-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-green-700/50"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                >
                  {crops.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" /> Quantity (Tons)
                </label>
                <input 
                  type="number" 
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-green-700/50"
                  placeholder="e.g. 2"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </label>
                <input 
                  type="text" 
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-green-700/50"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <button 
                onClick={handleSimulate}
                disabled={simulating || !quantity}
                className="w-full mt-4 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-green-950 font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2"
              >
                {simulating ? (
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {simulating ? 'Analyzing Data...' : 'Run Simulator'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Analysis */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Simulating State */}
          <AnimatePresence mode="wait">
            {simulating && (
              <motion.div 
                key="simulating"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/5 to-amber-500/5 animate-pulse" />
                
                <div className="relative z-10 flex flex-col items-center gap-8">
                  <div className="relative">
                    <motion.div 
                      className="absolute inset-0 rounded-full border-4 border-amber-400/30 border-t-amber-400"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center shadow-inner relative z-10 m-1">
                      <Sparkles className="w-10 h-10 text-amber-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-black text-foreground">AI is Crunching the Numbers</h3>
                    <div className="h-6 overflow-hidden">
                      <motion.div
                        animate={{ y: [0, -24, -48, -72, -96] }}
                        transition={{ duration: 2.5, times: [0, 0.25, 0.5, 0.75, 1] }}
                        className="flex flex-col items-center gap-2 text-sm font-semibold text-muted-foreground"
                      >
                        <span className="h-6 flex items-center">Fetching live Mandi prices...</span>
                        <span className="h-6 flex items-center">Analyzing 5-day weather risks...</span>
                        <span className="h-6 flex items-center">Calculating transport deductions...</span>
                        <span className="h-6 flex items-center">Evaluating FPO collective margins...</span>
                        <span className="h-6 flex items-center">Generating profit paths...</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Results State */}
            {results && !simulating && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
              >
                {/* Recommendation Banner */}
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-6 shadow-lg border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                      <CheckCircle2 className="w-8 h-8 text-green-950" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-green-950 uppercase tracking-widest opacity-80">Best Option</h3>
                      <p className="text-2xl font-serif font-black text-green-950">
                        FPO Collective Selling
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs font-bold text-green-950 opacity-80">Highest Profit</span>
                    <span className="text-3xl font-black text-green-950 tracking-tight">₹{results.fpo.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Comparison Cards */}
                <h3 className="text-lg font-serif font-bold text-foreground mt-2 px-2">Detailed Comparison</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Option 1: Sell Today */}
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col hover:border-green-700/30 transition-colors relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                        <Store className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-foreground">Sell Today</h4>
                    </div>
                    <div className="mb-4">
                      <span className="text-2xl font-black text-foreground">₹{results.today.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold block mt-1">Expected Return</span>
                    </div>
                    <div className="bg-surface rounded-xl p-3 text-xs flex flex-col gap-2 mt-auto">
                      <div className="flex items-start gap-2">
                        <Truck className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{results.today.deductions}</span>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Sell Later */}
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col hover:border-green-700/30 transition-colors relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-foreground">Sell After 5 Days</h4>
                    </div>
                    <div className="mb-4">
                      <span className="text-2xl font-black text-foreground">₹{results.later.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold block mt-1">Expected Return</span>
                    </div>
                    <div className="bg-surface rounded-xl p-3 text-xs flex flex-col gap-2 mt-auto">
                      <div className="flex items-start gap-2">
                        <CloudSunRain className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{results.later.deductions}</span>
                      </div>
                    </div>
                  </div>

                  {/* Option 3: FPO */}
                  <div className="bg-green-900/5 border-2 border-green-700 rounded-2xl p-5 shadow-sm flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-green-700 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                      Recommended
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-700 rounded-lg text-white">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-green-950">Through FPO</h4>
                    </div>
                    <div className="mb-4">
                      <span className="text-2xl font-black text-green-800">₹{results.fpo.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-green-700 font-semibold block mt-1">Maximum Return</span>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 text-xs flex flex-col gap-2 mt-auto backdrop-blur-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-green-900 font-medium">{results.fpo.deductions}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Call to action */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                  <div className="flex items-center gap-4">
                    <CropImage cropName={results.crop} size={48} />
                    <div>
                      <h4 className="font-bold text-foreground">Ready to maximize your profit?</h4>
                      <p className="text-xs text-muted-foreground mt-1">Join the ongoing {results.crop} collective pool in {results.location}.</p>
                    </div>
                  </div>
                  <button className="bg-green-800 hover:bg-green-900 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap flex items-center gap-2">
                    Join FPO Pool <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </motion.div>
            )}

            {/* Empty State */}
            {!results && !simulating && (
              <div className="bg-card border border-border rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                  <Calculator className="w-10 h-10 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground">Run a Simulation</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  Enter your crop details on the left and click "Run Simulator" to discover the most profitable selling strategy.
                </p>
              </div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
