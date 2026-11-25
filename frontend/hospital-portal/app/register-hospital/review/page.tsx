"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RegistrationLayout from "@/components/registration/RegistrationLayout";
import { useRegistration } from "@/components/registration/RegistrationContext";

export default function Step4ReviewPage() {
  const router = useRouter();
  const { state, updateContactAndAdmin, submitRegistration } = useRegistration();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [agreementError, setAgreementError] = useState<string | null>(null);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    updateContactAndAdmin({ [name]: checked });
    if (agreementError) {
      setAgreementError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.declarationAgreed || !state.termsAgreed) {
      setAgreementError("Please accept both the institutional declaration and MedKnot terms to proceed.");
      return;
    }

    setIsSubmitting(true);
    // Simulate brief network submission
    setTimeout(() => {
      submitRegistration();
      router.push("/registration-pending");
    }, 1200);
  };

  return (
    <RegistrationLayout
      currentStep={4}
      title="Review & Submit Application"
      subtitle="Review all institutional details and declarations before submitting your hospital application for review."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-xl">
        {/* Main Review Card */}
        <div className="bg-white border border-[#D5DFD2] rounded-2xl p-space-xl shadow-sm flex flex-col gap-space-xl">
          <div className="flex items-start justify-between gap-space-md">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[#0055A4] text-[24px] shrink-0">
                  fact_check
                </span>
                <h2 className="font-headline-sm text-headline-sm text-[#1F2B46] font-bold truncate">
                  Application Summary
                </h2>
              </div>
              <p className="font-supporting text-supporting text-[#5A6372] mt-1">
                Carefully verify each section. You may return to any previous step to update information.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-supporting text-supporting font-semibold uppercase tracking-wider whitespace-nowrap flex-shrink-0">
              Final Step
            </span>
          </div>

          {/* Section 1: Facility Information Summary */}
          <div className="p-space-lg rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-[#D5DFD2] pb-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055A4] text-[20px]">domain</span>
                <h3 className="font-card-heading text-card-heading text-[#1F2B46] font-bold">
                  1. Facility Information
                </h3>
              </div>
              <Link
                href="/register-hospital/facility"
                className="text-xs font-semibold text-[#0055A4] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Edit</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md text-sm">
              <div>
                <span className="text-[#5A6372] block text-xs">Official Facility Name</span>
                <span className="font-semibold text-[#1F2B46]">{state.facilityName}</span>
              </div>
              <div>
                <span className="text-[#5A6372] block text-xs">Facility Type</span>
                <span className="font-semibold text-[#1F2B46]">{state.facilityType}</span>
              </div>
              <div>
                <span className="text-[#5A6372] block text-xs">Registration / License Number</span>
                <span className="font-semibold font-mono text-[#1F2B46]">{state.registrationNumber}</span>
              </div>
              <div>
                <span className="text-[#5A6372] block text-xs">Year Established</span>
                <span className="font-semibold text-[#1F2B46]">{state.yearEstablished}</span>
              </div>
              {state.website && (
                <div className="md:col-span-2">
                  <span className="text-[#5A6372] block text-xs">Official Website</span>
                  <a
                    href={state.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#0055A4] hover:underline"
                  >
                    {state.website}
                  </a>
                </div>
              )}
              {state.logoPreview && (
                <div className="md:col-span-2 flex items-center gap-3 pt-1">
                  <div className="w-12 h-12 rounded-lg bg-white border border-[#D5DFD2] p-1 flex items-center justify-center shrink-0">
                    <Image
                      src={state.logoPreview}
                      alt="Logo"
                      width={40}
                      height={40}
                      className="object-contain w-full h-full"
                      unoptimized
                    />
                  </div>
                  <span className="text-xs text-[#5A6372]">Official emblem attached</span>
                </div>
              )}
              <div className="md:col-span-2">
                <span className="text-[#5A6372] block text-xs">Overview &amp; Infrastructure</span>
                <p className="text-xs text-[#1F2B46] mt-0.5 leading-relaxed bg-white/70 p-3 rounded-lg border border-[#D5DFD2]">
                  {state.overview}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details Summary */}
          <div className="p-space-lg rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-[#D5DFD2] pb-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055A4] text-[20px]">location_on</span>
                <h3 className="font-card-heading text-card-heading text-[#1F2B46] font-bold">
                  2. Location &amp; Dispatch Details
                </h3>
              </div>
              <Link
                href="/register-hospital/administrator"
                className="text-xs font-semibold text-[#0055A4] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Edit</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md text-sm">
              <div className="md:col-span-2">
                <span className="text-[#5A6372] block text-xs">Complete Street Address</span>
                <span className="font-semibold text-[#1F2B46]">
                  {state.streetAddress}, {state.city}, {state.state} - {state.pincode}, {state.country}
                </span>
              </div>
              <div>
                <span className="text-[#5A6372] block text-xs">Official Contact Desk Phone</span>
                <span className="font-semibold text-[#1F2B46]">{state.contactDesk}</span>
              </div>
              <div>
                <span className="text-[#5A6372] block text-xs">Official Registry Email</span>
                <span className="font-semibold text-[#1F2B46]">{state.registryEmail}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Authorized Administrator (First Hospital Admin) */}
          <div className="p-space-lg rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-[#D5DFD2] pb-space-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="material-symbols-outlined text-[#0055A4] text-[20px]">verified_user</span>
                <h3 className="font-card-heading text-card-heading text-[#1F2B46] font-bold">
                  3. Authorized Administrator
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#EBF3FC] text-[#0055A4] text-[10px] font-bold uppercase tracking-wider">
                  Initial Hospital Admin Role
                </span>
              </div>
              <Link
                href="/register-hospital/administrator"
                className="text-xs font-semibold text-[#0055A4] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Edit</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md text-sm">
              <div>
                <span className="text-[#5A6372] block text-xs">Full Legal Name</span>
                <span className="font-semibold text-[#1F2B46]">{state.adminName}</span>
              </div>
              <div>
                <span className="text-[#5A6372] block text-xs">Institutional Designation</span>
                <span className="font-semibold text-[#1F2B46]">{state.adminDesignation}</span>
              </div>
              <div>
                <span className="text-[#5A6372] block text-xs">Official Work Email (Activation Target)</span>
                <span className="font-semibold text-[#0055A4]">{state.adminEmail}</span>
              </div>
              <div>
                <span className="text-[#5A6372] block text-xs">Direct Mobile / Contact</span>
                <span className="font-semibold text-[#1F2B46]">{state.adminPhone}</span>
              </div>

              {state.isApplicantDifferent && (
                <div className="md:col-span-2 pt-2 border-t border-[#D5DFD2] text-xs">
                  <span className="text-[#5A6372] block font-semibold">Submitted by Authorized Representative:</span>
                  <span className="text-[#1F2B46]">
                    {state.applicantName} ({state.applicantEmail} {state.applicantPhone ? `• ${state.applicantPhone}` : ""})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Uploaded Documents Summary */}
          <div className="p-space-lg rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-[#D5DFD2] pb-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055A4] text-[20px]">folder_open</span>
                <h3 className="font-card-heading text-card-heading text-[#1F2B46] font-bold">
                  4. Uploaded Institutional Documents
                </h3>
              </div>
              <Link
                href="/register-hospital/documents"
                className="text-xs font-semibold text-[#0055A4] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Edit</span>
              </Link>
            </div>

            <div className="space-y-2">
              {Object.entries(state.documents).map(([key, doc]) => {
                if (doc.status !== "uploaded" || !doc.name) return null;
                const titles: { [k: string]: string } = {
                  registrationCert: "Facility Registration Certificate",
                  authorizationLetter: "Board Authorization Letter",
                  accreditationDoc: "NABH / JCI Accreditation",
                  taxExemptionDoc: "Supplementary Charter / Tax Doc",
                };
                return (
                  <div
                    key={key}
                    className="p-3 bg-white rounded-xl border border-[#D5DFD2] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[#0055A4] text-[18px] shrink-0">description</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-[#1F2B46] truncate">{titles[key]}</span>
                        <span className="text-[#5A6372] truncate">{doc.name}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-semibold shrink-0">
                      Attached
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Declarations & Agreements Checkboxes */}
          <div className="p-space-lg rounded-2xl bg-[#EBF3FC] border border-[#D5DFD2] flex flex-col gap-space-md">
            <h3 className="font-card-heading text-card-heading text-[#0055A4] font-bold">
              Institutional Declarations &amp; Legal Undertaking
            </h3>

            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-space-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="declarationAgreed"
                  checked={state.declarationAgreed}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 mt-0.5 text-[#0055A4] rounded border-[#D5DFD2] focus:ring-[#0055A4] cursor-pointer"
                />
                <span className="text-xs text-[#1F2B46] leading-relaxed">
                  I solemnly declare that all institutional credentials, registration numbers, and administrative designations provided are true and certified by our governing board. I understand that submitting false or misleading information will result in immediate termination of onboarding.
                </span>
              </label>

              <label className="flex items-start gap-space-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="termsAgreed"
                  checked={state.termsAgreed}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 mt-0.5 text-[#0055A4] rounded border-[#D5DFD2] focus:ring-[#0055A4] cursor-pointer"
                />
                <span className="text-xs text-[#1F2B46] leading-relaxed">
                  I agree to the <a href="#" className="font-semibold text-[#0055A4] underline">MedKnot Connected Care Service Terms</a>, <a href="#" className="font-semibold text-[#0055A4] underline">Data Processing Addendum</a>, and compliance protocols governing ABDM, HIPAA, and end-to-end medical records encryption.
                </span>
              </label>
            </div>

            {agreementError && (
              <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {agreementError}
              </span>
            )}
          </div>
        </div>

        {/* Sticky Action Row */}
        <div className="bg-white border border-[#D5DFD2] rounded-2xl p-space-md shadow-sm flex flex-wrap items-center justify-between gap-space-md">
          <Link
            href="/register-hospital/documents"
            className="px-space-lg py-2.5 rounded-xl bg-[#EDF2E9] hover:bg-[#E4EBE0] border border-[#D5DFD2] text-[#1F2B46] font-button-label text-button-label transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">arrow_back</span>
            <span className="whitespace-nowrap">Back to Documents</span>
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-space-2xl py-3 rounded-xl bg-[#0055A4] hover:bg-[#00478a] active:bg-[#003b73] text-white font-button-label text-button-label shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shrink-0 whitespace-nowrap"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Submitting Registration Application…</span>
              </>
            ) : (
              <>
                <span>Submit Hospital Registration</span>
                <span className="material-symbols-outlined text-[20px] shrink-0">check_circle</span>
              </>
            )}
          </button>
        </div>
      </form>
    </RegistrationLayout>
  );
}
