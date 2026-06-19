'use client';

import React, { useState, useEffect } from 'react';
import { History, Download, Eye } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function BuyerHistory() {
  const { t } = useLanguage();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://smartag-api-1siv.onrender.com/api'}/buyer/history`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        setHistory([
          { id: 'tx-1', amount: 186000, status: 'COMPLETED', createdAt: '2026-06-10', farmer: { name: 'Anbu Selvan' }, fpo: { name: 'Madurai Farmers Collective' } },
          { id: 'tx-2', amount: 318500, status: 'COMPLETED', createdAt: '2026-06-12', farmer: { name: 'Ravi Chandran' }, fpo: { name: 'Salem Agri Group' } }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-3 bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
          <History className="w-6 h-6 text-green-700" />
          Procurement History
        </h1>
        <p className="text-xs text-muted-foreground">
          Review invoices, transaction ledgers, and completed purchase contracts.
        </p>
      </div>

      {/* History table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[9px] uppercase font-bold text-muted-foreground">
                <th className="p-3">Purchase Date</th>
                <th className="p-3">FPO Partner</th>
                <th className="p-3">Gross Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Invoices</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, idx) => (
                <tr key={h.id || idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-semibold text-muted-foreground">
                    {new Date(h.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-foreground block">{h.fpo?.name}</span>
                    <span className="text-[10px] text-muted-foreground">Farmer representative: {h.farmer?.name}</span>
                  </td>
                  <td className="p-3 font-sans tabnum font-black text-green-950">₹{h.amount.toLocaleString()}</td>
                  <td className="p-3">
                    <span className="text-[9px] font-bold bg-green-800/10 text-green-800 border border-green-800/20 px-2 py-0.5 rounded-full uppercase">
                      {h.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => alert(`Downloading invoice PDF for procurement contract: ${h.id}`)}
                      className="p-1 text-green-800 hover:bg-muted rounded"
                      title="Download Invoice PDF"
                    >
                      <Download className="w-4 h-4" />
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
