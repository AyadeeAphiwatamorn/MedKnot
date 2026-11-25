import React from 'react';

interface SecurityNoticeProps {
  message?: string;
}

/**
 * Reusable security notice bar shown below authentication form submit buttons.
 *
 * Displays a shield icon alongside a short access-restriction message.
 * Stateless — no client-side behavior required.
 *
 * Used by: LoginForm (and future OtpVerificationForm, ResetPasswordForm).
 */
export default function SecurityNotice({
  message = 'Access is restricted to authorized healthcare professionals.',
}: SecurityNoticeProps) {
  return (
    <div className="flex items-center justify-center space-x-2 rounded-lg border border-[#DFEEA9]/70 bg-[#F8FAF6] px-3 py-2.5 text-xs text-slate-600">
      <svg
        className="h-4 w-4 flex-shrink-0 text-[#015CA9]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
      <span className="text-center font-medium">{message}</span>
    </div>
  );
}
