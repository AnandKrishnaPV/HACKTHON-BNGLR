import React from 'react';

export default function X402Payment({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-100px)]">
      <div className="w-full max-w-[450px] bg-surface rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative border-4 border-caffeine-base pb-24">
        
        <header className="flex justify-between items-center w-full px-margin-mobile py-base bg-deep-roast border-b border-caffeine-base z-10 sticky top-0">
          <div className="flex items-center gap-xs text-emerald-core">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>arrow_back</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-emerald-core font-bold tracking-tight">Checkout</h1>
          <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-core/30">
            <span className="material-symbols-outlined text-emerald-core">account_circle</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-margin-mobile flex flex-col gap-md relative">
          
          <div className="flex flex-col items-center justify-center py-sm">
            <div className="w-12 h-12 bg-deep-roast rounded-xl border border-action-blue/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)] mb-xs">
              <span className="material-symbols-outlined text-action-blue text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>memory</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-action-blue">X402 Agent</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Secure Global Gateway</p>
          </div>

          <div className="bg-caffeine-base rounded-xl border-t-2 border-t-emerald-core p-md flex flex-col gap-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Transaction Summary</p>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-base">Logistics Offset Credit</h3>
                <p className="font-body-md text-body-md text-emerald-core flex items-center gap-1"><span className="material-symbols-outlined text-sm">eco</span> 500 Tons C02e</p>
              </div>
            </div>
            <div className="h-px w-full bg-surface-variant my-xs"></div>
            <div className="flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface-variant">Subtotal</span>
              <span className="font-label-md text-label-md text-on-surface">1.25 USDC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface-variant">X402 Routing Fee</span>
              <span className="font-label-md text-label-md text-on-surface">0.05 USDC</span>
            </div>
            <div className="flex justify-between items-center pt-xs mt-xs border-t border-surface-variant">
              <span className="font-body-lg text-body-lg text-on-surface font-bold">Total Due</span>
              <span className="font-display-lg-mobile text-display-lg-mobile text-emerald-core">1.30 USDC</span>
            </div>
          </div>

          <div className="flex flex-col gap-sm">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Payment Method</p>
            <button className="w-full flex items-center justify-between p-sm rounded-lg bg-surface-container border border-action-blue relative overflow-hidden group">
              <div className="absolute inset-0 bg-action-blue/10 w-full h-full"></div>
              <div className="flex items-center gap-sm relative z-10">
                <div className="w-8 h-8 rounded-full bg-deep-roast border border-action-blue/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-action-blue text-sm">memory</span>
                </div>
                <div className="text-left">
                  <span className="block font-label-md text-label-md text-action-blue">X402 Direct Link</span>
                  <span className="block font-label-sm text-label-sm text-on-surface-variant">Algorand TestNet</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-action-blue relative z-10" style={{fontVariationSettings: "'FILL' 1"}}>radio_button_checked</span>
            </button>
          </div>

          <div className="bg-deep-roast border border-action-blue/30 rounded-xl p-md mt-sm flex flex-col items-center">
            <p className="font-label-sm text-label-sm text-action-blue mb-sm text-center">X402 Authorization Required</p>
            <div className="flex gap-sm mb-md">
              <div className="w-3 h-3 rounded-full bg-action-blue shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              <div className="w-3 h-3 rounded-full bg-action-blue shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              <div className="w-3 h-3 rounded-full bg-action-blue shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              <div className="w-3 h-3 rounded-full bg-surface-variant border border-action-blue/20"></div>
              <div className="w-3 h-3 rounded-full bg-surface-variant border border-action-blue/20"></div>
              <div className="w-3 h-3 rounded-full bg-surface-variant border border-action-blue/20"></div>
            </div>
            
            <div className="grid grid-cols-3 gap-xs w-full max-w-[200px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button key={num} className="h-12 rounded bg-surface-container hover:bg-caffeine-base border border-transparent hover:border-action-blue/50 text-on-surface font-label-md transition-all active:scale-95">{num}</button>
              ))}
              <button className="h-12 rounded flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"><span className="material-symbols-outlined">fingerprint</span></button>
              <button className="h-12 rounded bg-surface-container hover:bg-caffeine-base border border-transparent hover:border-action-blue/50 text-on-surface font-label-md transition-all active:scale-95">0</button>
              <button className="h-12 rounded flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined">backspace</span></button>
            </div>
          </div>
        </main>

        <div className="absolute bottom-0 w-full p-margin-mobile bg-gradient-to-t from-surface via-surface to-transparent pt-xl">
          <button onClick={onConfirm} className="w-full bg-emerald-core text-on-primary font-label-md text-label-md py-md rounded-lg flex items-center justify-center gap-xs hover:bg-primary-fixed-dim transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95">
            <span className="material-symbols-outlined">lock</span>
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
}
