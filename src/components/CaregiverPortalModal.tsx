import React from 'react';
import { X, Users, Heart, Phone, ShieldCheck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { CaregiverActivityLog, UserPreferences, MedicationTask } from '../types';

interface CaregiverPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  medication: MedicationTask;
  logs: CaregiverActivityLog[];
}

export const CaregiverPortalModal: React.FC<CaregiverPortalModalProps> = ({
  isOpen,
  onClose,
  preferences,
  medication,
  logs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 max-w-md mx-auto animate-fade-in">
      <div className="bg-[#FDFBF7] w-full rounded-3xl border-2 border-[#16A34A] shadow-2xl p-5 max-h-[85vh] overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] border border-[#16A34A] flex items-center justify-center text-[#16A34A]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[20px] font-black text-[#0A192F]">
                  Caregiver Sync Portal
                </h3>
                <p className="text-[13px] font-bold text-[#16A34A]">
                  Active Link with {preferences.caregiverName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              id="caregiver-modal-close-btn"
              className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sarah Connection Status Card */}
          <div className="my-4 bg-white border-2 border-[#D1D5DB] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-extrabold text-gray-500 uppercase">
                Connected Contact
              </span>
              <span className="flex items-center gap-1 text-[13px] font-extrabold text-[#14532D] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full border border-[#16A34A]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> Live Sync
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#16A34A]">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="Sarah"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="text-[18px] font-extrabold text-[#0A192F]">
                  {preferences.caregiverName}
                </h4>
                <p className="text-[15px] font-bold text-[#1A56DB] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {preferences.caregiverPhone}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-gray-200">
                <p className="text-[11px] font-bold text-gray-500 uppercase">Today&apos;s Medication</p>
                <p className="text-[15px] font-extrabold text-[#0A192F] mt-0.5">
                  {medication.status === 'taken' ? '✅ Confirmed' : '⏳ Due at 2:00 PM'}
                </p>
              </div>
              <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-gray-200">
                <p className="text-[11px] font-bold text-gray-500 uppercase">GPS Location</p>
                <p className="text-[15px] font-extrabold text-[#0A192F] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1A56DB]" />
                  Home Safe
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Activity Log */}
          <div>
            <h4 className="text-[16px] font-extrabold text-[#0A192F] mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#1A56DB]" />
              <span>Real-Time Activity Feed</span>
            </h4>

            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white border border-[#D1D5DB] rounded-xl p-3 flex items-start gap-2.5 text-[14px]"
                >
                  <div className="w-2 h-2 rounded-full bg-[#16A34A] mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-bold text-[#0A192F] leading-snug">
                      {log.text}
                    </p>
                    <span className="text-[12px] font-semibold text-gray-500">
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full h-[54px] bg-[#16A34A] hover:bg-[#13843b] text-white rounded-2xl font-extrabold text-[18px] flex items-center justify-center gap-2 shadow-md"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Close Caregiver Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
