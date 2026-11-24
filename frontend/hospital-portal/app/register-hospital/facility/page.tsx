"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RegistrationLayout from "@/components/registration/RegistrationLayout";
import { useRegistration } from "@/components/registration/RegistrationContext";

export default function Step1FacilityPage() {
  const router = useRouter();
  const { state, updateFacilityInfo, setLogo, saveDraft } = useRegistration();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Field change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateFacilityInfo({ [name]: value });
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Logo file processing
  const processLogoFile = (file: File) => {
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

    const objectUrl = URL.createObjectURL(file);
    setLogo(file, objectUrl);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processLogoFile(e.dataTransfer.files[0]);
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
      processLogoFile(e.target.files[0]);
    }
  };

  const removeLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (state.logoPreview) {
      URL.revokeObjectURL(state.logoPreview);
    }
    setLogo(null, null);
    setLogoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!state.facilityName.trim()) {
      newErrors.facilityName = "Official Hospital / Clinic Name is required.";
    }
    if (!state.registrationNumber.trim()) {
      newErrors.registrationNumber = "Facility Registration Number is required.";
    }
    if (state.website.trim() && !/^https?:\/\/.+/i.test(state.website.trim())) {
      newErrors.website = "Website URL must start with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      saveDraft();
      router.push("/register-hospital/administrator");
    }
  };

  return (
    <RegistrationLayout
      currentStep={1}
      title="Facility Information"
      subtitle="Provide the official institutional identity, charter, and operational overview of your healthcare facility."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-xl">
        {/* Main Card: Basic Facility Information */}
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
                value={state.facilityName}
                onChange={handleChange}
                placeholder="Enter official facility name"
                className={`w-full px-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                  errors.facilityName
                    ? "border-error ring-1 ring-error"
                    : "border-[#DDE6DA] focus:border-[#0055A4]"
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
                  value={state.facilityType}
                  onChange={handleChange}
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

            {/* Registration Number */}
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
                value={state.registrationNumber}
                onChange={handleChange}
                placeholder="Enter registration number"
                className={`w-full px-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                  errors.registrationNumber
                    ? "border-error ring-1 ring-error"
                    : "border-[#DDE6DA] focus:border-[#0055A4]"
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
                  value={state.yearEstablished}
                  onChange={handleChange}
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
                  value={state.website}
                  onChange={handleChange}
                  placeholder="https://example-hospital.org"
                  className={`w-full pl-10 pr-space-md py-2.5 bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                    errors.website
                      ? "border-error ring-1 ring-error"
                      : "border-[#DDE6DA] focus:border-[#0055A4]"
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

            {state.logoPreview ? (
              <div className="w-full p-space-lg bg-[#F3F6F0] border border-[#DDE6DA] rounded-2xl flex items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="w-16 h-16 rounded-xl bg-white border border-[#DDE6DA] flex items-center justify-center p-2 shadow-sm shrink-0 overflow-hidden">
                    <Image
                      src={state.logoPreview}
                      alt="Facility Emblem Preview"
                      width={60}
                      height={60}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-card-heading text-card-heading text-[#1F2B46] font-semibold truncate">
                      {state.logoFile?.name || "facility-logo.png"}
                    </span>
                    <span className="font-supporting text-supporting text-[#5A6372]">
                      {state.logoFile ? `${(state.logoFile.size / 1024).toFixed(1)} KB` : "Uploaded emblem"} • Ready for registration
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

          {/* Facility Overview & Infrastructure */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="overview"
              className="font-card-heading text-card-heading text-[#1F2B46] font-semibold flex items-center justify-between gap-2"
            >
              <span className="truncate">Facility Overview &amp; Infrastructure</span>
              <span
                className={`font-supporting text-supporting font-normal whitespace-nowrap flex-shrink-0 ${
                  state.overview.length > 480 ? "text-error font-semibold" : "text-[#727783]"
                }`}
              >
                {state.overview.length} / 500 characters
              </span>
            </label>
            <textarea
              id="overview"
              name="overview"
              maxLength={500}
              rows={3}
              value={state.overview}
              onChange={handleChange}
              placeholder="Briefly describe the healthcare services provided, specialty wings, bed capacity, and emergency care facilities."
              className="w-full p-space-md bg-[#F3F6F0] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border border-[#DDE6DA] focus:border-[#0055A4] transition-all shadow-inner focus:shadow-md resize-none"
            />
          </div>
        </div>

        {/* Sticky Action Row */}
        <div className="bg-white border border-[#DDE6DA] rounded-2xl p-space-md shadow-sm flex flex-wrap items-center justify-between gap-space-md">
          <Link
            href="/login"
            className="px-space-lg py-2.5 rounded-xl bg-[#F3F6F0] hover:bg-[#E2E8DE] border border-[#DDE6DA] text-[#1F2B46] font-button-label text-button-label transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">arrow_back</span>
            <span className="whitespace-nowrap">Back to Sign In</span>
          </Link>

          <div className="flex items-center gap-space-md shrink-0">
            <button
              onClick={() => saveDraft()}
              type="button"
              className="px-space-lg py-2.5 rounded-xl bg-[#F3F6F0] hover:bg-[#E2E8DE] border border-[#DDE6DA] text-[#0055A4] font-button-label text-button-label transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="px-space-xl py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#00478a] text-white font-button-label text-button-label shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-98 shrink-0 whitespace-nowrap"
            >
              <span>Continue to Contact &amp; Administrator</span>
              <span className="material-symbols-outlined text-[20px] shrink-0">arrow_forward</span>
            </button>
          </div>
        </div>
      </form>
    </RegistrationLayout>
  );
}
