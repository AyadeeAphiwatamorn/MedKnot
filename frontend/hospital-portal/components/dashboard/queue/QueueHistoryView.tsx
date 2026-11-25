"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  Calendar,
  Clock,
  Search,
  Filter,
  FileText,
  Building2,
  Stethoscope,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { QueueSubnav } from "@/components/dashboard/queue/QueueSubnav";
import { QueueEntry, QueueStatus } from "@/lib/queue/types";
import { QueueService } from "@/lib/queue/queue-service";
import { useFacility } from "@/components/dashboard/facility/FacilityContext";
import { AVAILABLE_DEPARTMENTS, AVAILABLE_DOCTORS } from "@/lib/appointments/mock-data";

interface QueueHistoryViewProps {
  isGuestMode?: boolean;
}

const ITEMS_PER_PAGE = 8;

export function QueueHistoryView({ isGuestMode = false }: QueueHistoryViewProps) {
  const { activeCampus } = useFacility();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // All historical queue entries
  const allEntries: QueueEntry[] = useMemo(() => {
    return QueueService.getAllQueueEntries(activeCampus.id);
  }, [activeCampus.id]);

  // Stats for badge
  const stats = useMemo(() => {
    return QueueService.getQueueStats(activeCampus.id);
  }, [activeCampus.id]);

  // Filtered entries
  const filteredEntries: QueueEntry[] = useMemo(() => {
    return allEntries.filter((item) => {
      if (dateFilter && item.appointmentDate !== dateFilter) return false;
      if (selectedDept !== "All" && item.department !== selectedDept) return false;
      if (selectedDoctor !== "All" && item.doctorId !== selectedDoctor) return false;
      if (selectedStatus !== "All" && item.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.patientName.toLowerCase().includes(q);
        const matchesId = item.facilityPatientId.toLowerCase().includes(q);
        const matchesQNum = item.queueNumber.toLowerCase().includes(q);
        const matchesApt = item.appointmentId.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesQNum && !matchesApt) return false;
      }

      return true;
    });
  }, [allEntries, dateFilter, selectedDept, selectedDoctor, selectedStatus, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / ITEMS_PER_PAGE));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEntries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEntries, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Checked In":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Waiting":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "In Consultation":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "No Show":
        return "bg-red-100 text-red-800 border-red-200";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
          <span className="text-[#1F2B46] font-semibold">Queue History</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF2E9] text-[#2D382B] border border-[#DDE6DA]">
            <span className="material-symbols-outlined text-xs text-[#0055A4]">domain</span>
            <span>Facility Scope: St. Jude Medical Center (North Campus)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1F2B46] border border-[#DDE6DA]">
            <span className="material-symbols-outlined text-xs text-[#34A853]">verified</span>
            <span>Official Clinical Log</span>
          </span>
        </div>
      </div>

      {/* Header Banner & Standard Sub-navigation Tabs matching Overview */}
      <div className="bg-white border border-[#DDE6DA] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#1F2B46]">Queue Audit History</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E7F0FF] text-[#0055A4] border border-[#C7DCFF]">
                Historical Logs
              </span>
            </div>
            <p className="text-sm text-[#5A6372] mt-1">
              Historical outpatient visit logs, check-in timestamps, consultation durations, and discharge outcomes.
            </p>
          </div>
        </div>

        {/* Standard Sub-navigation Tabs */}
        <QueueSubnav waitingCount={stats.waiting} inConsultationCount={stats.inConsultation} />
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="rounded-2xl border border-[#DDE6DA] bg-white p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5A6372]" />
            <input
              type="text"
              placeholder="Search by patient name, MRN, queue token..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] py-2 pl-9 pr-3 text-xs text-[#1F2B46] placeholder-[#5A6372] focus:border-[#0055A4] focus:outline-none"
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
              aria-label="Filter history by department"
              className="w-full rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] p-2 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
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
              aria-label="Filter history by physician"
              className="w-full rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] p-2 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
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
              aria-label="Filter history by status"
              className="w-full rounded-xl border border-[#DDE6DA] bg-[#F1F5EF] p-2 text-xs text-[#1F2B46] focus:border-[#0055A4] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Waiting">Waiting</option>
              <option value="Checked In">Checked In</option>
              <option value="No Show">No Show</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DDE6DA] pt-3 text-xs text-[#5A6372]">
          <div>
            Showing <strong className="text-[#1F2B46]">{filteredEntries.length}</strong> total historical visits
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-xs font-semibold text-[#0055A4] hover:underline"
            >
              Clear Date Filter
            </button>
          )}
        </div>
      </div>

      {/* HISTORICAL TABLE */}
      <div className="rounded-2xl border border-[#DDE6DA] bg-white shadow-xs overflow-hidden">
        {paginatedEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <History className="h-12 w-12 text-[#5A6372]/40 mb-3" />
            <h3 className="text-base font-bold text-[#1F2B46]">No Queue Records Found</h3>
            <p className="text-xs text-[#5A6372] max-w-sm mt-1">
              No historical patient queue entries match your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DDE6DA] bg-[#F8FAF6] text-xs font-semibold text-[#1F2B46]">
                <tr>
                  <th className="py-3.5 px-4">Token & Patient</th>
                  <th className="py-3.5 px-4">Date & Slot</th>
                  <th className="py-3.5 px-4">Check-In Time</th>
                  <th className="py-3.5 px-4">Consultation Time</th>
                  <th className="py-3.5 px-4">Completion Time</th>
                  <th className="py-3.5 px-4">Doctor & Department</th>
                  <th className="py-3.5 px-4">Final Status</th>
                  <th className="py-3.5 px-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE6DA]">
                {paginatedEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAF6] transition-colors">
                    {/* Token & Patient */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#0055A4] bg-[#E7F0FF] px-2.5 py-0.5 rounded-md border border-[#C7DCFF]">
                          {item.queueNumber}
                        </span>
                        <div>
                          <Link
                            href={`/dashboard/patients/${item.facilityPatientId}`}
                            className="font-bold text-[#1F2B46] hover:text-[#0055A4] transition-colors"
                          >
                            {item.patientName}
                          </Link>
                          <div className="text-[11px] text-[#5A6372]">MRN: {item.facilityPatientId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Date & Slot */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#1F2B46]">{item.appointmentDate}</div>
                      <div className="text-[11px] text-[#5A6372]">{item.appointmentTime}</div>
                    </td>

                    {/* Check In */}
                    <td className="py-3.5 px-4">
                      <span className="text-[#1F2B46] font-medium">{item.checkInTime}</span>
                    </td>

                    {/* Consultation Start */}
                    <td className="py-3.5 px-4">
                      {item.consultationStartTime ? (
                        <span className="text-[#1F2B46] font-medium">{item.consultationStartTime}</span>
                      ) : (
                        <span className="text-[#5A6372]/50">—</span>
                      )}
                    </td>

                    {/* Completion Time */}
                    <td className="py-3.5 px-4">
                      {item.completionTime ? (
                        <span className="text-[#1F2B46] font-medium">{item.completionTime}</span>
                      ) : (
                        <span className="text-[#5A6372]/50">—</span>
                      )}
                    </td>

                    {/* Doctor & Dept */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1F2B46]">{item.doctorName}</div>
                      <div className="text-[11px] text-[#5A6372]">{item.department}</div>
                    </td>

                    {/* Final Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* View Dossier */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/queue/${item.id}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#DDE6DA] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1F2B46] hover:bg-[#F1F5EF] hover:text-[#0055A4] transition-colors shadow-2xs"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#DDE6DA] bg-white px-5 py-3.5 text-xs">
            <span className="text-[#5A6372]">
              Page {currentPage} of {totalPages} &bull; Total {filteredEntries.length} records
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-xl border border-[#DDE6DA] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#F1F5EF] disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-[#DDE6DA] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1F2B46] hover:bg-[#F1F5EF] disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
