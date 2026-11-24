"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function RegistrationPendingContent() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref") || "MK-HOSP-2026-8942";

  return (
    <div className="min-h-screen bg-[#EDF2E9] text-[#1F2B46] font-body-md antialiased flex flex-col justify-between">
      {/* Top Simple Header */}
      <header className="w-full bg-[#F3F6F0] border-b border-[#DDE6DA] py-4 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#DDE6DA] flex items-center justify-center p-1 shadow-xs">
              <Image
                src="/logo.png"
                alt="MedKnot Logo"
                width={28}
                height={28}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-[#0055A4] tracking-tight leading-none font-bold">
                MedKnot
              </span>
              <span className="font-supporting text-supporting text-[#5A6372] font-semibold tracking-wider uppercase mt-0.5">
                Hospital Portal
              </span>
            </div>
          </Link>

          <Link
            href="/login"
            className="text-xs font-semibold text-[#0055A4] hover:underline flex items-center gap-1"
          >
            <span>Return to Sign In</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Main Success Container */}
      <main className="w-full max-w-4xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center">
        <div className="w-full bg-white border border-[#DDE6DA] rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col items-center text-center">
          {/* Animated Success Badge */}
          <div className="w-20 h-20 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shadow-sm mb-6 animate-in zoom-in-75">
            <span className="material-symbols-outlined text-4xl text-secondary">
              check_circle
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-[#EBF3FC] text-[#0055A4] font-supporting text-xs font-bold uppercase tracking-wider mb-2">
            Application Received
          </span>

          <h1 className="font-headline-xl text-headline-xl text-[#1F2B46] tracking-tight font-bold mb-3">
            Hospital Registration Submitted
          </h1>

          <p className="font-body-lg text-body-lg text-[#5A6372] max-w-2xl mb-8">
            Thank you for registering with the MedKnot Connected Care network. Your institutional registration application has been received and entered our compliance vetting queue.
          </p>

          {/* Reference Card */}
          <div className="w-full max-w-xl p-6 rounded-2xl bg-[#F3F6F0] border border-[#DDE6DA] mb-8 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-supporting text-supporting text-[#5A6372] uppercase tracking-wider block">
                  Application Reference Number
                </span>
                <span className="font-headline-md text-headline-sm font-mono font-bold text-[#0055A4]">
                  {refParam}
                </span>
              </div>

              <div>
                <span className="font-supporting text-supporting text-[#5A6372] uppercase tracking-wider block">
                  Application Status
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mt-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Pending Review
                </span>
              </div>

              <div>
                <span className="font-supporting text-supporting text-[#5A6372] uppercase tracking-wider block">
                  Administrator Account Status
                </span>
                <span className="text-sm font-semibold text-[#1F2B46] block mt-1">
                  Invitation Pending Approval
                </span>
              </div>

              <div>
                <span className="font-supporting text-supporting text-[#5A6372] uppercase tracking-wider block">
                  Estimated Review Timeframe
                </span>
                <span className="text-sm font-semibold text-[#1F2B46] block mt-1">
                  24–48 Business Hours
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps Timeline */}
          <div className="w-full max-w-2xl text-left mb-8">
            <h2 className="font-card-heading text-card-heading text-[#1F2B46] font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0055A4]">timeline</span>
              What Happens Next?
            </h2>

            <div className="relative pl-6 space-y-5 border-l-2 border-[#DDE6DA]">
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#0055A4] ring-4 ring-white" />
                <h3 className="font-card-heading text-body-md font-semibold text-[#1F2B46]">
                  1. Institutional Credential Vetting
                </h3>
                <p className="font-supporting text-supporting text-[#5A6372] mt-0.5">
                  The MedKnot Central Onboarding Desk reviews your facility license, registration charter, and legal board authorization against official registries.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#DDE6DA] ring-4 ring-white" />
                <h3 className="font-card-heading text-body-md font-semibold text-[#1F2B46]">
                  2. Administrator Verification Call
                </h3>
                <p className="font-supporting text-supporting text-[#5A6372] mt-0.5">
                  A compliance officer may contact your official registry desk to confirm authorized delegation of clinical administration.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#DDE6DA] ring-4 ring-white" />
                <h3 className="font-card-heading text-body-md font-semibold text-[#1F2B46]">
                  3. Account Invitation Dispatch
                </h3>
                <p className="font-supporting text-supporting text-[#5A6372] mt-0.5">
                  Once approved, an invitation link will be delivered strictly to the Authorized Administrator’s official institutional work email.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#DDE6DA] ring-4 ring-white" />
                <h3 className="font-card-heading text-body-md font-semibold text-[#1F2B46]">
                  4. Hospital Portal Access &amp; Staff Onboarding
                </h3>
                <p className="font-supporting text-supporting text-[#5A6372] mt-0.5">
                  The administrator creates their secure password, activates the first Hospital Admin account, and can then invite physicians, nurses, and desk staff.
                </p>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#0055A4] hover:bg-[#00478a] active:bg-[#003b73] text-white font-button-label text-button-label shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              <span>Return to Hospital Portal Sign In</span>
            </Link>

            <a
              href="mailto:compliance@medknot.health"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F3F6F0] hover:bg-[#E2E8DE] border border-[#DDE6DA] text-[#1F2B46] font-button-label text-button-label transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-[#0055A4]">mail</span>
              <span>Contact Compliance Desk</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#DDE6DA] bg-[#F3F6F0] py-4 text-center text-xs text-[#5A6372]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MedKnot Health Informatics Inc. • Dedicated Clinical Institutional Onboarding</span>
          <span className="text-[#0055A4] font-semibold">Toll Free: 1800-419-KNOT</span>
        </div>
      </footer>
    </div>
  );
}

export default function RegistrationPendingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EDF2E9]" />}>
      <RegistrationPendingContent />
    </Suspense>
  );
}
