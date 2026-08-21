import React from 'react';

export default function FleetAndCargo() {
  return (
    <div className="p-margin-mobile md:p-margin-desktop bg-deep-roast pb-32 md:pb-margin-desktop">
      <div className="mb-lg">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-emerald-core mb-xs">Sustainability & Fleet Report</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Real-time carbon footprint reduction metrics and fleet efficiency analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="col-span-1 md:col-span-6 bg-surface-container border border-caffeine-base rounded-xl p-md flex flex-col justify-between border-t-2 border-t-emerald-core">
          <div>
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">Net CO2 Offset</span>
              <span className="material-symbols-outlined text-emerald-core">cloud_done</span>
            </div>
            <div className="font-display-lg text-display-lg text-emerald-core">14.2k</div>
            <div className="font-label-sm text-label-sm text-secondary">Metric Tons (YTD)</div>
          </div>
          <div className="mt-md">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-variant text-emerald-core font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +12% vs last quarter
            </span>
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 bg-surface-container border border-caffeine-base rounded-xl p-md flex flex-col justify-between border-t-2 border-t-action-blue">
          <div>
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">Fleet Efficiency</span>
              <span className="material-symbols-outlined text-action-blue">bolt</span>
            </div>
            <div className="font-display-lg text-display-lg text-action-blue">92.4%</div>
            <div className="font-label-sm text-label-sm text-secondary">Optimal Route Adherence</div>
          </div>
          <div className="mt-md w-full bg-deep-roast h-2 rounded-full overflow-hidden border border-caffeine-base">
            <div className="bg-action-blue h-full w-[92%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-12 bg-surface-container border border-caffeine-base rounded-xl p-md relative overflow-hidden flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-md z-10">
            <h2 className="font-headline-md text-headline-md text-on-background">Emission Trends</h2>
            <div className="flex gap-2">
              <button className="px-sm py-1 rounded-full bg-secondary-container text-emerald-core font-label-sm font-bold border border-caffeine-base">YTD</button>
            </div>
          </div>
          <div className="flex-1 relative w-full h-full min-h-[200px] z-10 flex items-end justify-between px-sm pb-sm">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,80 Q10,70 20,75 T40,50 T60,60 T80,30 T100,20 L100,100 L0,100 Z" fill="rgba(16, 185, 129, 0.05)"></path>
              <path d="M0,80 Q10,70 20,75 T40,50 T60,60 T80,30 T100,20" fill="none" stroke="#10b981" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
              <circle cx="20" cy="75" fill="#1a110e" r="1.5" stroke="#10b981" strokeWidth="0.5"></circle>
              <circle cx="40" cy="50" fill="#1a110e" r="1.5" stroke="#10b981" strokeWidth="0.5"></circle>
              <circle cx="60" cy="60" fill="#1a110e" r="1.5" stroke="#10b981" strokeWidth="0.5"></circle>
              <circle cx="80" cy="30" fill="#1a110e" r="1.5" stroke="#10b981" strokeWidth="0.5"></circle>
              <circle className="animate-pulse shadow-[0_0_8px_#4edea3]" cx="100" cy="20" fill="#4edea3" r="2"></circle>
            </svg>
            <div className="absolute bottom-2 left-0 w-full flex justify-between px-md font-label-sm text-label-sm text-on-surface-variant opacity-70">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-12 bg-surface-container border border-caffeine-base rounded-xl p-md">
          <h2 className="font-headline-md text-headline-md text-on-background mb-md">Sustainability Alerts</h2>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-caffeine-base">
                  <th className="pb-sm font-label-md text-label-md text-on-surface-variant font-medium">Status</th>
                  <th className="pb-sm font-label-md text-label-md text-on-surface-variant font-medium">Route / Zone</th>
                  <th className="pb-sm font-label-md text-label-md text-on-surface-variant font-medium">Metric Impact</th>
                  <th className="pb-sm font-label-md text-label-md text-on-surface-variant font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-caffeine-base hover:bg-[rgba(16,185,129,0.05)] transition-colors cursor-pointer group">
                  <td className="py-sm">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-emerald-core text-emerald-core font-label-sm text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-core animate-pulse"></span> Optimized
                    </span>
                  </td>
                  <td className="py-sm font-body-md text-on-background group-hover:text-emerald-core">EU-Nordic Corridor</td>
                  <td className="py-sm font-label-md text-secondary">-14% CO2 est.</td>
                  <td className="py-sm font-label-md text-on-surface-variant text-right">10m ago</td>
                </tr>
                <tr className="border-b border-caffeine-base hover:bg-[rgba(16,185,129,0.05)] transition-colors cursor-pointer group">
                  <td className="py-sm">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-action-blue text-action-blue font-label-sm text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-action-blue"></span> Info
                    </span>
                  </td>
                  <td className="py-sm font-body-md text-on-background group-hover:text-action-blue">APAC Hub 04</td>
                  <td className="py-sm font-label-md text-secondary">Transitioning to Solar</td>
                  <td className="py-sm font-label-md text-on-surface-variant text-right">1h ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
