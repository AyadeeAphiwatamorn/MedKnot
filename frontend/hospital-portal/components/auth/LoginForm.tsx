'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PasswordInput from '@/components/auth/PasswordInput';
import SecurityNotice from '@/components/auth/SecurityNotice';
import AuthStatusMessage from '@/components/auth/AuthStatusMessage';
import AdminHelpModal from '@/components/auth/AdminHelpModal';
import { setClientSession } from '@/lib/auth';
import type { LoginFormValues, FormErrors, AuthFeedback } from '@/types/auth';

// ── Validation ──────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLoginForm(values: LoginFormValues): FormErrors<LoginFormValues> {
  const errors: FormErrors<LoginFormValues> = {};

  if (!values.identifier.trim()) {
    errors.identifier = 'Work email or Staff ID is required.';
  } else if (
    values.identifier.includes('@') &&
    !EMAIL_REGEX.test(values.identifier.trim())
  ) {
    errors.identifier = 'Please enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

// ── Demo simulation ─────────────────────────────────────────────────────────

/**
 * [DEMO ONLY] Simulates an authentication request with a fixed delay.
 *
 * This function DOES NOT perform real authentication.
 * No credentials are validated against a backend.
 * No tokens are issued or stored.
 *
 * Replace the body of this function with a real API call when the
 * Spring Boot backend is available:
 *   POST /api/v1/auth/login  →  { identifier, password }
 *
 * @returns A demo AuthFeedback object after a simulated network delay.
 */
async function demoSignIn(values: LoginFormValues): Promise<AuthFeedback> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const trimmedId = values.identifier.trim().toLowerCase();
  const password = values.password.trim();

  // Test account suspension condition
  if (trimmedId.includes('suspended')) {
    return {
      type: 'error',
      message:
        'Account Status: This hospital staff account has been temporarily suspended. Please contact your organization administrator.',
    };
  }

  // Test account locked or unauthorized condition
  if (trimmedId.includes('locked') || trimmedId.includes('unauthorized')) {
    return {
      type: 'error',
      message:
        'Access Denied: This staff account is not authorized to access the Hospital Portal.',
    };
  }

  // Validate incorrect credentials
  if (
    password === 'wrong' ||
    password === 'invalid' ||
    password === 'incorrect' ||
    password.length < 6
  ) {
    return {
      type: 'error',
      message:
        'Invalid credentials. Please verify your work email or Staff ID and password.',
    };
  }

  return {
    type: 'success',
    message:
      'Authentication successful! Redirecting to Hospital Admin Dashboard…',
  };
}

// ── Component ───────────────────────────────────────────────────────────────

/**
 * LoginForm — Staff Sign In form for the MedKnot Hospital Portal.
 *
 * Handles:
 *   - Work email or Staff ID input
 *   - Password input (via reusable PasswordInput)
 *   - Required field + email format validation
 *   - Loading state during submission
 *   - Success and error feedback via AuthStatusMessage
 *   - Navigation to Forgot Password page
 *   - Session persistence and redirection to /dashboard
 *   - AdminHelpModal for support contact information
 *   - Role badge display (Physicians, Nursing Staff, Desk / Reception, Hospital Admins)
 */
