export type ScreenTab = 'onboarding' | 'today' | 'assist' | 'emergency';
export type OnboardingStep = 'welcome' | 'signin' | 'preferences' | 'caregiver';

export interface UserPreferences {
  textSize: 'normal' | 'xl';
  speakAloud: boolean;
  userName: string;
  userPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  caregiverConnected: boolean;
}

export interface MedicationTask {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  dueInHours: string;
  dosage: string;
  instructions: string;
  imageUrl?: string;
  status: 'pending' | 'taken';
  takenTimestamp?: string;
}

export interface AppointmentItem {
  id: string;
  title: string;
  time: string;
  date: string;
  doctor: string;
  clinicNote: string;
  rideStatus: string;
  isNew?: boolean;
}

export interface ScannedDocumentResult {
  title: string;
  doctor: string;
  dateTime: string;
  clinicNote: string;
  confidence: number;
  type: 'medical_slip' | 'pill_bottle' | 'lab_report';
}

export interface CaregiverActivityLog {
  id: string;
  timestamp: string;
  text: string;
  type: 'medication' | 'scan' | 'sos' | 'status';
}
