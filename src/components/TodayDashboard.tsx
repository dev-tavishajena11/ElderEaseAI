import React, { useState } from 'react';
import { Sun, Heart, Clock, Volume2, CheckCircle, Car, Calendar, Sparkles, Check } from 'lucide-react';
import { MedicationTask, AppointmentItem, UserPreferences } from '../types';
import { speechService } from '../services/speech';

interface TodayDashboardProps {
  preferences: UserPreferences;
  medication: MedicationTask;
  appointments: AppointmentItem[];
  onTakeMedication: () => void;
  onOpenScanner: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  preferences,
  medication,
  appointments,
  onTakeMedication,
}) => {
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);

  const morningGreetingText =
    medication.status === 'taken'
      ? "Good morning, Eleanor! It is Saturday, September 19. All your morning medication has been taken. Have a lovely day!"
      : "Good morning, Eleanor! It is Saturday, September 19. You have 1 medication due at 2:00 PM.";

  const handlePlayGreeting = () => {
    setIsPlayingGreeting(true);
    speechService.speak(morningGreetingText, () => setIsPlayingGreeting(false), true);
  };

  const handleReadMedInstructions = () => {
    const text = "Blood Pressure Pill. Scheduled for 2:00 PM after lunch. Take one red tablet with a full glass of water.";
    speechService.speak(text, undefined, true);
  };

  const handleConfirmMedication = () => {
    speechService.playSuccessChime();
    onTakeMedication();
    if (preferences.speakAloud) {
      speechService.speak("Wonderful job, Eleanor! Your blood pressure pill is recorded and confirmed to your daughter Sarah.");
    }
  };

  const isXl = preferences.textSize === 'xl';

  return (
    <div className="pb-32 px-3 pt-2 max-w-md mx-auto space-y-4 animate-fade-in">
      {/* Weather Chip */}
      <div className="bg-[#F0F3FF] border border-[#D1D5DB] rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
            <Sun className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[16px] font-extrabold text-[#0A192F]">Oakridge</span>{' '}
            <span className="text-[15px] font-semibold text-gray-700">Sunny, 72°F</span>
          </div>
        </div>
        <span className="px-3 py-1 bg-white border border-[#D1D5DB] rounded-full text-[13px] font-extrabold text-[#1A56DB]">
          Gentle Weather
        </span>
      </div>

      {/* TODAY'S OUTLOOK - Dark Navy Card (Image 5) */}
      <div className="bg-[#0D1C32] text-white rounded-3xl p-5 border-2 border-[#1E293B] shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[13px] font-extrabold tracking-wider uppercase text-blue-200">
            <Heart className="w-3.5 h-3.5 fill-blue-300 text-blue-300" />
            <span>Today&apos;s Outlook</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-extrabold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              Up to Date
            </span>
            <button
              onClick={handlePlayGreeting}
              id="outlook-read-aloud-btn"
              title="Listen to today's summary"
              className={`p-1.5 rounded-full border border-white/20 transition-all ${
                isPlayingGreeting ? 'bg-[#1A56DB] text-white scale-110' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h2 className={`${isXl ? 'text-[32px]' : 'text-[28px]'} font-extrabold tracking-tight leading-tight text-white`}>
          Good morning, Eleanor!
        </h2>

        <p className={`${isXl ? 'text-[21px]' : 'text-[18px]'} font-semibold text-gray-300 mt-1`}>
          It is <strong className="text-white font-extrabold">Saturday, September 19</strong>.
        </p>

        {/* Highlight box */}
        <div className="mt-4 bg-[#142A4A] border border-[#234575] rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/90 text-white flex items-center justify-center font-extrabold text-[20px] shadow-sm flex-shrink-0">
            {medication.status === 'taken' ? '✓' : '1'}
          </div>
          <p className={`${isXl ? 'text-[19px]' : 'text-[17px]'} font-bold leading-snug`}>
            {medication.status === 'taken' ? (
              <span className="text-emerald-300">All morning medication confirmed!</span>
            ) : (
              <>
                You have <span className="text-emerald-300 font-extrabold underline">medication</span> due at 2:00 PM.
              </>
            )}
          </p>
        </div>
      </div>

      {/* ACTIVE HERO TASK CARD - Next Up (Image 5) */}
      <div
        className={`rounded-3xl border-2 transition-all p-4 shadow-md ${
          medication.status === 'taken'
            ? 'bg-[#DCFCE7] border-[#16A34A]'
            : 'bg-white border-[#D1D5DB]'
        }`}
      >
        {/* Top Tag Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#1A56DB] animate-ping" />
            <span className="text-[13px] font-extrabold tracking-wider uppercase text-[#1A56DB]">
              Next Up
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#E8EEFF] text-[#1A56DB] border border-[#1A56DB]/30 rounded-full text-[14px] font-extrabold">
            <Clock className="w-4 h-4" />
            <span>{medication.status === 'taken' ? 'Completed' : medication.dueInHours}</span>
          </div>
        </div>

        {/* Task Title */}
        <h3 className={`${isXl ? 'text-[28px]' : 'text-[24px]'} font-extrabold text-[#0A192F] mb-3`}>
          {medication.title}
        </h3>

        {/* Content Box */}
        <div className="bg-[#F0F3FF] border border-[#D1D5DB] rounded-2xl p-3.5 flex items-center gap-3.5 mb-3">
          {/* Pill Graphic / Real Photo thumbnail */}
          <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#D1D5DB] overflow-hidden flex-shrink-0 shadow-inner relative flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80"
              alt="Red blood pressure tablet"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {medication.status === 'taken' && (
              <div className="absolute inset-0 bg-[#16A34A]/80 flex items-center justify-center text-white">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[20px] font-extrabold text-[#1A56DB]">
                {medication.time}
              </span>
              <span className="text-[15px] font-bold text-gray-600">• After lunch</span>
            </div>
            <p className={`${isXl ? 'text-[18px]' : 'text-[16px]'} font-bold text-[#0A192F] leading-snug`}>
              Take <span className="text-[#DC2626] underline font-extrabold">1 red tablet</span> with a full glass of water.
            </p>
          </div>
        </div>

        {/* Read Instructions Aloud Button */}
        <button
          onClick={handleReadMedInstructions}
          id="task-read-instructions-btn"
          className="w-full h-[54px] bg-[#E8EEFF] hover:bg-[#d4e2ff] text-[#1A56DB] rounded-2xl border-2 border-[#1A56DB] font-extrabold text-[17px] flex items-center justify-center gap-2 mb-3 active:scale-[0.99] transition-all"
        >
          <Volume2 className="w-5 h-5" />
          <span>Read Instructions Aloud</span>
        </button>

        {/* Primary Action: I Have Taken This */}
        {medication.status !== 'taken' ? (
          <button
            onClick={handleConfirmMedication}
            id="task-confirm-taken-btn"
            className="w-full h-[64px] bg-[#1A56DB] hover:bg-[#1447b8] text-white rounded-2xl border-2 border-[#0F172A] tactile-btn flex items-center justify-center gap-3 text-[21px] font-extrabold"
          >
            <CheckCircle className="w-7 h-7 stroke-[2.5]" />
            <span>I Have Taken This</span>
          </button>
        ) : (
          <div className="bg-[#16A34A] text-white rounded-2xl p-4 flex items-center justify-center gap-3 border-2 border-[#14532D]">
            <Check className="w-7 h-7 stroke-[3]" />
            <span className="text-[20px] font-extrabold">
              Taken &amp; Confirmed (8:15 AM)
            </span>
          </div>
        )}

        {/* Sarah Auto-confirm note */}
        <div className="mt-3 flex items-center gap-2 text-[14px] font-bold text-gray-600 justify-center">
          <CheckCircle className="w-4 h-4 text-[#16A34A]" />
          <span>Automatically confirms to Sarah&apos;s caregiver app upon completion.</span>
        </div>
      </div>

      {/* UPCOMING SCHEDULE SECTION (Image 5) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[22px] font-extrabold text-[#0A192F]">
            Upcoming Schedule
          </h3>
          <span className="px-3 py-1 bg-[#E8EEFF] border border-[#1A56DB]/30 rounded-full text-[14px] font-extrabold text-[#1A56DB]">
            {appointments.length} Remaining
          </span>
        </div>

        <div className="space-y-3">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className={`bg-white border-2 rounded-2xl p-4 shadow-sm transition-all ${
                appt.isNew ? 'border-[#1A56DB] ring-2 ring-[#1A56DB]/30' : 'border-[#D1D5DB]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 flex-shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className={`${isXl ? 'text-[20px]' : 'text-[18px]'} font-extrabold text-[#0A192F]`}>
                      {appt.title}
                    </h4>
                    <p className="text-[15px] font-bold text-gray-600">
                      {appt.clinicNote}
                    </p>
                  </div>
                </div>
                <span className="text-[18px] font-extrabold text-[#1A56DB] whitespace-nowrap">
                  {appt.time}
                </span>
              </div>

              {/* Status Ride Badge */}
              <div className="mt-2 bg-[#DCFCE7] border border-[#16A34A] rounded-xl px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#16A34A]" />
                  <span className="text-[14px] font-extrabold text-[#14532D]">
                    {appt.rideStatus}
                  </span>
                </div>
                {appt.isNew && (
                  <span className="flex items-center gap-1 text-[12px] font-extrabold text-[#1A56DB] bg-white px-2 py-0.5 rounded-md">
                    <Sparkles className="w-3 h-3 text-[#1A56DB]" /> Added via Scan
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
