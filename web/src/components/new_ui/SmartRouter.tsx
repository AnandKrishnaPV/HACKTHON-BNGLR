import React from 'react';

export default function SmartRouter() {
  return (
    <div className="relative h-full w-full">
      
      {/* Map Background Simulation */}
      <div className="absolute inset-0 z-0 bg-[#0a0f1d] map-grid">
        {/* Placeholder for MapComponent */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBra7YvO3lkNVzYxsRugC1EEBKA-cGz6N2P3ksmTqPdOiSsqHczmuhSZmfNUWvm69Gk9DqqzjIdYMDhaA9W7iqBTtG6ROSVfXBk2MLUYDrD7XkOUT0rkYY6y1emAFbl9RTwaSZxG9i8XtOieXE2BKkuC8NGdkOucozCMWLDRwCkoO6bahBnp_volOP7tN8VdurW5P31NVEKiOsnv75ugttgQWaXtGcn_EVeAqyxDy_133_ZxXFYfzQ')"}}></div>
      </div>

      {/* Origin/Dest overlay */}
      <div className="absolute top-margin-mobile left-margin-mobile right-margin-mobile md:left-margin-desktop md:right-auto md:w-[400px] z-10 glass-panel rounded-xl p-sm flex flex-col gap-sm animate-slide-up shadow-2xl">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-label-md text-label-md text-emerald-core uppercase tracking-wider font-jetbrains">Quantum Router</h2>
          <span className="material-symbols-outlined text-on-surface-variant hover:text-emerald-core cursor-pointer transition-colors text-sm">settings</span>
        </div>
        
        <div className="relative flex flex-col gap-2 mt-1">
          <div className="absolute left-[15px] top-[24px] bottom-[24px] w-0.5 bg-caffeine-base"></div>
          
          <div className="flex items-center gap-sm relative bg-surface-container rounded-lg p-2 border border-transparent focus-within:border-emerald-core transition-colors">
            <span className="material-symbols-outlined text-action-blue text-[20px] bg-deep-roast rounded-full z-10 ring-4 ring-surface-container">radio_button_checked</span>
            <input type="text" placeholder="Origin Facility" className="bg-transparent border-none outline-none text-on-surface font-body-md w-full placeholder:text-on-surface-variant/50" defaultValue="Port of Los Angeles, CA" />
          </div>

          <div className="flex items-center gap-sm relative bg-surface-container rounded-lg p-2 border border-transparent focus-within:border-emerald-core transition-colors">
            <span className="material-symbols-outlined text-emerald-core text-[20px] bg-deep-roast rounded-full z-10 ring-4 ring-surface-container">location_on</span>
            <input type="text" placeholder="Destination" className="bg-transparent border-none outline-none text-on-surface font-body-md w-full placeholder:text-on-surface-variant/50" defaultValue="Distribution Hub Alpha, NV" />
          </div>
        </div>

        <button className="w-full bg-surface-variant hover:bg-caffeine-base text-emerald-core font-label-md text-label-md py-sm rounded-lg flex items-center justify-center gap-xs transition-colors border border-caffeine-base mt-1">
          <span className="material-symbols-outlined text-[18px]">add</span> Add Waypoint
        </button>

        <button className="w-full bg-emerald-core text-on-primary font-label-md text-label-md py-sm rounded-lg flex items-center justify-center gap-xs hover:bg-primary-fixed-dim transition-colors mt-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <span className="material-symbols-outlined text-[18px]">bolt</span> Optimize Route
        </button>
      </div>

      {/* Selected Route Info Bottom Panel */}
      <div className="absolute bottom-margin-mobile left-margin-mobile right-margin-mobile md:left-margin-desktop md:right-margin-desktop z-10 glass-panel rounded-xl p-md flex flex-col md:flex-row gap-md shadow-[0_-10px_40px_rgba(0,0,0,0.3)] animate-slide-up" style={{animationDelay: '0.2s'}}>
        
        <div className="flex-1">
          <div className="flex items-center gap-sm mb-xs">
            <span className="bg-emerald-core/20 text-emerald-core border border-emerald-core/30 px-2 py-0.5 rounded font-label-sm text-label-sm font-jetbrains flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">star</span> RECOMMENDED
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-jetbrains">ROUTE ALPHA-9</span>
          </div>
          <div className="flex items-baseline gap-sm">
            <h3 className="font-display-lg text-display-lg text-on-surface">4h 12m</h3>
            <span className="font-label-md text-label-md text-emerald-core border-l border-caffeine-base pl-sm">-32m vs standard</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-md">Utilizing I-15 N with EV charging priority at Station Beta.</p>
        </div>

        <div className="hidden md:flex w-px bg-caffeine-base mx-sm"></div>

        <div className="flex flex-row justify-between md:justify-end md:gap-lg flex-1">
          <div className="flex flex-col justify-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">local_gas_station</span> Fuel Est.</span>
            <span className="font-headline-md text-headline-md text-on-surface">14.2 L</span>
            <span className="font-label-sm text-label-sm text-emerald-core">Optimal</span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">cloud</span> CO2 Impact</span>
            <span className="font-headline-md text-headline-md text-on-surface">24 kg</span>
            <span className="font-label-sm text-label-sm text-emerald-core">-12%</span>
          </div>
          <div className="flex flex-col justify-center items-end">
            <span className="font-label-sm text-label-sm text-on-surface-variant mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">toll</span> Route Cost</span>
            <span className="font-headline-md text-headline-md text-action-blue">$142.50</span>
            <button className="bg-action-blue/20 hover:bg-action-blue/30 text-action-blue px-3 py-1 rounded font-label-sm mt-1 transition-colors border border-action-blue/30">View Breakdown</button>
          </div>
        </div>

      </div>

    </div>
  );
}
