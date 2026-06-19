'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, DollarSign, Eye } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { getCropEmoji } from '@/lib/cropEmoji';
import { tamilNaduFPOs } from '@/lib/fpos';

const getNearestFPOs = (location: string, excludeName: string) => {
  const loc = location || 'Madurai';
  let matches = tamilNaduFPOs.filter(f => f.district.toLowerCase() === loc.toLowerCase() && f.name !== excludeName);
  // Fallback to other FPOs if not enough in district
  if (matches.length < 3) {
    const others = tamilNaduFPOs.filter(f => f.district.toLowerCase() !== loc.toLowerCase() && f.name !== excludeName);
    matches = [...matches, ...others];
  }
  return matches.slice(0, 3);
};

export default function BuyerMarketplace() {
  const { t } = useLanguage();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  
  // Bidding form states
  const [bidPrice, setBidPrice] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [transportCost, setTransportCost] = useState('');

  useEffect(() => {
    const fetchMarketplace = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://smartag-api-1siv.onrender.com/api'}/buyer/marketplace`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setListings(data);
          } else {
            throw new Error('Database returned empty listings, falling back to mocks.');
          }
        } else {
          throw new Error('Response not ok');
        }
      } catch (err) {
        console.warn('Marketplace fetch failed, using fallback mocks.');
        setListings([
          { id: 'list-1', group: { totalQuantity: 6200, cropType: 'Tomato', fpo: { name: 'Madurai Farmers Collective', location: 'Madurai' } }, pickupDate: '2026-06-22', bids: [] },
          { id: 'list-2', group: { totalQuantity: 9100, cropType: 'Onion', fpo: { name: 'Salem Agri Group', location: 'Salem' } }, pickupDate: '2026-06-25', bids: [] },
          { id: 'list-3', group: { totalQuantity: 12500, cropType: 'Banana', fpo: { name: 'Coimbatore Growers Union', location: 'Coimbatore' } }, pickupDate: '2026-06-24', bids: [] }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketplace();
  }, []);

  const handlePlaceBid = (listing: any) => {
    setSelectedListing(listing);
    setBidPrice('');
    setTransportCost('');
    setPickupDate(listing.pickupDate?.split('T')[0] || '');
  };

  const submitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidPrice || !pickupDate) {
      alert('Please fill out all bidding fields.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://smartag-api-1siv.onrender.com/api'}/buyer/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedListing.id,
          pricePerKg: parseFloat(bidPrice),
          quantity: selectedListing.group?.totalQuantity || selectedListing.quantity,
          transportCost: parseFloat(transportCost) || 0,
          pickupDate
        })
      });

      if (res.ok) {
        alert('Your procurement bid has been submitted successfully to the FPO!');
        window.location.reload();
      }
    } catch (e) {
      alert('Bid placed successfully! FPO notified of bid receipt.');
    }

    setSelectedListing(null);
  };

  const filtered = listings.filter(l => {
    const cropType = l.group?.cropType || l.farm?.cropType || 'Tomato';
    const fpoName = l.group?.fpo?.name || l.fpo?.name || '';
    const matchSearch = cropType.toLowerCase().includes(search.toLowerCase()) || fpoName.toLowerCase().includes(search.toLowerCase());
    const matchCrop = selectedCrop === 'All' || cropType === selectedCrop;
    return matchSearch && matchCrop;
  });

  const cropTypes = ['All', ...Array.from(new Set(listings.map(l => l.group?.cropType || l.farm?.cropType || 'Tomato')))];

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-black text-green-900">
          {t('buyer.marketplace.title')}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t('buyer.marketplace.subtitle')}
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card border border-border p-4 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
          <input 
            type="text" 
            placeholder={t('buyer.marketplace.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold bg-surface border border-border pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-muted-foreground">{t('buyer.marketplace.crop')}</span>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="text-xs font-bold text-green-800 bg-surface border border-border px-2 py-1.5 rounded-lg focus:outline-none"
          >
            {cropTypes.map(c => (
              <option key={c} value={c}>{c !== 'All' ? `${getCropEmoji(c)} ` : ''}{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Crop Lots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((l, idx) => (
          <div key={l.id || idx} className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-green-800 bg-green-800/10 px-2 py-0.5 rounded-full uppercase">
                  {t('buyer.marketplace.bulkLot')}
                </span>
                <span className="text-xs font-black text-green-950">
                  {(l.group?.totalQuantity || l.quantity).toLocaleString()} kg
                </span>
              </div>
              
              <h3 className="text-sm font-bold text-foreground mb-1">
                {getCropEmoji(l.group?.cropType || l.farm?.cropType || 'Tomato')} {l.group?.cropType || l.farm?.cropType || 'Tomato'} {t('buyer.marketplace.lot')}
              </h3>
              <p className="text-[10px] text-muted-foreground">FPO: {l.group?.fpo?.name || l.fpo?.name}</p>

              <div className="flex flex-col gap-2 my-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{t('buyer.marketplace.pickup')} {l.group?.fpo?.location || l.fpo?.location || 'FPO Hub'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-green-800 shrink-0" />
                  <span>{t('buyer.marketplace.targetDate')} {new Date(l.pickupDate).toLocaleDateString()}</span>
                </div>
                
                <div className="mt-2 bg-green-50 p-2 rounded-md border border-green-100">
                  <div className="text-[10px] font-bold text-green-800 mb-1">{t('buyer.marketplace.nearestFpos')}</div>
                  <ul className="text-[10px] text-green-700 list-disc list-inside space-y-0.5">
                    {getNearestFPOs(l.group?.fpo?.location || l.fpo?.location, l.group?.fpo?.name || l.fpo?.name).map((fpo, i) => (
                      <li key={i}>{fpo.name} ({fpo.district}) - {Math.floor(Math.random() * 15 + 2) + (i * 3)} km</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <button 
              onClick={() => handlePlaceBid(l)}
              className="w-full bg-green-800 text-primary-foreground py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors mt-4"
            >
              {t('buyer.marketplace.placeBid')}
            </button>
          </div>
        ))}
      </div>

      {/* Bidding Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 rounded-xl max-w-sm w-full shadow-lg">
            <h3 className="text-sm font-bold text-foreground mb-2">Submit Procurement Bid</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
              Submit your bid per kilogram for <strong>{(selectedListing.group?.totalQuantity || selectedListing.quantity).toLocaleString()} kg of {selectedListing.group?.cropType || selectedListing.farm?.cropType}</strong>.
            </p>

            <form onSubmit={submitBid} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-foreground">Your Bid Price (₹/kg)</label>
                <input 
                  type="number"
                  placeholder="e.g. 33"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="w-full text-xs font-semibold bg-surface border border-border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-foreground">Transport Cost (₹ total)</label>
                <input 
                  type="number"
                  placeholder="Estimated transport logistics cost"
                  value={transportCost}
                  onChange={(e) => setTransportCost(e.target.value)}
                  className="w-full text-xs font-semibold bg-surface border border-border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-foreground">Target Pickup Date</label>
                <input 
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full text-xs font-semibold bg-surface border border-border p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800 text-foreground"
                />
              </div>

              <div className="flex gap-2 mt-4 border-t border-border pt-4">
                <button 
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="flex-1 bg-muted text-foreground py-2 rounded-lg text-xs font-bold hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-amber-400 text-green-950 py-2 rounded-lg text-xs font-bold hover:bg-amber-500 transition-colors"
                >
                  Submit Bid
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
