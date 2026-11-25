"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type UserSession, DEFAULT_ADMIN, clearClientSession } from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface StaffManagementViewProps {
  initialUser?: UserSession;
}

export type StaffRole = "Physician" | "Nursing Staff" | "Reception" | "Hospital Admin";
export type StaffStatus = "Active" | "Invitation Pending" | "Suspended";

export interface StaffRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  staffId: string;
  role: StaffRole;
  roleCategory: "physician" | "nursing" | "reception" | "admin";
  department: string;
  deptCategory: "internal" | "cardiology" | "ward" | "desk" | "admin" | "er" | "pediatrics";
  status: StaffStatus;
  avatar?: string;
  initials?: string;
  isSelf?: boolean;
  expiresIn?: string;
  shift?: string;
  specialty?: string;
  licenseNumber?: string;
}

export default function StaffManagementView({ initialUser }: StaffManagementViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // ── 1. Initial Mock Dataset (24 accounts matching exact specifications) ──
  const initialStaffRecords: StaffRecord[] = [
    {
      id: "1",
      name: "Dr. Chen Wei",
      email: "c.wei@stjudes.medknot.org",
      phone: "+1 (555) 349-8120",
      staffId: "MK-DR-1042",
      role: "Physician",
      roleCategory: "physician",
      department: "Internal Medicine",
      deptCategory: "internal",
      status: "Active",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCX4chL_J1wzoAILjuUDylHyobg3v7LAPj8NMeeoSMypNBOpSwQSngmkg_qNYVLrxj8VDGbXnThsg1NdnqOfVduYQidOHKl22Z-UpzalMRgjvTLrLT45LdiBrO2M3PFHqJ1eHST_K-xjItKeAm-4ujbz5fqtbjfyHfUzSnK4MLyqku5XocXce28tdCCaEB2CgehAD9pAYxwTWgARNXqzucNVP9PO3ESBjtuscgN",
      shift: "Morning (08:00 - 16:00)",
      specialty: "Internal Medicine & Critical Care",
      licenseNumber: "MD-LIC-2015-891",
    },
    {
      id: "2",
      name: "Dr. Sarah Thomas",
      email: "s.thomas@stjudes.medknot.org",
      phone: "+1 (555) 482-9011",
      staffId: "MK-DR-1043",
      role: "Physician",
      roleCategory: "physician",
      department: "Cardiology",
      deptCategory: "cardiology",
      status: "Active",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDAoOFccJ-nlMS5yPF1a7iSxVh5Xjzm8CkVWj3Mmkjtzu3rpFGAD6SMiuBjkOO5g1QRo0CeWn9P1nNnwisKsfq7QXAgWjJiwU9w751thQaDwqX7OmTrzxVltylPy9huTQmI8OXN_hlVHRRGzhrRw-DJeqahC96oBniEhiFLFHYjxvniiAABcHiUNMzFNWpCz1u77KQDQ2RpyGbNLXKrS3uT7CbraC7GaN4OC0bQ",
      shift: "General (09:00 - 17:00)",
      specialty: "Interventional Cardiology",
      licenseNumber: "MD-LIC-2017-440",
    },
    {
      id: "3",
      name: "Ananya Rao",
      email: "a.rao@stjudes.medknot.org",
      phone: "+1 (555) 912-3847",
      staffId: "MK-NS-0201",
      role: "Nursing Staff",
      roleCategory: "nursing",
      department: "General Ward",
      deptCategory: "ward",
      status: "Active",
      initials: "AR",
      shift: "Evening (14:00 - 22:00)",
      specialty: "Inpatient Ward Care",
      licenseNumber: "RN-LIC-2020-112",
    },
    {
      id: "4",
      name: "Priya Sharma",
      email: "p.sharma@stjudes.medknot.org",
      phone: "+1 (555) 678-2345",
      staffId: "MK-RC-0301",
      role: "Reception",
      roleCategory: "reception",
      department: "Front Desk",
      deptCategory: "desk",
      status: "Active",
      initials: "PS",
      shift: "Morning (07:30 - 15:30)",
      specialty: "Patient Intake & Triage Desk",
      licenseNumber: "ADM-REG-2021-089",
    },
    {
      id: "5",
      name: "Michael Lee",
      email: "m.lee@stjudes.medknot.org",
      phone: "+1 (555) 234-5678",
      staffId: "MK-AD-0012",
      role: "Hospital Admin",
      roleCategory: "admin",
      department: "Administration",
      deptCategory: "admin",
      status: "Active",
      initials: "ML",
      isSelf: true,
      shift: "Executive (08:00 - 18:00)",
      specialty: "Clinical Administration & Governance",
      licenseNumber: "MH-MED-2018-9921",
    },
    {
      id: "6",
      name: "Neha Patel",
      email: "n.patel@stjudes.medknot.org",
      phone: "+1 (555) 789-0123",
      staffId: "MK-NS-0202",
      role: "Nursing Staff",
      roleCategory: "nursing",
      department: "General Ward",
      deptCategory: "ward",
      status: "Invitation Pending",
      expiresIn: "42h",
      initials: "NP",
      shift: "Night (22:00 - 06:00)",
      specialty: "Post-Operative Recovery",
      licenseNumber: "RN-LIC-2023-789",
    },
    {
      id: "7",
      name: "Marcus Vance",
      email: "m.vance@stjudes.medknot.org",
      phone: "+1 (555) 123-4567",
      staffId: "MK-DR-0988",
      role: "Physician",
      roleCategory: "physician",
      department: "Emergency Medicine",
      deptCategory: "er",
      status: "Suspended",
      initials: "MV",
      shift: "On-Call Rotation",
      specialty: "Trauma & Emergency Care",
      licenseNumber: "MD-LIC-2012-302",
    },
    // Additional realistic records to complete the 24 staff dataset:
    {
      id: "8",
      name: "Dr. Alistair Finch",
      email: "a.finch@stjudes.medknot.org",
      phone: "+1 (555) 301-4491",
      staffId: "MK-DR-1045",
      role: "Physician",
      roleCategory: "physician",
      department: "Internal Medicine",
      deptCategory: "internal",
      status: "Active",
      initials: "AF",
      shift: "Morning (08:00 - 16:00)",
      specialty: "Gastroenterology",
      licenseNumber: "MD-LIC-2016-105",
    },
    {
      id: "9",
      name: "Sonia D'Souza",
      email: "s.dsouza@stjudes.medknot.org",
      phone: "+1 (555) 881-2209",
      staffId: "MK-NS-0205",
      role: "Nursing Staff",
      roleCategory: "nursing",
      department: "Cardiology",
      deptCategory: "cardiology",
      status: "Active",
      initials: "SD",
      shift: "Evening (14:00 - 22:00)",
      specialty: "Cardiac ICU Care",
      licenseNumber: "RN-LIC-2019-338",
    },
    {
      id: "10",
      name: "Rahul Verma",
      email: "r.verma@stjudes.medknot.org",
      phone: "+1 (555) 441-9988",
      staffId: "MK-RC-0304",
      role: "Reception",
      roleCategory: "reception",
      department: "Front Desk",
      deptCategory: "desk",
      status: "Active",
      initials: "RV",
      shift: "Night (23:00 - 07:30)",
      specialty: "Night Shift Registration",
      licenseNumber: "ADM-REG-2022-104",
    },
    {
      id: "11",
      name: "Dr. Kimberly Adams",
      email: "k.adams@stjudes.medknot.org",
      phone: "+1 (555) 772-0099",
      staffId: "MK-DR-1048",
      role: "Physician",
      roleCategory: "physician",
      department: "Pediatrics",
      deptCategory: "pediatrics",
      status: "Active",
      initials: "KA",
      shift: "Morning (08:30 - 16:30)",
      specialty: "Pediatric Critical Care",
      licenseNumber: "MD-LIC-2018-720",
    },
    {
      id: "12",
      name: "Dr. Elena Rostova",
      email: "e.rostova@stjudes.medknot.org",
      phone: "+1 (555) 902-1134",
      staffId: "MK-DR-1044",
      role: "Physician",
      roleCategory: "physician",
      department: "Emergency Medicine",
      deptCategory: "er",
      status: "Invitation Pending",
      expiresIn: "48h",
      initials: "ER",
      shift: "Rotating Shifts",
      specialty: "Trauma Surgery",
      licenseNumber: "MD-LIC-2024-009",
    },
    {
      id: "13",
      name: "David Kim",
      email: "d.kim@stjudes.medknot.org",
      phone: "+1 (555) 603-7711",
      staffId: "MK-NS-0210",
      role: "Nursing Staff",
      roleCategory: "nursing",
      department: "Emergency Medicine",
      deptCategory: "er",
      status: "Active",
      initials: "DK",
      shift: "Morning (07:00 - 15:30)",
      specialty: "Emergency Trauma Nursing",
      licenseNumber: "RN-LIC-2021-419",
    },
    {
      id: "14",
      name: "Clara Higgins",
      email: "c.higgins@stjudes.medknot.org",
      phone: "+1 (555) 231-8844",
      staffId: "MK-AD-0015",
      role: "Hospital Admin",
      roleCategory: "admin",
      department: "Administration",
      deptCategory: "admin",
      status: "Active",
      initials: "CH",
      shift: "General (09:00 - 17:00)",
      specialty: "Medical Credentialing & Compliance",
      licenseNumber: "ADM-MH-2019-014",
    },
    {
      id: "15",
      name: "Sanjay Verma",
      email: "s.verma@stjudes.medknot.org",
      phone: "+1 (555) 554-3210",
      staffId: "MK-RC-0309",
      role: "Reception",
      roleCategory: "reception",
      department: "Front Desk",
      deptCategory: "desk",
      status: "Invitation Pending",
      expiresIn: "36h",
      initials: "SV",
      shift: "General (09:00 - 17:00)",
      specialty: "OPD Token & Insurance Desk",
      licenseNumber: "ADM-REG-2024-055",
    },
    {
      id: "16",
      name: "Dr. Tariq Mansoor",
      email: "t.mansoor@stjudes.medknot.org",
      phone: "+1 (555) 893-4411",
      staffId: "MK-DR-1052",
      role: "Physician",
      roleCategory: "physician",
      department: "Cardiology",
      deptCategory: "cardiology",
      status: "Active",
      initials: "TM",
      shift: "Morning (08:00 - 16:00)",
      specialty: "Electrophysiology",
      licenseNumber: "MD-LIC-2014-990",
    },
    {
      id: "17",
      name: "Maria Santos",
      email: "m.santos@stjudes.medknot.org",
      phone: "+1 (555) 349-2288",
      staffId: "MK-NS-0215",
      role: "Nursing Staff",
      roleCategory: "nursing",
      department: "Pediatrics",
      deptCategory: "pediatrics",
      status: "Active",
      initials: "MS",
      shift: "Morning (07:30 - 15:30)",
      specialty: "Neonatal & Pediatric Care",
      licenseNumber: "RN-LIC-2018-622",
    },
    {
      id: "18",
      name: "Kavita Nair",
      email: "k.nair@stjudes.medknot.org",
      phone: "+1 (555) 901-4477",
      staffId: "MK-RC-0312",
      role: "Reception",
      roleCategory: "reception",
      department: "Front Desk",
      deptCategory: "desk",
      status: "Active",
      initials: "KN",
      shift: "Evening (15:00 - 23:00)",
      specialty: "Bed Allocation & Registration",
      licenseNumber: "ADM-REG-2020-711",
    },
    {
      id: "19",
      name: "Dr. Robert Becker",
      email: "r.becker@stjudes.medknot.org",
      phone: "+1 (555) 438-1190",
      staffId: "MK-DR-1056",
      role: "Physician",
      roleCategory: "physician",
      department: "Internal Medicine",
      deptCategory: "internal",
      status: "Active",
      initials: "RB",
      shift: "Morning (08:00 - 16:00)",
      specialty: "Pulmonology & Respiratory Care",
      licenseNumber: "MD-LIC-2013-412",
    },
    {
      id: "20",
      name: "James O'Connor",
      email: "j.oconnor@stjudes.medknot.org",
      phone: "+1 (555) 762-9901",
      staffId: "MK-NS-0220",
      role: "Nursing Staff",
      roleCategory: "nursing",
      department: "General Ward",
      deptCategory: "ward",
      status: "Active",
      initials: "JO",
      shift: "Evening (14:00 - 22:00)",
      specialty: "Post-Surgical Nursing",
      licenseNumber: "RN-LIC-2022-801",
    },
    {
      id: "21",
      name: "Dr. Leila Yazdi",
      email: "l.yazdi@stjudes.medknot.org",
      phone: "+1 (555) 619-3344",
      staffId: "MK-DR-1060",
      role: "Physician",
      roleCategory: "physician",
      department: "Pediatrics",
      deptCategory: "pediatrics",
      status: "Active",
      initials: "LY",
      shift: "General (09:00 - 17:00)",
      specialty: "General Pediatrics",
      licenseNumber: "MD-LIC-2019-543",
    },
    {
      id: "22",
      name: "Mei-Ling Zhou",
      email: "m.zhou@stjudes.medknot.org",
      phone: "+1 (555) 872-4411",
      staffId: "MK-NS-0224",
      role: "Nursing Staff",
      roleCategory: "nursing",
      department: "Emergency Medicine",
      deptCategory: "er",
      status: "Active",
      initials: "MZ",
      shift: "Night (22:00 - 06:00)",
      specialty: "Acute Emergency Triage",
      licenseNumber: "RN-LIC-2021-987",
    },
    {
      id: "23",
      name: "Arthur Pendelton",
      email: "a.pendelton@stjudes.medknot.org",
      phone: "+1 (555) 341-9988",
      staffId: "MK-AD-0018",
      role: "Hospital Admin",
      roleCategory: "admin",
      department: "Administration",
      deptCategory: "admin",
      status: "Active",
      initials: "AP",
      shift: "General (09:00 - 17:00)",
      specialty: "Hospital IT Infrastructure & Security",
      licenseNumber: "ADM-MH-2017-003",
    },
    {
      id: "24",
      name: "Dr. Gautam Sen",
      email: "g.sen@stjudes.medknot.org",
      phone: "+1 (555) 912-7722",
      staffId: "MK-DR-1065",
      role: "Physician",
      roleCategory: "physician",
      department: "Emergency Medicine",
      deptCategory: "er",
      status: "Active",
      initials: "GS",
      shift: "Evening (16:00 - 24:00)",
      specialty: "Emergency Medicine & Toxicology",
      licenseNumber: "MD-LIC-2016-882",
    },
  ];

  const [staffList, setStaffList] = useState<StaffRecord[]>(initialStaffRecords);

  // ── 2. Search & Filter State ─────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── 3. Pagination State ──────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7; // Exactly 7 items per page to match "Showing 1 - 7 of 24 staff accounts"

  // ── 4. Modals and Dialogs State ──────────────────────────────────────────
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);
  const [suspendReason, setSuspendReason] = useState("Departmental Leave / Extended Sabbatical");

  // Invite form state
  const [inviteName, setInviteName] = useState("Dr. Elena Rostova");
  const [inviteEmail, setInviteEmail] = useState("e.rostova@stjudes.medknot.org");
  const [inviteRole, setInviteRole] = useState<StaffRole>("Physician");
  const [inviteDepartment, setInviteDepartment] = useState("Internal Medicine");
  const [inviteErrors, setInviteErrors] = useState<{ [key: string]: string }>({});
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Auto-derived Staff ID for demo modal
  const generatedStaffId = useMemo(() => {
    const prefixMap: { [key in StaffRole]: string } = {
      Physician: "MK-DR-",
      "Nursing Staff": "MK-NS-",
      Reception: "MK-RC-",
      "Hospital Admin": "MK-AD-",
    };
    const randomNum = 1040 + staffList.length + 1;
    return `${prefixMap[inviteRole] || "MK-STF-"}${randomNum}`;
  }, [inviteRole, staffList.length]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTitle, setToastTitle] = useState<string | null>(null);

  const triggerToast = (title: string, message: string) => {
    setToastTitle(title);
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
      setToastTitle(null);
    }, 4500);
  };

  // ── 5. Derived Metrics (Dynamically calculated from staff dataset) ─────────
  const metrics = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter((s) => s.status === "Active").length;
    const pending = staffList.filter((s) => s.status === "Invitation Pending").length;
    const suspended = staffList.filter((s) => s.status === "Suspended").length;

    const activePercentage = total > 0 ? ((active / total) * 100).toFixed(1) : "0";
    const pendingPercentage = total > 0 ? ((pending / total) * 100).toFixed(1) : "0";
    const suspendedPercentage = total > 0 ? ((suspended / total) * 100).toFixed(1) : "0";

    return {
      total,
      active,
      pending,
      suspended,
      activePercentage,
      pendingPercentage,
      suspendedPercentage,
    };
  }, [staffList]);

  // ── 6. Filtering & Searching Logic ───────────────────────────────────────
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      // Search query filter (matches name, email, or staffId)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = staff.name.toLowerCase().includes(q);
        const matchesEmail = staff.email.toLowerCase().includes(q);
        const matchesId = staff.staffId.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesId) return false;
      }

      // Role filter
      if (roleFilter !== "all" && staff.roleCategory !== roleFilter) {
        return false;
      }

      // Department filter
      if (departmentFilter !== "all" && staff.deptCategory !== departmentFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "active" && staff.status !== "Active") return false;
        if (statusFilter === "pending" && staff.status !== "Invitation Pending") return false;
        if (statusFilter === "suspended" && staff.status !== "Suspended") return false;
      }

      return true;
    });
  }, [staffList, searchQuery, roleFilter, departmentFilter, statusFilter]);

  // Reset page whenever search or filter criteria change
  const handleFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setDepartmentFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // ── 7. Paginated Slices ──────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStaff.slice(start, start + pageSize);
  }, [filteredStaff, currentPage, pageSize]);

  const visibleStart = filteredStaff.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const visibleEnd = Math.min(currentPage * pageSize, filteredStaff.length);

  // ── 8. Action Handlers ───────────────────────────────────────────────────
  // Resend Invite
  const handleResendInvite = (staff: StaffRecord) => {
    triggerToast(
      "One-Time Invitation Token Refreshed",
      `Direct password transmission disabled; link cryptographically signed and expires in 48 hours for ${staff.name}.`
    );
  };

  // Open Suspend Confirmation Modal
  const openSuspendConfirmation = (staff: StaffRecord) => {
    if (staff.isSelf) return;
    setSelectedStaff(staff);
    setShowSuspendModal(true);
    setActiveMenuId(null);
  };

  // Confirm Suspend
  const handleConfirmSuspend = () => {
    if (!selectedStaff || selectedStaff.isSelf) return;

    setStaffList((prev) =>
      prev.map((s) => (s.id === selectedStaff.id ? { ...s, status: "Suspended" } : s))
    );

    triggerToast(
      "Account Access Suspended",
      `Clinical staff privileges revoked for ${selectedStaff.name} (${selectedStaff.staffId}) per compliance audit: ${suspendReason}.`
    );

    setShowSuspendModal(false);
    setSelectedStaff(null);
  };

  // Open Reactivate Confirmation Modal
  const openReactivateConfirmation = (staff: StaffRecord) => {
    setSelectedStaff(staff);
    setShowReactivateModal(true);
    setActiveMenuId(null);
  };

  // Confirm Reactivate
  const handleConfirmReactivate = () => {
    if (!selectedStaff) return;

    setStaffList((prev) =>
      prev.map((s) => (s.id === selectedStaff.id ? { ...s, status: "Active" } : s))
    );

    triggerToast(
      "Account Reactivated",
      `Privileges reactivated for ${selectedStaff.name}. User will be prompted to re-authenticate with 2FA on next sign-in.`
    );

    setShowReactivateModal(false);
    setSelectedStaff(null);
  };

  // Open View Details Modal
  const openViewDetails = (staff: StaffRecord) => {
    setSelectedStaff(staff);
    setShowViewModal(true);
    setActiveMenuId(null);
  };

  // Submit Invite Staff Form
  const handleSubmitInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!inviteName.trim()) {
      errors.name = "Full Name & Title is required.";
    }

    if (!inviteEmail.trim()) {
      errors.email = "Institutional work email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) {
      errors.email = "Please enter a valid official work email address.";
    } else if (staffList.some((s) => s.email.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      errors.email = "This email is already registered in the hospital directory.";
    }

    if (Object.keys(errors).length > 0) {
      setInviteErrors(errors);
      return;
    }

    setIsSendingInvite(true);

    setTimeout(() => {
      // Determine dept category
      const deptMap: { [key: string]: StaffRecord["deptCategory"] } = {
        "Internal Medicine": "internal",
        Cardiology: "cardiology",
        "General Ward": "ward",
        Pediatrics: "pediatrics",
        "Emergency Medicine": "er",
        "Hospital Administration": "admin",
      };

      const roleCatMap: { [key in StaffRole]: StaffRecord["roleCategory"] } = {
        Physician: "physician",
        "Nursing Staff": "nursing",
        Reception: "reception",
        "Hospital Admin": "admin",
      };

      const initials = inviteName
        .split(" ")
        .filter((w) => !w.startsWith("Dr.") && !w.startsWith("MD"))
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      const newRecord: StaffRecord = {
        id: String(Date.now()),
        name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        phone: "+1 (555) 000-0000",
        staffId: generatedStaffId,
        role: inviteRole,
        roleCategory: roleCatMap[inviteRole] || "physician",
        department: inviteDepartment,
        deptCategory: deptMap[inviteDepartment] || "internal",
        status: "Invitation Pending",
        expiresIn: "48h",
        initials: initials || "ST",
        shift: "Morning (08:00 - 16:00)",
        specialty: inviteDepartment,
      };

      setStaffList((prev) => [newRecord, ...prev]);
      setIsSendingInvite(false);
      setShowInviteModal(false);

      triggerToast(
        "Secure Invitation Dispatched",
        `Time-sensitive onboarding link dispatched to ${newRecord.email} (Staff ID: ${newRecord.staffId}). Added to directory in pending state.`
      );
    }, 700);
  };

  // Export Directory as CSV
  const handleExportCSV = () => {
    const headers = [
      "Staff ID",
      "Full Name",
      "Role",
      "Department",
      "Email",
      "Phone",
      "Account Status",
      "Shift",
      "Medical License",
    ];

    const rows = filteredStaff.map((s) => [
      `"${s.staffId}"`,
      `"${s.name}"`,
      `"${s.role}"`,
      `"${s.department}"`,
      `"${s.email}"`,
      `"${s.phone || ""}"`,
      `"${s.status}"`,
      `"${s.shift || ""}"`,
      `"${s.licenseNumber || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `medknot_staff_directory_north_campus_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast(
      "Staff Directory Exported",
      `Successfully exported ${filteredStaff.length} active records to CSV file.`
    );
  };

  return (
    <div className="dashboard-theme font-body-md text-body-md text-[#1F2B46] min-h-screen antialiased bg-[#EDF2E9]">
      {/* ── SHARED REUSABLE SIDEBAR ────────────────────────────────────── */}
      <DashboardSidebar
        user={user}
        activeNav="staff-management"
        onSignOut={handleSignOut}
      />

      {/* ── TOP HEADER & MAIN VIEWPORT ───────────────────────────────── */}
      <div className="pl-72">
        <DashboardHeader user={user} />

        <main className="relative pt-16 bg-[#EDF2E9] min-h-screen w-full px-8 pb-16">
          <div className="flex flex-col w-full max-w-[1600px] mx-auto">
            {/* Toast Notification Alert */}
            {toastMessage && (
              <div className="fixed top-20 right-8 z-50 p-4 rounded-xl bg-white border border-[#D5E3FF] shadow-xl flex items-start gap-3 max-w-md animate-in fade-in slide-in-from-top-4">
                <span className="material-symbols-outlined text-[#0055A4] text-xl mt-0.5 shrink-0">
                  mark_email_read
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-card-heading text-xs font-semibold text-[#0055A4]">
                    {toastTitle || "Operation Completed"}
                  </span>
                  <p className="font-supporting text-xs text-[#5A6372] mt-0.5 leading-relaxed">
                    {toastMessage}
                  </p>
                </div>
                <button
                  onClick={() => setToastMessage(null)}
                  className="p-1 text-[#727783] hover:text-[#1F2B46] shrink-0"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            {/* ── 1. Page Header & Scoping Bar ──────────────────────────── */}
            <div className="flex flex-col gap-space-md mb-6 pt-4">
              {/* Breadcrumb + Facility Badges Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <nav
                  aria-label="Breadcrumb"
                  className="flex items-center gap-1.5 font-supporting text-xs text-[#5A6372]"
                >
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1 hover:text-[#0055A4] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">home</span>
                    <span>Home</span>
                  </Link>
                  <span className="material-symbols-outlined text-xs text-[#727783]">chevron_right</span>
                  <span className="font-medium text-[#1F2B46]">Staff Management</span>
                </nav>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5E9E3] text-[#1F2B46] text-xs font-medium shadow-xs">
                    <span className="material-symbols-outlined text-xs text-[#0055A4]">domain</span>
                    <span>Facility Scope:</span>
                    <strong className="font-semibold text-[#0055A4] ml-0.5">
                      St. Jude Medical Center (North Campus)
                    </strong>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C3EBDA] text-[#002117] text-xs font-semibold">
                    <span className="material-symbols-outlined text-xs">admin_panel_settings</span>
                    <span>Hospital Administration</span>
                  </div>
                </div>
              </div>

              {/* Title & Action Buttons Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-[28px] leading-8 font-bold text-[#0055A4] tracking-tight whitespace-nowrap">
                      Staff Management
                    </h1>
                    <span className="px-2 py-0.5 bg-[#D5E3FF] text-[#001B3C] text-xs font-semibold rounded-full whitespace-nowrap">
                      v2.4 Live
                    </span>
                  </div>
                  <p className="text-sm text-[#5A6372] mt-1 max-w-2xl truncate">
                    Manage clinical staff credentials, active facility permissions, departmental shifts, and secure provider onboardings.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#E5E9E3] text-[#5A6372] text-xs whitespace-nowrap">
                    <span className="material-symbols-outlined text-sm text-[#727783]">lock</span>
                    <span>North Campus Isolated</span>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#DDE6DA] text-[#0055A4] font-medium text-sm shadow-xs hover:bg-[#F3F6F0] transition-all whitespace-nowrap cursor-pointer"
                    type="button"
                    title="Export filtered staff roster as CSV"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    <span>Export Directory</span>
                  </button>
                  <button
                    onClick={() => {
                      setInviteErrors({});
                      setShowInviteModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0055A4] text-white font-medium text-sm shadow-md hover:bg-[#00478a] transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    <span>+ Invite Staff</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── 2. Metric / Summary Bento Cards ───────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Card 1: Total Staff */}
              <div className="p-4 rounded-xl bg-white border border-[#DDE6DA] shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#5A6372] uppercase tracking-wider font-semibold whitespace-nowrap">
                    Total Staff
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-[#E5E9E3] flex items-center justify-center text-[#0055A4]">
                    <span className="material-symbols-outlined text-base">groups</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[28px] font-bold text-[#1F2B46] leading-tight">
                      {metrics.total}
                    </span>
                    <span className="text-xs text-[#526524] font-medium whitespace-nowrap">
                      Providers &amp; Admins
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6372] mt-1 truncate">
                    All registered accounts across departments
                  </p>
                </div>
                <div className="w-full bg-[#F1F5EF] h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-[#0055A4] h-full rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Card 2: Active Members */}
              <div className="p-4 rounded-xl bg-white border border-[#DDE6DA] shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#5A6372] uppercase tracking-wider font-semibold whitespace-nowrap">
                    Active Members
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#D1E998] text-[#566A27] text-[11px] font-semibold whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#526524]" />
                    {metrics.activePercentage}%
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[28px] font-bold text-[#526524] leading-tight">
                      {metrics.active}
                    </span>
                    <span className="text-xs text-[#5A6372] whitespace-nowrap">
                      on duty today
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6372] mt-1 truncate">
                    Currently authorized &amp; in good standing
                  </p>
                </div>
                <div className="w-full bg-[#F1F5EF] h-1 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-[#526524] h-full rounded-full"
                    style={{ width: `${metrics.activePercentage}%` }}
                  />
                </div>
              </div>

              {/* Card 3: Invitations Pending */}
              <div className="p-4 rounded-xl bg-white border border-[#DDE6DA] shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#5A6372] uppercase tracking-wider font-semibold whitespace-nowrap">
                    Invitations Pending
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-[#E5E9E3] flex items-center justify-center text-[#A8C8FF]">
                    <span className="material-symbols-outlined text-base text-[#0055A4]">
                      mark_email_unread
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[28px] font-bold text-[#0055A4] leading-tight">
                      {metrics.pending}
                    </span>
                    <span className="text-xs text-[#5A6372] whitespace-nowrap">
                      Awaiting action
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6372] mt-1 truncate">
                    Awaiting activation via secure link
                  </p>
                </div>
                <div className="w-full bg-[#F1F5EF] h-1 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-[#A8C8FF] h-full rounded-full"
                    style={{ width: `${metrics.pendingPercentage}%` }}
                  />
                </div>
              </div>

              {/* Card 4: Suspended */}
              <div className="p-4 rounded-xl bg-white border border-[#DDE6DA] shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#5A6372] uppercase tracking-wider font-semibold whitespace-nowrap">
                    Suspended
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#FFDAD6] text-[#93000A] text-[11px] font-semibold whitespace-nowrap">
                    Flagged
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[28px] font-bold text-[#BA1A1A] leading-tight">
                      {metrics.suspended}
                    </span>
                    <span className="text-xs text-[#5A6372] whitespace-nowrap">
                      Deactivated
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6372] mt-1 truncate">
                    Temporarily deactivated accounts
                  </p>
                </div>
                <div className="w-full bg-[#F1F5EF] h-1 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-[#BA1A1A] h-full rounded-full"
                    style={{ width: `${metrics.suspendedPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ── 3. Filters & Quick Search Control Bar ──────────────────── */}
            <div className="p-4 bg-white border border-[#DDE6DA] rounded-xl shadow-xs mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search input with verified icon */}
              <div className="relative flex-1 min-w-[280px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#727783] text-base">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                  placeholder="Search staff by name, work email, or Staff ID..."
                  className="w-full pl-9 pr-10 py-2 rounded-lg bg-[#F1F5EF] text-[#1F2B46] text-sm placeholder:text-[#727783] focus:outline-none focus:bg-white border border-transparent focus:border-[#0055A4] shadow-xs transition-all"
                />
                <span
                  className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#C2C6D3] text-sm"
                  title="Scoped to North Campus tenant"
                >
                  verified_user
                </span>
              </div>

              {/* Dropdown Filters and Reset Button */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* Role Filter */}
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => handleFilterChange(setRoleFilter, e.target.value)}
                    className="appearance-none w-36 pl-3 pr-7 py-2 rounded-lg bg-[#F1F5EF] text-[#1F2B46] text-xs font-medium shadow-xs focus:outline-none focus:bg-white border border-transparent focus:border-[#0055A4] cursor-pointer"
                  >
                    <option value="all">Role: All Roles</option>
                    <option value="physician">Physician</option>
                    <option value="nursing">Nursing Staff</option>
                    <option value="reception">Reception / Desk</option>
                    <option value="admin">Hospital Admin</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#424751] text-base pointer-events-none">
                    expand_more
                  </span>
                </div>

                {/* Department Filter */}
                <div className="relative">
                  <select
                    value={departmentFilter}
                    onChange={(e) => handleFilterChange(setDepartmentFilter, e.target.value)}
                    className="appearance-none w-40 pl-3 pr-7 py-2 rounded-lg bg-[#F1F5EF] text-[#1F2B46] text-xs font-medium shadow-xs focus:outline-none focus:bg-white border border-transparent focus:border-[#0055A4] cursor-pointer"
                  >
                    <option value="all">Dept: All Departments</option>
                    <option value="internal">Internal Medicine</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="ward">General Ward</option>
                    <option value="desk">Front Desk</option>
                    <option value="admin">Administration</option>
                    <option value="er">Emergency Medicine</option>
                    <option value="pediatrics">Pediatrics</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#424751] text-base pointer-events-none">
                    expand_more
                  </span>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                    className="appearance-none w-36 pl-3 pr-7 py-2 rounded-lg bg-[#F1F5EF] text-[#1F2B46] text-xs font-medium shadow-xs focus:outline-none focus:bg-white border border-transparent focus:border-[#0055A4] cursor-pointer"
                  >
                    <option value="all">Status: All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Invitation Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#424751] text-base pointer-events-none">
                    expand_more
                  </span>
                </div>

                {/* Reset Filters Button */}
                <button
                  onClick={handleResetFilters}
                  className="p-2 rounded-lg bg-[#E5E9E3] text-[#424751] hover:text-[#1F2B46] hover:bg-[#DFE4DE] transition-colors flex items-center justify-center cursor-pointer"
                  title="Reset Filters"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">filter_alt_off</span>
                </button>
              </div>
            </div>

            {/* ── 4. Staff Directory Table Container ─────────────────────── */}
            <div className="bg-white border border-[#DDE6DA] rounded-xl shadow-xs overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-md text-body-md">
                  <thead>
                    <tr className="bg-[#F1F5EF] text-[#424751] font-card-heading text-supporting uppercase tracking-wider border-b border-[#DDE6DA]">
                      <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-[#424751]">
                        Staff Member
                      </th>
                      <th className="py-3 px-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-[#424751]">
                        Staff ID
                      </th>
                      <th className="py-3 px-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-[#424751]">
                        Role
                      </th>
                      <th className="py-3 px-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-[#424751]">
                        Department
                      </th>
                      <th className="py-3 px-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-[#424751]">
                        Account Status
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-[#424751] text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EBEDE7]">
                    {paginatedStaff.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#5A6372]">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-4xl text-[#727783]">
                              person_search
                            </span>
                            <span className="font-semibold text-sm text-[#1F2B46]">
                              No staff records match your criteria
                            </span>
                            <span className="text-xs text-[#5A6372]">
                              Try adjusting your search query, role, or department filters.
                            </span>
                            <button
                              onClick={handleResetFilters}
                              className="mt-2 px-3 py-1.5 rounded-lg bg-[#0055A4] text-white text-xs font-semibold"
                              type="button"
                            >
                              Reset All Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedStaff.map((staff) => {
                        const isSuspended = staff.status === "Suspended";
                        const isPending = staff.status === "Invitation Pending";
                        const isSelf = Boolean(staff.isSelf);

                        return (
                          <tr
                            key={staff.id}
                            className="hover:bg-[#F1F5EF]/70 transition-colors"
                          >
                            {/* Staff Member (Avatar/Initials, Name, Email) */}
                            <td className="py-3 px-4">
                              <div className={`flex items-center gap-3 ${isSuspended ? "opacity-75" : ""}`}>
                                {staff.avatar ? (
                                  <Image
                                    src={staff.avatar}
                                    alt={staff.name}
                                    width={36}
                                    height={36}
                                    className="w-9 h-9 rounded-full object-cover shadow-xs ring-2 ring-[#D5E3FF] shrink-0"
                                    unoptimized
                                  />
                                ) : (
                                  <div
                                    className={`w-9 h-9 rounded-full text-xs flex items-center justify-center font-bold shrink-0 ${
                                      isSelf
                                        ? "bg-[#001B3C] text-white ring-2 ring-[#0055A4]"
                                        : staff.role === "Nursing Staff"
                                        ? "bg-[#C3EBDA] text-[#002117]"
                                        : staff.role === "Reception"
                                        ? "bg-[#D5E3FF] text-[#001B3C]"
                                        : isSuspended
                                        ? "bg-[#D7DBD5] text-[#424751]"
                                        : "bg-[#DFE4DE] text-[#424751]"
                                    }`}
                                  >
                                    {staff.initials || "ST"}
                                  </div>
                                )}

                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`text-sm font-semibold text-[#1F2B46] truncate whitespace-nowrap ${
                                        isSuspended ? "line-through text-[#727783]" : ""
                                      }`}
                                    >
                                      {staff.name}
                                    </span>
                                    {isSelf && (
                                      <>
                                        <span className="px-1.5 py-0.2 bg-[#D5E3FF] text-[#001B3C] text-[10px] font-bold rounded">
                                          YOU
                                        </span>
                                        <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-[#E5E9E3] text-[#424751] text-[10px] font-medium">
                                          <span className="material-symbols-outlined text-[11px] text-[#727783]">
                                            lock
                                          </span>
                                          Self
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <span className="text-xs text-[#5A6372] truncate whitespace-nowrap max-w-[200px]">
                                    {staff.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Staff ID */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span className="font-mono text-xs bg-[#E5E9E3] px-2 py-0.5 rounded text-[#1F2B46] font-semibold">
                                {staff.staffId}
                              </span>
                            </td>

                            {/* Role */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              {staff.role === "Physician" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D5E3FF] text-[#001B3C] text-xs font-medium">
                                  <span className="material-symbols-outlined text-xs">stethoscope</span>
                                  Physician
                                </span>
                              )}
                              {staff.role === "Nursing Staff" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C3EBDA] text-[#002117] text-xs font-medium">
                                  <span className="material-symbols-outlined text-xs">vaccines</span>
                                  Nursing Staff
                                </span>
                              )}
                              {staff.role === "Reception" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DFE4DE] text-[#424751] text-xs font-medium">
                                  <span className="material-symbols-outlined text-xs">support_agent</span>
                                  Reception
                                </span>
                              )}
                              {staff.role === "Hospital Admin" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#395D4F] text-white text-xs font-medium">
                                  <span className="material-symbols-outlined text-xs">shield</span>
                                  Hospital Admin
                                </span>
                              )}
                            </td>

                            {/* Department */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span
                                className={`text-sm font-medium ${
                                  isSuspended ? "text-[#727783]" : "text-[#1F2B46]"
                                }`}
                              >
                                {staff.department}
                              </span>
                            </td>

                            {/* Account Status */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              {staff.status === "Active" && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#D1E998] text-[#566A27] text-xs font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#526524]" />
                                  Active
                                </span>
                              )}
                              {staff.status === "Invitation Pending" && (
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#D5E3FF] text-[#001B3C] text-xs font-semibold whitespace-nowrap">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0055A4] animate-pulse" />
                                    Invitation Pending
                                  </span>
                                  {staff.expiresIn && (
                                    <span className="text-[11px] text-[#727783] font-mono whitespace-nowrap">
                                      Expires in {staff.expiresIn}
                                    </span>
                                  )}
                                </div>
                              )}
                              {staff.status === "Suspended" && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FFDAD6] text-[#93000A] text-xs font-semibold whitespace-nowrap">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#BA1A1A]" />
                                  Suspended
                                </span>
                              )}
                            </td>

                            {/* Actions Column */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1 relative">
                                {isPending ? (
                                  <button
                                    onClick={() => handleResendInvite(staff)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E5E9E3] text-[#0055A4] hover:bg-[#0055A4] hover:text-white transition-all text-xs font-medium shadow-xs whitespace-nowrap cursor-pointer"
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-xs">send</span>
                                    <span>Resend Invite</span>
                                  </button>
                                ) : isSuspended ? (
                                  <button
                                    onClick={() => openReactivateConfirmation(staff)}
                                    className="px-2.5 py-1 rounded-lg text-[#526524] hover:bg-[#D1E998] transition-colors text-xs font-semibold cursor-pointer"
                                    type="button"
                                  >
                                    Reactivate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openViewDetails(staff)}
                                    className="px-2.5 py-1 rounded-lg text-[#0055A4] hover:bg-[#E5E9E3] transition-colors text-xs font-semibold cursor-pointer"
                                    type="button"
                                  >
                                    View
                                  </button>
                                )}

                                {isSelf ? (
                                  <div
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F1F5EF] text-[#727783] text-xs select-none"
                                    title="Current authenticated account is protected"
                                  >
                                    <span className="material-symbols-outlined text-xs">lock_clock</span>
                                    <span>Protected</span>
                                  </div>
                                ) : (
                                  <div className="relative inline-block text-left">
                                    <button
                                      onClick={() =>
                                        setActiveMenuId(activeMenuId === staff.id ? null : staff.id)
                                      }
                                      className="p-1 rounded-lg text-[#424751] hover:text-[#1F2B46] hover:bg-[#E5E9E3] transition-colors cursor-pointer"
                                      type="button"
                                      title="More Options"
                                    >
                                      <span className="material-symbols-outlined text-base">more_vert</span>
                                    </button>

                                    {/* Row Popover Menu */}
                                    {activeMenuId === staff.id && (
                                      <div className="origin-top-right absolute right-0 mt-1 w-44 rounded-xl shadow-lg bg-white border border-[#DDE6DA] ring-1 ring-black/5 divide-y divide-[#EBEDE7] focus:outline-none z-30 animate-in fade-in zoom-in-95">
                                        <div className="py-1">
                                          <button
                                            type="button"
                                            onClick={() => openViewDetails(staff)}
                                            className="w-full text-left px-4 py-2 text-xs text-[#1F2B46] hover:bg-[#F1F5EF] flex items-center gap-2"
                                          >
                                            <span className="material-symbols-outlined text-sm text-[#0055A4]">
                                              visibility
                                            </span>
                                            <span>View Full Profile</span>
                                          </button>
                                          {isPending && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                handleResendInvite(staff);
                                                setActiveMenuId(null);
                                              }}
                                              className="w-full text-left px-4 py-2 text-xs text-[#1F2B46] hover:bg-[#F1F5EF] flex items-center gap-2"
                                            >
                                              <span className="material-symbols-outlined text-sm text-[#0055A4]">
                                                send
                                              </span>
                                              <span>Resend Invite</span>
                                            </button>
                                          )}
                                        </div>

                                        <div className="py-1">
                                          {isSuspended ? (
                                            <button
                                              type="button"
                                              onClick={() => openReactivateConfirmation(staff)}
                                              className="w-full text-left px-4 py-2 text-xs text-[#526524] hover:bg-[#D1E998]/30 flex items-center gap-2 font-medium"
                                            >
                                              <span className="material-symbols-outlined text-sm">
                                                restart_alt
                                              </span>
                                              <span>Reactivate Access</span>
                                            </button>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => openSuspendConfirmation(staff)}
                                              className="w-full text-left px-4 py-2 text-xs text-[#BA1A1A] hover:bg-red-50 flex items-center gap-2 font-medium"
                                            >
                                              <span className="material-symbols-outlined text-sm">
                                                person_off
                                              </span>
                                              <span>Suspend Account</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── 5. Table Pagination & Summary Footer ─────────────────── */}
              <div className="px-4 py-3 bg-[#F1F5EF] border-t border-[#DDE6DA] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="font-supporting text-supporting text-[#424751]">
                  Showing <strong className="font-semibold text-[#1F2B46]">{visibleStart} - {visibleEnd}</strong> of{" "}
                  <strong className="font-semibold text-[#1F2B46]">{filteredStaff.length}</strong> staff accounts
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg font-button-label text-supporting transition-colors ${
                      currentPage === 1
                        ? "bg-[#EBEDE7] text-[#727783] cursor-not-allowed"
                        : "bg-white text-[#1F2B46] hover:bg-[#E5E9E3] cursor-pointer shadow-xs"
                    }`}
                    type="button"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isCurrent = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg font-button-label text-supporting transition-colors ${
                          isCurrent
                            ? "bg-[#0055A4] text-white shadow-xs font-semibold"
                            : "bg-white text-[#1F2B46] hover:bg-[#E5E9E3] cursor-pointer shadow-xs"
                        }`}
                        type="button"
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-lg font-button-label text-supporting transition-colors ${
                      currentPage === totalPages
                        ? "bg-[#EBEDE7] text-[#727783] cursor-not-allowed"
                        : "bg-white text-[#1F2B46] hover:bg-[#E5E9E3] cursor-pointer shadow-xs"
                    }`}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── MODAL A: INVITE STAFF MODAL ────────────────────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#DDE6DA] w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header with MedKnot Cross Accent */}
            <div className="px-6 py-4 bg-[#F1F5EF] border-b border-[#DDE6DA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0055A4] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl">person_add</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-headline-sm text-lg font-bold text-[#0055A4]">
                    Invite New Staff Member
                  </h2>
                  <span className="font-supporting text-xs text-[#5A6372] font-medium">
                    Facility: <strong className="text-[#1F2B46]">St. Jude Medical Center (North Campus)</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded-full text-[#5A6372] hover:bg-[#E5E9E3] hover:text-[#1F2B46] transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body / Form Fields */}
            <form onSubmit={handleSubmitInvite} className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
              {/* Full Name & Title */}
              <div className="flex flex-col gap-1">
                <label className="font-card-heading text-xs font-semibold text-[#1F2B46]">
                  Full Name &amp; Title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => {
                    setInviteName(e.target.value);
                    if (inviteErrors.name) setInviteErrors({ ...inviteErrors, name: "" });
                  }}
                  placeholder="e.g. Dr. Elena Rostova"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F6FAF4] text-[#1F2B46] font-body-md text-sm border focus:bg-white focus:outline-none shadow-xs transition-all ${
                    inviteErrors.name ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                  }`}
                />
                {inviteErrors.name && (
                  <span className="text-error text-xs">{inviteErrors.name}</span>
                )}
              </div>

              {/* Institutional Work Email */}
              <div className="flex flex-col gap-1">
                <label className="font-card-heading text-xs font-semibold text-[#1F2B46]">
                  Institutional Work Email <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    if (inviteErrors.email) setInviteErrors({ ...inviteErrors, email: "" });
                  }}
                  placeholder="e.g. e.rostova@stjudes.medknot.org"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F6FAF4] text-[#1F2B46] font-body-md text-sm border focus:bg-white focus:outline-none shadow-xs transition-all ${
                    inviteErrors.email ? "border-error ring-1 ring-error" : "border-[#DDE6DA] focus:border-[#0055A4]"
                  }`}
                />
                {inviteErrors.email ? (
                  <span className="text-error text-xs">{inviteErrors.email}</span>
                ) : (
                  <span className="font-supporting text-xs text-[#5A6372]">
                    The onboarding invitation token will be sent directly to this address.
                  </span>
                )}
              </div>

              {/* Dual Column: Staff ID & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-card-heading text-xs font-semibold text-[#1F2B46]">
                    Staff ID (Auto-generated)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={generatedStaffId}
                      className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-[#E5E9E3] border border-[#DDE6DA] text-[#1F2B46] font-mono text-sm cursor-not-allowed font-semibold shadow-xs"
                    />
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#727783] text-base">
                      lock
                    </span>
                  </div>
                  <span className="font-supporting text-[11px] text-[#5A6372]">
                    Prefix derived from campus and assigned discipline.
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-card-heading text-xs font-semibold text-[#1F2B46]">
                    Assigned Role <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as StaffRole)}
                      className="appearance-none w-full pl-3 pr-8 py-2.5 rounded-xl bg-[#F6FAF4] text-[#1F2B46] font-body-md text-sm border border-[#DDE6DA] focus:bg-white focus:border-[#0055A4] focus:outline-none shadow-xs cursor-pointer"
                    >
                      <option value="Physician">Physician</option>
                      <option value="Nursing Staff">Nursing Staff</option>
                      <option value="Reception">Front Desk / Reception</option>
                      <option value="Hospital Admin">Hospital Administrator</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#424751] text-base pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Department Assignment */}
              <div className="flex flex-col gap-1">
                <label className="font-card-heading text-xs font-semibold text-[#1F2B46]">
                  Department Assignment <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    value={inviteDepartment}
                    onChange={(e) => setInviteDepartment(e.target.value)}
                    className="appearance-none w-full pl-3 pr-8 py-2.5 rounded-xl bg-[#F6FAF4] text-[#1F2B46] font-body-md text-sm border border-[#DDE6DA] focus:bg-white focus:border-[#0055A4] focus:outline-none shadow-xs cursor-pointer"
                  >
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="General Ward">General Ward</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="Hospital Administration">Hospital Administration</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#424751] text-base pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Security & Multi-Factor Onboarding Notice */}
              <div className="p-3.5 rounded-xl bg-[#E5E9E3]/70 border border-[#DDE6DA] flex items-start gap-3 text-[#1F2B46]">
                <span className="material-symbols-outlined text-[#0055A4] text-xl mt-0.5 shrink-0">
                  verified_user
                </span>
                <div className="flex flex-col">
                  <span className="font-card-heading text-xs font-semibold text-[#0055A4]">
                    Multi-Factor Secure Onboarding
                  </span>
                  <p className="font-supporting text-xs text-[#5A6372] mt-0.5 leading-relaxed">
                    Invited staff will receive a time-sensitive, cryptographically signed onboarding link to establish their credentials. Passwords are never transmitted via email.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#DDE6DA] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-[#5A6372] hover:bg-[#E5E9E3] font-button-label text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingInvite}
                  className="px-5 py-2.5 rounded-xl bg-[#0055A4] hover:bg-[#00478a] text-white font-button-label text-sm shadow-md transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSendingInvite ? "Transmitting Token..." : "Send Secure Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL B: CONFIRM ACCOUNT SUSPENSION ────────────────────────────── */}
      {showSuspendModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#DDE6DA] w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-[#F1F5EF] border-b border-[#DDE6DA] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFDAD6] text-[#93000A] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">warning</span>
                </div>
                <h3 className="font-card-heading text-base text-[#BA1A1A] font-semibold">
                  Confirm Account Suspension
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                className="p-1 rounded-full text-[#5A6372] hover:bg-[#E5E9E3] transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="font-body-md text-sm text-[#1F2B46] leading-relaxed">
                Are you sure you want to deactivate clinical staff access for{" "}
                <strong className="font-semibold text-[#1F2B46]">{selectedStaff.name}</strong> (
                <span className="font-mono">{selectedStaff.staffId}</span>)? This will revoke active EHR permissions and bar authentication at St. Jude North Campus.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="font-card-heading text-xs font-semibold text-[#1F2B46]">
                  Compliance Audit Reason <span className="text-error">*</span>
                </label>
                <select
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 rounded-lg bg-[#F6FAF4] text-[#1F2B46] text-xs border border-[#DDE6DA] focus:outline-none focus:border-[#0055A4] cursor-pointer"
                >
                  <option value="Departmental Leave / Extended Sabbatical">
                    Departmental Leave / Extended Sabbatical
                  </option>
                  <option value="Credentialing Review in Progress">
                    Credentialing Review in Progress
                  </option>
                  <option value="Privilege Restriction Protocol">
                    Privilege Restriction Protocol
                  </option>
                  <option value="Separation of Employment">Separation of Employment</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#F1F5EF] border-t border-[#DDE6DA] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 rounded-xl text-[#5A6372] hover:bg-[#E5E9E3] font-button-label text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                className="px-5 py-2 rounded-xl bg-[#BA1A1A] text-white font-button-label text-xs shadow-md hover:bg-red-700 transition-all cursor-pointer"
              >
                Suspend Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL C: CONFIRM ACCOUNT REACTIVATION ──────────────────────────── */}
      {showReactivateModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#DDE6DA] w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-[#F1F5EF] border-b border-[#DDE6DA] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D1E998] text-[#566A27] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">restart_alt</span>
                </div>
                <h3 className="font-card-heading text-base text-[#526524] font-semibold">
                  Confirm Account Reactivation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReactivateModal(false)}
                className="p-1 rounded-full text-[#5A6372] hover:bg-[#E5E9E3] transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="font-body-md text-sm text-[#1F2B46] leading-relaxed">
                Reactivate clinical credentials and active portal permissions for{" "}
                <strong className="font-semibold text-[#1F2B46]">{selectedStaff.name}</strong> (
                <span className="font-mono">{selectedStaff.staffId}</span>)?
              </p>

              <div className="p-3 rounded-lg bg-[#D1E998]/40 border border-[#D1E998] text-xs text-[#1F2B46] flex items-start gap-2">
                <span className="material-symbols-outlined text-[#526524] text-base shrink-0 mt-0.5">
                  verified
                </span>
                <span>
                  User will be required to re-authenticate with Two-Factor / Passkey verification upon next sign-in.
                </span>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#F1F5EF] border-t border-[#DDE6DA] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowReactivateModal(false)}
                className="px-4 py-2 rounded-xl text-[#5A6372] hover:bg-[#E5E9E3] font-button-label text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReactivate}
                className="px-5 py-2 rounded-xl bg-[#0055A4] text-white font-button-label text-xs shadow-md hover:bg-[#00478a] transition-all cursor-pointer"
              >
                Reactivate Privileges
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL D: VIEW STAFF DETAILS MODAL ──────────────────────────────── */}
      {showViewModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#DDE6DA] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#F1F5EF] border-b border-[#DDE6DA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0055A4] text-white flex items-center justify-center font-bold">
                  {selectedStaff.initials || "ST"}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-card-heading text-base font-bold text-[#1F2B46]">
                    {selectedStaff.name}
                  </h3>
                  <span className="text-xs text-[#5A6372]">{selectedStaff.role} • {selectedStaff.department}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="p-1 rounded-full text-[#5A6372] hover:bg-[#E5E9E3] transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#F6FAF4] border border-[#DDE6DA]">
                <div>
                  <span className="text-[#5A6372] block">Staff ID</span>
                  <span className="font-mono font-bold text-[#1F2B46]">{selectedStaff.staffId}</span>
                </div>
                <div>
                  <span className="text-[#5A6372] block">Account Status</span>
                  <span
                    className={`font-semibold ${
                      selectedStaff.status === "Active"
                        ? "text-[#526524]"
                        : selectedStaff.status === "Suspended"
                        ? "text-error"
                        : "text-[#0055A4]"
                    }`}
                  >
                    {selectedStaff.status}
                  </span>
                </div>
                <div>
                  <span className="text-[#5A6372] block">Work Email</span>
                  <span className="font-semibold text-[#1F2B46] truncate">{selectedStaff.email}</span>
                </div>
                <div>
                  <span className="text-[#5A6372] block">Direct Phone</span>
                  <span className="font-semibold text-[#1F2B46]">{selectedStaff.phone}</span>
                </div>
                <div>
                  <span className="text-[#5A6372] block">Current Shift</span>
                  <span className="font-semibold text-[#1F2B46]">{selectedStaff.shift || "Standard Roster"}</span>
                </div>
                <div>
                  <span className="text-[#5A6372] block">Medical License</span>
                  <span className="font-mono font-semibold text-[#1F2B46]">
                    {selectedStaff.licenseNumber || "N/A (Administrative)"}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-card-heading text-xs font-semibold text-[#1F2B46] block mb-2">
                  Clinical Privileges &amp; Facility Scope
                </span>
                <ul className="space-y-1.5 text-[#5A6372]">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-700 text-sm">check_circle</span>
                    <span>St. Jude Medical Center — Campus North Intranet Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-700 text-sm">check_circle</span>
                    <span>EHR Patient Records Read / Clinical Ingestion Privileges</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-700 text-sm">check_circle</span>
                    <span>Departmental Token Queue &amp; Bed Allocation Permissions</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#F1F5EF] border-t border-[#DDE6DA] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#0055A4] text-white font-button-label text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
