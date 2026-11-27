"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Clock,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Play,
  ArrowRight,
  UserCheck,
  Building2,
  CalendarDays,
  FileText,
  XCircle,
  Sparkles,
  Info,
  Layers,
  Activity,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { QueueSubnav } from "@/components/dashboard/queue/QueueSubnav";
import { QueueEntry, QueueStatus, QueueStats } from "@/lib/queue/types";
import { QueueService } from "@/lib/queue/queue-service";
import { useFacility } from "@/components/dashboard/facility/FacilityContext";
import { AVAILABLE_DEPARTMENTS, AVAILABLE_DOCTORS } from "@/lib/appointments/mock-data";
import { Appointment } from "@/lib/appointments/types";

interface QueueOverviewViewProps {
  isGuestMode?: boolean;
}

const ITEMS_PER_PAGE = 7;

export function QueueOverviewView({ isGuestMode = false }: QueueOverviewViewProps) {
  const router = useRouter();
  const { activeCampus } = useFacility();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("2024-11-25"); // Anchor demo date aligned with mock dataset
  const [sortBy, setSortBy] = useState<"queueNumber" | "checkInTime" | "appointmentTime" | "status">("queueNumber");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check-In Modal state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState("");
  const [checkInPriority, setCheckInPriority] = useState<"Standard" | "Priority" | "Urgent">("Standard");
  const [checkInReason, setCheckInReason] = useState("");
  const [checkInNotes, setCheckInNotes] = useState("");
  const [checkInError, setCheckInError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Status Action Modal state
  const [actionModal, setActionModal] = useState<{
    entry: QueueEntry;
    newStatus: QueueStatus;
  } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionError, setActionError] = useState("");

  // Body scroll lock and Escape key listener for modals
  useEffect(() => {
    const isModalOpen = showCheckInModal || actionModal !== null;
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setShowCheckInModal(false);
          setActionModal(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [showCheckInModal, actionModal]);

  // Eligible appointments for check-in
  const eligibleAppointments: Appointment[] = useMemo(() => {
    return QueueService.getEligibleCheckInAppointments();
  }, [refreshKey, activeCampus.id]);

  // Queue Statistics
  const stats: QueueStats = useMemo(() => {
    return QueueService.getQueueStats(activeCampus.id);
  }, [refreshKey, activeCampus.id]);

  // Query Queue Entries
  const queueEntries: QueueEntry[] = useMemo(() => {
    return QueueService.queryQueue({
      date: selectedDate,
      department: selectedDept,
      doctor: selectedDoctor,
      status: selectedStatus,
      search: searchQuery,
      sortBy,
    });
  }, [selectedDate, selectedDept, selectedDoctor, selectedStatus, searchQuery, sortBy, refreshKey, activeCampus.id]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(queueEntries.length / ITEMS_PER_PAGE));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return queueEntries.slice(start, start + ITEMS_PER_PAGE);
  }, [queueEntries, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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

  // Check In Handler
  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckInError("");

    if (!selectedAptId) {
      setCheckInError("Please select a confirmed appointment to check in.");
      return;
    }

    const res = QueueService.checkInAppointment({
      appointmentId: selectedAptId,
      priority: checkInPriority,
      priorityReason: checkInPriority !== "Standard" ? checkInReason : undefined,
      staffNotes: checkInNotes.trim() ? checkInNotes : undefined,
      actor: "Michael Lee (Front Desk Officer)",
    });

    if (res.success && res.queueEntry) {
      setShowCheckInModal(false);
      setSelectedAptId("");
      setCheckInPriority("Standard");
      setCheckInReason("");
      setCheckInNotes("");
      setRefreshKey((prev) => prev + 1);
      setSuccessMessage(`Patient successfully checked in! Assigned Queue Token: ${res.queueEntry.queueNumber}`);
      setTimeout(() => setSuccessMessage(""), 4000);
    } else {
      setCheckInError(res.error || "Failed to check in appointment.");
    }
  };

  // Status Change Confirmation Handler
  const handleConfirmStatusChange = () => {
    if (!actionModal) return;
    setActionError("");

    if (
      (actionModal.newStatus === "Cancelled" || actionModal.newStatus === "No Show") &&
      !actionReason.trim()
    ) {
      setActionError("Please provide an explanatory reason for cancellation or no-show.");
      return;
    }

    const res = QueueService.updateQueueStatus(actionModal.entry.id, actionModal.newStatus, {
      actor: "Michael Lee (Hospital Administration)",
      reason: actionReason.trim() ? actionReason : undefined,
    });

    if (res.success) {
      setActionModal(null);
      setActionReason("");
      setRefreshKey((prev) => prev + 1);
      setSuccessMessage(`Queue status updated to "${actionModal.newStatus}".`);
      setTimeout(() => setSuccessMessage(""), 3500);
    } else {
      setActionError(res.error || "Failed to update queue status.");
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
          <span className="text-[#1F2B46] font-semibold">Queue Management</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E3EBDD] text-[#2D382B] border border-[#C8D6C3]">
            <span className="material-symbols-outlined text-xs text-[#0055A4]">domain</span>
            <span>Facility Scope: St. Jude Medical Center (North Campus)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1F2B46] border border-[#C8D6C3]">
            <span className="material-symbols-outlined text-xs text-[#34A853]">verified</span>
            <span>Live Facility Flow</span>
          </span>
        </div>
      </div>

      {/* Header Banner & Sub-navigation Tabs matching Appointment Overview */}
      <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#1F2B46]">OPD Patient Queue</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {stats.inConsultation} In Consultation
              </span>
            </div>
            <p className="text-sm text-[#5A6372] mt-1">
              Live outpatient department patient flow, arrival check-in, token distribution, and room routing.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setShowCheckInModal(true);
                setCheckInError("");
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#004382] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Check In Patient</span>
            </button>
          </div>
        </div>

        {/* Standard Sub-navigation Tabs */}
        <QueueSubnav waitingCount={stats.waiting} inConsultationCount={stats.inConsultation} />
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Patients Today */}
        <div className="rounded-2xl border border-[#C5D2C0] bg-white p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)] hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)] transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5A6372]">Total Checked In Today</span>
            <div className="rounded-xl bg-[#E7F0FF] p-2 text-[#0055A4]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-[#1F2B46]">{stats.totalToday}</div>
          <p className="mt-1 text-[11px] text-[#5A6372]">Registered OPD patients today</p>
        </div>

        {/* Waiting */}
        <div className="rounded-2xl border border-[#C5D2C0] bg-white p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)] hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)] transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5A6372]">Waiting in Lounge</span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 border border-amber-200">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-700">{stats.waiting}</div>
          <p className="mt-1 text-[11px] text-[#5A6372]">Awaiting physician consultation call</p>
        </div>

        {/* In Consultation */}
        <div className="rounded-2xl border border-[#C5D2C0] bg-white p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)] hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)] transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5A6372]">In Consultation</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 border border-emerald-200">
              <Stethoscope className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-700">{stats.inConsultation}</div>
          <p className="mt-1 text-[11px] text-[#5A6372]">Actively with attending physician</p>
        </div>

        {/* Completed */}
        <div className="rounded-2xl border border-[#C5D2C0] bg-white p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)] hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)] transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5A6372]">Completed Visits</span>
            <div className="rounded-xl bg-[#E3EBDD] p-2 text-[#5A6372] border border-[#C8D6C3]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-[#1F2B46]">{stats.completed}</div>
          <p className="mt-1 text-[11px] text-[#5A6372]">Discharged or pharmacy routed</p>
        </div>
      </div>

      {/* Operational Policy & Wait Time Advisory Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#C5D2C0] bg-white p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)] text-xs text-[#1F2B46]">
        <div className="rounded-xl bg-[#E7F0FF] p-2 text-[#0055A4] shrink-0 mt-0.5">
          <Info className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-[#1F2B46]">
            Queue & Prioritization Clinical Safety Advisory &bull; St. Jude Medical Center (Campus North)
          </p>
          <p className="text-[#5A6372] leading-relaxed">
            Queue tokens reflect order of arrival and room assignment. Estimated wait times are automated approximations and are never guaranteed. Clinical staff maintain sole discretion and ultimate responsibility for clinical triage urgency; emergency and critical cases override standard token sequence.
          </p>
        </div>
      </div>

      {/* CONTROLS & FILTER BAR */}
      <div className="rounded-2xl border border-[#C5D2C0] bg-white p-5 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5A6372]" />
            <input
              type="text"
              placeholder="Search by patient, queue token, MRN..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] py-2 pl-9 pr-3 text-xs text-[#1F2B46] placeholder-[#5A6372] focus:border-[#0055A4] focus:outline-none"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by department"
              className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
            >
              <option value="All">All Departments</option>
              {AVAILABLE_DEPARTMENTS.map((dept: string) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Filter */}
          <div>
            <select
              value={selectedDoctor}
              onChange={(e) => {
                setSelectedDoctor(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by physician"
              className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
            >
              <option value="All">All Doctors</option>
              {AVAILABLE_DOCTORS.map((doc: { id: string; name: string }) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
              className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Checked In">Checked In</option>
              <option value="Waiting">Waiting</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Completed">Completed</option>
              <option value="No Show">No Show</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by date"
              className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Active Filters & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#C8D6C3] pt-3 text-xs text-[#5A6372]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1F2B46]">Showing:</span>
            <span>{queueEntries.length} patient entries</span>
            {selectedDate === "2024-11-25" && (
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                Today (Demo Date)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1F2B46]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] px-2.5 py-1 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
            >
              <option value="queueNumber">Queue Number</option>
              <option value="checkInTime">Check-In Time</option>
              <option value="appointmentTime">Appointment Time</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* QUEUE TABLE */}
      <div className="rounded-2xl border border-[#C5D2C0] bg-white shadow-[0_3px_10px_rgba(31,43,70,0.10)] overflow-hidden">
        {paginatedEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Layers className="h-12 w-12 text-[#5A6372]/40 mb-3" />
            <h3 className="text-base font-bold text-[#1F2B46]">No Queue Entries Found</h3>
            <p className="text-xs text-[#5A6372] max-w-sm mt-1">
              There are no patient visits in the queue matching the specified date and filter options.
            </p>
            {eligibleAppointments.length > 0 && (
              <button
                onClick={() => setShowCheckInModal(true)}
                className="mt-4 rounded-xl bg-[#0055A4] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#004382] transition-colors"
              >
                Check in an Appointment ({eligibleAppointments.length} Eligible)
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#C5D2C0] bg-[#E1E9DC] text-xs font-semibold text-[#1F2B46]">
                <tr>
                  <th className="py-3.5 px-4">Queue No</th>
                  <th className="py-3.5 px-4">Patient Information</th>
                  <th className="py-3.5 px-4">Appointment</th>
                  <th className="py-3.5 px-4">Doctor & Department</th>
                  <th className="py-3.5 px-4">Check-In Time</th>
                  <th className="py-3.5 px-4">Wait Duration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C8D6C3]">
                {paginatedEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-[#E6EDE2] transition-colors">
                    {/* Queue Number */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#0055A4] bg-[#E7F0FF] px-2.5 py-0.5 rounded-md border border-[#C7DCFF]">
                          {item.queueNumber}
                        </span>
                        {item.priority !== "Standard" && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              item.priority === "Urgent"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}
                          >
                            {item.priority}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Patient Info */}
                    <td className="py-3.5 px-4">
                      <div>
                        <Link
                          href={`/dashboard/patients/${item.facilityPatientId}`}
                          className="font-bold text-[#1F2B46] hover:text-[#0055A4] transition-colors"
                        >
                          {item.patientName}
                        </Link>
                        <div className="text-[11px] text-[#5A6372]">
                          MRN: {item.facilityPatientId} &bull; {item.patientAge}y ({item.patientGender[0]})
                        </div>
                      </div>
                    </td>

                    {/* Appointment Slot */}
                    <td className="py-3.5 px-4">
                      <div className="text-[#1F2B46] font-semibold">{item.appointmentTime}</div>
                      <Link
                        href={`/dashboard/appointments/${item.appointmentId}`}
                        className="text-[11px] text-[#0055A4] font-mono hover:underline"
                      >
                        {item.appointmentId}
                      </Link>
                    </td>

                    {/* Doctor & Department */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1F2B46]">{item.doctorName}</div>
                      <div className="text-[11px] text-[#5A6372]">{item.department}</div>
                    </td>

                    {/* Check-In Time */}
                    <td className="py-3.5 px-4">
                      <span className="text-[#1F2B46] font-medium">{item.checkInTime}</span>
                      {item.roomNumber && (
                        <div className="text-[10px] text-[#5A6372]">{item.roomNumber}</div>
                      )}
                    </td>

                    {/* Wait Duration */}
                    <td className="py-3.5 px-4">
                      {item.actualWaitMinutes !== undefined ? (
                        <span className="font-semibold text-[#1F2B46]">
                          {item.actualWaitMinutes} mins
                        </span>
                      ) : item.estimatedWaitMinutes !== undefined && item.status !== "Completed" && item.status !== "Cancelled" ? (
                        <span className="text-[#5A6372] italic" title="Approximate estimate only">
                          ~{item.estimatedWaitMinutes} mins (est.)
                        </span>
                      ) : (
                        <span className="text-[#5A6372]/50">—</span>
                      )}
                    </td>

                    {/* Current Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === "Checked In" && (
                          <button
                            onClick={() => setActionModal({ entry: item, newStatus: "Waiting" })}
                            className="rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-600 transition-colors shadow-2xs"
                          >
                            Call to Waiting
                          </button>
                        )}

                        {item.status === "Waiting" && (
                          <button
                            onClick={() => setActionModal({ entry: item, newStatus: "In Consultation" })}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                          >
                            <Play className="h-3 w-3" />
                            Start Consult
                          </button>
                        )}

                        {item.status === "In Consultation" && (
                          <button
                            onClick={() => setActionModal({ entry: item, newStatus: "Completed" })}
                            className="flex items-center gap-1 rounded-lg bg-[#0055A4] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#004282] transition-colors shadow-2xs"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Conclude
                          </button>
                        )}

                        <Link
                          href={`/dashboard/queue/${item.id}`}
                          className="rounded-lg border border-[#C8D6C3] bg-white p-1.5 text-[#5A6372] hover:bg-[#E6EDE2] hover:text-[#0055A4] transition-colors"
                          title="View Visit Dossier"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION BAR */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#C8D6C3] bg-white px-5 py-3.5 text-xs">
            <span className="text-[#5A6372]">
              Page {currentPage} of {totalPages} &bull; Total {queueEntries.length} records
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-xl border border-[#C8D6C3] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#E6EDE2] disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-[#C8D6C3] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#E6EDE2] disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CHECK-IN MODAL */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#C5D2C0] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#C8D6C3] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#1F2B46]">Check In Patient</h3>
                <p className="text-xs text-[#5A6372]">
                  Select an eligible confirmed appointment to generate an OPD queue token.
                </p>
              </div>
              <button
                onClick={() => setShowCheckInModal(false)}
                className="rounded-lg p-1.5 text-[#5A6372] hover:bg-[#E6EDE2]"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCheckInSubmit} className="mt-4 space-y-4">
              {/* Select Confirmed Appointment */}
              <div>
                <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                  Confirmed Appointment <span className="text-rose-500">*</span>
                </label>
                {eligibleAppointments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#C8D6C3] bg-[#E3EBDD] p-4 text-center text-xs text-[#5A6372]">
                    No confirmed appointments awaiting check-in for today. All booked patients have already checked in.
                  </div>
                ) : (
                  <select
                    value={selectedAptId}
                    onChange={(e) => setSelectedAptId(e.target.value)}
                    className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2.5 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
                  >
                    <option value="">-- Select Patient Appointment --</option>
                    {eligibleAppointments.map((apt) => (
                      <option key={apt.id} value={apt.id}>
                        {apt.timeSlot} — {apt.patientName} ({apt.department} &bull; {apt.doctorName})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Triage Priority */}
              <div>
                <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                  Queue Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Standard", "Priority", "Urgent"] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setCheckInPriority(p)}
                      className={`rounded-xl border p-2 text-xs font-semibold transition-colors ${
                        checkInPriority === p
                          ? "border-[#0055A4] bg-[#0055A4] text-white"
                          : "border-[#C8D6C3] bg-[#E3EBDD] text-[#1F2B46]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Justification if Priority/Urgent */}
              {checkInPriority !== "Standard" && (
                <div>
                  <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                    Clinical Prioritization Reason
                  </label>
                  <input
                    type="text"
                    value={checkInReason}
                    onChange={(e) => setCheckInReason(e.target.value)}
                    placeholder="e.g. Senior citizen, high triage vitals, severe acute pain..."
                    className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2.5 text-xs text-[#1F2B46]"
                  />
                </div>
              )}

              {/* Staff Notes */}
              <div>
                <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                  Front Desk Intake Notes
                </label>
                <textarea
                  rows={2}
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  placeholder="e.g. Wheelchair assistance provided, patient brought external imaging..."
                  className="w-full rounded-xl border border-[#AEBEAA] bg-[#F3F7F2] p-2.5 text-xs text-[#1F2B46]"
                />
              </div>

              {checkInError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{checkInError}</span>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#C8D6C3] pt-4">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="rounded-xl border border-[#C8D6C3] px-4 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#E6EDE2] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={eligibleAppointments.length === 0}
                  className="rounded-xl bg-[#0055A4] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#004282] disabled:opacity-50 transition-colors shadow-sm"
                >
                  Confirm Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM STATUS CHANGE MODAL */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#C5D2C0] bg-white p-6 shadow-xl animate-in fade-in">
            <h3 className="text-lg font-bold text-[#1F2B46]">
              Confirm Queue Status Transition
            </h3>
            <p className="mt-1 text-xs text-[#5A6372]">
              Move <strong>{actionModal.entry.patientName}</strong> ({actionModal.entry.queueNumber}) from &ldquo;{actionModal.entry.status}&rdquo; to &ldquo;<strong>{actionModal.newStatus}</strong>&rdquo;?
            </p>

            {(actionModal.newStatus === "Cancelled" || actionModal.newStatus === "No Show") && (
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

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setActionModal(null)}
                className="rounded-xl border border-[#C8D6C3] px-4 py-2.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#E6EDE2] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className="rounded-xl bg-[#0055A4] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004282] transition-colors shadow-sm"
              >
                Confirm Transition
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
