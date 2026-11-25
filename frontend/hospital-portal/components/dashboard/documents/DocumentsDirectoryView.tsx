"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserSession,
  DEFAULT_ADMIN,
  clearClientSession,
} from "@/lib/auth";
import { INITIAL_DOCUMENTS } from "@/lib/medical-records-data";
import {
  MedicalDocument,
  DocumentType,
  ReviewStatus,
} from "@/types/medical-records";
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
  FileText,
  Search,
  Filter,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Eye,
  Download,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  LayoutGrid,
  List,
  X,
  FilePlus,
  FileCode,
  FileSpreadsheet,
  AlertTriangle,
  Stethoscope,
  ArrowRight,
  Lock,
} from "lucide-react";

interface DocumentsDirectoryViewProps {
  initialUser?: UserSession;
}

export default function DocumentsDirectoryView({
  initialUser,
}: DocumentsDirectoryViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // State
  const [documents, setDoctors] = useState<MedicalDocument[]>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    title: "",
    type: "typed-lab-report" as DocumentType,
    patientName: "Eleanor Vance",
    patientId: "PT-89402",
    departmentName: "Internal & Preventive Medicine",
    attendingDoctor: "Dr. Chen Wei",
    notes: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.attendingDoctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.departmentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType =
        selectedTypeFilter === "all" || doc.type === selectedTypeFilter;

      const matchStatus =
        selectedStatusFilter === "all" || doc.reviewStatus === selectedStatusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [documents, searchQuery, selectedTypeFilter, selectedStatusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = documents.length;
    const verified = documents.filter((d) => d.reviewStatus === "clinician-verified").length;
    const staffReviewed = documents.filter((d) => d.reviewStatus === "staff-reviewed").length;
    const aiDrafts = documents.filter((d) => d.reviewStatus === "ai-draft").length;
    const labReports = documents.filter((d) => d.type === "typed-lab-report").length;
    return { total, verified, staffReviewed, aiDrafts, labReports };
  }, [documents]);

  // Status Badge Component
  const getReviewStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case "clinician-verified":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#526524]" />
            Clinician-Verified
          </span>
        );
      case "staff-reviewed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E1F2FD] text-[#015CA9] border border-[#bce0fb]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#015CA9]" />
            Staff-Reviewed
          </span>
        );
      case "ai-draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAE193] text-[#5e4300] border border-[#eed072]">
            <Sparkles className="w-3.5 h-3.5 text-[#946200]" />
            AI-Extracted Draft
          </span>
        );
      case "patient-reported":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3F6F0] text-[#5A6372] border border-[#DDE6DA]">
            <Clock className="w-3.5 h-3.5 text-[#727783]" />
            Patient-Reported
          </span>
        );
    }
  };

  // Handle File Selection with Type & Size Validation
  const handleFileSelect = (file: File) => {
    setFileError(null);

    // Validate type: PDF, PNG, JPG
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setFileError(
        "Invalid file format. Please upload typed laboratory reports or printed forms in PDF, PNG, or JPG."
      );
      return;
    }

    // Validate size: max 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setFileError("File size exceeds 10 MB limit. Please select a smaller file.");
      return;
    }

    setSelectedFile(file);
    if (!uploadForm.title) {
      // Auto-set title from filename
      setUploadForm((prev) => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle Upload Submission
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError("Please attach a medical report or printed registration file.");
      return;
    }
    if (!uploadForm.title.trim()) {
      setFileError("Please enter a descriptive document title.");
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      const newDocId = `MED-DOC-2025-${String(documents.length + 1).padStart(3, "0")}`;
      const fileSizeString = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;

      const newDoc: MedicalDocument = {
        id: newDocId,
        title: uploadForm.title,
        type: uploadForm.type,
        typeLabel:
          uploadForm.type === "typed-lab-report"
            ? "Typed Laboratory Report"
            : uploadForm.type === "printed-registration-form"
            ? "Printed Registration Form"
            : "Clinical Medical Record",
        patientId: uploadForm.patientId,
        patientName: uploadForm.patientName,
        patient: {
          id: uploadForm.patientId,
          name: uploadForm.patientName,
          age: 40,
          gender: "Female",
          bloodGroup: "O+",
          phone: "+91 98201 55000",
          emergencyContact: "Family Contact • +91 98201 55001",
          allergies: ["None recorded"],
          chronicConditions: ["None recorded"],
          patientReportedSymptoms: ["Intake review requested"],
        },
        facilityId: "FAC-STJUDE-NORTH",
        facilityName: "St. Jude Specialty Hospital — Campus North",
        departmentId: "DEP-INTMED",
        departmentName: uploadForm.departmentName,
        attendingDoctorName: uploadForm.attendingDoctor,
        uploadDate: "Just now",
        uploadedBy: `${user.name} (${user.role})`,
        fileUrl: "/sample-upload.pdf",
        fileType:
          selectedFile.type === "application/pdf"
            ? "application/pdf"
            : (selectedFile.type as "image/png" | "image/jpeg"),
        fileSize: fileSizeString,
        reviewStatus: "ai-draft",
        confidenceOverall: 0.95,
        extractedFields: [
          {
            id: `f-${Date.now()}-1`,
            fieldName: "Extracted Clinical Parameter 1",
            rawValue: "Positive Finding",
            cleanedValue: "Positive Finding",
            confidenceScore: 0.96,
            status: "ai-draft",
            source: "ocr-extracted",
            flag: "normal",
          },
          {
            id: `f-${Date.now()}-2`,
            fieldName: "Extracted Clinical Parameter 2",
            rawValue: "Within Standard Reference Range",
            cleanedValue: "Standard Range",
            confidenceScore: 0.94,
            status: "ai-draft",
            source: "ocr-extracted",
            flag: "normal",
          },
        ],
        patientReportedData: {
          symptoms: ["Uploaded during active clinical shift"],
          intakeNotes: uploadForm.notes || "New upload awaiting staff verification.",
          reportedOn: "Today",
        },
        aiExtractedData: {
          summary: `Automated OCR processed ${selectedFile.name}. Extracted 2 draft fields ready for staff validation.`,
          detectedImpression:
            "Clinical document successfully parsed into AI-Extracted Draft state.",
          ocrModel: "MedKnot Clinical OCR Engine v2.4",
          processedAt: "Just now",
        },
        staffReview: {
          isApproved: false,
        },
        clinicianVerification: {
          isVerified: false,
        },
        medicalHistory: [
          {
            id: `h-${Date.now()}`,
            date: "Today",
            type: "lab-test",
            title: uploadForm.title,
            doctorName: uploadForm.attendingDoctor,
            departmentName: uploadForm.departmentName,
            summary: "Uploaded into MedKnot private storage. Awaiting staff review.",
            status: "ai-draft",
          },
        ],
        auditEvents: [
          {
            id: `aud-${Date.now()}`,
            timestamp: "Just now",
            user: user.name,
            role: user.role,
            action: `Uploaded original document "${selectedFile.name}" with file type/size validation`,
          },
        ],
      };

      setDoctors((prev) => [newDoc, ...prev]);
      setIsUploading(false);
      setIsUploadOpen(false);
      setSelectedFile(null);
      setFileError(null);
      setUploadForm({
        title: "",
        type: "typed-lab-report",
        patientName: "Eleanor Vance",
        patientId: "PT-89402",
        departmentName: "Internal & Preventive Medicine",
        attendingDoctor: "Dr. Chen Wei",
        notes: "",
      });
      showToast(`Uploaded and queued "${newDoc.title}" (${newDoc.id}) for AI review`);
    }, 1200);
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
                <ChevronRight className="w-3.5 h-3.5 text-[#727783] shrink-0" />
                <span className="text-[#5A6372] whitespace-nowrap">
                  Clinical &amp; Care
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#727783] shrink-0" />
                <span className="text-[#015CA9] font-semibold whitespace-nowrap">
                  Medical Records Directory
                </span>
              </nav>

              {/* Title & Action Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-space-md flex-wrap">
                    <h1 className="font-headline-lg text-headline-lg text-[#015CA9] tracking-tight font-bold truncate">
                      Medical Records &amp; Clinical Documents
                    </h1>
                    <Badge variant="avocado" className="shadow-xs">
                      Module 6 • Secure EHR Archive
                    </Badge>
                  </div>
                  <p className="font-body-md text-body-md text-[#5A6372] max-w-3xl">
                    Authorized repository for typed lab reports, printed registration forms,
                    and clinician-verified diagnostic documents with end-to-end privacy auditing.
                  </p>
                </div>

                {/* Primary CTA */}
                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    onClick={() => setIsUploadOpen(true)}
                    className="flex items-center gap-2 shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Medical Document</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Total Documents
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
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Clinician-Verified
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.verified}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Staff-Reviewed
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.staffReviewed}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAE193] text-[#5e4300] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Pending AI Drafts
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.aiDrafts}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#DDE6DA] shadow-xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F3F6F0] text-[#5A6372] flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                      Typed Lab Reports
                    </p>
                    <h3 className="text-2xl font-bold text-[#1F2B46]">
                      {stats.labReports}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-4 shadow-sm mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#727783]" />
                <Input
                  type="text"
                  placeholder="Search by document title, document ID, patient name, doctor, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Document Type Filter */}
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none cursor-pointer"
                >
                  <option value="all">All Document Types</option>
                  <option value="typed-lab-report">Typed Laboratory Report</option>
                  <option value="printed-registration-form">
                    Printed Registration Form
                  </option>
                  <option value="prescription-record">
                    Prescription &amp; Meds
                  </option>
                </select>

                {/* Review Status Filter */}
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none cursor-pointer"
                >
                  <option value="all">All Review States</option>
                  <option value="clinician-verified">Clinician-Verified</option>
                  <option value="staff-reviewed">Staff-Reviewed</option>
                  <option value="ai-draft">AI-Extracted Draft</option>
                  <option value="patient-reported">Patient-Reported</option>
                </select>

                {/* View Switcher */}
                <div className="flex items-center rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] p-1">
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
                </div>
              </div>
            </div>

            {/* Document Content List */}
            {filteredDocuments.length === 0 ? (
              <div className="bg-white border border-[#DDE6DA] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2B46] mb-1">
                  No medical records found
                </h3>
                <p className="text-sm text-[#5A6372] max-w-md mb-6">
                  No medical documents matched your current search filters. You can
                  reset the filters or upload a typed lab report or printed intake form.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTypeFilter("all");
                    setSelectedStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : viewMode === "table" ? (
              <div className="bg-white border border-[#DDE6DA] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAFDF8] border-b border-[#DDE6DA] text-xs font-semibold text-[#5A6372] uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Document Details</th>
                        <th className="py-3.5 px-4">Patient</th>
                        <th className="py-3.5 px-4">Type &amp; Format</th>
                        <th className="py-3.5 px-4">Review Status</th>
                        <th className="py-3.5 px-4">Attending Doctor</th>
                        <th className="py-3.5 px-4">Uploaded</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DDE6DA]">
                      {filteredDocuments.map((doc) => (
                        <tr
                          key={doc.id}
                          className="hover:bg-[#F8FAF6] transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center shrink-0 mt-0.5">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/dashboard/documents/${doc.id}`}
                                  className="font-bold text-[#1F2B46] hover:text-[#015CA9] transition-colors block truncate max-w-xs"
                                >
                                  {doc.title}
                                </Link>
                                <span className="text-xs text-[#727783] block">
                                  {doc.id} • {doc.fileSize}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="min-w-0">
                              <span className="font-semibold text-[#1F2B46] block truncate">
                                {doc.patientName}
                              </span>
                              <span className="text-xs text-[#5A6372] block">
                                {doc.patientId} • {doc.patient.age}y / {doc.patient.gender[0]}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant="secondary">
                              {doc.typeLabel}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4">
                            {getReviewStatusBadge(doc.reviewStatus)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-[#1F2B46] block truncate">
                              {doc.attendingDoctorName}
                            </span>
                            <span className="text-xs text-[#5A6372] block truncate">
                              {doc.departmentName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#5A6372]">
                            {doc.uploadDate}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link href={`/dashboard/documents/${doc.id}`}>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="text-xs flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Review</span>
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className="hover:shadow-md transition-all border-[#DDE6DA] overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <CardHeader className="p-5 pb-3 border-b border-[#F3F6F0] bg-[#FAFDF8]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-[#E1F2FD] border border-[#bce0fb] text-[#015CA9] flex items-center justify-center shrink-0 shadow-xs">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-sm text-[#1F2B46] truncate">
                                {doc.title}
                              </h3>
                              <span className="text-xs text-[#727783] block">
                                {doc.id} • {doc.fileSize}
                              </span>
                            </div>
                          </div>
                          {getReviewStatusBadge(doc.reviewStatus)}
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 space-y-3.5">
                        <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA] space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[#727783]">Patient:</span>
                            <span className="font-bold text-[#1F2B46]">
                              {doc.patientName} ({doc.patientId})
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#727783]">Doctor:</span>
                            <span className="font-medium text-[#1F2B46]">
                              {doc.attendingDoctorName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#727783]">Department:</span>
                            <span className="font-medium text-[#015CA9] truncate max-w-[170px]">
                              {doc.departmentName}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Badge variant="secondary" className="mb-2">
                            {doc.typeLabel}
                          </Badge>
                          <p className="text-xs text-[#5A6372] line-clamp-2">
                            {doc.aiExtractedData.summary}
                          </p>
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-4 pt-3 border-t border-[#F3F6F0] bg-white flex items-center justify-between">
                      <span className="text-[11px] text-[#727783]">
                        {doc.uploadDate}
                      </span>
                      <Link href={`/dashboard/documents/${doc.id}`}>
                        <Button size="sm" className="text-xs flex items-center gap-1">
                          <span>Open Document</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
      </main>

      {/* ── DOCUMENT UPLOAD MODAL ───────────────────────── */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader onClose={() => setIsUploadOpen(false)}>
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#015CA9]" />
              <DialogTitle>Upload Medical Document</DialogTitle>
            </div>
            <DialogDescription>
              Upload typed laboratory reports or printed patient registration forms.
              Files will be securely validated and processed by the AI extraction engine.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 py-2">
            {/* Dropzone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                selectedFile
                  ? "border-[#015CA9] bg-[#E1F2FD]/30"
                  : "border-[#DDE6DA] hover:border-[#015CA9] bg-[#F8FAF6]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#DFEEA9] text-[#2d3a08] flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1F2B46]">
                      {selectedFile.name}
                    </h4>
                    <p className="text-xs text-[#5A6372]">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for secure extraction
                    </p>
                  </div>
                  <span className="text-xs text-[#015CA9] font-medium underline mt-1">
                    Click to choose a different file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1F2B46]">
                      Drag and drop your medical report here
                    </h4>
                    <p className="text-xs text-[#5A6372]">
                      Supports typed lab reports &amp; printed forms (PDF, PNG, JPG up to 10 MB)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1"
                  >
                    Browse Files
                  </Button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {fileError && (
              <div className="p-3 rounded-xl bg-[#ffdad6] border border-[#f5b8b2] text-xs text-[#ba1a1a] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Document Title <span className="text-error">*</span>
                </label>
                <Input
                  placeholder="e.g. Lipid Profile &amp; CBC Report"
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Document Category <span className="text-error">*</span>
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      type: e.target.value as DocumentType,
                    })
                  }
                  className="w-full h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none"
                >
                  <option value="typed-lab-report">
                    Typed Laboratory Report
                  </option>
                  <option value="printed-registration-form">
                    Printed Registration Form
                  </option>
                  <option value="prescription-record">
                    Prescription &amp; Medication Record
                  </option>
                  <option value="discharge-summary">
                    Hospital Discharge Summary
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Associate Patient
                </label>
                <select
                  value={uploadForm.patientId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const docMatch = documents.find((d) => d.patientId === id);
                    setUploadForm({
                      ...uploadForm,
                      patientId: id,
                      patientName: docMatch ? docMatch.patientName : "Patient",
                    });
                  }}
                  className="w-full h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none"
                >
                  <option value="PT-89402">Eleanor Vance (PT-89402)</option>
                  <option value="PT-89415">Marcus Chen (PT-89415)</option>
                  <option value="PT-89420">Aarav Patel (PT-89420)</option>
                  <option value="PT-89433">Sophia Rodriguez (PT-89433)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F2B46]">
                  Attending Doctor
                </label>
                <select
                  value={uploadForm.attendingDoctor}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      attendingDoctor: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] font-medium focus:ring-2 focus:ring-[#015CA9] outline-none"
                >
                  <option value="Dr. Chen Wei">Dr. Chen Wei (Cardiology)</option>
                  <option value="Dr. Rajeshwar Kulkarni">
                    Dr. Rajeshwar Kulkarni (Orthopedics)
                  </option>
                  <option value="Dr. Maria Santos">
                    Dr. Maria Santos (Pediatrics)
                  </option>
                  <option value="Dr. Sarah Thomas">
                    Dr. Sarah Thomas (Internal Medicine)
                  </option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1F2B46]">
                Clinical Context &amp; Intake Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Optional notes regarding specimen collection, triage conditions, or urgent review request..."
                value={uploadForm.notes}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, notes: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-sm text-[#1F2B46] focus:ring-2 focus:ring-[#015CA9] outline-none"
              />
            </div>

            <div className="p-3 bg-[#E1F2FD]/50 border border-[#bce0fb] rounded-xl text-xs text-[#003e7a] flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0 text-[#015CA9]" />
              <span>
                Document will be saved to Supabase private medical storage.
                Short-lived signed URLs are generated only upon authorized access.
              </span>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading & Parsing..." : "Start Secure Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
