'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { FileText, CheckCircle, ChevronRight, Calculator, IndianRupee, X } from 'lucide-react';

export default function SchemeFinderWizard({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    state: 'Tamil Nadu',
    district: '',
    village: '',
    language: language,
    landOwnership: 'Own Land',
    landArea: '',
    farmerCategory: 'Small Farmer',
    primaryCrop: '',
    secondaryCrop: '',
    irrigationType: 'Rainfed',
    annualIncome: '',
    needTractor: 'No',
    needMachinery: 'No',
    needIrrigation: 'No',
    needSolar: 'No',
    needLoan: 'Yes',
    needInsurance: 'Yes'
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setStep(5); // Loading state
    try {
      const token = localStorage.getItem('smartag_token');
      // Ensure we explicitly pass the UI language to the AI
      const payload = { ...formData, language: language };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://smartag-api-1siv.onrender.com/api'}/ai/scheme-advisor`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResults(data);
      setStep(6); // Results state
    } catch (err) {
      console.error(err);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-border my-auto">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif font-black">{t('schemes.title')}</h2>
            <p className="text-emerald-100 text-xs mt-1">{t('schemes.subtitle')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-emerald-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Content */}
        <div className="p-6 sm:p-8">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-foreground mb-4">{t('schemes.personalDetails')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('schemes.name')}</label>
                  <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full mt-1 p-2.5 bg-surface border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('schemes.state')}</label>
                  <input type="text" value={formData.state} onChange={e => handleChange('state', e.target.value)} className="w-full mt-1 p-2.5 bg-surface border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('schemes.district')}</label>
                  <input type="text" value={formData.district} onChange={e => handleChange('district', e.target.value)} className="w-full mt-1 p-2.5 bg-surface border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('schemes.village')}</label>
                  <input type="text" value={formData.village} onChange={e => handleChange('village', e.target.value)} className="w-full mt-1 p-2.5 bg-surface border border-border rounded-lg text-sm" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-foreground mb-4">{t('schemes.farmDetails')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('schemes.landOwnership')}</label>
                  <select value={formData.landOwnership} onChange={e => handleChange('landOwnership', e.target.value)} className="w-full mt-1 p-2.5 bg-surface border border-border rounded-lg text-sm">
                    <option>{t('schemes.ownLand')}</option>
                    <option>{t('schemes.leaseLand')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('schemes.landArea')}</label>
                  <input type="text" value={formData.landArea} onChange={e => handleChange('landArea', e.target.value)} className="w-full mt-1 p-2.5 bg-surface border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('schemes.farmerCategory')}</label>
                  <select value={formData.farmerCategory} onChange={e => handleChange('farmerCategory', e.target.value)} className="w-full mt-1 p-2.5 bg-surface border border-border rounded-lg text-sm">
                    <option>{t('schemes.marginal')}</option>
                    <option>{t('schemes.small')}</option>
                    <option>{t('schemes.medium')}</option>
                    <option>{t('schemes.large')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-foreground mb-4">{t('schemes.cropDetails')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('schemes.primaryCrop')}</label>
                  <input type="text" value={formData.primaryCrop} onChange={e => handleChange('primaryCrop', e.target.value)} className="w-full mt-1 p-2.5 bg-surface border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('schemes.secondaryCrop')}</label>
                  <input type="text" value={formData.secondaryCrop} onChange={e => handleChange('secondaryCrop', e.target.value)} className="w-full mt-1 p-2.5 bg-surface border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('schemes.irrigationType')}</label>
                  <select value={formData.irrigationType} onChange={e => handleChange('irrigationType', e.target.value)} className="w-full mt-1 p-2.5 bg-surface border border-border rounded-lg text-sm">
                    <option>{t('schemes.rainfed')}</option>
                    <option>{t('schemes.canal')}</option>
                    <option>{t('schemes.borewell')}</option>
                    <option>{t('schemes.drip')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('schemes.annualIncome')}</label>
                  <input type="text" value={formData.annualIncome} onChange={e => handleChange('annualIncome', e.target.value)} className="w-full mt-1 p-2.5 bg-surface border border-border rounded-lg text-sm" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-foreground mb-4">{t('schemes.infrastructure')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['needTractor', 'needMachinery', 'needIrrigation', 'needSolar', 'needLoan', 'needInsurance'].map((f) => (
                  <div key={f}>
                    <label className="text-xs font-bold text-slate-500 uppercase">{t(`schemes.${f}`)}</label>
                    <select value={(formData as any)[f]} onChange={e => handleChange(f, e.target.value)} className="w-full mt-1 p-2.5 bg-surface border border-border rounded-lg text-sm">
                      <option value="Yes">{t('schemes.yes')}</option>
                      <option value="No">{t('schemes.no')}</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
              <p className="text-lg font-bold text-emerald-800 animate-pulse">{t('schemes.analyzing')}</p>
            </div>
          )}

          {step === 6 && results && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Benefits Calculator */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 flex flex-col items-center text-center">
                  <Calculator className="w-8 h-8 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-emerald-700 uppercase">{t('schemes.benefitsCalculator')}</span>
                  <span className="text-3xl font-black text-emerald-900 mt-1">₹{results.totalBenefitsValue?.toLocaleString('en-IN') || 0}</span>
                  <span className="text-xs text-emerald-600">{t('schemes.totalBenefits')}</span>
                </div>
                <div className="w-full md:w-px h-px md:h-20 bg-emerald-200" />
                <div className="flex-[2] grid grid-cols-2 gap-4 w-full">
                  <div className="bg-white/60 p-3 rounded-lg text-center">
                    <span className="text-[10px] text-emerald-700 uppercase font-bold block">{t('schemes.annualSupport')}</span>
                    <span className="text-lg font-black text-emerald-900">₹{results.annualSupportValue?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg text-center">
                    <span className="text-[10px] text-emerald-700 uppercase font-bold block">{t('schemes.subsidyEligibility')}</span>
                    <span className="text-lg font-black text-emerald-900">₹{results.subsidyEligibilityValue?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg text-center col-span-2">
                    <span className="text-[10px] text-emerald-700 uppercase font-bold block">{t('schemes.loanEligibility')}</span>
                    <span className="text-lg font-black text-emerald-900">₹{results.loanEligibilityValue?.toLocaleString('en-IN') || 0}</span>
                  </div>
                </div>
              </div>

              {/* AI Advisor Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                <h4 className="text-sm font-black text-blue-900 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  {t('schemes.aiAdvisor')}
                </h4>
                <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                  {results.aiExplanation}
                </p>
              </div>

              {/* Scheme List */}
              <div className="flex flex-col gap-4">
                {results.schemes?.map((s: any, idx: number) => (
                  <div key={idx} className="border border-border rounded-xl p-4 bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-foreground">{s.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{s.matchReason}</p>
                      <div className="flex flex-wrap gap-1">
                        {s.documents?.map((d: string, dIdx: number) => (
                          <span key={dIdx} className="text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">{d}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2 min-w-[120px]">
                      <span className="text-sm font-black text-emerald-700">{s.benefitAmount}</span>
                      <a href={s.link || "#"} target="_blank" rel="noreferrer" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-4 rounded-lg transition-colors flex items-center gap-1">
                        {t('schemes.applyNow')} <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        {step < 5 && (
          <div className="border-t border-border p-5 bg-surface flex justify-between items-center">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                {t('schemes.back')}
              </button>
            ) : <div />}
            
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} className="bg-slate-900 text-white text-sm font-bold py-2.5 px-6 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
                {t('schemes.next')} <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 text-white text-sm font-bold py-2.5 px-6 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
                {t('schemes.submit')}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
