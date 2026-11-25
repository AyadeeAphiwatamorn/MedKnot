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
import {
  INITIAL_DOCTORS,
  INITIAL_DEPARTMENTS,
} from "@/lib/clinical-data";
import {
  Doctor,
  Department,
  DayOfWeek,
  AvailabilitySlot,
} from "@/types/clinical";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Stethoscope,
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Award,
  CheckCircle2,
  AlertCircle,
  Building2,
  UserCheck,
  CalendarClock,
  Sparkles,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Edit3,
  X,
  FileBadge,
  Activity,
  DollarSign,
  ChevronRight,
  Shield,
  Trash2,
} from "lucide-react";

interface DoctorManagementViewProps {
  initialUser?: UserSession;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function DoctorManagementView({
  initialUser,
}: DoctorManagementViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // State
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [onlyOnCall, setOnlyOnCall] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);
  const [editingScheduleDoctor, setEditingScheduleDoctor] =
    useState<Doctor | null>(null);
  const [scheduleState, setScheduleState] = useState<
    Doctor["availabilitySchedule"] | null
  >(null);
  const [activeScheduleDay, setActiveScheduleDay] =
    useState<DayOfWeek>("Monday");

  const [assigningDoctor, setAssigningDoctor] = useState<Doctor | null>(null);
  const [assignmentDeptId, setAssignmentDeptId] = useState("");
  const [assignmentPrimarySpec, setAssignmentPrimarySpec] = useState("");
  const [assignmentSecondarySpecs, setAssignmentSecondarySpecs] = useState<
    string[]
  >([]);
  const [assignmentRoom, setAssignmentRoom] = useState("");
  const [newSpecInput, setNewSpecInput] = useState("");

  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    qualifications: "",
    licenseNumber: "",
    experienceYears: 5,
    departmentId: INITIAL_DEPARTMENTS[0].id,
    primarySpecialty: INITIAL_DEPARTMENTS[0].specialties[0] || "General",
    roomNumber: "OPD Room 101",
    consultationFee: 1000,
    status: "active" as Doctor["status"],
    onCall: false,
    bio: "",
  });
  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.primarySpecialty
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        doc.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDept =
        selectedDeptFilter === "all" || doc.departmentId === selectedDeptFilter;

      const matchStatus =
        selectedStatusFilter === "all" || doc.status === selectedStatusFilter;

      const matchOnCall = !onlyOnCall || doc.onCall;

      return matchSearch && matchDept && matchStatus && matchOnCall;
    });
  }, [doctors, searchQuery, selectedDeptFilter, selectedStatusFilter, onlyOnCall]);

  // Statistics
  const stats = useMemo(() => {
    const total = doctors.length;
    const active = doctors.filter((d) => d.status === "active").length;
    const inSurgery = doctors.filter((d) => d.status === "in-surgery").length;
    const onCall = doctors.filter((d) => d.onCall).length;
    const onLeave = doctors.filter((d) => d.status === "on-leave").length;
    return { total, active, inSurgery, onCall, onLeave };
  }, [doctors]);

  // Handle Open Schedule Editor
  const openScheduleEditor = (doc: Doctor) => {
    setEditingScheduleDoctor(doc);
    // Deep clone schedule
    setScheduleState(JSON.parse(JSON.stringify(doc.availabilitySchedule)));
    setActiveScheduleDay("Monday");
  };

  const handleSaveSchedule = () => {
    if (!editingScheduleDoctor || !scheduleState) return;

    setDoctors((prev) =>
      prev.map((doc) =>
        doc.id === editingScheduleDoctor.id
          ? { ...doc, availabilitySchedule: scheduleState }
          : doc
      )
    );
    showToast(`Updated weekly availability schedule for ${editingScheduleDoctor.name}`);
    setEditingScheduleDoctor(null);
  };

  const handleToggleDayAvailable = (day: DayOfWeek) => {
    if (!scheduleState) return;
    setScheduleState((prev) => {
      if (!prev) return prev;
      const current = prev[day];
      return {
        ...prev,
        [day]: {
          ...current,
          available: !current.available,
          slots:
            !current.available && current.slots.length === 0
              ? [
                  {
                    id: `slot-${Date.now()}`,
                    shiftName: "Morning Clinic",
                    startTime: "09:00",
                    endTime: "13:00",
                    maxPatients: 15,
                  },
                ]
              : current.slots,
        },
      };
    });
  };

  const handleAddSlot = (day: DayOfWeek) => {
    if (!scheduleState) return;
    const newSlot: AvailabilitySlot = {
      id: `slot-${Date.now()}`,
      shiftName: "Afternoon Clinic",
      startTime: "14:00",
      endTime: "17:30",
      maxPatients: 12,
    };
    setScheduleState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: [...prev[day].slots, newSlot],
        },
      };
    });
  };

  const handleRemoveSlot = (day: DayOfWeek, slotId: string) => {
    if (!scheduleState) return;
    setScheduleState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: prev[day].slots.filter((s) => s.id !== slotId),
        },
      };
    });
  };

  const handleUpdateSlotField = (
    day: DayOfWeek,
    slotId: string,
    field: keyof AvailabilitySlot,
    value: string | number
  ) => {
    if (!scheduleState) return;
    setScheduleState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: prev[day].slots.map((s) =>
            s.id === slotId ? { ...s, [field]: value } : s
          ),
        },
      };
    });
  };

  // Handle Open Assignment
  const openAssignmentModal = (doc: Doctor) => {
    setAssigningDoctor(doc);
    setAssignmentDeptId(doc.departmentId);
    setAssignmentPrimarySpec(doc.primarySpecialty);
    setAssignmentSecondarySpecs([...doc.secondarySpecialties]);
    setAssignmentRoom(doc.roomNumber);
  };

  const handleSaveAssignment = () => {
    if (!assigningDoctor) return;
    const dept = departments.find((d) => d.id === assignmentDeptId);
    if (!dept) return;

    setDoctors((prev) =>
      prev.map((doc) =>
        doc.id === assigningDoctor.id
          ? {
              ...doc,
              departmentId: dept.id,
              departmentName: dept.name,
              primarySpecialty: assignmentPrimarySpec || dept.specialties[0] || "General",
              secondarySpecialties: assignmentSecondarySpecs,
              roomNumber: assignmentRoom || doc.roomNumber,
            }
          : doc
      )
    );
    showToast(
      `Reassigned ${assigningDoctor.name} to ${dept.name} (${assignmentPrimarySpec})`
    );
    setAssigningDoctor(null);
  };

  // Handle Add Doctor
  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!newDoctorForm.name.trim()) errors.name = "Doctor full name is required";
    if (!newDoctorForm.title.trim()) errors.title = "Professional title is required";
    if (!newDoctorForm.licenseNumber.trim())
      errors.licenseNumber = "Medical license number is required";
    if (!newDoctorForm.email.trim()) errors.email = "Valid email is required";
    if (!newDoctorForm.phone.trim()) errors.phone = "Phone number is required";

    if (Object.keys(errors).length > 0) {
      setAddFormErrors(errors);
      return;
    }

    const dept = departments.find((d) => d.id === newDoctorForm.departmentId);
    const newDocId = `DOC-${100 + doctors.length + 1}`;

    const created: Doctor = {
      id: newDocId,
      name: newDoctorForm.name.startsWith("Dr.")
        ? newDoctorForm.name
        : `Dr. ${newDoctorForm.name}`,
      title: newDoctorForm.title,
      email: newDoctorForm.email,
      phone: newDoctorForm.phone,
      qualifications: newDoctorForm.qualifications || "MBBS, MD",
      licenseNumber: newDoctorForm.licenseNumber,
      experienceYears: Number(newDoctorForm.experienceYears) || 5,
      departmentId: newDoctorForm.departmentId,
      departmentName: dept ? dept.name : "Internal Medicine",
      primarySpecialty: newDoctorForm.primarySpecialty,
      secondarySpecialties: ["Clinical Consultation"],
      roomNumber: newDoctorForm.roomNumber || "OPD Suite 101",
      consultationFee: Number(newDoctorForm.consultationFee) || 1000,
      status: newDoctorForm.status,
      onCall: newDoctorForm.onCall,
      bio:
        newDoctorForm.bio ||
        `${newDoctorForm.name} is a dedicated healthcare physician providing comprehensive patient consultations.`,
      rating: 4.8,
      patientsCount: 0,
      availabilitySchedule: {
        Monday: { available: true, slots: [{ id: "s1", shiftName: "General OPD", startTime: "09:00", endTime: "13:00", maxPatients: 15 }] },
        Tuesday: { available: true, slots: [{ id: "s2", shiftName: "General OPD", startTime: "09:00", endTime: "13:00", maxPatients: 15 }] },
        Wednesday: { available: true, slots: [{ id: "s3", shiftName: "General OPD", startTime: "09:00", endTime: "13:00", maxPatients: 15 }] },
        Thursday: { available: true, slots: [{ id: "s4", shiftName: "General OPD", startTime: "09:00", endTime: "13:00", maxPatients: 15 }] },
        Friday: { available: true, slots: [{ id: "s5", shiftName: "General OPD", startTime: "09:00", endTime: "13:00", maxPatients: 15 }] },
        Saturday: { available: false, slots: [] },
        Sunday: { available: false, slots: [] },
      },
    };

    setDoctors((prev) => [created, ...prev]);
    showToast(`Successfully registered ${created.name} (${created.id})`);
    setIsAddDoctorOpen(false);
    setNewDoctorForm({
      name: "",
      title: "",
      email: "",
      phone: "",
      qualifications: "",
      licenseNumber: "",
      experienceYears: 5,
      departmentId: INITIAL_DEPARTMENTS[0].id,
      primarySpecialty: INITIAL_DEPARTMENTS[0].specialties[0] || "General",
      roomNumber: "OPD Room 101",
      consultationFee: 1000,
      status: "active",
      onCall: false,
      bio: "",
    });
    setAddFormErrors({});
  };

  const getStatusBadge = (status: Doctor["status"]) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80]">
            <span className="w-2 h-2 rounded-full bg-[#526524] animate-pulse" />
            Active Duty
          </span>
        );
      case "in-surgery":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAE193] text-[#5e4300] border border-[#eed072]">
            <span className="w-2 h-2 rounded-full bg-[#946200]" />
            In Surgery / Procedure
          </span>
        );
      case "on-leave":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffdad6] text-[#ba1a1a] border border-[#f5b8b2]">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
            On Leave
          </span>
        );
      case "off-duty":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3F6F0] text-[#5A6372] border border-[#DDE6DA]">
            <span className="w-2 h-2 rounded-full bg-[#727783]" />
            Off Duty
          </span>
        );
    }
  };

  return (
    <div className="dashboard-theme font-body-md text-body-md text-[#1F2B46] min-h-screen antialiased bg-[#EDF2E9]">
      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <DashboardSidebar
        user={user}
        activeNav="doctors"
        onSignOut={handleSignOut}
      />

      {/* ── TOP HEADER & MAIN VIEWPORT ────────────────────── */}
      <div className="pl-72">
        <DashboardHeader user={user} />

        <main className="relative pt-16 bg-[#EDF2E9] min-h-screen w-full px-8 pb-16">
          <div className="flex flex-col w-full max-w-[1600px] mx-auto">
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
                  className="hover:text-[#015CA9] transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>Dashboard</span>
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#727783] shrink-0" />
                <span className="text-[#5A6372] whitespace-nowrap">
                  Clinical &amp; Facility
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#727783] shrink-0" />
                <span className="text-[#015CA9] font-semibold whitespace-nowrap">
                  Doctors Directory
                </span>
              </nav>

              {/* Title & Action Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-space-md flex-wrap">
                    <h1 className="font-headline-lg text-headline-lg text-[#015CA9] tracking-tight font-bold truncate">
                      Doctor Directory &amp; Clinical Schedules
                    </h1>
                    <Badge variant="avocado" className="shadow-xs">
                      Module 5 • Clinical Management
                    </Badge>
                  </div>
                  <p className="font-body-md text-body-md text-[#5A6372] max-w-3xl">
                    Manage physician profiles, medical specialties, department
                    assignments, and weekly OPD consultation availability slots.
                  </p>
                </div>

                {/* Primary CTA */}
                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    onClick={() => setIsAddDoctorOpen(true)}
                    className="flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Doctor</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Total Doctors
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.total}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DFEEA9] text-[#2d3a08] flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Active on Duty
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.active}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAE193] text-[#5e4300] flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      In Surgery / OT
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.inSurgery}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      On-Call Emergency
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.onCall}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F3F6F0] text-[#5A6372] flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Departments
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {departments.length}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-4 shadow-sm mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[280px]">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#727783]" />
                <Input
                  type="text"
                  placeholder="Search by doctor name, specialty, department, license or room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Department filter */}
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Duty</option>
                  <option value="in-surgery">In Surgery</option>
                  <option value="on-leave">On Leave</option>
                  <option value="off-duty">Off Duty</option>
                </select>

                {/* On call toggle */}
                <button
                  type="button"
                  onClick={() => setOnlyOnCall(!onlyOnCall)}
                  className={`h-10 px-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    onlyOnCall
                      ? "bg-[#015CA9] text-white border-[#015CA9]"
                      : "bg-[#F8FAF6] text-[#5A6372] border-[#DDE6DA] hover:bg-[#F3F6F0]"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>On-Call Only</span>
                </button>

                {/* Grid / List switch */}
                <div className="flex items-center rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white text-[#015CA9] shadow-xs"
                        : "text-[#727783] hover:text-[#1F2B46]"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "table"
                        ? "bg-white text-[#015CA9] shadow-xs"
                        : "text-[#727783] hover:text-[#1F2B46]"
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Doctors Grid / Table Content */}
            {filteredDoctors.length === 0 ? (
              <div className="bg-white border border-[#DDE6DA] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center mb-4">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2B46] mb-1">
                  No doctors found
                </h3>
                <p className="text-sm text-[#5A6372] max-w-md mb-6">
                  No doctors matched your search query or filter selection. Try
                  resetting the filters or registering a new physician.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDeptFilter("all");
                    setSelectedStatusFilter("all");
                    setOnlyOnCall(false);
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDoctors.map((doc) => (
                  <Card
                    key={doc.id}
                    className="hover:shadow-md transition-all border-[#DDE6DA] overflow-hidden flex flex-col"
                  >
                    <CardHeader className="p-5 pb-3 border-b border-[#F3F6F0] bg-[#FAFDF8]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-13 h-13 rounded-2xl bg-[#E1F2FD] border border-[#bce0fb] flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                            {doc.avatarUrl ? (
                              <img
                                src={doc.avatarUrl}
                                alt={doc.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-base text-[#015CA9]">
                                {doc.name
                                  .replace("Dr.", "")
                                  .trim()
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-base text-[#1F2B46] truncate">
                                {doc.name}
                              </h3>
                              {doc.onCall && (
                                <span
                                  title="Emergency On-Call"
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#DFEEA9] text-[#2d3a08] shrink-0"
                                >
                                  ON CALL
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#5A6372] truncate">
                              {doc.title}
                            </p>
                            <span className="text-[11px] font-semibold text-[#015CA9] mt-0.5">
                              {doc.id} • {doc.licenseNumber}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(doc.status)}
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                      {/* Department and Specialty */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-[#5A6372]">
                          <Building2 className="w-4 h-4 text-[#015CA9] shrink-0" />
                          <span className="font-medium text-[#1F2B46] truncate">
                            {doc.departmentName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="lightblue">
                            {doc.primarySpecialty}
                          </Badge>
                          {doc.secondarySpecialties.slice(0, 2).map((s) => (
                            <span
                              key={s}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-[#F3F6F0] text-[#5A6372] border border-[#DDE6DA]"
                            >
                              {s}
                            </span>
                          ))}
                          {doc.secondarySpecialties.length > 2 && (
                            <span className="text-[11px] text-[#727783]">
                              +{doc.secondarySpecialties.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Consultation Room & Experience */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA] text-xs">
                        <div>
                          <span className="text-[#727783] block">OPD Suite</span>
                          <span className="font-semibold text-[#1F2B46] truncate block">
                            {doc.roomNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#727783] block">Consultation</span>
                          <span className="font-semibold text-[#015CA9] block">
                            ₹{doc.consultationFee.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Weekly Availability Summary */}
                      <div className="border-t border-[#F3F6F0] pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-[#5A6372] flex items-center gap-1.5">
                            <CalendarClock className="w-3.5 h-3.5 text-[#015CA9]" />
                            Weekly Availability
                          </span>
                          <span className="text-[11px] text-[#727783]">
                            {
                              Object.values(doc.availabilitySchedule).filter(
                                (s) => s.available
                              ).length
                            }{" "}
                            days/week
                          </span>
                        </div>
                        <div className="flex items-center gap-1 justify-between">
                          {DAYS_OF_WEEK.map((day) => {
                            const isAvail =
                              doc.availabilitySchedule[day]?.available;
                            return (
                              <div
                                key={day}
                                className={`flex-1 text-center py-1 rounded text-[11px] font-bold ${
                                  isAvail
                                    ? "bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80]"
                                    : "bg-[#F3F6F0] text-[#a0a5ad]"
                                }`}
                                title={`${day}: ${
                                  isAvail
                                    ? `${doc.availabilitySchedule[day].slots.length} shift(s)`
                                    : "Off"
                                }`}
                              >
                                {day.slice(0, 2)}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#F3F6F0]">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => setViewingDoctor(doc)}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => openScheduleEditor(doc)}
                        >
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Schedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 text-xs text-[#015CA9]"
                          title="Assign Specialty & Department"
                          onClick={() => openAssignmentModal(doc)}
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Table View */
              <div className="bg-white border border-[#DDE6DA] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAFDF8] border-b border-[#DDE6DA] text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Doctor</th>
                        <th className="py-3.5 px-4">Department &amp; Specialty</th>
                        <th className="py-3.5 px-4">Consultation Room</th>
                        <th className="py-3.5 px-4">Fee</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Weekly Slots</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DDE6DA]">
                      {filteredDoctors.map((doc) => (
                        <tr
                          key={doc.id}
                          className="hover:bg-[#F8FAF6] transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                {doc.avatarUrl ? (
                                  <img
                                    src={doc.avatarUrl}
                                    alt={doc.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  doc.name.slice(4, 6)
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-[#1F2B46] block truncate">
                                  {doc.name}
                                </span>
                                <span className="text-xs text-[#5A6372] block truncate">
                                  {doc.id} • {doc.licenseNumber}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-[#1F2B46] block">
                              {doc.departmentName}
                            </span>
                            <span className="text-xs text-[#015CA9]">
                              {doc.primarySpecialty}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#5A6372]">
                            {doc.roomNumber}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#015CA9]">
                            ₹{doc.consultationFee.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(doc.status)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-xs text-[#5A6372]">
                              <span className="font-semibold text-[#1F2B46]">
                                {
                                  Object.values(doc.availabilitySchedule).filter(
                                    (s) => s.available
                                  ).length
                                }
                              </span>{" "}
                              days active
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewingDoctor(doc)}
                              >
                                View
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => openScheduleEditor(doc)}
                              >
                                Schedule
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openAssignmentModal(doc)}
                              >
                                Assign
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── MODAL 1: VIEW DOCTOR PROFILE ─────────────────── */}
      <Dialog
        open={!!viewingDoctor}
        onOpenChange={(open) => !open && setViewingDoctor(null)}
      >
        <DialogContent className="max-w-3xl">
          {viewingDoctor && (
            <div>
              <DialogHeader
                onClose={() => setViewingDoctor(null)}
                className="pb-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#E1F2FD] border border-[#bce0fb] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {viewingDoctor.avatarUrl ? (
                      <img
                        src={viewingDoctor.avatarUrl}
                        alt={viewingDoctor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Stethoscope className="w-8 h-8 text-[#015CA9]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle>{viewingDoctor.name}</DialogTitle>
                      {getStatusBadge(viewingDoctor.status)}
                    </div>
                    <DialogDescription>
                      {viewingDoctor.title} • {viewingDoctor.id}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Profile &amp; Bio</TabsTrigger>
                  <TabsTrigger value="department">
                    Specialties &amp; Clinic
                  </TabsTrigger>
                  <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
                </TabsList>

                {/* Tab 1: Profile & Bio */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA] text-sm leading-relaxed text-[#1F2B46]">
                    <span className="font-semibold text-xs text-[#5A6372] uppercase tracking-wider block mb-1">
                      Professional Overview
                    </span>
                    {viewingDoctor.bio}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-[#DDE6DA] space-y-2">
                      <span className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider block">
                        Credentials &amp; Licensing
                      </span>
                      <div className="text-sm">
                        <span className="text-[#727783] block text-xs">
                          Medical Qualifications
                        </span>
                        <span className="font-medium text-[#1F2B46]">
                          {viewingDoctor.qualifications}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-[#727783] block text-xs">
                          Registration / License #
                        </span>
                        <span className="font-medium text-[#015CA9]">
                          {viewingDoctor.licenseNumber}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-[#727783] block text-xs">
                          Clinical Experience
                        </span>
                        <span className="font-medium text-[#1F2B46]">
                          {viewingDoctor.experienceYears} Years Active Practice
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#DDE6DA] space-y-2">
                      <span className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider block">
                        Contact &amp; Administrative
                      </span>
                      <div className="text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#015CA9] shrink-0" />
                        <span className="text-[#1F2B46]">
                          {viewingDoctor.email}
                        </span>
                      </div>
                      <div className="text-sm flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#015CA9] shrink-0" />
                        <span className="text-[#1F2B46]">
                          {viewingDoctor.phone}
                        </span>
                      </div>
                      <div className="text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#015CA9] shrink-0" />
                        <span className="text-[#1F2B46]">
                          {viewingDoctor.roomNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Department & Specialties */}
                <TabsContent value="department" className="space-y-4">
                  <div className="p-4 rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] space-y-3">
                    <div>
                      <span className="text-xs text-[#727783] uppercase tracking-wider block">
                        Primary Department
                      </span>
                      <h4 className="text-base font-bold text-[#1F2B46] mt-0.5">
                        {viewingDoctor.departmentName}
                      </h4>
                    </div>

                    <div>
                      <span className="text-xs text-[#727783] uppercase tracking-wider block mb-1">
                        Primary Specialty
                      </span>
                      <Badge variant="default" className="text-xs">
                        {viewingDoctor.primarySpecialty}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-xs text-[#727783] uppercase tracking-wider block mb-1">
                        Secondary Specialties &amp; Clinical Sub-interests
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {viewingDoctor.secondarySpecialties.map((spec) => (
                          <Badge key={spec} variant="secondary">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#DDE6DA]">
                    <div>
                      <span className="text-xs text-[#727783] block">
                        Standard Consultation Fee
                      </span>
                      <span className="text-lg font-bold text-[#015CA9]">
                        ₹{viewingDoctor.consultationFee.toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const target = viewingDoctor;
                        setViewingDoctor(null);
                        openAssignmentModal(target);
                      }}
                    >
                      Reassign Department
                    </Button>
                  </div>
                </TabsContent>

                {/* Tab 3: Schedule */}
                <TabsContent value="schedule" className="space-y-3">
                  <div className="border border-[#DDE6DA] rounded-xl overflow-hidden divide-y divide-[#DDE6DA]">
                    {DAYS_OF_WEEK.map((day) => {
                      const daySched = viewingDoctor.availabilitySchedule[day];
                      return (
                        <div
                          key={day}
                          className="p-3 flex items-center justify-between bg-white text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-24 font-bold text-[#1F2B46]">
                              {day}
                            </span>
                            {daySched?.available ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#DFEEA9] text-[#2d3a08] font-semibold">
                                Available ({daySched.slots.length} shift
                                {daySched.slots.length !== 1 ? "s" : ""})
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F3F6F0] text-[#727783]">
                                Not Available
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {daySched?.available ? (
                              <div className="flex items-center gap-2">
                                {daySched.slots.map((s) => (
                                  <span
                                    key={s.id}
                                    className="text-xs bg-[#E1F2FD] text-[#015CA9] px-2 py-0.5 rounded border border-[#bce0fb]"
                                  >
                                    {s.shiftName}: {s.startTime} – {s.endTime} (
                                    {s.maxPatients} max)
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-[#727783] italic">
                                Clinic Closed
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const target = viewingDoctor;
                        setViewingDoctor(null);
                        openScheduleEditor(target);
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-1.5" />
                      Edit Weekly Schedule
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewingDoctor(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL 2: AVAILABILITY SCHEDULE MANAGEMENT ───── */}
      <Dialog
        open={!!editingScheduleDoctor}
        onOpenChange={(open) => !open && setEditingScheduleDoctor(null)}
      >
        <DialogContent className="max-w-3xl">
          {editingScheduleDoctor && scheduleState && (
            <div>
              <DialogHeader
                onClose={() => setEditingScheduleDoctor(null)}
              >
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-[#015CA9]" />
                  <DialogTitle>
                    Availability Schedule — {editingScheduleDoctor.name}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  Configure consultation operating shifts, working days, and
                  maximum patient capacity per slot.
                </DialogDescription>
              </DialogHeader>

              {/* Day selection tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F3F6F0] rounded-xl border border-[#DDE6DA] mb-4">
                {DAYS_OF_WEEK.map((day) => {
                  const isAvail = scheduleState[day]?.available;
                  const isSelected = activeScheduleDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setActiveScheduleDay(day)}
                      className={`flex-1 min-w-[70px] py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                        isSelected
                          ? "bg-[#015CA9] text-white shadow-sm"
                          : isAvail
                          ? "bg-white text-[#1F2B46] hover:bg-[#E1F2FD]"
                          : "text-[#727783] hover:bg-white/60"
                      }`}
                    >
                      <span>{day.slice(0, 3)}</span>
                      <span
                        className={`text-[9px] px-1 rounded ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : isAvail
                            ? "bg-[#DFEEA9] text-[#2d3a08]"
                            : "bg-[#DDE6DA] text-[#5A6372]"
                        }`}
                      >
                        {isAvail ? `${scheduleState[day].slots.length}s` : "Off"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Day Configuration */}
              <div className="p-4 rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] mb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-base text-[#1F2B46]">
                      {activeScheduleDay} Schedule
                    </h4>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        scheduleState[activeScheduleDay]?.available
                          ? "bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80]"
                          : "bg-[#F3F6F0] text-[#727783] border border-[#DDE6DA]"
                      }`}
                    >
                      {scheduleState[activeScheduleDay]?.available
                        ? "Clinic Active"
                        : "Off Duty"}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant={
                      scheduleState[activeScheduleDay]?.available
                        ? "destructive"
                        : "avocado"
                    }
                    size="sm"
                    onClick={() => handleToggleDayAvailable(activeScheduleDay)}
                  >
                    {scheduleState[activeScheduleDay]?.available
                      ? "Mark Day as Off"
                      : "Enable Clinic on " + activeScheduleDay}
                  </Button>
                </div>

                {/* Shift Slots */}
                {scheduleState[activeScheduleDay]?.available && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                        Operating Shifts &amp; Slot Capacity
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddSlot(activeScheduleDay)}
                        className="text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Shift Slot
                      </Button>
                    </div>

                    {scheduleState[activeScheduleDay].slots.map(
                      (slot, idx) => (
                        <div
                          key={slot.id}
                          className="p-3 bg-white border border-[#DDE6DA] rounded-xl flex flex-col md:flex-row items-stretch md:items-center gap-3"
                        >
                          <div className="flex-1">
                            <label className="text-[11px] text-[#727783] font-semibold block mb-1">
                              Shift Label
                            </label>
                            <Input
                              type="text"
                              value={slot.shiftName}
                              onChange={(e) =>
                                handleUpdateSlotField(
                                  activeScheduleDay,
                                  slot.id,
                                  "shiftName",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Morning OPD"
                              className="h-9 text-xs"
                            />
                          </div>

                          <div className="w-28">
                            <label className="text-[11px] text-[#727783] font-semibold block mb-1">
                              Start Time
                            </label>
                            <Input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) =>
                                handleUpdateSlotField(
                                  activeScheduleDay,
                                  slot.id,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="h-9 text-xs"
                            />
                          </div>

                          <div className="w-28">
                            <label className="text-[11px] text-[#727783] font-semibold block mb-1">
                              End Time
                            </label>
                            <Input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) =>
                                handleUpdateSlotField(
                                  activeScheduleDay,
                                  slot.id,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              className="h-9 text-xs"
                            />
                          </div>

                          <div className="w-24">
                            <label className="text-[11px] text-[#727783] font-semibold block mb-1">
                              Max Patients
                            </label>
                            <Input
                              type="number"
                              min={1}
                              max={60}
                              value={slot.maxPatients}
                              onChange={(e) =>
                                handleUpdateSlotField(
                                  activeScheduleDay,
                                  slot.id,
                                  "maxPatients",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="h-9 text-xs"
                            />
                          </div>

                          <div className="self-end md:self-center pt-2 md:pt-4">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveSlot(activeScheduleDay, slot.id)
                              }
                              className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                              title="Delete Slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    )}

                    {scheduleState[activeScheduleDay].slots.length === 0 && (
                      <p className="text-xs text-[#727783] italic text-center py-4 bg-white rounded-xl border border-[#DDE6DA]">
                        No shifts configured for this day yet. Click &quot;Add Shift Slot&quot; to define OPD consultation hours.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingScheduleDoctor(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveSchedule}>
                  Save Schedule Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL 3: ASSIGN DEPARTMENT & SPECIALTY ───────── */}
      <Dialog
        open={!!assigningDoctor}
        onOpenChange={(open) => !open && setAssigningDoctor(null)}
      >
        <DialogContent className="max-w-lg">
          {assigningDoctor && (
            <div>
              <DialogHeader onClose={() => setAssigningDoctor(null)}>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#015CA9]" />
                  <DialogTitle>Assign Department &amp; Specialty</DialogTitle>
                </div>
                <DialogDescription>
                  Update the clinical department, primary specialty, and
                  consultation suite for {assigningDoctor.name}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Department Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1F2B46] block">
                    Assigned Department <span className="text-error">*</span>
                  </label>
                  <select
                    value={assignmentDeptId}
                    onChange={(e) => {
                      const newDeptId = e.target.value;
                      setAssignmentDeptId(newDeptId);
                      const dept = departments.find((d) => d.id === newDeptId);
                      if (dept && dept.specialties.length > 0) {
                        setAssignmentPrimarySpec(dept.specialties[0]);
                      }
                    }}
                    className="w-full h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Primary Specialty Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1F2B46] block">
                    Primary Specialty <span className="text-error">*</span>
                  </label>
                  {(() => {
                    const currentDept = departments.find(
                      (d) => d.id === assignmentDeptId
                    );
                    const specs = currentDept?.specialties || [];
                    return (
                      <select
                        value={assignmentPrimarySpec}
                        onChange={(e) => setAssignmentPrimarySpec(e.target.value)}
                        className="w-full h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none"
                      >
                        {specs.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                {/* Secondary Specialties */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1F2B46] block">
                    Secondary Specialties / Clinical Sub-interests
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Add sub-specialty tag..."
                      value={newSpecInput}
                      onChange={(e) => setNewSpecInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newSpecInput.trim()) {
                          e.preventDefault();
                          if (
                            !assignmentSecondarySpecs.includes(
                              newSpecInput.trim()
                            )
                          ) {
                            setAssignmentSecondarySpecs([
                              ...assignmentSecondarySpecs,
                              newSpecInput.trim(),
                            ]);
                          }
                          setNewSpecInput("");
                        }
                      }}
                      className="h-9 text-xs"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (
                          newSpecInput.trim() &&
                          !assignmentSecondarySpecs.includes(
                            newSpecInput.trim()
                          )
                        ) {
                          setAssignmentSecondarySpecs([
                            ...assignmentSecondarySpecs,
                            newSpecInput.trim(),
                          ]);
                          setNewSpecInput("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {assignmentSecondarySpecs.map((spec) => (
                      <span
                        key={spec}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-[#E1F2FD] text-[#015CA9] border border-[#bce0fb]"
                      >
                        {spec}
                        <button
                          type="button"
                          onClick={() =>
                            setAssignmentSecondarySpecs(
                              assignmentSecondarySpecs.filter((s) => s !== spec)
                            )
                          }
                          className="hover:text-[#ba1a1a]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Consultation Room */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1F2B46] block">
                    Consultation Room / OPD Suite
                  </label>
                  <Input
                    type="text"
                    value={assignmentRoom}
                    onChange={(e) => setAssignmentRoom(e.target.value)}
                    placeholder="e.g. Consultation Suite 304, Pavilion Wing"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAssigningDoctor(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveAssignment}>Save Assignment</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL 4: ADD NEW DOCTOR ───────────────────────── */}
      <Dialog
        open={isAddDoctorOpen}
        onOpenChange={(open) => !open && setIsAddDoctorOpen(false)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader onClose={() => setIsAddDoctorOpen(false)}>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#015CA9]" />
              <DialogTitle>Register New Physician</DialogTitle>
            </div>
            <DialogDescription>
              Add a new credentialed doctor to the facility roster, associate
              specialties, and generate default consultation slots.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDoctor} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctor Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Full Legal Name <span className="text-error">*</span>
                </label>
                <Input
                  placeholder="e.g. Dr. Arthur Pendelton"
                  value={newDoctorForm.name}
                  onChange={(e) =>
                    setNewDoctorForm({ ...newDoctorForm, name: e.target.value })
                  }
                  error={!!addFormErrors.name}
                />
                {addFormErrors.name && (
                  <span className="text-xs text-[#ba1a1a]">
                    {addFormErrors.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Professional Title <span className="text-error">*</span>
                </label>
                <Input
                  placeholder="e.g. Senior Consultant — Interventional Cardiology"
                  value={newDoctorForm.title}
                  onChange={(e) =>
                    setNewDoctorForm({
                      ...newDoctorForm,
                      title: e.target.value,
                    })
                  }
                  error={!!addFormErrors.title}
                />
                {addFormErrors.title && (
                  <span className="text-xs text-[#ba1a1a]">
                    {addFormErrors.title}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Hospital Work Email <span className="text-error">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="e.g. a.pendelton@stjude-health.org"
                  value={newDoctorForm.email}
                  onChange={(e) =>
                    setNewDoctorForm({
                      ...newDoctorForm,
                      email: e.target.value,
                    })
                  }
                  error={!!addFormErrors.email}
                />
                {addFormErrors.email && (
                  <span className="text-xs text-[#ba1a1a]">
                    {addFormErrors.email}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Direct Contact Number <span className="text-error">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="e.g. +91 98201 12345"
                  value={newDoctorForm.phone}
                  onChange={(e) =>
                    setNewDoctorForm({
                      ...newDoctorForm,
                      phone: e.target.value,
                    })
                  }
                  error={!!addFormErrors.phone}
                />
                {addFormErrors.phone && (
                  <span className="text-xs text-[#ba1a1a]">
                    {addFormErrors.phone}
                  </span>
                )}
              </div>

              {/* License */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Medical Registration / License # <span className="text-error">*</span>
                </label>
                <Input
                  placeholder="e.g. MCI-77821-CAR"
                  value={newDoctorForm.licenseNumber}
                  onChange={(e) =>
                    setNewDoctorForm({
                      ...newDoctorForm,
                      licenseNumber: e.target.value,
                    })
                  }
                  error={!!addFormErrors.licenseNumber}
                />
                {addFormErrors.licenseNumber && (
                  <span className="text-xs text-[#ba1a1a]">
                    {addFormErrors.licenseNumber}
                  </span>
                )}
              </div>

              {/* Qualifications */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Qualifications
                </label>
                <Input
                  placeholder="e.g. MBBS, MD, DM, FRCP"
                  value={newDoctorForm.qualifications}
                  onChange={(e) =>
                    setNewDoctorForm({
                      ...newDoctorForm,
                      qualifications: e.target.value,
                    })
                  }
                />
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Assigned Department
                </label>
                <select
                  value={newDoctorForm.departmentId}
                  onChange={(e) => {
                    const dId = e.target.value;
                    const dept = departments.find((d) => d.id === dId);
                    setNewDoctorForm({
                      ...newDoctorForm,
                      departmentId: dId,
                      primarySpecialty:
                        dept?.specialties[0] || "General Practice",
                    });
                  }}
                  className="w-full h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Specialty */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Primary Specialty
                </label>
                {(() => {
                  const currentDept = departments.find(
                    (d) => d.id === newDoctorForm.departmentId
                  );
                  const specs = currentDept?.specialties || [];
                  return (
                    <select
                      value={newDoctorForm.primarySpecialty}
                      onChange={(e) =>
                        setNewDoctorForm({
                          ...newDoctorForm,
                          primarySpecialty: e.target.value,
                        })
                      }
                      className="w-full h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none"
                    >
                      {specs.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              {/* Consultation Suite */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  OPD Room / Suite Number
                </label>
                <Input
                  placeholder="e.g. Suite 204, Pavilion Wing"
                  value={newDoctorForm.roomNumber}
                  onChange={(e) =>
                    setNewDoctorForm({
                      ...newDoctorForm,
                      roomNumber: e.target.value,
                    })
                  }
                />
              </div>

              {/* Fee */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Consultation Fee (₹)
                </label>
                <Input
                  type="number"
                  min={0}
                  step={50}
                  value={newDoctorForm.consultationFee}
                  onChange={(e) =>
                    setNewDoctorForm({
                      ...newDoctorForm,
                      consultationFee: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1F2B46]">
                Brief Physician Biography &amp; Clinical Background
              </label>
              <textarea
                rows={3}
                placeholder="Brief summary of clinical specialties, fellowships, and career achievements..."
                value={newDoctorForm.bio}
                onChange={(e) =>
                  setNewDoctorForm({
                    ...newDoctorForm,
                    bio: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] focus:ring-2 focus:ring-[#015CA9] outline-none"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDoctorOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Complete Registration</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
