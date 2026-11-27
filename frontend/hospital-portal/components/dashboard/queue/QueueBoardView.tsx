"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  UserCheck,
  Stethoscope,
  Building2,
  ArrowRight,
  Plus,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { QueueSubnav } from "@/components/dashboard/queue/QueueSubnav";
import { QueueEntry, QueueStatus } from "@/lib/queue/types";
import { QueueService } from "@/lib/queue/queue-service";
import { useFacility } from "@/components/dashboard/facility/FacilityContext";
import { AVAILABLE_DEPARTMENTS, AVAILABLE_DOCTORS } from "@/lib/appointments/mock-data";

interface QueueBoardViewProps {
  isGuestMode?: boolean;
}

export function QueueBoardView({ isGuestMode = false }: QueueBoardViewProps) {
  const { activeCampus } = useFacility();
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Status Action Modal State
  const [confirmModal, setConfirmModal] = useState<{
    entry: QueueEntry;
    newStatus: QueueStatus;
    roomNumber?: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (confirmModal) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setConfirmModal(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [confirmModal]);

  // All Today's Entries
  const allToday = useMemo(() => {
    return QueueService.getTodayQueueEntries(activeCampus.id);
  }, [refreshKey, activeCampus.id]);

  // Stats for badge
  const stats = useMemo(() => {
    return QueueService.getQueueStats(activeCampus.id);
  }, [refreshKey, activeCampus.id]);

  // Filtered Entries
  const filtered = useMemo(() => {
    return allToday.filter((item) => {
      if (selectedDept !== "All" && item.department !== selectedDept) return false;
      if (selectedDoctor !== "All" && item.doctorId !== selectedDoctor) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.patientName.toLowerCase().includes(q);
        const matchesId = item.facilityPatientId.toLowerCase().includes(q);
        const matchesQNum = item.queueNumber.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesQNum) return false;
      }
      return true;
    });
  }, [allToday, selectedDept, selectedDoctor, searchQuery]);

  // Split into Kanban / Operational Board Columns
  const checkedInList = useMemo(() => filtered.filter((q) => q.status === "Checked In"), [filtered]);
  const waitingList = useMemo(() => filtered.filter((q) => q.status === "Waiting"), [filtered]);
  const inConsultationList = useMemo(() => filtered.filter((q) => q.status === "In Consultation"), [filtered]);
  const completedList = useMemo(() => filtered.filter((q) => q.status === "Completed"), [filtered]);

  // Handlers
  const openConfirmModal = (entry: QueueEntry, newStatus: QueueStatus) => {
    setConfirmModal({ entry, newStatus, roomNumber: entry.roomNumber });
    setRoomInput(entry.roomNumber || "Consultation Suite 1");
    setActionReason("");
    setActionError("");
  };

  const handleExecuteStatusChange = () => {
    if (!confirmModal) return;
    setActionError("");

    if ((confirmModal.newStatus === "Cancelled" || confirmModal.newStatus === "No Show") && !actionReason.trim()) {
      setActionError("Please provide an explanatory reason.");
      return;
    }

    const res = QueueService.updateQueueStatus(confirmModal.entry.id, confirmModal.newStatus, {
      actor: "Michael Lee (Reception & Admin)",
      reason: actionReason.trim() ? actionReason : undefined,
      roomNumber: roomInput.trim() ? roomInput : undefined,
    });

    if (res.success) {
      setConfirmModal(null);
      setRefreshKey((prev) => prev + 1);
      setSuccessMsg(`Patient ${confirmModal.entry.queueNumber} transitioned to "${confirmModal.newStatus}".`);
      setTimeout(() => setSuccessMsg(""), 3500);
    } else {
      setActionError(res.error || "Failed to update status.");
    }
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
          <span className="text-[#1F2B46] font-semibold">Live Board</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E3EBDD] text-[#2D382B] border border-[#C8D6C3]">
            <span className="material-symbols-outlined text-xs text-[#0055A4]">domain</span>
            <span>Facility Scope: St. Jude Medical Center (North Campus)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1F2B46] border border-[#C8D6C3]">
            <span className="material-symbols-outlined text-xs text-[#34A853]">verified</span>
            <span>Live Outpatient Floor</span>
          </span>
        </div>
      </div>

      {/* Header Banner & Standard Sub-navigation Tabs matching Overview */}
      <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#1F2B46]">Operational Queue Board</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E7F0FF] text-[#0055A4] border border-[#C7DCFF]">
                Kanban Floor View
              </span>
            </div>
            <p className="text-sm text-[#5A6372] mt-1">
              Visual floor routing across triage check-in, lounge waiting, active physician consultation, and discharge.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setRefreshKey((p) => p + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#C8D6C3] bg-[#E3EBDD] hover:bg-[#D5E0D2] text-[#1F2B46] text-xs font-semibold transition-colors shadow-2xs"
              title="Synchronize floor board"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#0055A4]" />
              <span>Sync Board</span>
            </button>
          </div>
        </div>

        {/* Standard Sub-navigation Tabs */}
        <QueueSubnav waitingCount={stats.waiting} inConsultationCount={stats.inConsultation} />
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Quick Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#C5D2C0] bg-white p-4 shadow-[0_3px_10px_rgba(31,43,70,0.10)] md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5A6372]" />
          <input
            type="text"
            placeholder="Search patient, token, MRN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] py-2 pl-9 pr-3 text-xs text-[#1F2B46] placeholder-[#5A6372] focus:border-[#0055A4] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            aria-label="Filter board by department"
            className="rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] px-3 py-2 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
          >
            <option value="All">All Departments</option>
            {AVAILABLE_DEPARTMENTS.map((dept: string) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            aria-label="Filter board by physician"
            className="rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] px-3 py-2 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
          >
            <option value="All">All Doctors</option>
            {AVAILABLE_DOCTORS.map((doc: { id: string; name: string }) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 OPERATIONAL KANBAN COLUMNS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* COLUMN 1: CHECKED IN */}
        <div className="flex flex-col rounded-2xl border border-[#C8D6C3] bg-[#E1E9DC] p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#C8D6C3] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F2B46]">1. Checked In</h2>
            </div>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
              {checkedInList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
            {checkedInList.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5A6372] italic">
                No patients in check-in lobby
              </div>
            ) : (
              checkedInList.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-[#C5D2C0] bg-white p-4 shadow-[0_3px_10px_rgba(31,43,70,0.10)] hover:border-[#0055A4] hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)] transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#0055A4] bg-[#E7F0FF] px-2 py-0.5 rounded border border-[#C7DCFF]">
                      {q.queueNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-[#5A6372]">
                      In: {q.checkInTime}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/queue/${q.id}`}
                    className="font-bold text-sm text-[#1F2B46] hover:text-[#0055A4] transition-colors block"
                  >
                    {q.patientName}
                  </Link>
                  <div className="text-[11px] text-[#5A6372] mt-0.5">
                    MRN: {q.facilityPatientId} &bull; {q.department}
                  </div>
                  <div className="text-[11px] text-[#1F2B46] mt-1 font-medium">
                    Dr: {q.doctorName}
                  </div>

                  <p className="mt-2 text-[11px] text-[#5A6372] line-clamp-2 italic bg-[#E1E9DC] p-2 rounded-lg border border-[#C8D6C3]">
                    &ldquo;{q.chiefComplaint}&rdquo;
                  </p>

                  {/* Actions */}
                  <div className="mt-3 flex items-center justify-between border-t border-[#C8D6C3] pt-2.5">
                    <button
                      onClick={() => openConfirmModal(q, "Waiting")}
                      className="flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-600 transition-colors shadow-2xs"
                    >
                      <ArrowRight className="h-3 w-3" />
                      Move to Waiting
                    </button>
                    <button
                      onClick={() => openConfirmModal(q, "No Show")}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      No Show
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: WAITING */}
        <div className="flex flex-col rounded-2xl border border-[#C8D6C3] bg-[#E1E9DC] p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#C8D6C3] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F2B46]">2. Waiting</h2>
            </div>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              {waitingList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
            {waitingList.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5A6372] italic">
                Lounge queue empty
              </div>
            ) : (
              waitingList.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-[#C5D2C0] bg-white p-4 shadow-[0_3px_10px_rgba(31,43,70,0.10)] hover:border-[#0055A4] hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)] transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#0055A4] bg-[#E7F0FF] px-2 py-0.5 rounded border border-[#C7DCFF]">
                      {q.queueNumber}
                    </span>
                    {q.estimatedWaitMinutes !== undefined && (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md font-semibold border border-amber-200">
                        ~{q.estimatedWaitMinutes}m est.
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/queue/${q.id}`}
                    className="font-bold text-sm text-[#1F2B46] hover:text-[#0055A4] transition-colors block"
                  >
                    {q.patientName}
                  </Link>
                  <div className="text-[11px] text-[#5A6372] mt-0.5">
                    MRN: {q.facilityPatientId} &bull; {q.roomNumber || "Suite Assigned"}
                  </div>
                  <div className="text-[11px] text-[#1F2B46] mt-1 font-medium">
                    Dr: {q.doctorName}
                  </div>

                  {q.priority !== "Standard" && (
                    <div className="mt-1.5 text-[10px] font-bold text-purple-700 bg-purple-50 p-1.5 rounded-lg border border-purple-200">
                      PRIORITY: {q.priorityReason || "High Clinical Triage"}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex items-center justify-between border-t border-[#C8D6C3] pt-2.5">
                    <button
                      onClick={() => openConfirmModal(q, "In Consultation")}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                    >
                      <Play className="h-3 w-3" />
                      Start Consultation
                    </button>
                    <button
                      onClick={() => openConfirmModal(q, "Cancelled")}
                      className="text-[11px] text-[#5A6372] hover:text-rose-600 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: IN CONSULTATION */}
        <div className="flex flex-col rounded-2xl border border-[#C8D6C3] bg-[#E1E9DC] p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#C8D6C3] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F2B46]">3. In Consultation</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              {inConsultationList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
            {inConsultationList.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5A6372] italic">
                No active consultations in rooms
              </div>
            ) : (
              inConsultationList.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-emerald-300 bg-white p-4 shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#0055A4] bg-[#E7F0FF] px-2 py-0.5 rounded border border-[#C7DCFF]">
                      {q.queueNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/queue/${q.id}`}
                    className="font-bold text-sm text-[#1F2B46] hover:text-[#0055A4] transition-colors block"
                  >
                    {q.patientName}
                  </Link>
                  <div className="text-[11px] text-[#5A6372] mt-0.5">
                    Room: <strong>{q.roomNumber || "Suite 301"}</strong> &bull; {q.doctorName}
                  </div>

                  <div className="text-[11px] text-[#5A6372] mt-1">
                    Started at: {q.consultationStartTime || "09:30 AM"}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center justify-between border-t border-[#C8D6C3] pt-2.5">
                    <button
                      onClick={() => openConfirmModal(q, "Completed")}
                      className="flex items-center gap-1 rounded-lg bg-[#0055A4] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#004282] transition-colors shadow-2xs"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Mark Completed
                    </button>
                    <Link
                      href={`/dashboard/queue/${q.id}`}
                      className="text-[11px] font-semibold text-[#0055A4] hover:underline"
                    >
                      Dossier
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 4: COMPLETED */}
        <div className="flex flex-col rounded-2xl border border-[#C8D6C3] bg-[#E1E9DC] p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#C8D6C3] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F2B46]">4. Completed</h2>
            </div>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-800">
              {completedList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
            {completedList.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5A6372] italic">
                No completed consults today yet
              </div>
            ) : (
              completedList.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-[#C5D2C0] bg-white p-4 shadow-2xs opacity-85 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#5A6372] bg-[#E3EBDD] px-2 py-0.5 rounded border border-[#C8D6C3]">
                      {q.queueNumber}
                    </span>
                    <span className="text-[10px] text-[#5A6372] font-semibold">
                      Out: {q.completionTime || "10:00 AM"}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/queue/${q.id}`}
                    className="font-bold text-sm text-[#1F2B46] hover:text-[#0055A4] transition-colors block"
                  >
                    {q.patientName}
                  </Link>
                  <div className="text-[11px] text-[#5A6372] mt-0.5">
                    {q.department} &bull; {q.doctorName}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#C8D6C3] pt-2 text-xs">
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Discharged
                    </span>
                    <Link
                      href={`/dashboard/queue/${q.id}`}
                      className="text-[11px] font-semibold text-[#0055A4] hover:underline"
                    >
                      View Summary
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CONFIRM STATUS TRANSITION MODAL */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#C5D2C0] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#1F2B46]">Confirm Queue Transition</h3>
            <p className="mt-1 text-xs text-[#5A6372] leading-relaxed">
              Transition <strong>{confirmModal.entry.patientName}</strong> ({confirmModal.entry.queueNumber}) to &ldquo;<strong>{confirmModal.newStatus}</strong>&rdquo;?
            </p>

            {confirmModal.newStatus === "In Consultation" && (
              <div className="mt-4">
                <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                  Examination Room / Suite
                </label>
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="e.g. Room 302, Cardiac Suite 1..."
                  className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2.5 text-xs text-[#1F2B46]"
                />
              </div>
            )}

            {(confirmModal.newStatus === "Cancelled" || confirmModal.newStatus === "No Show") && (
              <div className="mt-4">
                <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                  Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Provide clinical or operational rationale..."
                  className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2.5 text-xs text-[#1F2B46]"
                />
              </div>
            )}

            {actionError && (
              <p className="mt-2 text-xs font-semibold text-rose-600">{actionError}</p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#C8D6C3] pt-4">
              <button
                onClick={() => setConfirmModal(null)}
                className="rounded-xl border border-[#C8D6C3] px-4 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#E6EDE2] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteStatusChange}
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
