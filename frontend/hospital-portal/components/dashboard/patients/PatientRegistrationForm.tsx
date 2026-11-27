"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserSession, DEFAULT_ADMIN, clearClientSession, getClientSession } from "@/lib/auth";
import { PatientService } from "@/lib/patients/patient-service";
import { CreatePatientInput, PatientGender, BloodGroup } from "@/lib/patients/types";

interface PatientRegistrationFormProps {
  initialUser?: UserSession;
}

export default function PatientRegistrationForm({ initialUser }: PatientRegistrationFormProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  // Session verification
  useEffect(() => {
    if (!initialUser && !getClientSession()) {
      router.push("/login");
    }
  }, [initialUser, router]);

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // Form State
  const [formData, setFormData] = useState<CreatePatientInput>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "Female",
    bloodGroup: "Unknown",
    phoneNumber: "",
    email: "",
    address: "",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "",
    emergencyContactName: "",
    emergencyContactRelation: "Spouse",
    emergencyContactPhone: "",
    knownAllergies: "",
    medicalConditions: "",
    registrationNotes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errs.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      errs.lastName = "Last name is required.";
    }

    if (!formData.dateOfBirth) {
      errs.dateOfBirth = "Date of birth is required.";
    } else {
      const birth = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birth > today) {
        errs.dateOfBirth = "Date of birth cannot be in the future.";
      }
    }

    if (!formData.phoneNumber.trim()) {
      errs.phoneNumber = "Phone number is required.";
    } else if (formData.phoneNumber.trim().length < 8) {
      errs.phoneNumber = "Enter a valid phone number (minimum 8 digits).";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Enter a valid email address.";
    }

    if (!formData.address.trim()) {
      errs.address = "Street address is required.";
    }

    if (!formData.city.trim()) {
      errs.city = "City is required.";
    }

    if (!formData.postalCode.trim()) {
      errs.postalCode = "Postal code / PIN code is required.";
    }

    if (!formData.emergencyContactName.trim()) {
      errs.emergencyContactName = "Emergency contact name is required.";
    }

    if (!formData.emergencyContactPhone.trim()) {
      errs.emergencyContactPhone = "Emergency contact phone is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmedSubmit = () => {
    setIsSubmitting(true);
    try {
      const { facilityRecord } = PatientService.createPatient(formData);
      setIsConfirmModalOpen(false);
      // Navigate to newly created patient record
      router.push(`/dashboard/patients/${facilityRecord.facilityPatientId}?created=true`);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-w-0 flex-1 bg-transparent text-[#1F2B46] font-sans antialiased flex flex-col">
      {/* Main Content */}
      <main className="w-full min-w-0 p-4 md:p-8 flex-1">
        <div className="w-full min-w-0 space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#5A6372]">
            <Link href="/dashboard" className="hover:text-[#0055A4] flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-sm">home</span>
              <span>Home</span>
            </Link>
            <span>/</span>
            <Link href="/dashboard/patients" className="hover:text-[#0055A4] transition-colors">
              Patients
            </Link>
            <span>/</span>
            <span className="text-[#1F2B46] font-semibold">New Patient Registration</span>
          </nav>

          {/* Heading Bar */}
          <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-[#E7F0FF] text-[#0055A4] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">person_add</span>
                </span>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#1F2B46]">Register New Patient</h1>
                  <p className="text-xs text-[#5A6372] mt-0.5">
                    Enroll a patient into St. Jude Medical Center (Campus North) care registry
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#E3EBDD] text-[#2D382B] border border-[#C8D6C3]">
                <span className="material-symbols-outlined text-xs text-[#0055A4]">domain</span>
                <span>Facility Isolated Record</span>
              </span>
            </div>
          </div>

          {/* Compliance & Data Isolation Notice */}
          <div className="p-4 bg-[#E3EBDD] border border-[#C8D6C3] rounded-xl text-xs text-[#5A6372] flex items-start gap-3">
            <span className="material-symbols-outlined text-[#0055A4] text-lg shrink-0 mt-0.5">info</span>
            <div className="leading-relaxed">
              <span className="font-semibold text-[#1F2B46]">Facility Scope Notice:</span> This patient record will be
              registered specifically under St. Jude Medical Center (Campus North). Registering a patient with one
              facility does not grant automatic access to patient records from external health systems or independent
              facilities without explicit consent and digital verification.
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleOpenConfirm} className="space-y-6">
            {/* Section A: Personal Information */}
            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#C8D6C3] pb-3">
                <span className="material-symbols-outlined text-[#0055A4]">badge</span>
                <h2 className="text-sm font-bold text-[#1F2B46]">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="e.g. Eleanor"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                      errors.firstName ? "border-red-500 ring-1 ring-red-200" : "border-[#AEBEAA]"
                    }`}
                  />
                  {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="e.g. Vance"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                      errors.lastName ? "border-red-500 ring-1 ring-red-200" : "border-[#AEBEAA]"
                    }`}
                  />
                  {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                      errors.dateOfBirth ? "border-red-500 ring-1 ring-red-200" : "border-[#AEBEAA]"
                    }`}
                  />
                  {errors.dateOfBirth && <p className="text-xs text-red-600 mt-1">{errors.dateOfBirth}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as PatientGender })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#AEBEAA] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Blood Group <span className="text-xs text-[#667085] font-normal">(Optional)</span>
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#AEBEAA] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                  >
                    <option value="Unknown">Unknown / Pending Lab</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                {/* Profile Photo stub */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Patient Photo Identification <span className="text-xs text-[#667085] font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E3EBDD] border border-[#C8D6C3] flex items-center justify-center text-[#667085]">
                      <span className="material-symbols-outlined text-xl">account_circle</span>
                    </div>
                    <span className="text-xs text-[#5A6372]">Webcam capture available during OPD check-in station</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section B: Contact Information */}
            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#C8D6C3] pb-3">
                <span className="material-symbols-outlined text-[#0055A4]">contact_phone</span>
                <h2 className="text-sm font-bold text-[#1F2B46]">Contact Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+91 98200 12345"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                      errors.phoneNumber ? "border-red-500 ring-1 ring-red-200" : "border-[#AEBEAA]"
                    }`}
                  />
                  {errors.phoneNumber && <p className="text-xs text-red-600 mt-1">{errors.phoneNumber}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Email Address <span className="text-xs text-[#667085] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="patient@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                      errors.email ? "border-red-500 ring-1 ring-red-200" : "border-[#AEBEAA]"
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                {/* Street Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Complete Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Flat number, building, street, landmark"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                      errors.address ? "border-red-500 ring-1 ring-red-200" : "border-[#AEBEAA]"
                    }`}
                  />
                  {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mumbai"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                      errors.city ? "border-red-500 ring-1 ring-red-200" : "border-[#AEBEAA]"
                    }`}
                  />
                  {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    State / Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#AEBEAA] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Postal / PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="400050"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                      errors.postalCode ? "border-red-500 ring-1 ring-red-200" : "border-[#AEBEAA]"
                    }`}
                  />
                  {errors.postalCode && <p className="text-xs text-red-600 mt-1">{errors.postalCode}</p>}
                </div>
              </div>
            </div>

            {/* Section C: Emergency Contact */}
            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#C8D6C3] pb-3">
                <span className="material-symbols-outlined text-[#0055A4]">emergency</span>
                <h2 className="text-sm font-bold text-[#1F2B46]">Emergency Contact</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Contact Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="e.g. Arthur Vance"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                      errors.emergencyContactName ? "border-red-500 ring-1 ring-red-200" : "border-[#AEBEAA]"
                    }`}
                  />
                  {errors.emergencyContactName && (
                    <p className="text-xs text-red-600 mt-1">{errors.emergencyContactName}</p>
                  )}
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.emergencyContactRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#AEBEAA] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Guardian">Legal Guardian</option>
                    <option value="Friend">Friend / Colleague</option>
                  </select>
                </div>

                {/* Emergency Phone */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Emergency Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    placeholder="+91 98200 99999"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] transition-all ${
                      errors.emergencyContactPhone ? "border-red-500 ring-1 ring-red-200" : "border-[#AEBEAA]"
                    }`}
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-xs text-red-600 mt-1">{errors.emergencyContactPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section D: Additional Information */}
            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#C8D6C3] pb-3">
                <span className="material-symbols-outlined text-[#0055A4]">clinical_notes</span>
                <h2 className="text-sm font-bold text-[#1F2B46]">Clinical Notes & Allergies (Optional)</h2>
              </div>

              <div className="space-y-4">
                {/* Known Allergies */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Known Allergies <span className="text-xs text-[#667085] font-normal">(Comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.knownAllergies}
                    onChange={(e) => setFormData({ ...formData, knownAllergies: e.target.value })}
                    placeholder="e.g. Penicillin, Peanuts, Latex"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#AEBEAA] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                  />
                </div>

                {/* Medical Conditions */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Existing Medical Conditions <span className="text-xs text-[#667085] font-normal">(Comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.medicalConditions}
                    onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                    placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#AEBEAA] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-[#1F2B46] mb-1">
                    Intake & Administrative Notes <span className="text-xs text-[#667085] font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.registrationNotes}
                    onChange={(e) => setFormData({ ...formData, registrationNotes: e.target.value })}
                    placeholder="Add special instructions, admission notes, or referral hospital references..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#AEBEAA] text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/dashboard/patients"
                className="px-5 py-2.5 rounded-xl border border-[#C8D6C3] bg-white hover:bg-[#E6EDE2] text-xs font-semibold text-[#5A6372] transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#004382] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Save Patient Record
              </button>
            </div>
          </form>

          {/* Confirmation Modal */}
          {isConfirmModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
              <div className="bg-white rounded-2xl border border-[#C8D6C3] shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-[#C8D6C3] flex items-center justify-between bg-[#E3EBDD]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0055A4]">how_to_reg</span>
                    <h3 className="text-base font-bold text-[#1F2B46]">Confirm Patient Intake</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="text-[#5A6372] hover:text-[#1F2B46]"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-[#5A6372] leading-relaxed">
                    You are registering{" "}
                    <span className="font-bold text-[#1F2B46]">
                      {formData.firstName} {formData.lastName}
                    </span>{" "}
                    under St. Jude Medical Center (Campus North). A facility patient record will be generated.
                  </p>

                  <div className="p-3 bg-[#E6EDE2] border border-[#C8D6C3] rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#5A6372]">Name:</span>
                      <span className="font-semibold text-[#1F2B46]">
                        {formData.firstName} {formData.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A6372]">DOB / Gender:</span>
                      <span className="font-medium text-[#1F2B46]">
                        {formData.dateOfBirth} ({formData.gender})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A6372]">Phone:</span>
                      <span className="font-mono text-[#1F2B46]">{formData.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A6372]">Emergency Contact:</span>
                      <span className="font-medium text-[#1F2B46]">
                        {formData.emergencyContactName} ({formData.emergencyContactRelation})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsConfirmModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[#C8D6C3] text-xs font-semibold text-[#5A6372] hover:bg-[#E6EDE2]"
                    >
                      Back to Edit
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmedSubmit}
                      className="px-5 py-2 rounded-xl bg-[#0055A4] hover:bg-[#004382] text-white text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? "Creating..." : "Confirm & Register"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
