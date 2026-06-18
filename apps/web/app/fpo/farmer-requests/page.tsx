'use client';

import React, { useState, useEffect } from 'react';
import { Search, Inbox, Filter, UserCheck, Plus } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function FarmerRequests() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/fpo/farmer-requests`);
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } catch (err) {
        console.warn('Farmer requests fetch failed, loading fallback mocks.');
        setRequests([
          { id: '1', farmerName: 'Anbu Selvan', crop: 'Tomato', quantity: 1500, grade: 'A', harvestDate: '2026-06-20', distance: 8.4, aiMatchScore: 91 },
          { id: '2', farmerName: 'Karthik Raja', crop: 'Tomato', quantity: 1200, grade: 'B', harvestDate: '2026-06-21', distance: 10.1, aiMatchScore: 88 },
          { id: '3', farmerName: 'Ravi Chandran', crop: 'Onion', quantity: 2000, grade: 'A', harvestDate: '2026-06-22', distance: 15.2, aiMatchScore: 94 },
          { id: '4', farmerName: 'Senthil Kumar', crop: 'Onion', quantity: 1800, grade: 'B', harvestDate: '2026-06-23', distance: 14.0, aiMatchScore: 85 },
          { id: '5', farmerName: 'Ganesh Moorthy', crop: 'Banana', quantity: 3200, grade: 'A', harvestDate: '2026-06-25', distance: 22.4, aiMatchScore: 92 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAdd = (id: string) => {
    alert(`Request ${id} added to pooling list! Run AI Grouping to aggregate.`);
  };

  const filtered = requests.filter(r => {
    const matchSearch = r.farmerName.toLowerCase().includes(search.toLowerCase()) || r.crop.toLowerCase().includes(search.toLowerCase());
    const matchCrop = selectedCrop === 'All' || r.crop === selectedCrop;
    return matchSearch && matchCrop;
  });

  const uniqueCrops = ['All', ...Array.from(new Set(requests.map(r => r.crop)))];

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <Inbox className="w-6 h-6 text-green-700" />
          Incoming Farmer Requests
        </h1>
        <p className="text-xs text-muted-foreground">
          Review crop registrations from local farmers. Check AI match parameters and allocate to pooling logistics.
        </p>
      </div>

      {/* Table grid */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        
        {/* Filtering bar */}
        <div className="p-4 bg-muted/30 border-b border-border flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search farmer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-semibold bg-surface border border-border pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="text-xs font-bold text-green-800 bg-surface border border-border px-2 py-1.5 rounded-lg focus:outline-none"
            >
              {uniqueCrops.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[9px] uppercase font-bold text-muted-foreground">
                <th className="p-3">Farmer</th>
                <th className="p-3">Crop</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Harvest Date</th>
                <th className="p-3">Distance</th>
                <th className="p-3">AI Match Score</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id || idx} className="border-b border-border text-xs hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-bold text-foreground">{r.farmerName}</td>
                  <td className="p-3 font-semibold text-foreground">{r.crop}</td>
                  <td className="p-3 font-medium text-foreground">{r.quantity.toLocaleString()} kg</td>
                  <td className="p-3">
                    <span className="bg-muted text-foreground text-[10px] px-1.5 py-0.5 rounded font-bold">
                      Grade {r.grade}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(r.harvestDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-muted-foreground">{r.distance.toFixed(1)} km</td>
                  <td className="p-3 font-bold">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.aiMatchScore >= 90 ? 'bg-green-800/10 text-green-800' : 'bg-amber-400/15 text-amber-500'}`}>
                      {r.aiMatchScore}% Match
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => handleAdd(r.id)}
                      className="bg-green-800 text-primary-foreground hover:bg-green-700 transition-colors text-[10px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 ml-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to pool</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
