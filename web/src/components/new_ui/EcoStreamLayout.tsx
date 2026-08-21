import React from 'react';

interface EcoStreamLayoutProps {
  children: React.ReactNode;
  activeTab: 'command' | 'router' | 'fleet' | 'eco';
  onTabChange: (tab: 'command' | 'router' | 'fleet' | 'eco') => void;
  userProfile?: { name: string; photoURL?: string } | null;
}

export default function EcoStreamLayout({ children, activeTab, onTabChange, userProfile }: EcoStreamLayoutProps) {
  return (
    <div className="bg-background text-on-surface h-screen w-full overflow-hidden flex flex-col md:flex-row selection:bg-emerald-core selection:text-deep-roast font-body-md">
      {/* MOBILE TOP BAR */}
      <header className="md:hidden bg-deep-roast border-b border-caffeine-base flex justify-between items-center w-full px-margin-mobile py-base sticky top-0 z-40">
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-emerald-core text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-emerald-core font-bold tracking-tight">EcoStream AI</h1>
        </div>
        <img 
          className="w-8 h-8 rounded-full border border-emerald-core object-cover" 
          alt="Profile" 
          src={userProfile?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuAKtzzijrmHMXmhuf1xmOh-BslsILyslD8ngVievplF699JkJiaUUpbPnvuNNXrXjaNDAISaXZirEixsukdpPwnuQSlPvKmnCQZdViA8aDJpgHPL9eboefbnw0SPJf-Kc_-3d8dn97EdFPwrH7baZYb2EAijqke2x1tPAn50C29BaPe4KIDpmiQp2QSYa8SgF5W5dlUEG8wd-dXk7fSuPmTP7_6TqvaeL89tTWAaxlrqRTkOQy3Zoo"}
        />
      </header>

      {/* DESKTOP SIDE NAV */}
      <aside className="hidden md:flex flex-col h-full w-64 left-0 top-0 bg-surface-container p-md shrink-0 border-r border-caffeine-base z-50 relative">
        <div className="absolute inset-0 scanlines opacity-20"></div>
        <div className="mb-xl flex items-center gap-sm relative z-10">
          <img 
            className="w-12 h-12 rounded-full border-2 border-emerald-core object-cover" 
            alt="Profile" 
            src={userProfile?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuDJDWJO7NSKUSBWlHVA7tb8CfrjWa7m5HXdfNSGNyVSzOJ_xDz15PGigr8kO8XQP5_3ia8ZR34vi8ZhsYxUaiuJj2r-ps0N0NkFPH8yO9lPsHRkEUZjyZwyZAlBqQdacn-z_xdL-WItZq0mIqiNQ1wxzZgIdnuFEtDiQr_1Y1nzRYse7aYI_32y-xC5CExjTA-MLNNDqhEsyBM_RSp6UwSjdVmQH-AQJ_diSXcuFOsUpi3W303GMEQ"}
          />
          <div>
            <h2 className="font-label-md text-label-md text-emerald-core font-bold">{userProfile?.name || "System Operator"}</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Sustainable Supply Chain</p>
          </div>
        </div>
        <nav className="flex flex-col gap-sm relative z-10">
          <button 
            onClick={() => onTabChange('command')}
            className={`flex items-center gap-sm px-4 py-3 rounded-full transition-colors font-body-md text-body-md ${activeTab === 'command' ? 'bg-secondary-container text-emerald-core font-bold' : 'text-on-surface-variant hover:bg-surface-variant'}`}
          >
            <span className="material-symbols-outlined">terminal</span>
            AI Command Center
          </button>
          <button 
            onClick={() => onTabChange('router')}
            className={`flex items-center gap-sm px-4 py-3 rounded-full transition-colors font-body-md text-body-md ${activeTab === 'router' ? 'bg-secondary-container text-emerald-core font-bold' : 'text-on-surface-variant hover:bg-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'router' ? "'FILL' 1" : "" }}>map</span>
            Smart Router
          </button>
          <button 
            onClick={() => onTabChange('fleet')}
            className={`flex items-center gap-sm px-4 py-3 rounded-full transition-colors font-body-md text-body-md ${activeTab === 'fleet' ? 'bg-secondary-container text-emerald-core font-bold' : 'text-on-surface-variant hover:bg-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'fleet' ? "'FILL' 1" : "" }}>local_shipping</span>
            Fleet & Cargo
          </button>
          <button 
            onClick={() => onTabChange('eco')}
            className={`flex items-center gap-sm px-4 py-3 rounded-full transition-colors font-body-md text-body-md ${activeTab === 'eco' ? 'bg-secondary-container text-emerald-core font-bold' : 'text-on-surface-variant hover:bg-surface-variant'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'eco' ? "'FILL' 1" : "" }}>eco</span>
            Sustainability
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-deep-roast">
        <div className="absolute inset-0 scanlines opacity-10"></div>
        {/* TOP APP BAR (DESKTOP) */}
        <header className="hidden md:flex justify-between items-center w-full px-md py-sm bg-deep-roast border-b border-caffeine-base z-40 relative">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-emerald-core text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
            <h1 className="font-headline-md text-headline-md text-emerald-core font-bold uppercase tracking-widest">EcoStream AI</h1>
          </div>
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:text-emerald-core transition-colors w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        {/* Scrollable Children Canvas */}
        <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 bg-deep-roast border-t border-caffeine-base z-50">
        <button 
          onClick={() => onTabChange('command')}
          className={`flex flex-col items-center justify-center px-4 py-1 transition-transform active:scale-90 ${activeTab === 'command' ? 'bg-primary-container text-on-primary-container rounded-full font-bold' : 'text-on-surface-variant hover:text-emerald-core'}`}
        >
          <span className="material-symbols-outlined font-label-sm" style={{ fontVariationSettings: activeTab === 'command' ? "'FILL' 1" : "" }}>dashboard</span>
          <span className="font-label-sm text-label-sm mt-1 font-jetbrains">Command</span>
        </button>
        <button 
          onClick={() => onTabChange('router')}
          className={`flex flex-col items-center justify-center px-4 py-1 transition-transform active:scale-90 ${activeTab === 'router' ? 'bg-primary-container text-on-primary-container rounded-full font-bold' : 'text-on-surface-variant hover:text-emerald-core'}`}
        >
          <span className="material-symbols-outlined font-label-sm" style={{ fontVariationSettings: activeTab === 'router' ? "'FILL' 1" : "" }}>route</span>
          <span className="font-label-sm text-label-sm mt-1 font-jetbrains">Router</span>
        </button>
        <button 
          onClick={() => onTabChange('fleet')}
          className={`flex flex-col items-center justify-center px-4 py-1 transition-transform active:scale-90 ${activeTab === 'fleet' ? 'bg-primary-container text-on-primary-container rounded-full font-bold' : 'text-on-surface-variant hover:text-emerald-core'}`}
        >
          <span className="material-symbols-outlined font-label-sm" style={{ fontVariationSettings: activeTab === 'fleet' ? "'FILL' 1" : "" }}>inventory_2</span>
          <span className="font-label-sm text-label-sm mt-1 font-jetbrains">Fleet</span>
        </button>
        <button 
          onClick={() => onTabChange('eco')}
          className={`flex flex-col items-center justify-center px-4 py-1 transition-transform active:scale-90 ${activeTab === 'eco' ? 'bg-primary-container text-on-primary-container rounded-full font-bold' : 'text-on-surface-variant hover:text-emerald-core'}`}
        >
          <span className="material-symbols-outlined font-label-sm" style={{ fontVariationSettings: activeTab === 'eco' ? "'FILL' 1" : "" }}>analytics</span>
          <span className="font-label-sm text-label-sm mt-1 font-jetbrains">Eco</span>
        </button>
      </nav>
    </div>
  );
}
