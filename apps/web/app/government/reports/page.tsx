'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Download, FileText, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function ReportsGenerator() {
  const { t } = useLanguage();
  const [district, setDistrict] = useState('Madurai');
  const [crop, setCrop] = useState('Tomato');
  const [reportType, setReportType] = useState('Market Volume');
  const [preview, setPreview] = useState(false);

  const districtsList = ['Madurai', 'Salem', 'Coimbatore', 'Dindigul'];
  const cropsList = ['Tomato', 'Onion', 'Banana', 'Rice', 'Turmeric', 'Chilli', 'Coconut'];
  const reportTypes = ['Market Volume', 'Price Stability Log', 'FPO Performance Summary', 'Risk Matrix analysis'];

  const handleGenerate = () => {
    setPreview(true);
  };

  const handleExport = () => {
    alert(`Exporting high-fidelity PDF report for ${district} - ${crop} (${reportType}) using pdfmake.`);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-green-700" />
          Intervention Report Generator
        </h1>
        <p className="text-xs text-muted-foreground">
          Generate, preview, and download administrative PDF reports scoping district volume logs and price indices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form controls */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm h-fit flex flex-col gap-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Report Parameters</h3>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-foreground">Select District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full text-xs font-semibold bg-surface border border-border p-2 rounded-lg focus:outline-none"
            >
              {districtsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-foreground">Select Crop Type</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full text-xs font-semibold bg-surface border border-border p-2 rounded-lg focus:outline-none"
            >
              {cropsList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-foreground">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full text-xs font-semibold bg-surface border border-border p-2 rounded-lg focus:outline-none"
            >
              {reportTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            className="w-full bg-green-800 text-primary-foreground py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors mt-2"
          >
            Generate Preview
          </button>
        </div>

        {/* Preview layout */}
        <div className="md:col-span-2 flex flex-col gap-4">
          
          <h3 className="text-sm font-serif font-bold text-foreground">Report Document Preview</h3>
          
          {preview ? (
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col gap-4 relative">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-800" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{reportType} Report</h4>
                    <span className="text-[9px] text-muted-foreground">District: {district} • Filter: {crop}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleExport}
                  className="bg-amber-400 hover:bg-amber-500 text-green-950 px-3 py-1.5 rounded text-[10px] font-bold transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>

              {/* Document details mockup */}
              <div className="flex flex-col gap-2.5 text-[11px] leading-relaxed text-muted-foreground font-sans">
                <p>
                  <strong>1. Introduction Summary:</strong> This administrative crop log outlines procurement values and price stability coefficients for <strong>{crop}</strong> transacted under registered FPOs in <strong>{district} district</strong>.
                </p>
                <p>
                  <strong>2. Metrics ledger:</strong> Total volume transacted is logged at 15.4 Tonnes. The Mandi price average stands at ₹25.4/kg, compared with direct FPO contracts yielding ₹31.0/kg.
                </p>
                <p>
                  <strong>3. Stabilizing Guidelines:</strong> Crop price indices show a stability index of 88%. No price collapse warning is active in this district. Logistics routes stand optimized.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border p-12 text-center rounded-xl text-xs text-muted-foreground flex flex-col items-center justify-center h-full gap-2">
              <FileSpreadsheet className="w-8 h-8 text-muted-foreground/35" />
              <span>Select parameters and click 'Generate Preview' to load report.</span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
