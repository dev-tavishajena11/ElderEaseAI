import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Users,
  ShieldAlert,
  Volume2,
  CheckCircle,
  Phone,
  Navigation,
  MapPin,
  HeartHandshake
} from 'lucide-react';
import { speechService } from '../services/speech';
import { UserPreferences } from '../types';

interface EmergencySOSProps {
  preferences: UserPreferences;
  onCancelEmergency: () => void;
  onDispatchTriggered: () => void;
}

export const EmergencySOS: React.FC<EmergencySOSProps> = ({
  preferences,
  onCancelEmergency,
  onDispatchTriggered,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [isCanceled, setIsCanceled] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [callingSarah, setCallingSarah] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial voice announcement
  useEffect(() => {
    if (preferences.speakAloud) {
      speechService.speak(
        `Calling your daughter Sarah and 911 Emergency Services in 10 seconds. Tap the green button below to cancel.`,
        undefined,
        true
      );
    }
  }, [preferences.speakAloud]);

  // Countdown timer without side effects in state updater
  useEffect(() => {
    if (isCanceled || isDispatched) return;

    if (secondsLeft <= 0) {
      setIsDispatched(true);
      speechService.playEmergencyBeep();
      speechService.speak(
        "Emergency call placed. First responders and your daughter Sarah have received your live location.",
        undefined,
        true
      );
      onDispatchTriggered();
      return;
    }

    timerRef.current = setTimeout(() => {
      speechService.playEmergencyBeep();
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [secondsLeft, isCanceled, isDispatched, onDispatchTriggered]);

  const handleCancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsCanceled(true);
    speechService.stop();
    speechService.playSuccessChime();
    speechService.speak("Emergency canceled. You are safe, Eleanor.");
    setTimeout(() => {
      onCancelEmergency();
    }, 1200);
  };

  const handleManualCallSarah = () => {
    speechService.speak("Connecting audio call to Sarah at 555 0192.");
    setCallingSarah(true);
    setTimeout(() => {
      setCallingSarah(false);
    }, 4000);
  };

  return (
    <div className="pb-36 px-3 pt-2 max-w-md mx-auto space-y-4 animate-fade-in">
      {/* EMERGENCY SOS BANNER CARD (Image 7) */}
      <div className="bg-[#98000C] text-white rounded-3xl p-5 border-2 border-[#5C0007] shadow-xl text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-[#98000C] rounded-full text-[14px] font-extrabold uppercase tracking-wide shadow-sm mb-3">
          <AlertTriangle className="w-4 h-4 text-[#98000C]" />
          <span>Emergency SOS</span>
        </div>

        <h2 className="text-[20px] font-extrabold tracking-wider uppercase text-red-100">
          {isDispatched ? 'HELP IS ON THE WAY' : 'CALLING FOR HELP IN...'}
        </h2>

        {/* Large Circular Countdown (Image 7) */}
        <div className="my-5 flex justify-center">
          <div className="relative w-44 h-44 rounded-full bg-gradient-to-b from-[#b3000f] to-[#730009] p-3 flex items-center justify-center shadow-inner border-4 border-red-400/40">
            <div className="w-full h-full rounded-full bg-white text-[#98000C] flex flex-col items-center justify-center shadow-lg border-2 border-red-100">
              <span className="text-[52px] font-black tracking-tight leading-none">
                {isDispatched ? '00' : String(secondsLeft).padStart(2, '0')}
              </span>
              <span className="text-[13px] font-extrabold tracking-widest uppercase text-[#98000C] mt-1">
                {isDispatched ? 'DISPATCHED' : 'SECONDS'}
              </span>
            </div>
          </div>
        </div>

        {/* Dual Recipient Status Boxes (Image 7) */}
        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="bg-[#780009] border border-red-400/30 rounded-2xl p-3 flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[14px] font-extrabold text-white leading-tight">
                Sarah (Daughter)
              </p>
              <p className="text-[12px] font-medium text-red-200 mt-0.5">
                {isDispatched ? 'SMS sent with GPS' : 'Auto-dialing ready...'}
              </p>
            </div>
          </div>

          <div className="bg-[#780009] border border-red-400/30 rounded-2xl p-3 flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[14px] font-extrabold text-white leading-tight">
                911 Responders
              </p>
              <p className="text-[12px] font-medium text-red-200 mt-0.5">
                {isDispatched ? 'Live line connected' : 'CAD dispatch queued...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Announcement Active Card (Image 7) */}
      <div className="bg-[#E8EEFF] border-2 border-[#1A56DB] rounded-2xl p-4 flex items-start gap-3 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-[#1A56DB] text-white flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
          <Volume2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[13px] font-extrabold text-[#1A56DB] uppercase tracking-wide">
            Voice Announcement Active
          </p>
          <p className="text-[16px] font-bold text-[#0A192F] leading-snug mt-0.5">
            &quot;Calling your daughter <span className="text-[#1A56DB] font-extrabold">Sarah</span> and <span className="text-[#DC2626] font-extrabold">911 Emergency Services</span> in {secondsLeft} seconds. Tap the green button below to cancel.&quot;
          </p>
        </div>
      </div>

      {/* Enormous Green Cancel Emergency Button (Image 7) */}
      {!isDispatched ? (
        <button
          onClick={handleCancel}
          disabled={isCanceled}
          id="emergency-cancel-btn"
          className={`w-full min-h-[96px] ${
            isCanceled
              ? 'bg-gray-700 border-gray-900 cursor-default'
              : 'bg-[#16A34A] hover:bg-[#13833a] active:bg-[#0f6b2e] border-[#0F172A] tactile-btn-green'
          } text-white rounded-3xl border-3 p-4 flex items-center justify-center gap-4 transition-all shadow-lg`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <div className="text-left">
            <span className="block text-[24px] font-black tracking-tight leading-tight">
              {isCanceled ? 'EMERGENCY CANCELED' : 'CANCEL EMERGENCY'}
            </span>
            <span className="block text-[15px] font-bold text-green-100">
              {isCanceled ? 'You are safe. Standing down.' : 'Tap here if this was an accident'}
            </span>
          </div>
        </button>
      ) : (
        <button
          onClick={handleCancel}
          id="emergency-stand-down-btn"
          className="w-full h-[64px] bg-gray-800 text-white rounded-2xl font-extrabold text-[18px] border-2 border-black flex items-center justify-center gap-2"
        >
          <span>End Active Alert &amp; Stand Down</span>
        </button>
      )}

      {/* CRITICAL RESPONDER PROFILE (Image 7) */}
      <div className="bg-white border-2 border-[#D1D5DB] rounded-3xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-[#1A56DB]" />
            <h3 className="text-[20px] font-extrabold text-[#0A192F]">
              Critical Responder Profile
            </h3>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-[#DCFCE7] border border-[#16A34A] rounded-full text-[13px] font-extrabold text-[#14532D]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping"></span>
            Transmitting
          </span>
        </div>

        {/* Patient & Blood Type Columns (Image 7) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-3">
            <p className="text-[12px] font-extrabold text-gray-500 uppercase tracking-wide">
              Patient
            </p>
            <p className="text-[18px] font-extrabold text-[#0A192F] mt-0.5">
              Eleanor Vance
            </p>
            <p className="text-[14px] font-bold text-gray-600">
              Age 78 • Female
            </p>
          </div>

          <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-3">
            <p className="text-[12px] font-extrabold text-gray-500 uppercase tracking-wide">
              Blood Type
            </p>
            <p className="text-[18px] font-extrabold text-[#DC2626] mt-0.5">
              O Positive (O+)
            </p>
            <p className="text-[14px] font-bold text-gray-600">
              Donor Card on File
            </p>
          </div>
        </div>

        {/* CRITICAL ALLERGY High Contrast Alert (Image 7) */}
        <div className="bg-[#FEE2E2] border-2 border-[#DC2626] rounded-2xl p-3.5">
          <p className="text-[13px] font-extrabold text-[#DC2626] uppercase tracking-wide flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Critical Allergy</span>
          </p>
          <p className="text-[20px] font-black text-[#7F1D1D] mt-0.5">
            PENICILLIN (Severe / Anaphylaxis)
          </p>
        </div>

        {/* Daughter Contact & GPS Info (Image 7) */}
        <div className="space-y-2">
          <div className="bg-[#F0F3FF] border border-[#D1D5DB] rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#1A56DB]" />
              <div>
                <span className="text-[14px] font-extrabold text-gray-700">Daughter Contact:</span>{' '}
                <span className="text-[16px] font-extrabold text-[#0A192F]">Sarah • (555) 0192</span>
              </div>
            </div>
            <button
              onClick={handleManualCallSarah}
              className={`text-[13px] font-extrabold px-3 py-1.5 rounded-xl transition-all ${
                callingSarah
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-[#1A56DB] text-white hover:bg-[#1546b3]'
              }`}
            >
              {callingSarah ? 'Calling...' : 'Call'}
            </button>
          </div>

          <div className="bg-[#F0F3FF] border border-[#D1D5DB] rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[14px] font-extrabold text-gray-700">GPS Location:</span>{' '}
                <span className="text-[15px] font-extrabold text-emerald-700">Sharing Live Coordinates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Visual (Image 7) */}
        <div className="rounded-2xl overflow-hidden border-2 border-[#D1D5DB] relative h-36 bg-slate-200">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80"
            alt="Map location of 742 Evergreen Ter"
            className="w-full h-full object-cover filter contrast-125"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-blue-900/20 pointer-events-none"></div>

          {/* Location Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#1A56DB] border-3 border-white text-white flex items-center justify-center shadow-lg animate-bounce">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="w-12 h-3 bg-black/40 rounded-full blur-[2px]"></div>
          </div>

          {/* Map bottom banner */}
          <div className="absolute bottom-2 inset-x-2 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-xl px-3 py-1.5 flex items-center justify-between shadow-sm">
            <span className="text-[14px] font-extrabold text-[#0A192F] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#1A56DB]" />
              742 Evergreen Ter ± 3m Precision
            </span>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              DISPATCH CONFIRMED
            </span>
          </div>
        </div>
      </div>

      {/* Non-medical prompt (Image 7) */}
      <div className="text-center py-2 px-3">
        <p className="text-[16px] font-bold text-gray-700">
          Need urgent non-medical help? Say
        </p>
        <p className="text-[18px] font-extrabold text-[#1A56DB] mt-0.5">
          &quot;Hey Companion, Call Sarah&quot; anytime.
        </p>
      </div>
    </div>
  );
};
