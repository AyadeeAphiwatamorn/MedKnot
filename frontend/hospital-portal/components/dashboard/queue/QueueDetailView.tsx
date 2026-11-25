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
  Play,
  ArrowRight,
  ShieldCheck,
  Check,
  Phone,
  Printer,
  ChevronRight,
  Activity,
  Layers,
  Info,
  ArrowLeft,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { QueueEntry, QueueStatus } from "@/lib/queue/types";
import { QueueService } from "@/lib/queue/queue-service";

interface QueueDetailViewProps {
  initialEntry: QueueEntry;
  isGuestMode?: boolean;
}

export function QueueDetailView({ initialEntry, isGuestMode = false }: QueueDetailViewProps) {
  const router = useRouter();
  const [entry, setEntry] = useState<QueueEntry>(initialEntry);

  // Status Action Modal State
  const [actionModal, setActionModal] = useState<QueueStatus | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [roomInput, setRoomInput] = useState(entry.roomNumber || "Room 301");
  const [actionError, setActionError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (actionModal) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setActionModal(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [actionModal]);

  const refreshEntry = () => {
    const updated = QueueService.getQueueEntryById(entry.id);
    if (updated) setEntry(updated);
  };

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case "Checked In":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Waiting":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "In Consultation":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Completed":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "No Show":
        return "bg-red-100 text-red-800 border-red-200";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleExecuteStatusTransition = () => {
    if (!actionModal) return;
    setActionError("");

    if ((actionModal === "Cancelled" || actionModal === "No Show") && !actionReason.trim()) {
      setActionError("Please provide an explanatory reason.");
      return;
    }

    const res = QueueService.updateQueueStatus(entry.id, actionModal, {
      actor: "Michael Lee (Hospital Administration)",
      reason: actionReason.trim() ? actionReason : undefined,
      roomNumber: roomInput.trim() ? roomInput : undefined,
    });

    if (res.success) {
      setActionModal(null);
      refreshEntry();
      setSuccessMsg(`Patient visit status transitioned to "${actionModal}".`);
      setTimeout(() => setSuccessMsg(""), 3500);
    } else {
      setActionError(res.error || "Failed to update queue status.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardShell activeNav="queue-management">
      {/* Breadcrumb & Scope Pill */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs text-[#5A6372]">
          <Link href="/dashboard" className="hover:text-[#0055A4] flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-sm">home</span>
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link href="/dashboard/queue" className="hover:text-[#0055A4] transition-colors">
            Queue Management
          </Link>
          <span>/</span>
          <span className="text-[#1F2B46] font-semibold">{entry.queueNumber}</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF2E9] text-[#2D382B] border border-[#DDE6DA]">
            <span className="material-symbols-outlined text-xs text-[#0055A4]">domain</span>
            <span>Facility Scope: St. Jude Medical Center (North Campus)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1F2B46] border border-[#DDE6DA]">
            <span className="material-symbols-outlined text-xs text-[#34A853]">verified</span>
            <span>Active Outpatient Flow</span>
          </span>
        </div>
      </div>

      {/* Header Banner with Back Button & Actions */}
      <div className="bg-white border border-[#DDE6DA] rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/queue"
            className="p-2.5 rounded-xl border border-[#DDE6DA] text-[#5A6372] hover:text-[#1F2B46] hover:bg-[#F1F5EF] transition-colors shrink-0"
            title="Back to Queue Overview"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#1F2B46]">Visit Dossier</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(entry.status)}`}>
                {entry.status}
              </span>
              <span className="font-mono text-xs font-bold text-[#0055A4] bg-[#E7F0FF] px-2.5 py-0.5 rounded-md border border-[#C7DCFF]">
                Token {entry.queueNumber}
              </span>
            </div>
            <p className="text-xs text-[#5A6372] mt-1">
              Active visit token status, estimated consultation sequence, and clinical audit trail.
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
            Print Token
          </button>

          {entry.status === "Checked In" && (
            <button
              onClick={() => setActionModal("Waiting")}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors shadow-sm"
            >
              <ArrowRight className="h-4 w-4" />
              Call to Waiting Area
            </button>
          )}

          {entry.status === "Waiting" && (
            <button
              onClick={() => setActionModal("In Consultation")}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Play className="h-4 w-4" />
              Call into Consultation
            </button>
          )}

          {entry.status === "In Consultation" && (
            <button
              onClick={() => setActionModal("Completed")}
              className="flex items-center gap-1.5 rounded-xl bg-[#0055A4] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004282] transition-colors shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark Visit Completed
            </button>
          )}

          {entry.status !== "Completed" && entry.status !== "Cancelled" && entry.status !== "No Show" && (
            <>
              <button
                onClick={() => setActionModal("No Show")}
                className="flex items-center gap-1.5 rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] px-3.5 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#E4EBE0] transition-colors shadow-2xs"
              >
                Mark No-Show
              </button>
              <button
                onClick={() => setActionModal("Cancelled")}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs"
              >
                <XCircle className="h-4 w-4" />
                Cancel Entry
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: Main Visit Details (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header Card */}
          <div className="rounded-2xl border border-[#DDE6DA] bg-white p-6 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#DDE6DA] pb-5">
              <div>
                <span className="font-mono text-xs font-bold text-[#0055A4]">
                  QUEUE ENTRY REF: {entry.id}
                </span>
                <h2 className="text-xl font-bold text-[#1F2B46] mt-1">
                  Queue Token: {entry.queueNumber}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#5A6372]">
                  <span>Checked In: <strong className="text-[#1F2B46]">{entry.checkInTime}</strong></span>
                  <span>&bull;</span>
                  <span>Appointment Slot: <strong className="text-[#1F2B46]">{entry.appointmentTime}</strong></span>
                  <span>&bull;</span>
                  <span>Date: <strong className="text-[#1F2B46]">{entry.appointmentDate}</strong></span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1">
                <span className="text-xs text-[#5A6372]">Assigned Suite</span>
                <span className="rounded-xl bg-[#EDF2E9] px-3.5 py-1.5 text-xs font-bold text-[#1F2B46] border border-[#DDE6DA]">
                  {entry.roomNumber || "Pending Room Allocation"}
                </span>
              </div>
            </div>

            {/* Waiting Time Metrics */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-3.5 text-xs">
                <span className="text-[#5A6372] block mb-0.5">Estimated Wait Time</span>
                <span className="text-sm font-bold text-[#1F2B46]">
                  {entry.estimatedWaitMinutes !== undefined ? `~${entry.estimatedWaitMinutes} minutes (est.)` : "Not available"}
                </span>
                <p className="text-[10px] text-[#5A6372] mt-0.5 italic">Approximate only &bull; Non-guaranteed</p>
              </div>

              <div className="rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-3.5 text-xs">
                <span className="text-[#5A6372] block mb-0.5">Recorded Wait Duration</span>
                <span className="text-sm font-bold text-[#1F2B46]">
                  {entry.actualWaitMinutes !== undefined ? `${entry.actualWaitMinutes} minutes` : "In active queue"}
                </span>
                <p className="text-[10px] text-[#5A6372] mt-0.5">Check-in to consult start</p>
              </div>

              <div className="rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-3.5 text-xs">
                <span className="text-[#5A6372] block mb-0.5">Triage Priority</span>
                <span className="text-sm font-bold text-purple-700">
                  {entry.priority}
                </span>
                <p className="text-[10px] text-[#5A6372] mt-0.5">Clinical prioritization</p>
              </div>
            </div>

            {/* Chief Complaint */}
            <div className="mt-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6372]">
                Reason for Visit / Chief Complaint
              </h3>
              <p className="rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-4 text-xs font-medium text-[#1F2B46] leading-relaxed">
                {entry.chiefComplaint}
              </p>
            </div>

            {/* Staff Intake Notes */}
            <div className="mt-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6372]">
                Staff Intake & Triage Notes
              </h3>
              <p className="rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-4 text-xs text-[#1F2B46]/80 leading-relaxed">
                {entry.staffNotes || "No intake observations recorded."}
              </p>
            </div>
          </div>

          {/* Patient Card linked to /dashboard/patients/[patientId] */}
          <div className="rounded-2xl border border-[#DDE6DA] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#DDE6DA] pb-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#0055A4]" />
                <h3 className="text-base font-bold text-[#1F2B46]">Patient Profile</h3>
              </div>
              <Link
                href={`/dashboard/patients/${entry.facilityPatientId}`}
                className="flex items-center gap-1 text-xs font-bold text-[#0055A4] hover:underline"
              >
                <span>Full Patient Dossier</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0055A4] text-white font-bold text-lg shadow-xs">
                  {entry.patientName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#1F2B46]">
                    {entry.patientName}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#5A6372]">
                    <span>MRN: <strong className="text-[#1F2B46]">{entry.facilityPatientId}</strong></span>
                    <span>&bull;</span>
                    <span>Age: <strong className="text-[#1F2B46]">{entry.patientAge}y ({entry.patientGender})</strong></span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {entry.patientPhone}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/dashboard/patients/${entry.facilityPatientId}`}
                className="rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] px-4 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#E4EBE0] transition-colors text-center"
              >
                View Patient History
              </Link>
            </div>
          </div>

          {/* Assigned Provider & Department */}
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
                    <h4 className="text-sm font-bold text-[#1F2B46]">{entry.doctorName}</h4>
                    <p className="text-xs text-[#5A6372]">Attending OPD Physician</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-[#5A6372]">
                  <span>Provider ID: <strong className="text-[#1F2B46]">{entry.doctorId}</strong></span>
                </div>
              </div>

              <div className="rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0055A4]/10 text-[#0055A4]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1F2B46]">{entry.department}</h4>
                    <p className="text-xs text-[#5A6372]">Campus North Clinical Wing</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-[#5A6372]">
                  <span>Assigned Location: <strong className="text-[#1F2B46]">{entry.roomNumber || "Main Triage Hall"}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Linked Appointment & Audit Trail (1 col) */}
        <div className="space-y-6">
          {/* Linked Appointment Card */}
          <div className="rounded-2xl border border-[#DDE6DA] bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6372] border-b border-[#DDE6DA] pb-3">
              Originating Appointment
            </h3>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5A6372]">Appointment Ref:</span>
                <Link
                  href={`/dashboard/appointments/${entry.appointmentId}`}
                  className="font-mono font-bold text-[#0055A4] hover:underline"
                >
                  {entry.appointmentId}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6372]">Booked Slot:</span>
                <span className="font-semibold text-[#1F2B46]">{entry.appointmentTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6372]">Appointment Date:</span>
                <span className="font-semibold text-[#1F2B46]">{entry.appointmentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6372]">Check-in Punctuality:</span>
                <span className="font-semibold text-emerald-700">Checked In On Time</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#DDE6DA]">
              <Link
                href={`/dashboard/appointments/${entry.appointmentId}`}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] p-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#E4EBE0] transition-colors"
              >
                <FileText className="h-3.5 w-3.5 text-[#0055A4]" />
                <span>Open Appointment Dossier</span>
              </Link>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-2xl border border-[#DDE6DA] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#DDE6DA] pb-3">
              <ShieldCheck className="h-4 w-4 text-[#0055A4]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2B46]">
                Visit Activity Timeline
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              {entry.timeline.map((event, idx) => (
                <div key={idx} className="relative pl-6">
                  {/* Timeline bullet & line */}
                  <div className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-white bg-[#0055A4] shadow-xs" />
                  {idx !== entry.timeline.length - 1 && (
                    <div className="absolute left-[5px] top-4 h-full w-[2px] bg-[#DDE6DA]" />
                  )}

                  <div>
                    <span className="text-[11px] font-bold text-[#1F2B46]">
                      {event.title}
                    </span>
                    <p className="text-[11px] text-[#5A6372] leading-relaxed mt-0.5">
                      {event.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[#5A6372]">
                      <span>{event.timestamp}</span>
                      <span>&bull;</span>
                      <span>{event.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM STATUS MODAL */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DDE6DA] bg-white p-6 shadow-xl animate-in fade-in">
            <h3 className="text-lg font-bold text-[#1F2B46]">Confirm Queue Transition</h3>
            <p className="mt-1 text-xs text-[#5A6372] leading-relaxed">
              Transition <strong>{entry.patientName}</strong> ({entry.queueNumber}) from &ldquo;{entry.status}&rdquo; to &ldquo;<strong>{actionModal}</strong>&rdquo;?
            </p>

            {actionModal === "In Consultation" && (
              <div className="mt-4">
                <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                  Examination Room
                </label>
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="e.g. Room 302, Suite B..."
                  className="w-full rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] p-2.5 text-xs text-[#1F2B46]"
                />
              </div>
            )}

            {(actionModal === "Cancelled" || actionModal === "No Show") && (
              <div className="mt-4">
                <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                  Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Provide clinical or operational rationale..."
                  className="w-full rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] p-2.5 text-xs text-[#1F2B46]"
                />
              </div>
            )}

            {actionError && (
              <p className="mt-2 text-xs font-semibold text-rose-600">{actionError}</p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#DDE6DA] pt-4">
              <button
                onClick={() => setActionModal(null)}
                className="rounded-xl border border-[#DDE6DA] px-4 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#F1F5EF] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteStatusTransition}
                className="rounded-xl bg-[#0055A4] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004282] transition-colors shadow-sm"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
