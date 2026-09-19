import React from 'react';
import { ArrowLeft, Check, Volume2, VolumeX, Type } from 'lucide-react';
import { speechService } from '../../services/speech';
import { UserPreferences } from '../../types';

interface PreferencesScreenProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onBack: () => void;
  onNext: () => void;
}

export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({
  preferences,
  onUpdatePreferences,
  onBack,
  onNext,
}) => {
  const handleTextSizeChange = (size: 'normal' | 'xl') => {
    onUpdatePreferences({ textSize: size });
    if (preferences.speakAloud) {
      speechService.speak(size === 'xl' ? "Text size set to Extra Large." : "Text size set to Normal.");
    }
  };

  const handleVoiceChange = (speak: boolean) => {
    onUpdatePreferences({ speakAloud: speak });
    speechService.setVoiceEnabled(speak);
    if (speak) {
      speechService.speak("Voice guidance is turned on. I will read text aloud for you.", undefined, true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between p-4 max-w-md mx-auto animate-fade-in">
      <div>
        <button
          onClick={onBack}
          id="preferences-back-btn"
          className="flex items-center gap-2 text-[#1A56DB] font-bold text-[18px] mb-4 py-1"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span>Back</span>
        </button>

        <h1 className="text-[30px] font-extrabold text-[#0A192F] leading-tight">
          Visual &amp; Voice Setup
        </h1>
        <p className="text-[18px] font-medium text-gray-700 mt-1">
          Customize how ElderEase looks and speaks to you.
        </p>

        {/* Question 1: Text Size */}
        <div className="mt-6">
          <label className="block text-[18px] font-extrabold text-[#0A192F] mb-2">
            1. How big would you like your text?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleTextSizeChange('normal')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                preferences.textSize === 'normal'
                  ? 'bg-[#E8EEFF] border-[#1A56DB] ring-2 ring-[#1A56DB]'
                  : 'bg-white border-[#D1D5DB]'
              }`}
            >
              <Type className="w-6 h-6 text-[#1A56DB] mb-1" />
              <span className="text-[19px] font-extrabold text-[#0A192F]">Normal</span>
              <span className="text-[14px] font-medium text-gray-600 mt-1">18px Crisp</span>
            </button>

            <button
              onClick={() => handleTextSizeChange('xl')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                preferences.textSize === 'xl'
                  ? 'bg-[#E8EEFF] border-[#1A56DB] ring-2 ring-[#1A56DB]'
                  : 'bg-white border-[#D1D5DB]'
              }`}
            >
              <Type className="w-8 h-8 text-[#1A56DB] mb-1 stroke-[2.5]" />
              <span className="text-[22px] font-extrabold text-[#0A192F]">Extra Large</span>
              <span className="text-[15px] font-bold text-[#1A56DB] mt-1">24px Readable</span>
            </button>
          </div>
        </div>

        {/* Question 2: Voice Assistance */}
        <div className="mt-8">
          <label className="block text-[18px] font-extrabold text-[#0A192F] mb-2">
            2. Would you like me to speak text aloud to you?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleVoiceChange(true)}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                preferences.speakAloud
                  ? 'bg-[#DCFCE7] border-[#16A34A] ring-2 ring-[#16A34A]'
                  : 'bg-white border-[#D1D5DB]'
              }`}
            >
              <Volume2 className="w-7 h-7 text-[#16A34A] mb-1" />
              <span className="text-[19px] font-extrabold text-[#14532D]">Yes, Speak Aloud</span>
              <span className="text-[14px] font-medium text-green-800 mt-1">Gentle Voice</span>
            </button>

            <button
              onClick={() => handleVoiceChange(false)}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                !preferences.speakAloud
                  ? 'bg-gray-100 border-[#0A192F] ring-2 ring-[#0A192F]'
                  : 'bg-white border-[#D1D5DB]'
              }`}
            >
              <VolumeX className="w-7 h-7 text-gray-600 mb-1" />
              <span className="text-[19px] font-extrabold text-gray-800">Text Only</span>
              <span className="text-[14px] font-medium text-gray-600 mt-1">Silent Mode</span>
            </button>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="mt-8 bg-white border-2 border-[#D1D5DB] rounded-2xl p-4 shadow-sm">
          <p className="text-[14px] font-bold uppercase tracking-wider text-gray-500 mb-1">
            Live Preview of Your Text:
          </p>
          <p
            className={`font-bold text-[#0A192F] transition-all ${
              preferences.textSize === 'xl' ? 'text-[24px] leading-relaxed' : 'text-[18px] leading-snug'
            }`}
          >
            &quot;Blood Pressure Medication is due at 2:00 PM.&quot;
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 mb-2">
        <button
          onClick={onNext}
          id="preferences-save-btn"
          className="w-full h-[64px] bg-[#1A56DB] hover:bg-[#1546b3] text-white rounded-2xl border-2 border-[#0F172A] tactile-btn flex items-center justify-center gap-3 text-[22px] font-extrabold"
        >
          <span>Save Preferences</span>
          <Check className="w-6 h-6 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
