'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sprout, Users, ShoppingBag, Landmark, ArrowRight, Shield, TrendingUp, CloudSun, Target } from 'lucide-react';
import CropHealthScanner from '@/components/scanner/CropHealthScanner';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      title: 'Mandi Intelligence',
      desc: 'Real-time spot prices across regional mandis with predictive trend analysis.',
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />
    },
    {
      title: 'Weather Forecasting',
      desc: 'Hyper-local 7-day weather risk assessment tailored for your specific crop.',
      icon: <CloudSun className="w-6 h-6 text-amber-500" />
    },
    {
      title: 'Collective Selling',
      desc: 'Smart grouping engine connects farmers to FPOs for maximized bargaining power.',
      icon: <Users className="w-6 h-6 text-blue-500" />
    },
    {
      title: 'Government Command Center',
      desc: 'Statewide crop indices, supply chain mapping, and price stability monitoring.',
      icon: <Landmark className="w-6 h-6 text-purple-600" />
    }
  ];

  return (
    <div className="flex flex-col flex-1 bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 px-6 lg:px-12 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12">
        
        {/* Background gradient effects */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] opacity-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Left Side: Content */}
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-semibold mb-8">
            <Sprout className="w-4 h-4" />
            <span>Welcome to SmartAgOps</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
            AI-Powered <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Agricultural</span><br className="hidden lg:block"/>
            Intelligence Platform
          </h1>
          
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Helping farmers, FPOs, buyers, and governments make profitable decisions using real-time market intelligence, weather forecasts, and AI recommendations.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button 
              onClick={() => router.push('/auth/login?role=farmer')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
            >
              Farmer Login <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => router.push('/auth/login?role=fpo')}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2"
            >
              FPO Login <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => router.push('/auth/login?role=buyer')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
            >
              Buyer Login <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => router.push('/auth/login?role=government')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2"
            >
              Govt Login <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Illustration */}
        <div className="flex-1 relative z-10 w-full max-w-2xl">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-green-900/10 border border-slate-200/50 bg-white">
            <img 
              src="/images/agritech_background.png" 
              alt="SmartAgOps AI Platform" 
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Floating Cards (Simulated via CSS) */}
          <div className="absolute -left-8 top-12 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce-slow">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">AI Recommendation</p>
              <p className="text-sm font-bold text-slate-900">Sell via FPO</p>
            </div>
          </div>
        </div>
      </section>

      {/* Disease Scanner Section (No Login Required) */}
      <section className="bg-slate-50 py-24 px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Instant Crop Health Diagnosis</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Worried about a diseased leaf? Use our TensorFlow-powered Crop Health Scanner to get an instant diagnosis, treatment plan, and cost estimate without creating an account.
            </p>
          </div>
          
          <CropHealthScanner />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Platform Capabilities</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Everything you need to modernize agricultural supply chains and maximize farmer income.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-slate-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer Trust Banner */}
      <footer className="border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Secured via Role-Based Access Control. Multi-language support enabled.</span>
        </div>
      </footer>
    </div>
  );
}
