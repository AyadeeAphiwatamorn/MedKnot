"use client";

import React from "react";

export default function RegistrationSidebar() {
  return (
    <div className="lg:col-span-4 flex flex-col gap-space-lg min-w-0">
      {/* ── Card 1: Verification Checklist ─────────────────────────── */}
      <div className="bg-white border border-[#D5DFD2] rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between gap-space-sm">
          <span className="font-card-heading text-card-heading text-[#1F2B46] font-bold truncate">
            Verification Checklist
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-supporting text-supporting font-semibold uppercase tracking-wider whitespace-nowrap flex-shrink-0">
            STAGE 1
          </span>
        </div>
        <p className="font-supporting text-supporting text-[#5A6372]">
          Prepare digital scans of these institutional credentials. You will submit them in Step 3.
        </p>

        <div className="flex flex-col gap-space-sm pt-space-xs">
          {/* Item 1 */}
          <div className="p-space-md rounded-xl bg-[#EDF2E9] border border-[#D5DFD2] flex items-start gap-space-sm">
            <div className="w-6 h-6 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-body-md text-body-md text-[#1F2B46] font-semibold truncate">
                  Facility Registration Cert
                </span>
                <span className="text-error text-[12px] font-bold">*</span>
              </div>
              <span className="font-supporting text-supporting text-[#5A6372]">
                State Health Department / Ministry License
              </span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="p-space-md rounded-xl bg-[#EDF2E9] border border-[#D5DFD2] flex items-start gap-space-sm">
            <div className="w-6 h-6 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-body-md text-body-md text-[#1F2B46] font-semibold truncate">
                  Board Authorization Letter
                </span>
                <span className="text-error text-[12px] font-bold">*</span>
              </div>
              <span className="font-supporting text-supporting text-[#5A6372]">
                Signed institutional resolution for MedKnot
              </span>
            </div>
          </div>

          {/* Item 3 */}
          <div className="p-space-md rounded-xl bg-[#EDF2E9] border border-[#D5DFD2] flex items-start gap-space-sm opacity-90">
            <div className="w-6 h-6 rounded-full bg-[#D5DFD2] text-[#727783] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-body-md text-body-md text-[#1F2B46] font-semibold truncate">
                  NABH / JCI Accreditation
                </span>
                <span className="font-supporting text-supporting text-[#727783] whitespace-nowrap">
                  (Optional)
                </span>
              </div>
              <span className="font-supporting text-supporting text-[#5A6372]">
                Elevates facility tier &amp; instant referral badge
              </span>
            </div>
          </div>
        </div>

        {/* SLA Note */}
        <div className="p-space-md rounded-xl bg-[#EDF2E9] border border-[#D5DFD2] text-[#1F2B46] font-supporting text-supporting flex items-start gap-2">
          <span className="material-symbols-outlined text-[#0055A4] text-[18px] shrink-0 mt-0.5">
            speed
          </span>
          <span>
            Identity vetting SLA: <strong>24–48 business hours</strong> upon document delivery.
          </span>
        </div>
      </div>

      {/* ── Card 2: Initial Admin Policy ────────────────────────────── */}
      <div className="bg-[#EBF3FC] border border-[#D5DFD2] rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-[#0055A4] text-[22px] shrink-0">
            admin_panel_settings
          </span>
          <span className="font-card-heading text-card-heading text-[#0055A4] font-bold truncate">
            First Hospital Admin Policy
          </span>
        </div>
        <p className="font-supporting text-supporting text-[#1F2B46] leading-relaxed">
          The designated Authorized Administrator will become the organization’s first <strong>Hospital Admin</strong>. Upon verification approval, an activation invitation will be dispatched to their verified institutional email to set up portal credentials.
        </p>
      </div>

      {/* ── Card 3: Why Register with MedKnot? ──────────────────────── */}
      <div className="bg-white border border-[#D5DFD2] rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-secondary text-[24px] shrink-0">
            verified
          </span>
          <span className="font-card-heading text-card-heading text-[#1F2B46] font-bold truncate">
            Why Register with MedKnot?
          </span>
        </div>

        <div className="flex flex-col gap-space-md">
          <div className="flex items-start gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-[#0055A4] shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">hub</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-body-md text-body-md text-[#1F2B46] font-semibold truncate">
                Federated EHR Network
              </span>
              <span className="font-supporting text-supporting text-[#5A6372]">
                Direct access to cross-institutional patient history and records.
              </span>
            </div>
          </div>

          <div className="w-full h-px bg-[#D5DFD2]"></div>

          <div className="flex items-start gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">dynamic_form</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-body-md text-body-md text-[#1F2B46] font-semibold truncate">
                Live Queue Optimization
              </span>
              <span className="font-supporting text-supporting text-[#5A6372]">
                Automated OPD tokens, triage routing, and bed allocations.
              </span>
            </div>
          </div>

          <div className="w-full h-px bg-[#D5DFD2]"></div>

          <div className="flex items-start gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">security</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-body-md text-body-md text-[#1F2B46] font-semibold truncate">
                HIPAA &amp; ABDM Compliant
              </span>
              <span className="font-supporting text-supporting text-[#5A6372]">
                End-to-end encrypted medical transmissions and audits.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card 4: Need Registration Assistance? ──────────────────── */}
      <div className="rounded-2xl p-space-lg bg-[#EDF2E9] border border-[#D5DFD2] shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-[#0055A4] text-[20px] shrink-0">
            support_agent
          </span>
          <span className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate">
            Need Registration Assistance?
          </span>
        </div>
        <p className="font-supporting text-supporting text-[#5A6372]">
          Connect directly with our dedicated Clinical Institutional Onboarding Desk for rapid authorization support.
        </p>
        <div className="pt-space-xs flex flex-wrap items-center justify-between gap-space-sm">
          <a
            href="mailto:compliance@medknot.health"
            className="font-supporting text-supporting text-[#0055A4] font-bold hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span className="whitespace-nowrap">compliance@medknot.health</span>
            <span className="material-symbols-outlined text-[14px] shrink-0">north_east</span>
          </a>
          <span className="font-supporting text-supporting text-secondary font-semibold whitespace-nowrap shrink-0">
            Toll Free: 1800-419-KNOT
          </span>
        </div>
      </div>
    </div>
  );
}
