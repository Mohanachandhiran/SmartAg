'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Truck, Navigation, Calendar, CloudLightning, Activity, AlertTriangle, ShieldCheck, MapPin, Search, ArrowRight, RefreshCw, BarChart2, Package } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

const MapComponent = dynamic(() => import('@/components/maps/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-muted rounded-xl animate-pulse flex items-center justify-center text-xs">Loading OpenStreetMap Canvas...</div>
});

export default function LogisticsRouter() {
  const { t } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState('TOM-TN-001');

  // 1. Vehicle Fleet Management
  const fleet = [
    { id: 'TN59AB1234', type: 'Mahindra Bolero', capacity: '1.5 Tons', location: 'FPO Warehouse', cost: '₹8/km', driver: 'Ramu', status: 'Available' },
    { id: 'TN59XY5678', type: 'Tata Ace', capacity: '850 Kg', location: 'Krishnagiri Hub', cost: '₹6/km', driver: 'Selvam', status: 'In Transit' },
    { id: 'TN66GH9876', type: 'Eicher Pro Truck', capacity: '3.5 Tons', location: 'Madurai Mandi', cost: '₹14/km', driver: 'Kumar', status: 'Allocated' },
  ];

  // 2. Pickup Calendar
  const schedule = [
    { date: '2026-06-20', group: 'Tomato Group A', time: '08:00 AM', center: 'Krishnagiri CC', vehicle: 'TN59AB1234', status: 'Confirmed' },
    { date: '2026-06-22', group: 'Onion Group B', time: '09:30 AM', center: 'Erode Aggregation', vehicle: 'TN66GH9876', status: 'Pending' },
    { date: '2026-06-25', group: 'Paddy Group C', time: '06:00 AM', center: 'Thanjavur Hub', vehicle: 'Pending AI', status: 'Delayed' },
  ];

  // 6. Logistics Analytics
  const analytics = {
    totalTrips: 142,
    avgCost: '₹1,240',
    utilization: '88%',
    avgDeliveryTime: '4.5 hrs',
    spoilagePrevented: '1,200 Kg',
    fuelConsumption: '3,540 L'
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <h1 className="text-3xl font-serif font-black text-green-900 flex items-center gap-3">
          <Truck className="w-8 h-8 text-green-700" />
          Logistics Router Module
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage transportation of grouped farmer produce from farms to collection centers and to buyers.
        </p>
      </div>

      {/* 6. Logistics Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Total Trips</span>
          <span className="text-xl font-serif font-black text-foreground">{analytics.totalTrips}</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Avg Cost/Trip</span>
          <span className="text-xl font-sans tabnum font-black text-blue-700">{analytics.avgCost}</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Vehicle Util%</span>
          <span className="text-xl font-sans tabnum font-black text-green-700">{analytics.utilization}</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Avg Delivery</span>
          <span className="text-xl font-sans tabnum font-black text-foreground">{analytics.avgDeliveryTime}</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Spoilage Prevented</span>
          <span className="text-xl font-sans tabnum font-black text-amber-600">{analytics.spoilagePrevented}</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Fuel Consumed</span>
          <span className="text-xl font-sans tabnum font-black text-foreground">{analytics.fuelConsumption}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map & Routes section (Occupies 8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* 3. Route Optimization Map & 4. Route Details */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border bg-surface flex justify-between items-center">
              <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
                <Navigation className="w-4 h-4 text-green-800" />
                Route Optimization Map
              </h3>
              <div className="text-xs font-bold bg-green-50 text-green-800 px-3 py-1 rounded border border-green-200">
                Selected Group: Tomato Group A (12,500 Kg)
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4">
              <div className="md:col-span-3 h-[400px]">
                <MapComponent />
              </div>
              <div className="p-4 bg-muted/20 flex flex-col gap-4 border-l border-border md:col-span-1 text-xs">
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase mb-1">Total Distance</span>
                  <span className="font-sans tabnum font-black text-base text-foreground">32.4 km</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase mb-1">Est. Travel Time</span>
                  <span className="font-sans tabnum font-black text-base text-blue-700">1h 15m</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase mb-1">Fuel Cost</span>
                  <span className="font-sans tabnum font-black text-base text-amber-600">₹320</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase mb-1">Toll Cost</span>
                  <span className="font-sans tabnum font-black text-base text-foreground">₹45</span>
                </div>
                <hr className="border-border my-2"/>
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase mb-1">Assigned Vehicle</span>
                  <span className="font-bold text-foreground">TN59AB1234 (Bolero)</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase mb-1">Farmers to Pickup</span>
                  <span className="font-bold text-foreground">3 Farmers</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Vehicle Fleet Management */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
              <Truck className="w-4 h-4 text-green-800" />
              Vehicle Fleet Management
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-[9px] uppercase font-bold text-muted-foreground">
                    <th className="p-3">Vehicle ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Capacity</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Cost/Km</th>
                    <th className="p-3">Driver</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fleet.map((v, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-foreground">{v.id}</td>
                      <td className="p-3 text-muted-foreground font-semibold">{v.type}</td>
                      <td className="p-3 text-muted-foreground font-semibold">{v.capacity}</td>
                      <td className="p-3 text-muted-foreground">{v.location}</td>
                      <td className="p-3 font-sans tabnum font-semibold">{v.cost}</td>
                      <td className="p-3 font-bold">{v.driver}</td>
                      <td className="p-3">
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                          v.status === 'Available' ? 'bg-green-100 text-green-800' : 
                          v.status === 'Allocated' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Side Panels section (Occupies 4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* 8. AI Logistics Recommendation */}
          <div className="bg-white border-2 border-amber-400 p-5 rounded-xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-400 text-green-950 text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
              <CloudLightning className="w-3 h-3" /> AI Engine
            </div>
            <h3 className="text-sm font-serif font-black text-amber-700 mb-4 flex items-center gap-2">
               AI Logistics Recommendation
            </h3>
            
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground font-bold uppercase text-[10px]">Recommended Vehicle</span>
                <span className="font-bold text-foreground">Mahindra Bolero</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground font-bold uppercase text-[10px]">Expected Cost</span>
                <span className="font-sans tabnum font-black text-foreground text-sm">₹1,450</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground font-bold uppercase text-[10px]">Alternative Route Saves</span>
                <span className="font-bold text-blue-700">12 km</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground font-bold uppercase text-[10px]">Fuel Savings</span>
                <span className="font-sans tabnum font-black text-green-700 text-sm">₹180</span>
              </div>
              
              <div className="mt-2 text-[10px] text-muted-foreground bg-amber-50 p-3 rounded border border-amber-200">
                <span className="font-bold text-amber-800 block mb-1">Best Pickup Sequence:</span>
                Farmer 1 → Farmer 3 → Farmer 2 → Krishnagiri Collection Center
              </div>
              
              <button className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded transition-colors shadow">
                Apply AI Plan
              </button>
            </div>
          </div>

          {/* 7. Weather Impact Panel */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
              <CloudLightning className="w-4 h-4 text-red-600" />
              Weather & Risk Panel
            </h3>
            <div className="flex flex-col gap-3">
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-red-800 block">Rain Alert (Krishnagiri)</span>
                  <span className="text-red-600/80 mt-1 block">Heavy rainfall expected near Hub B. Alternate route suggested via NH-44 to avoid mud roads.</span>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs flex items-start gap-3">
                <Activity className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-800 block">Traffic Congestion</span>
                  <span className="text-amber-700/80 mt-1 block">Toll gate delay +15 mins.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Crop Movement Tracker */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-green-800" />
              Live Crop Movement Tracker
            </h3>
            <div className="pl-4 border-l-2 border-green-200 flex flex-col gap-5 py-2">
              <div className="relative">
                <div className="absolute -left-[21px] top-0.5 w-3 h-3 bg-green-600 rounded-full ring-4 ring-green-100" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Step 1</span>
                <span className="text-xs font-bold text-foreground">Collected</span>
                <span className="text-[10px] text-muted-foreground block">From 3 Farms</span>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-0.5 w-3 h-3 bg-green-600 rounded-full ring-4 ring-green-100" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Step 2</span>
                <span className="text-xs font-bold text-foreground">Loaded</span>
                <span className="text-[10px] text-muted-foreground block">At Krishnagiri Collection Center</span>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-0.5 w-3 h-3 bg-amber-500 rounded-full ring-4 ring-amber-100 animate-pulse" />
                <span className="text-[10px] text-amber-600 font-bold uppercase block mb-1">Step 3 (Current)</span>
                <span className="text-xs font-bold text-foreground">In Transit</span>
                <span className="text-[10px] text-muted-foreground block">To FPO Warehouse (14km remaining)</span>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-0.5 w-3 h-3 bg-muted rounded-full" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Step 4</span>
                <span className="text-xs font-bold text-muted-foreground">Delivered</span>
                <span className="text-[10px] text-muted-foreground block">To Buyer (Pending)</span>
              </div>
            </div>
          </div>

          {/* 2. Pickup Calendar */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-800" />
              Upcoming Pickup Calendar
            </h3>
            <div className="flex flex-col gap-3">
              {schedule.map((item, idx) => (
                <div key={idx} className="bg-surface p-3 rounded-lg border border-border flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-foreground block">{item.group}</span>
                      <span className="text-[10px] text-muted-foreground">{item.date} @ {item.time}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      item.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      item.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-t border-border pt-2 mt-1">
                    <div className="flex flex-col">
                       <span className="text-[9px] text-muted-foreground uppercase">Center</span>
                       <span className="text-[10px] font-bold">{item.center}</span>
                    </div>
                    <div className="flex flex-col text-right">
                       <span className="text-[9px] text-muted-foreground uppercase">Vehicle</span>
                       <span className="text-[10px] font-bold font-mono">{item.vehicle}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
