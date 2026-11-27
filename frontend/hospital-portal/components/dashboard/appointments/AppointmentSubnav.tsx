"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

interface AppointmentSubnavProps {
  requestsCount?: number;
}

export function AppointmentSubnav({ requestsCount }: AppointmentSubnavProps) {
  const pathname = usePathname();

  const isOverview = pathname === "/dashboard/appointments";
  const isCalendar = pathname === "/dashboard/appointments/calendar";
  const isRequests = pathname === "/dashboard/appointments/requests";
  const isNew = pathname === "/dashboard/appointments/new";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C8D6C3] pb-4">
      {/* Tab Switcher */}
      <div className="flex items-center rounded-xl border border-[#C8D6C3] bg-white p-1 shadow-2xs">
        <Link
          href="/dashboard/appointments"
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            isOverview
              ? "bg-[#0055A4] text-white shadow-xs"
              : "text-[#5A6372] hover:bg-[#E6EDE2] hover:text-[#1F2B46]"
          }`}
        >
          <span className="material-symbols-outlined text-sm">dashboard</span>
          <span>Overview</span>
        </Link>

        <Link
          href="/dashboard/appointments/calendar"
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            isCalendar
              ? "bg-[#0055A4] text-white shadow-xs"
              : "text-[#5A6372] hover:bg-[#E6EDE2] hover:text-[#1F2B46]"
          }`}
        >
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          <span>Calendar</span>
        </Link>

        <Link
          href="/dashboard/appointments/requests"
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            isRequests
              ? "bg-[#0055A4] text-white shadow-xs"
              : "text-[#5A6372] hover:bg-[#E6EDE2] hover:text-[#1F2B46]"
          }`}
        >
          <span className="material-symbols-outlined text-sm">inbox</span>
          <span>Requests Queue</span>
          {requestsCount !== undefined && requestsCount > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                isRequests ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
              }`}
            >
              {requestsCount}
            </span>
          )}
        </Link>
      </div>

      {/* Book New Appointment Call-to-Action */}
      {!isNew && (
        <Link
          href="/dashboard/appointments/new"
          className="flex items-center gap-2 rounded-xl bg-[#0055A4] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004282] transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Book Appointment</span>
        </Link>
      )}
    </div>
  );
}
