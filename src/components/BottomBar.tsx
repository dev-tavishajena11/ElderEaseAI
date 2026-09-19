import React from 'react';
import { Home, Scan, ShieldAlert, Mic, Radio } from 'lucide-react';
import { ScreenTab } from '../types';

interface BottomBarProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  onOpenCompanion: () => void;
  spotlightTarget: string | null;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCompanion,
  spotlightTarget,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 max-w-md mx-auto px-3 pb-3 pt-1 pointer-events-none">
      {/* 1. Floating EE-AssistantBar */}
      <div className="pointer-events-auto mb-2.5">
        <div
          onClick={onOpenCompanion}
          id="EE-AssistantBar"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenCompanion()}
          className="bg-white/95 backdrop-blur-md border-2 border-[#1A56DB] rounded-2xl p-2.5 shadow-xl flex items-center justify-between cursor-pointer hover:bg-[#F0F3FF] active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A56DB] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[15px] font-black text-[#0A192F] leading-tight">
                ElderEase Companion
              </p>
              <p className="text-[13px] font-bold text-gray-600 leading-tight">
                Tap mic or say &quot;Help...&quot;
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCompanion();
            }}
            id="EE-AssistantMicBtn"
            aria-label="Open AI Companion"
            className="w-11 h-11 rounded-xl bg-[#1A56DB] hover:bg-[#1546b3] text-white flex items-center justify-center shadow-md border-2 border-[#0F172A] tactile-btn flex-shrink-0"
          >
            <Mic className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. Persistent 3-Anchor Bottom Navigation Bar */}
      <nav
        aria-label="Main Navigation"
        className="pointer-events-auto bg-white border-2 border-[#0F172A] rounded-2xl shadow-xl grid grid-cols-3 p-1.5 gap-1.5"
      >
        {/* Anchor 1: TODAY */}
        <button
          onClick={() => onSelectTab('today')}
          id="nav-today-btn"
          className={`h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
            currentTab === 'today'
              ? 'bg-[#E8EEFF] text-[#1A56DB] font-extrabold border-2 border-[#1A56DB]'
              : 'text-gray-700 hover:bg-gray-100 font-bold'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[13px] tracking-wider uppercase mt-0.5">TODAY</span>
        </button>

        {/* Anchor 2: ASSIST (Camera Scanner) with Spotlight Ring if active */}
        <button
          onClick={() => onSelectTab('assist')}
          id="nav-assist-btn"
          className={`h-14 rounded-xl flex flex-col items-center justify-center transition-all relative ${
            spotlightTarget === 'assist-nav' ? 'EE-SpotlightRing bg-[#1A56DB] text-white' : ''
          } ${
            currentTab === 'assist'
              ? 'bg-[#E8EEFF] text-[#1A56DB] font-extrabold border-2 border-[#1A56DB]'
              : 'text-gray-700 hover:bg-gray-100 font-bold'
          }`}
        >
          <Scan className="w-5 h-5" />
          <span className="text-[13px] tracking-wider uppercase mt-0.5">ASSIST</span>
        </button>

        {/* Anchor 3: EMERGENCY (Red SOS) */}
        <button
          onClick={() => onSelectTab('emergency')}
          id="nav-emergency-btn"
          className={`h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
            currentTab === 'emergency'
              ? 'bg-[#98000C] text-white font-extrabold border-2 border-[#5C0007] shadow-inner'
              : 'bg-[#98000C]/90 hover:bg-[#98000C] text-white font-bold'
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-black tracking-widest bg-red-800/80 px-1 py-0.2 rounded">SOS</span>
          </div>
          <span className="text-[13px] tracking-wider uppercase font-black">EMERGENCY</span>
        </button>
      </nav>
    </div>
  );
};
