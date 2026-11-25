'use client';

import React, { useState } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import OtpVerificationForm from '@/components/auth/OtpVerificationForm';
import type { OtpState } from '@/components/auth/OtpInput';

/* ── Verification page feature highlights ───────────────────────────── */
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

const VERIFY_FEATURES = [
  {
    icon: <IconShield />,
    title: 'HIPAA-Compliant Security',
    description: 'All verification is encrypted end-to-end',
  },
  {
    icon: <IconLock />,
    title: 'Multi-Factor Protection',
    description: 'Secure access with one-time verification codes',
  },
  {
    icon: <IconCheck />,
    title: 'Instant Access',
    description: 'Complete verification and start in seconds',
  },
];

export default function VerifyPage() {
  const [demoState, setDemoState] = useState<OtpState>('default');

  const states: { id: OtpState; label: string }[] = [
    { id: 'default', label: 'Default' },
    { id: 'invalid', label: 'Invalid Code' },
    { id: 'expired', label: 'Expired Code' },
    { id: 'rate-limit', label: 'Too Many Attempts' },
    { id: 'success', label: 'Success Verified' },
  ];

  const demoSwitcher = (
    <nav
      className="mb-5 flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2 text-xs shadow-sm backdrop-blur-md"
      aria-label="Demo state switcher"
    >
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Demo State:
      </span>
      {states.map(({ id, label }) => {
        const isActive = demoState === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setDemoState(id)}
            className={`rounded-full px-3 py-1 font-medium transition-all ${
              isActive
                ? 'bg-[#0055A4] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );

  const legalFooter = (
    <footer className="mt-5 text-center text-xs text-slate-400">
      © 2025 MedKnot Health Informatics Inc. All clinical rights reserved. Protected under Federal HIPAA Safeguards.
    </footer>
  );

  return (
    <AuthLayout
      variant="blue"
      headline={"One secure step\nto get started."}
      subCopy="Verify your contact information to help protect access to your professional healthcare workspace."
      footerTagline="For authorized healthcare professionals only."
      features={VERIFY_FEATURES}
      headerElement={demoSwitcher}
      footerElement={legalFooter}
    >
      <OtpVerificationForm
        state={demoState}
        onStateChange={(newState) => setDemoState(newState)}
      />
    </AuthLayout>
  );
}
