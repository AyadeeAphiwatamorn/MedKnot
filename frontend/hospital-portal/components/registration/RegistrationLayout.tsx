"use client";

import React, { useState } from "react";
import Link from "next/link";
import RegistrationHeader from "@/components/registration/RegistrationHeader";
import RegistrationStepper from "@/components/registration/RegistrationStepper";
import RegistrationSidebar from "@/components/registration/RegistrationSidebar";
import { useRegistration } from "@/components/registration/RegistrationContext";

interface RegistrationLayoutProps {
  currentStep: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function RegistrationLayout({
  currentStep,
  title,
  subtitle,
  children,
}: RegistrationLayoutProps) {
  const { state, saveDraft } = useRegistration();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveDraft = () => {
    const time = saveDraft();
    setToastMessage(`Registration draft saved at ${time}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#EDF2E9] text-[#1F2B46] font-body-md antialiased flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#1F2B46] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-[#D4EC9B] text-xl shrink-0">
            check_circle
          </span>
          <span className="font-card-heading text-body-md font-medium">
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/70 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {/* Public Registration Header */}
      <RegistrationHeader />

      {/* Main Container */}
      <main className="w-full flex-1 max-w-[1600px] mx-auto px-6 lg:px-8 py-space-lg">
        {/* Breadcrumb Bar */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-space-xs text-[#5A6372] font-supporting text-supporting mb-3"
        >
          <Link
            href="/login"
            className="hover:text-[#0055A4] transition-colors flex items-center gap-1 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Hospital Portal</span>
          </Link>
          <span className="material-symbols-outlined text-[14px] text-[#727783] shrink-0">
            chevron_right
          </span>
          <Link
            href="/register-hospital/facility"
            className="hover:text-[#0055A4] transition-colors"
          >
            Hospital Registration
          </Link>
          <span className="material-symbols-outlined text-[14px] text-[#727783] shrink-0">
            chevron_right
          </span>
          <span className="text-[#0055A4] font-semibold whitespace-nowrap">
            Step {currentStep} of 4
          </span>
        </nav>

        {/* Header Title & Status Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-space-md flex-wrap">
              <h1 className="font-headline-lg text-headline-lg text-[#0055A4] tracking-tight font-bold">
                {title}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-supporting text-supporting font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                New Hospital Registration
              </span>
            </div>
            <p className="font-body-md text-body-md text-[#5A6372] max-w-3xl">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0">
            <span className="font-supporting text-supporting text-[#727783] whitespace-nowrap">
              Autosaved at {state.lastSavedTime}
            </span>
            <button
              onClick={handleSaveDraft}
              className="px-space-md py-1.5 rounded-lg bg-white border border-[#DDE6DA] hover:bg-[#F3F6F0] text-[#1F2B46] font-button-label text-button-label transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              type="button"
              title="Save Draft"
            >
              <span className="material-symbols-outlined text-[18px] text-[#0055A4] shrink-0">
                save
              </span>
              <span className="whitespace-nowrap">Draft</span>
            </button>
          </div>
        </div>

        {/* Stepper Progress Indicator */}
        <RegistrationStepper currentStep={currentStep} />

        {/* Two-Column Registration Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-xl min-w-0">
            {children}
          </div>
          <RegistrationSidebar />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#DDE6DA] bg-[#F3F6F0] py-6 mt-12 text-center text-xs text-[#5A6372]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 MedKnot Health Informatics Inc. All clinical rights reserved. Protected under Federal &amp; ABDM Safeguards.</span>
          <div className="flex items-center gap-4 text-[#0055A4] font-medium">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:underline">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:underline">Security Standards</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
