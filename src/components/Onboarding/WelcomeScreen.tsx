import React, { useEffect } from 'react';
import { RotateCcw, Volume2, ArrowRight, ShieldCheck, Users, Mic, Type } from 'lucide-react';
import { speechService } from '../../services/speech';

interface WelcomeScreenProps {
  onStart: () => void;
  speakAloud: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, speakAloud }) => {
  const welcomeSpeech = "Welcome to ElderEase. Tap the big blue button at the bottom to begin.";

  useEffect(() => {
    if (speakAloud) {
      // Speak softly after brief entry delay
      const timer = setTimeout(() => {
        speechService.speak(welcomeSpeech);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [speakAloud]);

  const handleReplay = () => {
    speechService.speak(welcomeSpeech, undefined, true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between p-4 max-w-md mx-auto animate-fade-in">
      {/* Top Playing Voice Guidance Banner */}
      <div className="bg-[#E8EEFF] border-2 border-[#1A56DB] rounded-2xl p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#1A56DB] flex items-center justify-center flex-shrink-0 text-white animate-pulse">
            <Volume2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-[#1A56DB]">
              Playing Voice Guidance...
            </p>
            <p className="text-[15px] font-bold text-[#0A192F] truncate">
              &quot;Welcome to ElderEase. Tap the...&quot;
            </p>
          </div>
        </div>

        <button
          onClick={handleReplay}
          id="welcome-replay-voice"
          className="flex items-center gap-1 bg-white border-2 border-[#1A56DB] px-3 py-1.5 rounded-xl text-[14px] font-bold text-[#1A56DB] hover:bg-[#F0F3FF] active:scale-95 transition-all shadow-sm flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Replay</span>
        </button>
      </div>

      {/* Hero Brand Icon & Header */}
      <div className="text-center mt-6 mb-4">
        <div className="inline-block relative">
          <div className="w-24 h-24 rounded-3xl bg-white border-2 border-[#1A56DB] flex items-center justify-center mx-auto shadow-lg relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A56DB] to-[#003fb1] flex items-center justify-center shadow-inner">
              <svg
                className="w-10 h-10 text-white fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            {/* Small center dot as seen in mockup icon */}
            <span className="absolute bottom-6 w-2.5 h-2.5 bg-[#7cf994] rounded-full border border-white"></span>
          </div>
          <div className="absolute -inset-2 bg-blue-100/60 rounded-3xl blur-md -z-0"></div>
        </div>

        <h1 className="text-[34px] font-extrabold text-[#0A192F] tracking-tight mt-4">
          ElderEase AI
        </h1>
        <p className="text-[20px] font-bold text-gray-700 mt-1">
          Welcome! Let&apos;s get you set up.
        </p>
      </div>

      {/* 4 Core Value Cards */}
      <div className="space-y-3 my-4">
        {/* Extra Large Text */}
        <div className="bg-white border-2 border-[#D1D5DB] rounded-2xl p-3.5 flex items-start gap-3.5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#E8EEFF] border border-[#1A56DB]/30 flex items-center justify-center flex-shrink-0 text-[#1A56DB]">
            <Type className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[18px] font-extrabold text-[#0A192F]">
              Extra-Large Text
            </h2>
            <p className="text-[15px] font-medium text-gray-600 leading-snug">
              Clear, comfortable reading with zero squinting required.
            </p>
          </div>
        </div>

        {/* Spoken Assistance */}
        <div className="bg-white border-2 border-[#D1D5DB] rounded-2xl p-3.5 flex items-start gap-3.5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#E8EEFF] border border-[#1A56DB]/30 flex items-center justify-center flex-shrink-0 text-[#1A56DB]">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[18px] font-extrabold text-[#0A192F]">
              Spoken Assistance
            </h2>
            <p className="text-[15px] font-medium text-gray-600 leading-snug">
              Speak naturally. ElderEase listens, guides, and reminds you gently.
            </p>
          </div>
        </div>

        {/* Family & Caregiver Sync */}
        <div className="bg-white border-2 border-[#D1D5DB] rounded-2xl p-3.5 flex items-start gap-3.5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] border border-[#16A34A]/30 flex items-center justify-center flex-shrink-0 text-[#16A34A]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[18px] font-extrabold text-[#0A192F]">
              Family & Caregiver Sync
            </h2>
            <p className="text-[15px] font-medium text-gray-600 leading-snug">
              Keeps your trusted loved ones peacefully in the loop.
            </p>
          </div>
        </div>

        {/* One-Tap Emergency Help */}
        <div className="bg-white border-2 border-[#D1D5DB] rounded-2xl p-3.5 flex items-start gap-3.5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] border border-[#DC2626]/30 flex items-center justify-center flex-shrink-0 text-[#DC2626]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[18px] font-extrabold text-[#0A192F]">
              One-Tap Emergency Help
            </h2>
            <p className="text-[15px] font-medium text-gray-600 leading-snug">
              Immediate assistance always available with a single press.
            </p>
          </div>
        </div>
      </div>

      {/* Big Action Button */}
      <div className="mt-4 mb-2">
        <button
          onClick={onStart}
          id="welcome-get-started-btn"
          className="w-full h-[64px] bg-[#1A56DB] hover:bg-[#1546b3] text-white rounded-2xl border-2 border-[#0F172A] tactile-btn flex items-center justify-center gap-3 text-[22px] font-extrabold"
        >
          <span>Get Started</span>
          <ArrowRight className="w-6 h-6 stroke-[3]" />
        </button>
        <p className="text-center text-[15px] font-bold text-gray-600 mt-2.5">
          Takes less than two minutes
        </p>
      </div>
    </div>
  );
};
