"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  clearClientSession,
  getClientSession,
  DEFAULT_ADMIN,
  type UserSession,
} from "@/lib/auth";

import { useFacility } from "@/components/dashboard/facility/FacilityContext";
import { PatientService } from "@/lib/patients/patient-service";
import { AppointmentService } from "@/lib/appointments/appointment-service";
import { QueueService } from "@/lib/queue/queue-service";
import { INITIAL_STAFF_MEMBERS } from "@/lib/operations-data";
import {
  DateRangeOption,
  ShiftOption,
  MOCK_DATASET_TODAY,
  SHIFT_WINDOWS,
  matchesDateFilter,
  matchesShiftFilter,
  matchesStaffShift,
  formatDashboardFilterLabel,
  formatShortCustomDate,
} from "@/lib/dashboard/shift-filter";

interface DashboardViewProps {
  initialUser?: UserSession;
}

export default function DashboardView({ initialUser }: DashboardViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;
  const [activeAptFilter, setActiveAptFilter] = useState<string>("all");
  const [formattedCurrentDate, setFormattedCurrentDate] = useState<string>("");
  const [clientNow, setClientNow] = useState<Date | null>(null);
  const { activeFacility, activeCampus } = useFacility();

  // Date & Shift Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState<DateRangeOption>("today");
  const [appliedCustomDate, setAppliedCustomDate] = useState<string>(MOCK_DATASET_TODAY);
  const [appliedShift, setAppliedShift] = useState<ShiftOption>("all");
  const [draftDateRange, setDraftDateRange] = useState<DateRangeOption>("today");
  const [draftCustomDate, setDraftCustomDate] = useState<string>(MOCK_DATASET_TODAY);
  const [draftShift, setDraftShift] = useState<ShiftOption>("all");
  const filterContainerRef = useRef<HTMLDivElement>(null);

  // Close Date & Shift dropdown on outside click or Escape key
  useEffect(() => {
    if (!isFilterOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFilterOpen]);

  const handleToggleFilter = () => {
    if (!isFilterOpen) {
      setDraftDateRange(appliedDateRange);
      setDraftCustomDate(appliedCustomDate);
      setDraftShift(appliedShift);
    }
    setIsFilterOpen((prev) => !prev);
  };

  const handleApplyFilters = () => {
    setAppliedDateRange(draftDateRange);
    setAppliedCustomDate(draftCustomDate);
    setAppliedShift(draftShift);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    setDraftDateRange("today");
    setDraftCustomDate(MOCK_DATASET_TODAY);
    setDraftShift("all");
    setAppliedDateRange("today");
    setAppliedCustomDate(MOCK_DATASET_TODAY);
    setAppliedShift("all");
    setIsFilterOpen(false);
  };

  const filterButtonLabel = formatDashboardFilterLabel(
    appliedDateRange,
    appliedCustomDate,
    appliedShift
  );
  const isDefaultFilter = appliedDateRange === "today" && appliedShift === "all";

  // Client-safe local date formatter (avoids SSR hydration mismatch & updates on day change)
  useEffect(() => {
    const updateCurrentDate = () => {
      const now = new Date();
      setClientNow(now);
      setFormattedCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateCurrentDate();
    const interval = setInterval(updateCurrentDate, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Verify client session on mount
  useEffect(() => {
    if (!initialUser && !getClientSession()) {
      router.push("/login");
    }
  }, [initialUser, router]);

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // Live campus-scoped metrics & filtered operational slices
  const patientStats = React.useMemo(
    () => PatientService.getDirectoryStats(activeCampus.id),
    [activeCampus.id]
  );

  const filteredCampusAppointments = React.useMemo(() => {
    const campusApts = AppointmentService.getAllAppointments(activeCampus.id);
    return campusApts.filter(
      (apt) =>
        matchesDateFilter(apt.appointmentDate, appliedDateRange, appliedCustomDate, clientNow) &&
        matchesShiftFilter(apt.timeSlot, appliedShift)
    );
  }, [activeCampus.id, appliedDateRange, appliedCustomDate, appliedShift, clientNow]);

  const aptStats = React.useMemo(() => {
    const totalToday = filteredCampusAppointments.length;
    const pendingRequests = filteredCampusAppointments.filter((a) =>
      ["Requested", "Under Review", "Awaiting Patient Response", "Reschedule Requested"].includes(a.status)
    ).length;
    const confirmedAppointments = filteredCampusAppointments.filter((a) => a.status === "Confirmed").length;
    const completedAppointments = filteredCampusAppointments.filter((a) => a.status === "Completed").length;
    const cancelledAppointments = filteredCampusAppointments.filter((a) => a.status === "Cancelled").length;
    return {
      totalToday,
      pendingRequests,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
    };
  }, [filteredCampusAppointments]);

  const filteredCampusQueue = React.useMemo(() => {
    const allQueue = QueueService.getAllQueueEntries(activeCampus.id);
    return allQueue.filter(
      (q) =>
        matchesDateFilter(q.appointmentDate, appliedDateRange, appliedCustomDate, clientNow) &&
        matchesShiftFilter(q.appointmentTime || q.checkInTime, appliedShift)
    );
  }, [activeCampus.id, appliedDateRange, appliedCustomDate, appliedShift, clientNow]);

  const queueStats = React.useMemo(() => {
    const totalToday = filteredCampusQueue.length;
    const checkedIn = filteredCampusQueue.filter((q) => q.status === "Checked In").length;
    const waiting = filteredCampusQueue.filter((q) => q.status === "Waiting").length;
    const inConsultation = filteredCampusQueue.filter((q) => q.status === "In Consultation").length;
    const completed = filteredCampusQueue.filter((q) => q.status === "Completed").length;
    const noShow = filteredCampusQueue.filter((q) => q.status === "No Show").length;
    const cancelled = filteredCampusQueue.filter((q) => q.status === "Cancelled").length;
    const waitingEntries = filteredCampusQueue.filter((q) => q.actualWaitMinutes !== undefined);
    const averageWaitMinutes =
      waitingEntries.length > 0
        ? Math.round(
            waitingEntries.reduce((acc, curr) => acc + (curr.actualWaitMinutes || 0), 0) /
              waitingEntries.length
          )
        : 0;
    return {
      totalToday,
      checkedIn,
      waiting,
      inConsultation,
      completed,
      noShow,
      cancelled,
      averageWaitMinutes,
    };
  }, [filteredCampusQueue]);

  const appointments = React.useMemo(() => {
    return filteredCampusAppointments.map((apt) => {
      const statusKey =
        apt.status === "Confirmed"
          ? "confirmed"
          : apt.status === "Completed"
          ? "completed"
          : ["Requested", "Under Review", "Awaiting Patient Response", "Reschedule Requested"].includes(apt.status)
          ? "waiting"
          : "in-consultation";
      const badgeClass =
        statusKey === "completed"
          ? "bg-tertiary-fixed text-on-tertiary-fixed"
          : statusKey === "waiting"
          ? "bg-secondary-fixed-dim text-on-secondary-fixed-variant"
          : "bg-primary-fixed text-[#0055A4]";
      const initials = apt.patientName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return {
        id: apt.facilityPatientId,
        appointmentId: apt.id,
        patientName: apt.patientName,
        details: `${apt.patientAge} yrs • ${apt.patientGender}`,
        doctor: apt.doctorName,
        specialty: apt.department,
        time: apt.timeSlot,
        date: apt.appointmentDate,
        status: statusKey,
        statusLabel: apt.status,
        badgeClass,
        initials,
        avatar: undefined as string | undefined,
      };
    });
  }, [filteredCampusAppointments]);

  const filteredApts =
    activeAptFilter === "all"
      ? appointments
      : appointments.filter((apt) => apt.status === activeAptFilter);

  const aptTabCounts = React.useMemo(() => {
    return {
      all: appointments.length,
      "in-consultation": appointments.filter((a) => a.status === "in-consultation").length,
      waiting: appointments.filter((a) => a.status === "waiting").length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      completed: appointments.filter((a) => a.status === "completed").length,
    };
  }, [appointments]);

  const activeQueueDisplay = React.useMemo(() => {
    const activeOnly = filteredCampusQueue.filter(
      (q) => !["Cancelled", "No Show"].includes(q.status)
    );
    return (activeOnly.length > 0 ? activeOnly : filteredCampusQueue).slice(0, 4);
  }, [filteredCampusQueue]);

  const activeStaffOnShift = React.useMemo(() => {
    return INITIAL_STAFF_MEMBERS.filter((member) =>
      matchesStaffShift(member.shift, appliedShift)
    );
  }, [appliedShift]);

  const dateCardTitle =
    appliedDateRange === "today"
      ? "Today's Appointments"
      : appliedDateRange === "tomorrow"
      ? "Tomorrow's Appointments"
      : appliedDateRange === "week"
      ? "This Week's Appointments"
      : `Appointments (${formatShortCustomDate(appliedCustomDate)})`;

  const firstName = user.name.split(" ")[0] || "Administrator";

  return (
    <div className="dashboard-theme font-body-md text-body-md text-[#1F2B46] antialiased bg-transparent w-full min-w-0 flex-1">
      <main className="relative bg-transparent w-full min-w-0 px-4 md:px-8 pt-6 pb-12">
        <div className="flex flex-col w-full min-w-0">
            {/* Top Greeting & Header Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg mb-space-2xl mt-6">
              <div>
                <div className="flex flex-wrap items-center gap-space-sm mb-1">
                  <h1 className="font-headline-lg text-headline-lg text-[#1F2B46] tracking-tight">
                    Welcome back, {firstName}!
                  </h1>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-supporting text-supporting font-semibold bg-secondary-fixed text-on-secondary-fixed shadow-sm shrink-0"
                    title={`Assigned: ${user.name} (${user.role})`}
                  >
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    {user.shift}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-[#5A6372]">
                  Here&apos;s what&apos;s happening at {activeFacility.name} — {activeCampus.name} today.
                </p>
              </div>

              {/* Header Actions */}
              <div className="flex flex-wrap items-center gap-space-md shrink-0">
                {/* Date Chip */}
                <div className="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-white border border-[#DDE6DA] shadow-sm text-[#1F2B46] shrink-0">
                  <span className="material-symbols-outlined text-[#0055A4] text-xl">
                    event
                  </span>
                  <span className="font-card-heading text-card-heading min-w-[160px]">
                    {formattedCurrentDate || "\u00A0"}
                  </span>
                </div>

                {/* Filter Dropdown */}
                <div className="relative inline-block text-left shrink-0" ref={filterContainerRef}>
                  <button
                    onClick={handleToggleFilter}
                    className={`flex items-center gap-space-sm px-space-md py-2 rounded-xl border shadow-sm transition-colors font-card-heading text-card-heading cursor-pointer ${
                      isFilterOpen || !isDefaultFilter
                        ? "bg-[#E7F0FF] border-[#0055A4]/40 text-[#0055A4]"
                        : "bg-white border-[#DDE6DA] hover:bg-[#F3F6F0] text-[#1F2B46]"
                    }`}
                    type="button"
                    aria-expanded={isFilterOpen}
                    aria-haspopup="true"
                  >
                    <span className="material-symbols-outlined text-lg">
                      tune
                    </span>
                    <span>{filterButtonLabel}</span>
                    <span
                      className={`material-symbols-outlined text-base transition-transform duration-150 ${
                        isFilterOpen ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {isFilterOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#D5DFD2] shadow-2xl z-40 overflow-hidden"
                      role="dialog"
                      aria-label="Date Range and Shift Filter"
                    >
                      <div className="p-4 border-b border-[#DDE6DA] bg-[#F8FAF6] flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-[#1F2B46]">
                            Operational View Filter
                          </h3>
                          <p className="text-[11px] text-[#5A6372]">
                            Filter dashboard metrics by date range &amp; facility shift
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsFilterOpen(false)}
                          className="p-1 rounded-lg text-[#5A6372] hover:bg-[#E8EFE5] hover:text-[#1F2B46] transition-colors cursor-pointer"
                          aria-label="Close filter dropdown"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Section A: Date Range */}
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A6372] block mb-2">
                            Date Range
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {(
                              [
                                { id: "today", label: "Today" },
                                { id: "tomorrow", label: "Tomorrow" },
                                { id: "week", label: "This Week" },
                                { id: "custom", label: "Custom Date" },
                              ] as { id: DateRangeOption; label: string }[]
                            ).map((option) => {
                              const active = draftDateRange === option.id;
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => setDraftDateRange(option.id)}
                                  className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all cursor-pointer ${
                                    active
                                      ? "bg-[#0055A4] text-white border-[#0055A4] shadow-xs"
                                      : "bg-[#F3F6F0] text-[#1F2B46] border-[#DDE6DA] hover:bg-[#E8EFE5]"
                                  }`}
                                >
                                  <span>{option.label}</span>
                                  {active && (
                                    <span className="material-symbols-outlined text-sm">
                                      check
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {draftDateRange === "custom" && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA]">
                              <label className="block text-[11px] font-semibold text-[#5A6372] mb-1">
                                Select Date
                              </label>
                              <input
                                type="date"
                                value={draftCustomDate}
                                onChange={(e) => setDraftCustomDate(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#D5DFD2] text-xs font-medium text-[#1F2B46] focus:outline-none focus:border-[#0055A4]"
                              />
                            </div>
                          )}
                        </div>

                        {/* Section B: Shift */}
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A6372] block mb-2">
                            Hospital Shift
                          </span>
                          <div className="space-y-1.5">
                            {(["all", "morning", "afternoon", "night"] as ShiftOption[]).map(
                              (shiftKey) => {
                                const win = SHIFT_WINDOWS[shiftKey];
                                const active = draftShift === shiftKey;
                                return (
                                  <button
                                    key={shiftKey}
                                    type="button"
                                    onClick={() => setDraftShift(shiftKey)}
                                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer ${
                                      active
                                        ? "bg-[#E7F0FF] text-[#0055A4] border-[#0055A4]"
                                        : "bg-white text-[#1F2B46] border-[#DDE6DA] hover:bg-[#F3F6F0]"
                                    }`}
                                  >
                                    <span>{win.label}</span>
                                    <span
                                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                        active
                                          ? "border-[#0055A4] bg-[#0055A4] text-white"
                                          : "border-[#C2C6D3]"
                                      }`}
                                    >
                                      {active && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                      )}
                                    </span>
                                  </button>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-3 border-t border-[#DDE6DA] bg-[#F8FAF6] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#5A6372] hover:bg-[#E8EFE5] hover:text-[#1F2B46] transition-colors cursor-pointer"
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyFilters}
                          className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#0055A4] hover:bg-[#00478a] text-white shadow-xs transition-colors cursor-pointer"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action CTA */}
                <Link
                  href="/dashboard/patients/new"
                  className="flex items-center gap-space-xs bg-[#0055A4] hover:bg-[#00478a] text-white px-space-lg py-2.5 rounded-xl font-button-label text-button-label shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-xl">
                    person_add
                  </span>
                  <span>+ Register Patient</span>
                </Link>
              </div>
            </div>

            {/* Section 1: Overview Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-lg mb-space-2xl">
              {/* Stat 1 */}
              <div className="p-space-xl bg-white border border-[#DDE6DA] rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-supporting text-supporting uppercase tracking-wider text-[#5A6372] font-semibold block">
                      Total Patients
                    </span>
                    <div className="font-headline-xl text-headline-xl text-[#1F2B46] mt-1 tracking-tight">
                      {patientStats.totalPatients}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#0055A4] text-white flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-2xl">
                      group
                    </span>
                  </div>
                </div>
                <div className="mt-space-lg flex items-center justify-between gap-2">
                  <span className="font-supporting text-supporting text-[#5A6372] truncate">
                    Registered at {activeCampus.name}
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-supporting text-supporting font-semibold bg-tertiary-fixed text-on-tertiary-fixed shrink-0">
                    <span className="material-symbols-outlined text-xs">
                      trending_up
                    </span>{" "}
                    +12.5% MoM
                  </span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="p-space-xl bg-white border border-[#DDE6DA] rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-supporting text-supporting uppercase tracking-wider text-[#5A6372] font-semibold block">
                      {dateCardTitle}
                    </span>
                    <div className="font-headline-xl text-headline-xl text-[#1F2B46] mt-1 tracking-tight">
                      {aptStats.totalToday}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary-fixed text-[#0055A4] flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-2xl">
                      calendar_month
                    </span>
                  </div>
                </div>
                <div className="mt-space-lg flex items-center justify-between gap-2">
                  <span className="font-supporting text-supporting text-[#5A6372] truncate">
                    {aptStats.completedAppointments} completed
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-supporting text-supporting font-semibold bg-[#EDF2E9] border border-[#DDE6DA] text-[#0055A4] shrink-0">
                    {aptStats.confirmedAppointments} confirmed
                  </span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-space-xl bg-white border border-[#DDE6DA] rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-supporting text-supporting uppercase tracking-wider text-[#5A6372] font-semibold block">
                      Patients in Queue
                    </span>
                    <div className="font-headline-xl text-headline-xl text-[#1F2B46] mt-1 tracking-tight">
                      {queueStats.waiting + queueStats.inConsultation + queueStats.checkedIn}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-2xl">
                      timelapse
                    </span>
                  </div>
                </div>
                <div className="mt-space-lg flex items-center justify-between gap-2">
                  <span className="font-supporting text-supporting text-[#5A6372] truncate">
                    Avg. wait time: {queueStats.averageWaitMinutes} min
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-supporting text-supporting font-semibold bg-[#E2E8DE] text-[#3B4D0D] shrink-0">
                    Optimal throughput
                  </span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="p-space-xl bg-white border border-[#DDE6DA] rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-supporting text-supporting uppercase tracking-wider text-[#5A6372] font-semibold block">
                      Pending Requests
                    </span>
                    <div className="font-headline-xl text-headline-xl text-[#1F2B46] mt-1 tracking-tight">
                      {aptStats.pendingRequests}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] text-[#5A6372] flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-2xl">
                      assignment_late
                    </span>
                  </div>
                </div>
                <div className="mt-space-lg flex items-center justify-between gap-2">
                  <span className="font-supporting text-supporting text-[#5A6372] truncate">
                    {aptStats.pendingRequests} awaiting staff action
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-supporting text-supporting font-semibold bg-secondary-fixed-dim text-on-secondary-fixed-variant shrink-0">
                    Requires action
                  </span>
                </div>
              </div>
            </div>

            {/* AI Processing Overview Section */}
            <div className="bg-white rounded-xl p-space-lg shadow-sm mb-space-2xl border border-[#DDE6DA]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm mb-space-md">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary-fixed text-[#0055A4] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">
                      smart_toy
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-card-heading text-card-heading text-[#1F2B46]">
                        AI Processing Overview
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full font-supporting text-supporting font-semibold bg-[#EDF2E9] border border-[#DDE6DA] text-[#0055A4] shrink-0">
                        MedKnot Copilot
                      </span>
                    </div>
                    <p className="font-supporting text-supporting text-[#5A6372] truncate">
                      Smart Triage &amp; Clinical Documentation Assistance
                      (Drafts await clinician sign-off)
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-supporting text-supporting bg-[#F3F6F0] text-[#5A6372] border border-[#DDE6DA] shrink-0">
                  <span className="material-symbols-outlined text-sm text-secondary shrink-0">
                    verified_user
                  </span>
                  <span>
              
                    AI Assistant drafts only • No independent clinical diagnosis
                    • Clinician verification required
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                <div className="p-space-md rounded-xl bg-[#F3F6F0] flex items-center justify-between border border-[#DDE6DA] gap-2">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#DDE6DA] text-[#0055A4] flex items-center justify-center shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-xl">
                        document_scanner
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-supporting text-supporting text-[#5A6372] block truncate">
                        Documents Processed Today
                      </span>
                      <span className="font-card-heading text-card-heading text-[#1F2B46] font-bold block truncate">
                        18 Documents
                      </span>
                      <span className="font-supporting text-supporting text-[#5A6372] block truncate">
                        OCR &amp; Intake Extraction
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-md font-supporting text-supporting font-semibold bg-secondary-fixed text-on-secondary-fixed shrink-0">
                    99.4% Match
                  </span>
                </div>

                <div className="p-space-md rounded-xl bg-[#F3F6F0] flex items-center justify-between border border-[#DDE6DA] gap-2">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#DDE6DA] text-[#0055A4] flex items-center justify-center shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-xl">
                        summarize
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-supporting text-supporting text-[#5A6372] block truncate">
                        AI Summaries Awaiting Review
                      </span>
                      <span className="font-card-heading text-card-heading text-[#1F2B46] font-bold block truncate">
                        05 Summaries
                      </span>
                      <span className="font-supporting text-supporting text-[#5A6372] block truncate">
                        Clinician validation required
                      </span>
                    </div>
                  </div>
                  <button
                    className="px-2.5 py-1 rounded-lg bg-[#0055A4] hover:bg-[#00478a] text-white font-button-label text-supporting font-semibold transition-colors shadow-sm cursor-pointer shrink-0"
                    type="button"
                  >
                    Review
                  </button>
                </div>

                <div className="p-space-md rounded-xl bg-[#F3F6F0] flex items-center justify-between border border-[#DDE6DA] gap-2">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#DDE6DA] text-error flex items-center justify-center shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-xl">
                        flag
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-supporting text-supporting text-[#5A6372] block truncate">
                        Documents Requiring Verification
                      </span>
                      <span className="font-card-heading text-card-heading text-error font-bold block truncate">
                        03 Documents
                      </span>
                      <span className="font-supporting text-supporting text-[#5A6372] block truncate">
                        Flagged for human check
                      </span>
                    </div>
                  </div>
                  <button
                    className="px-2.5 py-1 rounded-lg bg-error-container text-on-error-container hover:bg-error hover:text-on-error font-button-label text-supporting font-semibold transition-colors cursor-pointer shrink-0"
                    type="button"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Quick Action Bar */}
            <div className="bg-white rounded-xl p-space-lg shadow-sm mb-space-2xl border border-[#DDE6DA]">
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-supporting text-supporting uppercase tracking-wider text-[#5A6372] font-bold">
                  Fast Routing &amp; Hospital Operations
                </span>
                <span className="font-supporting text-supporting text-[#5A6372]">
                  Instant execution shortcuts
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-space-md">
                <Link
                  href="/dashboard/patients/new"
                  className="group flex items-center gap-space-sm p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] hover:bg-[#0055A4] hover:border-[#0055A4] transition-all text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#DDE6DA] text-[#0055A4] group-hover:bg-white group-hover:text-[#0055A4] group-hover:border-white flex items-center justify-center shrink-0 shadow-sm transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      person_add
                    </span>
                  </div>
                  <span className="font-button-label text-body-md font-semibold text-[#1F2B46] group-hover:text-white truncate transition-colors">
                    + Register Patient
                  </span>
                </Link>

                <button
                  className="group flex items-center gap-space-sm p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] hover:bg-[#0055A4] hover:border-[#0055A4] transition-all text-left cursor-pointer"
                  type="button"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#DDE6DA] text-[#0055A4] group-hover:bg-white group-hover:text-[#0055A4] group-hover:border-white flex items-center justify-center shrink-0 shadow-sm transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      medical_services
                    </span>
                  </div>
                  <span className="font-button-label text-body-md font-semibold text-[#1F2B46] group-hover:text-white truncate transition-colors">
                    + Add Doctor / Staff
                  </span>
                </button>

                <button
                  className="group flex items-center gap-space-sm p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] hover:bg-[#0055A4] hover:border-[#0055A4] transition-all text-left cursor-pointer"
                  type="button"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#DDE6DA] text-[#0055A4] group-hover:bg-white group-hover:text-[#0055A4] group-hover:border-white flex items-center justify-center shrink-0 shadow-sm transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      calendar_month
                    </span>
                  </div>
                  <span className="font-button-label text-body-md font-semibold text-[#1F2B46] group-hover:text-white truncate transition-colors">
                    Manage Appointments
                  </span>
                </button>

                <button
                  className="group flex items-center gap-space-sm p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] hover:bg-[#0055A4] hover:border-[#0055A4] transition-all text-left cursor-pointer"
                  type="button"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#DDE6DA] text-[#0055A4] group-hover:bg-white group-hover:text-[#0055A4] group-hover:border-white flex items-center justify-center shrink-0 shadow-sm transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      clinical_notes
                    </span>
                  </div>
                  <span className="font-button-label text-body-md font-semibold text-[#1F2B46] group-hover:text-white truncate transition-colors">
                    View Medical Records
                  </span>
                </button>

                <button
                  className="group flex items-center gap-space-sm p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] hover:bg-[#0055A4] hover:border-[#0055A4] transition-all text-left cursor-pointer"
                  type="button"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#DDE6DA] text-[#0055A4] group-hover:bg-white group-hover:text-[#0055A4] group-hover:border-white flex items-center justify-center shrink-0 shadow-sm transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      view_timeline
                    </span>
                  </div>
                  <span className="font-button-label text-body-md font-semibold text-[#1F2B46] group-hover:text-white truncate transition-colors">
                    Live Queue Console
                  </span>
                </button>
              </div>
            </div>

            {/* Section 3: Main Dashboard Content Area (65% / 35%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl">
              {/* Left Column (8 of 12 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-space-2xl">
                {/* A. Today's Appointment Overview */}
                <div className="bg-white border border-[#DDE6DA] rounded-xl shadow-sm p-space-xl flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-lg gap-space-md">
                    <div className="flex items-center gap-space-sm">
                      <h2 className="font-headline-sm text-headline-sm text-[#1F2B46]">
                        {appliedDateRange === "today"
                          ? "Today's Appointment Overview"
                          : appliedDateRange === "tomorrow"
                          ? "Tomorrow's Appointment Overview"
                          : appliedDateRange === "week"
                          ? "This Week's Appointment Overview"
                          : `Appointment Overview (${formatShortCustomDate(appliedCustomDate)})`}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full font-supporting text-supporting font-semibold bg-[#F3F6F0] border border-[#DDE6DA] text-[#5A6372]">
                        {aptStats.totalToday} Scheduled
                      </span>
                    </div>
                    <Link
                      className="font-button-label text-body-md text-[#0055A4] hover:underline flex items-center gap-1"
                      href="/dashboard/appointments"
                    >
                      <span className="material-symbols-outlined text-base">
                        calendar_view_day
                      </span>
                      View All Appointments
                      <span className="material-symbols-outlined text-base">
                        arrow_forward
                      </span>
                    </Link>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-space-md mb-space-md">
                    {[
                      { id: "all", label: `All (${aptTabCounts.all})` },
                      { id: "in-consultation", label: `In Consultation (${aptTabCounts["in-consultation"]})` },
                      { id: "waiting", label: `Waiting (${aptTabCounts.waiting})` },
                      { id: "confirmed", label: `Confirmed (${aptTabCounts.confirmed})` },
                      { id: "completed", label: `Completed (${aptTabCounts.completed})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveAptFilter(tab.id)}
                        className={`px-space-md py-1.5 rounded-lg font-button-label text-supporting font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          activeAptFilter === tab.id
                            ? "bg-[#0055A4] text-white shadow-sm"
                            : "bg-[#F3F6F0] border border-[#DDE6DA] text-[#424751] hover:bg-[#E2E8DE] hover:text-[#1F2B46]"
                        }`}
                        type="button"
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Appointments Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#F3F6F0] text-[#5A6372] font-supporting text-supporting uppercase tracking-wider border-b border-[#DDE6DA]">
                        <tr>
                          <th className="py-3 px-space-md rounded-l-lg">
                            Patient Name
                          </th>
                          <th className="py-3 px-space-md">Patient ID</th>
                          <th className="py-3 px-space-md">
                            Doctor &amp; Specialty
                          </th>
                          <th className="py-3 px-space-md">Time</th>
                          <th className="py-3 px-space-md">Status</th>
                          <th className="py-3 px-space-md text-right rounded-r-lg">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="font-body-md text-body-md text-[#1F2B46]">
                        {filteredApts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-[#5A6372]">
                              No appointments scheduled for <span className="font-semibold text-[#1F2B46]">{filterButtonLabel}</span> at {activeCampus.name}.
                            </td>
                          </tr>
                        ) : (
                          filteredApts.slice(0, 6).map((apt) => (
                            <tr
                              key={apt.appointmentId}
                              className="hover:bg-[#F3F6F0]/70 transition-colors border-b border-[#DDE6DA]"
                            >
                              <td className="py-3.5 px-space-md">
                                <div className="flex items-center gap-space-sm">
                                  {apt.avatar ? (
                                    <Image
                                      className="w-9 h-9 rounded-full object-cover shadow-sm shrink-0"
                                      alt={apt.patientName}
                                      src={apt.avatar}
                                      width={36}
                                      height={36}
                                      unoptimized
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold flex items-center justify-center text-sm shadow-sm">
                                      {apt.initials}
                                    </div>
                                  )}
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-card-heading text-card-heading text-[#1F2B46] leading-tight truncate">
                                      {apt.patientName}
                                    </span>
                                    <span className="font-supporting text-supporting text-[#5A6372]">
                                      {apt.details}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-space-md font-mono text-supporting text-[#5A6372] whitespace-nowrap">
                                {apt.id}
                              </td>
                              <td className="py-3.5 px-space-md">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-[#1F2B46]">
                                    {apt.doctor}
                                  </span>
                                  <span className="font-supporting text-supporting text-[#5A6372]">
                                    {apt.specialty}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-space-md font-semibold text-[#0055A4] whitespace-nowrap">{apt.time}</td>
                              <td className="py-3.5 px-space-md whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full font-supporting text-supporting font-semibold shrink-0 ${apt.badgeClass}`}
                                >
                                  {apt.statusLabel}
                                </span>
                              </td>
                              <td className="py-3.5 px-space-md text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1 shrink-0">
                                  <button
                                    title="View EHR"
                                    onClick={() => router.push(`/dashboard/patients/${apt.id}`)}
                                    className="p-1.5 rounded-lg text-[#0055A4] hover:bg-primary-fixed transition-colors cursor-pointer"
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-lg">
                                      clinical_notes
                                    </span>
                                  </button>
                                  <button
                                    title="Check In"
                                    onClick={() => router.push(`/dashboard/appointments/${apt.appointmentId}`)}
                                    className="p-1.5 rounded-lg text-[#5A6372] hover:bg-[#E2E8DE] transition-colors cursor-pointer"
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-lg">
                                      how_to_reg
                                    </span>
                                  </button>
                                  <button
                                    title="Reschedule"
                                    onClick={() => router.push(`/dashboard/appointments/${apt.appointmentId}`)}
                                    className="p-1.5 rounded-lg text-[#5A6372] hover:bg-[#E2E8DE] transition-colors cursor-pointer"
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-lg">
                                      edit_calendar
                                    </span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* B. Live Patient Queue Overview */}
                <div className="bg-white border border-[#DDE6DA] rounded-xl shadow-sm p-space-xl flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-lg gap-space-md">
                    <div className="flex items-center gap-space-sm">
                      <h2 className="font-headline-sm text-headline-sm text-[#1F2B46]">
                        Patient Queue Overview (OPD &amp; Triage)
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full font-supporting text-supporting font-semibold bg-secondary-fixed text-on-secondary-fixed">
                        {queueStats.waiting + queueStats.checkedIn + queueStats.inConsultation} Active
                      </span>
                    </div>
                    <Link
                      className="font-button-label text-body-md text-[#0055A4] hover:underline flex items-center gap-1"
                      href="/dashboard/queue"
                    >
                      View Live Queue Console{" "}
                      <span className="material-symbols-outlined text-base">
                        open_in_new
                      </span>
                    </Link>
                  </div>

                  {activeQueueDisplay.length === 0 ? (
                    <div className="p-8 rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] text-center text-[#5A6372] font-body-md text-body-md">
                      No queue entries recorded for <span className="font-semibold text-[#1F2B46]">{filterButtonLabel}</span> at {activeCampus.name}.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      {activeQueueDisplay.map((entry, idx) => {
                        const waitMins = entry.actualWaitMinutes ?? entry.estimatedWaitMinutes ?? 0;
                        const statusChipClass =
                          entry.status === "In Consultation"
                            ? "bg-secondary-fixed text-on-secondary-fixed"
                            : entry.status === "Waiting"
                            ? "bg-secondary-fixed-dim text-on-secondary-fixed-variant"
                            : entry.status === "Completed"
                            ? "bg-tertiary-fixed text-on-tertiary-fixed"
                            : "bg-primary-fixed text-[#0055A4]";
                        return (
                          <div
                            key={entry.id}
                            className="p-space-lg rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] flex flex-col justify-between hover:bg-[#E8EFE5] transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-space-md min-w-0">
                                <span
                                  className={`px-3 py-1.5 rounded-xl font-headline-sm text-headline-sm font-mono shadow-sm shrink-0 ${
                                    idx === 0
                                      ? "bg-[#0055A4] text-white"
                                      : "bg-white border border-[#DDE6DA] text-[#0055A4]"
                                  }`}
                                >
                                  {entry.queueNumber}
                                </span>
                                <div className="min-w-0">
                                  <h3 className="font-card-heading text-card-heading text-[#1F2B46] truncate">
                                    {entry.patientName}
                                  </h3>
                                  <p className="font-supporting text-supporting text-[#5A6372] truncate">
                                    {entry.roomNumber || "Triage Desk"} • {entry.doctorName}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-supporting text-supporting font-semibold shrink-0 ${statusChipClass}`}
                              >
                                {entry.status === "In Consultation" && (
                                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                                )}
                                {entry.status}
                              </span>
                            </div>
                            <div className="mt-space-md pt-space-sm border-t border-[#DDE6DA] flex items-center justify-between font-supporting text-supporting text-[#5A6372]">
                              <span>Department: {entry.department}</span>
                              <span className="flex items-center gap-1 font-semibold text-[#1F2B46] shrink-0">
                                <span className="material-symbols-outlined text-sm shrink-0">
                                  schedule
                                </span>{" "}
                                {waitMins} min wait
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (4 of 12 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-space-2xl">
                {/* Facility Performance Widget */}
                <div className="bg-white border border-[#DDE6DA] rounded-xl shadow-sm p-space-xl flex flex-col">
                  <div className="flex items-center justify-between pb-space-md">
                    <div className="flex items-center gap-space-xs">
                      <h2 className="font-headline-sm text-headline-sm text-[#1F2B46]">
                        Facility Performance
                      </h2>
                      <span className="material-symbols-outlined text-[#0055A4] text-lg">
                        speed
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-supporting text-supporting font-semibold bg-secondary-fixed text-on-secondary-fixed shrink-0">
                      Target met
                    </span>
                  </div>
                  <div className="flex flex-col gap-space-md">
                    {/* Metric 1 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-card-heading text-card-heading text-[#1F2B46]">
                          Avg. Patient Waiting Time
                        </span>
                        <span className="font-card-heading text-card-heading font-bold text-[#0055A4]">
                          16.4 mins
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F3F6F0] border border-[#DDE6DA] overflow-hidden">
                        <div
                          className="h-full bg-[#0055A4] rounded-full"
                          style={{ width: "82%" }}
                        ></div>
                      </div>
                      <div className="flex justify-between font-supporting text-supporting text-[#5A6372] mt-1">
                        <span>Target: &lt; 20.0 mins</span>
                        <span className="text-tertiary font-semibold">
                          -3.6 mins under threshold
                        </span>
                      </div>
                    </div>

                    {/* Metric 2 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-card-heading text-card-heading text-[#1F2B46]">
                          Appointment Completion Rate
                        </span>
                        <span className="font-card-heading text-card-heading font-bold text-secondary">
                          91.2%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F3F6F0] border border-[#DDE6DA] overflow-hidden">
                        <div
                          className="h-full bg-secondary-fixed-dim rounded-full"
                          style={{ width: "91.2%" }}
                        ></div>
                      </div>
                      <div className="flex justify-between font-supporting text-supporting text-[#5A6372] mt-1">
                        <span>Target: &gt; 88%</span>
                        <span className="text-secondary font-semibold">
                          High Efficiency
                        </span>
                      </div>
                    </div>

                    {/* Metric 3 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-card-heading text-card-heading text-[#1F2B46]">
                          Pending Registration Requests
                        </span>
                        <span className="font-card-heading text-card-heading font-bold text-error">
                          4 Files in SLA
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F3F6F0] border border-[#DDE6DA] overflow-hidden">
                        <div
                          className="h-full bg-error rounded-full"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                      <div className="flex justify-between font-supporting text-supporting text-[#5A6372] mt-1">
                        <span>Intake queue processing</span>
                        <span className="text-error font-semibold">
                          Within 15 min SLA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* C. Pending Tasks & Authorizations */}
                <div className="bg-white border border-[#DDE6DA] rounded-xl shadow-sm p-space-xl flex flex-col">
                  <div className="flex items-center justify-between pb-space-md">
                    <div className="flex items-center gap-space-xs">
                      <h2 className="font-headline-sm text-headline-sm text-[#1F2B46]">
                        Pending Tasks
                      </h2>
                      <span className="w-2 h-2 rounded-full bg-error" />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-supporting text-supporting font-semibold bg-error-container text-on-error-container">
                      4 Critical
                    </span>
                  </div>
                  <div className="flex flex-col gap-space-md">
                    <div className="p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] flex items-center justify-between hover:bg-[#E8EFE5] transition-colors gap-2">
                      <div className="flex items-start gap-space-sm min-w-0">
                        <span className="material-symbols-outlined text-[#0055A4] text-xl mt-0.5 shrink-0">how_to_reg</span>
                        <div className="min-w-0">
                          <span className="font-card-heading text-card-heading text-[#1F2B46] leading-tight block truncate">
                            New Patient Intake
                          </span>
                          <span className="font-supporting text-supporting text-[#5A6372] block truncate">
                            3 profiles pending ID review
                          </span>
                        </div>
                      </div>
                      <button
                        className="px-space-md py-1 rounded-lg bg-[#0055A4] text-white font-button-label text-supporting font-semibold hover:bg-[#00478a] transition-colors cursor-pointer shrink-0"
                        type="button"
                      >
                        Review
                      </button>
                    </div>

                    <div className="p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] flex items-center justify-between hover:bg-[#E8EFE5] transition-colors gap-2">
                      <div className="flex items-start gap-space-sm min-w-0">
                        <span className="material-symbols-outlined text-secondary text-xl mt-0.5 shrink-0">
                          edit_calendar
                        </span>
                        <div className="min-w-0">
                          <span className="font-card-heading text-card-heading text-[#1F2B46] leading-tight block truncate">
                            Appointment Requests
                          </span>
                          <span className="font-supporting text-supporting text-[#5A6372] block truncate">
                            {aptStats.pendingRequests} requests via patient portal
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push("/dashboard/appointments/requests")}
                        className="px-space-md py-1 rounded-lg bg-secondary-fixed text-on-secondary-fixed font-button-label text-supporting font-semibold hover:bg-secondary-fixed-dim transition-colors cursor-pointer shrink-0"
                        type="button"
                      >
                        Triage
                      </button>
                    </div>

                    <div className="p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] flex items-center justify-between hover:bg-[#E8EFE5] transition-colors gap-2">
                      <div className="flex items-start gap-space-sm min-w-0">
                        <span className="material-symbols-outlined text-[#0055A4] text-xl mt-0.5 shrink-0">fact_check</span>
                        <div className="min-w-0">
                          <span className="font-card-heading text-card-heading text-[#1F2B46] leading-tight block truncate">
                            Lab Document Signoff
                          </span>
                          <span className="font-supporting text-supporting text-[#5A6372] block truncate">
                            2 external lab report scans
                          </span>
                        </div>
                      </div>
                      <button
                        className="px-space-md py-1 rounded-lg bg-white border border-[#DDE6DA] text-[#0055A4] font-button-label text-supporting font-semibold hover:bg-[#F3F6F0] transition-colors cursor-pointer shrink-0"
                        type="button"
                      >
                        Verify
                      </button>
                    </div>

                    <div className="p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] flex items-center justify-between hover:bg-[#E8EFE5] transition-colors gap-2">
                      <div className="flex items-start gap-space-sm min-w-0">
                        <span className="material-symbols-outlined text-error text-xl mt-0.5 shrink-0">
                          report_problem
                        </span>
                        <div className="min-w-0">
                          <span className="font-card-heading text-card-heading text-[#1F2B46] leading-tight block truncate">
                            Incomplete Records
                          </span>
                          <span className="font-supporting text-supporting text-[#5A6372] block truncate">
                            4 files missing guardian data
                          </span>
                        </div>
                      </div>
                      <button
                        className="px-space-md py-1 rounded-lg bg-white border border-[#DDE6DA] text-error font-button-label text-supporting font-semibold hover:bg-error-container transition-colors cursor-pointer shrink-0"
                        type="button"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>

                {/* D. Department Status & Volume */}
                <div className="bg-white border border-[#DDE6DA] rounded-xl shadow-sm p-space-xl flex flex-col">
                  <div className="flex items-center justify-between pb-space-md">
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-[#1F2B46]">
                        Department Status
                      </h2>
                      <span className="font-supporting text-supporting text-[#5A6372]">
                        (Simulated Live Telemetry)
                      </span>
                    </div>
                    <span className="font-supporting text-supporting text-[#5A6372] font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                      Live Capacity
                    </span>
                  </div>
                  <div className="flex flex-col gap-space-md">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-card-heading text-card-heading text-[#1F2B46]">
                            General Medicine
                          </span>
                          <span className="font-supporting text-supporting text-[#5A6372]">
                            • 16 apps
                          </span>
                        </div>
                        <span className="font-supporting text-supporting font-semibold text-[#0055A4]">
                          92% load
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F3F6F0] border border-[#DDE6DA] overflow-hidden">
                        <div
                          className="h-full bg-[#0055A4] rounded-full"
                          style={{ width: "92%" }}
                        ></div>
                      </div>
                      <div className="flex justify-between font-supporting text-supporting text-[#5A6372] mt-1">
                        <span>OPD Active • Rooms 301-305</span>
                        <span>High Traffic</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-card-heading text-card-heading text-[#1F2B46]">
                            Cardiology
                          </span>
                          <span className="font-supporting text-supporting text-[#5A6372]">
                            • 10 apps
                          </span>
                        </div>
                        <span className="font-supporting text-supporting font-semibold text-secondary">
                          75% load
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F3F6F0] border border-[#DDE6DA] overflow-hidden">
                        <div
                          className="h-full bg-secondary-fixed-dim rounded-full"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                      <div className="flex justify-between font-supporting text-supporting text-[#5A6372] mt-1">
                        <span>Echo Lab operational • Room 210</span>
                        <span>Stable</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-card-heading text-card-heading text-[#1F2B46]">
                            Orthopedics
                          </span>
                          <span className="font-supporting text-supporting text-[#5A6372]">
                            • 8 apps
                          </span>
                        </div>
                        <span className="font-supporting text-supporting font-semibold text-tertiary">
                          60% load
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F3F6F0] border border-[#DDE6DA] overflow-hidden">
                        <div
                          className="h-full bg-tertiary-fixed rounded-full"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                      <div className="flex justify-between font-supporting text-supporting text-[#5A6372] mt-1">
                        <span>Plaster clinic open • Room 108</span>
                        <span>Nominal</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-card-heading text-card-heading text-[#1F2B46]">
                            Pediatrics
                          </span>
                          <span className="font-supporting text-supporting text-[#5A6372]">
                            • 9 apps
                          </span>
                        </div>
                        <span className="font-supporting text-supporting font-semibold text-[#0055A4]">
                          80% load
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F3F6F0] border border-[#DDE6DA] overflow-hidden">
                        <div
                          className="h-full bg-primary-fixed rounded-full"
                          style={{ width: "80%" }}
                        ></div>
                      </div>
                      <div className="flex justify-between font-supporting text-supporting text-[#5A6372] mt-1">
                        <span>Well-baby clinic • Room 112</span>
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* E. Recent Facility Activity */}
                <div className="bg-white border border-[#DDE6DA] rounded-xl shadow-sm p-space-xl flex flex-col">
                  <div className="flex items-center justify-between pb-space-md">
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-[#1F2B46]">
                        Recent Facility Activity
                      </h2>
                      <span className="font-supporting text-supporting text-[#5A6372]">
                        {filterButtonLabel} • {activeStaffOnShift.length} staff on shift
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[#5A6372] text-lg">
                      history
                    </span>
                  </div>
                  {filteredCampusQueue.length === 0 &&
                  filteredCampusAppointments.length === 0 &&
                  activeStaffOnShift.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] text-supporting text-[#5A6372]">
                      No operational or staff shift activity recorded for {filterButtonLabel}.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-space-lg">
                      <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#DDE6DA]"></div>

                      {filteredCampusQueue.slice(0, 2).map((q, idx) => (
                        <div key={q.id} className="relative flex items-start gap-space-sm">
                          <span
                            className={`absolute -left-6 top-1 w-3 h-3 rounded-full ring-4 ring-white ${
                              idx === 0 ? "bg-[#0055A4]" : "bg-secondary"
                            }`}
                          />
                          <div>
                            <p className="font-body-md text-body-md text-[#1F2B46] leading-tight">
                              <span className="font-semibold">{q.doctorName}</span>{" "}
                              — Queue{" "}
                              <span className="font-mono font-semibold">{q.queueNumber}</span>{" "}
                              ({q.status}) for {q.patientName}
                            </p>
                            <span className="font-supporting text-supporting text-[#5A6372]">
                              {q.checkInTime} • {q.roomNumber || q.department}
                            </span>
                          </div>
                        </div>
                      ))}

                      {filteredCampusAppointments.slice(0, 1).map((apt) => (
                        <div key={apt.id} className="relative flex items-start gap-space-sm">
                          <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-tertiary ring-4 ring-white" />
                          <div>
                            <p className="font-body-md text-body-md text-[#1F2B46] leading-tight">
                              Appointment{" "}
                              <span className="font-semibold">{apt.patientName}</span>{" "}
                              ({apt.facilityPatientId}) • {apt.status}
                            </p>
                            <span className="font-supporting text-supporting text-[#5A6372]">
                              {apt.appointmentDate} at {apt.timeSlot} • {apt.department}
                            </span>
                          </div>
                        </div>
                      ))}

                      {activeStaffOnShift.slice(0, 2).map((staff) => (
                        <div key={staff.id} className="relative flex items-start gap-space-sm">
                          <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-surface-variant ring-4 ring-white" />
                          <div>
                            <p className="font-body-md text-body-md text-[#1F2B46] leading-tight">
                              <span className="font-semibold">{staff.name}</span>{" "}
                              ({staff.role}) • {staff.status === "on_leave" ? "Scheduled Leave" : staff.lastActive}
                            </p>
                            <span className="font-supporting text-supporting text-[#5A6372]">
                              {staff.shift} • {staff.department}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}
