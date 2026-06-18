'use client';

import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, Flame, BadgeAlert, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { useLanguage } from '@/components/shared/LanguageContext';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/maps/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-muted animate-pulse rounded-xl flex items-center justify-center text-xs text-muted-foreground font-sans border border-border">
      Loading OpenStreetMap Leaflet layers...
    </div>
  )
});

export default function MarketIntelligence() {
  const { t } = useLanguage();
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [registeredCrops, setRegisteredCrops] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [sortBy, setSortBy] = useState('distance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sparkline historical mockup datasets for top crops
  const trendData = {
    Tomato: [
      { price: 18 }, { price: 19 }, { price: 21 }, { price: 20 }, { price: 23 }, { price: 22.5 }, { price: 24 }
    ],
    Onion: [
      { price: 25 }, { price: 26 }, { price: 25.5 }, { price: 27 }, { price: 28 }, { price: 29 }, { price: 28 }
    ],
    Banana: [
      { price: 34 }, { price: 35 }, { price: 33 }, { price: 36 }, { price: 35 }, { price: 37 }, { price: 36.5 }
    ],
    Rice: [
      { price: 44 }, { price: 44.5 }, { price: 45 }, { price: 45.2 }, { price: 45.8 }, { price: 45.6 }, { price: 46 }
    ],
    Turmeric: [
      { price: 105 }, { price: 108 }, { price: 107 }, { price: 110 }, { price: 112 }, { price: 115 }, { price: 114 }
    ]
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn('Geolocation error:', err)
      );
    }

    const fetchPrices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/market/prices`);
        if (res.ok) {
          const data = await res.json();
          setPrices(data);
        }
      } catch (err) {
        console.warn('Mandi price fetching failed, using fallback database seed records.');
        setPrices([
          { id: '1', mandiName: 'Madurai Mandi', crop: 'Tomato', price: 23.5, district: 'Madurai', distance: 8.4, lat: 9.9252, lng: 78.1198 },
          { id: '2', mandiName: 'Salem Mandi', crop: 'Onion', price: 28.2, district: 'Salem', distance: 15.2, lat: 11.6643, lng: 78.1460 },
          { id: '3', mandiName: 'Coimbatore Mandi', crop: 'Banana', price: 36.0, district: 'Coimbatore', distance: 22.1, lat: 11.0168, lng: 76.9558 },
          { id: '4', mandiName: 'Dindigul Mandi', crop: 'Tomato', price: 22.1, district: 'Dindigul', distance: 12.0, lat: 10.3673, lng: 77.9803 },
          { id: '5', mandiName: 'Oddanchatram Mandi', crop: 'Chilli', price: 142.0, district: 'Dindigul', distance: 28.5, lat: 10.4700, lng: 77.7550 },
          { id: '6', mandiName: 'Salem Mandi', crop: 'Turmeric', price: 112.5, district: 'Salem', distance: 16.0, lat: 11.6643, lng: 78.1460 },
          { id: '7', mandiName: 'Madurai Mandi', crop: 'Coconut', price: 19.1, district: 'Madurai', distance: 9.2, lat: 9.9252, lng: 78.1198 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    const fetchRegisteredCrops = async () => {
      try {
        const token = localStorage.getItem('smartag_token');
        const cRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/farmer/crops`, {
          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        });
        if (cRes.ok) {
          const cropsData = await cRes.json();
          if (cropsData.length > 0) {
            const uniqueCrops = Array.from(new Set(cropsData.map((c: any) => c.cropType.toLowerCase())));
            setRegisteredCrops(uniqueCrops as string[]);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch registered crops');
      }
    };

    fetchPrices();
    fetchRegisteredCrops();
  }, []);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const x = (lon2 * Math.PI / 180 - lon1 * Math.PI / 180) * Math.cos((lat1 + lat2) * Math.PI / 360);
    const y = (lat2 * Math.PI / 180 - lat1 * Math.PI / 180);
    return Math.sqrt(x * x + y * y) * R;
  };

  const processedPrices = prices.map(p => {
    let dist = p.distance || 10;
    if (userLocation && p.lat && p.lng) {
      dist = calculateDistance(userLocation.lat, userLocation.lng, p.lat, p.lng);
    }
    return { ...p, distance: dist };
  });

  const filteredPrices = processedPrices
    .filter(p => {
      const term = search.toLowerCase();
      const matchesSearch = p.crop.toLowerCase().includes(term) || p.mandiName.toLowerCase().includes(term);
      
      let matchesCrop = false;
      if (selectedCrop !== 'All') {
        matchesCrop = p.crop.toLowerCase() === selectedCrop.toLowerCase();
      } else if (registeredCrops.length > 0) {
        matchesCrop = registeredCrops.includes(p.crop.toLowerCase());
      } else {
        matchesCrop = true;
      }
      
      return matchesSearch && matchesCrop;
    })
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

  const mandiPoints = filteredPrices.map(p => ({
    id: p.id,
    name: p.mandiName,
    lat: p.lat,
    lng: p.lng,
    type: 'mandi',
    distance: p.distance
  })).filter(p => p.lat && p.lng);

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Top Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-700" />
          Market Intelligence
        </h1>
        <p className="text-xs text-muted-foreground">
          Compare real-time crop rates in nearby mandis and view AI recommendations for optimal selling days.
        </p>
      </div>

      {/* Interactive Map */}
      <div className="w-full h-[450px] relative z-0 mb-4 rounded-xl overflow-hidden shadow-sm border border-border">
        <MapComponent userLocation={userLocation} mandiPoints={mandiPoints} />
      </div>

      {/* Sparkline cards row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(trendData).map(([crop, points]) => {
          const latestPrice = points[points.length - 1].price;
          const prevPrice = points[0].price;
          const up = latestPrice >= prevPrice;

          return (
            <div key={crop} className="bg-card border border-border p-3 rounded-lg shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground font-bold">{crop}</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm font-bold text-foreground">₹{latestPrice}/kg</span>
                  <span className={`text-[9px] font-bold ${up ? 'text-green-600' : 'text-red-500'}`}>
                    {up ? '↑' : '↓'} {(((latestPrice - prevPrice) / prevPrice) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              {/* Micro sparkline */}
              <div className="h-8 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={points}>
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={up ? '#2D7A4F' : '#F5A623'} 
                      strokeWidth={1.5} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Table section */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        
        {/* Search controls */}
        <div className="p-4 bg-muted/30 border-b border-border flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search crop or mandi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-semibold bg-surface border border-border pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800"
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase hidden sm:block">Filter:</span>
            <select 
              value={selectedCrop} 
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="text-xs font-semibold bg-surface border border-border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800"
            >
              <option value="All">{registeredCrops.length > 0 ? "My Registered Crops" : "All Crops"}</option>
              <option value="Tomato">Tomato</option>
              <option value="Onion">Onion</option>
              <option value="Banana">Banana</option>
              <option value="Rice">Rice</option>
              <option value="Turmeric">Turmeric</option>
              <option value="Chilli">Chilli</option>
              <option value="Coconut">Coconut</option>
            </select>
          </div>
          
          <div className="flex gap-2 text-xs font-bold text-muted-foreground">
            <span>Click headers to sort</span>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                <th className="p-3">Mandi Name</th>
                <th className="p-3">Crop Name</th>
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort('price')}>
                  Price/Kg <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort('distance')}>
                  Distance <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="p-3">Best Day to Sell</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrices.map((p, idx) => {
                // Determine a mock recommendation tag for selling day
                const isTomato = p.crop.toLowerCase() === 'tomato';
                const tagText = isTomato ? 'Sell Day 7 (Hold)' : 'Sell Today';
                const badgeStyle = isTomato 
                  ? 'bg-amber-400/20 text-amber-600 border border-amber-400/40' 
                  : 'bg-green-800/10 text-green-800 border border-green-800/20';

                return (
                  <tr key={p.id || idx} className="border-b border-border text-xs hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-foreground">{p.mandiName}</div>
                      <span className="text-[10px] text-muted-foreground">{p.district}, Tamil Nadu</span>
                    </td>
                    <td className="p-3 font-semibold text-foreground">{p.crop}</td>
                    <td className="p-3 font-sans tabnum font-black text-green-950">₹{p.price}</td>
                    <td className="p-3 font-medium text-muted-foreground">
                      {p.distance ? `${p.distance.toFixed(1)} km` : '12.4 km'}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeStyle}`}>
                        {tagText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
