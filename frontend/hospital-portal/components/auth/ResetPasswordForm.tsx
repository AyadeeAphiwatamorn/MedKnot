'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PasswordInput from '@/components/auth/PasswordInput';
import AdminHelpModal from '@/components/auth/AdminHelpModal';

export default function ResetPasswordForm() {
  const router = useRouter();

  // Form values
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modals & States
  const [isExpired, setIsExpired] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Password requirements checks
  const hasLength = newPassword.length >= 8;
  const hasCasing = /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const score = [hasLength, hasCasing, hasNumber, hasSpecial].filter(Boolean).length;
  const isMatch = Boolean(confirmPassword && newPassword === confirmPassword);
  const hasConfirmText = Boolean(confirmPassword);

  // Strength label & colors
  let strengthLabel = 'Too weak';
  let strengthColor = 'text-slate-500';
  if (newPassword.length > 0) {
    if (score === 1) {
      strengthLabel = 'Weak';
      strengthColor = 'text-red-500';
    } else if (score === 2) {
      strengthLabel = 'Fair';
      strengthColor = 'text-amber-500';
    } else if (score === 3) {
      strengthLabel = 'Good';
      strengthColor = 'text-blue-600';
    } else if (score === 4) {
      strengthLabel = 'Strong';
      strengthColor = 'text-emerald-600';
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return;

    if (!newPassword || !confirmPassword) {
      setFormError('Please complete both password fields.');
      return;
    }

    if (score < 4) {
      setFormError('Please ensure your new password satisfies all clinical security requirements.');
      return;
    }

    if (!isMatch) {
      setFormError('The passwords you entered do not match.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    // Simulate backend update
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 700);
  };

  return (
    <>
      <div className="w-full max-w-[430px] flex flex-col justify-center my-auto">
        {/* Header Info Pill & Status Dot */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#0055A4] bg-[#E6F4FF] px-3 py-1 rounded-md">
            ACCOUNT RECOVERY
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Gate 1 Active</span>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-[#092540] tracking-tight">
          Create a new password
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1.5">
          Choose a strong password to protect your professional account.
        </p>

        {/* Simulated Expired Link Banner */}
        {isExpired && (
          <div
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5"
            role="alert"
          >
            <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">This password reset link is invalid or has expired.</p>
              <Link
                href="/forgot-password"
                className="text-[#0055A4] font-semibold underline hover:text-[#00478a] mt-0.5 inline-block"
              >
                Request a new reset link
              </Link>
            </div>
          </div>
        )}

        {/* Validation Form Error Banner */}
        {formError && !isExpired && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700" role="alert">
            {formError}
          </div>
        )}

        {/* Reset Password Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Field 1: New Password */}
          <PasswordInput
            id="new-password"
            name="newPassword"
            label="NEW PASSWORD"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (formError) setFormError(null);
            }}
            placeholder="Enter your new password"
            autoComplete="new-password"
            disabled={isExpired || isSubmitting}
          />

          {/* Field 2: Confirm Password */}
          <div>
            <PasswordInput
              id="confirm-password"
              name="confirmPassword"
              label="CONFIRM NEW PASSWORD"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              disabled={isExpired || isSubmitting}
            />

            {/* Match Status feedback */}
            {hasConfirmText && (
              <p
                className={`text-[11px] font-medium block mt-1.5 ${
                  isMatch ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {isMatch ? '✓ Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>

          {/* Password Strength Meter */}
          <div className="pt-1">
            <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
              <span>Password strength</span>
              <span className={`font-medium ${strengthColor}`}>{strengthLabel}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex gap-1">
              <div
                className={`h-full w-1/4 transition-colors duration-200 ${
                  score >= 1
                    ? score === 1
                      ? 'bg-red-500'
                      : score === 2
                      ? 'bg-amber-400'
                      : score === 3
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
              />
              <div
                className={`h-full w-1/4 transition-colors duration-200 ${
                  score >= 2
                    ? score === 2
                      ? 'bg-amber-400'
                      : score === 3
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
              />
              <div
                className={`h-full w-1/4 transition-colors duration-200 ${
                  score >= 3
                    ? score === 3
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
              />
              <div
                className={`h-full w-1/4 transition-colors duration-200 ${
                  score >= 4 ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            </div>
          </div>

          {/* Password Requirements Checklist */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-600 block mb-1">Password must include:</span>

            {/* Rule 1 */}
            <div
              className={`flex items-center gap-2 text-xs ${
                hasLength ? 'text-emerald-700 font-medium' : 'text-slate-500'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  hasLength ? 'bg-emerald-500 text-white' : 'border border-slate-300'
                }`}
              >
                {hasLength && '✓'}
              </span>
              <span>At least 8 characters</span>
            </div>

            {/* Rule 2 */}
            <div
              className={`flex items-center gap-2 text-xs ${
                hasCasing ? 'text-emerald-700 font-medium' : 'text-slate-500'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  hasCasing ? 'bg-emerald-500 text-white' : 'border border-slate-300'
                }`}
              >
                {hasCasing && '✓'}
              </span>
              <span>At least one uppercase and one lowercase letter</span>
            </div>

            {/* Rule 3 */}
            <div
              className={`flex items-center gap-2 text-xs ${
                hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  hasNumber ? 'bg-emerald-500 text-white' : 'border border-slate-300'
                }`}
              >
                {hasNumber && '✓'}
              </span>
              <span>At least one number</span>
            </div>

            {/* Rule 4 */}
            <div
              className={`flex items-center gap-2 text-xs ${
                hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  hasSpecial ? 'bg-emerald-500 text-white' : 'border border-slate-300'
                }`}
              >
                {hasSpecial && '✓'}
              </span>
              <span>At least one special character</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isExpired || isSubmitting}
              className={`w-full py-3 px-4 text-white font-medium text-sm rounded-xl shadow-[0_4px_12px_rgba(0,85,164,0.25)] transition-all duration-150 flex items-center justify-center gap-2 ${
                isExpired || isSubmitting
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-[#0055A4] hover:bg-[#00478a] active:bg-[#003b73] cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Updating password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </div>

          {/* Return to Sign In Link */}
          <div className="text-center pt-1">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#092540] hover:text-[#0055A4] transition-colors focus:outline-none"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>

        {/* Security Reassurance Card */}
        <aside className="mt-4 p-3 bg-[#FAFDF8] border border-[#DCF4A2]/70 rounded-xl flex items-start gap-2.5 text-slate-700 text-xs">
          <svg className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="leading-relaxed">
            For security, your new password must not be identical to your last 3 passwords.
          </span>
        </aside>

        {/* Admin Assistance Link */}
        <div className="text-center mt-5 text-xs text-slate-500">
          <span>Need help accessing your account?</span>
          <button
            onClick={() => setShowAdminModal(true)}
            className="font-semibold text-[#0055A4] hover:underline ml-1 focus:outline-none"
            type="button"
          >
            Contact your administrator
          </button>
        </div>

        {/* Universal Clinical Access Badges Cluster */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <p className="text-[11px] text-center text-slate-500 font-medium mb-2.5 uppercase tracking-wider">
            Universal Clinical Access
          </p>
          <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
            {['Physicians', 'Nursing Staff', 'Desk / Reception', 'Hospital Admins'].map((role) => (
              <span
                key={role}
                className="bg-[#F8FAFC] border border-slate-200/80 text-slate-600 py-1 px-1 rounded-md font-medium truncate"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Interactive State Demo Toggles (Helper bar for reviewing states) */}
        <div className="mt-4 pt-3 border-dashed border-t border-slate-200 flex justify-center gap-2 text-[10px] text-slate-400">
          <span>Demo States:</span>
          <button
            onClick={() => setIsExpired((prev) => !prev)}
            className="underline hover:text-[#0055A4] cursor-pointer"
            type="button"
          >
            {isExpired ? 'Clear Expired Link' : 'Simulate Expired Link'}
          </button>
          <span>•</span>
          <button
            onClick={() => setShowSuccessModal(true)}
            className="underline hover:text-[#0055A4] cursor-pointer"
            type="button"
          >
            Simulate Success
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl border border-slate-100 text-center transform transition-all scale-100">
            <div className="w-16 h-16 bg-[#E6F4FF] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#BDE0FE]">
              <svg className="w-8 h-8 text-[#0055A4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#092540]">Password Updated</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Your password has been updated successfully. You can now use your new credentials to access your hospital workspace.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-[#0055A4] hover:bg-[#00478a] text-white font-medium text-sm rounded-xl shadow-md transition-colors cursor-pointer"
                type="button"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Help Modal */}
      <AdminHelpModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
    </>
  );
}
