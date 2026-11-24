'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OtpInput, { type OtpState } from '@/components/auth/OtpInput';
import AdminHelpModal from '@/components/auth/AdminHelpModal';

interface OtpVerificationFormProps {
  state?: OtpState;
  onStateChange?: (state: OtpState) => void;
}

const PRESET_DIGITS: Record<OtpState, string[]> = {
  default: ['7', '4', '2', '', '', ''],
  invalid: ['8', '9', '1', '0', '3', '7'],
  expired: ['7', '4', '2', '', '', ''],
  'rate-limit': ['', '', '', '', '', ''],
  success: ['7', '4', '2', '9', '1', '5'],
};

const PRESET_FEEDBACK: Record<OtpState, string | null> = {
  default: null,
  invalid: '⚠️ Invalid verification code. 2 attempts remaining before temporary lockout.',
  expired: '⏱️ This code has expired. Please request a new one.',
  'rate-limit': '🔒 Security lockout: Too many incorrect attempts. Please try again in 14 minutes.',
  success: '✅ Identity confirmed. Redirecting to MedKnot Clinical Hub...',
};

export default function OtpVerificationForm({
  state = 'default',
  onStateChange,
}: OtpVerificationFormProps) {
  const router = useRouter();

  // Track the state for which custom digits were entered
  const [lastState, setLastState] = useState<OtpState>(state);
  const [customDigits, setCustomDigits] = useState<string[] | null>(null);
  const [customFeedback, setCustomFeedback] = useState<string | null>(null);

  // If the parent passed a new state, reset custom overrides
  if (state !== lastState) {
    setLastState(state);
    setCustomDigits(null);
    setCustomFeedback(null);
  }

  const digits = customDigits ?? PRESET_DIGITS[state];
  const feedback = customFeedback ?? PRESET_FEEDBACK[state];

  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [destinationMethod, setDestinationMethod] = useState<'email' | 'phone'>('email');
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Resend countdown timer
  React.useEffect(() => {
    if (timerSeconds <= 0 || state === 'expired' || state === 'rate-limit') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds, state]);

  // Handle digit change from OtpInput
  const handleOtpChange = (newDigits: string[]) => {
    setCustomDigits(newDigits);
    if (state === 'invalid') {
      onStateChange?.('default');
      setCustomFeedback(null);
    }
  };

  // Resend code interaction
  const handleResend = () => {
    if (timerSeconds > 0 && state !== 'expired') return;
    setTimerSeconds(30);
    setCustomDigits(['', '', '', '', '', '']);
    setCustomFeedback('A fresh 6-digit code has been dispatched to your destination.');
    onStateChange?.('default');
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'rate-limit') return;

    const code = digits.join('');
    if (code.length < 6) {
      setCustomFeedback('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);

    // Simulate verification
    setTimeout(() => {
      setIsSubmitting(false);
      // Demo: if digits are "000000", show invalid state
      if (code === '000000') {
        onStateChange?.('invalid');
        setCustomFeedback('⚠️ Invalid verification code. 2 attempts remaining before temporary lockout.');
        return;
      }

      // Success state
      onStateChange?.('success');
      setCustomFeedback('✅ Identity confirmed. Redirecting to MedKnot Clinical Hub...');

      // Auto-navigate to reset password or next auth milestone
      setTimeout(() => {
        router.push('/reset-password');
      }, 1500);
    }, 800);
  };

  // Toggle delivery channel
  const toggleMethod = () => {
    setDestinationMethod((prev) => (prev === 'email' ? 'phone' : 'email'));
  };

  const formattedTimer = `00:${timerSeconds.toString().padStart(2, '0')}`;

  return (
    <>
      <div className="w-full max-w-[430px] mx-auto">
        {/* Eyebrow Row */}
        <header className="flex items-center justify-between mb-5">
          <span className="bg-[#E6F4FF] text-[#0055A4] px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
            ACCOUNT VERIFICATION
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Gate 1 Active
          </span>
        </header>

        {/* Main Heading */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2B46] tracking-tight">
            Verify your account
          </h2>
          <p className="text-slate-500 text-sm mt-1.5">
            Enter the verification code sent to your registered contact method.
          </p>
        </div>

        {/* Verification Destination Card */}
        <div
          className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between mb-6 shadow-xs"
          data-purpose="destination-info-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E6F4FF] text-[#0055A4] flex items-center justify-center border border-blue-100 flex-shrink-0">
              {destinationMethod === 'email' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              )}
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-1">
                Verification Code Destination
              </span>
              <span className="block text-sm font-semibold text-slate-800">
                {destinationMethod === 'email' ? 'dr.c***@hospital.com' : '+1 (***) ***-4892'}
              </span>
            </div>
          </div>
          <button
            onClick={toggleMethod}
            className="text-xs font-semibold text-[#0055A4] hover:underline focus:outline-none transition-colors"
            type="button"
          >
            Change method
          </button>
        </div>

        {/* Verification Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* OTP Header & Label */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="otp-1">
                6-Digit Code
              </label>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                ⚡ Auto-fill supported
              </span>
            </div>

            {/* 6 Individual Input Boxes */}
            <OtpInput
              digits={digits}
              onChange={handleOtpChange}
              state={state}
              disabled={isSubmitting || state === 'rate-limit' || state === 'success'}
            />

            {/* Dynamic State Message Banner */}
            {feedback && (
              <div
                className={`mt-3 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  state === 'invalid' || state === 'rate-limit'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : state === 'expired'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : state === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                <span>{feedback}</span>
              </div>
            )}
          </div>

          {/* Resend Row */}
          <div className="flex items-center justify-between text-sm pt-0.5">
            <span className="text-slate-500">Didn&apos;t receive the code?</span>
            {timerSeconds > 0 && state !== 'expired' ? (
              <button
                className="font-semibold text-[#0055A4] opacity-80 cursor-not-allowed focus:outline-none"
                disabled
                type="button"
              >
                Resend code ({formattedTimer})
              </button>
            ) : (
              <button
                onClick={handleResend}
                className="font-semibold text-[#0055A4] hover:underline cursor-pointer focus:outline-none transition-colors"
                type="button"
              >
                Resend code now
              </button>
            )}
          </div>

          {/* Primary Submit Button */}
          {state === 'success' ? (
            <button
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              type="button"
              disabled
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>Verified • Accessing Portal...</span>
            </button>
          ) : (
            <button
              className={`w-full h-12 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 ${
                state === 'rate-limit' || isSubmitting
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-[#0055A4] hover:bg-[#00478a] active:bg-[#003c75] cursor-pointer'
              }`}
              type="submit"
              disabled={state === 'rate-limit' || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                  <span>Verify Account</span>
                </>
              )}
            </button>
          )}

          {/* Navigation Links */}
          <div className="flex justify-between items-center pt-1 text-xs font-semibold text-[#0055A4]">
            <Link href="/login" className="hover:underline flex items-center gap-1 focus:outline-none">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Sign In</span>
            </Link>
            <Link href="/forgot-password" className="hover:underline focus:outline-none">
              Need new link?
            </Link>
          </div>
        </form>

        {/* Security Information Reassurance Box */}
        <div className="mt-5 bg-[#DCF4A2]/25 border border-[#A4CBBA]/50 rounded-xl p-3 flex items-start gap-2.5">
          <div className="text-[#0055A4] flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" />
            </svg>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Verification codes expire after a limited time. Never share your security code with anyone.
          </p>
        </div>

        {/* Help & Contact Divider */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 text-center">
          <p className="text-xs text-slate-500 mb-0.5">Having trouble verifying your account?</p>
          <button
            onClick={() => setShowAdminModal(true)}
            className="text-xs font-semibold text-[#0055A4] hover:underline focus:outline-none"
            type="button"
          >
            Contact your administrator
          </button>
        </div>

        {/* Universal Clinical Access */}
        <footer className="mt-8 pt-6 border-t border-slate-100 max-w-[430px] mx-auto w-full">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 text-center mb-2.5">
            UNIVERSAL CLINICAL ACCESS
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Physicians', 'Nursing Staff', 'Desk / Reception', 'Hospital Admins'].map((role) => (
              <div
                key={role}
                className="px-2 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50/70 text-slate-600 text-xs font-medium text-center"
              >
                {role}
              </div>
            ))}
          </div>
        </footer>
      </div>

      <AdminHelpModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
    </>
  );
}
