'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthStatusMessage from '@/components/auth/AuthStatusMessage';
import AdminHelpModal from '@/components/auth/AdminHelpModal';
import type { ForgotPasswordFormValues, FormErrors, AuthFeedback } from '@/types/auth';

// ── Validation ──────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: ForgotPasswordFormValues): FormErrors<ForgotPasswordFormValues> {
  const errors: FormErrors<ForgotPasswordFormValues> = {};
  if (!values.email.trim()) {
    errors.email = 'Work email or Staff ID is required.';
  } else if (values.email.includes('@') && !EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  return errors;
}

// ── Demo simulation ─────────────────────────────────────────────────────────

/**
 * [DEMO ONLY] Simulates sending a password reset email.
 * Does NOT perform real email dispatch or account lookup.
 * [PENDING BACKEND] Replace with POST /api/v1/auth/forgot-password
 */
async function demoSendReset(values: ForgotPasswordFormValues): Promise<AuthFeedback> {
  void values;
  await new Promise((r) => setTimeout(r, 900));
  return {
    type: 'success',
    message:
      'If an authorized staff profile exists for this identifier, reset instructions have been dispatched to your hospital inbox.',
  };
}

// ── Component ───────────────────────────────────────────────────────────────

/**
 * ForgotPasswordForm — Account Recovery form for the MedKnot Hospital Portal.
 *
 * Handles:
 *   - Work email or Staff ID input
 *   - Required + format validation
 *   - Loading state during submission
 *   - Success/error feedback
 *   - Navigation back to Sign In
 *   - Navigation to /verify on success (demo)
 *   - AdminHelpModal
 *   - Security notice: "reset links expire after 15 minutes"
 *   - Universal Clinical Access role badges
 *
 * [DEMO] Submit triggers a simulated delay, not a real API call.
 */
export default function ForgotPasswordForm() {
  const router = useRouter();
  const [values, setValues] = useState<ForgotPasswordFormValues>({ email: '' });
  const [errors, setErrors] = useState<FormErrors<ForgotPasswordFormValues>>({});
  const [feedback, setFeedback] = useState<AuthFeedback>({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ email: e.target.value });
    if (errors.email) setErrors({});
    if (feedback.type) setFeedback({ type: null, message: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    setFeedback({ type: null, message: '' });
    try {
      const result = await demoSendReset(values);
      setFeedback(result);
      // [DEMO] Navigate to verify page after a short delay on success
      if (result.type === 'success') {
        setTimeout(() => router.push('/verify'), 1800);
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Unable to process your request. Please try again or contact your administrator.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-[420px]">
        {/* ── Top status bar ─────────────────────────────────────────── */}
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center rounded-md bg-[#E6F4FF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0055A4]">
            Account Recovery
          </span>
          <span className="flex items-center text-[11px] text-slate-400">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Gate 1 Active
          </span>
        </div>

        {/* ── Page heading ───────────────────────────────────────────── */}
        <header className="mb-8">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-[#003669] md:text-3xl">
            Forgot your password?
          </h2>
          <p className="text-sm text-slate-500">
            Enter your registered work email or staff ID to receive password reset instructions.
          </p>
        </header>

        {/* ── Feedback banner ────────────────────────────────────────── */}
        <AuthStatusMessage type={feedback.type} message={feedback.message} className="mb-5" />

        {/* ── Form ───────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate aria-label="Forgot password form" className="space-y-5">

          {/* Work Email or Staff ID */}
          <div>
            <label
              htmlFor="recovery-email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Work Email or Staff ID
            </label>
            <div
              className={`relative rounded-xl border bg-white shadow-sm transition-all
                ${errors.email
                  ? 'border-red-400 ring-2 ring-red-200'
                  : 'border-slate-200 focus-within:border-[#0055A4] focus-within:ring-2 focus-within:ring-[#0055A4]/15'
                }`}
            >
              {/* @ / email icon */}
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
              <input
                id="recovery-email"
                name="email"
                type="text"
                value={values.email}
                onChange={handleChange}
                placeholder="dr.chen@stjudes.medknot.org"
                autoComplete="username"
                disabled={isLoading}
                required
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'recovery-email-error' : undefined}
                className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            {errors.email && (
              <p id="recovery-email-error" role="alert" className="mt-1.5 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#0055A4] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,85,164,0.3)] transition-all hover:bg-[#00478a] active:bg-[#003b73] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0055A4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Sending instructions…</span>
                </>
              ) : (
                <span>Send Reset Instructions</span>
              )}
            </button>
          </div>

          {/* Back to Sign In */}
          <div className="flex justify-center pt-1">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0055A4] transition-colors hover:underline focus:outline-none focus-visible:underline"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sign In
            </Link>
          </div>
        </form>

        {/* ── Security notice ────────────────────────────────────────── */}
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-[#DCF4A2]/50 bg-[#F7FBF5] px-3 py-2.5 text-xs text-slate-600">
          <svg className="h-4 w-4 flex-shrink-0 text-[#0055A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span className="text-center font-medium">
            For security reasons, password reset links expire after 15 minutes.
          </span>
        </div>

        {/* ── Admin help ─────────────────────────────────────────────── */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
          <p>Need help accessing your account?</p>
          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="mt-1 font-semibold text-[#0055A4] hover:underline focus:outline-none focus-visible:underline"
          >
            Contact your administrator
          </button>
        </div>

        {/* ── Universal Clinical Access role badges ─────────────────── */}
        <div className="mt-8 rounded-xl border border-[#0055A4]/10 bg-[#E6F4FF]/50 p-3 text-center">
          <span className="mb-1.5 block text-[11px] font-medium text-slate-500">Universal Clinical Access</span>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-medium text-slate-600">
            {['Physicians', 'Nursing Staff', 'Desk / Reception', 'Hospital Admins'].map((role) => (
              <span key={role} className="rounded border border-slate-200 bg-white px-2 py-0.5">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <AdminHelpModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
    </>
  );
}
