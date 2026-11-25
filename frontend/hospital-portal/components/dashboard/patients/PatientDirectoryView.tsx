"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserSession, DEFAULT_ADMIN, clearClientSession, getClientSession } from "@/lib/auth";
import { PatientService } from "@/lib/patients/patient-service";
import { PatientStatus } from "@/lib/patients/types";
import { useFacility } from "@/components/dashboard/facility/FacilityContext";

interface PatientDirectoryViewProps {
  initialUser?: UserSession;
}

const ITEMS_PER_PAGE = 7;

export default function PatientDirectoryView({ initialUser }: PatientDirectoryViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;
  const { activeCampus } = useFacility();

  // Session verification
  useEffect(() => {
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
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [genderFilter, setGenderFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "lastVisit">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Patient Query List (scoped to active campus)
  const patientsList = useMemo(() => {
    return PatientService.queryPatients({
      search: searchQuery,
      status: statusFilter,
      gender: genderFilter,
      sortBy,
      facilityId: activeCampus.id,
    });
  }, [searchQuery, statusFilter, genderFilter, sortBy, refreshKey, activeCampus.id]);

  // Stats derived from service & synced with patient list
  const stats = useMemo(
    () => PatientService.getDirectoryStats(activeCampus.id),
    [refreshKey, activeCampus.id]
  );

  // Handler helpers that also reset page to 1
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleGenderChange = (val: string) => {
    setGenderFilter(val);
    setCurrentPage(1);
  };

  const handleSortChange = (val: "newest" | "oldest" | "name" | "lastVisit") => {
    setSortBy(val);
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.ceil(patientsList.length / ITEMS_PER_PAGE) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return patientsList.slice(start, start + ITEMS_PER_PAGE);
  }, [patientsList, currentPage]);

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "All" || genderFilter !== "All" || sortBy !== "newest";

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setGenderFilter("All");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const getStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF5E2] text-[#2D6A28] border border-[#C5E4BA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
            Active
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF4E5] text-[#B76E00] border border-[#FFE0B2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FB8C00]"></span>
            Pending
          </span>
        );
      case "Inactive":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></span>
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="w-full min-w-0 flex-1 bg-transparent text-[#1F2B46] font-sans antialiased flex flex-col">
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
              <span className="text-[#1F2B46] font-semibold">Patients</span>
            </nav>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF2E9] text-[#2D382B] border border-[#DDE6DA]">
                <span className="material-symbols-outlined text-xs text-[#0055A4]">domain</span>
                <span>Facility Scope: St. Jude Medical Center (North Campus)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1F2B46] border border-[#DDE6DA]">
                <span className="material-symbols-outlined text-xs text-[#0055A4]">verified_user</span>
                <span>HIPAA Secured Node</span>
              </span>
            </div>
          </div>

          {/* Page Title & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#DDE6DA] rounded-2xl p-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-[#1F2B46]">Patients</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E7F0FF] text-[#0055A4] border border-[#C7DCFF]">
                  {stats.totalPatients} Registered
                </span>
              </div>
              <p className="text-sm text-[#5A6372] mt-1">
                Manage patient registrations, care records, and clinical facility visits.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/dashboard/patients/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#004382] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                <span>Add Patient</span>
              </Link>
            </div>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Patients */}
            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Total Patients</span>
                <span className="w-8 h-8 rounded-lg bg-[#E7F0FF] text-[#0055A4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">groups</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1F2B46]">{stats.totalPatients}</span>
                <p className="text-xs text-[#5A6372] mt-1">Enrolled in facility directory</p>
              </div>
            </div>

            {/* Active Patients */}
            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Active Patients</span>
                <span className="w-8 h-8 rounded-lg bg-[#EAF5E2] text-[#2D6A28] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1F2B46]">{stats.activePatients}</span>
                <p className="text-xs text-[#5A6372] mt-1">
                  {Math.round((stats.activePatients / (stats.totalPatients || 1)) * 100)}% of total roster
                </p>
              </div>
            </div>

            {/* Pending Registrations */}
            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">Pending Registrations</span>
                <span className="w-8 h-8 rounded-lg bg-[#FFF4E5] text-[#B76E00] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">hourglass_top</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1F2B46]">{stats.pendingRegistrations}</span>
                <p className="text-xs text-[#5A6372] mt-1">Awaiting ID or insurance clearance</p>
              </div>
            </div>

            {/* New Patients This Month */}
            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6372]">New This Month</span>
                <span className="w-8 h-8 rounded-lg bg-[#F3F6F0] text-[#1F2B46] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1F2B46]">+{stats.newThisMonth}</span>
                <p className="text-xs text-[#2D6A28] font-medium mt-1">Intake registrations</p>
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white border border-[#DDE6DA] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727783] text-xl pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by patient name, Patient ID (MK-PT-...), or phone number..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] text-sm text-[#1F2B46] placeholder-[#727783] focus:outline-hidden focus:ring-2 focus:ring-[#0055A4] focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727783] hover:text-[#1F2B46] text-xs"
                    title="Clear search"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                )}
              </div>

              {/* Filters & Actions */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Status Dropdown */}
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-[#DDE6DA] bg-white text-xs font-semibold text-[#1F2B46] focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                >
                  <option value="All">Status: All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>

                {/* Gender Dropdown */}
                <select
                  value={genderFilter}
                  onChange={(e) => handleGenderChange(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-[#DDE6DA] bg-white text-xs font-semibold text-[#1F2B46] focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                >
                  <option value="All">Gender: All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as "newest" | "oldest" | "name" | "lastVisit")}
                  className="px-3 py-2.5 rounded-xl border border-[#DDE6DA] bg-white text-xs font-semibold text-[#1F2B46] focus:outline-hidden focus:ring-2 focus:ring-[#0055A4]"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="name">Sort: Patient Name (A-Z)</option>
                  <option value="lastVisit">Sort: Recent Visit</option>
                </select>

                {/* Clear Action */}
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl border border-[#DDE6DA] bg-[#F3F6F0] hover:bg-[#E2E8DE] text-xs font-semibold text-[#5A6372] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Patient Directory Table */}
          <div className="bg-white border border-[#DDE6DA] rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#F3F6F0] border-b border-[#DDE6DA] text-[11px] font-bold uppercase tracking-wider text-[#5A6372]">
                    <th className="py-3.5 px-5 whitespace-nowrap">Patient ID</th>
                    <th className="py-3.5 px-5">Patient Name</th>
                    <th className="py-3.5 px-4">Age / Gender</th>
                    <th className="py-3.5 px-5">Phone Number</th>
                    <th className="py-3.5 px-4">Registration Date</th>
                    <th className="py-3.5 px-4">Last Visit</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE6DA]">
                  {paginatedPatients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <span className="material-symbols-outlined text-4xl text-[#727783] mb-2">person_search</span>
                          <h3 className="text-base font-bold text-[#1F2B46]">No patients found</h3>
                          <p className="text-xs text-[#5A6372] mt-1">
                            {hasActiveFilters
                              ? "Try adjusting your search criteria or clearing filters."
                              : "No patients have been registered to this facility yet."}
                          </p>
                          {hasActiveFilters && (
                            <button
                              onClick={handleClearFilters}
                              className="mt-3 text-xs font-semibold text-[#0055A4] hover:underline"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedPatients.map(({ facilityRecord, patient, age }) => {
                      const fullName = `${patient.firstName} ${patient.lastName}`;
                      const initials = `${patient.firstName[0] || ""}${patient.lastName[0] || ""}`.toUpperCase();

                      return (
                        <tr
                          key={facilityRecord.facilityPatientId}
                          className="hover:bg-[#F9FBF8] transition-colors"
                        >
                          {/* Patient ID */}
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span className="inline-block whitespace-nowrap font-mono text-xs font-semibold text-[#0055A4] bg-[#E7F0FF] px-2.5 py-1 rounded-md border border-[#C7DCFF]">
                              {facilityRecord.facilityPatientId}
                            </span>
                          </td>

                          {/* Patient Name */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#EAF5E2] text-[#2D6A28] border border-[#C5E4BA] font-bold text-xs flex items-center justify-center shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/dashboard/patients/${facilityRecord.facilityPatientId}`}
                                  className="font-bold text-[#1F2B46] hover:text-[#0055A4] hover:underline block truncate"
                                >
                                  {fullName}
                                </Link>
                                <span className="text-[11px] text-[#5A6372] block truncate">
                                  {facilityRecord.primaryDepartment || "Outpatient Department"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Age / Gender */}
                          <td className="py-4 px-4 text-xs text-[#1F2B46]">
                            <span className="font-medium">{age} yrs</span>
                            <span className="text-[#5A6372]"> • {patient.gender}</span>
                            {patient.bloodGroup && (
                              <span className="ml-1 text-[11px] font-mono text-[#727783]">({patient.bloodGroup})</span>
                            )}
                          </td>

                          {/* Phone Number */}
                          <td className="py-4 px-5 text-xs font-mono text-[#1F2B46]">
                            {facilityRecord.phoneNumber}
                          </td>

                          {/* Registration Date */}
                          <td className="py-4 px-4 text-xs text-[#5A6372]">
                            {facilityRecord.registrationDate}
                          </td>

                          {/* Last Visit */}
                          <td className="py-4 px-4 text-xs text-[#1F2B46]">
                            {facilityRecord.lastVisit ? (
                              <span className="font-medium">{facilityRecord.lastVisit}</span>
                            ) : (
                              <span className="text-[#727783] italic">No visit yet</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            {getStatusBadge(facilityRecord.status)}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/dashboard/patients/${facilityRecord.facilityPatientId}`}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0055A4] hover:bg-[#E7F0FF] transition-colors"
                              >
                                View Details
                              </Link>

                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveMenuId(
                                      activeMenuId === facilityRecord.facilityPatientId
                                        ? null
                                        : facilityRecord.facilityPatientId
                                    )
                                  }
                                  className="p-1 rounded-lg hover:bg-[#E2E8DE] text-[#5A6372] transition-colors"
                                  aria-label="More actions"
                                >
                                  <span className="material-symbols-outlined text-lg">more_vert</span>
                                </button>

                                {activeMenuId === facilityRecord.facilityPatientId && (
                                  <div
                                    className="absolute right-0 mt-1 w-44 bg-white border border-[#DDE6DA] rounded-xl shadow-lg z-30 py-1 text-left text-xs"
                                    onMouseLeave={() => setActiveMenuId(null)}
                                  >
                                    <Link
                                      href={`/dashboard/patients/${facilityRecord.facilityPatientId}`}
                                      className="block px-3 py-2 text-[#1F2B46] hover:bg-[#F3F6F0]"
                                    >
                                      Open Profile Workspace
                                    </Link>
                                    <Link
                                      href={`/dashboard/patients/${facilityRecord.facilityPatientId}#appointments`}
                                      className="block px-3 py-2 text-[#1F2B46] hover:bg-[#F3F6F0]"
                                    >
                                      Schedule Appointment
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        const newStatus: PatientStatus =
                                          facilityRecord.status === "Active" ? "Inactive" : "Active";
                                        PatientService.updatePatient(facilityRecord.facilityPatientId, {
                                          status: newStatus,
                                        });
                                        setRefreshKey((k) => k + 1);
                                      }}
                                      className="w-full text-left px-3 py-2 text-[#BA1A1A] hover:bg-[#FFF5F5]"
                                    >
                                      {facilityRecord.status === "Active" ? "Mark Inactive" : "Mark Active"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Results Counter */}
            {patientsList.length > 0 && (
              <div className="px-6 py-4 bg-[#F3F6F0] border-t border-[#DDE6DA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5A6372]">
                <div>
                  Showing{" "}
                  <span className="font-semibold text-[#1F2B46]">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, patientsList.length)}
                  </span>{" "}
                  of <span className="font-semibold text-[#1F2B46]">{patientsList.length}</span> patient records
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
    </div>
  );
}
