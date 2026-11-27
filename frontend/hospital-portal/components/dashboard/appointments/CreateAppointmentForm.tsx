"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserSearch,
  Calendar,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  ArrowLeft,
  Check,
  Search,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PatientService } from "@/lib/patients/patient-service";
import { FacilityPatient, Patient } from "@/lib/patients/types";
import {
  AppointmentType,
} from "@/lib/appointments/types";
import {
  AVAILABLE_DEPARTMENTS,
  AVAILABLE_DOCTORS,
  AVAILABLE_TIME_SLOTS,
} from "@/lib/appointments/mock-data";
import { AppointmentService } from "@/lib/appointments/appointment-service";

interface CreateAppointmentFormProps {
  isGuestMode?: boolean;
}

export function CreateAppointmentForm({ isGuestMode = false }: CreateAppointmentFormProps) {
  const router = useRouter();

  // Patients registered in facility
  const [facilityPatients] = useState<{ facilityRecord: FacilityPatient; patient: Patient }[]>(() =>
    PatientService.getAllFacilityPatients()
  );

  // Section A: Patient Selection
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<{ facilityRecord: FacilityPatient; patient: Patient } | null>(null);

  // Section B: Appointment Details
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("New Consultation");
  const [department, setDepartment] = useState(AVAILABLE_DEPARTMENTS[0]);
  const [doctorId, setDoctorId] = useState(AVAILABLE_DOCTORS[0].id);
  const [appointmentDate, setAppointmentDate] = useState("2024-11-26");
  const [timeSlot, setTimeSlot] = useState(AVAILABLE_TIME_SLOTS[0]);
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [staffNotes, setStaffNotes] = useState("");

  // Validation / Confirmation states
  const [conflictError, setConflictError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Filtered patients for dropdown/search
  const searchedPatients = useMemo(() => {
    if (!patientSearch.trim()) return facilityPatients.slice(0, 5);
    const q = patientSearch.toLowerCase();
    return facilityPatients.filter((item) => {
      const name = `${item.patient.firstName} ${item.patient.lastName}`.toLowerCase();
      const facId = item.facilityRecord.facilityPatientId.toLowerCase();
      const phone = item.facilityRecord.phoneNumber.toLowerCase();
      return name.includes(q) || facId.includes(q) || phone.includes(q);
    });
  }, [facilityPatients, patientSearch]);

  // Doctors in selected department
  const filteredDoctors = useMemo(() => {
    return AVAILABLE_DOCTORS.filter((d: { id: string; name: string; department: string }) => d.department === department);
  }, [department]);

  // Handle department change to keep doctorId valid
  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    const match = AVAILABLE_DOCTORS.find((d: { id: string; name: string; department: string }) => d.department === newDept);
    if (match) {
      setDoctorId(match.id);
    }
  };

  const handleSelectPatient = (item: { facilityRecord: FacilityPatient; patient: Patient }) => {
    setSelectedPatient(item);
    setPatientSearch(`${item.patient.firstName} ${item.patient.lastName}`);
  };

  const handleValidateAndOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setConflictError("");

    if (!selectedPatient) {
      setValidationError("Please select an active facility patient.");
      return;
    }

    if (!reasonForVisit.trim()) {
      setValidationError("Please enter the chief complaint or reason for visit.");
      return;
    }

    // Check conflict
    const conflict = AppointmentService.hasSchedulingConflict(doctorId, appointmentDate, timeSlot);
    if (conflict) {
      setConflictError(
        "Scheduling Conflict: The chosen physician already has an appointment booked for this date and time slot. Please choose another time slot."
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    if (!selectedPatient) return;
    setIsSubmitting(true);

    const doc = AVAILABLE_DOCTORS.find((d: { id: string; name: string }) => d.id === doctorId);
    const patientName = `${selectedPatient.patient.firstName} ${selectedPatient.patient.lastName}`;

    const res = AppointmentService.createAppointment({
      facilityPatientId: selectedPatient.facilityRecord.facilityPatientId,
      patientName,
      patientPhone: selectedPatient.facilityRecord.phoneNumber,
      patientAge: 40,
      patientGender: selectedPatient.patient.gender,
      doctorId,
      doctorName: doc ? doc.name : "Assigned Physician",
      department,
      appointmentType,
      appointmentDate,
      timeSlot,
      reasonForVisit,
      staffNotes: staffNotes.trim() ? staffNotes : undefined,
      source: "Phone Booking Desk",
    });

    setIsSubmitting(false);
    setShowConfirmModal(false);

    if (res.success && res.appointment) {
      router.push(`/dashboard/appointments/${res.appointment.id}`);
    } else {
      setConflictError(res.error || "Failed to create appointment.");
    }
  };

  return (
    <DashboardShell activeNav="appointments">
      {/* Breadcrumb & Scope Pill */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs text-[#5A6372]">
          <Link href="/dashboard" className="hover:text-[#0055A4] flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-sm">home</span>
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link href="/dashboard/appointments" className="hover:text-[#0055A4] transition-colors">
            Appointments
          </Link>
          <span>/</span>
          <span className="text-[#1F2B46] font-semibold">New Appointment</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E3EBDD] text-[#2D382B] border border-[#C8D6C3]">
            <span className="material-symbols-outlined text-xs text-[#0055A4]">domain</span>
            <span>Facility Scope: St. Jude Medical Center (North Campus)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1F2B46] border border-[#C8D6C3]">
            <span className="material-symbols-outlined text-xs text-[#34A853]">verified</span>
            <span>Intake Booking</span>
          </span>
        </div>
      </div>

      {/* Header Banner matching Overview */}
      <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#1F2B46]">Book New Appointment</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E7F0FF] text-[#0055A4] border border-[#C7DCFF]">
                Direct Scheduling
              </span>
            </div>
            <p className="text-sm text-[#5A6372] mt-1">
              Schedule an in-person, routine, or specialist consultation for a registered facility patient.
            </p>
          </div>

          <Link
            href="/dashboard/appointments"
            className="flex items-center gap-1.5 rounded-xl border border-[#C8D6C3] bg-[#E3EBDD] px-4 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#D5E0D2] transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Appointments</span>
          </Link>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleValidateAndOpenConfirm} className="space-y-6">
        {/* SECTION A: Patient Identification */}
        <div className="rounded-2xl border border-[#C5D2C0] bg-white p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)]">
          <div className="flex items-center gap-2.5 border-b border-[#C8D6C3] pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0055A4]/10 text-[#0055A4]">
              <UserSearch className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1F2B46]">
                Section A: Patient Search & Verification
              </h2>
              <p className="text-xs text-[#1F2B46]/60">
                Select an active facility patient registered in St. Jude Medical Center Campus North.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {/* Search input with live suggestion list */}
            <div>
              <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                Search Patient Record <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1F2B46]/40" />
                <input
                  type="text"
                  placeholder="Type name, phone number, or Patient MRN..."
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    if (selectedPatient && `${selectedPatient.patient.firstName} ${selectedPatient.patient.lastName}` !== e.target.value) {
                      setSelectedPatient(null);
                    }
                  }}
                  className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] py-2.5 pl-10 pr-4 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
                />
              </div>

              {/* Suggestions */}
              {!selectedPatient && searchedPatients.length > 0 && (
                <div className="mt-2 divide-y divide-[#C8D6C3] rounded-xl border border-[#C8D6C3] bg-white shadow-xs overflow-hidden">
                  {searchedPatients.map((item) => (
                    <button
                      type="button"
                      key={item.facilityRecord.facilityPatientId}
                      onClick={() => handleSelectPatient(item)}
                      className="flex w-full items-center justify-between p-3 text-left hover:bg-[#E6EDE2] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0055A4]/10 font-bold text-xs text-[#0055A4]">
                          {item.patient.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1F2B46]">
                            {item.patient.firstName} {item.patient.lastName}
                          </div>
                          <div className="text-[11px] text-[#1F2B46]/60">
                            MRN: {item.facilityRecord.facilityPatientId} &bull; {item.patient.gender} &bull; {item.facilityRecord.phoneNumber}
                          </div>
                        </div>
                      </div>
                      <span className="rounded-md bg-white border border-[#C8D6C3] px-2 py-1 text-[11px] font-semibold text-[#0055A4]">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Patient Confirmation Card */}
            {selectedPatient && (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1F2B46]">
                      {selectedPatient.patient.firstName} {selectedPatient.patient.lastName}
                    </h3>
                    <p className="text-xs text-[#1F2B46]/70">
                      MRN: <strong>{selectedPatient.facilityRecord.facilityPatientId}</strong> &bull; DOB: {selectedPatient.patient.dateOfBirth} &bull; Blood: {selectedPatient.patient.bloodGroup || "O+"} &bull; Phone: {selectedPatient.facilityRecord.phoneNumber}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientSearch("");
                  }}
                  className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
                >
                  Change Patient
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION B: Appointment Logistics */}
        <div className="rounded-2xl border border-[#C5D2C0] bg-white p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)]">
          <div className="flex items-center gap-2.5 border-b border-[#C8D6C3] pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0055A4]/10 text-[#0055A4]">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1F2B46]">
                Section B: Consultation Logistics & Physician
              </h2>
              <p className="text-xs text-[#1F2B46]/60">
                Specify consultation modality, medical service department, and scheduling slot.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Visit Type */}
            <div>
              <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                Consultation Modality <span className="text-rose-500">*</span>
              </label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
                className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2.5 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
              >
                <option value="New Consultation">New Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Routine Checkup">Routine Checkup</option>
                <option value="Specialist Review">Specialist Review</option>
                <option value="Emergency OPD">Emergency OPD</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                Clinical Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2.5 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
              >
                {AVAILABLE_DEPARTMENTS.map((dept: string) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div>
              <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                Assigned Physician <span className="text-rose-500">*</span>
              </label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2.5 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
              >
                {filteredDoctors.map((doc: { id: string; name: string }) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
                {filteredDoctors.length === 0 && (
                  AVAILABLE_DOCTORS.map((doc: { id: string; name: string }) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                Appointment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2.5 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
              />
            </div>

            {/* Time Slot */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                Available Time Slot <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVAILABLE_TIME_SLOTS.map((slot: string) => {
                  const isConflict = AppointmentService.hasSchedulingConflict(
                    doctorId,
                    appointmentDate,
                    slot
                  );

                  return (
                    <button
                      type="button"
                      key={slot}
                      disabled={isConflict}
                      onClick={() => setTimeSlot(slot)}
                      className={`rounded-xl border p-2 text-xs font-medium text-center transition-all ${
                        isConflict
                          ? "border-[#C8D6C3] bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                          : timeSlot === slot
                          ? "border-[#0055A4] bg-[#0055A4] text-white font-bold shadow-2xs"
                          : "border-[#C8D6C3] bg-[#E3EBDD] text-[#1F2B46] hover:bg-[#D5E0D2]"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                Chief Complaint / Reason for Visit <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                placeholder="e.g. Routine hypertension review and medication refill..."
                className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2.5 text-xs text-[#1F2B46] placeholder:text-[#7C8998] focus:border-[#0055A4] focus:outline-none"
              />
            </div>

            {/* Clinical / Staff Notes */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                Internal Staff Notes <span className="text-[#1F2B46]/50">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="Add special instructions, preparatory fasting notes, or triage observations..."
                className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2.5 text-xs text-[#1F2B46] placeholder:text-[#7C8998] focus:border-[#0055A4] focus:outline-none"
              />
            </div>
          </div>

          {/* Validation & Conflict Alerts */}
          {validationError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {conflictError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{conflictError}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/appointments"
            className="rounded-xl border border-[#C8D6C3] bg-white px-5 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#E6EDE2] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-[#0055A4] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#004282] transition-colors shadow-sm"
          >
            <Check className="h-4 w-4" />
            Review & Confirm Booking
          </button>
        </div>
      </form>

      {/* CONFIRMATION SUMMARY MODAL */}
      {showConfirmModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#C5D2C0] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 border-b border-[#C8D6C3] pb-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-[#1F2B46]">
                Confirm Appointment Booking
              </h3>
            </div>

            <p className="mt-2 text-xs text-[#1F2B46]/70">
              Please verify the appointment details before committing this booking to the facility schedule.
            </p>

            <div className="mt-4 space-y-3 rounded-xl bg-[#E3EBDD] p-4 text-xs">
              <div className="flex justify-between border-b border-[#C8D6C3] pb-2">
                <span className="text-[#1F2B46]/60">Patient Name:</span>
                <span className="font-bold text-[#1F2B46]">
                  {selectedPatient.patient.firstName} {selectedPatient.patient.lastName}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#C8D6C3] pb-2">
                <span className="text-[#1F2B46]/60">Patient MRN:</span>
                <span className="font-mono font-semibold text-[#0055A4]">
                  {selectedPatient.facilityRecord.facilityPatientId}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#C8D6C3] pb-2">
                <span className="text-[#1F2B46]/60">Modality:</span>
                <span className="font-semibold text-[#1F2B46]">{appointmentType}</span>
              </div>
              <div className="flex justify-between border-b border-[#C8D6C3] pb-2">
                <span className="text-[#1F2B46]/60">Department:</span>
                <span className="font-semibold text-[#1F2B46]">{department}</span>
              </div>
              <div className="flex justify-between border-b border-[#C8D6C3] pb-2">
                <span className="text-[#1F2B46]/60">Physician:</span>
                <span className="font-semibold text-[#1F2B46]">
                  {AVAILABLE_DOCTORS.find((d: { id: string; name: string }) => d.id === doctorId)?.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#C8D6C3] pb-2">
                <span className="text-[#1F2B46]/60">Scheduled Date & Time:</span>
                <span className="font-bold text-[#0055A4]">
                  {appointmentDate} at {timeSlot}
                </span>
              </div>
              <div>
                <span className="text-[#1F2B46]/60 block mb-0.5">Reason for Visit:</span>
                <p className="text-[#1F2B46] font-medium">{reasonForVisit}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-[#C8D6C3] bg-white px-4 py-2 text-xs font-semibold text-[#1F2B46] hover:bg-[#E6EDE2]"
              >
                Make Changes
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="rounded-xl bg-[#0055A4] px-5 py-2 text-xs font-semibold text-white hover:bg-[#004282] shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Booking..." : "Confirm & Commit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
