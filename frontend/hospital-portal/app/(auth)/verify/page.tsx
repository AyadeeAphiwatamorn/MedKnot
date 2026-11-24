'use client';

import React, { useState } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import OtpVerificationForm from '@/components/auth/OtpVerificationForm';
import type { OtpState } from '@/components/auth/OtpInput';

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
      variant="green"
      headline="One secure step to get started."
      subCopy="Verify your contact information to help protect access to your professional healthcare workspace."
      footerTagline="For authorized healthcare professionals only."
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
