"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Stethoscope,
  Building2,
  X,
  FileText,
  Clock,
  CalendarDays,
  User,
  Phone,
  CheckCircle2,
  ArrowRight,
  Printer,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  Appointment,
  AppointmentStatus,
} from "@/lib/appointments/types";
import {
  AVAILABLE_DEPARTMENTS,
  AVAILABLE_DOCTORS,
  AVAILABLE_TIME_SLOTS,
} from "@/lib/appointments/mock-data";
import { AppointmentService } from "@/lib/appointments/appointment-service";
import { useFacility } from "@/components/dashboard/facility/FacilityContext";

interface AppointmentCalendarViewProps {
  isGuestMode?: boolean;
}

type CalendarViewMode = "month" | "week" | "day";

// Demo reference date aligned with mock dataset
const DEMO_REFERENCE_DATE = new Date(2024, 10, 25); // Nov 25, 2024

export function AppointmentCalendarView({ isGuestMode = false }: AppointmentCalendarViewProps) {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [currentDate, setCurrentDate] = useState<Date>(DEMO_REFERENCE_DATE);

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Selected appointment for detail panel / modal
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Lock body scroll when modal is open & listen for Escape key
  useEffect(() => {
    if (selectedAppointment) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedAppointment(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedAppointment]);

  const { activeCampus } = useFacility();

  // Appointments list (scoped to active campus)
  const appointments = useMemo(
    () => AppointmentService.getAllAppointments(activeCampus.id),
    [activeCampus.id]
  );

  const stats = useMemo(
    () => AppointmentService.getAppointmentStats(activeCampus.id),
    [activeCampus.id]
  );

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (selectedDepartment !== "All" && apt.department !== selectedDepartment) return false;
      if (selectedDoctor !== "All" && apt.doctorId !== selectedDoctor) return false;
      if (selectedStatus !== "All" && apt.status !== selectedStatus) return false;
      return true;
    });
  }, [appointments, selectedDepartment, selectedDoctor, selectedStatus]);

  // Date Helpers
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const navigateDate = (delta: number) => {
    const next = new Date(currentDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() + delta);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() + delta * 7);
    } else {
      next.setDate(next.getDate() + delta);
    }
    setCurrentDate(next);
  };

  const jumpToToday = () => {
    setCurrentDate(new Date(2024, 10, 25));
  };

  // Week days generator (Mon - Sun)
  const currentWeekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Month days generator (full grid)
  const currentMonthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayIndex = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // Mon = 0
    const totalDays = lastDayOfMonth.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  // Compact operational time slots
  const operationalSlots = [
    "08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM",
    "02:00 PM", "03:00 PM", "04:00 PM"
  ];

  // Subtle status palette aligned with MedKnot design
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70";
      case "Under Review":
      case "Requested":
        return "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100/70";
      case "Awaiting Patient Response":
      case "Reschedule Requested":
        return "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/70";
      case "Completed":
        return "bg-[#E3EBDD] text-[#1F2B46] border-[#C8D6C3] hover:bg-[#D5E0D2]";
      case "Cancelled":
        return "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100/70";
      case "No Show":
        return "bg-red-50 text-red-800 border-red-200 hover:bg-red-100/70";
      default:
        return "bg-[#E6EDE2] text-[#5A6372] border-[#C8D6C3]";
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
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "No Show":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
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
          <span className="text-[#1F2B46] font-semibold">Calendar</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E3EBDD] text-[#2D382B] border border-[#C8D6C3]">
            <span className="material-symbols-outlined text-xs text-[#0055A4]">domain</span>
            <span>Facility Scope: St. Jude Medical Center (North Campus)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1F2B46] border border-[#C8D6C3]">
            <span className="material-symbols-outlined text-xs text-[#34A853]">verified</span>
            <span>Live Outpatient Schedule</span>
          </span>
        </div>
      </div>

      {/* Header Banner & Standard Sub-navigation Tabs */}
      <div className="bg-white border border-[#C5D2C0] rounded-2xl p-6 shadow-[0_3px_10px_rgba(31,43,70,0.10)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#1F2B46]">Appointment Calendar</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E7F0FF] text-[#0055A4] border border-[#C7DCFF]">
                Schedule Grid
              </span>
            </div>
            <p className="text-sm text-[#5A6372] mt-1">
              Interactive day, week, and month consultation timetable across clinical specialties.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/appointments/requests"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#C8D6C3] bg-[#E3EBDD] hover:bg-[#D5E0D2] text-[#1F2B46] text-xs font-semibold transition-colors"
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

        {/* Standard Sub-navigation Tabs matching Overview exactly */}
        <div className="border-t border-[#C8D6C3] pt-3 flex items-center gap-2">
          <Link
            href="/dashboard/appointments"
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#5A6372] hover:bg-[#E6EDE2] hover:text-[#1F2B46] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">table_chart</span>
            <span>Directory & Schedule</span>
          </Link>

          <Link
            href="/dashboard/appointments/calendar"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0055A4] text-white shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <span>Calendar View</span>
          </Link>

          <Link
            href="/dashboard/appointments/requests"
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#5A6372] hover:bg-[#E6EDE2] hover:text-[#1F2B46] transition-colors flex items-center gap-1.5"
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

      {/* Calendar Controls & Filter Bar */}
      <div className="rounded-2xl border border-[#C5D2C0] bg-white p-4 shadow-[0_3px_10px_rgba(31,43,70,0.10)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Date Navigator */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={jumpToToday}
              className="rounded-lg border border-[#C8D6C3] bg-[#E3EBDD] px-3 py-1.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#D5E0D2] transition-colors"
            >
              Today
            </button>
            <div className="flex items-center rounded-lg border border-[#C8D6C3] bg-white">
              <button
                onClick={() => navigateDate(-1)}
                className="p-1.5 text-[#1F2B46]/70 hover:bg-[#E6EDE2] rounded-l-lg transition-colors"
                title="Previous period"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigateDate(1)}
                className="p-1.5 text-[#1F2B46]/70 hover:bg-[#E6EDE2] rounded-r-lg transition-colors"
                title="Next period"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm font-bold text-[#1F2B46] min-w-[200px]">
              {viewMode === "month" && formatMonthYear(currentDate)}
              {viewMode === "week" &&
                `${currentWeekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${currentWeekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
              {viewMode === "day" &&
                currentDate.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>

          {/* View Mode Toggle & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode */}
            <div className="flex rounded-lg border border-[#C8D6C3] bg-[#E3EBDD] p-1">
              <button
                onClick={() => setViewMode("day")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === "day"
                    ? "bg-white text-[#0055A4] shadow-xs font-bold"
                    : "text-[#1F2B46]/70 hover:text-[#1F2B46]"
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === "week"
                    ? "bg-white text-[#0055A4] shadow-xs font-bold"
                    : "text-[#1F2B46]/70 hover:text-[#1F2B46]"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === "month"
                    ? "bg-white text-[#0055A4] shadow-xs font-bold"
                    : "text-[#1F2B46]/70 hover:text-[#1F2B46]"
                }`}
              >
                Month
              </button>
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              aria-label="Filter by department"
              className="rounded-lg border border-[#AEBEAA] bg-[#F3F7F2] px-2.5 py-1.5 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
            >
              <option value="All">All Departments</option>
              {AVAILABLE_DEPARTMENTS.map((dept: string) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Doctor Filter */}
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              aria-label="Filter by physician"
              className="rounded-lg border border-[#AEBEAA] bg-[#F3F7F2] px-2.5 py-1.5 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
            >
              <option value="All">All Doctors</option>
              {AVAILABLE_DOCTORS.map((doc: { id: string; name: string }) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by status"
              className="rounded-lg border border-[#AEBEAA] bg-[#F3F7F2] px-2.5 py-1.5 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Under Review">Under Review</option>
              <option value="Requested">Requested</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2.5 flex flex-wrap items-center gap-3.5 border-t border-[#C8D6C3] pt-2 text-[11px] text-[#1F2B46]/70">
          <span className="font-semibold text-[#1F2B46]">Status Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Under Review / Requested</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Awaiting Response</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      {/* CALENDAR BODY */}
      <div className="rounded-2xl border border-[#C5D2C0] bg-white shadow-[0_3px_10px_rgba(31,43,70,0.10)] overflow-hidden">
        {/* MONTH VIEW */}
        {viewMode === "month" && (
          <div>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-[#C8D6C3] bg-[#E3EBDD] text-center text-xs font-bold text-[#1F2B46] py-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Compact Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#C8D6C3]">
              {currentMonthDays.map(({ date, isCurrentMonth }, idx) => {
                const dateKey = formatDateStr(date);
                const dayApts = filteredAppointments.filter((a) => a.appointmentDate === dateKey);
                const isToday = isSameDay(date, new Date(2024, 10, 25));

                return (
                  <div
                    key={idx}
                    className={`min-h-[92px] p-1.5 transition-colors ${
                      !isCurrentMonth ? "bg-[#E3EBDD] text-[#667085]" : "bg-white hover:bg-[#E6EDE2]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                          isToday
                            ? "bg-[#0055A4] text-white"
                            : isCurrentMonth
                            ? "text-[#1F2B46]"
                            : "text-gray-400"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {dayApts.length > 0 && (
                        <span className="text-[10px] font-medium text-[#1F2B46]/60">
                          {dayApts.length} apt{dayApts.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayApts.slice(0, 2).map((apt) => (
                        <button
                          key={apt.id}
                          onClick={() => setSelectedAppointment(apt)}
                          className={`w-full text-left truncate rounded px-1.5 py-0.5 text-[10px] font-medium border transition-colors ${getStatusColor(
                            apt.status
                          )}`}
                          title={`${apt.timeSlot} - ${apt.patientName} (${apt.doctorName})`}
                        >
                          <span className="font-bold">{apt.timeSlot.split(" ")[0]}</span> {apt.patientName}
                        </button>
                      ))}
                      {dayApts.length > 2 && (
                        <p className="text-[10px] font-semibold text-[#0055A4] pl-1">
                          +{dayApts.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WEEK VIEW */}
        {viewMode === "week" && (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Day header columns */}
              <div className="grid grid-cols-8 border-b border-[#C8D6C3] bg-[#E3EBDD]">
                <div className="p-2.5 text-center text-xs font-bold text-[#1F2B46]/70 border-r border-[#C8D6C3]">
                  Slot
                </div>
                {currentWeekDays.map((d, i) => {
                  const isToday = isSameDay(d, new Date(2024, 10, 25));
                  return (
                    <div
                      key={i}
                      className={`p-2 text-center border-r border-[#C8D6C3] last:border-r-0 ${
                        isToday ? "bg-[#0055A4]/5" : ""
                      }`}
                    >
                      <div className="text-[11px] font-medium text-[#1F2B46]/60">
                        {d.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div
                        className={`inline-block mt-0.5 rounded-full px-2 py-0.2 text-xs font-bold ${
                          isToday ? "bg-[#0055A4] text-white" : "text-[#1F2B46]"
                        }`}
                      >
                        {d.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots rows */}
              <div className="divide-y divide-[#C8D6C3]">
                {operationalSlots.map((slot) => (
                  <div key={slot} className="grid grid-cols-8 min-h-[58px]">
                    {/* Time Label */}
                    <div className="p-1.5 text-right text-[11px] font-medium text-[#1F2B46]/60 border-r border-[#C8D6C3] bg-[#E3EBDD] flex items-center justify-end">
                      {slot}
                    </div>

                    {/* Day Cells */}
                    {currentWeekDays.map((d, i) => {
                      const dateKey = formatDateStr(d);
                      const matchingApts = filteredAppointments.filter(
                        (a) => a.appointmentDate === dateKey && a.timeSlot === slot
                      );

                      return (
                        <div
                          key={i}
                          className="p-1 border-r border-[#C8D6C3] last:border-r-0 hover:bg-[#E6EDE2] transition-colors"
                        >
                          <div className="flex flex-col gap-1">
                            {matchingApts.map((apt) => (
                              <button
                                key={apt.id}
                                onClick={() => setSelectedAppointment(apt)}
                                className={`w-full text-left rounded-md p-1 border text-[11px] shadow-2xs transition-colors overflow-hidden ${getStatusColor(
                                  apt.status
                                )}`}
                              >
                                <div className="font-bold truncate text-[#1F2B46]">
                                  {apt.patientName}
                                </div>
                                <div className="text-[10px] text-[#1F2B46]/70 truncate">
                                  {apt.doctorName}
                                </div>
                                <div className="text-[9px] font-semibold text-[#0055A4] truncate">
                                  {apt.department}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DAY VIEW */}
        {viewMode === "day" && (
          <div className="divide-y divide-[#C8D6C3]">
            <div className="bg-[#E3EBDD] p-3 text-center border-b border-[#C8D6C3]">
              <span className="text-xs font-semibold text-[#0055A4]">
                {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
              </span>
              <h2 className="text-lg font-bold text-[#1F2B46]">
                {currentDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </h2>
            </div>

            <div className="divide-y divide-[#C8D6C3]">
              {operationalSlots.map((slot) => {
                const dateKey = formatDateStr(currentDate);
                const matchingApts = filteredAppointments.filter(
                  (a) => a.appointmentDate === dateKey && a.timeSlot === slot
                );

                return (
                  <div key={slot} className="flex min-h-[64px]">
                    <div className="w-24 p-2 text-right text-xs font-semibold text-[#1F2B46]/60 bg-[#E3EBDD] border-r border-[#C8D6C3] flex items-center justify-end">
                      {slot}
                    </div>
                    <div className="flex-1 p-2">
                      {matchingApts.length === 0 ? (
                        <div className="h-full flex items-center text-xs text-[#1F2B46]/40 italic pl-2">
                          Available slot
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {matchingApts.map((apt) => (
                            <button
                              key={apt.id}
                              onClick={() => setSelectedAppointment(apt)}
                              className={`text-left rounded-lg p-2.5 border transition-all hover:shadow-xs ${getStatusColor(
                                apt.status
                              )}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs text-[#1F2B46]">
                                  {apt.patientName}
                                </span>
                                <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${getStatusBadge(apt.status)}`}>
                                  {apt.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#1F2B46]/80 flex items-center gap-1">
                                <Stethoscope className="h-3 w-3 text-[#0055A4]" />
                                {apt.doctorName}
                              </p>
                              <p className="text-[10px] text-[#1F2B46]/70 mt-0.5 truncate">
                                {apt.department} &bull; &ldquo;{apt.reasonForVisit}&rdquo;
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* APPOINTMENT DETAIL MODAL */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-[#C5D2C0] bg-white p-5 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#C8D6C3] pb-3">
              <div>
                <span className="text-xs font-mono text-[#0055A4] font-semibold">
                  {selectedAppointment.id}
                </span>
                <h3 className="text-base font-bold text-[#1F2B46]">
                  Appointment Summary
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="rounded-lg p-1.5 text-[#1F2B46]/60 hover:bg-[#E6EDE2] transition-colors"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-[#E3EBDD] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0055A4] text-white font-bold text-sm">
                    {selectedAppointment.patientName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1F2B46]">
                      {selectedAppointment.patientName}
                    </h4>
                    <p className="text-xs text-[#1F2B46]/70">
                      MRN: {selectedAppointment.facilityPatientId} &bull; {selectedAppointment.patientPhone}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusBadge(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-[#C8D6C3] p-2.5">
                  <span className="text-[#1F2B46]/60 block mb-0.5">Date & Time Slot</span>
                  <span className="font-semibold text-[#1F2B46]">
                    {selectedAppointment.appointmentDate} at {selectedAppointment.timeSlot}
                  </span>
                </div>
                <div className="rounded-lg border border-[#C8D6C3] p-2.5">
                  <span className="text-[#1F2B46]/60 block mb-0.5">Visit Modality</span>
                  <span className="font-semibold text-[#1F2B46]">
                    {selectedAppointment.appointmentType}
                  </span>
                </div>
                <div className="rounded-lg border border-[#C8D6C3] p-2.5">
                  <span className="text-[#1F2B46]/60 block mb-0.5">Assigned Physician</span>
                  <span className="font-semibold text-[#1F2B46]">
                    {selectedAppointment.doctorName}
                  </span>
                </div>
                <div className="rounded-lg border border-[#C8D6C3] p-2.5">
                  <span className="text-[#1F2B46]/60 block mb-0.5">Clinical Department</span>
                  <span className="font-semibold text-[#1F2B46]">
                    {selectedAppointment.department}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-[#C8D6C3] p-3 text-xs">
                <span className="font-semibold text-[#1F2B46]/70 block mb-1">
                  Reason for Visit
                </span>
                <p className="text-[#1F2B46] leading-relaxed">
                  {selectedAppointment.reasonForVisit}
                </p>
                {selectedAppointment.staffNotes && (
                  <p className="text-[#1F2B46]/70 mt-2 italic bg-[#E3EBDD] p-2 rounded">
                    Staff Notes: {selectedAppointment.staffNotes}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#C8D6C3] pt-3">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="rounded-lg border border-[#C8D6C3] bg-white px-3.5 py-1.5 text-xs font-medium text-[#1F2B46] hover:bg-[#E6EDE2] transition-colors"
              >
                Close
              </button>

              <Link
                href={`/dashboard/appointments/${selectedAppointment.id}`}
                className="flex items-center gap-1.5 rounded-lg bg-[#0055A4] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#004282] transition-colors shadow-2xs"
              >
                <FileText className="h-4 w-4" />
                Open Full Dossier
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
