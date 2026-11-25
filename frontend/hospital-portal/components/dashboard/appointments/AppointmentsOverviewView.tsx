"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserSession, DEFAULT_ADMIN, clearClientSession, getClientSession } from "@/lib/auth";
import { AppointmentService } from "@/lib/appointments/appointment-service";
import {
  AVAILABLE_DEPARTMENTS,
  AVAILABLE_DOCTORS,
} from "@/lib/appointments/mock-data";
import { AppointmentStatus, Appointment } from "@/lib/appointments/types";
import { useFacility } from "@/components/dashboard/facility/FacilityContext";

interface AppointmentsOverviewViewProps {
  initialUser?: UserSession;
}

const ITEMS_PER_PAGE = 7;

export default function AppointmentsOverviewView({ initialUser }: AppointmentsOverviewViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;
  const { activeCampus } = useFacility();

  // Verify session on client
  React.useEffect(() => {
    if (!initialUser && !getClientSession()) {
      router.push("/login");
    }
  }, [initialUser, router]);

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [activeTab, setActiveTab] = useState<"all" | "today" | "pending" | "upcoming">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [actionModal, setActionModal] = useState<{
    type: "confirm" | "cancel" | "reschedule" | null;
    appointment: Appointment | null;
  }>({ type: null, appointment: null });
  const [actionReason, setActionReason] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("10:00 AM");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync toast timer
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Derived stats
  const stats = useMemo(
    () => AppointmentService.getAppointmentStats(activeCampus.id),
    [refreshKey, activeCampus.id]
  );

  // Query appointments
  const appointmentsList = useMemo(() => {
    let list = AppointmentService.queryAppointments({
      search: searchQuery,
      doctor: selectedDoctor,
      department: selectedDept,
      status: selectedStatus,
      date: selectedDate,
      type: selectedType,
      sortBy: "date",
      facilityId: activeCampus.id,
    });

    if (activeTab === "today") {
      list = list.filter((a) => a.appointmentDate === "2024-11-25");
    } else if (activeTab === "pending") {
      list = list.filter((a) =>
        ["Requested", "Under Review", "Awaiting Patient Response", "Reschedule Requested"].includes(a.status)
      );
    } else if (activeTab === "upcoming") {
      list = list.filter((a) => a.status === "Confirmed" && a.appointmentDate >= "2024-11-25");
    }

    return list;
  }, [searchQuery, selectedDoctor, selectedDept, selectedStatus, selectedDate, selectedType, activeTab, refreshKey, activeCampus.id]);

  // Pagination
  const totalPages = Math.ceil(appointmentsList.length / ITEMS_PER_PAGE) || 1;
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return appointmentsList.slice(start, start + ITEMS_PER_PAGE);
  }, [appointmentsList, currentPage]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedDoctor !== "All" ||
    selectedDept !== "All" ||
    selectedStatus !== "All" ||
    selectedDate !== "" ||
    selectedType !== "All" ||
    activeTab !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDoctor("All");
    setSelectedDept("All");
    setSelectedStatus("All");
    setSelectedDate("");
    setSelectedType("All");
    setActiveTab("all");
    setCurrentPage(1);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF5E2] text-[#2D6A28] border border-[#C5E4BA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
            Confirmed
          </span>
        );
      case "Requested":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF4E5] text-[#B76E00] border border-[#FFE0B2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FB8C00]"></span>
            Requested
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E7F0FF] text-[#0055A4] border border-[#C7DCFF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0055A4]"></span>
            Under Review
          </span>
        );
      case "Awaiting Patient Response":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA]"></span>
            Awaiting Patient
          </span>
        );
      case "Reschedule Requested":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
            Reschedule Asked
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF5F5] text-[#BA1A1A] border border-[#FFD6D6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
            {status}
          </span>
        );
    }
  };

  // Handle Quick Action: Confirm
  const handleConfirmAppointment = (apt: Appointment) => {
    AppointmentService.updateAppointmentStatus(apt.id, "Confirmed", {
      actor: "Hospital Admissions Staff",
    });
    setRefreshKey((k) => k + 1);
    setActionModal({ type: null, appointment: null });
    setToastMessage(`Appointment ${apt.id} successfully confirmed!`);
  };

  // Handle Quick Action: Cancel
  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal.appointment) return;
    AppointmentService.updateAppointmentStatus(actionModal.appointment.id, "Cancelled", {
      reason: actionReason || "Cancelled by hospital staff",
      actor: "Hospital Admissions Staff",
    });
    setRefreshKey((k) => k + 1);
    setActionModal({ type: null, appointment: null });
    setActionReason("");
    setToastMessage(`Appointment ${actionModal.appointment.id} has been cancelled.`);
  };

  // Handle Quick Action: Reschedule
  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal.appointment || !rescheduleDate) return;
    AppointmentService.updateAppointmentStatus(actionModal.appointment.id, "Confirmed", {
      date: rescheduleDate,
      timeSlot: rescheduleTime,
      notes: `Rescheduled to ${rescheduleDate} at ${rescheduleTime}.`,
      actor: "Hospital Admissions Staff",
    });
    setRefreshKey((k) => k + 1);
    setActionModal({ type: null, appointment: null });
    setRescheduleDate("");
    setToastMessage(`Appointment ${actionModal.appointment.id} rescheduled to ${rescheduleDate} at ${rescheduleTime}.`);
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
          {/* Breadcrumb & Scope Pill */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="flex items-center gap-2 text-xs text-[#5A6372]">
              <Link href="/dashboard" className="hover:text-[#0055A4] flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-sm">home</span>
                <span>Home</span>
              </Link>
              <span>/</span>
              <span className="text-[#1F2B46] font-semibold">Appointments</span>
            </nav>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF2E9] text-[#2D382B] border border-[#DDE6DA]">
                <span className="material-symbols-outlined text-xs text-[#0055A4]">domain</span>
                <span>Facility Scope: St. Jude Medical Center (North Campus)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1F2B46] border border-[#DDE6DA]">
                <span className="material-symbols-outlined text-xs text-[#34A853]">verified</span>
                <span>Live Scheduling Desk</span>
              </span>
            </div>
          </div>

          {/* Page Heading & Module Navigation Tabs */}
          <div className="bg-white border border-[#DDE6DA] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-[#1F2B46]">Appointments</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E7F0FF] text-[#0055A4] border border-[#C7DCFF]">
                    {stats.confirmedAppointments} Confirmed
                  </span>
                </div>
                <p className="text-sm text-[#5A6372] mt-1">
                  Manage patient appointments, clinic scheduling, and incoming appointment requests.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/dashboard/appointments/requests"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DDE6DA] bg-[#F3F6F0] hover:bg-[#E8EFE5] text-[#1F2B46] text-xs font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#B76E00]">inbox</span>
                  <span>Review Requests ({stats.pendingRequests})</span>
                </Link>

                <Link
                  href="/dashboard/appointments/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#004382] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  <span>Create Appointment</span>
                </Link>
              </div>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="border-t border-[#DDE6DA] pt-3 flex items-center gap-2">
              <Link
                href="/dashboard/appointments"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0055A4] text-white shadow-xs flex items-center gap-1.5"
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5A6372] hover:bg-[#F3F6F0] hover:text-[#1F2B46] transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">mark_email_unread</span>
                <span>Requests Queue</span>
                {stats.pendingRequests > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#B76E00] text-white font-mono">
                    {stats.pendingRequests}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Summary Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Today&apos;s Appointments</span>
                <span className="w-8 h-8 rounded-lg bg-[#E7F0FF] text-[#0055A4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">today</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1F2B46]">{stats.totalToday}</span>
                <p className="text-xs text-[#5A6372] mt-1">Scheduled for Nov 25</p>
              </div>
            </div>

            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Pending Requests</span>
                <span className="w-8 h-8 rounded-lg bg-[#FFF4E5] text-[#B76E00] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">hourglass_top</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1F2B46]">{stats.pendingRequests}</span>
                <p className="text-xs text-[#B76E00] font-medium mt-1">Requires staff triage</p>
              </div>
            </div>

            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Confirmed</span>
                <span className="w-8 h-8 rounded-lg bg-[#EAF5E2] text-[#2D6A28] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1F2B46]">{stats.confirmedAppointments}</span>
                <p className="text-xs text-[#5A6372] mt-1">Active bookings</p>
              </div>
            </div>

            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Completed</span>
                <span className="w-8 h-8 rounded-lg bg-[#F0FDF4] text-[#166534] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">task_alt</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1F2B46]">{stats.completedAppointments}</span>
                <p className="text-xs text-[#166534] font-medium mt-1">Encounters charted</p>
              </div>
            </div>

            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Cancelled</span>
                <span className="w-8 h-8 rounded-lg bg-[#FFF5F5] text-[#BA1A1A] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">cancel</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1F2B46]">{stats.cancelledAppointments}</span>
                <p className="text-xs text-[#5A6372] mt-1">Past cancellations</p>
              </div>
            </div>
          </div>

          {/* Quick Filter Activity Tabs */}
          <div className="flex items-center gap-2 border-b border-[#DDE6DA] pb-2 overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#1F2B46] text-white"
                  : "bg-white text-[#5A6372] hover:bg-[#F3F6F0] border border-[#DDE6DA]"
              }`}
            >
              All Appointments
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("today");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "today"
                  ? "bg-[#0055A4] text-white"
                  : "bg-white text-[#5A6372] hover:bg-[#F3F6F0] border border-[#DDE6DA]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">today</span>
              <span>Today&apos;s Schedule ({stats.totalToday})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("pending");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "pending"
                  ? "bg-[#B76E00] text-white"
                  : "bg-white text-[#5A6372] hover:bg-[#F3F6F0] border border-[#DDE6DA]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">mark_email_unread</span>
              <span>Pending Requests ({stats.pendingRequests})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("upcoming");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "upcoming"
                  ? "bg-[#0055A4] text-white"
                  : "bg-white text-[#5A6372] hover:bg-[#F3F6F0] border border-[#DDE6DA]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">upcoming</span>
              <span>Upcoming Confirmed</span>
            </button>
          </div>

          {/* Search & Multi-Filter Bar */}
          <div className="bg-white border border-[#DDE6DA] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727783] text-lg pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by patient name, ID, or appointment code..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] text-xs text-[#1F2B46] focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] focus:bg-white"
                />
              </div>

              {/* Doctor filter */}
              <div>
                <select
                  value={selectedDoctor}
                  onChange={(e) => {
                    setSelectedDoctor(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl border border-[#DDE6DA] bg-white text-xs font-medium text-[#1F2B46] focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                >
                  <option value="All">All Doctors</option>
                  {AVAILABLE_DOCTORS.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department filter */}
              <div>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl border border-[#DDE6DA] bg-white text-xs font-medium text-[#1F2B46] focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                >
                  <option value="All">All Departments</option>
                  {AVAILABLE_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl border border-[#DDE6DA] bg-white text-xs font-medium text-[#1F2B46] focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Requested">Requested</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Awaiting Patient Response">Awaiting Patient</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Filter & Clear */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2 py-1.5 rounded-xl border border-[#DDE6DA] bg-white text-xs font-medium text-[#1F2B46] focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                />
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="p-2 rounded-xl border border-[#DDE6DA] bg-[#F3F6F0] hover:bg-[#E8EFE5] text-[#5A6372] shrink-0"
                    title="Reset all filters"
                  >
                    <span className="material-symbols-outlined text-base">filter_alt_off</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Directory Table */}
          <div className="bg-white border border-[#DDE6DA] rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#F3F6F0] border-b border-[#DDE6DA] text-[11px] font-bold uppercase tracking-wider text-[#5A6372]">
                    <th className="py-3.5 px-5">Appointment ID</th>
                    <th className="py-3.5 px-5">Patient</th>
                    <th className="py-3.5 px-5">Attending Doctor</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE6DA]">
                  {paginatedAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <span className="material-symbols-outlined text-4xl text-[#727783] mb-2">event_busy</span>
                          <h3 className="text-base font-bold text-[#1F2B46]">No appointments found</h3>
                          <p className="text-xs text-[#5A6372] mt-1">
                            {hasActiveFilters
                              ? "Try adjusting your filters or date selection."
                              : "No appointments currently recorded for this facility."}
                          </p>
                          {hasActiveFilters && (
                            <button
                              type="button"
                              onClick={handleResetFilters}
                              className="mt-3 text-xs font-semibold text-[#0055A4] hover:underline"
                            >
                              Reset filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-[#F9FBF8] transition-colors text-xs">
                        {/* ID */}
                        <td className="py-4 px-5">
                          <span className="font-mono font-semibold text-[#0055A4] bg-[#E7F0FF] px-2 py-1 rounded-md border border-[#C7DCFF]">
                            {apt.id}
                          </span>
                        </td>

                        {/* Patient */}
                        <td className="py-4 px-5">
                          <Link
                            href={`/dashboard/patients/${apt.facilityPatientId}`}
                            className="font-bold text-[#1F2B46] hover:text-[#0055A4] hover:underline block"
                          >
                            {apt.patientName}
                          </Link>
                          <span className="text-[11px] text-[#5A6372] font-mono block">
                            {apt.facilityPatientId} • {apt.patientPhone}
                          </span>
                        </td>

                        {/* Doctor */}
                        <td className="py-4 px-5">
                          <span className="font-semibold text-[#1F2B46] block">
                            {apt.doctorName || <span className="text-[#B76E00] italic">Unassigned</span>}
                          </span>
                          <span className="text-[11px] text-[#5A6372]">{apt.department}</span>
                        </td>

                        {/* Department */}
                        <td className="py-4 px-4 text-[#5A6372]">{apt.department}</td>

                        {/* Date & Time */}
                        <td className="py-4 px-4">
                          <span className="font-semibold text-[#1F2B46] block">{apt.appointmentDate}</span>
                          <span className="text-[#5A6372] flex items-center gap-1 font-mono text-[11px]">
                            <span className="material-symbols-outlined text-[12px] text-[#0055A4]">schedule</span>
                            {apt.timeSlot}
                          </span>
                        </td>

                        {/* Type */}
                        <td className="py-4 px-4 font-medium text-[#1F2B46]">{apt.appointmentType}</td>

                        {/* Status */}
                        <td className="py-4 px-4">{getStatusBadge(apt.status)}</td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/dashboard/appointments/${apt.id}`}
                              className="px-2.5 py-1.5 rounded-lg font-semibold text-[#0055A4] hover:bg-[#E7F0FF] transition-colors"
                            >
                              Details
                            </Link>

                            {/* Quick Action depending on status */}
                            {["Requested", "Under Review"].includes(apt.status) && (
                              <button
                                type="button"
                                onClick={() => handleConfirmAppointment(apt)}
                                className="px-2 py-1 rounded-lg font-semibold bg-[#EAF5E2] text-[#2D6A28] hover:bg-[#D5EED0] transition-colors text-[11px]"
                                title="Confirm this request"
                              >
                                Confirm
                              </button>
                            )}

                            {apt.status === "Confirmed" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActionModal({
                                      type: "reschedule",
                                      appointment: apt,
                                    })
                                  }
                                  className="px-2 py-1 rounded-lg font-semibold bg-[#F3F6F0] text-[#1F2B46] hover:bg-[#E2E8DE] transition-colors text-[11px]"
                                  title="Reschedule appointment"
                                >
                                  Reschedule
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActionModal({
                                      type: "cancel",
                                      appointment: apt,
                                    })
                                  }
                                  className="p-1 rounded-lg text-[#BA1A1A] hover:bg-[#FFF5F5] transition-colors"
                                  title="Cancel appointment"
                                >
                                  <span className="material-symbols-outlined text-base">cancel</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {appointmentsList.length > 0 && (
              <div className="px-6 py-4 bg-[#F3F6F0] border-t border-[#DDE6DA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5A6372]">
                <div>
                  Showing{" "}
                  <span className="font-semibold text-[#1F2B46]">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, appointmentsList.length)}
                  </span>{" "}
                  of <span className="font-semibold text-[#1F2B46]">{appointmentsList.length}</span> appointments
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-[#DDE6DA] bg-white text-xs font-semibold text-[#1F2B46] hover:bg-[#E8EFE5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                        currentPage === pageNumber
                          ? "bg-[#0055A4] text-white"
                          : "border border-[#DDE6DA] bg-white text-[#1F2B46] hover:bg-[#E8EFE5]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-[#DDE6DA] bg-white text-xs font-semibold text-[#1F2B46] hover:bg-[#E8EFE5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 1. RESCHEDULE APPOINTMENT MODAL                                           */}
      {/* ========================================================================= */}
      {actionModal.type === "reschedule" && actionModal.appointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#DDE6DA] shadow-xl w-full max-w-md overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-[#DDE6DA] flex items-center justify-between bg-[#F3F6F0]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0055A4]">calendar_clock</span>
                <h3 className="text-base font-bold text-[#1F2B46]">Reschedule Appointment</h3>
              </div>
              <button
                type="button"
                onClick={() => setActionModal({ type: null, appointment: null })}
                className="text-[#5A6372] hover:text-[#1F2B46]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-[#F9FBF8] border border-[#DDE6DA] rounded-xl space-y-1">
                <span className="font-bold text-[#1F2B46] block">
                  {actionModal.appointment.patientName} ({actionModal.appointment.id})
                </span>
                <span className="text-[#5A6372] block">
                  Current: {actionModal.appointment.appointmentDate} at {actionModal.appointment.timeSlot} •{" "}
                  {actionModal.appointment.doctorName}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#1F2B46] mb-1">New Appointment Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DDE6DA] text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1F2B46] mb-1">New Time Slot</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DDE6DA] text-sm"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#DDE6DA]">
                <button
                  type="button"
                  onClick={() => setActionModal({ type: null, appointment: null })}
                  className="px-4 py-2 rounded-xl border border-[#DDE6DA] text-[#5A6372] hover:bg-[#F3F6F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rescheduleDate}
                  className="px-5 py-2 rounded-xl bg-[#0055A4] hover:bg-[#004382] disabled:opacity-50 text-white font-semibold cursor-pointer"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CANCEL APPOINTMENT CONFIRMATION MODAL                                  */}
      {/* ========================================================================= */}
      {actionModal.type === "cancel" && actionModal.appointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#DDE6DA] shadow-xl w-full max-w-md overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-[#DDE6DA] flex items-center justify-between bg-[#FFF5F5]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#BA1A1A]">cancel</span>
                <h3 className="text-base font-bold text-[#BA1A1A]">Cancel Appointment</h3>
              </div>
              <button
                type="button"
                onClick={() => setActionModal({ type: null, appointment: null })}
                className="text-[#5A6372] hover:text-[#1F2B46]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="p-6 space-y-4">
              <p className="text-xs text-[#5A6372] leading-relaxed">
                Are you sure you want to cancel the appointment for{" "}
                <span className="font-bold text-[#1F2B46]">{actionModal.appointment.patientName}</span> with{" "}
                <span className="font-bold text-[#1F2B46]">{actionModal.appointment.doctorName}</span> on{" "}
                <span className="font-bold text-[#1F2B46]">{actionModal.appointment.appointmentDate}</span>?
              </p>

              <div>
                <label className="block font-semibold text-[#1F2B46] mb-1">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Patient requested cancellation, doctor emergency schedule conflict..."
                  className="w-full px-3 py-2 rounded-xl border border-[#DDE6DA] text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#DDE6DA]">
                <button
                  type="button"
                  onClick={() => setActionModal({ type: null, appointment: null })}
                  className="px-4 py-2 rounded-xl border border-[#DDE6DA] text-[#5A6372] hover:bg-[#F3F6F0]"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  disabled={!actionReason.trim()}
                  className="px-5 py-2 rounded-xl bg-[#BA1A1A] hover:bg-[#93000a] disabled:opacity-50 text-white font-semibold cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
