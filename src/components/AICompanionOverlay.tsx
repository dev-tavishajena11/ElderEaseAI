import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  ArrowRight,
  Compass
} from 'lucide-react';
import { speechService } from '../services/speech';
import { MedicationTask, AppointmentItem, ScreenTab } from '../types';

interface AICompanionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: ScreenTab;
  medication: MedicationTask;
  appointments: AppointmentItem[];
  onTriggerSpotlight: (target: 'assist-nav' | 'emergency-nav' | 'today-card') => void;
  onNavigateToTab: (tab: ScreenTab) => void;
}

export const AICompanionOverlay: React.FC<AICompanionOverlayProps> = ({
  isOpen,
  onClose,
  currentTab,
  medication,
  appointments,
  onTriggerSpotlight,
  onNavigateToTab,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Common elder queries for one-tap convenience
  const seniorPrompts = [
    'Did I take my blood pressure medicine today?',
    'What time is my doctor appointment?',
    'How do I add a new reminder?',
    'What should I do before my cardiology visit?',
    'Call my daughter Sarah',
  ];

  useEffect(() => {
    if (isOpen) {
      setIsListening(true);
      setUserQuery('');
      setAiResponse(null);
      // Greet gently
      speechService.speak("I'm listening, Eleanor. How can I help you today?", undefined, true);
    } else {
      setIsListening(false);
      speechService.stop();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const processQuery = (query: string) => {
    setUserQuery(query);
    setIsListening(false);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      let answer = '';

      const lower = query.toLowerCase();

      if (lower.includes('blood pressure') || lower.includes('medicine') || lower.includes('pill')) {
        if (medication.status === 'taken') {
          answer = "Yes, Eleanor! You took your blood pressure medicine this morning at 8:15 AM. It was recorded and confirmed with Sarah.";
        } else {
          answer = "Not yet, Eleanor. You have your Blood Pressure pill due at 2:00 PM today after lunch. Remember to take one red tablet with water.";
        }
      } else if (lower.includes('doctor') || lower.includes('appointment') || lower.includes('smith')) {
        const appt = appointments[0];
        answer = `You have an appointment with ${appt.doctor} today at ${appt.time} for a ${appt.clinicNote}. Your ride is already confirmed!`;
      } else if (lower.includes('how do i') || lower.includes('add a new reminder') || lower.includes('scanner') || lower.includes('scan')) {
        answer = "Tap the blue camera button highlighted on your screen to scan a document, or tap the microphone to tell me what to add.";
        // Trigger the animated Spotlight Ring on the assist scanner button!
        onTriggerSpotlight('assist-nav');
      } else if (lower.includes('before') || lower.includes('eat') || lower.includes('breakfast')) {
        answer = "Important clinic note from Dr. Smith: Please do not eat breakfast before coming to your appointment.";
      } else if (lower.includes('sarah') || lower.includes('daughter') || lower.includes('call')) {
        answer = "I am preparing a quick call to your daughter Sarah at 555-0192.";
      } else {
        answer = `I hear you, Eleanor. Right now you are on the ${currentTab.toUpperCase()} screen. Everything is in order and your family is connected.`;
      }

      setAiResponse(answer);
      speechService.speak(answer, undefined, true);
    }, 600);
  };

  const handleSpotlightAction = () => {
    onTriggerSpotlight('assist-nav');
    onNavigateToTab('assist');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col justify-end max-w-md mx-auto animate-fade-in">
      {/* Overlay Body Sheet */}
      <div className="bg-[#FDFBF7] rounded-t-3xl border-t-3 border-[#1A56DB] p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1A56DB] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[19px] font-black text-[#0A192F]">
                ElderEase Companion
              </h3>
              <p className="text-[13px] font-bold text-[#1A56DB]">
                Screen-Aware Voice Assistant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="companion-close-btn"
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-800 font-extrabold"
            aria-label="Close Assistant"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Animated Circular Warmth Ring (Step 4.2 in spec) */}
        <div className="py-6 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Outer Expanding Waves */}
            <div
              className={`absolute w-36 h-36 rounded-full bg-[#1A56DB]/15 transition-all duration-1000 ${
                isListening ? 'animate-ping scale-110' : 'scale-95'
              }`}
            />
            <div
              className={`absolute w-28 h-28 rounded-full bg-[#1A56DB]/25 transition-all duration-700 ${
                isListening ? 'scale-110' : 'scale-100'
              }`}
            />
            {/* Center Mic Hub */}
            <button
              onClick={() => {
                if (isListening) {
                  setIsListening(false);
                } else {
                  setIsListening(true);
                  setAiResponse(null);
                  speechService.speak("I am listening, Eleanor.");
                }
              }}
              id="companion-center-mic"
              className={`relative z-10 w-20 h-20 rounded-full border-3 flex items-center justify-center text-white shadow-xl transition-all ${
                isListening
                  ? 'bg-[#1A56DB] border-[#0A192F] scale-105'
                  : 'bg-emerald-600 border-[#0A192F]'
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 animate-pulse stroke-[2.5]" />
              ) : (
                <MicOff className="w-9 h-9 stroke-[2]" />
              )}
            </button>
          </div>

          <p className="text-[16px] font-extrabold text-[#1A56DB] mt-4 uppercase tracking-wider">
            {isListening
              ? 'Listening patiently to your voice...'
              : isProcessing
              ? 'Checking your schedule...'
              : 'Tap microphone to speak'}
          </p>
        </div>

        {/* Real-time Captioning & User Words (Step 4.2) */}
        {userQuery && (
          <div className="bg-[#E8EEFF] border-2 border-[#1A56DB] rounded-2xl p-4 mb-4">
            <p className="text-[13px] font-extrabold uppercase tracking-wide text-[#1A56DB]">
              You Asked:
            </p>
            <p className="text-[23px] font-black text-[#0A192F] leading-snug mt-1">
              &quot;{userQuery}&quot;
            </p>
          </div>
        )}

        {/* Context-Extracted AI Response Card (Step 4.3) */}
        {aiResponse && (
          <div className="bg-white border-2 border-[#16A34A] rounded-2xl p-4 mb-4 shadow-md space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[14px] font-extrabold text-[#16A34A] uppercase">
                <Volume2 className="w-4 h-4" /> Speaking Aloud (0.8x unhurried)
              </span>
              <button
                onClick={() => speechService.speak(aiResponse, undefined, true)}
                className="text-[13px] font-extrabold text-[#1A56DB] bg-[#E8EEFF] px-2.5 py-1 rounded-lg"
              >
                Replay
              </button>
            </div>

            <p className="text-[20px] font-extrabold text-[#0A192F] leading-relaxed">
              {aiResponse}
            </p>

            {/* If user asked how to add reminder, show Spotlight Action Button (Step 4.4) */}
            {userQuery.toLowerCase().includes('how do i') ||
            userQuery.toLowerCase().includes('add') ||
            userQuery.toLowerCase().includes('reminder') ? (
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={handleSpotlightAction}
                  id="spotlight-action-go-btn"
                  className="w-full py-3 bg-[#1A56DB] hover:bg-[#1546b3] text-white rounded-xl font-extrabold text-[17px] flex items-center justify-center gap-2 EE-SpotlightRing shadow-md"
                >
                  <Compass className="w-5 h-5" />
                  <span>Show me the Camera Scanner</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Suggested Senior Questions (Quick Tap for ease of use) */}
        <div>
          <p className="text-[14px] font-extrabold text-gray-600 mb-2">
            Or tap a question:
          </p>
          <div className="space-y-2">
            {seniorPrompts.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => processQuery(promptText)}
                className="w-full text-left p-3 rounded-xl bg-white border-2 border-[#D1D5DB] hover:border-[#1A56DB] hover:bg-[#F0F3FF] text-[16px] font-extrabold text-[#0A192F] flex items-center justify-between transition-all"
              >
                <span>&quot;{promptText}&quot;</span>
                <ArrowRight className="w-4 h-4 text-[#1A56DB] flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5">
          <button
            onClick={onClose}
            id="companion-done-btn"
            className="w-full h-[58px] bg-gray-200 hover:bg-gray-300 text-[#0A192F] rounded-2xl font-extrabold text-[18px] flex items-center justify-center gap-2"
          >
            <span>Close Assistant</span>
          </button>
        </div>
      </div>
    </div>
  );
};
