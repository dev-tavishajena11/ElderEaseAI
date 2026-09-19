import React, { useState } from 'react';
import { Phone, KeyRound, ArrowLeft, Check, Delete } from 'lucide-react';
import { speechService } from '../../services/speech';

interface SignInScreenProps {
  onBack: () => void;
  onSuccess: (phone: string) => void;
  speakAloud: boolean;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ onBack, onSuccess, speakAloud }) => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'invite'>('phone');
  const [phone, setPhone] = useState('(555) 234-8901');
  const [smsCode, setSmsCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [inviteCode, setInviteCode] = useState('CARE');

  const handleSendCode = () => {
    setIsCodeSent(true);
    if (speakAloud) {
      speechService.speak("We sent a 4 digit code to your phone. Enter it using the big number buttons.");
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (smsCode.length < 4) {
      const nextCode = smsCode + digit;
      setSmsCode(nextCode);
      if (speakAloud) {
        speechService.speak(digit);
      }
    }
  };

  const handleDeleteDigit = () => {
    setSmsCode((prev) => prev.slice(0, -1));
  };

  const handleConfirm = () => {
    if (authMethod === 'phone' && (!isCodeSent || smsCode.length < 4)) {
      if (!isCodeSent) {
        handleSendCode();
        return;
      }
    }
    if (speakAloud) {
      speechService.speak("Signed in successfully. Welcome, Eleanor!");
    }
    onSuccess(phone);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between p-4 max-w-md mx-auto animate-fade-in">
      {/* Top Header */}
      <div>
        <button
          onClick={onBack}
          id="signin-back-btn"
          className="flex items-center gap-2 text-[#1A56DB] font-bold text-[18px] mb-4 py-1"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span>Back</span>
        </button>

        <h1 className="text-[30px] font-extrabold text-[#0A192F] leading-tight">
          Simple Sign-In
        </h1>
        <p className="text-[18px] font-medium text-gray-700 mt-1">
          Sign in with your phone or a code from your family.
        </p>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-white border-2 border-[#D1D5DB] rounded-2xl">
          <button
            onClick={() => {
              setAuthMethod('phone');
              setIsCodeSent(false);
            }}
            className={`py-3 rounded-xl font-extrabold text-[17px] flex items-center justify-center gap-2 transition-all ${
              authMethod === 'phone'
                ? 'bg-[#1A56DB] text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Phone className="w-5 h-5" />
            <span>Phone Number</span>
          </button>
          <button
            onClick={() => setAuthMethod('invite')}
            className={`py-3 rounded-xl font-extrabold text-[17px] flex items-center justify-center gap-2 transition-all ${
              authMethod === 'invite'
                ? 'bg-[#1A56DB] text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <KeyRound className="w-5 h-5" />
            <span>Family Code</span>
          </button>
        </div>

        {/* Form Body */}
        {authMethod === 'phone' ? (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-[17px] font-extrabold text-[#0A192F] mb-1.5">
                Your Mobile Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-[64px] bg-white border-2 border-[#0A192F] rounded-2xl px-4 text-[22px] font-bold text-[#0A192F] focus:outline-none focus:ring-4 focus:ring-[#1A56DB]/20"
                />
              </div>
            </div>

            {!isCodeSent ? (
              <button
                onClick={handleSendCode}
                id="send-sms-code-btn"
                className="w-full h-[58px] bg-[#E8EEFF] hover:bg-[#d6e3ff] text-[#1A56DB] rounded-2xl border-2 border-[#1A56DB] font-extrabold text-[19px] flex items-center justify-center gap-2"
              >
                <span>Send 4-Digit SMS Code</span>
              </button>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="bg-[#DCFCE7] border-2 border-[#16A34A] rounded-2xl p-3 flex items-center justify-between">
                  <span className="text-[16px] font-bold text-[#14532D]">
                    SMS sent! Code is: <strong>4 8 2 1</strong>
                  </span>
                  <button
                    onClick={() => setSmsCode('4821')}
                    className="bg-[#16A34A] text-white text-[14px] font-bold px-3 py-1 rounded-lg"
                  >
                    Auto-Fill
                  </button>
                </div>

                {/* 4 Digit Displays */}
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="w-14 h-16 bg-white border-3 border-[#0A192F] rounded-2xl flex items-center justify-center text-[28px] font-extrabold text-[#1A56DB] shadow-inner"
                    >
                      {smsCode[index] || ''}
                    </div>
                  ))}
                </div>

                {/* Extra Large Keypad */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleKeypadPress(digit)}
                      className="h-14 bg-white border-2 border-[#D1D5DB] hover:border-[#0A192F] rounded-xl text-[24px] font-extrabold text-[#0A192F] active:bg-[#E8EEFF] transition-all"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    onClick={() => setSmsCode('')}
                    className="h-14 bg-gray-100 border-2 border-[#D1D5DB] rounded-xl text-[16px] font-bold text-gray-700"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => handleKeypadPress('0')}
                    className="h-14 bg-white border-2 border-[#D1D5DB] rounded-xl text-[24px] font-extrabold text-[#0A192F]"
                  >
                    0
                  </button>
                  <button
                    onClick={handleDeleteDigit}
                    className="h-14 bg-gray-100 border-2 border-[#D1D5DB] rounded-xl flex items-center justify-center text-[#DC2626]"
                  >
                    <Delete className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-[17px] font-extrabold text-[#0A192F] mb-1.5">
                4-Letter Family Invitation Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. CARE"
                className="w-full h-[64px] bg-white border-2 border-[#0A192F] rounded-2xl px-4 text-[26px] tracking-widest font-extrabold text-center text-[#1A56DB] focus:outline-none uppercase"
              />
            </div>
            <div className="bg-[#E8EEFF] border-2 border-[#1A56DB] rounded-2xl p-3.5">
              <p className="text-[15px] font-bold text-[#1A56DB]">
                💡 Tip: Your daughter Sarah generated this code from her caregiver app.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="mt-6 mb-2">
        <button
          onClick={handleConfirm}
          id="signin-confirm-btn"
          className="w-full h-[64px] bg-[#1A56DB] hover:bg-[#1546b3] text-white rounded-2xl border-2 border-[#0F172A] tactile-btn flex items-center justify-center gap-3 text-[22px] font-extrabold"
        >
          <span>Confirm &amp; Sign In</span>
          <Check className="w-6 h-6 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
