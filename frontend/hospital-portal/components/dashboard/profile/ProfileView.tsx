"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type UserSession, DEFAULT_ADMIN, clearClientSession, getClientSession } from "@/lib/auth";

interface ProfileViewProps {
  initialUser?: UserSession;
}

interface ProfileState {
  // Read-only institutional identities
  legalName: string;
  staffId: string;
  hospitalName: string;
  assignedRole: string;
  accountStatus: string;
  department: string;
  wardOrClinic: string;
  clinicalSpecialty: string;
  medicalRegNumber: string;
  licenseStatus: string;
  accessTier: string;

  // Editable personal info
  displayName: string;
  workEmail: string;
  mobileNumber: string;
  photoUrl: string | null;

  // Verification tracking
  emailVerified: boolean;
  emailVerificationPending: boolean;
  mobileVerified: boolean;
  mobileVerificationPending: boolean;
  twoFactorEnabled: boolean;
  lastSignIn: string;
  activeWorkstation: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  workstation: string;
  ip: string;
  status: "success" | "warning" | "info";
}

export default function ProfileView({ initialUser }: ProfileViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  // Client session verification
  useEffect(() => {
    if (!initialUser && !getClientSession()) {
      router.push("/login");
    }
  }, [initialUser, router]);

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // ── Profile Master Data & State ──────────────────────────────────────────
  const initialProfile: ProfileState = {
    legalName: "Dr. Michael Lee",
    staffId: "MK-STF-0842",
    hospitalName: user.facility || "St. Jude Medical Center — Campus North",
    assignedRole: user.role || "Hospital Administrator",
    accountStatus: "Active • Institutional Verified",
    department: user.department || "Clinical Administration & Emergency Services",
    wardOrClinic: "Level-1 Trauma & Emergency ICU Wing",
    clinicalSpecialty: "Emergency Medicine / Critical Care Informatics",
    medicalRegNumber: "MH-MED-2018-9921 (National Medical Commission)",
    licenseStatus: "Active & In Good Standing (Valid through Dec 2028)",
    accessTier: "Tier 1 — Full Clinical & Executive Administrative Access",

    displayName: user.name || "Dr. Michael Lee, MD",
    workEmail: user.email || "m.lee@stjude-health.org",
    mobileNumber: "+1 (555) 234-5678",
    photoUrl: null,

    emailVerified: true,
    emailVerificationPending: false,
    mobileVerified: true,
    mobileVerificationPending: false,
    twoFactorEnabled: true,
    lastSignIn: "Today at 08:42 AM from WS-ICU-04",
    activeWorkstation: "WS-ICU-04 • Hospital Intranet Node (Encrypted TLS 1.3)",
  };

  const [profile, setProfile] = useState<ProfileState>(initialProfile);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    displayName: initialProfile.displayName,
    workEmail: initialProfile.workEmail,
    mobileNumber: initialProfile.mobileNumber,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Photo upload state
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [pendingPhotoPreview, setPendingPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedStaffId, setCopiedStaffId] = useState<boolean>(false);

  // Modal dialog states
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showSignOutOthersModal, setShowSignOutOthersModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showContactAdminModal, setShowContactAdminModal] = useState<boolean>(false);

  // Password Modal form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Contact Admin Modal form
  const [adminRequestType, setAdminRequestType] = useState("Access Tier Modification");
  const [adminRequestJustification, setAdminRequestJustification] = useState("");
  const [adminRequestError, setAdminRequestError] = useState<string | null>(null);
  const [isSubmittingAdminReq, setIsSubmittingAdminReq] = useState(false);

  // Audit Log mock data
  const auditLogs: AuditLogEntry[] = [
    {
      id: "LOG-98214",
      timestamp: "Today, 08:42 AM",
      action: "Workstation sign-in (Biometric SSO + FIDO2)",
      workstation: "WS-ICU-04 (Intranet)",
      ip: "10.240.12.88",
      status: "success",
    },
    {
      id: "LOG-98188",
      timestamp: "Yesterday, 04:15 PM",
      action: "EHR Patient Record Batch Sign-off (ICU Discharge)",
      workstation: "WS-ICU-04 (Intranet)",
      ip: "10.240.12.88",
      status: "info",
    },
    {
      id: "LOG-97940",
      timestamp: "Nov 23, 2026, 09:12 AM",
      action: "Role & Privilege Re-verification (Periodic SLA Audit)",
      workstation: "CENTRAL-AUTH-01",
      ip: "10.240.0.12",
      status: "success",
    },
    {
      id: "LOG-97621",
      timestamp: "Nov 20, 2026, 07:30 PM",
      action: "Session terminated on mobile triage tablet",
      workstation: "TAB-TRIAGE-08",
      ip: "10.240.18.42",
      status: "warning",
    },
    {
      id: "LOG-97405",
      timestamp: "Nov 15, 2026, 11:05 AM",
      action: "Security credentials updated (Password rotation)",
      workstation: "WS-ADMIN-01",
      ip: "10.240.10.15",
      status: "success",
    },
  ];

  // Copy staff ID helper
  const handleCopyStaffId = () => {
    navigator.clipboard.writeText(profile.staffId);
    setCopiedStaffId(true);
    setToastMessage(`Staff ID ${profile.staffId} copied to clipboard.`);
    setTimeout(() => setCopiedStaffId(false), 2500);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Edit Profile Handlers ────────────────────────────────────────────────
  const handleStartEditing = () => {
    setEditForm({
      displayName: profile.displayName,
      workEmail: profile.workEmail,
      mobileNumber: profile.mobileNumber,
    });
    setFormErrors({});
    setPendingPhotoFile(null);
    setPendingPhotoPreview(null);
    setPhotoError(null);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (pendingPhotoPreview) {
      URL.revokeObjectURL(pendingPhotoPreview);
    }
    setPendingPhotoFile(null);
    setPendingPhotoPreview(null);
    setPhotoError(null);
    setFormErrors({});
    setIsEditing(false);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setPhotoError("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image size exceeds 5MB limit. Please upload a smaller photo.");
      return;
    }

    if (pendingPhotoPreview) {
      URL.revokeObjectURL(pendingPhotoPreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setPendingPhotoFile(file);
    setPendingPhotoPreview(previewUrl);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    // Validate Display Name
    if (!editForm.displayName.trim()) {
      errors.displayName = "Preferred display name cannot be blank.";
    }

    // Validate Email
    if (!editForm.workEmail.trim()) {
      errors.workEmail = "Work email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.workEmail.trim())) {
      errors.workEmail = "Enter a valid official work email address.";
    }

    // Validate Phone
    if (!editForm.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile number is required.";
    } else if (!/^[+0-9\s-()]{8,20}$/.test(editForm.mobileNumber.trim())) {
      errors.mobileNumber = "Enter a valid mobile contact number.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const emailChanged = editForm.workEmail.trim() !== profile.workEmail;
      const phoneChanged = editForm.mobileNumber.trim() !== profile.mobileNumber;

      setProfile((prev) => ({
        ...prev,
        displayName: editForm.displayName.trim(),
        workEmail: editForm.workEmail.trim(),
        mobileNumber: editForm.mobileNumber.trim(),
        photoUrl: pendingPhotoPreview || prev.photoUrl,
        emailVerified: emailChanged ? false : prev.emailVerified,
        emailVerificationPending: emailChanged ? true : prev.emailVerificationPending,
        mobileVerified: phoneChanged ? false : prev.mobileVerified,
        mobileVerificationPending: phoneChanged ? true : prev.mobileVerificationPending,
      }));

      setIsSaving(false);
      setIsEditing(false);
      setPendingPhotoFile(null);

      if (emailChanged || phoneChanged) {
        setToastMessage(
          "Profile updated. Re-verification tokens have been dispatched to your updated contact details."
        );
      } else {
        setToastMessage("Personal profile details updated successfully.");
      }

      setTimeout(() => setToastMessage(null), 4000);
    }, 800);
  };

  // ── Security Actions ─────────────────────────────────────────────────────
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Please enter your current institutional password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setPasswordError("Password must include an uppercase letter, a number, and a special character.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setToastMessage("Institutional portal password updated securely.");
      setTimeout(() => setToastMessage(null), 4000);
    }, 1000);
  };

  const handleSignOutOtherSessions = () => {
    setShowSignOutOthersModal(false);
    setToastMessage("All 2 other active workstation sessions have been successfully terminated.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleContactAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminRequestJustification.trim()) {
      setAdminRequestError("Please provide a clinical or administrative justification.");
      return;
    }

    setIsSubmittingAdminReq(true);
    setTimeout(() => {
      setIsSubmittingAdminReq(false);
      setShowContactAdminModal(false);
      setAdminRequestJustification("");
      setAdminRequestError(null);
      setToastMessage(
        "Request dispatched to MedKnot Central IT & Medical Credentialing (Ref: REQ-ADM-9214)."
      );
      setTimeout(() => setToastMessage(null), 4500);
    }, 900);
  };

  return (
    <div className="dashboard-theme font-body-md text-body-md text-[#1F2B46] antialiased bg-transparent w-full min-w-0 flex-1">
      <main className="relative bg-transparent w-full min-w-0 px-4 md:px-8 pt-2 pb-16">
        <div className="flex flex-col w-full min-w-0">
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

            {/* Breadcrumb Navigation */}
            <div className="w-full pt-space-lg pb-space-sm flex flex-col gap-space-xs">
              <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-[#5A6372] font-supporting text-supporting">
                <Link
                  href="/dashboard"
                  className="hover:text-[#0055A4] transition-colors flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px] shrink-0">home</span>
                  <span className="whitespace-nowrap">Home</span>
                </Link>
                <span className="material-symbols-outlined text-[14px] text-[#727783] shrink-0">
                  chevron_right
                </span>
                <span className="text-[#5A6372] whitespace-nowrap">
                  Operations
                </span>
                <span className="material-symbols-outlined text-[14px] text-[#727783] shrink-0">
                  chevron_right
                </span>
                <span className="text-[#0055A4] font-semibold whitespace-nowrap">
                  My Profile
                </span>
              </nav>

              {/* Page Title & Status Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs pb-space-md">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-space-md flex-wrap">
                    <h1 className="font-headline-lg text-headline-lg text-[#0055A4] tracking-tight font-bold truncate">
                      My Profile
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-supporting text-supporting font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      Hospital Admin Tier-1
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-[#5A6372] max-w-4xl">
                    Manage your healthcare staff credentials, contact details, security controls, and clinical access authorizations.
                  </p>
                </div>

                <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0">
                  <button
                    onClick={handleCopyStaffId}
                    className="px-space-md py-2 rounded-xl bg-white border border-[#D5DFD2] hover:bg-[#EDF2E9] text-[#1F2B46] font-button-label text-supporting transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                    type="button"
                    title="Copy Staff ID"
                  >
                    <span className="material-symbols-outlined text-[#0055A4] text-[18px]">
                      {copiedStaffId ? "done" : "badge"}
                    </span>
                    <span className="font-mono font-semibold">{profile.staffId}</span>
                    <span className="text-xs text-[#5A6372] hidden sm:inline">
                      {copiedStaffId ? "Copied" : "Copy ID"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── SECTION A: PROFILE OVERVIEW (HERO IDENTITY CARD) ───────── */}
            <div className="bg-white border border-[#D5DFD2] rounded-3xl p-6 lg:p-8 shadow-sm mb-space-xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#D5DFD2]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
                  {/* Avatar with status badge */}
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#0055A4] to-[#003669] text-white flex items-center justify-center text-3xl font-bold shadow-md border-2 border-white overflow-hidden">
                      {profile.photoUrl ? (
                        <Image
                          src={profile.photoUrl}
                          alt="Profile Avatar"
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>ML</span>
                      )}
                    </div>
                    <span
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white"
                      title="Verified Institutional Node"
                    >
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                    </span>
                  </div>

                  {/* Name and titles */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-headline-md text-headline-md text-[#1F2B46] font-bold truncate">
                        {profile.displayName}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EBF3FC] text-[#0055A4] text-xs font-semibold uppercase tracking-wider">
                        {profile.assignedRole}
                      </span>
                    </div>

                    <p className="font-body-md text-body-md text-[#5A6372] font-medium">
                      Chief Medical Officer &amp; Institutional Administrator
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[#5A6372] flex-wrap mt-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-[#0055A4]">domain</span>
                        {profile.hospitalName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-[#0055A4]">medical_services</span>
                        {profile.department}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Profile Actions */}
                <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-end">
                  {!isEditing ? (
                    <button
                      onClick={handleStartEditing}
                      className="px-5 py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#00478a] active:bg-[#003b73] text-white font-button-label text-button-label transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      <span>Edit Personal Info</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCancelEditing}
                        className="px-4 py-2.5 rounded-xl bg-[#EDF2E9] hover:bg-[#E4EBE0] border border-[#D5DFD2] text-[#1F2B46] font-button-label text-button-label transition-colors cursor-pointer"
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#00478a] text-white font-button-label text-button-label shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
                        type="button"
                      >
                        {isSaving ? (
                          <>
                            <span className="material-symbols-outlined text-[18px] animate-spin">
                              progress_activity
                            </span>
                            <span>Saving…</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[18px]">check</span>
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Identity Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                <div className="p-4 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                    Official Staff ID
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#1F2B46] text-base">
                      {profile.staffId}
                    </span>
                    <span className="material-symbols-outlined text-[#0055A4] text-lg">
                      badge
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5A6372] mt-0.5">
                    Credentialed under MedKnot ID Service
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                    Institutional Role
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1F2B46] text-base truncate">
                      {profile.assignedRole}
                    </span>
                    <span className="material-symbols-outlined text-secondary text-lg">
                      verified_user
                    </span>
                  </div>
                  <span className="text-[11px] text-tertiary font-semibold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                    Tier 1 Clinical Admin Privileges
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                    Medical Council License
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#1F2B46] text-base truncate">
                      MH-MED-2018-9921
                    </span>
                    <span className="material-symbols-outlined text-[#0055A4] text-lg">
                      verified
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    Active &amp; Good Standing (Dec 2028)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                    Account Security Status
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 text-base flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active &amp; Vetted
                    </span>
                    <span className="material-symbols-outlined text-[#0055A4] text-lg">
                      security
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5A6372] mt-0.5">
                    2FA Active • Intranet Encrypted
                  </span>
                </div>
              </div>
            </div>

            {/* ── TWO-COLUMN MAIN WORKSPACE ───────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
              {/* Left Column (7 cols): Personal Info & Affiliation */}
              <div className="lg:col-span-7 flex flex-col gap-space-xl min-w-0">
                {/* ── SECTION B: PERSONAL INFORMATION ─────────────────────── */}
                <div className="bg-white border border-[#D5DFD2] rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col gap-space-lg">
                  <div className="flex items-center justify-between border-b border-[#D5DFD2] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#EDF2E9] text-[#0055A4] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">person</span>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-card-heading text-card-heading text-[#1F2B46] font-bold">
                          Personal &amp; Contact Information
                        </h3>
                        <span className="text-xs text-[#5A6372]">
                          Manage your identity, communications dispatch, and profile photo
                        </span>
                      </div>
                    </div>

                    {!isEditing && (
                      <button
                        onClick={handleStartEditing}
                        className="text-xs font-semibold text-[#0055A4] hover:underline flex items-center gap-1 cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {/* Photo Edit Row when editing */}
                  {isEditing && (
                    <div className="p-4 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white border border-[#D5DFD2] overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                          {pendingPhotoPreview || profile.photoUrl ? (
                            <Image
                              src={pendingPhotoPreview || (profile.photoUrl as string)}
                              alt="New Avatar Preview"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[#0055A4] font-bold text-lg">ML</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-[#1F2B46]">
                            Profile Photograph
                          </span>
                          <span className="text-xs text-[#5A6372]">
                            Supports JPG, PNG, or WebP (Max 5MB)
                          </span>
                          {pendingPhotoFile && (
                            <span className="text-xs text-tertiary font-semibold flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              New photo selected: {pendingPhotoFile.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          className="hidden"
                          onChange={handlePhotoSelect}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-lg bg-white border border-[#D5DFD2] hover:bg-[#E4EBE0] text-[#0055A4] font-button-label text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Change Photo
                        </button>
                        {pendingPhotoPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              URL.revokeObjectURL(pendingPhotoPreview);
                              setPendingPhotoFile(null);
                              setPendingPhotoPreview(null);
                            }}
                            className="p-1.5 rounded-lg text-error hover:bg-error-container transition-colors cursor-pointer"
                            title="Remove pending photo"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {photoError && (
                    <div className="p-3 rounded-xl bg-red-50 text-error border border-red-200 text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">error</span>
                      <span>{photoError}</span>
                    </div>
                  )}

                  {/* Form fields */}
                  <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                    {/* Full Legal Name (READ-ONLY) */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="font-card-heading text-xs font-semibold text-[#1F2B46] uppercase tracking-wider flex items-center gap-1">
                          Full Legal Name
                          <span className="material-symbols-outlined text-[14px] text-[#727783]">lock</span>
                        </label>
                        <span className="text-[11px] text-[#727783] bg-[#EDF2E9] px-2 py-0.5 rounded-md">
                          Read-Only • Requires HR Authorization
                        </span>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={profile.legalName}
                        className="w-full px-space-md py-2.5 bg-[#E4EBE0] border border-[#D5DFD2] rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none cursor-not-allowed select-none opacity-90"
                      />
                      <span className="text-[11px] text-[#5A6372]">
                        Legal name is locked against institutional charter license and state medical registry records.
                      </span>
                    </div>

                    {/* Preferred Display Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-card-heading text-xs font-semibold text-[#1F2B46] uppercase tracking-wider">
                        Preferred Display Name <span className="text-error">*</span>
                      </label>
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={editForm.displayName}
                            onChange={(e) => {
                              setEditForm({ ...editForm, displayName: e.target.value });
                              if (formErrors.displayName) {
                                setFormErrors({ ...formErrors, displayName: "" });
                              }
                            }}
                            className={`w-full px-space-md py-2.5 bg-[#F1F5EF] focus:bg-white border rounded-xl text-[#1F2B46] font-body-md outline-none transition-all ${
                              formErrors.displayName
                                ? "border-error ring-1 ring-error"
                                : "border-[#D5DFD2] focus:border-[#0055A4]"
                            }`}
                          />
                          {formErrors.displayName && (
                            <span className="text-error text-xs">{formErrors.displayName}</span>
                          )}
                        </>
                      ) : (
                        <div className="w-full px-space-md py-2.5 bg-[#F1F5EF] border border-[#D5DFD2] rounded-xl text-[#1F2B46] font-semibold text-body-md">
                          {profile.displayName}
                        </div>
                      )}
                      <span className="text-[11px] text-[#5A6372]">
                        Shown on patient triage notes and clinical sign-offs.
                      </span>
                    </div>

                    {/* Staff ID (READ-ONLY) */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-card-heading text-xs font-semibold text-[#1F2B46] uppercase tracking-wider flex items-center gap-1">
                          Staff ID
                          <span className="material-symbols-outlined text-[14px] text-[#727783]">lock</span>
                        </label>
                        <span className="text-[11px] text-[#727783] bg-[#EDF2E9] px-2 py-0.5 rounded-md">
                          System Assigned
                        </span>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={profile.staffId}
                        className="w-full px-space-md py-2.5 bg-[#E4EBE0] border border-[#D5DFD2] rounded-xl text-[#1F2B46] font-mono font-bold text-body-md outline-none cursor-not-allowed select-none opacity-90"
                      />
                      <span className="text-[11px] text-[#5A6372]">
                        Permanent identifier for institutional audit logs.
                      </span>
                    </div>

                    {/* Work Email */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-card-heading text-xs font-semibold text-[#1F2B46] uppercase tracking-wider">
                          Official Work Email <span className="text-error">*</span>
                        </label>
                        {profile.emailVerificationPending ? (
                          <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">pending</span>
                            Verification Pending
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">verified</span>
                            Verified
                          </span>
                        )}
                      </div>
                      {isEditing ? (
                        <>
                          <input
                            type="email"
                            value={editForm.workEmail}
                            onChange={(e) => {
                              setEditForm({ ...editForm, workEmail: e.target.value });
                              if (formErrors.workEmail) {
                                setFormErrors({ ...formErrors, workEmail: "" });
                              }
                            }}
                            className={`w-full px-space-md py-2.5 bg-[#F1F5EF] focus:bg-white border rounded-xl text-[#1F2B46] font-body-md outline-none transition-all ${
                              formErrors.workEmail
                                ? "border-error ring-1 ring-error"
                                : "border-[#D5DFD2] focus:border-[#0055A4]"
                            }`}
                          />
                          {formErrors.workEmail && (
                            <span className="text-error text-xs">{formErrors.workEmail}</span>
                          )}
                        </>
                      ) : (
                        <div className="w-full px-space-md py-2.5 bg-[#F1F5EF] border border-[#D5DFD2] rounded-xl text-[#1F2B46] font-semibold text-body-md truncate">
                          {profile.workEmail}
                        </div>
                      )}
                      <span className="text-[11px] text-[#5A6372]">
                        Changing your email requires email token confirmation.
                      </span>
                    </div>

                    {/* Mobile Number */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-card-heading text-xs font-semibold text-[#1F2B46] uppercase tracking-wider">
                          Direct Mobile Number <span className="text-error">*</span>
                        </label>
                        {profile.mobileVerificationPending ? (
                          <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">pending</span>
                            Verification Pending
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">verified</span>
                            Verified (SMS 2FA)
                          </span>
                        )}
                      </div>
                      {isEditing ? (
                        <>
                          <input
                            type="tel"
                            value={editForm.mobileNumber}
                            onChange={(e) => {
                              setEditForm({ ...editForm, mobileNumber: e.target.value });
                              if (formErrors.mobileNumber) {
                                setFormErrors({ ...formErrors, mobileNumber: "" });
                              }
                            }}
                            className={`w-full px-space-md py-2.5 bg-[#F1F5EF] focus:bg-white border rounded-xl text-[#1F2B46] font-body-md outline-none transition-all ${
                              formErrors.mobileNumber
                                ? "border-error ring-1 ring-error"
                                : "border-[#D5DFD2] focus:border-[#0055A4]"
                            }`}
                          />
                          {formErrors.mobileNumber && (
                            <span className="text-error text-xs">{formErrors.mobileNumber}</span>
                          )}
                        </>
                      ) : (
                        <div className="w-full px-space-md py-2.5 bg-[#F1F5EF] border border-[#D5DFD2] rounded-xl text-[#1F2B46] font-semibold text-body-md">
                          {profile.mobileNumber}
                        </div>
                      )}
                      <span className="text-[11px] text-[#5A6372]">
                        Primary contact for two-factor SMS and clinical on-call dispatch.
                      </span>
                    </div>

                    {/* Security Notice Callout */}
                    <div className="md:col-span-2 p-4 rounded-2xl bg-[#EBF3FC] border border-[#D5DFD2] flex items-start gap-3 mt-2">
                      <span className="material-symbols-outlined text-[#0055A4] text-xl shrink-0 mt-0.5">
                        info
                      </span>
                      <div className="flex flex-col gap-0.5 text-xs text-[#1F2B46] leading-relaxed">
                        <span className="font-bold text-[#0055A4]">
                          Institutional Contact Verification Policy
                        </span>
                        <span>
                          For clinical security and HIPAA compliance, updates to your official work email or direct mobile number trigger an immediate <strong>Verification Pending</strong> state. A high-priority verification token and SMS OTP will be dispatched before the new channel becomes active.
                        </span>
                      </div>
                    </div>

                    {/* Bottom Save bar if in editing mode */}
                    {isEditing && (
                      <div className="md:col-span-2 flex items-center justify-end gap-3 pt-3 border-t border-[#D5DFD2]">
                        <button
                          type="button"
                          onClick={handleCancelEditing}
                          className="px-5 py-2 rounded-xl bg-[#EDF2E9] hover:bg-[#E4EBE0] border border-[#D5DFD2] text-[#1F2B46] font-button-label text-sm transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-6 py-2 rounded-xl bg-[#0055A4] hover:bg-[#00478a] text-white font-button-label text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
                        >
                          {isSaving ? "Saving Changes…" : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {/* ── SECTION D: HOSPITAL AFFILIATION & ACCESS ────────────── */}
                <div className="bg-white border border-[#D5DFD2] rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col gap-space-lg">
                  <div className="flex items-center justify-between border-b border-[#D5DFD2] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#EDF2E9] text-[#0055A4] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">domain</span>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-card-heading text-card-heading text-[#1F2B46] font-bold">
                          Hospital Affiliation &amp; Clinical Privileges
                        </h3>
                        <span className="text-xs text-[#5A6372]">
                          Departmental node, clinic assignments, and authorized permissions
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowContactAdminModal(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#EDF2E9] hover:bg-[#E4EBE0] border border-[#D5DFD2] text-[#0055A4] font-button-label text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">contact_support</span>
                      <span>Request Change</span>
                    </button>
                  </div>

                  {/* Affiliation Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex flex-col gap-1">
                      <span className="text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                        Primary Facility
                      </span>
                      <span className="font-semibold text-sm text-[#1F2B46]">
                        {profile.hospitalName}
                      </span>
                      <span className="text-xs text-[#5A6372]">
                        Parent Organization: St. Jude Health Care Trust
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex flex-col gap-1">
                      <span className="text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                        Assigned Department
                      </span>
                      <span className="font-semibold text-sm text-[#1F2B46]">
                        {profile.department}
                      </span>
                      <span className="text-xs text-[#5A6372]">
                        Reporting Node: Central Executive Board
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex flex-col gap-1">
                      <span className="text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                        Clinical Ward &amp; Station
                      </span>
                      <span className="font-semibold text-sm text-[#1F2B46]">
                        {profile.wardOrClinic}
                      </span>
                      <span className="text-xs text-[#5A6372]">
                        Station: Modular ICU 14-A &amp; Command Room
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex flex-col gap-1">
                      <span className="text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                        Clinical Specialty
                      </span>
                      <span className="font-semibold text-sm text-[#1F2B46]">
                        {profile.clinicalSpecialty}
                      </span>
                      <span className="text-xs text-[#5A6372]">
                        Sub-specialty: Emergency Resuscitation &amp; Triage
                      </span>
                    </div>
                  </div>

                  {/* Access Permissions & Privileges List */}
                  <div className="flex flex-col gap-3 pt-2">
                    <span className="font-card-heading text-xs font-semibold text-[#1F2B46] uppercase tracking-wider">
                      Authorized Clinical &amp; Administrative Permissions
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-white border border-[#D5DFD2] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-emerald-700 text-lg">check_circle</span>
                          <span className="font-semibold text-[#1F2B46] truncate">EHR Patient Records</span>
                        </div>
                        <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                          Read / Write / Sign-Off
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#D5DFD2] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-emerald-700 text-lg">check_circle</span>
                          <span className="font-semibold text-[#1F2B46] truncate">OPD Queue &amp; Bed Alloc</span>
                        </div>
                        <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                          Real-Time Control
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#D5DFD2] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-emerald-700 text-lg">check_circle</span>
                          <span className="font-semibold text-[#1F2B46] truncate">Staff Rosters &amp; Shifts</span>
                        </div>
                        <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                          Full Administration
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#D5DFD2] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-emerald-700 text-lg">check_circle</span>
                          <span className="font-semibold text-[#1F2B46] truncate">Tele-Triage &amp; AI Routing</span>
                        </div>
                        <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                          Protocol Override
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#D5DFD2] flex items-center justify-between text-xs sm:col-span-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-emerald-700 text-lg">check_circle</span>
                          <span className="font-semibold text-[#1F2B46] truncate">HIPAA Security &amp; Access Audit Logs</span>
                        </div>
                        <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                          Master Institutional Access
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Read-only Governance Policy Banner */}
                  <div className="p-4 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] text-xs text-[#5A6372] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#0055A4] text-lg shrink-0 mt-0.5">
                      gavel
                    </span>
                    <p className="leading-relaxed">
                      Access tiers and facility permissions are enforced centrally in accordance with hospital credentialing committee bylaws and ABDM / HIPAA compliance protocols. Role alterations cannot be granted locally without board authorization.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Security, Active Sessions, Audit Trail */}
              <div className="lg:col-span-5 flex flex-col gap-space-xl min-w-0">
                {/* ── SECTION C: ACCOUNT & SECURITY ───────────────────────── */}
                <div className="bg-white border border-[#D5DFD2] rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col gap-space-lg">
                  <div className="flex items-center justify-between border-b border-[#D5DFD2] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#EDF2E9] text-[#0055A4] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">security</span>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-card-heading text-card-heading text-[#1F2B46] font-bold">
                          Account Security
                        </h3>
                        <span className="text-xs text-[#5A6372]">
                          Authentication factors, credentials, and session controls
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Status Rows */}
                  <div className="flex flex-col gap-3">
                    {/* Two-Factor Authentication */}
                    <div className="p-4 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#D5DFD2] flex items-center justify-center text-[#0055A4] shrink-0">
                          <span className="material-symbols-outlined text-lg">phonelink_lock</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm text-[#1F2B46] truncate">
                            Two-Factor Authentication (2FA)
                          </span>
                          <span className="text-xs text-[#5A6372]">
                            Hardware Security Key &amp; SMS OTP
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider shrink-0">
                        Enabled
                      </span>
                    </div>

                    {/* Workstation Info */}
                    <div className="p-4 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#D5DFD2] flex items-center justify-center text-[#0055A4] shrink-0">
                          <span className="material-symbols-outlined text-lg">computer</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm text-[#1F2B46] truncate">
                            Active Workstation
                          </span>
                          <span className="text-xs text-[#5A6372] truncate">
                            {profile.activeWorkstation}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0055A4] border border-blue-200 text-xs font-bold shrink-0">
                        Active Now
                      </span>
                    </div>

                    {/* Last Sign-in Timestamp */}
                    <div className="p-4 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#D5DFD2] flex items-center justify-center text-[#0055A4] shrink-0">
                          <span className="material-symbols-outlined text-lg">schedule</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm text-[#1F2B46] truncate">
                            Last Authentication
                          </span>
                          <span className="text-xs text-[#5A6372]">
                            {profile.lastSignIn}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 shrink-0">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Security Action Buttons */}
                  <div className="flex flex-col gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D5DFD2] hover:bg-[#EDF2E9] text-[#1F2B46] font-button-label text-sm font-semibold transition-colors flex items-center justify-between shadow-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#0055A4] text-lg">key</span>
                        <span>Change Account Password</span>
                      </div>
                      <span className="material-symbols-outlined text-[#727783] text-lg">chevron_right</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSignOutOthersModal(true)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D5DFD2] hover:bg-[#EDF2E9] text-[#1F2B46] font-button-label text-sm font-semibold transition-colors flex items-center justify-between shadow-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-700 text-lg">devices</span>
                        <span>Sign Out of All Other Sessions</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#5A6372] text-[11px] font-semibold">
                        2 active
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAuditModal(true)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D5DFD2] hover:bg-[#EDF2E9] text-[#1F2B46] font-button-label text-sm font-semibold transition-colors flex items-center justify-between shadow-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#0055A4] text-lg">history</span>
                        <span>View Access Audit Trail</span>
                      </div>
                      <span className="material-symbols-outlined text-[#727783] text-lg">chevron_right</span>
                    </button>
                  </div>
                </div>

                {/* ── CARD: QUICK ASSISTANCE / EMERGENCY HR HELPLINE ─────── */}
                <div className="p-6 rounded-3xl bg-[#EDF2E9] border border-[#D5DFD2] shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#0055A4] text-2xl">
                      support_agent
                    </span>
                    <h4 className="font-card-heading text-card-heading text-[#1F2B46] font-bold">
                      Institutional Support &amp; Credentialing
                    </h4>
                  </div>
                  <p className="text-xs text-[#5A6372] leading-relaxed">
                    Need emergency privilege escalation or reporting lost access tokens? Reach the Central Hospital Onboarding Desk 24/7.
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-[#D5DFD2]">
                    <a
                      href="mailto:compliance@medknot.health"
                      className="text-xs font-bold text-[#0055A4] hover:underline flex items-center gap-1"
                    >
                      <span>compliance@medknot.health</span>
                      <span className="material-symbols-outlined text-[13px]">north_east</span>
                    </a>
                    <span className="text-xs font-semibold text-secondary">
                      Toll Free: 1800-419-KNOT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </main>

      {/* ── MODAL 1: CHANGE PASSWORD ──────────────────────────────────────── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#D5DFD2] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-[#D5DFD2] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055A4] text-2xl">lock_reset</span>
                <h3 className="font-card-heading text-lg font-bold text-[#1F2B46]">
                  Change Portal Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError(null);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-[#727783] hover:text-[#1F2B46] p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <p className="text-xs text-[#5A6372]">
              Ensure your new password meets healthcare-grade complexity requirements (8+ characters, uppercase, number, symbol).
            </p>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1F2B46]">Current Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 bg-[#F1F5EF] focus:bg-white border border-[#D5DFD2] focus:border-[#0055A4] rounded-xl text-sm outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1F2B46]">New Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 chars with uppercase, number & symbol"
                  className="w-full px-3.5 py-2.5 bg-[#F1F5EF] focus:bg-white border border-[#D5DFD2] focus:border-[#0055A4] rounded-xl text-sm outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1F2B46]">Confirm New Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 bg-[#F1F5EF] focus:bg-white border border-[#D5DFD2] focus:border-[#0055A4] rounded-xl text-sm outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-[#5A6372]">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#0055A4] rounded"
                  />
                  <span>Show Passwords</span>
                </label>
              </div>

              {passwordError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-error border border-red-200 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D5DFD2]">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#EDF2E9] hover:bg-[#E4EBE0] border border-[#D5DFD2] text-[#1F2B46] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2 rounded-xl bg-[#0055A4] hover:bg-[#00478a] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-70"
                >
                  {isUpdatingPassword ? "Updating…" : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: SIGN OUT ALL OTHER SESSIONS ──────────────────────────── */}
      {showSignOutOthersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#D5DFD2] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-amber-700">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-card-heading text-lg font-bold text-[#1F2B46]">
                Terminate Other Workstation Sessions?
              </h3>
            </div>

            <p className="text-xs text-[#5A6372] leading-relaxed">
              This will immediately revoke active access tokens on all other computers and mobile tablets. You will remain signed in strictly on this current workstation (WS-ICU-04).
            </p>

            <div className="p-3 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1F2B46]">WS-TRAUMA-02 (Desktop)</span>
                <span className="text-[#5A6372]">Signed in 3 hrs ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1F2B46]">iPad Pro (Mobile Triage App)</span>
                <span className="text-[#5A6372]">Signed in 1 day ago</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DFD2]">
              <button
                type="button"
                onClick={() => setShowSignOutOthersModal(false)}
                className="px-4 py-2 rounded-xl bg-[#EDF2E9] hover:bg-[#E4EBE0] border border-[#D5DFD2] text-[#1F2B46] text-xs font-semibold"
              >
                Keep Sessions
              </button>
              <button
                type="button"
                onClick={handleSignOutOtherSessions}
                className="px-5 py-2 rounded-xl bg-error hover:bg-red-700 text-white text-xs font-semibold shadow-sm"
              >
                Sign Out Others
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: AUDIT TRAIL ─────────────────────────────────────────── */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#D5DFD2] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#D5DFD2] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055A4] text-2xl">history_edu</span>
                <h3 className="font-card-heading text-lg font-bold text-[#1F2B46]">
                  Access &amp; Security Audit Trail
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="text-[#727783] hover:text-[#1F2B46] p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <p className="text-xs text-[#5A6372]">
              Immutable event log recorded per HIPAA Section 164.312(b) audit controls for Staff ID {profile.staffId}.
            </p>

            <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-[#EDF2E9] border border-[#D5DFD2] flex items-center justify-between text-xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-lg shrink-0 mt-0.5 ${
                        log.status === "success"
                          ? "text-emerald-700"
                          : log.status === "warning"
                          ? "text-amber-700"
                          : "text-[#0055A4]"
                      }`}
                    >
                      {log.status === "success"
                        ? "verified"
                        : log.status === "warning"
                        ? "logout"
                        : "info"}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-[#1F2B46] truncate">
                        {log.action}
                      </span>
                      <span className="text-[#5A6372] text-[11px]">
                        {log.workstation} • IP: {log.ip}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#5A6372] font-mono shrink-0 text-right">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D5DFD2] text-xs">
              <span className="text-[#5A6372]">Showing last 5 security events</span>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#0055A4] text-white font-semibold text-xs"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: CONTACT HOSPITAL ADMINISTRATOR / CREDENTIALING ──────── */}
      {showContactAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#D5DFD2] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#D5DFD2] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055A4] text-2xl">support_agent</span>
                <h3 className="font-card-heading text-lg font-bold text-[#1F2B46]">
                  Request Affiliation or Access Change
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowContactAdminModal(false);
                  setAdminRequestError(null);
                  setAdminRequestJustification("");
                }}
                className="text-[#727783] hover:text-[#1F2B46] p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <p className="text-xs text-[#5A6372]">
              Submit formal credential or departmental transfer requests to the Central Hospital Administration desk.
            </p>

            <form onSubmit={handleContactAdminSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1F2B46]">Request Type</label>
                <select
                  value={adminRequestType}
                  onChange={(e) => setAdminRequestType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F1F5EF] focus:bg-white border border-[#D5DFD2] rounded-xl text-xs outline-none cursor-pointer"
                >
                  <option value="Access Tier Modification">Access Tier Modification</option>
                  <option value="Department or Ward Transfer">Department or Ward Transfer</option>
                  <option value="Legal Name or Title Correction">Legal Name or Title Correction</option>
                  <option value="Medical License Number Update">Medical License Number Update</option>
                  <option value="Temporary Clinical Privilege Escalation">Temporary Clinical Privilege Escalation</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1F2B46]">Clinical Justification / Notes</label>
                <textarea
                  rows={3}
                  value={adminRequestJustification}
                  onChange={(e) => {
                    setAdminRequestJustification(e.target.value);
                    if (adminRequestError) setAdminRequestError(null);
                  }}
                  placeholder="Detail the clinical necessity, board approval, or departmental transfer details…"
                  className="w-full p-3 bg-[#F1F5EF] focus:bg-white border border-[#D5DFD2] rounded-xl text-xs outline-none resize-none"
                />
              </div>

              {adminRequestError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-error border border-red-200 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{adminRequestError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DFD2]">
                <button
                  type="button"
                  onClick={() => setShowContactAdminModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#EDF2E9] hover:bg-[#E4EBE0] border border-[#D5DFD2] text-[#1F2B46] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdminReq}
                  className="px-5 py-2 rounded-xl bg-[#0055A4] hover:bg-[#00478a] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-70"
                >
                  {isSubmittingAdminReq ? "Submitting…" : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
