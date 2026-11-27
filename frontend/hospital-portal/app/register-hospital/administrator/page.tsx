"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RegistrationLayout from "@/components/registration/RegistrationLayout";
import { useRegistration } from "@/components/registration/RegistrationContext";

export default function Step2AdministratorPage() {
  const router = useRouter();
  const { state, updateContactAndAdmin, saveDraft } = useRegistration();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      updateContactAndAdmin({ [name]: checked });
    } else {
      updateContactAndAdmin({ [name]: value });
    }

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Location & Contact
    if (!state.city.trim()) {
      newErrors.city = "City is required.";
    }
    if (!state.pincode.trim()) {
      newErrors.pincode = "Postal / PIN Code is required.";
    } else if (!/^[0-9\s-]{4,10}$/.test(state.pincode.trim())) {
      newErrors.pincode = "Enter a valid postal / PIN code.";
    }
    if (!state.streetAddress.trim()) {
      newErrors.streetAddress = "Complete Street Address is required.";
    }
    if (!state.contactDesk.trim()) {
      newErrors.contactDesk = "Official Contact Desk is required.";
    }
    if (!state.registryEmail.trim()) {
      newErrors.registryEmail = "Official Registry Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.registryEmail.trim())) {
      newErrors.registryEmail = "Enter a valid registry email address.";
    }

    // Authorized Administrator
    if (!state.adminName.trim()) {
      newErrors.adminName = "Administrator Full Legal Name is required.";
    }
    if (!state.adminDesignation.trim()) {
      newErrors.adminDesignation = "Institutional Designation is required.";
    }
    if (!state.adminEmail.trim()) {
      newErrors.adminEmail = "Official Work Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.adminEmail.trim())) {
      newErrors.adminEmail = "Enter a valid official email address.";
    }
    if (!state.adminPhone.trim()) {
      newErrors.adminPhone = "Direct Mobile / Contact is required.";
    }

    // If applicant is different, validate applicant details
    if (state.isApplicantDifferent) {
      if (!state.applicantName.trim()) {
        newErrors.applicantName = "Applicant Name is required.";
      }
      if (!state.applicantEmail.trim()) {
        newErrors.applicantEmail = "Applicant Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.applicantEmail.trim())) {
        newErrors.applicantEmail = "Enter a valid applicant email.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      saveDraft();
      router.push("/register-hospital/documents");
    }
  };

  return (
    <RegistrationLayout
      currentStep={2}
      title="Contact & Administrator"
      subtitle="Identify the physical communications dispatch center and executive leadership authorizing this hospital."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-xl">
        {/* SECTION A: Location & Contact Details */}
        <div className="bg-white border border-[#C5D2C0] rounded-2xl p-space-xl shadow-[0_3px_10px_rgba(31,43,70,0.10)] flex flex-col gap-space-lg">
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
                value={state.country}
                className="w-full px-space-md py-2.5 bg-[#E1E9DC] border border-[#AEBEAA] rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none cursor-not-allowed select-none"
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
                  value={state.state}
                  onChange={handleChange}
                  className="w-full appearance-none px-space-md py-2.5 bg-[#F3F7F2] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border border-[#AEBEAA] focus:border-[#0055A4] transition-all shadow-inner focus:shadow-md pr-10 cursor-pointer"
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
                <span className="material-symbols-outlined absolute right-3 top-3 text-[#667085] pointer-events-none text-[20px] shrink-0">
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
                value={state.city}
                onChange={handleChange}
                placeholder="City"
                className={`w-full px-space-md py-2.5 bg-[#F3F7F2] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                  errors.city ? "border-error ring-1 ring-error" : "border-[#AEBEAA] focus:border-[#0055A4]"
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
                value={state.pincode}
                onChange={handleChange}
                placeholder="PIN Code"
                className={`w-full px-space-md py-2.5 bg-[#F3F7F2] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                  errors.pincode ? "border-error ring-1 ring-error" : "border-[#AEBEAA] focus:border-[#0055A4]"
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
                value={state.streetAddress}
                onChange={handleChange}
                placeholder="Street name, building numbers, landmark"
                className={`w-full px-space-md py-2.5 bg-[#F3F7F2] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                  errors.streetAddress ? "border-error ring-1 ring-error" : "border-[#AEBEAA] focus:border-[#0055A4]"
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
                <span className="material-symbols-outlined absolute left-3 text-[#667085] text-[18px] shrink-0">
                  call
                </span>
                <input
                  id="contactDesk"
                  name="contactDesk"
                  type="tel"
                  value={state.contactDesk}
                  onChange={handleChange}
                  placeholder="+91..."
                  className={`w-full pl-10 pr-space-md py-2.5 bg-[#F3F7F2] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                    errors.contactDesk ? "border-error ring-1 ring-error" : "border-[#AEBEAA] focus:border-[#0055A4]"
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
                <span className="material-symbols-outlined absolute left-3 text-[#667085] text-[18px] shrink-0">
                  mail
                </span>
                <input
                  id="registryEmail"
                  name="registryEmail"
                  type="email"
                  value={state.registryEmail}
                  onChange={handleChange}
                  placeholder="admin@hospital.org"
                  className={`w-full pl-10 pr-space-md py-2.5 bg-[#F3F7F2] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                    errors.registryEmail ? "border-error ring-1 ring-error" : "border-[#AEBEAA] focus:border-[#0055A4]"
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

        {/* SECTION B: Authorized Administrator (First Hospital Admin) */}
        <div className="bg-white border border-[#C5D2C0] rounded-2xl p-space-xl shadow-[0_3px_10px_rgba(31,43,70,0.10)] flex flex-col gap-space-lg">
          <div className="flex items-start justify-between gap-space-md">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="material-symbols-outlined text-[#0055A4] text-[24px] shrink-0">
                  verified_user
                </span>
                <h2 className="font-headline-sm text-headline-sm text-[#1F2B46] font-bold truncate">
                  Authorized Administrator
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EBF3FC] text-[#0055A4] font-supporting text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                  First Hospital Admin
                </span>
              </div>
              <p className="font-supporting text-supporting text-[#5A6372] mt-1">
                The designated executive leader who will receive the initial portal activation invitation upon approval.
              </p>
            </div>
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
                value={state.adminName}
                onChange={handleChange}
                placeholder="e.g. Dr. Rajeshwar Kulkarni"
                className={`w-full px-space-md py-2.5 bg-[#F3F7F2] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                  errors.adminName ? "border-error ring-1 ring-error" : "border-[#AEBEAA] focus:border-[#0055A4]"
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
                value={state.adminDesignation}
                onChange={handleChange}
                placeholder="Designation"
                className={`w-full px-space-md py-2.5 bg-[#F3F7F2] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                  errors.adminDesignation ? "border-error ring-1 ring-error" : "border-[#AEBEAA] focus:border-[#0055A4]"
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
                <span className="material-symbols-outlined absolute left-3 text-[#667085] text-[18px] shrink-0">
                  alternate_email
                </span>
                <input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  value={state.adminEmail}
                  onChange={handleChange}
                  placeholder="name@hospital.org"
                  className={`w-full pl-10 pr-space-md py-2.5 bg-[#F3F7F2] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                    errors.adminEmail ? "border-error ring-1 ring-error" : "border-[#AEBEAA] focus:border-[#0055A4]"
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
                <span className="material-symbols-outlined absolute left-3 text-[#667085] text-[18px] shrink-0">
                  phone_iphone
                </span>
                <input
                  id="adminPhone"
                  name="adminPhone"
                  type="tel"
                  value={state.adminPhone}
                  onChange={handleChange}
                  placeholder="+91..."
                  className={`w-full pl-10 pr-space-md py-2.5 bg-[#F3F7F2] focus:bg-white rounded-xl text-[#1F2B46] font-body-md text-body-md outline-none border transition-all shadow-inner focus:shadow-md ${
                    errors.adminPhone ? "border-error ring-1 ring-error" : "border-[#AEBEAA] focus:border-[#0055A4]"
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

          {/* Applicant Identity Distinction Checkbox */}
          <div className="p-space-md rounded-xl bg-[#E3EBDD] border border-[#C8D6C3] flex flex-col gap-space-sm">
            <label className="flex items-start gap-space-sm cursor-pointer select-none">
              <input
                type="checkbox"
                name="isApplicantDifferent"
                checked={state.isApplicantDifferent}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 text-[#0055A4] rounded border-[#AEBEAA] focus:ring-[#0055A4] cursor-pointer"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-card-heading text-body-md text-[#1F2B46] font-semibold">
                  I am submitting this registration on behalf of the Authorized Administrator
                </span>
                <span className="font-supporting text-supporting text-[#5A6372]">
                  Check this if you are a clinic manager, IT coordinator, or administrative assistant applying on behalf of the executive leader.
                </span>
              </div>
            </label>

            {state.isApplicantDifferent && (
              <div className="pt-space-sm border-t border-[#C8D6C3] grid grid-cols-1 md:grid-cols-3 gap-space-md animate-in fade-in">
                <div className="flex flex-col gap-1">
                  <label className="font-supporting text-supporting text-[#1F2B46] font-semibold">
                    Applicant Full Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    name="applicantName"
                    value={state.applicantName}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-3 py-2 bg-white rounded-lg text-sm border border-[#AEBEAA] focus:border-[#0055A4] outline-none"
                  />
                  {errors.applicantName && (
                    <span className="text-error text-xs">{errors.applicantName}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-supporting text-supporting text-[#1F2B46] font-semibold">
                    Applicant Email <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    name="applicantEmail"
                    value={state.applicantEmail}
                    onChange={handleChange}
                    placeholder="your.email@hospital.org"
                    className="w-full px-3 py-2 bg-white rounded-lg text-sm border border-[#AEBEAA] focus:border-[#0055A4] outline-none"
                  />
                  {errors.applicantEmail && (
                    <span className="text-error text-xs">{errors.applicantEmail}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-supporting text-supporting text-[#1F2B46] font-semibold">
                    Applicant Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="applicantPhone"
                    value={state.applicantPhone}
                    onChange={handleChange}
                    placeholder="+91..."
                    className="w-full px-3 py-2 bg-white rounded-lg text-sm border border-[#AEBEAA] focus:border-[#0055A4] outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Legal Notice Banner */}
          <div className="bg-[#EBF3FC] border border-[#C8D6C3] rounded-xl p-space-md flex items-start gap-space-md">
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

        {/* Sticky Action Row */}
        <div className="bg-white border border-[#C5D2C0] rounded-2xl p-space-md shadow-[0_3px_10px_rgba(31,43,70,0.10)] flex flex-wrap items-center justify-between gap-space-md">
          <Link
            href="/register-hospital/facility"
            className="px-space-lg py-2.5 rounded-xl bg-[#E3EBDD] hover:bg-[#D5E0D2] border border-[#C8D6C3] text-[#1F2B46] font-button-label text-button-label transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">arrow_back</span>
            <span className="whitespace-nowrap">Back to Facility Information</span>
          </Link>

          <div className="flex items-center gap-space-md shrink-0">
            <button
              onClick={() => saveDraft()}
              type="button"
              className="px-space-lg py-2.5 rounded-xl bg-[#E3EBDD] hover:bg-[#D5E0D2] border border-[#C8D6C3] text-[#0055A4] font-button-label text-button-label transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="px-space-xl py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#00478a] text-white font-button-label text-button-label shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-98 shrink-0 whitespace-nowrap"
            >
              <span>Continue to Documents &amp; Verification</span>
              <span className="material-symbols-outlined text-[20px] shrink-0">arrow_forward</span>
            </button>
          </div>
        </div>
      </form>
    </RegistrationLayout>
  );
}
