"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserSession,
  DEFAULT_ADMIN,
  clearClientSession,
} from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { INITIAL_STAFF_MEMBERS } from "@/lib/operations-data";
import { StaffMember, UserRole } from "@/types/operations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BadgeCheck,
  Search,
  Plus,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  UserPlus,
  X,
  Stethoscope,
  HeartHandshake,
  ClipboardList,
  Crown,
  CheckCircle2,
  Trash2,
  Sliders,
} from "lucide-react";

interface StaffManagementViewProps {
  initialUser?: UserSession;
}

export default function StaffManagementView({
  initialUser,
}: StaffManagementViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // State
  const [staffList, setStaffList] = useState<StaffMember[]>(
    INITIAL_STAFF_MEMBERS
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Nursing Staff" as UserRole,
    department: "Outpatient & Triage Nursing",
    shift: "Morning Shift • 08:00 – 16:00",
  });
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const matchSearch =
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole =
        roleFilter === "all" || staff.role === roleFilter;

      const matchStatus =
        statusFilter === "all" || staff.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [staffList, searchQuery, roleFilter, statusFilter]);

  // Toggle Staff Active/Inactive status
  const handleToggleStatus = (staffId: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        const newStatus = s.status === "active" ? "inactive" : "active";
        return { ...s, status: newStatus };
      })
    );
    showToast("Updated staff account status");
  };

  // Handle Role Change
  const handleChangeRole = (staffId: string, newRole: UserRole) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, role: newRole } : s))
    );
    showToast(`Updated role assignment to ${newRole}`);
  };

  // Handle Invite / Add Staff
  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!inviteForm.name.trim()) errs.name = "Full name is required";
    if (!inviteForm.email.trim()) errs.email = "Work email is required";
    if (!inviteForm.phone.trim()) errs.phone = "Phone number is required";

    if (Object.keys(errs).length > 0) {
      setInviteErrors(errs);
      return;
    }

    const newStaff: StaffMember = {
      id: `STF-${200 + staffList.length + 1}`,
      name: inviteForm.name.trim(),
      email: inviteForm.email.trim(),
      phone: inviteForm.phone.trim(),
      role: inviteForm.role,
      department: inviteForm.department,
      facility: user.facility,
      status: "active",
      joinedDate: "Today",
      lastActive: "Invited",
      shift: inviteForm.shift,
    };

    setStaffList((prev) => [newStaff, ...prev]);
    setIsInviteOpen(false);
    setInviteForm({
      name: "",
      email: "",
      phone: "",
      role: "Nursing Staff",
      department: "Outpatient & Triage Nursing",
      shift: "Morning Shift • 08:00 – 16:00",
    });
    setInviteErrors({});
    showToast(`Added ${newStaff.name} as ${newStaff.role}`);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "Hospital Administrator":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E1F2FD] text-[#003e7a] border border-[#bce0fb]">
            <Crown className="w-3.5 h-3.5 text-[#015CA9]" />
            Administrator
          </span>
        );
      case "Doctor":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80]">
            <Stethoscope className="w-3.5 h-3.5 text-[#526524]" />
            Doctor / Clinician
          </span>
        );
      case "Nursing Staff":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#A3C8B4]/40 text-[#173e2d] border border-[#A3C8B4]">
            <HeartHandshake className="w-3.5 h-3.5 text-[#214539]" />
            Nursing Staff
          </span>
        );
      case "Receptionist":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAE193] text-[#5e4300] border border-[#eed072]">
            <ClipboardList className="w-3.5 h-3.5 text-[#946200]" />
            Receptionist
          </span>
        );
    }
  };

  return (
    <div className="dashboard-theme font-body-md text-body-md text-[#1F2B46] min-h-screen antialiased bg-[#EDF2E9]">
      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <DashboardSidebar
        user={user}
        activeNav="staff-management"
        onSignOut={handleSignOut}
      />

      {/* ── TOP HEADER & MAIN VIEWPORT ────────────────────── */}
      <div className="pl-72">
        <DashboardHeader user={user} />

        <main className="relative pt-16 bg-[#EDF2E9] min-h-screen w-full px-8 pb-16">
          <div className="flex flex-col w-full max-w-[1650px] mx-auto">
            {/* Toast Notification */}
            {toastMessage && (
              <div className="fixed top-20 right-8 z-50 bg-[#1F2B46] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 border border-[#015CA9]">
                <CheckCircle2 className="w-5 h-5 text-[#DFEEA9] shrink-0" />
                <span className="font-card-heading text-sm font-medium">
                  {toastMessage}
                </span>
                <button
                  type="button"
                  onClick={() => setToastMessage(null)}
                  className="ml-2 text-white/70 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Breadcrumb & Sub-header */}
            <div className="w-full py-space-lg flex flex-col gap-space-sm">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-space-xs text-[#5A6372] font-supporting text-supporting"
              >
                <Link
                  href="/dashboard"
                  className="hover:text-[#015CA9] transition-colors"
                >
                  Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#727783] shrink-0" />
                <Link
                  href="/dashboard/settings"
                  className="hover:text-[#015CA9] transition-colors"
                >
                  Settings
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#727783] shrink-0" />
                <span className="text-[#015CA9] font-semibold whitespace-nowrap">
                  Staff Account Management
                </span>
              </nav>

              {/* Title & Action Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-space-md flex-wrap">
                    <h1 className="font-headline-lg text-headline-lg text-[#015CA9] tracking-tight font-bold truncate">
                      Staff Accounts &amp; Role Assignments
                    </h1>
                    <Badge variant="avocado" className="shadow-xs">
                      Module 8 • User Administration
                    </Badge>
                  </div>
                  <p className="font-body-md text-body-md text-[#5A6372] max-w-3xl">
                    Manage healthcare personnel accounts, assign role-based permissions
                    (Administrator, Doctor, Nursing, Receptionist), and control facility shifts.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    onClick={() => setIsInviteOpen(true)}
                    className="flex items-center gap-2 shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Invite Staff Member</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Section 6 Roles & Permissions Overview Card */}
            <Card className="bg-white border-[#DDE6DA] shadow-xs mb-6">
              <CardHeader className="p-5 pb-3 border-b border-[#F3F6F0]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#015CA9]" />
                  <CardTitle className="text-sm">
                    Section 6: Role-Based Authorization Framework
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#E1F2FD]/50 border border-[#bce0fb] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#003e7a]">
                    <Crown className="w-4 h-4 text-[#015CA9]" />
                    <span>Hospital Administrator</span>
                  </div>
                  <p className="text-[#5A6372] leading-relaxed">
                    Full authority: Manage facility profile, staff accounts, doctor schedules, departments, and administrative reports.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#DFEEA9]/35 border border-[#c5dd80] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#2d3a08]">
                    <Stethoscope className="w-4 h-4 text-[#526524]" />
                    <span>Doctor / Clinician</span>
                  </div>
                  <p className="text-[#5A6372] leading-relaxed">
                    Clinical authority: Access assigned patients, review AI summaries, sign-off verified records, and issue prescriptions.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#A3C8B4]/30 border border-[#A3C8B4] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#173e2d]">
                    <HeartHandshake className="w-4 h-4 text-[#214539]" />
                    <span>Nursing Staff</span>
                  </div>
                  <p className="text-[#5A6372] leading-relaxed">
                    Care coordination: Patient intake triage, check-in, queue management, and initial document review checks.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAE193]/35 border border-[#eed072] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#5e4300]">
                    <ClipboardList className="w-4 h-4 text-[#946200]" />
                    <span>Receptionist</span>
                  </div>
                  <p className="text-[#5A6372] leading-relaxed">
                    Patient access: Front-desk patient registration, request intake review, appointment coordination, and queue check-in.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-4 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#727783]" />
                <Input
                  type="text"
                  placeholder="Search staff by name, email, department, or staff ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="Hospital Administrator">Administrator</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Nursing Staff">Nursing Staff</option>
                  <option value="Receptionist">Receptionist</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>

            {/* Staff Directory Table */}
            <div className="bg-white border border-[#DDE6DA] rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAFDF8] border-b border-[#DDE6DA] text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Staff Member</th>
                      <th className="py-3.5 px-4">Assigned Role</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Shift &amp; Working Hours</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Reassign Role</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE6DA]">
                    {filteredStaff.map((staff) => (
                      <tr
                        key={staff.id}
                        className="hover:bg-[#F8FAF6] transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center font-bold text-xs shrink-0">
                              {staff.name
                                .replace("Dr.", "")
                                .replace("Nurse", "")
                                .replace("Receptionist", "")
                                .trim()
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-[#1F2B46] block truncate">
                                {staff.name}
                              </span>
                              <span className="text-xs text-[#5A6372] block truncate">
                                {staff.email} • {staff.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {getRoleBadge(staff.role)}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-[#1F2B46]">
                          {staff.department}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#5A6372]">
                          {staff.shift}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              staff.status === "active"
                                ? "bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80]"
                                : staff.status === "on_leave"
                                ? "bg-[#FAE193] text-[#5e4300] border border-[#eed072]"
                                : "bg-[#F3F6F0] text-[#727783] border border-[#DDE6DA]"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                staff.status === "active"
                                  ? "bg-[#526524] animate-pulse"
                                  : staff.status === "on_leave"
                                  ? "bg-[#946200]"
                                  : "bg-[#727783]"
                              }`}
                            />
                            {staff.status === "active"
                              ? "Active"
                              : staff.status === "on_leave"
                              ? "On Leave"
                              : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={staff.role}
                            onChange={(e) =>
                              handleChangeRole(staff.id, e.target.value as UserRole)
                            }
                            className="h-8 px-2 bg-[#F8FAF6] border border-[#DDE6DA] rounded-lg text-xs font-medium text-[#1F2B46] outline-none cursor-pointer"
                          >
                            <option value="Hospital Administrator">Administrator</option>
                            <option value="Doctor">Doctor</option>
                            <option value="Nursing Staff">Nursing Staff</option>
                            <option value="Receptionist">Receptionist</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant={staff.status === "active" ? "outline" : "secondary"}
                            size="sm"
                            onClick={() => handleToggleStatus(staff.id)}
                            className="text-xs"
                          >
                            {staff.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── INVITE / ADD STAFF MODAL ───────────────────────── */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader onClose={() => setIsInviteOpen(false)}>
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#015CA9]" />
              <DialogTitle>Invite Healthcare Staff Member</DialogTitle>
            </div>
            <DialogDescription>
              Assign role-based permissions and onboard hospital staff to the
              MedKnot Hospital Portal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteStaff} className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#1F2B46] block">
                Full Legal Name <span className="text-error">*</span>
              </label>
              <Input
                placeholder="e.g. Dr. Arthur Conan or Nurse Anjali Roy"
                value={inviteForm.name}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, name: e.target.value })
                }
              />
              {inviteErrors.name && (
                <span className="text-[#ba1a1a]">{inviteErrors.name}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#1F2B46] block">
                  Official Email <span className="text-error">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="e.g. a.roy@stjude-health.org"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                />
                {inviteErrors.email && (
                  <span className="text-[#ba1a1a]">{inviteErrors.email}</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1F2B46] block">
                  Direct Phone <span className="text-error">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="e.g. +91 98201 12345"
                  value={inviteForm.phone}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, phone: e.target.value })
                  }
                />
                {inviteErrors.phone && (
                  <span className="text-[#ba1a1a]">{inviteErrors.phone}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#1F2B46] block">
                  Role Assignment <span className="text-error">*</span>
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({
                      ...inviteForm,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-xs text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none"
                >
                  <option value="Nursing Staff">Nursing Staff</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Hospital Administrator">
                    Hospital Administrator
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1F2B46] block">Department</label>
                <Input
                  value={inviteForm.department}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, department: e.target.value })
                  }
                  placeholder="e.g. Outpatient & Triage Nursing"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1F2B46] block">
                Shift &amp; Duty Schedule
              </label>
              <Input
                value={inviteForm.shift}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, shift: e.target.value })
                }
                placeholder="e.g. Morning Shift • 08:00 – 16:00"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Send Portal Invitation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
