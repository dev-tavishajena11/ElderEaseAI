import React from 'react';
import { Volume2, VolumeX, Type, CheckCircle2 } from 'lucide-react';
import { UserPreferences } from '../types';

interface HeaderProps {
  currentTabTitle: string;
  preferences: UserPreferences;
  onToggleVoice: () => void;
  onToggleTextSize: () => void;
  onOpenCaregiverModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTabTitle,
  preferences,
  onToggleVoice,
  onToggleTextSize,
  onOpenCaregiverModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b-2 border-[#D1D5DB] px-3 py-2 sm:px-4 sm:py-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A56DB] to-[#003fb1] flex items-center justify-center shadow-md border border-[#0F172A]/20">
            <svg
              className="w-6 h-6 text-white fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div>
            <h1 className="text-[19px] font-extrabold tracking-tight text-[#0A192F] leading-tight">
              ElderEase AI
            </h1>
            <p className="text-[13px] font-bold text-[#1A56DB] leading-none">
              {currentTabTitle}
            </p>
          </div>
        </div>

        {/* Control Badges & Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Voice Toggle */}
          <button
            onClick={onToggleVoice}
            id="header-voice-toggle"
            aria-label={preferences.speakAloud ? 'Mute voice guidance' : 'Turn on voice guidance'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border-2 text-[14px] font-bold transition-all ${
              preferences.speakAloud
                ? 'bg-[#E8EEFF] text-[#1A56DB] border-[#1A56DB]'
                : 'bg-gray-100 text-gray-600 border-gray-300'
            }`}
          >
            {preferences.speakAloud ? (
              <>
                <Volume2 className="w-4 h-4 text-[#1A56DB]" />
                <span className="hidden sm:inline">Voice:</span> ON
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-gray-500" />
                <span className="hidden sm:inline">Voice:</span> OFF
              </>
            )}
          </button>

          {/* Text Size Toggle */}
          <button
            onClick={onToggleTextSize}
            id="header-text-toggle"
            aria-label="Toggle text size"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border-2 text-[14px] font-bold transition-all ${
              preferences.textSize === 'xl'
                ? 'bg-[#1A56DB] text-white border-[#0F172A]'
                : 'bg-[#F0F3FF] text-[#0A192F] border-[#D1D5DB]'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>{preferences.textSize === 'xl' ? 'A++' : 'A+'}</span>
          </button>

          {/* Caregiver Connected Pill */}
          <button
            onClick={onOpenCaregiverModal}
            id="header-caregiver-sync"
            title="View Caregiver Sync Portal"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#DCFCE7] border-2 border-[#16A34A] text-[#14532D] text-[13px] font-extrabold hover:bg-[#bbf7d0] transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="hidden xs:inline">Connected</span>
          </button>

          {/* User Eleanor Avatar */}
          <button
            onClick={onOpenCaregiverModal}
            aria-label="Eleanor profile"
            className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-[#1A56DB] shadow-sm ml-0.5 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
          >
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
              alt="Eleanor profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16A34A] border-2 border-white rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
