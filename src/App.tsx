import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomBar } from './components/BottomBar';
import { WelcomeScreen } from './components/Onboarding/WelcomeScreen';
import { SignInScreen } from './components/Onboarding/SignInScreen';
import { PreferencesScreen } from './components/Onboarding/PreferencesScreen';
import { CaregiverScreen } from './components/Onboarding/CaregiverScreen';
import { TodayDashboard } from './components/TodayDashboard';
import { AssistScanner } from './components/AssistScanner';
import { EmergencySOS } from './components/EmergencySOS';
import { AICompanionOverlay } from './components/AICompanionOverlay';
import { CaregiverPortalModal } from './components/CaregiverPortalModal';
import {
  ScreenTab,
  OnboardingStep,
  UserPreferences,
  MedicationTask,
  AppointmentItem,
  ScannedDocumentResult,
  CaregiverActivityLog,
} from './types';
import { speechService } from './services/speech';

export default function App() {
  // Navigation & Flow State
  const [currentTab, setCurrentTab] = useState<ScreenTab>('today');
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');

  // Assistant & Modals State
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [isCaregiverModalOpen, setIsCaregiverModalOpen] = useState(false);
  const [spotlightTarget, setSpotlightTarget] = useState<string | null>(null);

  // User Preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    textSize: 'xl', // Senior default extra-large
    speakAloud: true,
    userName: 'Eleanor Vance',
    userPhone: '(555) 234-8901',
    caregiverName: 'Sarah (Daughter)',
    caregiverPhone: '(555) 0192',
    caregiverConnected: true,
  });

  // Medication Task (Image 5)
  const [medication, setMedication] = useState<MedicationTask>({
    id: 'med-bp-1',
    title: 'Blood Pressure Pill',
    subtitle: 'Take 1 red tablet with a full glass of water.',
    time: '2:00 PM',
    dueInHours: 'In 3.5 hrs',
    dosage: '1 red tablet',
    instructions: 'After lunch • Take 1 red tablet with a full glass of water.',
    status: 'pending',
  });

  // Upcoming Schedule Items (Image 5)
  const [appointments, setAppointments] = useState<AppointmentItem[]>([
    {
      id: 'appt-1',
      title: 'Dr. Smith Visit',
      doctor: 'Dr. Smith',
      time: '4:00 PM',
      date: 'Today, Sep 19',
      clinicNote: 'Cardiology routine wellness check-up.',
      rideStatus: 'Dr. office ride confirmed',
    },
  ]);

  // Caregiver Audit Logs
  const [caregiverLogs, setCaregiverLogs] = useState<CaregiverActivityLog[]>([
    {
      id: 'log-1',
      timestamp: 'Today at 7:45 AM',
      text: 'Eleanor woke up • Vitals check normal (Heart Rate: 72 bpm)',
      type: 'status',
    },
    {
      id: 'log-2',
      timestamp: 'Today at 8:00 AM',
      text: 'Morning oatmeal logged',
      type: 'status',
    },
  ]);

  // Handlers for Preferences
  const handleToggleVoice = () => {
    const nextVal = !preferences.speakAloud;
    setPreferences((prev) => ({ ...prev, speakAloud: nextVal }));
    speechService.setVoiceEnabled(nextVal);
    if (nextVal) {
      speechService.speak('Voice guidance is now on.', undefined, true);
    }
  };

  const handleToggleTextSize = () => {
    const nextVal = preferences.textSize === 'xl' ? 'normal' : 'xl';
    setPreferences((prev) => ({ ...prev, textSize: nextVal }));
    if (preferences.speakAloud) {
      speechService.speak(
        nextVal === 'xl' ? 'Text size set to Extra Large.' : 'Text size set to Normal.'
      );
    }
  };

  // Handlers for Medication
  const handleTakeMedication = () => {
    setMedication((prev) => ({
      ...prev,
      status: 'taken',
      takenTimestamp: '8:15 AM',
    }));

    // Add log to caregiver feed
    setCaregiverLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now (8:15 AM)',
        text: 'Eleanor confirmed taking Blood Pressure medication (1 red tablet)',
        type: 'medication',
      },
      ...prev,
    ]);
  };

  // Handlers for Scanner
  const handleAddScannedToCalendar = (doc: ScannedDocumentResult) => {
    const newAppt: AppointmentItem = {
      id: `appt-${Date.now()}`,
      title: `${doc.doctor} Visit`,
      doctor: doc.doctor,
      time: '10:00 AM',
      date: 'Thu, Oct 12',
      clinicNote: doc.clinicNote,
      rideStatus: 'Ride request queued for Sarah',
      isNew: true,
    };

    setAppointments((prev) => [newAppt, ...prev]);

    // Log to caregiver
    setCaregiverLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        text: `Eleanor scanned appointment letter: ${doc.doctor} on ${doc.dateTime}`,
        type: 'scan',
      },
      ...prev,
    ]);
  };

  const handleSendToCaregiver = (docTitle: string) => {
    setCaregiverLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        text: `Eleanor forwarded scan: "${docTitle}" for your review`,
        type: 'scan',
      },
      ...prev,
    ]);
  };

  // Handlers for SOS
  const handleEmergencyDispatch = () => {
    setCaregiverLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'CRITICAL ALERT',
        text: '🚨 EMERGENCY SOS TRIGGERED: Eleanor Vance at 742 Evergreen Ter. 911 and Sarah notified!',
        type: 'sos',
      },
      ...prev,
    ]);
  };

  const handleSpotlightTrigger = (target: string) => {
    setSpotlightTarget(target);
    setTimeout(() => {
      setSpotlightTarget(null);
    }, 6000);
  };

  // Dynamic Tab Title
  const getTabTitle = () => {
    switch (currentTab) {
      case 'today':
        return 'Today';
      case 'assist':
        return 'Assist Scanner';
      case 'emergency':
        return 'Emergency Assistance';
      case 'onboarding':
        return 'Welcome Setup';
      default:
        return 'Assistant';
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#FDFBF7] text-[#0A192F] flex flex-col font-sans selection:bg-[#1A56DB] selection:text-white ${
        preferences.textSize === 'xl' ? 'text-[20px]' : 'text-[17px]'
      }`}
    >
      {/* Quick Stage Switcher Bar (Senior & Reviewer Friendly) */}
      <div className="bg-[#0F172A] text-white py-1.5 px-3 border-b border-gray-800">
        <div className="max-w-md mx-auto flex items-center justify-between text-[13px] font-bold">
          <span className="text-gray-400 uppercase tracking-wider text-[11px] font-extrabold hidden xs:inline">
            Stages:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => {
                setCurrentTab('onboarding');
                setOnboardingStep('welcome');
              }}
              className={`px-2 py-0.5 rounded ${
                currentTab === 'onboarding'
                  ? 'bg-[#1A56DB] text-white font-extrabold'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              1: Onboarding
            </button>
            <button
              onClick={() => setCurrentTab('today')}
              className={`px-2 py-0.5 rounded ${
                currentTab === 'today'
                  ? 'bg-[#1A56DB] text-white font-extrabold'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              2: Today
            </button>
            <button
              onClick={() => setCurrentTab('assist')}
              className={`px-2 py-0.5 rounded ${
                currentTab === 'assist'
                  ? 'bg-[#1A56DB] text-white font-extrabold'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              3A: Assist
            </button>
            <button
              onClick={() => setCurrentTab('emergency')}
              className={`px-2 py-0.5 rounded ${
                currentTab === 'emergency'
                  ? 'bg-[#DC2626] text-white font-extrabold'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              3B: SOS
            </button>
            <button
              onClick={() => setIsCompanionOpen(true)}
              className="px-2 py-0.5 rounded bg-blue-900 text-blue-200 border border-blue-500 hover:bg-blue-800"
            >
              4: Voice AI
            </button>
          </div>
        </div>
      </div>

      {/* Main App Container */}
      <div className="flex-1 flex flex-col relative w-full max-w-md mx-auto min-h-screen">
        {/* Persistent Senior Header (except during early onboarding) */}
        {currentTab !== 'onboarding' && (
          <Header
            currentTabTitle={getTabTitle()}
            preferences={preferences}
            onToggleVoice={handleToggleVoice}
            onToggleTextSize={handleToggleTextSize}
            onOpenCaregiverModal={() => setIsCaregiverModalOpen(true)}
          />
        )}

        {/* Dynamic Screen Stage Rendering */}
        <main className="flex-1">
          {/* STAGE 1: ONBOARDING */}
          {currentTab === 'onboarding' && (
            <>
              {onboardingStep === 'welcome' && (
                <WelcomeScreen
                  speakAloud={preferences.speakAloud}
                  onStart={() => setOnboardingStep('signin')}
                />
              )}
              {onboardingStep === 'signin' && (
                <SignInScreen
                  speakAloud={preferences.speakAloud}
                  onBack={() => setOnboardingStep('welcome')}
                  onSuccess={() => setOnboardingStep('preferences')}
                />
              )}
              {onboardingStep === 'preferences' && (
                <PreferencesScreen
                  preferences={preferences}
                  onUpdatePreferences={(updates) =>
                    setPreferences((prev) => ({ ...prev, ...updates }))
                  }
                  onBack={() => setOnboardingStep('signin')}
                  onNext={() => setOnboardingStep('caregiver')}
                />
              )}
              {onboardingStep === 'caregiver' && (
                <CaregiverScreen
                  initialCaregiverName={preferences.caregiverName}
                  initialCaregiverPhone={preferences.caregiverPhone}
                  speakAloud={preferences.speakAloud}
                  onBack={() => setOnboardingStep('preferences')}
                  onConnect={(name, phone) => {
                    setPreferences((prev) => ({
                      ...prev,
                      caregiverName: name,
                      caregiverPhone: phone,
                      caregiverConnected: true,
                    }));
                    setCurrentTab('today');
                  }}
                  onSkip={() => setCurrentTab('today')}
                />
              )}
            </>
          )}

          {/* STAGE 2: HOMEPAGE (TODAY DASHBOARD) */}
          {currentTab === 'today' && (
            <TodayDashboard
              preferences={preferences}
              medication={medication}
              appointments={appointments}
              onTakeMedication={handleTakeMedication}
              onOpenScanner={() => setCurrentTab('assist')}
            />
          )}

          {/* STAGE 3 FEATURE A: ASSIST SCANNER */}
          {currentTab === 'assist' && (
            <AssistScanner
              preferences={preferences}
              onBackHome={() => setCurrentTab('today')}
              onAddToCalendar={handleAddScannedToCalendar}
              onSendToCaregiver={handleSendToCaregiver}
            />
          )}

          {/* STAGE 3 FEATURE B: EMERGENCY SOS */}
          {currentTab === 'emergency' && (
            <EmergencySOS
              preferences={preferences}
              onCancelEmergency={() => setCurrentTab('today')}
              onDispatchTriggered={handleEmergencyDispatch}
            />
          )}
        </main>

        {/* Persistent Bottom Bar (Today, Assist, SOS + Floating Companion Mic) */}
        {currentTab !== 'onboarding' && (
          <BottomBar
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            onOpenCompanion={() => setIsCompanionOpen(true)}
            spotlightTarget={spotlightTarget}
          />
        )}

        {/* STAGE 4: AI COMPANION INTERACTION OVERLAY */}
        <AICompanionOverlay
          isOpen={isCompanionOpen}
          onClose={() => setIsCompanionOpen(false)}
          currentTab={currentTab}
          medication={medication}
          appointments={appointments}
          onTriggerSpotlight={handleSpotlightTrigger}
          onNavigateToTab={(tab) => setCurrentTab(tab)}
        />

        {/* CAREGIVER REAL-TIME SYNC PORTAL MODAL */}
        <CaregiverPortalModal
          isOpen={isCaregiverModalOpen}
          onClose={() => setIsCaregiverModalOpen(false)}
          preferences={preferences}
          medication={medication}
          logs={caregiverLogs}
        />
      </div>
    </div>
  );
}
