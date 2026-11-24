"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  clearClientSession,
  getClientSession,
  DEFAULT_ADMIN,
  type UserSession,
} from "@/lib/auth";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface DashboardViewProps {
  initialUser?: UserSession;
}

export default function DashboardView({ initialUser }: DashboardViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;
  const [activeAptFilter, setActiveAptFilter] = useState<string>("all");

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

  // Appointment mock data
  const appointments = [
    {
      id: "PT-89402",
      patientName: "Eleanor Vance",
      details: "42 yrs • Female",
      doctor: "Dr. Chen Wei",
      specialty: "Internal Med • General",
      time: "09:30 AM",
      status: "in-consultation",
      statusLabel: "In Consultation",
      badgeClass: "bg-secondary-fixed text-on-secondary-fixed",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDexZAwJ9ISyg1U1Fa3SRg-2FnduokuuBehRdSjhopQ3aAani7kJrSR_UL5wLSciXu2VaUcyoJ8LetU0XxXjUcHvMF3PXBwObHyN4xhanSv-Vk9vH37jzS_JsDOvr0ZbUt6eI5pw2ad074a6jSBTKjyIbIGvAVMjzLu9b6YRAHVB5Nk5qQa8uSOakq8mhG0uDTEGPNJtcXZJavgCKfdeFTcDLAe1fMZeMp2TRc5",
    },
    {
      id: "PT-89415",
      patientName: "Marcus Chen",
      details: "29 yrs • Male",
      doctor: "Dr. Sarah Thomas",
      specialty: "Cardiology Clinic",
      time: "10:00 AM",
      status: "waiting",
      statusLabel: "Waiting",
      badgeClass: "bg-secondary-fixed-dim text-on-secondary-fixed-variant",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCQrG4VJwvWypVNmfSIyHAfAD-DUPv-loqTUja8enZ65SUx4UwQpnwY1pxvwk6DBSAM5bO8szrDMitj5-wrQmtyeqVzAXfrkZKmwKqHafTsYLnZFyYAOsIEzu_4D7wpcabtJSUGJ3lATN3OLwhtxuxpkUhZBPCRB5ZYwRnZHw8aAZUribPbvwgc5CQV4Je4GAl3gDCkiVypsOFxFWqGlelt7mvMhfp2F1RrqbZI",
    },
    {
      id: "PT-89420",
      patientName: "Aarav Patel",
      details: "61 yrs • Male",
      doctor: "Dr. Rajeshwar Kulkarni",
      specialty: "Orthopedics",
      time: "10:15 AM",
      status: "confirmed",
      statusLabel: "Confirmed",
      badgeClass: "bg-primary-fixed text-[#0055A4]",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBR4NC6dPlw1AL6N1Qkfbk5iiYbUyxPXgsF1QU73rCoQzdmjWkW4yTZ_Hys37XvII0_Nwivw-hBWmuqoN8J4Zp6W3TQUiVNw7IQmq0XhzkEtDdWvTTlKM4Cel0BC2BF9Dp3t1Fug65V-P4a7atnUzFsZi7C4Ppcu8O1f44AIw7YGG5sUjgGyV4lKKfZuVG3P9dQVhvkKgQQiko3yjgIgiEMiJE0co8_BH3uBWuG",
    },
    {
      id: "PT-89433",
      patientName: "Sophia Rodriguez",
      details: "35 yrs • Female",
      doctor: "Dr. Maria Santos",
      specialty: "Pediatrics",
      time: "10:45 AM",
      status: "completed",
      statusLabel: "Completed",
      badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed",
      initials: "SR",
    },
    {
      id: "PT-89445",
      patientName: "James Wilson",
      details: "54 yrs • Male",
      doctor: "Dr. Chen Wei",
      specialty: "Internal Med • Review",
      time: "11:15 AM",
      status: "confirmed",
      statusLabel: "Confirmed",
      badgeClass: "bg-primary-fixed text-[#0055A4]",
      initials: "JW",
    },
  ];

  const filteredApts =
    activeAptFilter === "all"
      ? appointments
      : appointments.filter((apt) => apt.status === activeAptFilter);

  const firstName = user.name.split(" ")[0] || "Administrator";

  return (
    <div className="dashboard-theme font-body-md text-body-md text-[#1F2B46] min-h-screen antialiased bg-[#EDF2E9]">
      {/* ── SHARED REUSABLE SIDEBAR ────────────────────────────────────── */}
      <DashboardSidebar
        user={user}
        activeNav="dashboard"
        onSignOut={handleSignOut}
      />

      {/* ── TOP HEADER & MAIN VIEWPORT ───────────────────────────────── */}
      <div className="pl-72">
        {/* Shared Reusable Header */}
        <DashboardHeader user={user} />

        {/* Main Content Area */}
        <main className="relative pt-16 bg-[#EDF2E9] min-h-screen w-full px-8 pb-12">
          <div className="flex flex-col w-full max-w-[1600px] mx-auto">
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
                  Here&apos;s what&apos;s happening at {user.facility} today.
                </p>
              </div>

              {/* Header Actions */}
              <div className="flex flex-wrap items-center gap-space-md shrink-0">
                {/* Date Chip */}
                <div className="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-white border border-[#DDE6DA] shadow-sm text-[#1F2B46] shrink-0">
                  <span className="material-symbols-outlined text-[#0055A4] text-xl">
                    event
                  </span>
                  <span className="font-card-heading text-card-heading">
                    Wednesday, Oct 24, 2025
                  </span>
                </div>

                {/* Filter Dropdown */}
                <div className="relative inline-block text-left shrink-0">
                  <button
                    className="flex items-center gap-space-sm px-space-md py-2 rounded-xl bg-white border border-[#DDE6DA] shadow-sm hover:bg-[#F3F6F0] transition-colors text-[#1F2B46] font-card-heading text-card-heading cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[#5A6372] text-lg">
                      tune
                    </span>
                    <span>Today • All Shifts</span>
                    <span className="material-symbols-outlined text-[#5A6372] text-base">
                      expand_more
                    </span>
                  </button>
                </div>

                {/* Primary Action CTA */}
                <button
                  className="flex items-center gap-space-xs bg-[#0055A4] hover:bg-[#00478a] text-white px-space-lg py-2.5 rounded-xl font-button-label text-button-label shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
                  type="button"
                >
                  <span className="material-symbols-outlined text-xl">
                    person_add
                  </span>
                  <span>+ Register Patient</span>
                </button>
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
                      2,845
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
                    Registered at Campus North
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
                      Today&apos;s Appointments
                    </span>
                    <div className="font-headline-xl text-headline-xl text-[#1F2B46] mt-1 tracking-tight">
                      48
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
                    36 completed or active
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-supporting text-supporting font-semibold bg-[#EDF2E9] border border-[#DDE6DA] text-[#0055A4] shrink-0">
                    12 remaining
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
                      14
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
                    Avg. wait time: 18 min
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
                      08
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
                    08 awaiting staff action
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
                <button
                  className="group flex items-center gap-space-sm p-space-md rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] hover:bg-[#0055A4] hover:border-[#0055A4] transition-all text-left cursor-pointer"
                  type="button"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#DDE6DA] text-[#0055A4] group-hover:bg-white group-hover:text-[#0055A4] group-hover:border-white flex items-center justify-center shrink-0 shadow-sm transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      person_add
                    </span>
                  </div>
                  <span className="font-button-label text-body-md font-semibold text-[#1F2B46] group-hover:text-white truncate transition-colors">
                    + Register Patient
                  </span>
                </button>

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
                        Today&apos;s Appointment Overview
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full font-supporting text-supporting font-semibold bg-[#F3F6F0] border border-[#DDE6DA] text-[#5A6372]">
                        48 Scheduled
                      </span>
                    </div>
                    <a
                      className="font-button-label text-body-md text-[#0055A4] hover:underline flex items-center gap-1"
                      href="#"
                    >
                      <span className="material-symbols-outlined text-base">
                        calendar_view_day
                      </span>
                      View All Appointments
                      <span className="material-symbols-outlined text-base">
                        arrow_forward
                      </span>
                    </a>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-space-md mb-space-md">
                    {[
                      { id: "all", label: "All (48)" },
                      { id: "in-consultation", label: "In Consultation (4)" },
                      { id: "waiting", label: "Waiting (8)" },
                      { id: "confirmed", label: "Confirmed (24)" },
                      { id: "completed", label: "Completed (12)" },
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
                        {filteredApts.map((apt) => (
                          <tr
                            key={apt.id}
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
                            <td className="py-3.5 px-space-md font-mono text-supporting text-[#5A6372]">
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
                                  className="p-1.5 rounded-lg text-[#0055A4] hover:bg-primary-fixed transition-colors cursor-pointer"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    clinical_notes
                                  </span>
                                </button>
                                <button
                                  title="Check In"
                                  className="p-1.5 rounded-lg text-[#5A6372] hover:bg-[#E2E8DE] transition-colors cursor-pointer"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    how_to_reg
                                  </span>
                                </button>
                                <button
                                  title="Reschedule"
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
                        ))}
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
                        14 Waiting
                      </span>
                    </div>
                    <a
                      className="font-button-label text-body-md text-[#0055A4] hover:underline flex items-center gap-1"
                      href="#"
                    >
                      View Live Queue Console{" "}
                      <span className="material-symbols-outlined text-base">
                        open_in_new
                      </span>
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {/* Queue Card 1 */}
                    <div className="p-space-lg rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] flex flex-col justify-between hover:bg-[#E8EFE5] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-space-md min-w-0">
                          <span className="px-3 py-1.5 rounded-xl bg-[#0055A4] text-white font-headline-sm text-headline-sm font-mono shadow-sm shrink-0">
                            A-104
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-card-heading text-card-heading text-[#1F2B46] truncate">
                              Marcus Chen
                            </h3>
                            <p className="font-supporting text-supporting text-[#5A6372] truncate">
                              Room 304 • Dr. Chen Wei
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-supporting text-supporting font-semibold bg-secondary-fixed text-on-secondary-fixed shrink-0">
                          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />{" "}
                          Called
                        </span>
                      </div>
                      <div className="mt-space-md pt-space-sm border-t border-[#DDE6DA] flex items-center justify-between font-supporting text-supporting text-[#5A6372]">
                        <span>Department: General Medicine</span>
                        <span className="flex items-center gap-1 font-semibold text-[#1F2B46] shrink-0">
                          <span className="material-symbols-outlined text-sm shrink-0">
                            schedule
                          </span>{" "}
                          12 min in wait
                        </span>
                      </div>
                    </div>

                    {/* Queue Card 2 */}
                    <div className="p-space-lg rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] flex flex-col justify-between hover:bg-[#E8EFE5] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-space-md min-w-0">
                          <span className="px-3 py-1.5 rounded-xl bg-white border border-[#DDE6DA] text-[#0055A4] font-headline-sm text-headline-sm font-mono shadow-sm shrink-0">
                            B-201
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-card-heading text-card-heading text-[#1F2B46] truncate">
                              Devon Vance
                            </h3>
                            <p className="font-supporting text-supporting text-[#5A6372] truncate">
                              Room 210 • Dr. Sarah Thomas
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full font-supporting text-supporting font-semibold bg-tertiary-fixed text-on-tertiary-fixed shrink-0">
                          Triage Complete
                        </span>
                      </div>
                      <div className="mt-space-md pt-space-sm border-t border-[#DDE6DA] flex items-center justify-between font-supporting text-supporting text-[#5A6372]">
                        <span>Department: Cardiology</span>
                        <span className="flex items-center gap-1 font-semibold text-[#1F2B46] shrink-0">
                          <span className="material-symbols-outlined text-sm shrink-0">
                            schedule
                          </span>{" "}
                          24 min in wait
                        </span>
                      </div>
                    </div>

                    {/* Queue Card 3 */}
                    <div className="p-space-lg rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] flex flex-col justify-between hover:bg-[#E8EFE5] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-space-md min-w-0">
                          <span className="px-3 py-1.5 rounded-xl bg-white border border-[#DDE6DA] text-[#0055A4] font-headline-sm text-headline-sm font-mono shadow-sm shrink-0">
                            A-105
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-card-heading text-card-heading text-[#1F2B46] truncate">
                              Aarav Patel
                            </h3>
                            <p className="font-supporting text-supporting text-[#5A6372] truncate">
                              Room 108 • Dr. Rajeshwar Kulkarni
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full font-supporting text-supporting font-semibold bg-primary-fixed text-[#0055A4] shrink-0">
                          Vitals In Progress
                        </span>
                      </div>
                      <div className="mt-space-md pt-space-sm border-t border-[#DDE6DA] flex items-center justify-between font-supporting text-supporting text-[#5A6372]">
                        <span>Department: Orthopedics</span>
                        <span className="flex items-center gap-1 font-semibold text-[#1F2B46] shrink-0">
                          <span className="material-symbols-outlined text-sm shrink-0">
                            schedule
                          </span>{" "}
                          8 min in wait
                        </span>
                      </div>
                    </div>

                    {/* Queue Card 4 */}
                    <div className="p-space-lg rounded-xl bg-[#F3F6F0] border border-[#DDE6DA] flex flex-col justify-between hover:bg-[#E8EFE5] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-space-md min-w-0">
                          <span className="px-3 py-1.5 rounded-xl bg-white border border-[#DDE6DA] text-[#0055A4] font-headline-sm text-headline-sm font-mono shadow-sm shrink-0">
                            C-302
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-card-heading text-card-heading text-[#1F2B46] truncate">
                              Chloe Simmons
                            </h3>
                            <p className="font-supporting text-supporting text-[#5A6372] truncate">
                              Room 112 • Dr. Maria Santos
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full font-supporting text-supporting font-semibold bg-secondary-fixed-dim text-on-secondary-fixed-variant shrink-0">
                          Queue Verified
                        </span>
                      </div>
                      <div className="mt-space-md pt-space-sm border-t border-[#DDE6DA] flex items-center justify-between font-supporting text-supporting text-[#5A6372]">
                        <span>Department: Pediatrics</span>
                        <span className="flex items-center gap-1 font-semibold text-[#1F2B46] shrink-0">
                          <span className="material-symbols-outlined text-sm shrink-0">
                            schedule
                          </span>{" "}
                          15 min in wait
                        </span>
                      </div>
                    </div>
                  </div>
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
                            5 requests via patient portal
                          </span>
                        </div>
                      </div>
                      <button
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
                    <h2 className="font-headline-sm text-headline-sm text-[#1F2B46]">
                      Recent Facility Activity
                    </h2>
                    <span className="material-symbols-outlined text-[#5A6372] text-lg">
                      history
                    </span>
                  </div>
                  <div className="relative pl-6 space-y-space-lg">
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#DDE6DA]"></div>

                    <div className="relative flex items-start gap-space-sm">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#0055A4] ring-4 ring-white" />
                      <div>
                        <p className="font-body-md text-body-md text-[#1F2B46] leading-tight">
                          <span className="font-semibold">Dr. Chen Wei</span>{" "}
                          completed consultation for Marcus Chen (PT-89415)
                        </p>
                        <span className="font-supporting text-supporting text-[#5A6372]">
                          10m ago • OPD Station 3
                        </span>
                      </div>
                    </div>

                    <div className="relative flex items-start gap-space-sm">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-secondary ring-4 ring-white" />
                      <div>
                        <p className="font-body-md text-body-md text-[#1F2B46] leading-tight">
                          New patient{" "}
                          <span className="font-semibold">Eleanor Vance</span>{" "}
                          registered at Front Desk
                        </p>
                        <span className="font-supporting text-supporting text-[#5A6372]">
                          18m ago • Admin {user.name}
                        </span>
                      </div>
                    </div>

                    <div className="relative flex items-start gap-space-sm">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-tertiary ring-4 ring-white" />
                      <div>
                        <p className="font-body-md text-body-md text-[#1F2B46] leading-tight">
                          Lab telemetry uploaded for{" "}
                          <span className="font-semibold">Aarav Patel</span>{" "}
                          (PT-89420)
                        </p>
                        <span className="font-supporting text-supporting text-[#5A6372]">
                          25m ago • Diagnostics Hub
                        </span>
                      </div>
                    </div>

                    <div className="relative flex items-start gap-space-sm">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-surface-variant ring-4 ring-white" />
                      <div>
                        <p className="font-body-md text-body-md text-[#1F2B46] leading-tight">
                          Queue token{" "}
                          <span className="font-semibold font-mono">B-204</span>{" "}
                          routed to Triage Station 2
                        </p>
                        <span className="font-supporting text-supporting text-[#5A6372]">
                          34m ago • Auto Allocation
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
