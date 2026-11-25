"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type UserSession, DEFAULT_ADMIN, clearClientSession, getClientSession } from "@/lib/auth";

interface RegisterFacilityViewProps {
  initialUser?: UserSession;
}

interface FormState {
  facilityName: string;
  facilityType: string;
  registrationNumber: string;
  yearEstablished: string;
  website: string;
  overview: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  streetAddress: string;
  contactDesk: string;
  registryEmail: string;
  adminName: string;
  adminDesignation: string;
  adminEmail: string;
  adminPhone: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function RegisterFacilityView({ initialUser }: RegisterFacilityViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  // Session check on client
  useEffect(() => {
    if (!initialUser && !getClientSession()) {
      router.push("/login");
    }
  }, [initialUser, router]);

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // Active registration step
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form fields state
  const [formData, setFormData] = useState<FormState>({
    facilityName: "St. Jude Specialty Hospital & Research Centre",
    facilityType: "Multispecialty Hospital",
    registrationNumber: "REG-MH-2024-91024",
    yearEstablished: "2014",
    website: "https://www.stjude-health.org",
    overview:
      "St. Jude Medical Center Campus North is a 350-bed tertiary multispecialty facility equipped with 14 laminar modular OTs, 60 ICU units, and Level-1 Trauma Emergency care, integrated with automated digital diagnostics.",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    pincode: "400050",
    streetAddress: "Plot 18, Medical Knowledge Park, Western Express Highway, Bandra East",
    contactDesk: "+91 22 2840 9100",
    registryEmail: "registrations@stjude-health.org",
    adminName: "Dr. Michael Lee",
    adminDesignation: "Chief Medical Director / Head of Administration",
    adminEmail: "m.lee@stjude-health.org",
    adminPhone: "+91 98201 44882",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Autosave status
  const [lastSaved, setLastSaved] = useState<string>("10:42 AM");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  // Clear toast after 4s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error on change
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Logo file handler
  const processFile = (file: File) => {
    setLogoError(null);
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setLogoError("Please upload a valid image file (PNG, JPG, or SVG).");
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setLogoError("File size exceeds 5MB limit. Please upload a smaller logo.");
      return;
    }

    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
    setToastMessage(`Logo "${file.name}" uploaded successfully.`);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoFile(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    setLogoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Save Draft interaction
  const handleSaveDraft = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLastSaved(timeString);
    setToastMessage(`Draft successfully saved at ${timeString}.`);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.facilityName.trim()) {
      newErrors.facilityName = "Official Hospital / Clinic Name is required.";
    }
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration Number is required.";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Postal / PIN Code is required.";
    } else if (!/^[0-9\s-]{4,10}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Enter a valid postal / PIN code.";
    }
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Complete Street Address is required.";
    }
    if (!formData.contactDesk.trim()) {
      newErrors.contactDesk = "Official Contact Desk phone is required.";
    }
    if (!formData.registryEmail.trim()) {
      newErrors.registryEmail = "Official Registry Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.registryEmail.trim())) {
      newErrors.registryEmail = "Enter a valid registry email address.";
    }
    if (!formData.adminName.trim()) {
      newErrors.adminName = "Administrator Full Legal Name is required.";
    }
    if (!formData.adminDesignation.trim()) {
      newErrors.adminDesignation = "Institutional Designation is required.";
    }
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = "Administrator Work Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail.trim())) {
      newErrors.adminEmail = "Enter a valid official work email address.";
    }
    if (!formData.adminPhone.trim()) {
      newErrors.adminPhone = "Direct Mobile / Contact is required.";
    }
    if (formData.website.trim() && !/^https?:\/\/.+/i.test(formData.website.trim())) {
      newErrors.website = "Website must start with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit / Next Step handler
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowReviewModal(true);
      setCurrentStep(2);
    } else {
      setToastMessage("Please resolve the highlighted errors before continuing.");
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementById(firstErrorKey);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className="dashboard-theme font-body-md text-body-md text-[#1F2B46] antialiased bg-transparent w-full min-w-0 flex-1">
      {/* Main Content Area */}
      <main className="relative bg-transparent w-full min-w-0 px-4 md:px-8 pt-6 pb-16">
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

            {/* A. Top Breadcrumbs & Page Sub-header */}
            <div className="w-full py-space-lg flex flex-col gap-space-sm">
              {/* Breadcrumbs Bar */}
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
                <span className="hover:text-[#0055A4] transition-colors whitespace-nowrap">
                  Facility Settings
                </span>
                <span className="material-symbols-outlined text-[14px] text-[#727783] shrink-0">
                  chevron_right
                </span>
                <span className="text-[#0055A4] font-semibold whitespace-nowrap">
                  Register Facility
                </span>
              </nav>

              {/* Header Title & Status Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-space-md flex-wrap">
                    <h1 className="font-headline-lg text-headline-lg text-[#0055A4] tracking-tight font-bold truncate">
                      Register Your Hospital or Clinic
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-supporting text-supporting font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      New Facility Registration
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-[#5A6372] max-w-3xl">
                    Add your healthcare facility to MedKnot and manage your organization through one connected platform.
                  </p>
                </div>

                <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0">
                  <span className="font-supporting text-supporting text-[#727783] whitespace-nowrap">
                    Autosaved at {lastSaved}
                  </span>
                  <button
                    onClick={handleSaveDraft}
                    className="px-space-md py-1.5 rounded-lg bg-white border border-[#DDE6DA] hover:bg-[#F3F6F0] text-[#1F2B46] font-button-label text-button-label transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                    type="button"
                    title="Save Draft"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#0055A4] shrink-0">save</span>
                    <span className="whitespace-nowrap">Draft</span>
                  </button>
                </div>
              </div>
            </div>

            {/* B. Stepper Progress Indicator */}
            <div className="w-full pb-space-lg">
              <div className="w-full bg-white border border-[#DDE6DA] rounded-xl p-space-md shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between relative">
                  {/* Step 1: Facility Information */}
                  <div
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-space-sm z-10 bg-white pr-space-md cursor-pointer select-none"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-card-heading text-card-heading shadow-sm shrink-0 transition-colors ${
                        currentStep === 1
                          ? "bg-[#0055A4] text-white"
                          : "bg-tertiary-fixed text-tertiary"
                      }`}
                    >
                      {currentStep > 1 ? (
                        <span className="material-symbols-outlined text-lg">check</span>
                      ) : (
                        "1"
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-card-heading text-card-heading text-[#0055A4] font-bold whitespace-nowrap truncate">
                        Facility Information
                      </span>
                      <span className="font-supporting text-supporting text-[#0055A4] font-medium whitespace-nowrap">
                        {currentStep === 1 ? "In Progress" : "Completed"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 h-0.5 bg-[#DDE6DA] -mx-2"></div>

                  {/* Step 2: Contact & Administrator */}
                  <div
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-space-sm z-10 bg-white px-space-md cursor-pointer select-none"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-card-heading text-card-heading shrink-0 transition-colors ${
                        currentStep === 2
                          ? "bg-[#0055A4] text-white"
                          : "bg-primary-fixed text-[#0055A4]"
                      }`}
                    >
                      2
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`font-card-heading text-card-heading font-medium whitespace-nowrap truncate ${
                          currentStep === 2 ? "text-[#0055A4] font-bold" : "text-[#5A6372]"
                        }`}
                      >
                        Contact &amp; Administrator
                      </span>
                      <span className="font-supporting text-supporting text-[#727783] whitespace-nowrap">
                        {currentStep === 2 ? "In Progress" : "Upcoming"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 h-0.5 bg-[#DDE6DA] -mx-2"></div>

                  {/* Step 3: Review & Submit */}
                  <div
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-space-sm z-10 bg-white pl-space-md cursor-pointer select-none"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-card-heading text-card-heading shrink-0 transition-colors ${
                        currentStep === 3
                          ? "bg-[#0055A4] text-white"
                          : "bg-[#F3F6F0] border border-[#DDE6DA] text-[#727783]"
                      }`}
                    >
                      3
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`font-card-heading text-card-heading font-medium whitespace-nowrap truncate ${
                          currentStep === 3 ? "text-[#0055A4] font-bold" : "text-[#727783]"
                        }`}
                      >
                        Review &amp; Submit
                      </span>
                      <span className="font-supporting text-supporting text-[#727783] whitespace-nowrap">
                        {currentStep === 3 ? "Ready" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Form & Sidebar Grid */}
            <div className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
                {/* ── LEFT COLUMN: Registration Form (8 of 12 cols) ─────────── */}
                <form
                  onSubmit={handleContinue}
                  className="lg:col-span-8 flex flex-col gap-space-xl min-w-0"
                  noValidate
                >
                  {/* SECTION 1: Basic Facility Information */}
                  <div className="bg-white border border-[#DDE6DA] rounded-2xl p-space-xl shadow-sm flex flex-col gap-space-lg">
                    <div className="flex items-start justify-between gap-space-md">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-space-sm">
                          <span className="material-symbols-outlined text-[#0055A4] text-[24px] shrink-0">
                            domain
                          </span>
                          <h2 className="font-headline-sm text-headline-sm text-[#1F2B46] font-bold truncate">
                            Basic Facility Information
                          </h2>
                        </div>
                        <p className="font-supporting text-supporting text-[#5A6372] mt-1">
                          Provide the official institutional details of your hospital or healthcare clinic.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-supporting text-supporting font-semibold uppercase tracking-wider whitespace-nowrap flex-shrink-0">
                        Required 1/3
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                      {/* Facility Name */}
                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label
                          htmlFor="facilityName"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold flex items-center justify-between gap-2"
                        >
                          <span className="truncate">
                            Official Hospital / Clinic Name <span className="text-error">*</span>
                          </span>
                          <span className="font-supporting text-supporting text-[#727783] font-normal whitespace-nowrap flex-shrink-0">
                            Must match legal charter
                          </span>
                        </label>
                        <input
                          id="facilityName"
                          name="facilityName"
                          type="text"
                          value={formData.facilityName}
                          onChange={handleInputChange}
                          placeholder="Enter official facility name"
                          className={`w-full px-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                            errors.facilityName ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                          }`}
                        />
                        {errors.facilityName && (
                          <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.facilityName}
                          </span>
                        )}
                      </div>

                      {/* Facility Type */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="facilityType"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate"
                        >
                          Facility Type <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="facilityType"
                            name="facilityType"
                            value={formData.facilityType}
                            onChange={handleInputChange}
                            className="w-full appearance-none px-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border border-[#DDE6DA] focus:border-[#0055A4] transition-all shadow-inner focus:shadow-md pr-10 cursor-pointer"
                          >
                            <option value="Multispecialty Hospital">Multispecialty Hospital</option>
                            <option value="General Hospital">General Hospital</option>
                            <option value="Specialty Hospital">Specialty Hospital</option>
                            <option value="Primary Care Clinic">Primary Care Clinic</option>
                            <option value="Diagnostic Centre">Diagnostic Centre</option>
                            <option value="Other Healthcare Facility">Other Healthcare Facility</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-3 text-[#727783] pointer-events-none text-[20px] shrink-0">
                            expand_more
                          </span>
                        </div>
                      </div>

                      {/* Facility Registration Number */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="registrationNumber"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate"
                        >
                          Facility Registration Number <span className="text-error">*</span>
                        </label>
                        <input
                          id="registrationNumber"
                          name="registrationNumber"
                          type="text"
                          value={formData.registrationNumber}
                          onChange={handleInputChange}
                          placeholder="Enter registration number"
                          className={`w-full px-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                            errors.registrationNumber ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                          }`}
                        />
                        {errors.registrationNumber && (
                          <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.registrationNumber}
                          </span>
                        )}
                      </div>

                      {/* Year Established */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="yearEstablished"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate"
                        >
                          Year Established <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="yearEstablished"
                            name="yearEstablished"
                            value={formData.yearEstablished}
                            onChange={handleInputChange}
                            className="w-full appearance-none px-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border border-[#DDE6DA] focus:border-[#0055A4] transition-all shadow-inner focus:shadow-md pr-10 cursor-pointer"
                          >
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                            <option value="2021">2021</option>
                            <option value="2020">2020</option>
                            <option value="2015">2015</option>
                            <option value="2014">2014</option>
                            <option value="2010">2010</option>
                            <option value="2005">2005</option>
                            <option value="2000 or earlier">2000 or earlier</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-3 text-[#727783] pointer-events-none text-[20px] shrink-0">
                            calendar_month
                          </span>
                        </div>
                      </div>

                      {/* Facility Website */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="website"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold flex items-center justify-between gap-2"
                        >
                          <span className="truncate">Facility Website</span>
                          <span className="font-supporting text-supporting text-[#727783] font-normal whitespace-nowrap flex-shrink-0">
                            Optional
                          </span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3 text-[#727783] text-[18px] shrink-0">
                            language
                          </span>
                          <input
                            id="website"
                            name="website"
                            type="url"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://example-hospital.org"
                            className={`w-full pl-10 pr-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                              errors.website ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                            }`}
                          />
                        </div>
                        {errors.website && (
                          <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.website}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Logo Upload Area */}
                    <div className="flex flex-col gap-1.5 pt-space-xs">
                      <label className="font-card-heading text-card-heading text-[#1F2B46] font-semibold flex items-center justify-between gap-2">
                        <span className="truncate">Official Facility Emblem or Logo</span>
                        <span className="font-supporting text-supporting text-[#727783] font-normal whitespace-nowrap flex-shrink-0">
                          Supports PNG, JPG, SVG (Max 5MB)
                        </span>
                      </label>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        className="hidden"
                        onChange={handleFileSelect}
                      />

                      {logoPreview ? (
                        /* Uploaded Logo Preview Box */
                        <div className="w-full p-space-lg bg-[#F3F6F0] border border-[#DDE6DA] rounded-2xl flex items-center justify-between gap-space-md">
                          <div className="flex items-center gap-space-md min-w-0">
                            <div className="w-16 h-16 rounded-xl bg-white border border-[#DDE6DA] flex items-center justify-center p-2 shadow-sm shrink-0 overflow-hidden">
                              <Image
                                src={logoPreview}
                                alt="Facility Emblem Preview"
                                width={60}
                                height={60}
                                className="w-full h-full object-contain"
                                unoptimized
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate">
                                {logoFile?.name || "facility-logo.png"}
                              </span>
                              <span className="font-supporting text-supporting text-[#5A6372]">
                                {logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB` : "Uploaded logo"} • Ready for registration
                              </span>
                              <span className="font-supporting text-supporting text-tertiary font-semibold flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-[14px]">verified</span>
                                Verified format
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-space-sm shrink-0">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-lg bg-white border border-[#DDE6DA] text-[#0055A4] font-button-label text-supporting font-semibold hover:bg-[#E2E8DE] transition-colors cursor-pointer"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="p-1.5 rounded-lg text-error hover:bg-error-container transition-colors cursor-pointer"
                              title="Remove logo"
                            >
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Empty Upload Drag & Drop Area */
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          className={`w-full p-space-xl bg-[#F3F6F0] hover:bg-[#E8EFE5] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${
                            isDragging
                              ? "border-[#0055A4] bg-[#E8EFE5]"
                              : "border-[#DDE6DA] hover:border-[#0055A4]"
                          }`}
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white border border-[#DDE6DA] group-hover:scale-105 transition-transform flex items-center justify-center text-[#0055A4] shadow-sm mb-space-sm shrink-0">
                            <span className="material-symbols-outlined text-[28px]">
                              add_photo_alternate
                            </span>
                          </div>
                          <span className="font-card-heading text-card-heading text-[#0055A4] font-semibold">
                            Drag and drop facility logo here, or browse files
                          </span>
                          <span className="font-supporting text-supporting text-[#5A6372] mt-1">
                            Supports PNG, JPG, and SVG (Maximum file size: 5MB)
                          </span>
                        </div>
                      )}

                      {logoError && (
                        <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-[14px]">error</span>
                          {logoError}
                        </span>
                      )}
                    </div>

                    {/* Facility Description */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="overview"
                        className="font-card-heading text-card-heading text-[#1F2B46] font-semibold flex items-center justify-between gap-2"
                      >
                        <span className="truncate">Facility Overview &amp; Infrastructure</span>
                        <span
                          className={`font-supporting text-supporting font-normal whitespace-nowrap flex-shrink-0 ${
                            formData.overview.length > 480 ? "text-error font-semibold" : "text-[#727783]"
                          }`}
                        >
                          {formData.overview.length} / 500 characters
                        </span>
                      </label>
                      <textarea
                        id="overview"
                        name="overview"
                        maxLength={500}
                        rows={3}
                        value={formData.overview}
                        onChange={handleInputChange}
                        placeholder="Briefly describe the healthcare services provided, specialty wings, bed capacity, and emergency care facilities."
                        className="w-full p-space-md bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border border-[#DDE6DA] focus:border-[#0055A4] transition-all shadow-inner focus:shadow-md resize-none"
                      />
                    </div>
                  </div>

                  {/* SECTION 2: Location & Contact Details */}
                  <div className="bg-white border border-[#DDE6DA] rounded-2xl p-space-xl shadow-sm flex flex-col gap-space-lg">
                    <div className="flex items-start justify-between gap-space-md">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-space-sm">
                          <span className="material-symbols-outlined text-[#0055A4] text-[24px] shrink-0">
                            location_on
                          </span>
                          <h2 className="font-headline-sm text-headline-sm text-[#1F2B46] font-bold truncate">
                            Location &amp; Contact Details
                          </h2>
                        </div>
                        <p className="font-supporting text-supporting text-[#5A6372] mt-1">
                          Official physical address and primary communications dispatch center.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-[#0055A4] font-supporting text-supporting font-semibold uppercase tracking-wider whitespace-nowrap flex-shrink-0">
                        Required 2/3
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                      {/* Country */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate">
                          Country <span className="text-error">*</span>
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={formData.country}
                          className="w-full px-space-md py-2.5 bg-[#E8EFE5] border border-[#DDE6DA] rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none cursor-not-allowed select-none"
                        />
                      </div>

                      {/* State / Province */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="state"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate"
                        >
                          State / Province <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full appearance-none px-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border border-[#DDE6DA] focus:border-[#0055A4] transition-all shadow-inner focus:shadow-md pr-10 cursor-pointer"
                          >
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Delhi NCR">Delhi NCR</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Kerala">Kerala</option>
                            <option value="Telangana">Telangana</option>
                            <option value="West Bengal">West Bengal</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-3 text-[#727783] pointer-events-none text-[20px] shrink-0">
                            expand_more
                          </span>
                        </div>
                      </div>

                      {/* City */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="city"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate"
                        >
                          City <span className="text-error">*</span>
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          className={`w-full px-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                            errors.city ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                          }`}
                        />
                        {errors.city && (
                          <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.city}
                          </span>
                        )}
                      </div>

                      {/* Postal / PIN Code */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="pincode"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate"
                        >
                          Postal / PIN Code <span className="text-error">*</span>
                        </label>
                        <input
                          id="pincode"
                          name="pincode"
                          type="text"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="PIN Code"
                          className={`w-full px-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                            errors.pincode ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                          }`}
                        />
                        {errors.pincode && (
                          <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.pincode}
                          </span>
                        )}
                      </div>

                      {/* Complete Street Address */}
                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label
                          htmlFor="streetAddress"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate"
                        >
                          Complete Street Address <span className="text-error">*</span>
                        </label>
                        <input
                          id="streetAddress"
                          name="streetAddress"
                          type="text"
                          value={formData.streetAddress}
                          onChange={handleInputChange}
                          placeholder="Street name, building numbers, landmark"
                          className={`w-full px-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                            errors.streetAddress ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                          }`}
                        />
                        {errors.streetAddress && (
                          <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.streetAddress}
                          </span>
                        )}
                      </div>

                      {/* Official Contact Desk */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="contactDesk"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate"
                        >
                          Official Contact Desk <span className="text-error">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3 text-[#727783] text-[18px] shrink-0">
                            call
                          </span>
                          <input
                            id="contactDesk"
                            name="contactDesk"
                            type="tel"
                            value={formData.contactDesk}
                            onChange={handleInputChange}
                            placeholder="+91..."
                            className={`w-full pl-10 pr-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                              errors.contactDesk ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                            }`}
                          />
                        </div>
                        {errors.contactDesk && (
                          <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.contactDesk}
                          </span>
                        )}
                      </div>

                      {/* Official Registry Email */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="registryEmail"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate"
                        >
                          Official Registry Email <span className="text-error">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3 text-[#727783] text-[18px] shrink-0">
                            mail
                          </span>
                          <input
                            id="registryEmail"
                            name="registryEmail"
                            type="email"
                            value={formData.registryEmail}
                            onChange={handleInputChange}
                            placeholder="admin@hospital.org"
                            className={`w-full pl-10 pr-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                              errors.registryEmail ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                            }`}
                          />
                        </div>
                        {errors.registryEmail && (
                          <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.registryEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Authorized Hospital Administrator */}
                  <div className="bg-white border border-[#DDE6DA] rounded-2xl p-space-xl shadow-sm flex flex-col gap-space-lg">
                    <div className="flex items-start justify-between gap-space-md">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-space-sm">
                          <span className="material-symbols-outlined text-[#0055A4] text-[24px] shrink-0">
                            verified_user
                          </span>
                          <h2 className="font-headline-sm text-headline-sm text-[#1F2B46] font-bold truncate">
                            Authorized Administrator
                          </h2>
                        </div>
                        <p className="font-supporting text-supporting text-[#5A6372] mt-1">
                          Identify the executive leader authorized to represent and administer this institutional node.
                        </p>
                      </div>
                      {/* CRITICAL: whitespace-nowrap and flex-shrink-0 to guarantee "REQUIRED 3/3" NEVER splits onto two lines */}
                      <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-supporting text-supporting font-semibold uppercase tracking-wider whitespace-nowrap flex-shrink-0">
                        Required 3/3
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                      {/* Full Legal Name */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="adminName"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate"
                        >
                          Full Legal Name <span className="text-error">*</span>
                        </label>
                        <input
                          id="adminName"
                          name="adminName"
                          type="text"
                          value={formData.adminName}
                          onChange={handleInputChange}
                          placeholder="e.g. Dr. Rajeshwar Kulkarni"
                          className={`w-full px-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                            errors.adminName ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                          }`}
                        />
                        {errors.adminName && (
                          <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.adminName}
                          </span>
                        )}
                      </div>

                      {/* Institutional Designation */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="adminDesignation"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate"
                        >
                          Institutional Designation <span className="text-error">*</span>
                        </label>
                        <input
                          id="adminDesignation"
                          name="adminDesignation"
                          type="text"
                          value={formData.adminDesignation}
                          onChange={handleInputChange}
                          placeholder="Designation"
                          className={`w-full px-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                            errors.adminDesignation ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                          }`}
                        />
                        {errors.adminDesignation && (
                          <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.adminDesignation}
                          </span>
                        )}
                      </div>

                      {/* Official Work Email */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="adminEmail"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate"
                        >
                          Official Work Email <span className="text-error">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3 text-[#727783] text-[18px] shrink-0">
                            alternate_email
                          </span>
                          <input
                            id="adminEmail"
                            name="adminEmail"
                            type="email"
                            value={formData.adminEmail}
                            onChange={handleInputChange}
                            placeholder="name@hospital.org"
                            className={`w-full pl-10 pr-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                              errors.adminEmail ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                            }`}
                          />
                        </div>
                        {errors.adminEmail && (
                          <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.adminEmail}
                          </span>
                        )}
                      </div>

                      {/* Direct Mobile / Contact */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="adminPhone"
                          className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate"
                        >
                          Direct Mobile / Contact <span className="text-error">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3 text-[#727783] text-[18px] shrink-0">
                            phone_iphone
                          </span>
                          <input
                            id="adminPhone"
                            name="adminPhone"
                            type="tel"
                            value={formData.adminPhone}
                            onChange={handleInputChange}
                            placeholder="+91..."
                            className={`w-full pl-10 pr-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                              errors.adminPhone ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                            }`}
                          />
                        </div>
                        {errors.adminPhone && (
                          <span className="text-error font-supporting text-supporting flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.adminPhone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Legal Notice Banner */}
                    <div className="bg-[#EBF3FC] border border-[#DDE6DA] rounded-xl p-space-md flex items-start gap-space-md">
                      <span className="material-symbols-outlined text-[#0055A4] text-[22px] shrink-0 mt-0.5">
                        policy
                      </span>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-card-heading text-card-heading text-[#0055A4] font-bold truncate">
                          Legal Authorization Notice
                        </span>
                        <p className="font-supporting text-supporting text-[#3B4D0D] leading-relaxed">
                          The registering administrator must hold legal power of attorney or board authority to bind the healthcare institution to MedKnot Connected Care terms. Verification credentials and security token handshakes will be delivered strictly to the verified official institutional domain email.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sticky / Bottom Action Row */}
                  <div className="bg-white border border-[#DDE6DA] rounded-2xl p-space-md shadow-sm flex flex-wrap items-center justify-between gap-space-md">
                    <Link
                      href="/dashboard"
                      className="px-space-lg py-2.5 rounded-xl bg-[#F3F6F0] hover:bg-[#E2E8DE] border border-[#DDE6DA] text-[#1F2B46] font-button-label text-button-label transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px] shrink-0">arrow_back</span>
                      <span className="whitespace-nowrap">Back to Dashboard</span>
                    </Link>

                    <div className="flex items-center gap-space-md shrink-0">
                      <button
                        onClick={handleSaveDraft}
                        type="button"
                        className="px-space-lg py-2.5 rounded-xl bg-[#F3F6F0] hover:bg-[#E2E8DE] border border-[#DDE6DA] text-[#0055A4] font-button-label text-button-label transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        Save Draft
                      </button>
                      <button
                        type="submit"
                        className="px-space-xl py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#00478a] text-white font-button-label text-button-label shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-98 shrink-0 whitespace-nowrap"
                      >
                        <span>Continue to Review &amp; Documents</span>
                        <span className="material-symbols-outlined text-[20px] shrink-0">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* ── RIGHT COLUMN: Supporting Verification & Guidance (4 of 12 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-space-lg min-w-0">
                  {/* Card 1: Verification Checklist */}
                  <div className="bg-white border border-[#DDE6DA] rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between gap-space-sm">
                      <span className="font-card-heading text-card-heading text-[#1F2B46] font-bold truncate">
                        Verification Checklist
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-supporting text-supporting font-semibold uppercase tracking-wider whitespace-nowrap flex-shrink-0">
                        STAGE 1
                      </span>
                    </div>
                    <p className="font-supporting text-supporting text-[#5A6372]">
                      Prepare digital scans of these institutional credentials. You will submit them in the final registration step.
                    </p>

                    <div className="flex flex-col gap-space-sm pt-space-xs">
                      {/* Item 1 */}
                      <div className="p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] flex items-start gap-space-sm">
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
                      <div className="p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] flex items-start gap-space-sm">
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
                      <div className="p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] flex items-start gap-space-sm opacity-90">
                        <div className="w-6 h-6 rounded-full bg-[#E2E8DE] text-[#727783] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
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
                    <div className="p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] text-[#1F2B46] font-supporting text-supporting flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#0055A4] text-[18px] shrink-0 mt-0.5">
                        speed
                      </span>
                      <span>
                        Identity vetting SLA: <strong>24–48 business hours</strong> upon document delivery.
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Why Register with MedKnot? */}
                  <div className="bg-white border border-[#DDE6DA] rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
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

                      <div className="w-full h-px bg-[#DDE6DA]"></div>

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

                      <div className="w-full h-px bg-[#DDE6DA]"></div>

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

                  {/* Card 3: Need Registration Assistance? */}
                  <div className="rounded-2xl p-space-lg bg-[#F3F6F0] border border-[#DDE6DA] shadow-sm flex flex-col gap-space-sm">
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
              </div>
            </div>
          </div>
      </main>

      {/* ── REVIEW & CONFIRMATION MODAL ──────────────────────────────── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#DDE6DA] rounded-2xl max-w-2xl w-full p-space-xl shadow-2xl flex flex-col gap-space-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#DDE6DA] pb-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed text-[#0055A4] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">verified</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-[#1F2B46] font-bold">
                    Review Facility Registration
                  </h3>
                  <p className="font-supporting text-supporting text-[#5A6372]">
                    Verify the institutional node information prior to document vetting.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-[#727783] hover:text-[#1F2B46] p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-space-md text-body-md text-[#1F2B46]">
              {/* Facility Summary */}
              <div className="p-space-md bg-[#F3F6F0] border border-[#DDE6DA] rounded-xl flex flex-col gap-1.5">
                <span className="font-supporting text-supporting uppercase tracking-wider text-[#0055A4] font-bold">
                  Facility Overview
                </span>
                <div className="flex justify-between">
                  <span className="text-[#5A6372]">Name:</span>
                  <span className="font-semibold text-right">{formData.facilityName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6372]">Type:</span>
                  <span className="font-semibold text-right">{formData.facilityType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6372]">Registration Number:</span>
                  <span className="font-semibold text-right">{formData.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6372]">Established:</span>
                  <span className="font-semibold text-right">{formData.yearEstablished}</span>
                </div>
              </div>

              {/* Location Summary */}
              <div className="p-space-md bg-[#F3F6F0] border border-[#DDE6DA] rounded-xl flex flex-col gap-1.5">
                <span className="font-supporting text-supporting uppercase tracking-wider text-[#0055A4] font-bold">
                  Location &amp; Dispatch
                </span>
                <div className="flex justify-between">
                  <span className="text-[#5A6372]">Address:</span>
                  <span className="font-semibold text-right max-w-sm">{formData.streetAddress}, {formData.city}, {formData.state} - {formData.pincode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6372]">Registry Email:</span>
                  <span className="font-semibold text-right">{formData.registryEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6372]">Contact Desk:</span>
                  <span className="font-semibold text-right">{formData.contactDesk}</span>
                </div>
              </div>

              {/* Administrator Summary */}
              <div className="p-space-md bg-[#F3F6F0] border border-[#DDE6DA] rounded-xl flex flex-col gap-1.5">
                <span className="font-supporting text-supporting uppercase tracking-wider text-[#0055A4] font-bold">
                  Authorized Administrator
                </span>
                <div className="flex justify-between">
                  <span className="text-[#5A6372]">Administrator:</span>
                  <span className="font-semibold text-right">{formData.adminName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6372]">Designation:</span>
                  <span className="font-semibold text-right">{formData.adminDesignation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6372]">Work Email:</span>
                  <span className="font-semibold text-right">{formData.adminEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6372]">Direct Contact:</span>
                  <span className="font-semibold text-right">{formData.adminPhone}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#DDE6DA] pt-space-md flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-space-lg py-2 rounded-xl bg-[#F3F6F0] hover:bg-[#E2E8DE] border border-[#DDE6DA] text-[#1F2B46] font-button-label transition-colors"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewModal(false);
                  setToastMessage("Stage 1 registration saved. Ready for Step 2 Document Upload!");
                  setCurrentStep(3);
                }}
                className="px-space-xl py-2 rounded-xl bg-[#0055A4] hover:bg-[#00478a] text-white font-button-label shadow-sm transition-all"
              >
                Confirm &amp; Proceed to Stage 2
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
