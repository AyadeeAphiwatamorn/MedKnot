"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RegistrationLayout from "@/components/registration/RegistrationLayout";
import { useRegistration, type RegistrationState } from "@/components/registration/RegistrationContext";

interface DocSlotConfig {
  key: keyof RegistrationState["documents"];
  title: string;
  description: string;
  required: boolean;
  tag: string;
  badgeClass: string;
}

export default function Step3DocumentsPage() {
  const router = useRouter();
  const { state, uploadDocument, removeDocument, saveDraft } = useRegistration();

  const [docErrors, setDocErrors] = useState<{ [key: string]: string }>({});
  const [activeDragKey, setActiveDragKey] = useState<string | null>(null);

  const documentConfigs: DocSlotConfig[] = [
    {
      key: "registrationCert",
      title: "Facility Registration Certificate",
      description: "State Health Department, Ministry of Health, or Municipal Corporation operating charter.",
      required: true,
      tag: "Required",
      badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed",
    },
    {
      key: "authorizationLetter",
      title: "Board Authorization Letter",
      description: "Signed executive resolution authorizing integration with the MedKnot Connected Care network.",
      required: true,
      tag: "Required",
      badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed",
    },
    {
      key: "accreditationDoc",
      title: "NABH / JCI / ISO Accreditation",
      description: "Clinical quality certification. Elevates hospital network ranking and priority referral routing.",
      required: false,
      tag: "Optional",
      badgeClass: "bg-[#E2E8DE] text-[#727783]",
    },
    {
      key: "taxExemptionDoc",
      title: "Clinical Charter or Tax Documentation",
      description: "Supplementary institutional documents (Trust deed, 80G certificate, or GST registration).",
      required: false,
      tag: "Optional",
      badgeClass: "bg-[#E2E8DE] text-[#727783]",
    },
  ];

  const handleFileChange = (
    key: keyof RegistrationState["documents"],
    file: File | null
  ) => {
    if (!file) return;

    // Validate type: PDF, PNG, JPG
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setDocErrors((prev) => ({
        ...prev,
        [key]: "Invalid format. Only PDF, PNG, and JPG files are supported.",
      }));
      return;
    }

    // Validate size: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setDocErrors((prev) => ({
        ...prev,
        [key]: "File size exceeds 10MB limit.",
      }));
      return;
    }

    setDocErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    uploadDocument(key, file);
  };

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (state.documents.registrationCert.status !== "uploaded") {
      errors.registrationCert = "Please upload the official Facility Registration Certificate.";
    }
    if (state.documents.authorizationLetter.status !== "uploaded") {
      errors.authorizationLetter = "Please upload the Board Authorization Letter.";
    }

    setDocErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      saveDraft();
      router.push("/register-hospital/review");
    }
  };

  return (
    <RegistrationLayout
      currentStep={3}
      title="Documents & Verification"
      subtitle="Attach official digital scans of legal licensing, board resolutions, and clinical accreditations."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-xl">
        <div className="bg-white border border-[#D5DFD2] rounded-2xl p-space-xl shadow-sm flex flex-col gap-space-lg">
          <div className="flex items-start justify-between gap-space-md">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[#0055A4] text-[24px] shrink-0">
                  folder_open
                </span>
                <h2 className="font-headline-sm text-headline-sm text-[#1F2B46] font-bold truncate">
                  Institutional Supporting Documents
                </h2>
              </div>
              <p className="font-supporting text-supporting text-[#5A6372] mt-1">
                Upload clear PDF or image scans. All files are encrypted and processed in compliance with healthcare data regulations.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-supporting text-supporting font-semibold uppercase tracking-wider whitespace-nowrap flex-shrink-0">
              Step 3 of 4
            </span>
          </div>

          {/* Document Upload Slots */}
          <div className="grid grid-cols-1 gap-space-lg">
            {documentConfigs.map((doc) => {
              const currentDoc = state.documents[doc.key];
              const isUploaded = currentDoc.status === "uploaded" && currentDoc.name;
              const hasError = Boolean(docErrors[doc.key]);

              return (
                <div
                  key={doc.key}
                  className={`p-space-lg rounded-2xl border transition-all ${
                    isUploaded
                      ? "bg-[#EDF2E9] border-[#D5DFD2]"
                      : activeDragKey === doc.key
                      ? "border-[#0055A4] bg-[#E4EBE0]"
                      : hasError
                      ? "border-error bg-red-50/20"
                      : "bg-[#EDF2E9]/60 border-[#D5DFD2] hover:border-[#0055A4]"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setActiveDragKey(doc.key);
                  }}
                  onDragLeave={() => setActiveDragKey(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setActiveDragKey(null);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileChange(doc.key, e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                    {/* Left Info */}
                    <div className="flex items-start gap-space-md min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                          isUploaded
                            ? "bg-tertiary-fixed text-tertiary"
                            : "bg-white border border-[#D5DFD2] text-[#0055A4]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px]">
                          {isUploaded ? "task" : "upload_file"}
                        </span>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate">
                            {doc.title}
                          </h3>
                          {doc.required && <span className="text-error font-bold">*</span>}
                          <span
                            className={`px-2 py-0.5 rounded-full font-supporting text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${doc.badgeClass}`}
                          >
                            {doc.tag}
                          </span>
                        </div>
                        <p className="font-supporting text-supporting text-[#5A6372] mt-0.5">
                          {doc.description}
                        </p>

                        {/* Upload Status / Filename Details */}
                        {isUploaded ? (
                          <div className="mt-2 flex items-center gap-3 text-xs flex-wrap">
                            <span className="font-semibold text-[#1F2B46] truncate max-w-xs sm:max-w-md">
                              📄 {currentDoc.name}
                            </span>
                            <span className="text-[#5A6372]">
                              ({(currentDoc.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                            <span className="text-tertiary font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              {currentDoc.uploadedAt}
                            </span>
                          </div>
                        ) : (
                          <span className="mt-1 font-supporting text-supporting text-[#727783]">
                            Accepts PDF, PNG, JPG (Maximum 10MB)
                          </span>
                        )}

                        {hasError && (
                          <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {docErrors[doc.key]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-space-sm shrink-0 self-start md:self-center">
                      <input
                        id={`file-${doc.key}`}
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileChange(doc.key, e.target.files[0]);
                          }
                        }}
                      />

                      {isUploaded ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById(`file-${doc.key}`) as HTMLInputElement;
                              el?.click();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white border border-[#D5DFD2] text-[#0055A4] font-button-label text-supporting font-semibold hover:bg-[#E4EBE0] transition-colors cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDocument(doc.key)}
                            className="p-1.5 rounded-lg text-error hover:bg-error-container transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById(`file-${doc.key}`) as HTMLInputElement;
                            el?.click();
                          }}
                          className="px-4 py-2 rounded-xl bg-white border border-[#D5DFD2] hover:border-[#0055A4] hover:bg-[#EDF2E9] text-[#0055A4] font-button-label text-supporting font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          <span>Upload File</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compliance & SLA Disclosure Banner */}
          <div className="bg-[#EBF3FC] border border-[#D5DFD2] rounded-xl p-space-md flex items-start gap-space-md mt-2">
            <span className="material-symbols-outlined text-[#0055A4] text-[22px] shrink-0 mt-0.5">
              security
            </span>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-card-heading text-card-heading text-[#0055A4] font-bold truncate">
                Manual Institutional Compliance Verification
              </span>
              <p className="font-supporting text-supporting text-[#1F2B46] leading-relaxed">
                Documents are not verified automatically. The MedKnot Central Institutional Desk evaluates regulatory standing, cross-checks state medical registries, and completes telephone authorization vetting within 24–48 business hours prior to issuing an account invitation.
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Action Row */}
        <div className="bg-white border border-[#D5DFD2] rounded-2xl p-space-md shadow-sm flex flex-wrap items-center justify-between gap-space-md">
          <Link
            href="/register-hospital/administrator"
            className="px-space-lg py-2.5 rounded-xl bg-[#EDF2E9] hover:bg-[#E4EBE0] border border-[#D5DFD2] text-[#1F2B46] font-button-label text-button-label transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">arrow_back</span>
            <span className="whitespace-nowrap">Back to Contact &amp; Administrator</span>
          </Link>

          <div className="flex items-center gap-space-md shrink-0">
            <button
              onClick={() => saveDraft()}
              type="button"
              className="px-space-lg py-2.5 rounded-xl bg-[#EDF2E9] hover:bg-[#E4EBE0] border border-[#D5DFD2] text-[#0055A4] font-button-label text-button-label transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="px-space-xl py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#00478a] text-white font-button-label text-button-label shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-98 shrink-0 whitespace-nowrap"
            >
              <span>Continue to Review &amp; Submit</span>
              <span className="material-symbols-outlined text-[20px] shrink-0">arrow_forward</span>
            </button>
          </div>
        </div>
      </form>
    </RegistrationLayout>
  );
}
