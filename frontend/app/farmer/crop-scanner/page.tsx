import React from 'react';
import CropHealthScanner from '@/components/scanner/CropHealthScanner';

export const metadata = {
  title: 'Crop Health Scanner - Farmer Portal',
  description: 'AI-Powered Crop Health Scanner for Farmers',
};

export default function CropScannerPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Crop Health Scanner</h1>
        <p className="text-slate-600">
          Upload an image of your crop to instantly identify diseases and get AI-powered treatment recommendations.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <CropHealthScanner />
      </div>
    </div>
  );
}
