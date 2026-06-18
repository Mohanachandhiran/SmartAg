'use client';

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Truck, CreditCard, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function CollectiveSelling() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [joinedGroups, setJoinedGroups] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('smartag_token');
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const [groupsRes, cropsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/fpo/groups`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/farmer/crops`, { headers })
        ]);

        if (groupsRes.ok) {
          const data = await groupsRes.json();
          setGroups(data);
        } else {
          throw new Error('Groups fetch failed');
        }

        if (cropsRes.ok) {
          const cropsData = await cropsRes.json();
          // Filter crops that are in collective selling flow
          const collectiveRequests = cropsData.filter((c: any) => 
            ['WAITING_FOR_FPO', 'FPO_ASSIGNED', 'SOLD', 'PAID'].includes(c.status)
          );
          
          const mappedGroups = collectiveRequests.map((c: any) => {
            const hasGroup = !!c.group;
            let displayStatus = 'Pending';
            
            if (c.status === 'FPO_ASSIGNED') displayStatus = 'Approved';
            if (c.status === 'SOLD') displayStatus = 'In Transit';
            if (c.status === 'PAID') displayStatus = 'Paid';

            return {
              id: c.id,
              groupName: hasGroup 
                ? `${c.group.groupName} (FPO: ${c.group.fpo?.name || 'Unknown'})` 
                : `${c.cropType} - Awaiting FPO Assignment`,
              cropType: c.cropType,
              quantity: c.quantity,
              expectedPrice: hasGroup ? (c.group.expectedPrice || 25) : 25,
              status: displayStatus,
              realStatus: c.status
            };
          });
          setJoinedGroups(mappedGroups);
        }

      } catch (err) {
        console.warn('Fetch failed. Using fallback mocks.');
        setGroups([
          { id: '1', groupName: 'Tomato Collective Group A', cropType: 'Tomato', totalQuantity: 6200, collectionDate: '2026-06-22', expectedPrice: 27.2, status: 'ACTIVE' },
          { id: '2', groupName: 'Onion Aggregation Salem B', cropType: 'Onion', totalQuantity: 9100, collectionDate: '2026-06-26', expectedPrice: 34.0, status: 'ACTIVE' },
          { id: '3', groupName: 'Banana Export Batch C', cropType: 'Banana', totalQuantity: 12500, collectionDate: '2026-06-24', expectedPrice: 42.5, status: 'ACTIVE' }
        ]);
        setJoinedGroups([
          {
            id: 'GRP-TOM-001',
            groupName: 'Tomato Collective Group A (FPO: Madurai Collective)',
            cropType: 'Tomato',
            quantity: 1500,
            expectedPrice: 27.2,
            status: 'Approved'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleJoinGroup = (group: any) => {
    setSelectedGroup(group);
  };

  const confirmJoin = async () => {
    if (!selectedGroup) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/farmer/collective-selling/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroup.id,
          farmId: 'mock-farm-1' // assume primary farm
        })
      });
      if (res.ok) {
        alert('Joined FPO collective group successfully!');
      }
    } catch (e) {
      // Local addition
      setJoinedGroups(prev => [
        ...prev,
        {
          id: selectedGroup.id || 'GRP-MOCK-02',
          groupName: selectedGroup.groupName,
          cropType: selectedGroup.cropType,
          totalQuantity: selectedGroup.totalQuantity + 1500,
          expectedPrice: selectedGroup.expectedPrice,
          collectionDate: selectedGroup.collectionDate,
          status: 'Pending'
        }
      ]);
    }
    
    setSelectedGroup(null);
    setActiveTab('active');
  };

  // Status mapping tracker
  const renderStatusTracker = (status: string) => {
    const steps = ['Pending', 'Approved', 'In Transit', 'Paid'];
    const currentIdx = steps.findIndex(s => s.toLowerCase() === status.toLowerCase());

    return (
      <div className="flex items-center gap-2 mt-4">
        {steps.map((step, idx) => {
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? 'bg-green-800 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {idx + 1}
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${active ? 'text-green-800' : 'text-muted-foreground'}`}>{step}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 rounded ${idx < currentIdx ? 'bg-green-800' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  if (loading) return <div className="text-center p-12 text-xs text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Top Navigation */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-green-700" />
          FPO Collective Selling
        </h1>
        <p className="text-xs text-muted-foreground">
          Sell collaboratively in pooled lots to wholesale buyers. Maximize returns and save on transport costs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6">
        <button 
          onClick={() => setActiveTab('available')}
          className={`pb-2 text-xs font-bold transition-all relative ${activeTab === 'available' ? 'text-green-800 font-black' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {activeTab === 'available' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-800" />}
          Available FPO Groups
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`pb-2 text-xs font-bold transition-all relative ${activeTab === 'active' ? 'text-green-800 font-black' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {activeTab === 'active' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-800" />}
          My Active Groups
        </button>
      </div>

      {/* Main tab grids */}
      {activeTab === 'available' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g, idx) => (
            <div key={g.id || idx} className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-600 font-sans block uppercase tracking-wider">
                  Group ID: {g.groupId || `GRP-00${g.id}`}
                </span>
                <h3 className="text-sm font-serif font-black text-green-950 mt-1">{g.groupName}</h3>
                
                <div className="flex gap-4 my-4 border-y border-border py-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Crop Type</span>
                    <span className="font-bold text-foreground">{g.cropType}</span>
                  </div>
                  <div className="border-r border-border" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Pooled Volume</span>
                    <span className="font-bold text-foreground">{g.totalQuantity} kg</span>
                  </div>
                  <div className="border-r border-border" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Expected Price</span>
                    <span className="font-bold text-green-800">₹{g.expectedPrice}/kg</span>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground">
                  Collection Target Date: <strong>{new Date(g.collectionDate).toLocaleDateString()}</strong>
                </div>
              </div>

              <button 
                onClick={() => handleJoinGroup(g)}
                className="w-full bg-green-800 text-primary-foreground py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors mt-5"
              >
                Join FPO Collective
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {joinedGroups.length === 0 ? (
            <div className="text-center p-12 bg-card border border-border rounded-xl shadow-sm">
              <p className="text-sm font-bold text-muted-foreground mb-2">No active collective selling requests found.</p>
              <p className="text-xs text-muted-foreground">Register your crops and join an FPO group to see them here.</p>
            </div>
          ) : (
            joinedGroups.map((g, idx) => (
              <div key={g.id || idx} className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border pb-3">
                  <div>
                    <span className={`text-[9px] font-bold font-sans px-1.5 py-0.5 rounded uppercase ${g.status === 'Pending' ? 'bg-amber-400/20 text-amber-600' : 'bg-green-800/10 text-green-800'}`}>
                      Status: {g.status}
                    </span>
                    <h3 className="text-sm font-serif font-bold text-foreground mt-1">{g.groupName}</h3>
                    <span className="text-[10px] text-muted-foreground block mt-1">Your registered volume: {g.quantity} kg of {g.cropType}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">Estimated Return</span>
                    <span className="text-sm font-serif font-black text-green-800">
                      ₹{(g.expectedPrice * g.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                
                {/* Render dynamic tracker progress */}
                {renderStatusTracker(g.status)}
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 rounded-xl max-w-sm w-full shadow-lg flex flex-col gap-4">
            <h3 className="text-sm font-serif font-black text-foreground">Confirm Group Joining</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You are joining <strong>{selectedGroup.groupName}</strong> for {selectedGroup.cropType}. Your crop lot (estimated 1,500 kg) will be pooled.
            </p>
            
            <div className="bg-muted p-3.5 rounded-lg text-xs flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase">Expected Return</span>
                <span className="font-sans tabnum font-black text-green-800">₹{(selectedGroup.expectedPrice * 1500).toLocaleString()}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-green-800" />
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block uppercase">Pickup Date</span>
                <span className="font-bold text-foreground">{new Date(selectedGroup.collectionDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => setSelectedGroup(null)}
                className="flex-1 bg-muted text-foreground py-2 rounded-lg text-xs font-bold hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmJoin}
                className="flex-1 bg-amber-400 text-green-950 py-2 rounded-lg text-xs font-bold hover:bg-amber-500 transition-colors"
              >
                Confirm Join
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
