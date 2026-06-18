'use client';

import React, { useState, useEffect } from 'react';
import { ListCollapse, ArrowRight, UserPlus, Trash, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function GroupManagement() {
  const { t } = useLanguage();
  const [activeGroup, setActiveGroup] = useState<any>(null);

  // Seeded mock FPO groups with members
  const [groups, setGroups] = useState<any[]>([
    {
      id: 'grp-1',
      groupName: 'Tomato Collective Group A',
      cropType: 'Tomato',
      totalQuantity: 3700,
      collectionDate: '2026-06-22',
      status: 'Active',
      members: [
        { id: 'm-1', name: 'Anbu Selvan', qty: 1500, village: 'Usilampatti' },
        { id: 'm-2', name: 'Karthik Raja', qty: 1200, village: 'Vadipatti' },
        { id: 'm-3', name: 'Muthu Kumar', qty: 1000, village: 'Melur' }
      ]
    },
    {
      id: 'grp-2',
      groupName: 'Onion Aggregation Salem B',
      cropType: 'Onion',
      totalQuantity: 3800,
      collectionDate: '2026-06-25',
      status: 'Pending Dispatch',
      members: [
        { id: 'm-4', name: 'Ravi Chandran', qty: 2000, village: 'Attur' },
        { id: 'm-5', name: 'Senthil Kumar', qty: 1800, village: 'Omalur' }
      ]
    }
  ]);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const token = localStorage.getItem('smartag_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/fpo/all-farmers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setGroups(prevGroups => {
              const distributedGroups = [...prevGroups];
              // Clear mock members to replace with real ones
              distributedGroups[0].members = [];
              distributedGroups[1].members = [];
              
              data.forEach((farmer: any, index: number) => {
                const member = {
                  id: farmer.id,
                  name: farmer.name,
                  qty: 1000 + (index * 200), // mock quantity
                  village: farmer.location || 'Local Village'
                };
                distributedGroups[index % 2].members.push(member);
              });
              
              distributedGroups[0].totalQuantity = distributedGroups[0].members.reduce((sum: number, m: any) => sum + m.qty, 0);
              distributedGroups[1].totalQuantity = distributedGroups[1].members.reduce((sum: number, m: any) => sum + m.qty, 0);
              return distributedGroups;
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch real farmers:', err);
      }
    };
    fetchFarmers();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    const memberId = e.dataTransfer.getData('memberId');
    const sourceGroupId = e.dataTransfer.getData('sourceGroupId');

    if (sourceGroupId === targetGroupId) return;

    // Find the member
    const sourceGroup = groups.find(g => g.id === sourceGroupId);
    const targetGroup = groups.find(g => g.id === targetGroupId);
    if (!sourceGroup || !targetGroup) return;

    const member = sourceGroup.members.find((m: any) => m.id === memberId);
    if (!member) return;

    // Remove from source, add to target
    setGroups(prev => prev.map(g => {
      if (g.id === sourceGroupId) {
        return {
          ...g,
          totalQuantity: g.totalQuantity - member.qty,
          members: g.members.filter((m: any) => m.id !== memberId)
        };
      }
      if (g.id === targetGroupId) {
        return {
          ...g,
          totalQuantity: g.totalQuantity + member.qty,
          members: [...g.members, member]
        };
      }
      return g;
    }));

    alert(`Reassigned ${member.name} to ${targetGroup.groupName} successfully!`);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <ListCollapse className="w-6 h-6 text-green-700" />
          Group Management & Dispatch
        </h1>
        <p className="text-xs text-muted-foreground">
          Drag and drop farmers between collective selling groups to optimize truck utilization and pickup routes.
        </p>
      </div>

      {/* Grid of groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div 
            key={group.id} 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, group.id)}
            className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-green-800 bg-green-800/10 px-2 py-0.5 rounded-full uppercase">
                  {group.status}
                </span>
                <span className="text-xs font-serif font-black text-green-950">
                  Total: {group.totalQuantity.toLocaleString()} kg
                </span>
              </div>
              
              <h3 className="text-sm font-serif font-bold text-foreground mb-1">{group.groupName}</h3>
              <p className="text-[10px] text-muted-foreground">Collection Date: {group.collectionDate}</p>

              {/* Members list */}
              <div className="flex flex-col gap-2 mt-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Group Farmers:</span>
                {group.members.map((m: any) => (
                  <div
                    key={m.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('memberId', m.id);
                      e.dataTransfer.setData('sourceGroupId', group.id);
                    }}
                    className="flex justify-between items-center bg-surface border border-border p-3 rounded-lg text-xs cursor-grab active:cursor-grabbing hover:border-green-800/40 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-foreground block">{m.name}</span>
                      <span className="text-[9px] text-muted-foreground">{m.village}</span>
                    </div>
                    <span className="font-semibold text-green-800">{m.qty} kg</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => alert(`Commencing logistics schedule for ${group.groupName}`)}
              className="w-full bg-green-800 text-primary-foreground py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors mt-6"
            >
              Start Logistics Allocation
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
