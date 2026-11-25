"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Printer,
  ChevronRight,
  ShieldCheck,
  Check,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  Appointment,
  AppointmentStatus,
} from "@/lib/appointments/types";
import {
  AVAILABLE_DOCTORS,
  AVAILABLE_TIME_SLOTS,
} from "@/lib/appointments/mock-data";
import { AppointmentService } from "@/lib/appointments/appointment-service";

interface AppointmentDetailViewProps {
  initialAppointment: Appointment;
  isGuestMode?: boolean;
}

export function AppointmentDetailView({
  initialAppointment,
  isGuestMode = false,
}: AppointmentDetailViewProps) {
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment>(initialAppointment);

  // Modals state
  const [modalType, setModalType] = useState<"confirm" | "reschedule" | "cancel" | "complete" | null>(null);

  // Form states
  const [rescheduleDate, setRescheduleDate] = useState(appointment.appointmentDate);
  const [rescheduleSlot, setRescheduleSlot] = useState(appointment.timeSlot);
  const [cancelReason, setCancelReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (modalType) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setModalType(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [modalType]);

  const refreshAppointment = () => {
    const updated = AppointmentService.getAppointmentById(appointment.id);
    if (updated) {
      setAppointment(updated);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Under Review":
      case "Requested":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Awaiting Patient Response":
      case "Reschedule Requested":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Completed":
        return "bg-gray-200 text-gray-800 border-gray-300";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "No Show":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Action handlers
  const handleConfirm = () => {
    AppointmentService.updateAppointmentStatus(appointment.id, "Confirmed", {
      reason: "Confirmed by intake coordinator",
    });
    refreshAppointment();
    setModalType(null);
    setSuccessMessage("Appointment marked as Confirmed.");
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const handleReschedule = () => {
    setErrorMessage("");
    const conflict = AppointmentService.hasSchedulingConflict(
      appointment.doctorId,
      rescheduleDate,
      rescheduleSlot,
      appointment.id
    );

    if (conflict) {
      setErrorMessage("Physician is not available during this time slot.");
      return;
    }

    AppointmentService.updateAppointmentStatus(appointment.id, "Confirmed", {
      date: rescheduleDate,
      timeSlot: rescheduleSlot,
      reason: `Rescheduled to ${rescheduleDate} at ${rescheduleSlot}`,
    });

    refreshAppointment();
    setModalType(null);
    setSuccessMessage("Appointment successfully rescheduled.");
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) {
      setErrorMessage("Please enter a mandatory cancellation reason.");
      return;
    }

    AppointmentService.updateAppointmentStatus(appointment.id, "Cancelled", {
      reason: `Cancelled by staff: ${cancelReason}`,
    });

    refreshAppointment();
    setModalType(null);
    setSuccessMessage("Appointment has been cancelled.");
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const handleComplete = () => {
    AppointmentService.updateAppointmentStatus(appointment.id, "Completed", {
      reason: "Consultation concluded by clinical care team",
    });

    refreshAppointment();
    setModalType(null);
    setSuccessMessage("Appointment marked as Completed.");
    setTimeout(() => setSuccessMessage(""), 3500);
  };

  const handlePrint = () => {
    window.print();
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
          <span className="text-[#1F2B46] font-semibold">{appointment.id}</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF2E9] text-[#2D382B] border border-[#DDE6DA]">
            <span className="material-symbols-outlined text-xs text-[#0055A4]">domain</span>
            <span>Facility Scope: St. Jude Medical Center</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1F2B46] border border-[#DDE6DA]">
            <span className="material-symbols-outlined text-xs text-[#34A853]">verified</span>
            <span>Official Clinical Dossier</span>
          </span>
        </div>
      </div>

      {/* Header Banner with Back Button & Actions */}
      <div className="bg-white border border-[#DDE6DA] rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/appointments"
            className="p-2.5 rounded-xl border border-[#DDE6DA] text-[#5A6372] hover:text-[#1F2B46] hover:bg-[#F1F5EF] transition-colors shrink-0"
            title="Back to Appointments Overview"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#1F2B46]">Appointment Dossier</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(appointment.status)}`}>
                {appointment.status}
              </span>
              <span className="font-mono text-xs font-bold text-[#0055A4] bg-[#E7F0FF] px-2.5 py-0.5 rounded-md border border-[#C7DCFF]">
                {appointment.id}
              </span>
            </div>
            <p className="text-xs text-[#5A6372] mt-1">
              Comprehensive clinical consultation record, linked patient history, and audit timeline.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-[#DDE6DA] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#F1F5EF] transition-colors shadow-2xs"
          >
            <Printer className="h-4 w-4" />
            Print Summary
          </button>

          {(appointment.status === "Requested" || appointment.status === "Under Review") && (
            <button
              onClick={() => setModalType("confirm")}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Check className="h-4 w-4" />
              Confirm Booking
            </button>
          )}

          {appointment.status !== "Cancelled" && appointment.status !== "Completed" && (
            <>
              <button
                onClick={() => setModalType("reschedule")}
                className="flex items-center gap-1.5 rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] px-3.5 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#E4EBE0] transition-colors shadow-2xs"
              >
                <RotateCcw className="h-4 w-4 text-[#0055A4]" />
                Reschedule
              </button>

              <button
                onClick={() => setModalType("complete")}
                className="flex items-center gap-1.5 rounded-xl bg-[#0055A4] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004282] transition-colors shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Completed
              </button>

              <button
                onClick={() => setModalType("cancel")}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2-COLUMN LAYOUT: Main Info + Right Sidebar (Timeline & Metadata) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: Main Consultation Details (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Appointment Header Card */}
          <div className="rounded-2xl border border-[#DDE6DA] bg-white p-6 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#DDE6DA] pb-5">
              <div>
                <span className="font-mono text-xs font-bold text-[#0055A4]">
                  REFERENCE: {appointment.id}
                </span>
                <h2 className="text-xl font-bold text-[#1F2B46] mt-1">
                  {appointment.appointmentDate} &bull; {appointment.timeSlot}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#5A6372]">
                  <span className="font-semibold text-[#1F2B46]">{appointment.appointmentType}</span>
                  <span>&bull;</span>
                  <span>Source: {appointment.source}</span>
                  <span>&bull;</span>
                  <span>Facility Scope: St. Jude Campus North</span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1">
                <span className="text-xs text-[#5A6372]">Workflow Mode</span>
                <span className="rounded-lg bg-[#EDF2E9] px-2.5 py-1 text-xs font-semibold text-[#1F2B46] border border-[#DDE6DA]">
                  {appointment.workflow === "facility_assigned" ? "Facility Assigned (Workflow A)" : "Patient Chosen (Workflow B)"}
                </span>
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="mt-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6372]">
                Reason for Visit / Chief Complaint
              </h3>
              <p className="rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-4 text-xs font-medium text-[#1F2B46] leading-relaxed">
                {appointment.reasonForVisit}
              </p>
            </div>

            {/* Patient Notes */}
            {appointment.patientNotes && (
              <div className="mt-5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6372]">
                  Patient Notes & Special Requests
                </h3>
                <p className="rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-4 text-xs text-[#1F2B46]/80 leading-relaxed italic">
                  &ldquo;{appointment.patientNotes}&rdquo;
                </p>
              </div>
            )}

            {/* Clinical / Staff Notes */}
            <div className="mt-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6372]">
                Staff & Clinical Care Notes
              </h3>
              <p className="rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-4 text-xs text-[#1F2B46]/80 leading-relaxed">
                {appointment.staffNotes || "No preliminary clinical instructions recorded."}
              </p>
            </div>
          </div>

          {/* Patient Card Linked to /dashboard/patients/[patientId] */}
          <div className="rounded-2xl border border-[#DDE6DA] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#DDE6DA] pb-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#0055A4]" />
                <h3 className="text-base font-bold text-[#1F2B46]">Patient Profile</h3>
              </div>
              <Link
                href={`/dashboard/patients/${appointment.facilityPatientId}`}
                className="flex items-center gap-1 text-xs font-bold text-[#0055A4] hover:underline"
              >
                <span>Full Patient Dossier</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0055A4] text-white font-bold text-lg shadow-xs">
                  {appointment.patientName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#1F2B46]">
                    {appointment.patientName}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#5A6372]">
                    <span>MRN: <strong className="text-[#1F2B46]">{appointment.facilityPatientId}</strong></span>
                    <span>&bull;</span>
                    <span>Age: <strong className="text-[#1F2B46]">{appointment.patientAge} ({appointment.patientGender})</strong></span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {appointment.patientPhone}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/dashboard/patients/${appointment.facilityPatientId}`}
                className="rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] px-4 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#E4EBE0] transition-colors text-center"
              >
                View Medical History
              </Link>
            </div>
          </div>

          {/* Assigned Physician & Department */}
          <div className="rounded-2xl border border-[#DDE6DA] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#DDE6DA] pb-4">
              <Stethoscope className="h-5 w-5 text-[#0055A4]" />
              <h3 className="text-base font-bold text-[#1F2B46]">
                Assigned Clinical Provider
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0055A4]/10 text-[#0055A4] font-bold">
                    Dr
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1F2B46]">{appointment.doctorName}</h4>
                    <p className="text-xs text-[#5A6372]">Attending Physician</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-[#5A6372]">
                  <span>Provider ID: <strong className="text-[#1F2B46]">{appointment.doctorId}</strong></span>
                </div>
              </div>

              <div className="rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0055A4]/10 text-[#0055A4]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1F2B46]">{appointment.department}</h4>
                    <p className="text-xs text-[#5A6372]">Campus North Specialty Wing</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-[#5A6372]">
                  <span>Floor 3, Diagnostic & Consultation Suites</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Audit Timeline & Metadata (1 col) */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-2xl border border-[#DDE6DA] bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6372] border-b border-[#DDE6DA] pb-3">
              Appointment Summary
            </h3>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5A6372]">Submission Date:</span>
                <span className="font-semibold text-[#1F2B46]">{appointment.requestSubmissionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6372]">Booking Channel:</span>
                <span className="font-semibold text-[#1F2B46]">{appointment.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6372]">Duration:</span>
                <span className="font-semibold text-[#1F2B46]">{appointment.durationMinutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6372]">Isolation:</span>
                <span className="font-semibold text-emerald-700">Facility Isolated</span>
              </div>
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="rounded-2xl border border-[#DDE6DA] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#DDE6DA] pb-3">
              <ShieldCheck className="h-4 w-4 text-[#0055A4]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2B46]">
                Audit Trail & History
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              {appointment.timeline.map((event, idx) => (
                <div key={idx} className="relative pl-6">
                  {/* Timeline bullet & line */}
                  <div className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-white bg-[#0055A4] shadow-xs" />
                  {idx !== appointment.timeline.length - 1 && (
                    <div className="absolute left-[5px] top-4 h-full w-[2px] bg-[#DDE6DA]" />
                  )}

                  <div>
                    <span className="text-[11px] font-bold text-[#1F2B46]">
                      {event.title}
                    </span>
                    <p className="text-[11px] text-[#5A6372] leading-relaxed mt-0.5">
                      {event.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[#5A6372]/80">
                      <span>{event.timestamp}</span>
                      <span>&bull;</span>
                      <span>By {event.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Confirm */}
      {modalType === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DDE6DA] bg-white p-6 shadow-xl animate-in fade-in">
            <h3 className="text-lg font-bold text-[#1F2B46]">Confirm Appointment</h3>
            <p className="mt-1 text-xs text-[#5A6372]">
              Are you sure you want to confirm this booking for <strong>{appointment.patientName}</strong> on <strong>{appointment.appointmentDate}</strong> at <strong>{appointment.timeSlot}</strong>?
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalType(null)}
                className="rounded-xl border border-[#DDE6DA] px-4 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#F1F5EF] transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Yes, Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reschedule */}
      {modalType === "reschedule" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DDE6DA] bg-white p-6 shadow-xl animate-in fade-in">
            <h3 className="text-lg font-bold text-[#1F2B46]">Reschedule Appointment</h3>
            <p className="mt-1 text-xs text-[#5A6372]">
              Select a new date and time slot for Dr. {appointment.doctorName}.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1F2B46]">Target Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] p-2.5 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1F2B46]">Available Time Slot</label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] p-2.5 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
                >
                  {AVAILABLE_TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              {errorMessage && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalType(null)}
                className="rounded-xl border border-[#DDE6DA] px-4 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#F1F5EF] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                className="rounded-xl bg-[#0055A4] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004282] transition-colors shadow-sm"
              >
                Save Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cancel */}
      {modalType === "cancel" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-xl animate-in fade-in">
            <h3 className="text-lg font-bold text-rose-700">Cancel Appointment</h3>
            <p className="mt-1 text-xs text-[#5A6372]">
              This action will mark the appointment as cancelled and log the cancellation reason in the audit history.
            </p>

            <div className="mt-4">
              <label className="text-xs font-bold text-[#1F2B46]">
                Cancellation Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="e.g. Patient requested cancellation due to scheduling conflict..."
                className="mt-1 w-full rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] p-2.5 text-xs text-[#1F2B46] focus:border-rose-500 focus:outline-none"
              />
              {errorMessage && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errorMessage}</p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalType(null)}
                className="rounded-xl border border-[#DDE6DA] px-4 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#F1F5EF] transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancel}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Mark Completed */}
      {modalType === "complete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DDE6DA] bg-white p-6 shadow-xl animate-in fade-in">
            <h3 className="text-lg font-bold text-[#1F2B46]">Conclude Consultation</h3>
            <p className="mt-1 text-xs text-[#5A6372]">
              Mark this consultation appointment as Completed for <strong>{appointment.patientName}</strong>.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalType(null)}
                className="rounded-xl border border-[#DDE6DA] px-4 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#F1F5EF] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                className="rounded-xl bg-[#0055A4] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004282] transition-colors shadow-sm"
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
