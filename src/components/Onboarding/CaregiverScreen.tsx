import React, { useState } from 'react';
import { ArrowLeft, Users, ShieldCheck, Heart } from 'lucide-react';
import { speechService } from '../../services/speech';

interface CaregiverScreenProps {
  initialCaregiverName: string;
  initialCaregiverPhone: string;
  onConnect: (name: string, phone: string) => void;
  onSkip: () => void;
  onBack: () => void;
  speakAloud: boolean;
}

export const CaregiverScreen: React.FC<CaregiverScreenProps> = ({
  initialCaregiverName,
  initialCaregiverPhone,
  onConnect,
  onSkip,
  onBack,
  speakAloud,
}) => {
  const [caregiverName, setCaregiverName] = useState(initialCaregiverName || 'Sarah (Daughter)');
  const [caregiverPhone, setCaregiverPhone] = useState(initialCaregiverPhone || '(555) 0192');

  const handleConnect = () => {
    if (speakAloud) {
      speechService.speak(`Caregiver connected. Sarah will receive your daily medication updates and emergency notifications.`);
    }
    onConnect(caregiverName, caregiverPhone);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between p-4 max-w-md mx-auto animate-fade-in">
      <div>
        <button
          onClick={onBack}
          id="caregiver-back-btn"
          className="flex items-center gap-2 text-[#1A56DB] font-bold text-[18px] mb-4 py-1"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span>Back</span>
        </button>

        <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] border-2 border-[#16A34A] flex items-center justify-center text-[#16A34A] mb-3">
          <Users className="w-8 h-8" />
        </div>

        <h1 className="text-[30px] font-extrabold text-[#0A192F] leading-tight">
          Connect a Caregiver
        </h1>
        <p className="text-[18px] font-medium text-gray-700 mt-2">
          Who helps you with your appointments or daily medicine?
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-[17px] font-extrabold text-[#0A192F] mb-1.5">
              Caregiver&apos;s Name &amp; Relation
            </label>
            <input
              type="text"
              value={caregiverName}
              onChange={(e) => setCaregiverName(e.target.value)}
              placeholder="e.g. Sarah (Daughter)"
              className="w-full h-[64px] bg-white border-2 border-[#0A192F] rounded-2xl px-4 text-[20px] font-bold text-[#0A192F] focus:outline-none focus:ring-4 focus:ring-[#1A56DB]/20"
            />
          </div>

          <div>
            <label className="block text-[17px] font-extrabold text-[#0A192F] mb-1.5">
              Caregiver&apos;s Mobile Phone
            </label>
            <input
              type="tel"
              value={caregiverPhone}
              onChange={(e) => setCaregiverPhone(e.target.value)}
              placeholder="(555) 0192"
              className="w-full h-[64px] bg-white border-2 border-[#0A192F] rounded-2xl px-4 text-[22px] font-bold text-[#0A192F] focus:outline-none focus:ring-4 focus:ring-[#1A56DB]/20"
            />
          </div>

          <div className="bg-[#DCFCE7]/70 border-2 border-[#16A34A] rounded-2xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-[#16A34A] flex-shrink-0 mt-0.5" />
            <p className="text-[15px] font-bold text-[#14532D] leading-snug">
              When you take your medicine or use Emergency SOS, Sarah will receive an instant gentle confirmation on her phone.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3 mb-2">
        <button
          onClick={handleConnect}
          id="connect-caregiver-btn"
          className="w-full h-[64px] bg-[#1A56DB] hover:bg-[#1546b3] text-white rounded-2xl border-2 border-[#0F172A] tactile-btn flex items-center justify-center gap-3 text-[22px] font-extrabold"
        >
          <Heart className="w-6 h-6 fill-white" />
          <span>Connect Caregiver</span>
        </button>

        <button
          onClick={onSkip}
          id="skip-caregiver-btn"
          className="w-full h-[54px] bg-transparent text-gray-700 hover:text-[#0A192F] rounded-2xl font-bold text-[18px] underline"
        >
          Do This Later
        </button>
      </div>
    </div>
  );
};
