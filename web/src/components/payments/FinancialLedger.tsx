import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, Activity, Coins, Link, ExternalLink, RefreshCw } from 'lucide-react';
import axios from 'axios';

export const FinancialLedger = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/payments');
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
          <Activity className="w-5 h-5 text-brand-green" />
          <span>Real-time Financial Ledger</span>
        </h3>
        <button onClick={fetchLedger} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Syncing ledger...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No transactions yet</div>
        ) : (
          payments.map((p: any) => (
            <div key={p.id} className="border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors bg-slate-50/50">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  {p.type === 'ATOMIC_SPLIT' ? (
                    <div className="bg-purple-100 p-2 rounded-lg"><Link className="w-4 h-4 text-purple-600" /></div>
                  ) : p.type === 'TOLL_STREAM' ? (
                    <div className="bg-amber-100 p-2 rounded-lg"><Coins className="w-4 h-4 text-amber-600" /></div>
                  ) : (
                    <div className="bg-green-100 p-2 rounded-lg"><CheckCircle2 className="w-4 h-4 text-green-600" /></div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                    <span>{p.type.replace('_', ' ')}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase font-mono">{p.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">
                    TX: <a href={`https://lora.algonode.network/testnet/transaction/${p.txHash}`} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">{p.txHash.substring(0, 16)}...</a>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {new Date(p.createdAt).toLocaleString()} • {p.networkId}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col justify-center">
                <div className="font-bold text-slate-800 flex items-center justify-end space-x-1">
                  <span className="text-sm">USDC</span>
                  <span className="text-lg">{p.amount.toLocaleString()}</span>
                </div>
                
                {/* Expand splits if atomic */}
                {p.splits && p.splits.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1 items-end border-t border-slate-200 pt-2">
                    {p.splits.map((s: any) => (
                      <div key={s.id} className="text-[10px] font-mono flex items-center space-x-2">
                        <span className="text-slate-500">{s.partyName}:</span>
                        <span className="font-bold text-slate-700">{s.percentage}%</span>
                        <span className="text-slate-400">({s.amount} USDC)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
