"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type UserSession, DEFAULT_ADMIN, clearClientSession, getClientSession } from "@/lib/auth";

interface FacilityOverviewViewProps {
  initialUser?: UserSession;
}

export interface FacilityData {
  // Facility Information
  officialName: string;
  facilityType: string;
  registrationNumber: string;
  yearEstablished: string;
  website: string;
  overview: string;
  bedCapacity: string;
  icuUnits: string;
  modularOTs: string;
  traumaLevel: string;

  // Location & Contact Details
  country: string;
  state: string;
  city: string;
  pincode: string;
  streetAddress: string;
  contactDesk: string;
  registryEmail: string;
  emergencyHotline: string;

  // Facility Administration
  authorizedAdminName: string;
  authorizedAdminDesignation: string;
  authorizedAdminEmail: string;
  authorizedAdminPhone: string;
  accountStatus: "Active" | "Maintenance" | "Suspended";
  approvalStatus: "Approved & Certified" | "Pending Review" | "Under Audit";
  registrationRefNumber: string;
  approvalDate: string;
  centralVerifier: string;

  // Verification Documents
  registrationCertificate: {
    fileName: string;
    fileSize: string;
    status: "Verified & Active" | "Pending" | "Expired";
    expiryDate: string;
    issuingAuthority: string;
  };
  boardAuthorizationLetter: {
    fileName: string;
    fileSize: string;
    status: "Verified on File" | "Pending";
    signatory: string;
    dateSigned: string;
  };
  accreditation: {
    accreditationBody: string;
    tier: string;
    licenseCode: string;
    validThru: string;
    status: "Active & Certified" | "Pending";
  };
}

const INITIAL_FACILITY_DATA: FacilityData = {
  officialName: "St. Jude Specialty Hospital & Research Centre",
  facilityType: "Multispecialty Tertiary Hospital & Research Institute",
  registrationNumber: "REG-MH-2024-91024",
  yearEstablished: "2014",
  website: "https://www.stjude-health.org",
  overview:
    "St. Jude Medical Center Campus North is a 350-bed tertiary multispecialty facility equipped with 14 laminar modular OTs, 60 ICU units, and Level-1 Trauma Emergency care, integrated with automated digital diagnostics.",
  bedCapacity: "350 Beds",
  icuUnits: "60 Units",
  modularOTs: "14 Modular OTs",
  traumaLevel: "Level-1 Trauma Center",

  country: "India",
  state: "Maharashtra",
  city: "Mumbai",
  pincode: "400050",
  streetAddress: "Plot 18, Medical Knowledge Park, Western Express Highway, Bandra East",
  contactDesk: "+91 22 2840 9100",
  registryEmail: "registrations@stjude-health.org",
  emergencyHotline: "+91 22 2840 9999",

  authorizedAdminName: "Dr. Michael Lee",
  authorizedAdminDesignation: "Chief Medical Director / Head of Administration",
  authorizedAdminEmail: "m.lee@stjude-health.org",
  authorizedAdminPhone: "+91 98201 44882",
  accountStatus: "Active",
  approvalStatus: "Approved & Certified",
  registrationRefNumber: "MK-REG-2024-91024-APP",
  approvalDate: "October 14, 2024",
  centralVerifier: "MedKnot Central Governance & Onboarding Desk",

  registrationCertificate: {
    fileName: "REG-MH-2024-91024-CERT.pdf",
    fileSize: "2.4 MB",
    status: "Verified & Active",
    expiryDate: "November 2029",
    issuingAuthority: "State Health Department / Directorate of Health Services, Maharashtra",
  },
  boardAuthorizationLetter: {
    fileName: "BOARD-AUTH-STJUDE-2024.pdf",
    fileSize: "1.1 MB",
    status: "Verified on File",
    signatory: "Governing Council & Institutional Board of Trustees",
    dateSigned: "September 28, 2024",
  },
  accreditation: {
    accreditationBody: "NABH / JCI Joint Accreditation",
    tier: "Tier 1 Hospital Excellence (Grade A+)",
    licenseCode: "NABH-MH-HOSP-2022-8871",
    validThru: "December 31, 2027",
    status: "Active & Certified",
  },
};

