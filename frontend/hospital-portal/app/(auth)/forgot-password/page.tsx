import type { Metadata } from 'next';
import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password — MedKnot Hospital Portal',
  description:
    'Reset your password securely to regain access to your MedKnot Hospital Portal professional workspace.',
};

/* ── Forgot-password feature highlights ─────────────────────────────── */
function IconKey() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

const FORGOT_FEATURES = [
  {
    icon: <IconKey />,
    title: 'Secure Recovery',
    description: 'Your reset link is encrypted and time-limited',
  },
  {
    icon: <IconMail />,
    title: 'Email Verification',
    description: 'Recovery link sent to your registered work email',
  },
  {
    icon: <IconShield />,
    title: 'Protected Access',
    description: 'Only authorized staff can reset their credentials',
  },
];

/**
 * Forgot Password page — /forgot-password
 */
export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      variant="blue"
      headline={"Your care team's\naccess, protected."}
      subCopy="Reset your password securely to regain access to your professional healthcare workspace."
      footerTagline="Secure access for authorized healthcare professionals."
      features={FORGOT_FEATURES}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
