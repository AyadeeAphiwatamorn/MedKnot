'use client';

import React from 'react';
import type { FeedbackType } from '@/types/auth';

interface AuthStatusMessageProps {
  type: FeedbackType;
  message: string;
  className?: string;
}

/**
 * Reusable inline feedback banner for authentication forms.
 *
 * Renders nothing when `type` is null — no DOM node is added.
 * Color-coded for error, success, and warning states.
 *
 * Used by: LoginForm, ForgotPasswordForm, OtpVerificationForm, ResetPasswordForm.
 */
export default function AuthStatusMessage({
  type,
  message,
  className = '',
}: AuthStatusMessageProps) {
  if (!type || !message) return null;

  const variants: Record<NonNullable<FeedbackType>, {
    wrapper: string;
    iconPath: string;
  }> = {
    error: {
      wrapper: 'bg-red-50 text-red-700 border-red-200',
      iconPath:
        'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    success: {
      wrapper: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconPath: 'M5 13l4 4L19 7',
    },
    warning: {
      wrapper: 'bg-amber-50 text-amber-800 border-amber-200',
      iconPath:
        'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    },
  };

  const { wrapper, iconPath } = variants[type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-start space-x-2.5 rounded-xl border p-3.5 text-xs font-medium ${wrapper} ${className}`}
    >
      <svg
        className="mt-0.5 h-4 w-4 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={iconPath}
        />
      </svg>
      <span className="flex-1">{message}</span>
    </div>
  );
}
