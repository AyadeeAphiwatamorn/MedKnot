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
import { useFacility } from "@/components/dashboard/facility/FacilityContext";
import {
  INITIAL_DEPARTMENTS,
  INITIAL_DOCTORS,
} from "@/lib/clinical-data";
import { Department, Doctor } from "@/types/clinical";
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
  Building2,
  Search,
  Plus,
  Stethoscope,
  Users,
  Bed,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
  SlidersHorizontal,
  X,
  Trash2,
  UserCheck,
  Crown,
  HeartPulse,
  Bone,
  Baby,
  Brain,
  Activity,
  UserPlus,
  ArrowRight,
} from "lucide-react";

interface DepartmentManagementViewProps {
  initialUser?: UserSession;
}

export default function DepartmentManagementView({
  initialUser,
}: DepartmentManagementViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // State
  const { activeCampus } = useFacility();
  const [departments, setDepartments] =
    useState<Department[]>(INITIAL_DEPARTMENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [onlyEmergency, setOnlyEmergency] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [viewingDepartment, setViewingDepartment] =
    useState<Department | null>(null);
  const [assigningDept, setAssigningDept] = useState<Department | null>(null);
  const [selectedDoctorToAdd, setSelectedDoctorToAdd] = useState("");

  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Form State for Create/Edit
  const [deptForm, setDeptForm] = useState({
    name: "",
    code: "",
    headDoctorId: "",
    description: "",
    location: "Campus North, Pavilion Wing",
    floor: "2nd Floor",
    extensionPhone: "Ext. 2000",
    operatingHours: "08:00 - 20:00",
    status: "active" as Department["status"],
    totalBeds: 30,
    occupiedBeds: 15,
    emergencyCapable: true,
    specialties: ["General Medicine"],
    iconName: "Building2",
  });
  const [deptFormErrors, setDeptFormErrors] = useState<Record<string, string>>(
    {}
  );
  const [newSpecialtyInput, setNewSpecialtyInput] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Campus-scoped departments & doctors
  const campusDepartments = useMemo(
    () =>
      departments.filter((dept) =>
        (dept.campusIds || ["FAC-STJUDE-NORTH"]).includes(activeCampus.id)
      ),
    [departments, activeCampus.id]
  );

  const campusDoctors = useMemo(
    () =>
      doctors.filter((doc) =>
        (doc.campusIds || ["FAC-STJUDE-NORTH"]).includes(activeCampus.id)
      ),
    [doctors, activeCampus.id]
  );

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return campusDepartments.filter((dept) => {
      const matchSearch =
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.headDoctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.specialties.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchStatus =
        selectedStatusFilter === "all" || dept.status === selectedStatusFilter;

      const matchEmergency = !onlyEmergency || dept.emergencyCapable;

      return matchSearch && matchStatus && matchEmergency;
    });
  }, [campusDepartments, searchQuery, selectedStatusFilter, onlyEmergency]);

  // Statistics
  const stats = useMemo(() => {
    const totalDepts = campusDepartments.length;
    const totalBeds = campusDepartments.reduce((acc, d) => acc + d.totalBeds, 0);
    const occupiedBeds = campusDepartments.reduce((acc, d) => acc + d.occupiedBeds, 0);
    const emergencyUnits = campusDepartments.filter((d) => d.emergencyCapable).length;
    const totalAssignedDocs = campusDoctors.length;
    const occupancyRate =
      totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return {
      totalDepts,
      totalBeds,
      occupiedBeds,
      emergencyUnits,
      totalAssignedDocs,
      occupancyRate,
    };
  }, [departments, doctors]);

  // Helper for Department Icon
  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case "HeartPulse":
        return <HeartPulse className="w-5 h-5" />;
      case "Bone":
        return <Bone className="w-5 h-5" />;
      case "Baby":
        return <Baby className="w-5 h-5" />;
      case "Brain":
        return <Brain className="w-5 h-5" />;
      case "Activity":
        return <Activity className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  // Doctors belonging to a specific department
  const getDoctorsForDept = (deptId: string) => {
    return doctors.filter((doc) => doc.departmentId === deptId);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingDept(null);
    setDeptForm({
      name: "",
      code: "",
      headDoctorId: doctors[0]?.id || "",
      description: "",
      location: "Campus North, Block B",
      floor: "2nd Floor",
      extensionPhone: "Ext. 2400",
      operatingHours: "08:30 - 18:30",
      status: "active",
      totalBeds: 35,
      occupiedBeds: 20,
      emergencyCapable: false,
      specialties: ["General Consultation"],
      iconName: "Building2",
    });
    setDeptFormErrors({});
    setIsCreateDeptOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      headDoctorId: dept.headDoctorId,
      description: dept.description,
      location: dept.location,
      floor: dept.floor,
      extensionPhone: dept.extensionPhone,
      operatingHours: dept.operatingHours,
      status: dept.status,
      totalBeds: dept.totalBeds,
      occupiedBeds: dept.occupiedBeds,
      emergencyCapable: dept.emergencyCapable,
      specialties: [...dept.specialties],
      iconName: dept.iconName,
    });
    setDeptFormErrors({});
    setIsCreateDeptOpen(true);
  };

  // Handle Save Department (Create or Update)
  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!deptForm.name.trim()) errors.name = "Department name is required";
    if (!deptForm.code.trim()) errors.code = "Department code is required";
    if (!deptForm.description.trim())
      errors.description = "Clinical description is required";

    if (Object.keys(errors).length > 0) {
      setDeptFormErrors(errors);
      return;
    }

    const headDoctor = doctors.find((d) => d.id === deptForm.headDoctorId);

    if (editingDept) {
      // Update
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === editingDept.id
            ? {
                ...d,
                ...deptForm,
                headDoctorName: headDoctor ? headDoctor.name : d.headDoctorName,
              }
            : d
        )
      );
      showToast(`Updated department: ${deptForm.name}`);
    } else {
      // Create
      const newDeptId = `DEP-${deptForm.code.toUpperCase().slice(0, 5)}`;
      const created: Department = {
        id: newDeptId,
        ...deptForm,
        code: deptForm.code.toUpperCase(),
        headDoctorName: headDoctor ? headDoctor.name : "Unassigned Chief",
      };
      setDepartments((prev) => [created, ...prev]);
      showToast(`Created department: ${created.name} (${created.id})`);
    }

    setIsCreateDeptOpen(false);
  };

  // Handle Doctor Assignment inside Department
  const handleAddDoctorToDept = () => {
    if (!assigningDept || !selectedDoctorToAdd) return;
    const doc = doctors.find((d) => d.id === selectedDoctorToAdd);
    if (!doc) return;

    setDoctors((prev) =>
      prev.map((d) =>
        d.id === doc.id
          ? {
              ...d,
              departmentId: assigningDept.id,
              departmentName: assigningDept.name,
              primarySpecialty:
                assigningDept.specialties[0] || d.primarySpecialty,
            }
          : d
      )
    );

    showToast(`Assigned ${doc.name} to ${assigningDept.name}`);
    setSelectedDoctorToAdd("");
  };

  const handleRemoveDoctorFromDept = (docId: string) => {
    const doc = doctors.find((d) => d.id === docId);
    if (!doc) return;

    // Reassign to Internal Med or General
    const fallbackDept =
      departments.find((d) => d.id === "DEP-INTMED") || departments[0];

    setDoctors((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              departmentId: fallbackDept.id,
              departmentName: fallbackDept.name,
            }
          : d
      )
    );

    showToast(
      `Removed ${doc.name} from department (reassigned to ${fallbackDept.name})`
    );
  };

  const handleSetHeadDoctor = (docId: string) => {
    if (!assigningDept) return;
    const doc = doctors.find((d) => d.id === docId);
    if (!doc) return;

    setDepartments((prev) =>
      prev.map((d) =>
        d.id === assigningDept.id
          ? { ...d, headDoctorId: doc.id, headDoctorName: doc.name }
          : d
      )
    );

    setAssigningDept((prev) =>
      prev ? { ...prev, headDoctorId: doc.id, headDoctorName: doc.name } : null
    );

    showToast(`Appointed ${doc.name} as Head of ${assigningDept.name}`);
  };

  const getStatusBadge = (status: Department["status"]) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80]">
            <span className="w-2 h-2 rounded-full bg-[#526524] animate-pulse" />
            Operational
          </span>
        );
      case "maintenance":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAE193] text-[#5e4300] border border-[#eed072]">
            <span className="w-2 h-2 rounded-full bg-[#946200]" />
            Under Renovation
          </span>
        );
      case "emergency-only":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffdad6] text-[#ba1a1a] border border-[#f5b8b2]">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
            Emergency Surge Only
          </span>
        );
    }
  };

  return (
    <div className="dashboard-theme font-body-md text-body-md text-[#1F2B46] antialiased bg-transparent w-full min-w-0 flex-1">
      <main className="relative bg-transparent w-full min-w-0 px-4 md:px-8 pt-2 pb-16">
        <div className="flex flex-col w-full min-w-0">
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
                <ChevronRight className="w-3.5 h-3.5 text-[#667085] shrink-0" />
                <span className="text-[#5A6372] whitespace-nowrap">
                  Clinical &amp; Facility
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#667085] shrink-0" />
                <span className="text-[#015CA9] font-semibold whitespace-nowrap">
                  Department Management
                </span>
              </nav>

              {/* Title & Action Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-space-md flex-wrap">
                    <h1 className="font-headline-lg text-headline-lg text-[#015CA9] tracking-tight font-bold truncate">
                      Hospital Departments &amp; Clinical Units
                    </h1>
                    <Badge variant="avocado" className="shadow-xs">
                      Module 5 • Facility Management
                    </Badge>
                  </div>
                  <p className="font-body-md text-body-md text-[#5A6372] max-w-3xl">
                    Configure institutional departments, assign clinical heads of
                    department (HOD), manage inpatient bed capacities, and allocate
                    physician rosters.
                  </p>
                </div>

                {/* Primary Action CTA */}
                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Department</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <Card className="hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)]">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Departments
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.totalDepts}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)]">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DFEEA9] text-[#2d3a08] flex items-center justify-center shrink-0">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Total Beds
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.totalBeds}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)]">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Occupancy Rate
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.occupancyRate}%
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)]">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAE193] text-[#5e4300] flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      24/7 Trauma Units
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.emergencyUnits}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)]">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E3EBDD] text-[#5A6372] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Assigned Doctors
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.totalAssignedDocs}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-[#C5D2C0] rounded-2xl p-4 shadow-[0_3px_10px_rgba(31,43,70,0.10)] mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#667085]" />
                <Input
                  type="text"
                  placeholder="Search by department name, code, head physician, location, or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="h-10 px-3 bg-[#F3F7F2] border border-[#AEBEAA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Operational</option>
                  <option value="maintenance">Under Renovation</option>
                  <option value="emergency-only">Emergency Surge Only</option>
                </select>

                <button
                  type="button"
                  onClick={() => setOnlyEmergency(!onlyEmergency)}
                  className={`h-10 px-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    onlyEmergency
                      ? "bg-[#015CA9] text-white border-[#015CA9]"
                      : "bg-[#E1E9DC] text-[#5A6372] border-[#C8D6C3] hover:bg-[#E6EDE2]"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>24/7 Emergency Only</span>
                </button>
              </div>
            </div>

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDepartments.map((dept) => {
                const deptDoctors = getDoctorsForDept(dept.id);
                const occupancyPercent = Math.round(
                  (dept.occupiedBeds / dept.totalBeds) * 100
                );

                return (
                  <Card
                    key={dept.id}
                    className="hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)] transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <CardHeader className="p-5 pb-3 border-b border-[#C8D6C3] bg-[#E6EDE2]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-[#E1F2FD] border border-[#bce0fb] text-[#015CA9] flex items-center justify-center shrink-0 shadow-xs">
                              {getDeptIcon(dept.iconName)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80]">
                                  {dept.code}
                                </span>
                                {dept.emergencyCapable && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a]">
                                    24/7 EMER
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-base text-[#1F2B46] truncate mt-1">
                                {dept.name}
                              </h3>
                            </div>
                          </div>
                          {getStatusBadge(dept.status)}
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 space-y-4">
                        <p className="text-xs text-[#5A6372] leading-relaxed line-clamp-2">
                          {dept.description}
                        </p>

                        {/* Head Doctor & Location */}
                        <div className="p-3 bg-[#E1E9DC] border border-[#C8D6C3] rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[#667085] flex items-center gap-1.5">
                              <Crown className="w-3.5 h-3.5 text-[#015CA9]" />
                              Head of Department:
                            </span>
                            <span className="font-bold text-[#1F2B46] truncate max-w-[180px]">
                              {dept.headDoctorName}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[#667085] flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#015CA9]" />
                              Location:
                            </span>
                            <span className="font-medium text-[#1F2B46] truncate max-w-[180px]">
                              {dept.floor}, {dept.location}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[#667085] flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#015CA9]" />
                              Internal Phone:
                            </span>
                            <span className="font-semibold text-[#015CA9]">
                              {dept.extensionPhone}
                            </span>
                          </div>
                        </div>

                        {/* Specialties list */}
                        <div>
                          <span className="text-[11px] font-semibold text-[#5A6372] uppercase tracking-wider block mb-1.5">
                            Clinical Specialties
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {dept.specialties.map((spec) => (
                              <Badge key={spec} variant="secondary">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Bed Occupancy Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[#5A6372] flex items-center gap-1">
                              <Bed className="w-3.5 h-3.5 text-[#015CA9]" />
                              Bed Occupancy
                            </span>
                            <span className="font-bold text-[#1F2B46]">
                              {dept.occupiedBeds} / {dept.totalBeds} beds ({occupancyPercent}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-[#E1E9DC] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                occupancyPercent > 85
                                  ? "bg-[#ba1a1a]"
                                  : occupancyPercent > 60
                                  ? "bg-[#015CA9]"
                                  : "bg-[#526524]"
                              }`}
                              style={{ width: `${occupancyPercent}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-4 pt-3 border-t border-[#C8D6C3] bg-white flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs text-[#5A6372]">
                        <Users className="w-4 h-4 text-[#015CA9]" />
                        <span className="font-bold text-[#1F2B46]">
                          {deptDoctors.length}
                        </span>{" "}
                        physician{deptDoctors.length !== 1 ? "s" : ""}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => setViewingDepartment(dept)}
                        >
                          Details
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setAssigningDept(dept);
                            setSelectedDoctorToAdd("");
                          }}
                        >
                          <UserPlus className="w-3.5 h-3.5 mr-1" />
                          Assign
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs px-2 text-[#015CA9]"
                          onClick={() => openEditModal(dept)}
                          title="Edit Department"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
      </main>

      {/* ── MODAL 1: VIEW DEPARTMENT DETAILS & ROSTER ─────── */}
      <Dialog
        open={!!viewingDepartment}
        onOpenChange={(open) => !open && setViewingDepartment(null)}
      >
        <DialogContent className="max-w-2xl">
          {viewingDepartment && (
            <div>
              <DialogHeader onClose={() => setViewingDepartment(null)}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E1F2FD] border border-[#bce0fb] text-[#015CA9] flex items-center justify-center shrink-0">
                    {getDeptIcon(viewingDepartment.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle>{viewingDepartment.name}</DialogTitle>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#DFEEA9] text-[#2d3a08] font-bold">
                        {viewingDepartment.code}
                      </span>
                    </div>
                    <DialogDescription>
                      {viewingDepartment.floor} • {viewingDepartment.location}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-[#E1E9DC] border border-[#C8D6C3] text-sm text-[#1F2B46] leading-relaxed">
                  <span className="text-xs font-semibold text-[#5A6372] uppercase tracking-wider block mb-1">
                    Department Mission &amp; Overview
                  </span>
                  {viewingDepartment.description}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white border border-[#C8D6C3] rounded-xl text-xs">
                    <span className="text-[#667085] block">Head Doctor</span>
                    <span className="font-bold text-[#1F2B46] truncate block mt-0.5">
                      {viewingDepartment.headDoctorName}
                    </span>
                  </div>
                  <div className="p-3 bg-white border border-[#C8D6C3] rounded-xl text-xs">
                    <span className="text-[#667085] block">Operating Hours</span>
                    <span className="font-bold text-[#1F2B46] truncate block mt-0.5">
                      {viewingDepartment.operatingHours}
                    </span>
                  </div>
                  <div className="p-3 bg-white border border-[#C8D6C3] rounded-xl text-xs">
                    <span className="text-[#667085] block">Extension Phone</span>
                    <span className="font-bold text-[#015CA9] block mt-0.5">
                      {viewingDepartment.extensionPhone}
                    </span>
                  </div>
                </div>

                {/* Assigned Physicians List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-[#1F2B46] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#015CA9]" />
                      Assigned Physicians ({getDoctorsForDept(viewingDepartment.id).length})
                    </h4>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const target = viewingDepartment;
                        setViewingDepartment(null);
                        setAssigningDept(target);
                      }}
                      className="text-xs"
                    >
                      Manage Roster
                    </Button>
                  </div>

                  <div className="border border-[#C8D6C3] rounded-xl divide-y divide-[#C8D6C3] max-h-56 overflow-y-auto">
                    {getDoctorsForDept(viewingDepartment.id).map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 flex items-center justify-between bg-white text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center font-bold">
                            {doc.name.slice(4, 6)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1F2B46]">
                                {doc.name}
                              </span>
                              {doc.id === viewingDepartment.headDoctorId && (
                                <span className="px-1.5 py-0.2 rounded bg-[#FAE193] text-[#5e4300] font-bold text-[10px]">
                                  HOD
                                </span>
                              )}
                            </div>
                            <span className="text-[#5A6372]">
                              {doc.primarySpecialty} • {doc.roomNumber}
                            </span>
                          </div>
                        </div>

                        <span className="font-semibold text-[#015CA9]">
                          ₹{doc.consultationFee.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {getDoctorsForDept(viewingDepartment.id).length === 0 && (
                      <p className="p-4 text-center text-xs text-[#667085] italic">
                        No physicians currently assigned to this department.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewingDepartment(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL 2: ASSIGN DOCTORS TO DEPARTMENT ─────────── */}
      <Dialog
        open={!!assigningDept}
        onOpenChange={(open) => !open && setAssigningDept(null)}
      >
        <DialogContent className="max-w-2xl">
          {assigningDept && (
            <div>
              <DialogHeader onClose={() => setAssigningDept(null)}>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#015CA9]" />
                  <DialogTitle>
                    Assign Doctors — {assigningDept.name}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  Add or reassign doctors to this department and nominate the Head of
                  Department (HOD).
                </DialogDescription>
              </DialogHeader>

              {/* Add Doctor Input */}
              <div className="p-4 bg-[#E1E9DC] border border-[#C8D6C3] rounded-xl space-y-3 mb-4">
                <label className="text-xs font-semibold text-[#1F2B46] block">
                  Add Doctor to {assigningDept.name}
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedDoctorToAdd}
                    onChange={(e) => setSelectedDoctorToAdd(e.target.value)}
                    className="flex-1 h-10 px-3 bg-white border border-[#AEBEAA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none"
                  >
                    <option value="">Select a physician to transfer/add...</option>
                    {doctors
                      .filter((d) => d.departmentId !== assigningDept.id)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.primarySpecialty} — Currently {d.departmentName})
                        </option>
                      ))}
                  </select>
                  <Button
                    type="button"
                    onClick={handleAddDoctorToDept}
                    disabled={!selectedDoctorToAdd}
                    className="shrink-0"
                  >
                    Assign Doctor
                  </Button>
                </div>
              </div>

              {/* Current Roster */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#5A6372] uppercase tracking-wider block">
                  Currently Assigned Physicians ({getDoctorsForDept(assigningDept.id).length})
                </span>

                <div className="border border-[#C8D6C3] rounded-xl divide-y divide-[#C8D6C3] max-h-60 overflow-y-auto">
                  {getDoctorsForDept(assigningDept.id).map((doc) => {
                    const isHod = doc.id === assigningDept.headDoctorId;
                    return (
                      <div
                        key={doc.id}
                        className="p-3.5 flex items-center justify-between bg-white text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center font-bold text-xs shrink-0">
                            {doc.name.slice(4, 6)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1F2B46]">
                                {doc.name}
                              </span>
                              {isHod && (
                                <span className="px-2 py-0.5 rounded-full bg-[#DFEEA9] text-[#2d3a08] font-bold text-[10px] border border-[#c5dd80]">
                                  CHIEF / HOD
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[#5A6372] block">
                              {doc.title} • {doc.roomNumber}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isHod && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleSetHeadDoctor(doc.id)}
                            >
                              Make HOD
                            </Button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveDoctorFromDept(doc.id)}
                            className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors cursor-pointer"
                            title="Remove from department"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {getDoctorsForDept(assigningDept.id).length === 0 && (
                    <p className="p-4 text-center text-xs text-[#667085] italic">
                      No physicians currently assigned. Use the dropdown above to add doctors.
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAssigningDept(null)}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL 3: CREATE / EDIT DEPARTMENT ─────────────── */}
      <Dialog
        open={isCreateDeptOpen}
        onOpenChange={(open) => !open && setIsCreateDeptOpen(false)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader onClose={() => setIsCreateDeptOpen(false)}>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#015CA9]" />
              <DialogTitle>
                {editingDept ? "Edit Department Details" : "Create New Department"}
              </DialogTitle>
            </div>
            <DialogDescription>
              {editingDept
                ? "Update clinical department details, operating hours, and bed allocations."
                : "Register an institutional clinical or diagnostic department in MedKnot."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDepartment} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Department Name <span className="text-error">*</span>
                </label>
                <Input
                  placeholder="e.g. Oncology &amp; Hematology"
                  value={deptForm.name}
                  onChange={(e) =>
                    setDeptForm({ ...deptForm, name: e.target.value })
                  }
                  error={!!deptFormErrors.name}
                />
                {deptFormErrors.name && (
                  <span className="text-xs text-[#ba1a1a]">
                    {deptFormErrors.name}
                  </span>
                )}
              </div>

              {/* Code */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Department Code <span className="text-error">*</span>
                </label>
                <Input
                  placeholder="e.g. ONC"
                  value={deptForm.code}
                  onChange={(e) =>
                    setDeptForm({
                      ...deptForm,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  error={!!deptFormErrors.code}
                />
                {deptFormErrors.code && (
                  <span className="text-xs text-[#ba1a1a]">
                    {deptFormErrors.code}
                  </span>
                )}
              </div>

              {/* Head Doctor */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Head of Department (HOD)
                </label>
                <select
                  value={deptForm.headDoctorId}
                  onChange={(e) =>
                    setDeptForm({ ...deptForm, headDoctorId: e.target.value })
                  }
                  className="w-full h-10 px-3 bg-[#F3F7F2] border border-[#AEBEAA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none"
                >
                  <option value="">Select HOD Physician...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.qualifications})
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Floor */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Floor / Level
                </label>
                <Input
                  placeholder="e.g. 3rd Floor"
                  value={deptForm.floor}
                  onChange={(e) =>
                    setDeptForm({ ...deptForm, floor: e.target.value })
                  }
                />
              </div>

              {/* Wing Location */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Hospital Wing / Pavilion
                </label>
                <Input
                  placeholder="e.g. Campus North, Pavilion Wing"
                  value={deptForm.location}
                  onChange={(e) =>
                    setDeptForm({ ...deptForm, location: e.target.value })
                  }
                />
              </div>

              {/* Phone Extension */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Internal Phone Extension
                </label>
                <Input
                  placeholder="e.g. Ext. 3401"
                  value={deptForm.extensionPhone}
                  onChange={(e) =>
                    setDeptForm({ ...deptForm, extensionPhone: e.target.value })
                  }
                />
              </div>

              {/* Operating Hours */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Operating Hours
                </label>
                <Input
                  placeholder="e.g. 08:00 - 20:00 (24/7 Emergency)"
                  value={deptForm.operatingHours}
                  onChange={(e) =>
                    setDeptForm({
                      ...deptForm,
                      operatingHours: e.target.value,
                    })
                  }
                />
              </div>

              {/* Total Beds */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Inpatient Bed Capacity
                </label>
                <Input
                  type="number"
                  min={1}
                  value={deptForm.totalBeds}
                  onChange={(e) =>
                    setDeptForm({
                      ...deptForm,
                      totalBeds: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Emergency Toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#E1E9DC] border border-[#C8D6C3]">
              <input
                type="checkbox"
                id="emergencyCapable"
                checked={deptForm.emergencyCapable}
                onChange={(e) =>
                  setDeptForm({
                    ...deptForm,
                    emergencyCapable: e.target.checked,
                  })
                }
                className="w-4 h-4 text-[#015CA9] rounded accent-[#015CA9] cursor-pointer"
              />
              <label
                htmlFor="emergencyCapable"
                className="text-xs font-semibold text-[#1F2B46] cursor-pointer"
              >
                24/7 Level-1 Emergency &amp; Trauma Resuscitation Capable Unit
              </label>
            </div>

            {/* Specialties */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1F2B46] block">
                Clinical Specialties
              </label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add specialty tag (e.g. Surgical Oncology)..."
                  value={newSpecialtyInput}
                  onChange={(e) => setNewSpecialtyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newSpecialtyInput.trim()) {
                      e.preventDefault();
                      if (!deptForm.specialties.includes(newSpecialtyInput.trim())) {
                        setDeptForm({
                          ...deptForm,
                          specialties: [
                            ...deptForm.specialties,
                            newSpecialtyInput.trim(),
                          ],
                        });
                      }
                      setNewSpecialtyInput("");
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
                      newSpecialtyInput.trim() &&
                      !deptForm.specialties.includes(newSpecialtyInput.trim())
                    ) {
                      setDeptForm({
                        ...deptForm,
                        specialties: [
                          ...deptForm.specialties,
                          newSpecialtyInput.trim(),
                        ],
                      });
                      setNewSpecialtyInput("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {deptForm.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-[#E1F2FD] text-[#015CA9] border border-[#bce0fb]"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() =>
                        setDeptForm({
                          ...deptForm,
                          specialties: deptForm.specialties.filter(
                            (s) => s !== spec
                          ),
                        })
                      }
                      className="hover:text-[#ba1a1a]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1F2B46]">
                Clinical Description <span className="text-error">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe clinical scope, diagnostic procedures, specialized equipment, and inpatient care capabilities..."
                value={deptForm.description}
                onChange={(e) =>
                  setDeptForm({ ...deptForm, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#F3F7F2] border border-[#AEBEAA] rounded-xl text-sm text-[#1F2B46] focus:ring-2 focus:ring-[#015CA9] outline-none"
              />
              {deptFormErrors.description && (
                <span className="text-xs text-[#ba1a1a]">
                  {deptFormErrors.description}
                </span>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDeptOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingDept ? "Save Changes" : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