export default function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginFormValues>({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors<LoginFormValues>>({});
  const [feedback, setFeedback] = useState<AuthFeedback>({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // ── Field change handler ────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    // Clear field-level error on edit
    if (errors[name as keyof LoginFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear banner feedback when user starts editing
    if (feedback.type) {
      setFeedback({ type: null, message: '' });
    }
  };

  // ── Submit handler ──────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Field-level validation
    const validationErrors = validateLoginForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    setFeedback({ type: null, message: '' });

    try {
      const result = await demoSignIn(values);
      setFeedback(result);

      if (result.type === 'success') {
        const isDoctor = values.identifier.toLowerCase().includes('chen');
        setClientSession({
          name: isDoctor ? 'Dr. Chen Wei' : 'Michael Lee',
          role: isDoctor ? 'Physician' : 'Hospital Admin',
          department: isDoctor ? 'Internal Medicine' : 'Hospital Administration',
          facility: 'St. Jude Medical Center — Campus North',
          shift: 'Morning Shift • Active 08:00 – 16:00',
          email: values.identifier.includes('@')
            ? values.identifier
            : `${values.identifier}@stjudes.medknot.org`,
          authenticated: true,
        });

        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      }
    } catch {
      setFeedback({
        type: 'error',
        message:
          'Unable to connect to the authentication service. Please try again or contact your administrator.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <div className="w-full max-w-[420px]">

        {/* ── Top status bar ─────────────────────────────────────────── */}
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span className="inline-flex items-center rounded-md bg-[#E1F2FD] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#015CA9]">
            Hospital Portal
          </span>
          <span className="flex items-center text-[11px] text-slate-400">
            <span
              className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            Gate 1 Active
          </span>
        </div>

        {/* ── Page heading ───────────────────────────────────────────── */}
        <header className="mb-8">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-[#003669] md:text-3xl">
            Welcome back, Doctor
          </h2>
          <p className="text-sm text-slate-500">
            Sign in to access your professional workspace.
          </p>
        </header>

        {/* ── Feedback banner ────────────────────────────────────────── */}
        <AuthStatusMessage
          type={feedback.type}
          message={feedback.message}
          className="mb-5"
        />

        {/* ── Sign In form ───────────────────────────────────────────── */}
        <form
          id="login-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label="Hospital staff sign in form"
          className="space-y-5"
        >

          {/* Work email or Staff ID */}
          <div>
            <label
              htmlFor="identifier"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Work email or Staff ID
            </label>
            <div
              className={`relative rounded-xl border bg-white shadow-sm transition-all
                ${errors.identifier
                  ? 'border-red-400 ring-2 ring-red-200'
                  : 'border-slate-200 focus-within:border-[#015CA9] focus-within:ring-2 focus-within:ring-[#015CA9]/15'
                }`}
            >
              {/* Person icon */}
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={values.identifier}
                onChange={handleChange}
                placeholder="Enter your work email or staff ID"
                autoComplete="username"
                disabled={isLoading}
                required
                aria-invalid={Boolean(errors.identifier)}
                aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                className="w-full rounded-xl bg-transparent py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            {errors.identifier && (
              <p id="identifier-error" role="alert" className="mt-1.5 text-xs text-red-600">
                {errors.identifier}
              </p>
            )}
          </div>

          {/* Password */}
          <PasswordInput
            id="password"
            name="password"
            label="Password"
            value={values.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password}
            disabled={isLoading}
            labelAction={
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#0055A4] transition-colors hover:underline focus:outline-none focus-visible:underline"
              >
                Forgot password?
              </Link>
            }
          />

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#015CA9] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(1,92,169,0.28)] transition-all hover:bg-[#004e90] active:bg-[#00437c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#015CA9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span>Verifying credentials…</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>
        </form>

        {/* ── Security notice ────────────────────────────────────────── */}
        <div className="mt-6">
          <SecurityNotice />
        </div>

        {/* ── New Hospital Registration Entry Point ─────────────────── */}
        <div className="mt-6 rounded-2xl border border-[#DDE6DA] bg-[#F7F3EC]/80 p-4 text-center">
          <span className="block text-xs font-semibold uppercase tracking-wider text-[#1F2B46]">
            New to MedKnot?
          </span>
          <Link
            href="/register-hospital"
            className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-[#0055A4] hover:underline focus:outline-none focus-visible:underline"
          >
            <span>Register your hospital</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
          <p className="mt-1 text-xs text-[#5A6372] leading-relaxed">
            Join MedKnot&apos;s connected healthcare network and manage your hospital through one unified platform.
          </p>
          <div className="mt-3 border-t border-[#DDE6DA] pt-2 text-[11px] text-[#727783]">
            Already part of a hospital? Contact your Hospital Administrator to receive an invitation.
          </div>
        </div>

        {/* ── Administrator help ─────────────────────────────────────── */}
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

        {/* ── Universal clinical access role badges ─────────────────── */}
        <div className="mt-8 rounded-xl border border-[#0055A4]/10 bg-[#E6F4FF]/50 p-3 text-center">
          <span className="mb-1.5 block text-[11px] font-medium text-slate-500">
            Universal Clinical Access
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-medium text-slate-600">
            {['Physicians', 'Nursing Staff', 'Desk / Reception', 'Hospital Admins'].map(
              (role) => (
                <span
                  key={role}
                  className="rounded border border-slate-200 bg-white px-2 py-0.5"
                >
                  {role}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      {/* ── Admin Help Modal (outside card flow) ───────────────────── */}
      <AdminHelpModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </>
  );
}
