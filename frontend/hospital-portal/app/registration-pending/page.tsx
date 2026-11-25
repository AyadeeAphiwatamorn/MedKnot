"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  type HospitalApplicationStatus,
  type AdminAccountStatus,
} from "@/components/registration/RegistrationContext";

function RegistrationPendingContent() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref") || "MK-HOSP-2026-8942";

  // Simulated status lifecycle states (per confirmed business rules)
  const [appStatus, setAppStatus] = useState<HospitalApplicationStatus>("Submitted");
  const [adminStatus, setAdminStatus] = useState<AdminAccountStatus>("Invitation Pending");

  // Status badge styling helpers
  const getAppStatusBadge = (status: HospitalApplicationStatus) => {
    switch (status) {
      case "Draft":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "Submitted":
        return "bg-blue-50 text-[#0055A4] border-blue-200";
      case "Under Review":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "Approved":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "Rejected":
        return "bg-red-50 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getAdminStatusBadge = (status: AdminAccountStatus) => {
    switch (status) {
      case "Not Created":
        return "bg-slate-100 text-slate-600 border-slate-300";
      case "Invitation Pending":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "Invitation Sent":
        return "bg-indigo-50 text-indigo-800 border-indigo-300";
      case "Active":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-600 border-slate-300";
    }
  };

  return (
    <div className="registration-theme min-h-screen bg-transparent text-[#1F2B46] font-body-md antialiased flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full bg-[#EDF2E9] border-b border-[#D5DFD2] py-4 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#D5DFD2] flex items-center justify-center p-1 shadow-xs">
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

      {/* Main Success & Status Container */}
      <main className="w-full max-w-4xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center">
        <div className="w-full bg-white border border-[#D5DFD2] rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col items-center text-center">
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

          {/* Reference Card with Strict Status Separation */}
          <div className="w-full max-w-2xl p-6 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] mb-8 text-left space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#D5DFD2]">
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
                  Estimated Review Timeframe
                </span>
                <span className="text-sm font-semibold text-[#1F2B46] block mt-1">
                  24–48 Business Hours
                </span>
              </div>
            </div>

            {/* Status Separation Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* 1. Hospital Application Status */}
              <div className="p-4 rounded-xl bg-white border border-[#D5DFD2] flex flex-col gap-1.5">
                <span className="font-supporting text-[11px] text-[#5A6372] uppercase tracking-wider font-semibold">
                  1. Hospital Application Status
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${getAppStatusBadge(
                      appStatus
                    )}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {appStatus}
                  </span>
                </div>
                <p className="text-[11px] text-[#5A6372] mt-1">
                  Institutional vetting by MedKnot central administration.
                </p>
              </div>

              {/* 2. Administrator Account Status */}
              <div className="p-4 rounded-xl bg-white border border-[#D5DFD2] flex flex-col gap-1.5">
                <span className="font-supporting text-[11px] text-[#5A6372] uppercase tracking-wider font-semibold">
                  2. Administrator Account Status
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${getAdminStatusBadge(
                      adminStatus
                    )}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {adminStatus}
                  </span>
                </div>
                <p className="text-[11px] text-[#5A6372] mt-1">
                  Activation invitation sent only after application approval.
                </p>
              </div>
            </div>

            {/* First Hospital Admin Designation Callout */}
            <div className="p-3.5 rounded-xl bg-[#EBF3FC] border border-[#D5DFD2] flex items-start gap-3">
              <span className="material-symbols-outlined text-[#0055A4] text-xl shrink-0 mt-0.5">
                admin_panel_settings
              </span>
              <div className="flex flex-col text-xs leading-relaxed text-[#1F2B46]">
                <span className="font-bold text-[#0055A4]">
                  First Hospital Admin Account Notice
                </span>
                <span>
                  The designated Authorized Administrator will establish the hospital’s primary administrative node. Submitting this registration does <strong>not</strong> grant immediate login access. An activation invitation will be dispatched to their verified institutional email upon approval.
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

            <div className="relative pl-6 space-y-5 border-l-2 border-[#D5DFD2]">
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
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#D5DFD2] ring-4 ring-white" />
                <h3 className="font-card-heading text-body-md font-semibold text-[#1F2B46]">
                  2. Administrator Verification Call
                </h3>
                <p className="font-supporting text-supporting text-[#5A6372] mt-0.5">
                  A compliance officer may contact your official registry desk to confirm authorized delegation of clinical administration.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#D5DFD2] ring-4 ring-white" />
                <h3 className="font-card-heading text-body-md font-semibold text-[#1F2B46]">
                  3. Account Invitation Dispatch
                </h3>
                <p className="font-supporting text-supporting text-[#5A6372] mt-0.5">
                  Once approved, an invitation link will be delivered strictly to the Authorized Administrator’s official institutional work email.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#D5DFD2] ring-4 ring-white" />
                <h3 className="font-card-heading text-body-md font-semibold text-[#1F2B46]">
                  4. Hospital Portal Access &amp; Staff Onboarding
                </h3>
                <p className="font-supporting text-supporting text-[#5A6372] mt-0.5">
                  The administrator creates their secure password, activates the first Hospital Admin account, and can then invite physicians, nurses, and desk staff.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Status Lifecycle Simulator (Frontend Prototype Demonstration) */}
          <div className="w-full max-w-2xl text-left mb-8 p-4 rounded-2xl bg-white border border-[#D5DFD2]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#0055A4]">science</span>
                Demo Simulation: Preview Status Progression
              </span>
              <span className="text-[10px] text-slate-400">Frontend Prototype Mode</span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              In production, status transitions are triggered by the Spring Boot backend when administrators take review actions. Click below to preview each lifecycle state:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setAppStatus("Submitted");
                  setAdminStatus("Invitation Pending");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  appStatus === "Submitted"
                    ? "bg-[#0055A4] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                1. Application Submitted
              </button>
              <button
                type="button"
                onClick={() => {
                  setAppStatus("Under Review");
                  setAdminStatus("Invitation Pending");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  appStatus === "Under Review"
                    ? "bg-[#0055A4] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                2. Under Review
              </button>
              <button
                type="button"
                onClick={() => {
                  setAppStatus("Approved");
                  setAdminStatus("Invitation Sent");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  appStatus === "Approved" && adminStatus === "Invitation Sent"
                    ? "bg-[#0055A4] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                3. Approved &amp; Invitation Dispatched
              </button>
              <button
                type="button"
                onClick={() => {
                  setAppStatus("Approved");
                  setAdminStatus("Active");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  adminStatus === "Active"
                    ? "bg-[#0055A4] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                4. Administrator Activated
              </button>
              <button
                type="button"
                onClick={() => {
                  setAppStatus("Rejected");
                  setAdminStatus("Not Created");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  appStatus === "Rejected"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                5. Rejected
              </button>
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
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#EDF2E9] hover:bg-[#E4EBE0] border border-[#D5DFD2] text-[#1F2B46] font-button-label text-button-label transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-[#0055A4]">mail</span>
              <span>Contact Compliance Desk</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#D5DFD2] bg-[#EDF2E9] py-4 text-center text-xs text-[#5A6372]">
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
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <RegistrationPendingContent />
    </Suspense>
  );
}