export default function FacilityOverviewView({ initialUser }: FacilityOverviewViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  // Verify client session
  useEffect(() => {
    if (!initialUser && !getClientSession()) {
      router.push("/login");
    }
  }, [initialUser, router]);

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // Facility Data state
  const [facilityData, setFacilityData] = useState<FacilityData>(INITIAL_FACILITY_DATA);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    website: facilityData.website,
    overview: facilityData.overview,
    contactDesk: facilityData.contactDesk,
    registryEmail: facilityData.registryEmail,
    emergencyHotline: facilityData.emergencyHotline,
    streetAddress: facilityData.streetAddress,
    city: facilityData.city,
    pincode: facilityData.pincode,
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Legal Re-Verification Request Modal State
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalRequestReason, setLegalRequestReason] = useState("");
  const [legalRequestType, setLegalRequestType] = useState("Legal Name Amendment");
  const [legalRequestDocNote, setLegalRequestDocNote] = useState("");

  // Document Viewer Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    fileName: string;
    fileSize: string;
    issuingAuthority: string;
    validity: string;
  } | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle Edit Modal open with fresh data
  const handleOpenEditModal = () => {
    setEditFormData({
      website: facilityData.website,
      overview: facilityData.overview,
      contactDesk: facilityData.contactDesk,
      registryEmail: facilityData.registryEmail,
      emergencyHotline: facilityData.emergencyHotline,
      streetAddress: facilityData.streetAddress,
      city: facilityData.city,
      pincode: facilityData.pincode,
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  // Validate and Save Edit Form
  const handleSaveFacilityEdits = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!editFormData.website.trim()) {
      errors.website = "Website URL is required";
    } else if (!/^https?:\/\/.+\..+/i.test(editFormData.website.trim())) {
      errors.website = "Enter a valid website URL (starting with http:// or https://)";
    }

    if (!editFormData.overview.trim()) {
      errors.overview = "Facility overview description cannot be empty";
    } else if (editFormData.overview.length < 30) {
      errors.overview = "Overview must be at least 30 characters";
    }

    if (!editFormData.contactDesk.trim()) {
      errors.contactDesk = "Official contact desk number is required";
    }

    if (!editFormData.registryEmail.trim()) {
      errors.registryEmail = "Registry email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.registryEmail.trim())) {
      errors.registryEmail = "Enter a valid email address";
    }

    if (!editFormData.streetAddress.trim()) {
      errors.streetAddress = "Street address is required";
    }

    if (!editFormData.city.trim()) {
      errors.city = "City is required";
    }

    if (!editFormData.pincode.trim()) {
      errors.pincode = "Postal / PIN code is required";
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    // Update state
    setFacilityData((prev) => ({
      ...prev,
      website: editFormData.website.trim(),
      overview: editFormData.overview.trim(),
      contactDesk: editFormData.contactDesk.trim(),
      registryEmail: editFormData.registryEmail.trim(),
      emergencyHotline: editFormData.emergencyHotline.trim(),
      streetAddress: editFormData.streetAddress.trim(),
      city: editFormData.city.trim(),
      pincode: editFormData.pincode.trim(),
    }));

    setIsEditModalOpen(false);
    setToastMessage({
      type: "success",
      text: "Facility details updated successfully. (Changes saved in local session).",
    });
  };

  // Handle Legal Re-Verification Request Submit
  const handleSendLegalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalRequestReason.trim()) {
      return;
    }

    setIsLegalModalOpen(false);
    setLegalRequestReason("");
    setLegalRequestDocNote("");
    setToastMessage({
      type: "info",
      text: `Re-verification request for '${legalRequestType}' submitted to MedKnot Governance Desk. Ref #GOV-${Math.floor(
        1000 + Math.random() * 9000
      )}.`,
    });
  };

  return (
    <div className="w-full min-w-0 flex-1 bg-transparent text-[#1F2B46] font-sans antialiased flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="alert"
          className={`fixed top-20 right-6 z-50 px-5 py-3.5 rounded-xl shadow-lg border flex items-center gap-3 transition-all animate-bounce-short ${
            toastMessage.type === "success"
              ? "bg-[#0055A4] text-white border-[#004382]"
              : "bg-[#1F2B46] text-white border-[#3B4863]"
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toastMessage.type === "success" ? "check_circle" : "info"}
          </span>
          <span className="text-sm font-medium">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/80 hover:text-white"
            aria-label="Close notification"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="w-full min-w-0 p-4 md:p-8 flex-1">
        <div className="w-full min-w-0 space-y-6">
          {/* Breadcrumbs & Context Badges */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="flex items-center gap-2 text-xs text-[#5A6372]">
              <Link href="/dashboard" className="hover:text-[#0055A4] flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-sm">home</span>
                <span>Home</span>
              </Link>
              <span>/</span>
              <span className="text-[#5A6372]">Facility Settings</span>
              <span>/</span>
              <span className="text-[#1F2B46] font-semibold">Facility Overview</span>
            </nav>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E3EBDD] text-[#2D382B] border border-[#C8D6C3]">
                <span className="material-symbols-outlined text-xs text-[#0055A4]">hub</span>
                <span>Facility Scope: St. Jude Medical Center (North Campus)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF5E2] text-[#2D6A28] border border-[#C5E4BA]">
                <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
                <span>Active & Approved Facility</span>
              </span>
            </div>
          </div>

          {/* Page Heading & Primary Actions */}
          <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#E3EBDD] border border-[#C8D6C3] p-2 flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/logo.png"
                  alt="St. Jude Emblem"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-[#1F2B46]">
                    {facilityData.officialName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E7F0FF] text-[#0055A4] border border-[#C7DCFF]">
                    Campus North
                  </span>
                </div>
                <p className="text-sm text-[#5A6372]">
                  Approved institutional entity in the MedKnot Connected Care Network • Facility ID:{" "}
                  <span className="font-mono font-medium text-[#1F2B46]">{facilityData.registrationNumber}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsLegalModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C8D6C3] bg-[#E3EBDD] hover:bg-[#D5E0D2] text-[#1F2B46] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-[#5A6372]">lock</span>
                <span>Request Legal Re-Verification</span>
              </button>

              <button
                type="button"
                onClick={handleOpenEditModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#004382] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                <span>Edit Facility Information</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Account & Approval Status */}
            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)] hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)] transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Account Status</span>
                <span className="w-8 h-8 rounded-lg bg-[#EAF5E2] text-[#2D6A28] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-[#1F2B46]">{facilityData.accountStatus}</span>
                  <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
                </div>
                <p className="text-xs text-[#5A6372] mt-1">{facilityData.approvalStatus}</p>
                <p className="text-[11px] font-mono text-[#667085] mt-0.5">Ref: {facilityData.registrationRefNumber}</p>
              </div>
            </div>

            {/* Facility Classification */}
            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)] hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)] transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Infrastructure</span>
                <span className="w-8 h-8 rounded-lg bg-[#E7F0FF] text-[#0055A4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">apartment</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xl font-bold text-[#1F2B46]">{facilityData.bedCapacity}</span>
                <p className="text-xs text-[#5A6372] mt-1">{facilityData.icuUnits} • {facilityData.modularOTs}</p>
                <p className="text-[11px] text-[#0055A4] font-medium mt-0.5">{facilityData.traumaLevel}</p>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)] hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)] transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Accreditation</span>
                <span className="w-8 h-8 rounded-lg bg-[#FFF4E5] text-[#B76E00] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">verified</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xl font-bold text-[#1F2B46]">NABH & JCI</span>
                <p className="text-xs text-[#5A6372] mt-1">Tier 1 Tertiary Excellence</p>
                <p className="text-[11px] text-[#2D6A28] font-medium mt-0.5">Valid thru Dec 2027</p>
              </div>
            </div>

            {/* Authorized Administrator */}
            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)] hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)] transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Authorized Admin</span>
                <span className="w-8 h-8 rounded-lg bg-[#E3EBDD] text-[#1F2B46] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">shield_person</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-lg font-bold text-[#1F2B46] truncate block">{facilityData.authorizedAdminName}</span>
                <p className="text-xs text-[#5A6372] truncate mt-1">{facilityData.authorizedAdminEmail}</p>
                <p className="text-[11px] text-[#667085] mt-0.5">Primary Organization Node</p>
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Facility Information & Location Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section 1: Basic Facility Information */}
              <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-5">
                <div className="flex items-center justify-between border-b border-[#C8D6C3] pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#0055A4] text-xl">domain</span>
                    <div>
                      <h2 className="text-base font-bold text-[#1F2B46]">Facility Information</h2>
                      <p className="text-xs text-[#5A6372]">Official institutional identity and registration parameters</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5E2] text-[#2D6A28] border border-[#C5E4BA] flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    <span>State Registered</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span>Official Hospital / Clinic Name</span>
                      <span className="material-symbols-outlined text-xs text-[#667085]" title="Legal identity locked">
                        lock
                      </span>
                    </label>
                    <div className="p-3 bg-[#E3EBDD] border border-[#C8D6C3] rounded-xl text-sm font-semibold text-[#1F2B46]">
                      {facilityData.officialName}
                    </div>
                    <span className="text-[11px] text-[#667085] mt-1 block">Matches institutional charter</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span>Facility Type</span>
                      <span className="material-symbols-outlined text-xs text-[#667085]" title="Classified by Health Ministry">
                        lock
                      </span>
                    </label>
                    <div className="p-3 bg-[#E3EBDD] border border-[#C8D6C3] rounded-xl text-sm text-[#1F2B46]">
                      {facilityData.facilityType}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span>Facility Registration Number</span>
                      <span className="material-symbols-outlined text-xs text-[#667085]" title="State license number">
                        lock
                      </span>
                    </label>
                    <div className="p-3 bg-[#E3EBDD] border border-[#C8D6C3] rounded-xl text-sm font-mono font-medium text-[#1F2B46]">
                      {facilityData.registrationNumber}
                    </div>
                    <span className="text-[11px] text-[#667085] mt-1 block">State Directorate of Health Services</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span>Year Established</span>
                      <span className="material-symbols-outlined text-xs text-[#667085]">lock</span>
                    </label>
                    <div className="p-3 bg-[#E3EBDD] border border-[#C8D6C3] rounded-xl text-sm text-[#1F2B46]">
                      {facilityData.yearEstablished}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                        Facility Website
                      </label>
                      <span className="text-[11px] font-medium text-[#0055A4] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">edit</span>
                        <span>Editable</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-[#C8D6C3] rounded-xl text-sm hover:border-[#0055A4] transition-colors">
                      <a
                        href={facilityData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0055A4] font-medium hover:underline flex items-center gap-1.5 truncate"
                      >
                        <span className="material-symbols-outlined text-base">language</span>
                        <span className="truncate">{facilityData.website}</span>
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleOpenEditModal}
                        className="text-xs text-[#5A6372] hover:text-[#0055A4] font-semibold"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                        Facility Overview & Clinical Capabilities
                      </label>
                      <span className="text-[11px] font-medium text-[#0055A4] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">edit</span>
                        <span>Editable</span>
                      </span>
                    </div>
                    <div className="p-4 bg-white border border-[#C5D2C0] rounded-xl text-sm text-[#374151] leading-relaxed">
                      {facilityData.overview}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Location & Contact Details */}
              <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-5">
                <div className="flex items-center justify-between border-b border-[#C8D6C3] pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#0055A4] text-xl">location_on</span>
                    <div>
                      <h2 className="text-base font-bold text-[#1F2B46]">Location & Contact Details</h2>
                      <p className="text-xs text-[#5A6372]">Physical facility address and administrative dispatch channels</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="text-xs font-semibold text-[#0055A4] hover:text-[#004382] flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Edit Contacts</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span>Country</span>
                      <span className="material-symbols-outlined text-xs text-[#667085]">lock</span>
                    </label>
                    <div className="p-3 bg-[#E3EBDD] border border-[#C8D6C3] rounded-xl text-sm text-[#1F2B46]">
                      {facilityData.country}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span>State / Province</span>
                      <span className="material-symbols-outlined text-xs text-[#667085]">lock</span>
                    </label>
                    <div className="p-3 bg-[#E3EBDD] border border-[#C8D6C3] rounded-xl text-sm text-[#1F2B46]">
                      {facilityData.state}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider mb-1">
                      City
                    </label>
                    <div className="p-3 bg-white border border-[#C8D6C3] rounded-xl text-sm font-medium text-[#1F2B46]">
                      {facilityData.city}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider mb-1">
                      Postal / PIN Code
                    </label>
                    <div className="p-3 bg-white border border-[#C8D6C3] rounded-xl text-sm font-mono font-medium text-[#1F2B46]">
                      {facilityData.pincode}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider mb-1">
                      Complete Street Address
                    </label>
                    <div className="p-3 bg-white border border-[#C8D6C3] rounded-xl text-sm text-[#1F2B46]">
                      {facilityData.streetAddress}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider mb-1">
                      Official Contact Desk
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-white border border-[#C8D6C3] rounded-xl text-sm font-medium text-[#1F2B46]">
                      <span className="material-symbols-outlined text-[#0055A4] text-base">call</span>
                      <span>{facilityData.contactDesk}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider mb-1">
                      Official Registry Email
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-white border border-[#C8D6C3] rounded-xl text-sm font-medium text-[#1F2B46] truncate">
                      <span className="material-symbols-outlined text-[#0055A4] text-base">mail</span>
                      <span className="truncate">{facilityData.registryEmail}</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#5A6372] uppercase tracking-wider mb-1">
                      Emergency & Trauma Dispatch Desk
                    </label>
                    <div className="flex items-center justify-between p-3 bg-[#FFF5F5] border border-[#FFD6D6] rounded-xl text-sm font-medium text-[#BA1A1A]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">emergency</span>
                        <span>{facilityData.emergencyHotline}</span>
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-[#FFD6D6]">
                        24x7 Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Facility Administration & Verification Documents */}
            <div className="space-y-6">
              {/* Section 3: Facility Administration */}
              <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-4">
                <div className="flex items-center gap-2.5 border-b border-[#C8D6C3] pb-4">
                  <span className="material-symbols-outlined text-[#0055A4] text-xl">admin_panel_settings</span>
                  <div>
                    <h2 className="text-base font-bold text-[#1F2B46]">Facility Administration</h2>
                    <p className="text-xs text-[#5A6372]">Authorized executive leadership & nodal credentials</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="p-3.5 bg-[#E3EBDD] border border-[#C8D6C3] rounded-xl space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0055A4] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        ML
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-[#1F2B46] block truncate">
                          {facilityData.authorizedAdminName}
                        </span>
                        <span className="text-xs text-[#5A6372] block truncate">
                          {facilityData.authorizedAdminDesignation}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#C8D6C3] text-xs space-y-1 text-[#5A6372]">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="material-symbols-outlined text-xs text-[#0055A4]">mail</span>
                        <span className="truncate">{facilityData.authorizedAdminEmail}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs text-[#0055A4]">call</span>
                        <span>{facilityData.authorizedAdminPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-[#C8D6C3]">
                      <span className="text-[#5A6372]">Account Status</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#2D6A28]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
                        {facilityData.accountStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#C8D6C3]">
                      <span className="text-[#5A6372]">Approval Status</span>
                      <span className="font-semibold text-[#0055A4]">{facilityData.approvalStatus}</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#C8D6C3]">
                      <span className="text-[#5A6372]">Registration Reference</span>
                      <span className="font-mono text-[#1F2B46] font-medium">{facilityData.registrationRefNumber}</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-[#C8D6C3]">
                      <span className="text-[#5A6372]">Central Approval Date</span>
                      <span className="text-[#1F2B46] font-medium">{facilityData.approvalDate}</span>
                    </div>

                    <div className="py-1.5">
                      <span className="text-[#5A6372] block mb-1">Central Vetting Authority</span>
                      <span className="text-[11px] text-[#1F2B46] font-medium block bg-[#E3EBDD] p-2 rounded-lg border border-[#C8D6C3]">
                        {facilityData.centralVerifier}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Facility Verification & Documents */}
              <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#C8D6C3] pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#0055A4] text-xl">verified_user</span>
                    <div>
                      <h2 className="text-base font-bold text-[#1F2B46]">Facility Verification</h2>
                      <p className="text-xs text-[#5A6372]">Regulatory licenses and statutory compliance docs</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" title="All documents verified"></span>
                </div>

                <div className="space-y-3">
                  {/* Doc 1: Registration Certificate */}
                  <div className="p-3.5 bg-[#E6EDE2] border border-[#C8D6C3] rounded-xl hover:border-[#0055A4] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-red-600 text-2xl shrink-0 mt-0.5">
                          picture_as_pdf
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-[#1F2B46] block truncate">
                            Registration Certificate
                          </span>
                          <span className="text-[11px] text-[#5A6372] block truncate">
                            {facilityData.registrationCertificate.fileName} ({facilityData.registrationCertificate.fileSize})
                          </span>
                          <span className="text-[11px] text-[#2D6A28] font-medium mt-1 inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            {facilityData.registrationCertificate.status} • Valid thru {facilityData.registrationCertificate.expiryDate}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewDoc({
                            title: "State Health Department Registration Certificate",
                            fileName: facilityData.registrationCertificate.fileName,
                            fileSize: facilityData.registrationCertificate.fileSize,
                            issuingAuthority: facilityData.registrationCertificate.issuingAuthority,
                            validity: facilityData.registrationCertificate.expiryDate,
                          })
                        }
                        className="text-xs text-[#0055A4] hover:underline font-semibold shrink-0 cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>

                  {/* Doc 2: Board Authorization */}
                  <div className="p-3.5 bg-[#E6EDE2] border border-[#C8D6C3] rounded-xl hover:border-[#0055A4] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-red-600 text-2xl shrink-0 mt-0.5">
                          picture_as_pdf
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-[#1F2B46] block truncate">
                            Board Authorization Letter
                          </span>
                          <span className="text-[11px] text-[#5A6372] block truncate">
                            {facilityData.boardAuthorizationLetter.fileName} ({facilityData.boardAuthorizationLetter.fileSize})
                          </span>
                          <span className="text-[11px] text-[#2D6A28] font-medium mt-1 inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            {facilityData.boardAuthorizationLetter.status} • Signed {facilityData.boardAuthorizationLetter.dateSigned}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewDoc({
                            title: "Institutional Board Authorization Letter",
                            fileName: facilityData.boardAuthorizationLetter.fileName,
                            fileSize: facilityData.boardAuthorizationLetter.fileSize,
                            issuingAuthority: facilityData.boardAuthorizationLetter.signatory,
                            validity: "Permanent Institutional Charter",
                          })
                        }
                        className="text-xs text-[#0055A4] hover:underline font-semibold shrink-0 cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>

                  {/* Doc 3: Accreditation */}
                  <div className="p-3.5 bg-[#E6EDE2] border border-[#C8D6C3] rounded-xl hover:border-[#0055A4] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-[#B76E00] text-2xl shrink-0 mt-0.5">
                          workspace_premium
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-[#1F2B46] block truncate">
                            {facilityData.accreditation.accreditationBody}
                          </span>
                          <span className="text-[11px] text-[#5A6372] block truncate">
                            {facilityData.accreditation.tier}
                          </span>
                          <span className="text-[11px] text-[#0055A4] font-medium mt-1 inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                            {facilityData.accreditation.licenseCode} • Thru {facilityData.accreditation.validThru}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewDoc({
                            title: facilityData.accreditation.accreditationBody,
                            fileName: `${facilityData.accreditation.licenseCode}.pdf`,
                            fileSize: "3.8 MB",
                            issuingAuthority: "National Accreditation Board for Hospitals & Healthcare Providers",
                            validity: facilityData.accreditation.validThru,
                          })
                        }
                        className="text-xs text-[#0055A4] hover:underline font-semibold shrink-0 cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3 bg-[#EAF5E2] border border-[#C5E4BA] rounded-xl text-xs text-[#2D6A28] flex items-start gap-2">
                    <span className="material-symbols-outlined text-base shrink-0 mt-0.5">shield</span>
                    <p className="leading-snug">
                      <span className="font-semibold">Vetting SLA Complete:</span> All regulatory documentation has been
                      verified against state medical registries. Institutional node is fully authorized.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 1. EDIT FACILITY INFORMATION MODAL                                        */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#C8D6C3] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#C8D6C3] flex items-center justify-between bg-[#E3EBDD]">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#0055A4]">edit_note</span>
                <div>
                  <h3 className="text-base font-bold text-[#1F2B46]">Edit Facility Information</h3>
                  <p className="text-xs text-[#5A6372]">Update operational contacts, description, and web endpoints</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#5A6372] hover:text-[#1F2B46] p-1 rounded-lg hover:bg-[#D5E0D2] transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveFacilityEdits} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Locked Information Notice */}
              <div className="p-3.5 bg-[#E3EBDD] border border-[#C8D6C3] rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-[#5A6372] text-lg shrink-0 mt-0.5">lock</span>
                <div className="text-xs text-[#5A6372] leading-relaxed">
                  <span className="font-semibold text-[#1F2B46]">Protected Legal Identity:</span> Hospital Legal Name,
                  Registration Number, State, and Country are locked to maintain state healthcare compliance. To alter
                  these, submit a{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsLegalModalOpen(true);
                    }}
                    className="text-[#0055A4] font-semibold underline hover:text-[#004382]"
                  >
                    Legal Re-Verification Request
                  </button>
                  .
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A6372]">Operational Details</h4>

                {/* Facility Website */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Facility Website <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={editFormData.website}
                    onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                      editErrors.website ? "border-red-500" : "border-[#AEBEAA]"
                    }`}
                    placeholder="https://www.yourhospital.org"
                  />
                  {editErrors.website && <p className="text-xs text-red-600 mt-1">{editErrors.website}</p>}
                </div>

                {/* Facility Overview */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Facility Overview & Infrastructure Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={editFormData.overview}
                    onChange={(e) => setEditFormData({ ...editFormData, overview: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                      editErrors.overview ? "border-red-500" : "border-[#AEBEAA]"
                    }`}
                    placeholder="Provide facility summary, beds, specialties..."
                  />
                  <div className="flex justify-between items-center text-[11px] text-[#5A6372] mt-1">
                    <span>{editErrors.overview ? <span className="text-red-600">{editErrors.overview}</span> : "Public directory summary"}</span>
                    <span>{editFormData.overview.length} / 500</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A6372] pt-2">Contact & Dispatch</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Contact Desk */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                      Official Contact Desk <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.contactDesk}
                      onChange={(e) => setEditFormData({ ...editFormData, contactDesk: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                        editErrors.contactDesk ? "border-red-500" : "border-[#AEBEAA]"
                      }`}
                      placeholder="+91 22 2840 9100"
                    />
                    {editErrors.contactDesk && <p className="text-xs text-red-600 mt-1">{editErrors.contactDesk}</p>}
                  </div>

                  {/* Registry Email */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                      Official Registry Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={editFormData.registryEmail}
                      onChange={(e) => setEditFormData({ ...editFormData, registryEmail: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                        editErrors.registryEmail ? "border-red-500" : "border-[#AEBEAA]"
                      }`}
                      placeholder="registrations@hospital.org"
                    />
                    {editErrors.registryEmail && <p className="text-xs text-red-600 mt-1">{editErrors.registryEmail}</p>}
                  </div>

                  {/* Emergency Hotline */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                      Emergency & Trauma Hotline (24x7)
                    </label>
                    <input
                      type="text"
                      value={editFormData.emergencyHotline}
                      onChange={(e) => setEditFormData({ ...editFormData, emergencyHotline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#AEBEAA] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all"
                      placeholder="+91 22 2840 9999"
                    />
                  </div>
                </div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A6372] pt-2">Physical Location</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Street Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.streetAddress}
                      onChange={(e) => setEditFormData({ ...editFormData, streetAddress: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                        editErrors.streetAddress ? "border-red-500" : "border-[#AEBEAA]"
                      }`}
                      placeholder="Plot number, medical park, street..."
                    />
                    {editErrors.streetAddress && <p className="text-xs text-red-600 mt-1">{editErrors.streetAddress}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.city}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                        editErrors.city ? "border-red-500" : "border-[#AEBEAA]"
                      }`}
                      placeholder="Mumbai"
                    />
                    {editErrors.city && <p className="text-xs text-red-600 mt-1">{editErrors.city}</p>}
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                      Postal / PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.pincode}
                      onChange={(e) => setEditFormData({ ...editFormData, pincode: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                        editErrors.pincode ? "border-red-500" : "border-[#AEBEAA]"
                      }`}
                      placeholder="400050"
                    />
                    {editErrors.pincode && <p className="text-xs text-red-600 mt-1">{editErrors.pincode}</p>}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#C8D6C3] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#C8D6C3] text-xs font-semibold text-[#5A6372] hover:bg-[#E6EDE2] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#004382] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Save Facility Information
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REQUEST LEGAL RE-VERIFICATION MODAL                                    */}
      {/* ========================================================================= */}
      {isLegalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#C8D6C3] shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#C8D6C3] flex items-center justify-between bg-[#E3EBDD]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#B76E00]">gavel</span>
                <h3 className="text-base font-bold text-[#1F2B46]">Request Legal Re-Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLegalModalOpen(false)}
                className="text-[#5A6372] hover:text-[#1F2B46]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSendLegalRequest} className="p-6 space-y-4">
              <p className="text-xs text-[#5A6372] leading-relaxed">
                Modifications to official hospital entity name, state license number, or jurisdiction require review and
                identity vetting by the MedKnot Central Governance Desk.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#1F2B46] mb-1">Requested Amendment Type</label>
                <select
                  value={legalRequestType}
                  onChange={(e) => setLegalRequestType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#AEBEAA] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                >
                  <option value="Legal Name Amendment">Hospital Legal Name Amendment</option>
                  <option value="License Number Renewal">State Registration License Renewal / Update</option>
                  <option value="Jurisdiction / State Transfer">Jurisdiction / State Administrative Transfer</option>
                  <option value="Facility Type Re-Classification">Facility Classification Tier Upgrade</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                  Justification / Institutional Resolution <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={legalRequestReason}
                  onChange={(e) => setLegalRequestReason(e.target.value)}
                  required
                  placeholder="Detail the rationale, governing board gazette notification number, or amended charter details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#AEBEAA] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                  Supporting Document Reference (Optional)
                </label>
                <input
                  type="text"
                  value={legalRequestDocNote}
                  onChange={(e) => setLegalRequestDocNote(e.target.value)}
                  placeholder="e.g. Gazette Order #MH-2024/8892 or Resolution Docket"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#AEBEAA] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                />
              </div>

              <div className="pt-3 border-t border-[#C8D6C3] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLegalModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#C8D6C3] text-xs font-semibold text-[#5A6372] hover:bg-[#E6EDE2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!legalRequestReason.trim()}
                  className="px-5 py-2 rounded-xl bg-[#0055A4] hover:bg-[#004382] disabled:opacity-50 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Submit for Governance Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DOCUMENT PREVIEW MODAL                                                 */}
      {/* ========================================================================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#C8D6C3] shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#C8D6C3] flex items-center justify-between bg-[#E3EBDD]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055A4]">description</span>
                <h3 className="text-base font-bold text-[#1F2B46]">Verified Document Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-[#5A6372] hover:text-[#1F2B46]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#E6EDE2] border border-[#C8D6C3] rounded-xl">
                <span className="material-symbols-outlined text-red-600 text-3xl">picture_as_pdf</span>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-[#1F2B46] block truncate">{previewDoc.title}</span>
                  <span className="text-xs text-[#5A6372] block font-mono">
                    {previewDoc.fileName} • {previewDoc.fileSize}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs border border-[#C8D6C3] p-4 rounded-xl bg-[#E3EBDD]">
                <div className="flex items-center justify-between py-1 border-b border-[#C8D6C3]">
                  <span className="text-[#5A6372]">Issuing Authority</span>
                  <span className="font-semibold text-[#1F2B46] text-right truncate max-w-[240px]">
                    {previewDoc.issuingAuthority}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#C8D6C3]">
                  <span className="text-[#5A6372]">Validity Period</span>
                  <span className="font-semibold text-[#2D6A28]">{previewDoc.validity}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#5A6372]">Security Signature</span>
                  <span className="font-mono text-[11px] text-[#0055A4]">SHA-256 Verified by MedKnot Central</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-5 py-2 rounded-xl bg-[#0055A4] text-white text-xs font-semibold hover:bg-[#004382]"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
