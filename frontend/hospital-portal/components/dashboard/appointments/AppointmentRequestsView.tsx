"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Inbox,
  UserCheck,
  CheckCircle2,
  Building2,
  Search,
  Check,
  X,
  FileText,
  RotateCcw,
  Sparkles,
  Calendar,
  Clock,
  User,
  Phone,
  AlertCircle,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  Plus,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  Appointment,
  AppointmentStatus,
  AppointmentWorkflowType,
} from "@/lib/appointments/types";
import {
  AVAILABLE_DEPARTMENTS,
  AVAILABLE_DOCTORS,
  AVAILABLE_TIME_SLOTS,
} from "@/lib/appointments/mock-data";
import { AppointmentService } from "@/lib/appointments/appointment-service";
import { useFacility } from "@/components/dashboard/facility/FacilityContext";

interface AppointmentRequestsViewProps {
  isGuestMode?: boolean;
}

export function AppointmentRequestsView({ isGuestMode = false }: AppointmentRequestsViewProps) {
  const { activeCampus } = useFacility();
  const [requests, setRequests] = useState<Appointment[]>(() =>
    AppointmentService.getAppointmentRequests(activeCampus.id)
  );

  useEffect(() => {
    setRequests(AppointmentService.getAppointmentRequests(activeCampus.id));
  }, [activeCampus.id]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [activeTab, setActiveTab] = useState<"all" | "workflow-a" | "workflow-b">("all");

  // Review Drawer / Modal State
  const [reviewRequest, setReviewRequest] = useState<Appointment | null>(null);

  // Form states inside Review Drawer
  const [drawerMode, setDrawerMode] = useState<"view" | "assign" | "propose" | "reject" | "info">("view");
  const [assignDoctorId, setAssignDoctorId] = useState("");
  const [assignDepartment, setAssignDepartment] = useState("");
  const [assignDate, setAssignDate] = useState("2024-11-26");
  const [assignTimeSlot, setAssignTimeSlot] = useState("09:00 AM");
  const [rejectReason, setRejectReason] = useState("");
  const [infoRequestText, setInfoRequestText] = useState("");
  const [drawerError, setDrawerError] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const stats = useMemo(
    () => AppointmentService.getAppointmentStats(activeCampus.id),
    [requests, activeCampus.id]
  );

  // Lock body scroll when modal/drawer is open & support Escape key
  useEffect(() => {
    if (reviewRequest) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeReviewDrawer();
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
  }, [reviewRequest]);

  // Sync drawer fields when a request is opened
  const openReviewDrawer = (req: Appointment, initialMode: "view" | "assign" | "propose" | "reject" | "info" = "view") => {
    setReviewRequest(req);
    setDrawerMode(initialMode);
    setAssignDepartment(req.department || AVAILABLE_DEPARTMENTS[0]);
    setAssignDoctorId(req.doctorId || AVAILABLE_DOCTORS[0].id);
    setAssignDate(req.appointmentDate || "2024-11-26");
    setAssignTimeSlot(req.timeSlot || AVAILABLE_TIME_SLOTS[0]);
    setRejectReason("");
    setInfoRequestText("");
    setDrawerError("");
  };

  const closeReviewDrawer = () => {
    setReviewRequest(null);
    setDrawerMode("view");
    setDrawerError("");
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (filterDepartment !== "All" && req.department !== filterDepartment) return false;
      if (activeTab === "workflow-a" && req.workflow !== "facility_assigned") return false;
      if (activeTab === "workflow-b" && req.workflow !== "patient_selected") return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesPatient = req.patientName.toLowerCase().includes(query);
        const matchesRecord = req.facilityPatientId.toLowerCase().includes(query);
        const matchesNumber = req.id.toLowerCase().includes(query);
        const matchesReason = req.reasonForVisit.toLowerCase().includes(query);
        if (!matchesPatient && !matchesRecord && !matchesNumber && !matchesReason) return false;
      }
      return true;
    });
  }, [requests, searchQuery, filterDepartment, activeTab]);

  // Request category metrics
  const newRequestsCount = requests.filter((r) => r.status === "Requested" || r.status === "Under Review").length;
  const underReviewCount = requests.filter((r) => r.status === "Under Review").length;
  const workflowACount = requests.filter((r) => r.workflow === "facility_assigned").length;
  const workflowBCount = requests.filter((r) => r.workflow === "patient_selected").length;

  // Actions
  const handleConfirmDirect = (reqId: string) => {
    AppointmentService.updateAppointmentStatus(reqId, "Confirmed", {
      reason: "Confirmed by intake coordinator"
    });
    setRequests(AppointmentService.getAppointmentRequests());
    closeReviewDrawer();
    setActionSuccessMsg("Appointment successfully confirmed!");
    setTimeout(() => setActionSuccessMsg(""), 3500);
  };

  const handleAssignAndConfirm = () => {
    if (!reviewRequest) return;
    setDrawerError("");

    const conflict = AppointmentService.hasSchedulingConflict(
      assignDoctorId,
      assignDate,
      assignTimeSlot,
      reviewRequest.id
    );

    if (conflict) {
      setDrawerError("Conflict detected: This physician already has an appointment booked for this slot.");
      return;
    }

    const doc = AVAILABLE_DOCTORS.find((d: { id: string; name: string }) => d.id === assignDoctorId);

    AppointmentService.updateAppointmentStatus(reviewRequest.id, "Confirmed", {
      doctorId: assignDoctorId,
      doctorName: doc ? doc.name : reviewRequest.doctorName,
      department: assignDepartment,
      date: assignDate,
      timeSlot: assignTimeSlot,
      reason: "Physician & slot allocated by intake staff"
    });

    setRequests(AppointmentService.getAppointmentRequests());
    closeReviewDrawer();
    setActionSuccessMsg("Physician assigned and appointment confirmed!");
    setTimeout(() => setActionSuccessMsg(""), 3500);
  };

  const handleProposeSlot = () => {
    if (!reviewRequest) return;
    setDrawerError("");

    AppointmentService.updateAppointmentStatus(reviewRequest.id, "Awaiting Patient Response", {
      date: assignDate,
      timeSlot: assignTimeSlot,
      reason: `Staff proposed alternative slot: ${assignDate} at ${assignTimeSlot}. Awaiting patient confirmation.`
    });

    setRequests(AppointmentService.getAppointmentRequests());
    closeReviewDrawer();
    setActionSuccessMsg("Alternative slot proposed to patient!");
    setTimeout(() => setActionSuccessMsg(""), 3500);
  };

  const handleRequestMoreInfo = () => {
    if (!reviewRequest) return;
    if (!infoRequestText.trim()) {
      setDrawerError("Please specify what additional information is required from the patient.");
      return;
    }

    AppointmentService.updateAppointmentStatus(reviewRequest.id, "Under Review", {
      reason: `Information requested: ${infoRequestText}`
    });

    setRequests(AppointmentService.getAppointmentRequests());
    closeReviewDrawer();
    setActionSuccessMsg("Information request logged and notification sent to patient.");
    setTimeout(() => setActionSuccessMsg(""), 3500);
  };

  const handleRejectSubmit = () => {
    if (!reviewRequest) return;
    if (!rejectReason.trim()) {
      setDrawerError("Please provide a mandatory reason for rejecting this intake request.");
      return;
    }

    AppointmentService.updateAppointmentStatus(reviewRequest.id, "Cancelled", {
      reason: `Request rejected by intake: ${rejectReason}`
    });

    setRequests(AppointmentService.getAppointmentRequests());
    closeReviewDrawer();
    setActionSuccessMsg("Appointment request rejected and patient notified.");
    setTimeout(() => setActionSuccessMsg(""), 3500);
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
          <span className="text-[#1F2B46] font-semibold">Requests</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF2E9] text-[#2D382B] border border-[#DDE6DA]">
            <span className="material-symbols-outlined text-xs text-[#0055A4]">domain</span>
            <span>Facility Scope: St. Jude Medical Center (North Campus)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1F2B46] border border-[#DDE6DA]">
            <span className="material-symbols-outlined text-xs text-[#34A853]">verified</span>
            <span>Live Intake Desk</span>
          </span>
        </div>
      </div>

      {/* Header Banner & Standard Sub-navigation Tabs matching Overview */}
      <div className="bg-white border border-[#DDE6DA] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#1F2B46]">Appointment Requests</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                {newRequestsCount} Awaiting Intake
              </span>
            </div>
            <p className="text-sm text-[#5A6372] mt-1">
              Review, triage, allocate doctors, and confirm incoming outpatient appointment bookings.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/appointments/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#004382] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Create Appointment</span>
            </Link>
          </div>
        </div>

        {/* Standard Sub-navigation Tabs */}
        <div className="border-t border-[#DDE6DA] pt-3 flex items-center gap-2">
          <Link
            href="/dashboard/appointments"
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#5A6372] hover:bg-[#F3F6F0] hover:text-[#1F2B46] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">table_chart</span>
            <span>Directory & Schedule</span>
          </Link>

          <Link
            href="/dashboard/appointments/calendar"
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#5A6372] hover:bg-[#F3F6F0] hover:text-[#1F2B46] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <span>Calendar View</span>
          </Link>

          <Link
            href="/dashboard/appointments/requests"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0055A4] text-white shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">mark_email_unread</span>
            <span>Requests Queue</span>
            {stats.pendingRequests > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
                {stats.pendingRequests}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 4 COMPACT METRIC CARDS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#D5DFD2] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#1F2B46]/70">Pending Requests</span>
            <div className="rounded-md bg-orange-100 p-1.5 text-orange-600">
              <Inbox className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1 text-xl font-bold text-[#1F2B46]">{newRequestsCount}</div>
          <p className="text-[11px] text-[#1F2B46]/60">Require staff intake triage</p>
        </div>

        <div className="rounded-2xl border border-[#D5DFD2] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#1F2B46]/70">Under Review</span>
            <div className="rounded-md bg-blue-100 p-1.5 text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1 text-xl font-bold text-[#1F2B46]">{underReviewCount}</div>
          <p className="text-[11px] text-[#1F2B46]/60">Verification in progress</p>
        </div>

        <div className="rounded-2xl border border-[#D5DFD2] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#1F2B46]/70">Facility Assigned (A)</span>
            <div className="rounded-md bg-purple-100 p-1.5 text-purple-600">
              <Building2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1 text-xl font-bold text-[#1F2B46]">{workflowACount}</div>
          <p className="text-[11px] text-[#1F2B46]/60">Doctor & slot unassigned</p>
        </div>

        <div className="rounded-2xl border border-[#D5DFD2] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#1F2B46]/70">Patient Selected (B)</span>
            <div className="rounded-md bg-emerald-100 p-1.5 text-emerald-600">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1 text-xl font-bold text-[#1F2B46]">{workflowBCount}</div>
          <p className="text-[11px] text-[#1F2B46]/60">Ready for confirmation</p>
        </div>
      </div>

      {/* FILTER & WORKFLOW SELECTOR */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#D5DFD2] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg border border-[#D5DFD2] bg-[#F1F5EF] p-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "all"
                ? "bg-white text-[#0055A4] shadow-xs"
                : "text-[#1F2B46]/70 hover:text-[#1F2B46]"
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab("workflow-a")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "workflow-a"
                ? "bg-white text-[#0055A4] shadow-xs"
                : "text-[#1F2B46]/70 hover:text-[#1F2B46]"
            }`}
          >
            Workflow A (Assign) ({workflowACount})
          </button>
          <button
            onClick={() => setActiveTab("workflow-b")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "workflow-b"
                ? "bg-white text-[#0055A4] shadow-xs"
                : "text-[#1F2B46]/70 hover:text-[#1F2B46]"
            }`}
          >
            Workflow B (Direct) ({workflowBCount})
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1F2B46]/40" />
            <input
              type="text"
              placeholder="Search request or patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-52 rounded-lg border border-[#D5DFD2] bg-[#F1F5EF] py-1.5 pl-8 pr-3 text-xs text-[#1F2B46] placeholder-[#1F2B46]/40 focus:border-[#0055A4] focus:outline-none"
            />
          </div>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            aria-label="Filter requests by department"
            className="rounded-lg border border-[#D5DFD2] bg-[#F1F5EF] px-2.5 py-1.5 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
          >
            <option value="All">All Departments</option>
            {AVAILABLE_DEPARTMENTS.map((dept: string) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* COMPACT REQUESTS LIST */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D5DFD2] bg-white p-12 text-center">
            <Inbox className="h-10 w-10 text-[#1F2B46]/30 mb-2" />
            <h3 className="text-sm font-bold text-[#1F2B46]">No Pending Requests</h3>
            <p className="text-xs text-[#1F2B46]/60 max-w-sm mt-0.5">
              All inbound appointment bookings have been processed or confirmed.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="group rounded-2xl border border-[#D5DFD2] bg-white p-4 shadow-xs transition-all hover:border-[#0055A4]/50 hover:shadow-sm"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {/* Left Section: Information Hierarchy */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Patient Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF2E9] text-sm font-bold text-[#0055A4] border border-[#D5DFD2]">
                    {req.patientName.charAt(0)}
                  </div>

                  {/* Patient Information Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1F2B46]">
                        {req.patientName}
                      </h3>
                      <span className="font-mono text-[11px] font-semibold text-[#0055A4] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {req.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.workflow === "facility_assigned"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {req.workflow === "facility_assigned" ? "Facility Assigned (A)" : "Patient Selected (B)"}
                      </span>
                      <span className="text-[10px] font-medium text-[#1F2B46]/50 bg-[#F1F5EF] px-1.5 py-0.5 rounded">
                        Submitted: {req.requestSubmissionDate}
                      </span>
                    </div>

                    {/* Metadata strip */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#1F2B46]/70">
                      <span>MRN: <strong className="text-[#1F2B46]">{req.facilityPatientId}</strong></span>
                      <span>&bull;</span>
                      <span>Phone: <strong className="text-[#1F2B46]">{req.patientPhone}</strong></span>
                      <span>&bull;</span>
                      <span>Requested: <strong className="text-[#1F2B46]">{req.appointmentDate} at {req.timeSlot}</strong></span>
                      <span>&bull;</span>
                      <span>Dept: <strong className="text-[#0055A4]">{req.department}</strong></span>
                      {req.doctorName && req.doctorName !== "Unassigned" && (
                        <>
                          <span>&bull;</span>
                          <span>Doctor: <strong className="text-[#1F2B46]">{req.doctorName}</strong></span>
                        </>
                      )}
                    </div>

                    {/* Chief Complaint */}
                    <p className="mt-1.5 text-xs text-[#1F2B46] line-clamp-1">
                      <span className="font-semibold text-[#1F2B46]/70">Complaint: </span>
                      {req.reasonForVisit}
                    </p>

                    {/* Patient note pill if available */}
                    {req.patientNotes && (
                      <div className="mt-1.5 inline-block text-[11px] text-[#1F2B46]/80 italic bg-[#F1F5EF] px-2 py-0.5 rounded">
                        Note: &ldquo;{req.patientNotes}&rdquo;
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section: Compact Co-located Actions */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0 border-t border-[#D5DFD2]/60 pt-2 lg:border-t-0 lg:pt-0">
                  {/* Primary Action Button */}
                  {req.workflow === "patient_selected" ? (
                    <button
                      onClick={() => handleConfirmDirect(req.id)}
                      className="flex items-center gap-1 rounded-lg bg-[#0055A4] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#004282] transition-colors shadow-2xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Accept & Confirm
                    </button>
                  ) : (
                    <button
                      onClick={() => openReviewDrawer(req, "assign")}
                      className="flex items-center gap-1 rounded-lg bg-[#0055A4] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#004282] transition-colors shadow-2xs"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Assign Doctor & Slot
                    </button>
                  )}

                  {/* Secondary Actions */}
                  <button
                    onClick={() => openReviewDrawer(req, "propose")}
                    className="flex items-center gap-1 rounded-lg border border-[#D5DFD2] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1F2B46] hover:bg-[#F1F5EF] transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-[#1F2B46]/70" />
                    Propose Slot
                  </button>

                  <button
                    onClick={() => openReviewDrawer(req, "reject")}
                    className="flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-rose-600" />
                    Reject
                  </button>

                  {/* Comprehensive Review Drawer Trigger */}
                  <button
                    onClick={() => openReviewDrawer(req, "view")}
                    className="flex items-center gap-1 rounded-lg border border-[#D5DFD2] bg-[#F1F5EF] px-2.5 py-1.5 text-xs font-semibold text-[#1F2B46] hover:bg-white hover:text-[#0055A4] transition-colors"
                    title="Open Full Review Panel"
                  >
                    <span>Review</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* COMPREHENSIVE REQUEST REVIEW DRAWER / MODAL */}
      {reviewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          {/* Clickable background overlay */}
          <div className="absolute inset-0" onClick={closeReviewDrawer} />

          {/* Right-side Sliding Drawer */}
          <div className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-[#D5DFD2] bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#D5DFD2] px-6 py-4 bg-[#F1F5EF]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0055A4] bg-white px-2 py-0.5 rounded border border-blue-200">
                    {reviewRequest.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      reviewRequest.workflow === "facility_assigned"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {reviewRequest.workflow === "facility_assigned" ? "Workflow A (Facility Assignment)" : "Workflow B (Patient Selected)"}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#1F2B46] mt-1">
                  Intake Request Review
                </h2>
              </div>
              <button
                onClick={closeReviewDrawer}
                className="rounded-lg p-1.5 text-[#1F2B46]/60 hover:bg-white transition-colors"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Patient Profile Snapshot */}
              <div className="rounded-xl border border-[#D5DFD2] bg-[#F1F5EF]/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0055A4] text-white font-bold text-base">
                    {reviewRequest.patientName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#1F2B46]">{reviewRequest.patientName}</h3>
                    <div className="text-[#1F2B46]/70 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>MRN: <strong>{reviewRequest.facilityPatientId}</strong></span>
                      <span>&bull;</span>
                      <span>Phone: <strong>{reviewRequest.patientPhone}</strong></span>
                      <span>&bull;</span>
                      <span>Age: <strong>{reviewRequest.patientAge} ({reviewRequest.patientGender})</strong></span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/patients/${reviewRequest.facilityPatientId}`}
                    className="rounded-md border border-[#D5DFD2] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0055A4] hover:bg-[#F1F5EF]"
                  >
                    EHR Dossier
                  </Link>
                </div>
              </div>

              {/* Consultation Request Details */}
              <div className="rounded-xl border border-[#D5DFD2] p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2B46]/70 border-b border-[#D5DFD2]/60 pb-1.5">
                  Request Specifications
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#1F2B46]/60 block mb-0.5">Requested Date & Slot</span>
                    <span className="font-semibold text-[#1F2B46]">{reviewRequest.appointmentDate} at {reviewRequest.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-[#1F2B46]/60 block mb-0.5">Clinical Department</span>
                    <span className="font-semibold text-[#1F2B46]">{reviewRequest.department}</span>
                  </div>
                  <div>
                    <span className="text-[#1F2B46]/60 block mb-0.5">Assigned / Preferred Doctor</span>
                    <span className="font-semibold text-[#1F2B46]">{reviewRequest.doctorName || "Pending Assignment"}</span>
                  </div>
                  <div>
                    <span className="text-[#1F2B46]/60 block mb-0.5">Submission Source</span>
                    <span className="font-semibold text-[#1F2B46]">{reviewRequest.source}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[#1F2B46]/60 block mb-0.5">Chief Complaint / Reason for Visit</span>
                  <p className="rounded-lg bg-[#F1F5EF] p-2.5 font-medium text-[#1F2B46] leading-relaxed">
                    {reviewRequest.reasonForVisit}
                  </p>
                </div>

                {reviewRequest.patientNotes && (
                  <div>
                    <span className="text-[#1F2B46]/60 block mb-0.5">Patient Notes</span>
                    <p className="rounded-lg bg-[#F1F5EF] p-2.5 text-[#1F2B46]/80 italic">
                      &ldquo;{reviewRequest.patientNotes}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* ACTION FORMS ACCORDING TO DRAWER MODE */}
              {drawerMode === "assign" && (
                <div className="rounded-xl border border-[#0055A4] bg-blue-50/40 p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#0055A4]">Assign Doctor & Slot</h4>
                    <button onClick={() => setDrawerMode("view")} className="text-xs text-[#1F2B46]/60 hover:underline">
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1F2B46] block mb-1">Department</label>
                    <select
                      value={assignDepartment}
                      onChange={(e) => setAssignDepartment(e.target.value)}
                      className="w-full rounded-lg border border-[#D5DFD2] bg-white p-2 text-xs text-[#1F2B46]"
                    >
                      {AVAILABLE_DEPARTMENTS.map((dept: string) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1F2B46] block mb-1">Attending Physician</label>
                    <select
                      value={assignDoctorId}
                      onChange={(e) => setAssignDoctorId(e.target.value)}
                      className="w-full rounded-lg border border-[#D5DFD2] bg-white p-2 text-xs text-[#1F2B46]"
                    >
                      {AVAILABLE_DOCTORS.filter((doc: { department: string }) => doc.department === assignDepartment).map((doc: { id: string; name: string }) => (
                        <option key={doc.id} value={doc.id}>{doc.name}</option>
                      ))}
                      {AVAILABLE_DOCTORS.filter((doc: { department: string }) => doc.department === assignDepartment).length === 0 && (
                        AVAILABLE_DOCTORS.map((doc: { id: string; name: string }) => (
                          <option key={doc.id} value={doc.id}>{doc.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-[#1F2B46] block mb-1">Date</label>
                      <input
                        type="date"
                        value={assignDate}
                        onChange={(e) => setAssignDate(e.target.value)}
                        className="w-full rounded-lg border border-[#D5DFD2] bg-white p-2 text-xs text-[#1F2B46]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#1F2B46] block mb-1">Time Slot</label>
                      <select
                        value={assignTimeSlot}
                        onChange={(e) => setAssignTimeSlot(e.target.value)}
                        className="w-full rounded-lg border border-[#D5DFD2] bg-white p-2 text-xs text-[#1F2B46]"
                      >
                        {AVAILABLE_TIME_SLOTS.map((slot: string) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleAssignAndConfirm}
                    className="w-full rounded-lg bg-[#0055A4] py-2 text-xs font-semibold text-white hover:bg-[#004282] shadow-sm mt-2"
                  >
                    Confirm Doctor & Slot Assignment
                  </button>
                </div>
              )}

              {drawerMode === "propose" && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-amber-900">Propose Alternative Slot</h4>
                    <button onClick={() => setDrawerMode("view")} className="text-xs text-[#1F2B46]/60 hover:underline">
                      Cancel
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    If the patient&apos;s requested slot is unavailable, propose an alternative schedule.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-[#1F2B46] block mb-1">Proposed Date</label>
                      <input
                        type="date"
                        value={assignDate}
                        onChange={(e) => setAssignDate(e.target.value)}
                        className="w-full rounded-lg border border-[#D5DFD2] bg-white p-2 text-xs text-[#1F2B46]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#1F2B46] block mb-1">Proposed Slot</label>
                      <select
                        value={assignTimeSlot}
                        onChange={(e) => setAssignTimeSlot(e.target.value)}
                        className="w-full rounded-lg border border-[#D5DFD2] bg-white p-2 text-xs text-[#1F2B46]"
                      >
                        {AVAILABLE_TIME_SLOTS.map((slot: string) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleProposeSlot}
                    className="w-full rounded-lg bg-amber-600 py-2 text-xs font-semibold text-white hover:bg-amber-700 shadow-sm mt-2"
                  >
                    Send Alternative Slot Proposal
                  </button>
                </div>
              )}

              {drawerMode === "info" && (
                <div className="rounded-xl border border-blue-300 bg-blue-50/50 p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-blue-900">Request Additional Information</h4>
                    <button onClick={() => setDrawerMode("view")} className="text-xs text-[#1F2B46]/60 hover:underline">
                      Cancel
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={infoRequestText}
                    onChange={(e) => setInfoRequestText(e.target.value)}
                    placeholder="Specify necessary lab reports, previous scan copies, or clinical clarity required from the patient..."
                    className="w-full rounded-lg border border-[#D5DFD2] bg-white p-2.5 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
                  />
                  <button
                    onClick={handleRequestMoreInfo}
                    className="w-full rounded-lg bg-[#0055A4] py-2 text-xs font-semibold text-white hover:bg-[#004282] shadow-sm"
                  >
                    Send Information Request
                  </button>
                </div>
              )}

              {drawerMode === "reject" && (
                <div className="rounded-xl border border-rose-300 bg-rose-50/50 p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-rose-900">Reject Request</h4>
                    <button onClick={() => setDrawerMode("view")} className="text-xs text-[#1F2B46]/60 hover:underline">
                      Cancel
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#1F2B46] block mb-1">
                      Mandatory Rejection Rationale <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Sub-specialty service unavailable, patient advised to seek Emergency Room intake..."
                      className="w-full rounded-lg border border-rose-200 bg-white p-2.5 text-xs text-[#1F2B46] focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleRejectSubmit}
                    className="w-full rounded-lg bg-rose-600 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-sm"
                  >
                    Confirm Rejection
                  </button>
                </div>
              )}

              {/* Error Banner */}
              {drawerError && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{drawerError}</span>
                </div>
              )}

              {/* Request Audit History */}
              <div className="rounded-xl border border-[#D5DFD2] p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2B46]/70 border-b border-[#D5DFD2]/60 pb-1.5">
                  Request Activity History
                </h4>
                <div className="space-y-3">
                  {reviewRequest.timeline.map((event, idx) => (
                    <div key={idx} className="relative pl-5 text-xs">
                      <div className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full bg-[#0055A4]" />
                      {idx !== reviewRequest.timeline.length - 1 && (
                        <div className="absolute left-[4px] top-3.5 h-full w-[1.5px] bg-[#D5DFD2]" />
                      )}
                      <div className="font-bold text-[#1F2B46]">{event.title}</div>
                      <p className="text-[11px] text-[#1F2B46]/70 leading-relaxed mt-0.5">{event.description}</p>
                      <div className="text-[10px] text-[#1F2B46]/50 mt-0.5">
                        {event.timestamp} &bull; {event.actor}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer with Co-located Action Triggers */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D5DFD2] bg-[#F1F5EF] px-6 py-4">
              <div className="flex items-center gap-2">
                {reviewRequest.workflow === "patient_selected" ? (
                  <button
                    onClick={() => handleConfirmDirect(reviewRequest.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#0055A4] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004282] transition-colors shadow-sm"
                  >
                    <Check className="h-4 w-4" />
                    Accept & Confirm
                  </button>
                ) : (
                  <button
                    onClick={() => setDrawerMode("assign")}
                    className="flex items-center gap-1.5 rounded-lg bg-[#0055A4] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004282] transition-colors shadow-sm"
                  >
                    <UserCheck className="h-4 w-4" />
                    Assign Doctor & Slot
                  </button>
                )}

                <button
                  onClick={() => setDrawerMode("propose")}
                  className="rounded-lg border border-[#D5DFD2] bg-white px-3 py-2 text-xs font-medium text-[#1F2B46] hover:bg-[#E4EBE0] transition-colors"
                >
                  Propose Slot
                </button>

                <button
                  onClick={() => setDrawerMode("info")}
                  className="rounded-lg border border-[#D5DFD2] bg-white px-3 py-2 text-xs font-medium text-[#1F2B46] hover:bg-[#E4EBE0] transition-colors"
                >
                  Request Info
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrawerMode("reject")}
                  className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Reject
                </button>

                <Link
                  href={`/dashboard/appointments/${reviewRequest.id}`}
                  className="rounded-lg border border-[#D5DFD2] bg-white p-2 text-[#1F2B46]/70 hover:text-[#0055A4] transition-colors"
                  title="Open Full Appointment Page"
                >
                  <FileText className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
