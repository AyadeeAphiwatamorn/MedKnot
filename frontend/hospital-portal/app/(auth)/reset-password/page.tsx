import type { Metadata } from 'next';
import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password — MedKnot Hospital Portal',
  description:
    'Create a new password to regain access to your MedKnot Hospital Portal professional workspace.',
};

function IconKey() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
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

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const RESET_FEATURES = [
  {
    icon: <IconKey />,
    title: 'Password Requirements',
    description: 'Minimum 8 characters with letters and numbers',
  },
  {
    icon: <IconShield />,
    title: 'Encrypted Storage',
    description: 'Your password is never stored in plain text',
  },
  {
    icon: <IconCheck />,
    title: 'Instant Activation',
    description: 'Sign in immediately after updating your password',
  },
];

/**
 * Reset Password page — /reset-password
 */
export default function ResetPasswordPage() {
  return (
    <AuthLayout
      variant="blue"
      headline={"Secure your\naccount."}
      subCopy="Create a new password to regain access to your professional healthcare workspace."
      footerTagline="Secure access for authorized healthcare professionals."
      features={RESET_FEATURES}
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
