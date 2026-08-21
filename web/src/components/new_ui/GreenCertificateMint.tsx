import React, { useState } from 'react';
import axios from 'axios';
import { Leaf, Loader2, ExternalLink, CheckCircle, Trophy } from 'lucide-react';

interface Props {
  co2Saved: number;
  shipmentId: string;
}

export default function GreenCertificateMint({ co2Saved, shipmentId }: Props) {
  const [mintStatus, setMintStatus] = useState<'idle' | 'minting' | 'success' | 'error'>('idle');
  const [txId, setTxId] = useState<string | null>(null);
  const [assetName, setAssetName] = useState<string | null>(null);

  const handleMint = async () => {
    setMintStatus('minting');
    try {
      const res = await axios.post('http://localhost:8081/api/payments/mint-cert', {
        co2Saved,
        shipmentId
      });
      setTxId(res.data.txId);
      setAssetName(res.data.assetName);
      setMintStatus('success');
    } catch (err) {
      console.error(err);
      setMintStatus('error');
    }
  };

  if (co2Saved <= 0) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-emerald-800">
          <Trophy className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm">Carbon Savings Detected</h3>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
          -{co2Saved.toFixed(1)} kg CO₂
        </span>
      </div>
      
      <p className="text-xs text-emerald-700">
        You saved CO₂ compared to standard routes! Claim your verifiable ESG Green Certificate (Algorand ASA) for your corporate sustainability report.
      </p>

      {mintStatus === 'idle' && (
        <button 
          onClick={handleMint}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
        >
          <Leaf className="w-4 h-4" />
          <span>Mint Green Certificate (NFT)</span>
        </button>
      )}

      {mintStatus === 'minting' && (
        <div className="w-full py-2 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Minting on Algorand...</span>
        </div>
      )}

      {mintStatus === 'success' && (
        <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-700 flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Asset Minted: {assetName}</span>
            </span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[10px]">
            <span className="truncate pr-2 text-slate-600">{txId}</span>
            <a 
              href={`https://lora.algokit.io/testnet/transaction/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue font-bold flex items-center hover:underline whitespace-nowrap"
            >
              View Explorer <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      )}

      {mintStatus === 'error' && (
        <div className="text-xs text-red-600 font-semibold text-center">
          Failed to mint certificate. Please try again.
        </div>
      )}
    </div>
  );
}
