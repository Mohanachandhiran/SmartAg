'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sprout, Users, ShoppingBag, Landmark, ArrowRight, Shield, TrendingUp, CloudSun, Target, FileText } from 'lucide-react';
import CropHealthScanner from '@/components/scanner/CropHealthScanner';
import SchemeFinderWizard from '@/components/schemes/SchemeFinderWizard';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isSchemeFinderOpen, setIsSchemeFinderOpen] = useState(false);

  const features = [
    {
      title: t('home.capabilities.f1Title'),
      desc: t('home.capabilities.f1Desc'),
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />
    },
    {
      title: t('home.capabilities.f2Title'),
      desc: t('home.capabilities.f2Desc'),
      icon: <CloudSun className="w-6 h-6 text-amber-500" />
    },
    {
      title: t('home.capabilities.f3Title'),
      desc: t('home.capabilities.f3Desc'),
      icon: <Users className="w-6 h-6 text-blue-500" />
    },
    {
      title: t('home.capabilities.f4Title'),
      desc: t('home.capabilities.f4Desc'),
      icon: <Landmark className="w-6 h-6 text-purple-600" />
    }
  ];

  return (
    <div className="flex flex-col flex-1 overflow-x-hidden bg-transparent">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 px-6 lg:px-12 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12">
        
        {/* Background gradient effects */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] opacity-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Left Side: Content */}
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="bg-card/70 backdrop-blur-md p-8 rounded-[2rem] shadow-sm border border-border inline-block max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-semibold mb-8">
              <Sprout className="w-4 h-4" />
              <span>{t('home.hero.welcome')}</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-foreground mb-6 leading-[1.1]">
              {t('home.hero.title1')} <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{t('home.hero.title2')}</span><br className="hidden lg:block"/>
              {t('home.hero.title3')}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-10 mx-auto lg:mx-0 leading-relaxed">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-2">
              <button 
                onClick={() => router.push('/auth/login?role=farmer')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
              >
                {t('home.hero.farmerLogin')} <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => router.push('/auth/login?role=fpo')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2"
              >
                {t('home.hero.fpoLogin')} <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => router.push('/auth/login?role=buyer')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
              >
                {t('home.hero.buyerLogin')} <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => router.push('/auth/login?role=government')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2"
              >
                {t('home.hero.govLogin')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
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

      {/* Government Scheme Finder Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full relative z-20">
        <div className="bg-gradient-to-r from-emerald-800 to-green-900 rounded-3xl p-8 lg:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-700/50">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-4">
              <Shield className="w-4 h-4" />
              <span>Government Benefits</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
              {t ? t('schemes.title') : 'Government Scheme Finder'}
            </h2>
            <p className="text-emerald-100/90 text-lg max-w-xl">
              {t ? t('schemes.subtitle') : 'Discover subsidies, loans, and benefits you are eligible for instantly using our AI analyzer.'}
            </p>
          </div>
          <div className="shrink-0">
            <button 
              onClick={() => setIsSchemeFinderOpen(true)}
              className="bg-amber-400 hover:bg-amber-500 text-green-950 px-8 py-4 rounded-xl font-black shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 text-lg hover:scale-105 active:scale-95"
            >
              <FileText className="w-6 h-6" />
              {t ? t('schemes.checkNow') : 'Check Government Schemes'}
            </button>
          </div>
        </div>
        
        <SchemeFinderWizard 
          isOpen={isSchemeFinderOpen} 
          onClose={() => setIsSchemeFinderOpen(false)} 
        />
      </section>

      {/* Disease Scanner Section (No Login Required) */}
      <section className="bg-card/50 py-24 px-6 border-y border-border backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-card/70 backdrop-blur-md px-8 py-6 rounded-3xl border border-border">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t('home.healthScanner.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('home.healthScanner.desc')}
              </p>
            </div>
          </div>
          
          <CropHealthScanner />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <div className="inline-block bg-card/70 backdrop-blur-md px-8 py-6 rounded-3xl border border-border">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t('home.capabilities.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('home.capabilities.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, idx) => (
            <div key={idx} className="bg-card/80 backdrop-blur p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-muted w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer Trust Banner */}
      <footer className="border-t border-border py-8 text-center text-muted-foreground text-sm backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Secured via Role-Based Access Control. Multi-language support enabled.</span>
        </div>
      </footer>
    </div>
  );
}
