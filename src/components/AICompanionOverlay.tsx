import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Eye,
  Zap,
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
  onTakeMedication?: () => void;
  onToggleVoice?: () => void;
  onToggleTextSize?: () => void;
  onOpenCaregiverModal?: () => void;
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
  onTakeMedication,
  onToggleVoice,
  onToggleTextSize,
  onOpenCaregiverModal,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [spotlightSuggestion, setSpotlightSuggestion] = useState<string | null>(null);
  const [executedActionNotice, setExecutedActionNotice] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Common senior queries & automated actions for one-tap convenience
  const seniorPrompts = [
    { label: 'Did I take my blood pressure medicine today?', action: false },
    { label: 'I took my blood pressure pill just now', action: true, badge: 'Auto-record' },
    { label: 'Read my active screen out loud', action: true, badge: 'Screen Reader' },
    { label: 'Open camera scanner for my clinic letter', action: true, badge: 'Navigate' },
    { label: 'What time is my doctor appointment?', action: false },
    { label: 'What should I do before my cardiology visit?', action: false },
    { label: 'Make the text bigger for me', action: true, badge: 'Accessibility' },
    { label: `Call my daughter ${caregiverName}`, action: false },
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
        } catch {
          // Speech recognition not permitted in environment
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUserQuery('');
      setAiResponse(null);
      setSpotlightSuggestion(null);
      setExecutedActionNotice(null);
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
    setExecutedActionNotice(null);

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

  // Automated execution handler based on server or fallback intent
  const executeUIAction = (action: string | null, label?: string | null) => {
    if (!action) return;

    if (action === 'TAKE_MEDICATION') {
      if (onTakeMedication) {
        onTakeMedication();
        setExecutedActionNotice(label || 'Marked Blood Pressure Pill as Taken');
      }
    } else if (action === 'NAVIGATE_SCANNER') {
      onNavigateToTab('assist');
      setExecutedActionNotice(label || 'Opened Assist Scanner');
    } else if (action === 'NAVIGATE_TODAY') {
      onNavigateToTab('today');
      setExecutedActionNotice(label || 'Navigated to Today Dashboard');
    } else if (action === 'TRIGGER_SOS') {
      onNavigateToTab('emergency');
      setExecutedActionNotice(label || 'Triggered Emergency Assistance');
    } else if (action === 'INCREASE_TEXT') {
      onToggleTextSize?.();
      setExecutedActionNotice(label || 'Adjusted Text Size');
    } else if (action === 'TOGGLE_VOICE') {
      onToggleVoice?.();
      setExecutedActionNotice(label || 'Toggled Voice Guidance');
    } else if (action === 'OPEN_CAREGIVER') {
      onOpenCaregiverModal?.();
      setExecutedActionNotice(label || 'Opened Caregiver Portal');
    } else if (action === 'READ_SCREEN') {
      setExecutedActionNotice(label || 'Screen Content Read Aloud');
    }
  };

  // Immediate read active screen out loud helper
  const handleReadActiveScreen = () => {
    let screenSummary = '';
    if (currentTab === 'today') {
      const medStatus = medication.status === 'taken' ? 'already taken' : 'due at 2:00 PM';
      screenSummary = `Active screen: Today Dashboard. Eleanor, your Blood Pressure medicine is ${medStatus}. You have an appointment with Dr. Smith today at 10:00 AM. Fasting reminder: Do not eat breakfast before coming. Caregiver ${caregiverName} is safely connected.`;
    } else if (currentTab === 'assist') {
      screenSummary = 'Active screen: Assist Scanner. Point your device camera at a clinic appointment letter or medication bottle, or tap the blue Snap Photo button.';
    } else if (currentTab === 'emergency') {
      screenSummary = 'Active screen: Emergency Assistance. 10 second countdown is ready. Tap Cancel Emergency if you do not need emergency services.';
    } else {
      screenSummary = 'Active screen: ElderEase Welcome Setup.';
    }

    setUserQuery('Read my active screen out loud');
    setAiResponse(screenSummary);
    setExecutedActionNotice('Active Screen Content Read Aloud');
    speechService.speak(screenSummary, undefined, true);
  };

  // Process query via secure Server-Side AI API with intelligent fallback
  const processQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    stopListening();
    setUserQuery(queryText);
    setIsProcessing(true);
    setAiResponse(null);
    setExecutedActionNotice(null);

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

        if (data.executedAction) {
          executeUIAction(data.executedAction, data.actionLabel);
        }
      } else {
        throw new Error('Server response not ok');
      }
    } catch {
      // Local graceful fallback if server or network has delay
      let fallbackText = `I hear you, ${seniorName}. Everything is in order and your family is connected.`;
      const lower = queryText.toLowerCase();

      if (
        lower.includes('took my medicine') ||
        lower.includes('take my pill') ||
        lower.includes('mark medication') ||
        lower.includes('already took')
      ) {
        executeUIAction('TAKE_MEDICATION', 'Marked Blood Pressure Pill as Taken');
        fallbackText = `Wonderful, ${seniorName}! I have automatically marked your Blood Pressure pill as taken and recorded it for ${caregiverName}.`;
      } else if (lower.includes('open scanner') || lower.includes('scan document') || lower.includes('scan clinic')) {
        executeUIAction('NAVIGATE_SCANNER', 'Opened Assist Scanner');
        fallbackText = `Opening the Assist Scanner for you now, ${seniorName}.`;
      } else if (lower.includes('read') && lower.includes('screen')) {
        handleReadActiveScreen();
        return;
      } else if (lower.includes('bigger text') || lower.includes('increase font')) {
        executeUIAction('INCREASE_TEXT', 'Switched to Extra-Large Text Size');
        fallbackText = 'I have adjusted the text to extra-large for easier reading.';
      } else if (lower.includes('blood pressure') || lower.includes('medicine') || lower.includes('pill')) {
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
      <div className="bg-[#FDFBF7] rounded-t-3xl border-t-4 border-[#1A56DB] p-5 shadow-2xl flex flex-col max-h-[88vh] overflow-y-auto">
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

        {/* Animated Circular Listening Hub & Quick Screen Reader Action */}
        <div className="py-4 flex flex-col items-center justify-center">
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
            className="text-[16px] font-extrabold text-[#1A56DB] mt-3 uppercase tracking-wider text-center"
          >
            {isListening
              ? 'Listening patiently to your voice...'
              : isProcessing
              ? 'Consulting your health schedule...'
              : 'Tap microphone to speak'}
          </p>

          {/* Direct Read Active Screen Quick Action Button */}
          <button
            onClick={handleReadActiveScreen}
            id="companion-read-screen-btn"
            className="mt-2.5 px-4 py-2 bg-[#E8EEFF] hover:bg-[#d5e2ff] text-[#1A56DB] border border-blue-300 rounded-full text-[14px] font-extrabold flex items-center gap-2 transition-all shadow-xs"
          >
            <Eye className="w-4 h-4" />
            <span>Read Active Screen Out Loud</span>
          </button>
        </div>

        {/* Real-time Captioning & User Words */}
        {userQuery && (
          <div className="bg-[#E8EEFF] border-2 border-[#1A56DB] rounded-2xl p-4 mb-3">
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-[#1A56DB]">
              You Asked:
            </p>
            <p className="text-[20px] font-black text-[#0A192F] leading-snug mt-1">
              &quot;{userQuery}&quot;
            </p>
          </div>
        )}

        {/* Automated UI Execution Confirmation Notification */}
        {executedActionNotice && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-3.5 mb-3 flex items-center gap-3 animate-fade-in shadow-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-800 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                Automated UI Action Executed
              </p>
              <p className="text-[15px] font-bold text-emerald-950">
                {executedActionNotice}
              </p>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl mb-3 text-[#1A56DB]">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-[16px] font-bold">ElderEase AI is thinking...</span>
          </div>
        )}

        {/* Context-Extracted AI Response Card */}
        {aiResponse && !isProcessing && (
          <div
            role="region"
            aria-label="Assistant Response"
            className="bg-white border-2 border-[#16A34A] rounded-2xl p-4 mb-3 shadow-md space-y-3 animate-fade-in"
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

            <p className="text-[19px] font-bold text-[#0A192F] leading-relaxed">
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

        {/* Quick Question & Action Chips */}
        <div className="mt-1 space-y-2">
          <p className="text-[12px] font-extrabold uppercase tracking-wider text-gray-500">
            Or Tap a Question or Action:
          </p>
          <div className="space-y-2">
            {seniorPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => processQuery(prompt.label)}
                disabled={isProcessing}
                className="w-full text-left bg-white hover:bg-[#F0F3FF] active:bg-[#E8EEFF] border-2 border-gray-200 hover:border-[#1A56DB] rounded-2xl p-3 transition-all text-[#0A192F] flex items-center justify-between group shadow-xs focus-visible:ring-4 focus-visible:ring-[#1A56DB]"
              >
                <div className="flex items-center gap-2 pr-2">
                  {prompt.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 shrink-0">
                      {prompt.badge}
                    </span>
                  )}
                  <span className="text-[15px] font-bold leading-snug">
                    {prompt.label}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-[#1A56DB] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
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
