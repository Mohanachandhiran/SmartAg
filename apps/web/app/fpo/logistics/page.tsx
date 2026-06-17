'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Truck, Navigation, Calendar, Settings } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

const MapComponent = dynamic(() => import('@/components/maps/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[320px] bg-muted rounded-xl animate-pulse flex items-center justify-center text-xs">Loading OpenStreetMap map canvas...</div>
});

export default function Logistics() {
  const { t } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState('grp-1');

  const vehicles = [
    { type: 'Mahindra Bolero Pickup', capacity: '1.5 Tonnes', charge: '₹8/km', status: 'Allocated', assigned: 'Tomato Group A' },
    { type: 'Tata Ace (Chota Hathi)', capacity: '850 kg', charge: '₹6/km', status: 'Available', assigned: 'None' },
    { type: 'Eicher Pro Truck', capacity: '3.5 Tonnes', charge: '₹12/km', status: 'Allocated', assigned: 'Onion Aggregation B' }
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <Truck className="w-6 h-6 text-green-700" />
          Logistics Coordinator & Router
        </h1>
        <p className="text-xs text-muted-foreground">
          Allocate collection transport vehicles and visualize optimized farmer crop harvest routes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vehicles list table */}
        <div className="lg:col-span-2 bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-serif font-bold text-foreground">FPO Vehicle Fleet Status</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[9px] uppercase font-bold text-muted-foreground">
                  <th className="p-2.5">Vehicle Type</th>
                  <th className="p-2.5">Capacity</th>
                  <th className="p-2.5">Billing Rate</th>
                  <th className="p-2.5">Assignment</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-2.5 font-bold text-foreground">{v.type}</td>
                    <td className="p-2.5 text-muted-foreground font-semibold">{v.capacity}</td>
                    <td className="p-2.5 text-muted-foreground font-semibold">{v.charge}</td>
                    <td className="p-2.5 font-semibold text-green-800">{v.assigned}</td>
                    <td className="p-2.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${v.status === 'Available' ? 'bg-green-800/10 text-green-800' : 'bg-amber-400/15 text-amber-500'}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Calendar widget */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-1">
            <Calendar className="w-4 h-4 text-green-800" />
            Pickup Calendar
          </h3>
          <div className="flex flex-col gap-2.5">
            <div className="bg-surface p-3 rounded-lg border border-border flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-foreground block">🍅 Tomato Group A Collection</span>
                <span className="text-[10px] text-muted-foreground">Thursday, June 22 • 3 stops</span>
              </div>
              <span className="text-[9px] bg-green-800 text-primary-foreground font-bold px-1.5 py-0.5 rounded">08:00 AM</span>
            </div>
            <div className="bg-surface p-3 rounded-lg border border-border flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-foreground block">🧅 Onion Group B Collection</span>
                <span className="text-[10px] text-muted-foreground">Sunday, June 25 • 2 stops</span>
              </div>
              <span className="text-[9px] bg-green-800 text-primary-foreground font-bold px-1.5 py-0.5 rounded">09:30 AM</span>
            </div>
          </div>
        </div>

      </div>

      {/* Map route layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map display */}
        <div className="lg:col-span-2 h-[320px]">
          <MapComponent />
        </div>

        {/* Sidebar routing summary */}
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-serif font-bold text-foreground pb-2 border-b border-border flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-green-800 animate-pulse" />
              Route Details
            </h3>
            
            <div className="flex flex-col gap-2 mt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selected Batch:</span>
                <span className="font-bold text-green-800">🍅 Tomato Group A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stops Count:</span>
                <span className="font-bold text-foreground">3 farmer stops</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Optimized Distance:</span>
                <span className="font-bold text-foreground">15.4 km (Haversine optimal)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert('Dispatched optimized route map coordinates to driver app.')}
            className="w-full bg-green-800 text-primary-foreground py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors mt-6"
          >
            Dispatch Route GPS coordinates
          </button>
        </div>

      </div>

    </div>
  );
}
