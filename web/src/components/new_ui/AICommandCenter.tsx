import React from 'react';

export default function AICommandCenter() {
  return (
    <div className="p-md pb-[100px] md:pb-md">
      <div className="max-w-[1600px] mx-auto grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-gutter">
        
        <div className="col-span-4 md:col-span-4 lg:col-span-4 bg-caffeine-base border border-surface-bright rounded-xl p-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-emerald-core opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>
          <div className="flex justify-between items-start mb-sm">
            <h3 className="font-label-md text-label-md text-on-surface-variant flex items-center gap-xs uppercase tracking-wider font-jetbrains"><span className="material-symbols-outlined text-emerald-core text-sm">eco</span> Real-time Eco-Savings</h3>
          </div>
          <div className="mt-xs">
            <div className="flex items-baseline gap-xs">
              <span className="font-display-lg text-display-lg text-emerald-core">14.2k</span>
              <span className="font-headline-md text-headline-md text-on-surface-variant">kg CO₂</span>
            </div>
            <div className="flex items-center gap-xs mt-sm text-action-blue bg-surface-container border border-surface-bright rounded-full px-3 py-1 w-max">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span className="font-label-sm text-label-sm font-jetbrains">+2.4% vs last shift</span>
            </div>
          </div>
        </div>

        <div className="col-span-4 md:col-span-4 lg:col-span-4 bg-caffeine-base border border-surface-bright rounded-xl p-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-action-blue opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>
          <div className="flex justify-between items-start mb-sm">
            <h3 className="font-label-md text-label-md text-on-surface-variant flex items-center gap-xs uppercase tracking-wider font-jetbrains"><span className="material-symbols-outlined text-action-blue text-sm">bolt</span> System Efficiency</h3>
          </div>
          <div className="mt-xs">
            <div className="flex items-baseline gap-xs">
              <span className="font-display-lg text-display-lg text-action-blue">98.4</span>
              <span className="font-headline-md text-headline-md text-on-surface-variant">%</span>
            </div>
            <div className="w-full bg-surface-container border border-surface-bright h-2 rounded-full mt-sm overflow-hidden flex">
              <div className="bg-action-blue h-full w-[80%] rounded-l-full"></div>
              <div className="bg-emerald-core h-full w-[18.4%] rounded-r-full"></div>
            </div>
          </div>
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-4 bg-caffeine-base border border-surface-bright rounded-xl p-md flex flex-col justify-between">
          <div className="flex justify-between items-start mb-sm">
            <h3 className="font-label-md text-label-md text-on-surface-variant flex items-center gap-xs uppercase tracking-wider font-jetbrains"><span className="material-symbols-outlined text-on-surface-variant text-sm">inventory_2</span> Active Fleet</h3>
            <span className="material-symbols-outlined text-emerald-core animate-pulse">sensors</span>
          </div>
          <div className="grid grid-cols-2 gap-sm mt-xs">
            <div className="bg-surface-container p-3 border border-surface-bright rounded-lg">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 font-jetbrains">IN TRANSIT</p>
              <p className="font-headline-md text-headline-md text-emerald-core">342</p>
            </div>
            <div className="bg-surface-container p-3 border border-surface-bright rounded-lg">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 font-jetbrains">IDLE / CHARGE</p>
              <p className="font-headline-md text-headline-md text-on-surface">18</p>
            </div>
          </div>
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-8 bg-caffeine-base border border-surface-bright rounded-xl p-0 flex flex-col h-[420px] relative overflow-hidden group">
          <div className="absolute top-4 left-4 z-20 bg-deep-roast/90 backdrop-blur-md border border-caffeine-base p-sm rounded-lg shadow-lg">
            <h3 className="font-label-md text-label-md text-on-surface flex items-center gap-xs font-jetbrains"><span className="material-symbols-outlined text-emerald-core text-[18px]">route</span> Global Topology</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Live asset tracking & routing</p>
          </div>
          <div className="w-full h-full bg-cover bg-center absolute inset-0 transform group-hover:scale-105 transition-transform duration-[10s] ease-out" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBra7YvO3lkNVzYxsRugC1EEBKA-cGz6N2P3ksmTqPdOiSsqHczmuhSZmfNUWvm69Gk9DqqzjIdYMDhaA9W7iqBTtG6ROSVfXBk2MLUYDrD7XkOUT0rkYY6y1emAFbl9RTwaSZxG9i8XtOieXE2BKkuC8NGdkOucozCMWLDRwCkoO6bahBnp_volOP7tN8VdurW5P31NVEKiOsnv75ugttgQWaXtGcn_EVeAqyxDy_133_ZxXFYfzQ')" }}></div>
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-4 bg-caffeine-base border border-surface-bright rounded-xl p-md flex flex-col h-[420px]">
          <div className="flex justify-between items-center mb-md pb-sm border-b border-surface-bright">
            <h3 className="font-label-md text-label-md text-on-surface flex items-center gap-xs font-jetbrains"><span className="material-symbols-outlined text-error text-[18px]">warning</span> Actionable Intelligence</h3>
            <span className="bg-surface-container border border-error text-error font-label-sm text-label-sm px-2 py-0.5 rounded-full font-jetbrains">2 Critical</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-sm custom-scrollbar">
            
            <div className="p-sm bg-surface-container border-l-2 border-error rounded-r-lg group hover:bg-surface-variant transition-colors cursor-pointer relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface-variant to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
              </div>
              <div className="flex justify-between items-start mb-1">
                <p className="font-label-sm text-label-sm text-error font-jetbrains">THERMAL ANOMALY</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Just now</p>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-snug">Sensor failure in Container 89A. Temperature deviation &gt; 4°C detected.</p>
            </div>
            
            <div className="p-sm bg-surface-container border-l-2 border-action-blue rounded-r-lg group hover:bg-surface-variant transition-colors cursor-pointer relative overflow-hidden">
              <div className="flex justify-between items-start mb-1">
                <p className="font-label-sm text-label-sm text-action-blue font-jetbrains">ROUTE OPTIMIZATION</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">12m ago</p>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-snug">Weather pattern anomaly detected over Pacific route. Rerouting Fleet Delta saves 4.2 tons of fuel.</p>
            </div>

            <div className="p-sm bg-surface-container border-l-2 border-surface-bright rounded-r-lg group hover:bg-surface-variant transition-colors cursor-pointer relative overflow-hidden">
              <div className="flex justify-between items-start mb-1">
                <p className="font-label-sm text-label-sm text-on-surface-variant font-jetbrains">SYSTEM UPDATE</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">1h ago</p>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-snug">Predictive maintenance models updated with latest fleet telemetry data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
