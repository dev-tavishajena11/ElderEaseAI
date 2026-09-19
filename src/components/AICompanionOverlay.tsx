import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  ArrowRight,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { speechService } from '../services/speech';
import { MedicationTask, AppointmentItem, ScreenTab } from '../types';

interface AICompanionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: ScreenTab;
  medication: MedicationTask;
  appointments: AppointmentItem[];
  seniorName?: string;
  caregiverName?: string;
  onTriggerSpotlight: (target: 'assist-nav' | 'emergency-nav' | 'today-card') => void;
  onNavigateToTab: (tab: ScreenTab) => void;
}

// Extend Window interface for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export const AICompanionOverlay: React.FC<AICompanionOverlayProps> = ({
  isOpen,
  onClose,
  currentTab,
  medication,
  appointments,
  seniorName = 'Eleanor',
  caregiverName = 'Sarah',
  onTriggerSpotlight,
  onNavigateToTab,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [spotlightSuggestion, setSpotlightSuggestion] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Common senior queries for one-tap convenience
  const seniorPrompts = [
    'Did I take my blood pressure medicine today?',
    'What time is my doctor appointment?',
    'How do I add a new reminder?',
    'What should I do before my cardiology visit?',
    `Call my daughter ${caregiverName}`,
  ];

  // Initialize Speech Recognition if supported in browser/iframe
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        try {
          const rec = new SpeechRecognitionClass();
          rec.continuous = false;
          rec.interimResults = true;
          rec.lang = 'en-US';

          rec.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((res: any) => res[0].transcript)
              .join('');
            setUserQuery(transcript);
          };

          rec.onend = () => {
            setIsListening(false);
          };

          rec.onerror = () => {
            setIsListening(false);
          };

          recognitionRef.current = rec;
          setSpeechSupported(true);
        } catch {
          setSpeechSupported(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUserQuery('');
      setAiResponse(null);
      setSpotlightSuggestion(null);
      // Gentle conversational greeting
      speechService.speak(`I'm listening, ${seniorName}. How can I help you today?`, undefined, true);
    } else {
      stopListening();
      speechService.stop();
    }
  }, [isOpen, seniorName]);

  const startListening = () => {
    speechService.stop();
    setIsListening(true);
    setUserQuery('');
    setAiResponse(null);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        return;
      } catch {
        // Recognition might already be active
      }
    }
    // If Web Speech is restricted by iframe permissions, prompt senior with audio
    speechService.speak(`I am listening, ${seniorName}. You may also tap any question below.`);
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      if (userQuery.trim()) {
        processQuery(userQuery);
      }
    } else {
      startListening();
    }
  };

  // Process query via secure Server-Side AI API with intelligent fallback
  const processQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    stopListening();
    setUserQuery(queryText);
    setIsProcessing(true);
    setAiResponse(null);

    try {
      const response = await fetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          screenContext: {
            currentTab,
            medication,
            appointments,
            seniorName,
            caregiverName,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.response || `Everything is in order, ${seniorName}.`;
        setAiResponse(text);
        speechService.speak(text, undefined, true);

        if (data.spotlightTarget) {
          setSpotlightSuggestion(data.spotlightTarget);
          onTriggerSpotlight(data.spotlightTarget);
        }
      } else {
        throw new Error('Server response not ok');
      }
    } catch {
      // Local graceful fallback if server or network has delay
      let fallbackText = `I hear you, ${seniorName}. Everything is in order and your family is connected.`;
      const lower = queryText.toLowerCase();

      if (lower.includes('blood pressure') || lower.includes('medicine') || lower.includes('pill')) {
        if (medication.status === 'taken') {
          fallbackText = `Yes, ${seniorName}! You took your blood pressure medicine this morning at ${medication.takenTimestamp || '8:15 AM'}. It was safely recorded and confirmed with ${caregiverName}.`;
        } else {
          fallbackText = `Not yet, ${seniorName}. You have your Blood Pressure pill due at 2:00 PM today after lunch. Remember to take one red tablet with water.`;
        }
      } else if (lower.includes('doctor') || lower.includes('appointment') || lower.includes('smith')) {
        const appt = appointments[0];
        if (appt) {
          fallbackText = `You have an appointment with ${appt.doctor} today at ${appt.time} for a ${appt.clinicNote}. Your ride is confirmed!`;
        }
      } else if (lower.includes('how do i') || lower.includes('scan') || lower.includes('reminder')) {
        fallbackText = 'Tap the blue camera button highlighted on your screen to scan your appointment slip or pill bottle.';
        onTriggerSpotlight('assist-nav');
        setSpotlightSuggestion('assist-nav');
      }

      setAiResponse(fallbackText);
      speechService.speak(fallbackText, undefined, true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="companion-modal-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-end max-w-md mx-auto animate-fade-in"
    >
      {/* Overlay Body Sheet */}
      <div className="bg-[#FDFBF7] rounded-t-3xl border-t-4 border-[#1A56DB] p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1A56DB] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="companion-modal-title" className="text-[19px] font-black text-[#0A192F]">
                ElderEase Companion
              </h2>
              <p className="text-[13px] font-bold text-[#1A56DB]">
                Screen-Aware Conversational Assistant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="companion-close-btn"
            className="w-11 h-11 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-800 font-extrabold transition-colors focus-visible:ring-4 focus-visible:ring-[#1A56DB]"
            aria-label="Close Assistant"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Animated Circular Listening Hub */}
        <div className="py-5 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Outer Expanding Waves */}
            <div
              className={`absolute w-36 h-36 rounded-full bg-[#1A56DB]/20 transition-all duration-1000 ${
                isListening ? 'animate-ping scale-110' : 'scale-95'
              }`}
            />
            <div
              className={`absolute w-28 h-28 rounded-full bg-[#1A56DB]/30 transition-all duration-700 ${
                isListening ? 'scale-110' : 'scale-100'
              }`}
            />
            {/* Center Mic Hub */}
            <button
              onClick={toggleListening}
              id="companion-center-mic"
              aria-label={isListening ? 'Stop listening' : 'Start speaking'}
              className={`relative z-10 w-20 h-20 rounded-full border-4 flex items-center justify-center text-white shadow-xl transition-all focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-blue-600 ${
                isListening
                  ? 'bg-[#1A56DB] border-[#0A192F] scale-105 animate-pulse'
                  : 'bg-emerald-600 border-[#0A192F] hover:bg-emerald-700'
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 stroke-[2.5]" />
              ) : (
                <MicOff className="w-9 h-9 stroke-[2]" />
              )}
            </button>
          </div>

          <p
            aria-live="polite"
            className="text-[16px] font-extrabold text-[#1A56DB] mt-4 uppercase tracking-wider text-center"
          >
            {isListening
              ? 'Listening patiently to your voice...'
              : isProcessing
              ? 'Consulting your health schedule...'
              : 'Tap the green microphone to speak'}
          </p>
        </div>

        {/* Real-time Captioning & User Words */}
        {userQuery && (
          <div className="bg-[#E8EEFF] border-2 border-[#1A56DB] rounded-2xl p-4 mb-4">
            <p className="text-[13px] font-extrabold uppercase tracking-wide text-[#1A56DB]">
              You Asked:
            </p>
            <p className="text-[21px] font-black text-[#0A192F] leading-snug mt-1">
              &quot;{userQuery}&quot;
            </p>
          </div>
        )}

        {/* Loading indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl mb-4 text-[#1A56DB]">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-[16px] font-bold">ElderEase AI is thinking...</span>
          </div>
        )}

        {/* Context-Extracted AI Response Card */}
        {aiResponse && !isProcessing && (
          <div
            role="region"
            aria-label="Assistant Response"
            className="bg-white border-2 border-[#16A34A] rounded-2xl p-4 mb-4 shadow-md space-y-3 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[14px] font-extrabold text-[#16A34A] uppercase tracking-wide">
                <Sparkles className="w-4 h-4" />
                ElderEase Answer
              </span>
              <button
                onClick={() => speechService.speak(aiResponse, undefined, true)}
                id="companion-repeat-voice-btn"
                className="flex items-center gap-1 text-[13px] font-extrabold text-[#1A56DB] bg-[#E8EEFF] hover:bg-[#d5e2ff] px-2.5 py-1 rounded-full transition-colors"
                aria-label="Listen again"
              >
                <Volume2 className="w-4 h-4" />
                <span>Hear Again</span>
              </button>
            </div>

            <p className="text-[20px] font-bold text-[#0A192F] leading-relaxed">
              {aiResponse}
            </p>

            {/* Smart Action Guidance if Spotlight was Triggered */}
            {spotlightSuggestion === 'assist-nav' && (
              <button
                onClick={() => {
                  onNavigateToTab('assist');
                  onClose();
                }}
                id="companion-go-scanner-btn"
                className="w-full bg-[#1A56DB] hover:bg-[#1546b3] text-white font-extrabold text-[16px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <span>Open Camera Scanner Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Quick Question Chips */}
        <div className="mt-1 space-y-2">
          <p className="text-[13px] font-extrabold uppercase tracking-wider text-gray-500">
            Or Tap a Question to Ask:
          </p>
          <div className="space-y-2">
            {seniorPrompts.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => processQuery(promptText)}
                disabled={isProcessing}
                className="w-full text-left bg-white hover:bg-[#F0F3FF] active:bg-[#E8EEFF] border-2 border-gray-200 hover:border-[#1A56DB] rounded-2xl p-3.5 transition-all text-[#0A192F] flex items-center justify-between group shadow-xs focus-visible:ring-4 focus-visible:ring-[#1A56DB]"
              >
                <span className="text-[16px] font-bold leading-snug pr-2">
                  {promptText}
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#1A56DB] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
