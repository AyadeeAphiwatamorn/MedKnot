"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserSession, DEFAULT_ADMIN, clearClientSession, getClientSession } from "@/lib/auth";
import { PatientService, calculateAge } from "@/lib/patients/patient-service";
import {
  PatientDetailViewData,
  PatientStatus,
  DocumentReviewStatus,
  PatientDocument,
  BloodGroup,
} from "@/lib/patients/types";

interface PatientDetailViewProps {
  patientId: string;
  initialUser?: UserSession;
}

export default function PatientDetailView({ patientId, initialUser }: PatientDetailViewProps) {
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

  // State
  // Initial state derived from service
  const [data, setData] = useState<PatientDetailViewData | null>(() => PatientService.getPatientById(patientId));
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "visits" | "documents" | "timeline">(
    "overview"
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(() => {
    const initial = PatientService.getPatientById(patientId);
    return {
      firstName: initial?.patient.firstName || "",
      lastName: initial?.patient.lastName || "",
      phoneNumber: initial?.facilityRecord.phoneNumber || "",
      email: initial?.facilityRecord.email || "",
      address: initial?.facilityRecord.address || "",
      city: initial?.facilityRecord.city || "",
      postalCode: initial?.facilityRecord.postalCode || "",
      emergencyContactName: initial?.facilityRecord.emergencyContactName || "",
      emergencyContactPhone: initial?.facilityRecord.emergencyContactPhone || "",
      bloodGroup: (initial?.patient.bloodGroup || "Unknown") as BloodGroup,
      knownAllergies: initial?.facilityRecord.knownAllergies?.join(", ") || "",
      medicalConditions: initial?.facilityRecord.medicalConditions?.join(", ") || "",
    };
  });

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [appointmentFormData, setAppointmentFormData] = useState({
    doctor: "Dr. Chen Wei",
    department: "Internal Medicine",
    date: "",
    time: "10:00 AM",
    type: "Follow-up",
    notes: "",
  });

  const [previewDoc, setPreviewDoc] = useState<PatientDocument | null>(null);

  // Sync edit form data when opening modal
  const handleOpenEditModal = () => {
    if (data) {
      setEditFormData({
        firstName: data.patient.firstName,
        lastName: data.patient.lastName,
        phoneNumber: data.facilityRecord.phoneNumber,
        email: data.facilityRecord.email || "",
        address: data.facilityRecord.address,
        city: data.facilityRecord.city,
        postalCode: data.facilityRecord.postalCode,
        emergencyContactName: data.facilityRecord.emergencyContactName,
        emergencyContactPhone: data.facilityRecord.emergencyContactPhone,
        bloodGroup: data.patient.bloodGroup || "Unknown",
        knownAllergies: data.facilityRecord.knownAllergies?.join(", ") || "",
        medicalConditions: data.facilityRecord.medicalConditions?.join(", ") || "",
      });
    }
    setIsEditModalOpen(true);
  };

  // Toast timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!data) {
    return (
      <div className="w-full min-w-0 flex-1 bg-transparent text-[#1F2B46] font-sans antialiased flex flex-col">
        <main className="w-full min-w-0 p-4 md:p-8 flex-1 flex items-center justify-center">
          <div className="bg-white border border-[#C5D2C0] rounded-2xl p-8 max-w-md text-center shadow-[0_3px_10px_rgba(31,43,70,0.10)]">
            <span className="material-symbols-outlined text-4xl text-[#667085] mb-3">person_off</span>
            <h2 className="text-lg font-bold text-[#1F2B46]">Patient Record Not Found</h2>
            <p className="text-xs text-[#5A6372] mt-1 mb-4">
              The requested patient ID &quot;{patientId}&quot; is not registered under St. Jude Medical Center (North Campus).
            </p>
            <Link
              href="/dashboard/patients"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0055A4] text-white text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Back to Directory</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { patient, facilityRecord, appointments, visits, documents, timeline, stats } = data;
  const age = calculateAge(patient.dateOfBirth);
  const fullName = `${patient.firstName} ${patient.lastName}`;
  const initials = `${patient.firstName[0] || ""}${patient.lastName[0] || ""}`.toUpperCase();

  const getStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF5E2] text-[#2D6A28] border border-[#C5E4BA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
            Active Record
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF4E5] text-[#B76E00] border border-[#FFE0B2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FB8C00]"></span>
            Pending Verification
          </span>
        );
      case "Inactive":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></span>
            Inactive
          </span>
        );
    }
  };

  const getDocReviewBadge = (status: DocumentReviewStatus) => {
    switch (status) {
      case "Clinician Verified":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5E2] text-[#2D6A28] border border-[#C5E4BA]">
            <span className="material-symbols-outlined text-xs">verified</span>
            Clinician Verified
          </span>
        );
      case "Staff Reviewed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7F0FF] text-[#0055A4] border border-[#C7DCFF]">
            <span className="material-symbols-outlined text-xs">done</span>
            Staff Reviewed
          </span>
        );
      case "Awaiting Review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF4E5] text-[#B76E00] border border-[#FFE0B2]">
            <span className="material-symbols-outlined text-xs">schedule</span>
            Awaiting Review
          </span>
        );
      case "AI Processing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
            <span className="material-symbols-outlined text-xs animate-spin">smart_toy</span>
            AI Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
            Uploaded
          </span>
        );
    }
  };

  // Handle Edit Patient Save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const allergiesList = editFormData.knownAllergies
      ? editFormData.knownAllergies.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const conditionsList = editFormData.medicalConditions
      ? editFormData.medicalConditions.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const updated = PatientService.updatePatient(facilityRecord.facilityPatientId, {
      firstName: editFormData.firstName,
      lastName: editFormData.lastName,
      phoneNumber: editFormData.phoneNumber,
      email: editFormData.email,
      address: editFormData.address,
      city: editFormData.city,
      postalCode: editFormData.postalCode,
      emergencyContactName: editFormData.emergencyContactName,
      emergencyContactPhone: editFormData.emergencyContactPhone,
      bloodGroup: editFormData.bloodGroup,
      knownAllergies: allergiesList,
      medicalConditions: conditionsList,
    });

    if (updated) {
      setData(PatientService.getPatientById(patientId));
    }
    setIsEditModalOpen(false);
    setToastMessage("Patient information updated successfully (saved to mock session state).");
  };

  // Handle Schedule Appointment Save
  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduleModalOpen(false);
    setToastMessage(`Appointment booked with ${appointmentFormData.doctor} on ${appointmentFormData.date || "selected date"}.`);
  };

  return (
    <div className="w-full min-w-0 flex-1 bg-transparent text-[#1F2B46] font-sans antialiased flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3.5 rounded-xl shadow-lg border border-[#004382] bg-[#0055A4] text-white flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full min-w-0 p-4 md:p-8 flex-1">
        <div className="w-full min-w-0 space-y-6">
          {/* Breadcrumb Navigation */}
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
            <span className="text-[#1F2B46] font-semibold">{fullName}</span>
          </nav>

          {/* Section A: Patient Header Bar */}
          <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF5E2] text-[#2D6A28] border border-[#C5E4BA] font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
                {initials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-[#1F2B46]">{fullName}</h1>
                  {getStatusBadge(facilityRecord.status)}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#E7F0FF] text-[#0055A4] border border-[#C7DCFF]">
                    {facilityRecord.facilityPatientId}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#5A6372] flex-wrap pt-0.5">
                  <span>
                    <strong className="text-[#1F2B46]">{age}</strong> yrs • {patient.gender}
                  </span>
                  <span>•</span>
                  <span>
                    Blood Group: <strong className="text-[#1F2B46]">{patient.bloodGroup || "Unknown"}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#0055A4]">call</span>
                    <span className="font-mono text-[#1F2B46]">{facilityRecord.phoneNumber}</span>
                  </span>
                  <span>•</span>
                  <span>Registered: {facilityRecord.registrationDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C8D6C3] bg-[#E3EBDD] hover:bg-[#D5E0D2] text-[#1F2B46] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-[#0055A4]">calendar_today</span>
                <span>Schedule Appointment</span>
              </button>

              <button
                type="button"
                onClick={handleOpenEditModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#004382] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                <span>Edit Patient</span>
              </button>

              <Link
                href="/dashboard/patients"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#C8D6C3] bg-white hover:bg-[#E6EDE2] text-[#5A6372] text-xs font-semibold transition-colors"
                title="Back to directory"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Directory</span>
              </Link>
            </div>
          </div>

          {/* Section C: Care Overview Bento Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Total Appointments</span>
                <span className="w-8 h-8 rounded-lg bg-[#E7F0FF] text-[#0055A4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">event_available</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1F2B46]">{stats.totalAppointments}</span>
                <p className="text-xs text-[#5A6372] mt-1">Booked at St. Jude North</p>
              </div>
            </div>

            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Completed Visits</span>
                <span className="w-8 h-8 rounded-lg bg-[#EAF5E2] text-[#2D6A28] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">clinical_notes</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1F2B46]">{stats.completedVisits}</span>
                <p className="text-xs text-[#5A6372] mt-1">Attended clinical encounters</p>
              </div>
            </div>

            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Upcoming Appointments</span>
                <span className="w-8 h-8 rounded-lg bg-[#FFF4E5] text-[#B76E00] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1F2B46]">{stats.upcomingAppointments}</span>
                <p className="text-xs text-[#5A6372] mt-1">Confirmed forward bookings</p>
              </div>
            </div>

            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Last Visit</span>
                <span className="w-8 h-8 rounded-lg bg-[#E3EBDD] text-[#1F2B46] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">history</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-sm font-bold text-[#1F2B46] block truncate">{stats.lastVisit}</span>
                <p className="text-xs text-[#5A6372] mt-1">Facility encounter history</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-[#C8D6C3] flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-[#0055A4] text-[#0055A4]"
                  : "border-transparent text-[#5A6372] hover:text-[#1F2B46]"
              }`}
            >
              <span className="material-symbols-outlined text-base">person</span>
              <span>Patient Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("appointments")}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "appointments"
                  ? "border-[#0055A4] text-[#0055A4]"
                  : "border-transparent text-[#5A6372] hover:text-[#1F2B46]"
              }`}
            >
              <span className="material-symbols-outlined text-base">calendar_month</span>
              <span>Appointments ({appointments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("visits")}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "visits"
                  ? "border-[#0055A4] text-[#0055A4]"
                  : "border-transparent text-[#5A6372] hover:text-[#1F2B46]"
              }`}
            >
              <span className="material-symbols-outlined text-base">stethoscope</span>
              <span>Visit History ({visits.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("documents")}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "documents"
                  ? "border-[#0055A4] text-[#0055A4]"
                  : "border-transparent text-[#5A6372] hover:text-[#1F2B46]"
              }`}
            >
              <span className="material-symbols-outlined text-base">description</span>
              <span>Medical Documents ({documents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "timeline"
                  ? "border-[#0055A4] text-[#0055A4]"
                  : "border-transparent text-[#5A6372] hover:text-[#1F2B46]"
              }`}
            >
              <span className="material-symbols-outlined text-base">timeline</span>
              <span>Health Timeline</span>
            </button>
          </div>

          {/* TAB CONTENT */}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Personal & Contact */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal & Demographics */}
                <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#C8D6C3] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#0055A4]">badge</span>
                      <h2 className="text-sm font-bold text-[#1F2B46]">Personal & Demographic Information</h2>
                    </div>
                    <span className="text-xs text-[#5A6372]">Global ID: {patient.id}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[#5A6372] block mb-1">Full Legal Name</span>
                      <span className="font-semibold text-[#1F2B46] text-sm">{fullName}</span>
                    </div>
                    <div>
                      <span className="text-[#5A6372] block mb-1">Date of Birth</span>
                      <span className="font-medium text-[#1F2B46]">{patient.dateOfBirth} ({age} years)</span>
                    </div>
                    <div>
                      <span className="text-[#5A6372] block mb-1">Gender</span>
                      <span className="font-medium text-[#1F2B46]">{patient.gender}</span>
                    </div>
                    <div>
                      <span className="text-[#5A6372] block mb-1">Blood Group</span>
                      <span className="font-bold text-[#0055A4]">{patient.bloodGroup || "Unknown"}</span>
                    </div>
                    <div>
                      <span className="text-[#5A6372] block mb-1">National ID / Aadhaar</span>
                      <span className="font-mono text-[#1F2B46]">{patient.nationalIdMasked || "Not on file"}</span>
                    </div>
                    <div>
                      <span className="text-[#5A6372] block mb-1">Facility Assigned</span>
                      <span className="font-medium text-[#1F2B46]">{facilityRecord.facilityName}</span>
                    </div>
                  </div>
                </div>

                {/* Contact & Address */}
                <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#C8D6C3] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#0055A4]">location_on</span>
                      <h2 className="text-sm font-bold text-[#1F2B46]">Contact & Location Details</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[#5A6372] block mb-1">Primary Mobile Phone</span>
                      <span className="font-mono font-medium text-[#1F2B46] text-sm">{facilityRecord.phoneNumber}</span>
                    </div>
                    <div>
                      <span className="text-[#5A6372] block mb-1">Email Address</span>
                      <span className="font-medium text-[#1F2B46]">{facilityRecord.email || "No email recorded"}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[#5A6372] block mb-1">Residential Address</span>
                      <span className="text-[#1F2B46] leading-relaxed">
                        {facilityRecord.address}, {facilityRecord.city}, {facilityRecord.state} - {facilityRecord.postalCode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#C8D6C3] pb-3">
                    <span className="material-symbols-outlined text-[#BA1A1A]">emergency</span>
                    <h2 className="text-sm font-bold text-[#1F2B46]">Emergency Contact Information</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[#5A6372] block mb-1">Contact Person</span>
                      <span className="font-semibold text-[#1F2B46] text-sm">{facilityRecord.emergencyContactName}</span>
                    </div>
                    <div>
                      <span className="text-[#5A6372] block mb-1">Relationship</span>
                      <span className="font-medium text-[#1F2B46]">{facilityRecord.emergencyContactRelation}</span>
                    </div>
                    <div>
                      <span className="text-[#5A6372] block mb-1">Emergency Phone</span>
                      <span className="font-mono font-medium text-[#1F2B46] text-sm">{facilityRecord.emergencyContactPhone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Clinical Profile, Allergies, Notes */}
              <div className="space-y-6">
                {/* Allergies & Conditions */}
                <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#C8D6C3] pb-3">
                    <span className="material-symbols-outlined text-[#B76E00]">warning</span>
                    <h2 className="text-sm font-bold text-[#1F2B46]">Clinical Alerts & Allergies</h2>
                  </div>

                  {/* Allergies */}
                  <div>
                    <span className="text-xs font-semibold text-[#5A6372] block mb-2">Known Drug & Food Allergies:</span>
                    {facilityRecord.knownAllergies && facilityRecord.knownAllergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {facilityRecord.knownAllergies.map((allergy, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FFF5F5] text-[#BA1A1A] border border-[#FFD6D6]"
                          >
                            <span className="material-symbols-outlined text-xs">error</span>
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[#2D6A28] font-medium bg-[#EAF5E2] px-2.5 py-1 rounded-lg border border-[#C5E4BA] inline-block">
                        No known drug allergies (NKDA)
                      </span>
                    )}
                  </div>

                  {/* Conditions */}
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-[#5A6372] block mb-2">Recorded Medical Conditions:</span>
                    {facilityRecord.medicalConditions && facilityRecord.medicalConditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {facilityRecord.medicalConditions.map((cond, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#E3EBDD] text-[#1F2B46] border border-[#C8D6C3]"
                          >
                            {cond}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[#667085] italic">No active chronic conditions noted.</span>
                    )}
                  </div>
                </div>

                {/* Primary Care Details */}
                <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-3 text-xs">
                  <div className="flex items-center gap-2 border-b border-[#C8D6C3] pb-3">
                    <span className="material-symbols-outlined text-[#0055A4]">medical_services</span>
                    <h2 className="text-sm font-bold text-[#1F2B46]">Primary Care Team</h2>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#C8D6C3]">
                    <span className="text-[#5A6372]">Primary Department:</span>
                    <span className="font-semibold text-[#1F2B46]">{facilityRecord.primaryDepartment || "General OPD"}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#C8D6C3]">
                    <span className="text-[#5A6372]">Attending Physician:</span>
                    <span className="font-semibold text-[#0055A4]">{facilityRecord.primaryDoctor || "Rotating Physician"}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-[#5A6372]">Registration Type:</span>
                    <span className="font-medium text-[#1F2B46]">Institutional Outpatient</span>
                  </div>
                </div>

                {/* Administrative Notes */}
                <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-2">
                  <div className="flex items-center gap-2 border-b border-[#C8D6C3] pb-2">
                    <span className="material-symbols-outlined text-[#5A6372]">notes</span>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A6372]">Registration Notes</h2>
                  </div>
                  <p className="text-xs text-[#374151] leading-relaxed italic">
                    {facilityRecord.registrationNotes || "No specific registration notes entered."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPOINTMENTS */}
          {activeTab === "appointments" && (
            <div className="bg-white border border-[#C5D2C0] rounded-2xl shadow-[0_3px_10px_rgba(31,43,70,0.10)] overflow-hidden">
              <div className="p-5 border-b border-[#C8D6C3] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1F2B46]">Patient Appointments</h3>
                  <p className="text-xs text-[#5A6372]">Scheduled and historical clinic bookings</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0055A4] text-white text-xs font-semibold"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Book Appointment</span>
                </button>
              </div>

              {appointments.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#5A6372]">
                  No appointments recorded for this patient.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#E3EBDD] border-b border-[#C8D6C3] text-[11px] font-bold uppercase tracking-wider text-[#5A6372]">
                      <th className="py-3 px-5">Date & Time</th>
                      <th className="py-3 px-5">Attending Doctor</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Appointment Type</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-5">Clinical Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C8D6C3] text-xs">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-[#E6EDE2]">
                        <td className="py-3.5 px-5 font-semibold text-[#1F2B46]">
                          {apt.appointmentDate} • <span className="font-normal text-[#5A6372]">{apt.time}</span>
                        </td>
                        <td className="py-3.5 px-5 font-medium text-[#0055A4]">{apt.doctorName}</td>
                        <td className="py-3.5 px-4 text-[#5A6372]">{apt.department}</td>
                        <td className="py-3.5 px-4 font-medium text-[#1F2B46]">{apt.appointmentType}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                              apt.status === "Completed"
                                ? "bg-[#EAF5E2] text-[#2D6A28]"
                                : apt.status === "Scheduled"
                                ? "bg-[#E7F0FF] text-[#0055A4]"
                                : "bg-[#F3F4F6] text-[#6B7280]"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[#5A6372] italic">{apt.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3: VISITS */}
          {activeTab === "visits" && (
            <div className="space-y-4">
              {visits.length === 0 ? (
                <div className="bg-white border border-[#C5D2C0] rounded-2xl p-12 text-center text-xs text-[#5A6372]">
                  No historical visits recorded at this facility.
                </div>
              ) : (
                visits.map((vis) => (
                  <div key={vis.id} className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#C8D6C3] pb-3">
                      <div>
                        <span className="text-xs font-bold text-[#0055A4] uppercase tracking-wider block">
                          Encounter Date: {vis.visitDate}
                        </span>
                        <h4 className="text-base font-bold text-[#1F2B46] mt-0.5">
                          {vis.department} Clinic • {vis.attendingDoctor}
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF5E2] text-[#2D6A28] border border-[#C5E4BA] self-start sm:self-auto">
                        Status: {vis.visitStatus}
                      </span>
                    </div>

                    {/* Vitals Grid */}
                    {vis.vitals && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#E3EBDD] p-3 rounded-xl text-xs">
                        <div>
                          <span className="text-[#5A6372] block">Blood Pressure</span>
                          <span className="font-semibold text-[#1F2B46]">{vis.vitals.bloodPressure || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[#5A6372] block">Heart Rate</span>
                          <span className="font-semibold text-[#1F2B46]">{vis.vitals.heartRate || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[#5A6372] block">Temperature</span>
                          <span className="font-semibold text-[#1F2B46]">{vis.vitals.temperature || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[#5A6372] block">Oxygen Saturation</span>
                          <span className="font-semibold text-[#1F2B46]">{vis.vitals.spO2 || "—"}</span>
                        </div>
                      </div>
                    )}

                    {/* Visit Summary */}
                    <div>
                      <span className="text-xs font-semibold text-[#5A6372] block mb-1">Clinical Encounter Summary:</span>
                      <p className="text-xs text-[#374151] leading-relaxed bg-[#E6EDE2] p-3.5 rounded-xl border border-[#C8D6C3]">
                        {vis.visitSummary}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: MEDICAL DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="bg-white border border-[#C5D2C0] rounded-2xl shadow-[0_3px_10px_rgba(31,43,70,0.10)] overflow-hidden space-y-0">
              <div className="p-5 border-b border-[#C8D6C3] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1F2B46]">Authorized Medical Documents</h3>
                  <p className="text-xs text-[#5A6372]">Clinical files, diagnostic scans, and verified prescriptions</p>
                </div>
                <button
                  type="button"
                  onClick={() => setToastMessage("Upload channel open: Supported formats PDF, DICOM, JPEG.")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0055A4] text-white text-xs font-semibold"
                >
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>Upload Document</span>
                </button>
              </div>

              {/* AI Verification Notice */}
              <div className="px-5 py-3 bg-[#E3EBDD] border-b border-[#C8D6C3] text-xs text-[#5A6372] flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-[#0055A4]">info</span>
                <span>
                  <strong>Clinical Policy:</strong> AI-extracted document metadata is preliminary and requires clinician
                  verification before entering formal medical charts.
                </span>
              </div>

              {documents.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#5A6372]">
                  No medical documents attached to this patient record.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#E3EBDD] border-b border-[#C8D6C3] text-[11px] font-bold uppercase tracking-wider text-[#5A6372]">
                      <th className="py-3 px-5">Document Name</th>
                      <th className="py-3 px-4">Document Type</th>
                      <th className="py-3 px-4">Uploaded Date</th>
                      <th className="py-3 px-4">Uploaded By</th>
                      <th className="py-3 px-4">Review Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C8D6C3] text-xs">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#E6EDE2]">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-red-600 text-xl">picture_as_pdf</span>
                            <div>
                              <span className="font-semibold text-[#1F2B46] block">{doc.documentName}</span>
                              <span className="text-[11px] text-[#667085]">{doc.fileSize}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#1F2B46]">{doc.documentType}</td>
                        <td className="py-3.5 px-4 text-[#5A6372]">{doc.uploadedDate}</td>
                        <td className="py-3.5 px-4 text-[#5A6372]">{doc.uploadedBy}</td>
                        <td className="py-3.5 px-4">{getDocReviewBadge(doc.reviewStatus)}</td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="text-xs font-semibold text-[#0055A4] hover:underline"
                          >
                            View Record
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 5: HEALTH TIMELINE */}
          {activeTab === "timeline" && (
            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-6">
              <div className="border-b border-[#C8D6C3] pb-3">
                <h3 className="text-sm font-bold text-[#1F2B46]">Patient Health Timeline</h3>
                <p className="text-xs text-[#5A6372]">
                  Chronological progression of registrations, visits, and clinical milestones
                </p>
              </div>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#C8D6C3]">
                {timeline.map((event) => (
                  <div key={event.id} className="relative group">
                    {/* Event Circle Dot */}
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#0055A4] text-white flex items-center justify-center ring-4 ring-[#E3EBDD]">
                      <span className="material-symbols-outlined text-[12px]">{event.icon}</span>
                    </div>

                    <div className="bg-[#E6EDE2] border border-[#C8D6C3] rounded-xl p-4 shadow-2xs space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-[#1F2B46]">{event.title}</h4>
                        <span className="text-[11px] font-mono text-[#5A6372]">{event.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#374151] leading-relaxed">{event.description}</p>
                      <div className="pt-1 text-[11px] text-[#667085] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-[#0055A4]">account_circle</span>
                        <span>Logged by: {event.actor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 1. EDIT PATIENT MODAL                                                     */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#C8D6C3] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[#C8D6C3] flex items-center justify-between bg-[#E3EBDD]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055A4]">edit_note</span>
                <h3 className="text-base font-bold text-[#1F2B46]">Edit Patient Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#5A6372] hover:text-[#1F2B46]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1F2B46] mb-1">First Name</label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#AEBEAA] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1F2B46] mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#AEBEAA] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1F2B46] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editFormData.phoneNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#AEBEAA] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1F2B46] mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#AEBEAA] text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1F2B46] mb-1">Blood Group</label>
                  <select
                    value={editFormData.bloodGroup}
                    onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value as BloodGroup })}
                    className="w-full px-3 py-2 rounded-xl border border-[#AEBEAA] text-sm"
                  >
                    <option value="Unknown">Unknown</option>
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
                <div>
                  <label className="block font-semibold text-[#1F2B46] mb-1">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#AEBEAA] text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#1F2B46] mb-1">Street Address</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#AEBEAA] text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#1F2B46] mb-1">Known Allergies (Comma-separated)</label>
                  <input
                    type="text"
                    value={editFormData.knownAllergies}
                    onChange={(e) => setEditFormData({ ...editFormData, knownAllergies: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#AEBEAA] text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#C8D6C3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#C8D6C3] text-[#5A6372] hover:bg-[#E6EDE2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0055A4] hover:bg-[#004382] text-white font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SCHEDULE APPOINTMENT MODAL                                             */}
      {/* ========================================================================= */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#C8D6C3] shadow-xl w-full max-w-md overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-[#C8D6C3] flex items-center justify-between bg-[#E3EBDD]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055A4]">calendar_today</span>
                <h3 className="text-base font-bold text-[#1F2B46]">Schedule Appointment</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-[#5A6372] hover:text-[#1F2B46]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleScheduleAppointment} className="p-6 space-y-4">
              <div>
                <span className="text-[#5A6372] block mb-1">Booking for:</span>
                <span className="font-bold text-[#1F2B46] text-sm block">{fullName} ({facilityRecord.facilityPatientId})</span>
              </div>

              <div>
                <label className="block font-semibold text-[#1F2B46] mb-1">Attending Physician</label>
                <select
                  value={appointmentFormData.doctor}
                  onChange={(e) => setAppointmentFormData({ ...appointmentFormData, doctor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#AEBEAA] text-sm"
                >
                  <option value="Dr. Chen Wei">Dr. Chen Wei (Internal Medicine)</option>
                  <option value="Dr. Sarah Thomas">Dr. Sarah Thomas (Cardiology)</option>
                  <option value="Dr. Rajeshwar Kulkarni">Dr. Rajeshwar Kulkarni (Orthopedics)</option>
                  <option value="Dr. Maria Santos">Dr. Maria Santos (Pediatrics)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1F2B46] mb-1">Date</label>
                  <input
                    type="date"
                    value={appointmentFormData.date}
                    onChange={(e) => setAppointmentFormData({ ...appointmentFormData, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#AEBEAA] text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1F2B46] mb-1">Time Slot</label>
                  <select
                    value={appointmentFormData.time}
                    onChange={(e) => setAppointmentFormData({ ...appointmentFormData, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#AEBEAA] text-sm"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1F2B46] mb-1">Clinical Note / Reason</label>
                <textarea
                  rows={2}
                  value={appointmentFormData.notes}
                  onChange={(e) => setAppointmentFormData({ ...appointmentFormData, notes: e.target.value })}
                  placeholder="Routine follow-up, lab review..."
                  className="w-full px-3 py-2 rounded-xl border border-[#AEBEAA] text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#C8D6C3]">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#C8D6C3] text-[#5A6372] hover:bg-[#E6EDE2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0055A4] hover:bg-[#004382] text-white font-semibold cursor-pointer"
                >
                  Confirm Booking
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
          <div className="bg-white rounded-2xl border border-[#C8D6C3] shadow-xl w-full max-w-lg overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-[#C8D6C3] flex items-center justify-between bg-[#E3EBDD]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055A4]">description</span>
                <h3 className="text-base font-bold text-[#1F2B46]">Document Record</h3>
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
              <div className="flex items-center gap-3 p-3 bg-[#E6EDE2] border border-[#C8D6C3] rounded-xl">
                <span className="material-symbols-outlined text-red-600 text-3xl">picture_as_pdf</span>
                <div>
                  <span className="font-bold text-[#1F2B46] block text-sm">{previewDoc.documentName}</span>
                  <span className="text-[#5A6372]">{previewDoc.documentType} • {previewDoc.fileSize}</span>
                </div>
              </div>

              <div className="space-y-2 border border-[#C8D6C3] p-3 rounded-xl bg-[#E3EBDD]">
                <div className="flex justify-between py-1 border-b border-[#C8D6C3]">
                  <span className="text-[#5A6372]">Uploaded Date:</span>
                  <span className="font-medium text-[#1F2B46]">{previewDoc.uploadedDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#C8D6C3]">
                  <span className="text-[#5A6372]">Uploaded By:</span>
                  <span className="font-medium text-[#1F2B46]">{previewDoc.uploadedBy}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#5A6372]">Review Status:</span>
                  <span>{getDocReviewBadge(previewDoc.reviewStatus)}</span>
                </div>
              </div>

              {previewDoc.notes && (
                <div className="p-3 bg-[#FFF9E6] border border-[#FFE082] rounded-xl text-[#7A5200]">
                  <span className="font-bold block mb-0.5">Clinical Note:</span>
                  <span>{previewDoc.notes}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-5 py-2 rounded-xl bg-[#0055A4] text-white font-semibold hover:bg-[#004382]"
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
