import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  Camera,
  RotateCcw,
  PlusCircle,
  Share2,
  CheckCircle,
  Scan,
  User,
  Calendar,
  UtensilsCrossed,
  Sparkles,
  SwitchCamera
} from 'lucide-react';
import { speechService } from '../services/speech';
import { UserPreferences, ScannedDocumentResult } from '../types';

interface AssistScannerProps {
  preferences: UserPreferences;
  onBackHome: () => void;
  onAddToCalendar: (doc: ScannedDocumentResult) => void;
  onSendToCaregiver: (docTitle: string) => void;
}

export const AssistScanner: React.FC<AssistScannerProps> = ({
  preferences,
  onBackHome,
  onAddToCalendar,
  onSendToCaregiver,
}) => {
  const [activeDocType, setActiveDocType] = useState<'clinic' | 'pill' | 'live'>('clinic');
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(true); // Default true so the user immediately sees the exact screen from Image 3!
  const [isCalendarAdded, setIsCalendarAdded] = useState(false);
  const [isSentToSarah, setIsSentToSarah] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // The sample document from Image 3
  const clinicDoc: ScannedDocumentResult = {
    title: 'Dr. Smith Cardiovascular Consultation',
    doctor: 'Dr. Smith',
    dateTime: 'Thursday, October 12 at 10:00 AM',
    clinicNote: 'Do not eat breakfast before coming.',
    confidence: 99,
    type: 'medical_slip',
  };

  const pillDoc: ScannedDocumentResult = {
    title: 'Lisinopril 10mg Prescription',
    doctor: 'Dr. Emily Watson (Rx #940128)',
    dateTime: 'Take 1 tablet every morning',
    clinicNote: 'Take with full glass of water. Avoid potassium supplements.',
    confidence: 98,
    type: 'pill_bottle',
  };

  const [serverDoc, setServerDoc] = useState<ScannedDocumentResult | null>(null);
  const currentDoc = serverDoc || (activeDocType === 'pill' ? pillDoc : clinicDoc);

  // Live camera stream handling if user chooses real camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (activeDocType === 'live') {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('Camera access denied or unavailable:', err);
          setCameraError('Camera preview not supported in this frame. Use sample medical slips.');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [activeDocType]);

  // Voice instruction
  useEffect(() => {
    if (preferences.speakAloud) {
      speechService.speak("Assist Scanner active. Hold still, then tap the big blue button to read this slip.");
    }
  }, [preferences.speakAloud]);

  const handleSnapPhoto = async () => {
    setIsScanning(true);
    speechService.playSuccessChime();

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docHint: activeDocType }),
      });
      if (res.ok) {
        const data = await res.json();
        setServerDoc(data);
        setHasScanned(true);
        const summary = `Doctor: ${data.doctor}. Date and Time: ${data.dateTime}. Important Clinic Note: ${data.clinicNote}`;
        speechService.speak(summary, undefined, true);
      } else {
        throw new Error('Scan failed');
      }
    } catch {
      setHasScanned(true);
      const summary = `Doctor: ${currentDoc.doctor}. Date and Time: ${currentDoc.dateTime}. Important Clinic Note: ${currentDoc.clinicNote}`;
      speechService.speak(summary, undefined, true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleReplaySummary = () => {
    const summary = `Doctor: ${currentDoc.doctor}. Date and Time: ${currentDoc.dateTime}. Important Clinic Note: ${currentDoc.clinicNote}`;
    speechService.speak(summary, undefined, true);
  };

  const handleAddCalendar = () => {
    onAddToCalendar(currentDoc);
    setIsCalendarAdded(true);
    speechService.playSuccessChime();
    speechService.speak("Appointment added to your schedule for Thursday, October 12 at 10:00 AM.");
  };

  const handleSendSarah = () => {
    onSendToCaregiver(currentDoc.title);
    setIsSentToSarah(true);
    speechService.speak("Appointment slip forwarded to your daughter Sarah for review.");
  };

  return (
    <div className="pb-36 px-3 pt-2 max-w-md mx-auto space-y-4 animate-fade-in">
      {/* Top Nav Row (Image 3) */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBackHome}
          id="scanner-back-home-btn"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#E8EEFF] border-2 border-[#1A56DB] text-[#1A56DB] font-extrabold text-[16px] hover:bg-[#d6e3ff] active:scale-95 transition-all shadow-xs"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span>Back Home</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8EEFF] border border-[#1A56DB]/40 text-[#1A56DB] text-[13px] font-extrabold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>VISION AI ACTIVE</span>
        </div>
      </div>

      {/* Main Title & Scanner Switcher */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-[26px] font-extrabold tracking-tight text-[#0A192F] uppercase">
            Assist Scanner
          </h2>
          <p className="text-[15px] font-bold text-gray-600">
            Point at mail, pill bottles, or clinic slips
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#E8EEFF] border border-[#1A56DB] flex items-center justify-center text-[#1A56DB]">
          <Scan className="w-6 h-6" />
        </div>
      </div>

      {/* Document Selector Pills (allows senior to test clinic slip or live camera) */}
      <div className="flex gap-2 overflow-x-auto py-1">
        <button
          onClick={() => {
            setActiveDocType('clinic');
            setHasScanned(true);
            setIsCalendarAdded(false);
          }}
          className={`px-3 py-1.5 rounded-xl border text-[14px] font-extrabold whitespace-nowrap transition-all ${
            activeDocType === 'clinic'
              ? 'bg-[#1A56DB] text-white border-[#0F172A]'
              : 'bg-white text-gray-700 border-[#D1D5DB]'
          }`}
        >
          📋 Medical Letter (Dr. Smith)
        </button>
        <button
          onClick={() => {
            setActiveDocType('pill');
            setHasScanned(true);
            setIsCalendarAdded(false);
          }}
          className={`px-3 py-1.5 rounded-xl border text-[14px] font-extrabold whitespace-nowrap transition-all ${
            activeDocType === 'pill'
              ? 'bg-[#1A56DB] text-white border-[#0F172A]'
              : 'bg-white text-gray-700 border-[#D1D5DB]'
          }`}
        >
          💊 Pill Bottle Label
        </button>
        <button
          onClick={() => {
            setActiveDocType('live');
            setHasScanned(false);
          }}
          className={`px-3 py-1.5 rounded-xl border text-[14px] font-extrabold whitespace-nowrap flex items-center gap-1 transition-all ${
            activeDocType === 'live'
              ? 'bg-[#1A56DB] text-white border-[#0F172A]'
              : 'bg-white text-gray-700 border-[#D1D5DB]'
          }`}
        >
          <SwitchCamera className="w-3.5 h-3.5" />
          <span>Device Camera</span>
        </button>
      </div>

      {/* Spoken Instructions Card (Image 3) */}
      <div className="bg-[#E8EEFF] border-2 border-[#1A56DB] rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-full bg-[#1A56DB] text-white flex items-center justify-center flex-shrink-0">
          <Volume2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[12px] font-extrabold text-[#1A56DB] uppercase tracking-wide">
            Spoken Instructions
          </p>
          <p className="text-[16px] font-extrabold text-[#0A192F] leading-snug">
            &quot;Hold still, then tap the big blue button to read this slip.&quot;
          </p>
        </div>
      </div>

      {/* Viewfinder with Yellow Dashed Framing (Image 3) */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-[#0F172A] bg-stone-900 min-h-[220px] shadow-lg flex flex-col justify-between p-3.5">
        {/* Background Image / Camera Feed */}
        {activeDocType === 'live' ? (
          videoRef.current && !cameraError ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-stone-800 flex items-center justify-center text-gray-300 text-center p-4">
              <p className="text-[15px] font-semibold">{cameraError || 'Loading device camera...'}</p>
            </div>
          )
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center filter brightness-90"
            style={{
              backgroundImage:
                activeDocType === 'clinic'
                  ? `url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80')`
                  : `url('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80')`,
            }}
          />
        )}

        {/* High-Contrast Yellow Dashed Guide Box (Image 3) */}
        <div className="relative z-10 border-3 border-dashed border-[#FACC15] rounded-2xl p-3 bg-black/35 backdrop-blur-[1px] flex flex-col justify-between min-h-[190px]">
          {/* Top Status */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/75 border border-[#16A34A] rounded-full text-white text-[13px] font-extrabold">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
              Document Detected in Box
            </span>
          </div>

          {/* Document Content Simulation Card (Image 3) */}
          <div className="bg-white/95 rounded-xl p-3 border border-gray-300 shadow-md text-left my-2">
            <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#1A56DB] uppercase">
              <span>+ CARDIOLOGY CLINIC RM 302</span>
            </div>
            <h4 className="text-[20px] font-extrabold text-[#0A192F] mt-0.5 leading-tight">
              {currentDoc.doctor}
            </h4>
            <p className="text-[14px] font-bold text-gray-600">
              {activeDocType === 'clinic' ? 'Cardiovascular Consultation' : 'Prescription Fill'}
            </p>
            <div className="mt-2 bg-[#F0F3FF] border border-[#1A56DB]/30 rounded-lg p-1.5 flex items-center gap-2 text-[14px] font-extrabold text-[#1A56DB]">
              <Calendar className="w-4 h-4" />
              <span>{currentDoc.dateTime}</span>
            </div>
          </div>

          {/* Bottom Indicator */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-black/80 rounded-full text-yellow-300 text-[13px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Slip is clear and readable
            </span>
          </div>
        </div>
      </div>

      {/* SNAP PHOTO Action Button (Image 3) */}
      <button
        onClick={handleSnapPhoto}
        disabled={isScanning}
        id="scanner-snap-btn"
        className="w-full h-[64px] bg-[#1A56DB] hover:bg-[#1546b3] text-white rounded-2xl border-2 border-[#0F172A] tactile-btn flex items-center justify-center gap-3 text-[20px] font-extrabold disabled:opacity-75"
      >
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <Camera className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="text-left leading-tight">
          <div>{isScanning ? 'ANALYZING DOCUMENT...' : 'SNAP PHOTO'}</div>
          <div className="text-[12px] font-bold text-blue-200">ElderEase AI will read aloud</div>
        </div>
      </button>

      {/* AI Reading Result (Image 3) */}
      {hasScanned && (
        <div className="bg-white border-2 border-[#D1D5DB] rounded-3xl p-4 shadow-md space-y-4 animate-scale-in">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#1A56DB]" />
              <h3 className="text-[22px] font-extrabold text-[#0A192F]">
                AI Reading Result
              </h3>
            </div>
            <span className="flex items-center gap-1 px-3 py-1 bg-[#DCFCE7] border border-[#16A34A] rounded-full text-[13px] font-extrabold text-[#14532D]">
              <CheckCircle className="w-4 h-4 text-[#16A34A]" />
              {currentDoc.confidence}% Sure
            </span>
          </div>

          <p className="text-[16px] font-bold text-gray-700">
            Here is the information from your medical appointment slip:
          </p>

          {/* 3 Information Cards (Doctor, Date, Important Clinic Note) */}
          <div className="space-y-2.5">
            {/* 1. Doctor */}
            <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8EEFF] border border-[#1A56DB]/30 flex items-center justify-center text-[#1A56DB] flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[12px] font-extrabold uppercase tracking-wide text-gray-500">
                  Doctor
                </p>
                <p className="text-[19px] font-extrabold text-[#0A192F]">
                  {currentDoc.doctor}
                </p>
              </div>
            </div>

            {/* 2. Date & Time */}
            <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[12px] font-extrabold uppercase tracking-wide text-gray-500">
                  Date &amp; Time
                </p>
                <p className="text-[18px] font-extrabold text-[#0A192F]">
                  {currentDoc.dateTime}
                </p>
              </div>
            </div>

            {/* 3. Important Clinic Note */}
            <div className="bg-[#FEF2F2] border-2 border-[#FCA5A5] rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DC2626] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[12px] font-extrabold uppercase tracking-wide text-[#DC2626]">
                  Important Clinic Note
                </p>
                <p className="text-[18px] font-extrabold text-[#7F1D1D] leading-snug">
                  {currentDoc.clinicNote}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: Replay & Add to Calendar */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleReplaySummary}
              id="scanner-replay-summary-btn"
              className="w-full h-[54px] bg-[#E8EEFF] hover:bg-[#d4e2ff] text-[#1A56DB] rounded-2xl border-2 border-[#1A56DB] font-extrabold text-[17px] flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Volume2 className="w-5 h-5" />
              <span>Replay Voice Summary</span>
            </button>

            <button
              onClick={handleAddCalendar}
              disabled={isCalendarAdded}
              id="scanner-add-calendar-btn"
              className={`w-full h-[60px] rounded-2xl border-2 font-extrabold text-[19px] flex items-center justify-center gap-2.5 transition-all ${
                isCalendarAdded
                  ? 'bg-[#DCFCE7] text-[#14532D] border-[#16A34A]'
                  : 'bg-[#16A34A] hover:bg-[#13843b] text-white border-[#0F172A] tactile-btn'
              }`}
            >
              {isCalendarAdded ? (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span>Added to Your Calendar!</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-6 h-6 stroke-[2.5]" />
                  <span>Add to My Calendar</span>
                </>
              )}
            </button>
          </div>

          {/* Caregiver Forward Box (Image 3) */}
          <div className="bg-[#F0F3FF] border-2 border-[#D1D5DB] rounded-2xl p-3.5 flex items-center justify-between gap-2">
            <div>
              <p className="text-[14px] font-extrabold text-[#0A192F]">
                Need Sarah to review?
              </p>
              <p className="text-[13px] font-medium text-gray-600">
                Tap to forward this scan automatically
              </p>
            </div>
            <button
              onClick={handleSendSarah}
              id="scanner-send-sarah-btn"
              className={`px-4 py-2 rounded-xl text-[14px] font-extrabold border-2 transition-all ${
                isSentToSarah
                  ? 'bg-[#DCFCE7] text-[#14532D] border-[#16A34A]'
                  : 'bg-white text-[#1A56DB] border-[#1A56DB] hover:bg-[#E8EEFF]'
              }`}
            >
              {isSentToSarah ? 'Sent!' : 'Send to Sarah'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
