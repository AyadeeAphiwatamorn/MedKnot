'use client';

import React, { useEffect } from 'react';

interface AdminHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal dialog — Hospital IT & Administrator Support.
 *
 * Displays contact information for the hospital IT help desk.
 * Closes on:
 *   - Close button click
 *   - Escape key press
 *   - Backdrop click
 *
 * Rendered inline; no portal required at this scope.
 * Used by: LoginForm.
 */
export default function AdminHelpModal({ isOpen, onClose }: AdminHelpModalProps) {
  /* Close on Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-help-modal-title"
      onClick={onClose}
    >
      {/* Dialog card — stop propagation so clicking inside doesn't close */}
      <div
        className="w-full max-w-md rounded-2xl border border-[#C5D2C0] bg-white p-6 shadow-[0_12px_36px_rgba(31,43,70,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-[#C8D6C3] pb-3">
          <h3
            id="admin-help-modal-title"
            className="flex items-center space-x-2 text-base font-bold text-[#003669]"
          >
            <svg
              className="h-5 w-5 text-[#0055A4]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>Hospital IT &amp; Administrator Support</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0055A4]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="mb-5 space-y-3 text-xs text-slate-600">
          <p>
            If you have forgotten your Staff ID or your organization&apos;s credentials have
            expired, reach out to your facility&apos;s MedKnot Lead:
          </p>
          <div className="space-y-1.5 rounded-xl border border-[#C8D6C3] bg-[#E1E9DC] p-3">
            <div className="flex justify-between font-medium">
              <span>IT Help Desk:</span>
              <span className="text-[#0055A4]">ext. 4402 (Internal)</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Direct Support:</span>
              <a
                href="mailto:portal-ops@medknot.org"
                className="text-[#0055A4] hover:underline focus:outline-none focus-visible:underline"
              >
                portal-ops@medknot.org
              </a>
            </div>
            <div className="flex justify-between font-medium">
              <span>Urgent Triage Line:</span>
              <span className="text-slate-700">1-800-MED-KNOT</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#0055A4] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#00478a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0055A4] focus-visible:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
